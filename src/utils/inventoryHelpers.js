/** SKU row from GET /getItems or GET /getItemById — stock lives on batches. */
export function normalizeInventoryItem(raw) {
  if (!raw || typeof raw !== "object") return null;
  const batches = raw.inventory_batches ?? raw.inventoryBatches ?? [];
  const fromBatches = batches.reduce(
    (s, b) => s + (Number(b.quantity_on_hand ?? b.quantityOnHand) || 0),
    0
  );
  const total =
    raw.total_quantity_on_hand ?? raw.totalQuantityOnHand ?? fromBatches;
  const batchNums = batches
    .map((b) => b.batch_number ?? b.batchNumber)
    .filter(Boolean);
  return {
    id: raw.id,
    organizationId: raw.organization_id ?? raw.organizationId,
    name: raw.name ?? "",
    sku: raw.sku ?? "",
    description: raw.description ?? "",
    unit: raw.unit ?? "unit",
    quantity: Number(total) || 0,
    reorderLevel: raw.reorderLevel ?? raw.reorder_level ?? undefined,
    costPrice: raw.costPrice ?? raw.cost_price,
    sellingPrice: raw.sellingPrice ?? raw.selling_price,
    gstPercentage: raw.gstPercentage ?? raw.gst_percentage ?? 18,
    isValid: raw.is_valid ?? raw.isValid ?? true,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
    inventoryBatches: batches,
    batchCount: batches.length,
    batchLabels: batchNums.length
      ? batchNums.slice(0, 3).join(", ") + (batchNums.length > 3 ? "…" : "")
      : "",
  };
}

export function normalizeInventoryBatch(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    batchNumber: raw.batch_number ?? raw.batchNumber ?? "",
    expiryDate: raw.expiry_date ?? raw.expiryDate ?? null,
    quantityOnHand: Number(raw.quantity_on_hand ?? raw.quantityOnHand) || 0,
    isValid: raw.is_valid ?? raw.isValid ?? true,
  };
}

function numOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeInventoryTransaction(raw, index) {
  if (!raw || typeof raw !== "object") return { key: index };
  const inv = raw.inventory_items || raw.inventory_item || {};
  const batch = raw.inventory_batches || raw.inventory_batch || {};
  const id = raw.id ?? raw.uuid ?? `tx-${index}`;
  const txType = raw.transaction_type ?? raw.transactionType ?? "";
  const deltaRaw =
    raw.quantity_delta ?? raw.quantity ?? raw.quantityDelta ?? null;
  const beforeRaw = raw.quantity_before ?? raw.quantityBefore;
  const afterRaw = raw.quantity_after ?? raw.quantityAfter;
  return {
    key: id,
    id,
    transactionType: txType,
    quantityDelta: numOrNull(deltaRaw),
    quantityBefore: numOrNull(beforeRaw),
    quantityAfter: numOrNull(afterRaw),
    adjustmentToQuantity: numOrNull(
      raw.adjustmentToQuantity ?? raw.adjustment_to_quantity
    ),
    remarks: raw.remarks ?? "",
    createdAt: raw.created_at ?? raw.createdAt,
    batchNumber:
      raw.batch_number ??
      raw.batchNumber ??
      batch.batch_number ??
      batch.batchNumber,
    itemName:
      inv.name ?? raw.item_name ?? raw.itemName ?? raw.inventory_item_name,
    sku: inv.sku ?? raw.sku,
    unit: inv.unit ?? raw.unit,
    inventoryItemId: raw.inventory_item_id ?? raw.inventoryItemId,
    sourceBillId: raw.source_bill_id ?? raw.sourceBillId,
  };
}

export function inventoryGetErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

/** Map a bill row from getItemFullDetails `bills[]` to the detail table shape. */
export function mapBillToInvoiceRow(entry, index) {
  if (!entry || typeof entry !== "object") return null;
  const id = entry.invoice_id ?? entry.id ?? `bill-${index}`;
  return {
    key: id,
    id,
    invoiceNumber: entry.invoice_number ?? entry.invoiceNumber ?? "—",
    clientName: entry.client_name ?? entry.clientName ?? "—",
    amount: entry.final_amount ?? entry.finalAmount,
    date: entry.invoice_date ?? entry.invoiceDate,
    reference: entry.invoice_reference ?? entry.invoiceReference ?? "—",
  };
}

/**
 * Parses GET /getItemFullDetails response (`axios` `response.data`).
 * Supports `{ data: { item, transactions: { rows, totalRecords, ... }, bills, billsCount } }`.
 */
export function parseItemFullDetailsResponse(responseBody) {
  const root = responseBody?.data ?? responseBody;

  if (!root || typeof root !== "object") {
    return {
      item: null,
      transactions: [],
      totalRecords: 0,
      currentPage: 1,
      bills: [],
      billsCount: 0,
    };
  }

  const itemRaw =
    root.item ??
    root.inventory_item ??
    root.inventoryItem ??
    (root.id && root.name !== undefined ? root : null);

  const item = normalizeInventoryItem(itemRaw || root);

  const txBlock = root.transactions;
  let list = [];
  let totalRecords = 0;
  let currentPage = 1;

  if (Array.isArray(txBlock)) {
    list = txBlock;
    totalRecords = list.length;
    currentPage = 1;
  } else if (txBlock && typeof txBlock === "object") {
    list = txBlock.rows ?? txBlock.data ?? [];
    if (!Array.isArray(list)) list = [];
    totalRecords =
      Number(txBlock.totalRecords ?? txBlock.total_records) || list.length;
    currentPage = Number(txBlock.currentPage ?? txBlock.current_page) || 1;
  }

  const transactions = list
    .map((r, i) => normalizeInventoryTransaction(r, i))
    .filter(Boolean);

  const billsRaw = root.bills;
  const billsArray = Array.isArray(billsRaw) ? billsRaw : [];
  const invoiceRows = billsArray.filter(
    (b) => b && (!b.bill_type || b.bill_type === "INVOICE")
  );
  const billsCount =
    Number(root.billsCount ?? root.bills_count) || invoiceRows.length;

  const bills = invoiceRows
    .map((b, i) => mapBillToInvoiceRow(b, i))
    .filter(Boolean);

  return {
    item,
    transactions,
    totalRecords: Number(totalRecords) || 0,
    currentPage: Number(currentPage) || 1,
    bills,
    billsCount: Number.isFinite(billsCount) ? billsCount : bills.length,
  };
}
