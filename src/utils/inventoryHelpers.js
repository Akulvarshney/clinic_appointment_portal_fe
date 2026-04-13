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
  const sellPrices = batches
    .map((b) => Number(b.selling_price ?? b.sellingPrice))
    .filter((n) => Number.isFinite(n) && n > 0);
  const costPrices = batches
    .map((b) => Number(b.cost_price ?? b.costPrice))
    .filter((n) => Number.isFinite(n) && n > 0);
  const sellSummary =
    sellPrices.length > 0
      ? sellPrices.length === 1
        ? `₹${sellPrices[0].toFixed(2)}`
        : `₹${Math.min(...sellPrices).toFixed(2)}–₹${Math.max(...sellPrices).toFixed(2)}`
      : "";
  const costSummary =
    costPrices.length > 0
      ? costPrices.length === 1
        ? `₹${costPrices[0].toFixed(2)}`
        : `₹${Math.min(...costPrices).toFixed(2)}–₹${Math.max(...costPrices).toFixed(2)}`
      : "";
  const mrpVals = batches
    .map((b) => Number(b.mrp ?? b.MRP))
    .filter((n) => Number.isFinite(n) && n > 0);
  const mrpSummary =
    mrpVals.length > 0
      ? mrpVals.length === 1
        ? `₹${mrpVals[0].toFixed(2)}`
        : `₹${Math.min(...mrpVals).toFixed(2)}–₹${Math.max(...mrpVals).toFixed(2)}`
      : "";
  return {
    id: raw.id,
    organizationId: raw.organization_id ?? raw.organizationId,
    name: raw.name ?? "",
    sku: raw.sku ?? "",
    description: raw.description ?? "",
    unit: raw.unit ?? "unit",
    quantity: Number(total) || 0,
    reorderLevel: raw.reorderLevel ?? raw.reorder_level ?? undefined,
    /** Legacy / display hints — economics are per batch in API v2 */
    sellingPrice: sellPrices.length ? Math.min(...sellPrices) : undefined,
    costPrice: costPrices.length ? Math.min(...costPrices) : undefined,
    sellPricingSummary: sellSummary || "—",
    costPricingSummary: costSummary || "—",
    mrpPricingSummary: mrpSummary || "—",
    gstPercentage: raw.gst_percentage ?? raw.gstPercentage,
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
    costPrice: raw.cost_price ?? raw.costPrice,
    sellingPrice: raw.selling_price ?? raw.sellingPrice,
    mrp: raw.mrp ?? raw.MRP,
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
  // API can return either:
  // - legacy flat bill rows (invoice_number, bill_type, ...)
  // - new wrapper: { bill: { ... }, inventory_lines: [...] }
  const bill = entry.bill && typeof entry.bill === "object" ? entry.bill : entry;
  const invLinesRaw = entry.inventory_lines ?? entry.inventoryLines ?? [];
  const invLines = Array.isArray(invLinesRaw) ? invLinesRaw : [];
  const totalQty = invLines.reduce((s, l) => s + (Number(l?.quantity) || 0), 0);
  const totalFinalAmount = invLines.reduce(
    (s, l) => s + (Number(l?.final_amount ?? l?.finalAmount) || 0),
    0
  );
  const uniqueRates = Array.from(
    new Set(invLines.map((l) => Number(l?.rate)).filter((n) => Number.isFinite(n)))
  );
  const itemRate =
    uniqueRates.length === 0
      ? null
      : uniqueRates.length === 1
        ? uniqueRates[0]
        : uniqueRates;
  const batchTuples = invLines
    .map((l) => ({
      batch:
        l?.inventory_batch_number ??
        l?.inventoryBatchNumber ??
        l?.inventory_batches?.batch_number ??
        l?.inventory_batches?.batchNumber ??
        "—",
      qty: Number(l?.quantity) || 0,
      rate: Number(l?.rate) || 0,
      finalAmount: Number(l?.final_amount ?? l?.finalAmount) || 0,
    }))
    .filter((t) => t.batch && t.batch !== "—");
  const batch = batchTuples.map((t) => t.batch).join(", ");
  const rateSummary = batchTuples.length
    ? batchTuples
      .map((t) => `${t.batch}: ₹${Number(t.rate).toFixed(2)}`)
      .join(", ")
    : "—";
  const id = bill.invoice_id ?? bill.id ?? `bill-${index}`;
  const c = bill.clients || bill.client || {};
  const clientName =
    bill.client_name ??
    bill.clientName ??
    [c.first_name, c.last_name].filter(Boolean).join(" ").trim() ??
    "—";
  return {
    key: id,
    id,
    invoiceNumber: bill.invoice_number ?? bill.invoiceNumber ?? "—",
    clientName: clientName || "—",
    amount:
      bill.grand_total ??
      bill.final_amount ??
      bill.finalAmount ??
      bill.grandTotal,
    date: bill.invoice_date ?? bill.invoiceDate,
    reference: bill.invoice_reference ?? bill.invoiceReference ?? "—",
    batch,
    itemQuantity: totalQty || 0,
    rateSummary,
    itemRate,
    itemFinalAmount: totalFinalAmount || 0,
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
  const invoiceRows = billsArray.filter((wrap) => {
    if (!wrap) return false;
    const bill = wrap.bill && typeof wrap.bill === "object" ? wrap.bill : wrap;
    const t = bill.bill_type ?? bill.billType;
    return !t || t === "INVOICE";
  });
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
