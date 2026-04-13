import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Space,
  InputNumber,
  Radio,
  Select,
  DatePicker,
  Card,
  Typography,
  Tag,
} from "antd";
import DataTable from "../components/DataTable";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";
import { PALETTE } from "../theme/palette";
import { useNotification } from "../utils/messageWrapper";
import {
  normalizeInventoryBatch,
  inventoryGetErrorMessage,
  parseItemFullDetailsResponse,
} from "../utils/inventoryHelpers";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const TAB = "INVENTORY_MANAGEMENT";

const InventoryItemDetailPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const token = localStorage.getItem("token");
  const orgId = localStorage.getItem("selectedOrgId");

  const [form] = Form.useForm();
  const [adjustForm] = Form.useForm();
  const [addBatchForm] = Form.useForm();
  const [updateBatchForm] = Form.useForm();

  const [item, setItem] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [editBatchOpen, setEditBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [itemBatches, setItemBatches] = useState([]);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPagination, setTxPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [invoices, setInvoices] = useState([]);
  const [invPagination, setInvPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canAdjust, setCanAdjust] = useState(false);

  useEffect(() => {
    setCanEdit(isFeatureValid(TAB, "EDIT_INVENTORY"));
    setCanDelete(isFeatureValid(TAB, "DELETE_INVENTORY"));
    setCanAdjust(isFeatureValid(TAB, "ADJUST_STOCK"));
  }, []);

  const loadFullDetails = useCallback(
    async (transactionsPage, transactionsLimit, isInitialLoad = false) => {
      if (!orgId || !itemId) return;
      if (isInitialLoad) setPageLoading(true);
      else setTxLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/clientadmin/inventoryManagement/getItemFullDetails`, {
          params: {
            orgId,
            itemId,
            transactionsPage,
            transactionsLimit,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        const parsed = parseItemFullDetailsResponse(response.data);
        setItem(parsed.item);
        setTransactions(parsed.transactions);
        setTxPagination({
          current: parsed.currentPage || transactionsPage,
          pageSize: transactionsLimit,
          total: parsed.totalRecords,
        });
        setInvoices(parsed.bills);
        setInvPagination({
          current: 1,
          pageSize: 10,
          total: (parsed.billsCount || parsed.bills?.length) ?? 0,
        });
      } catch (err) {
        console.error(err);
        notification.error({
          message: isInitialLoad ? "Could not load item" : "Could not load data",
          description: inventoryGetErrorMessage(
            err,
            isInitialLoad ? "Failed to load SKU details" : "Failed to refresh"
          ),
          placement: "top",
        });
        if (isInitialLoad) setItem(null);
      } finally {
        if (isInitialLoad) setPageLoading(false);
        else setTxLoading(false);
      }
    },
    [orgId, itemId, token, notification]
  );

  useEffect(() => {
    if (!orgId || !itemId) return;
    loadFullDetails(1, 10, true);
  }, [orgId, itemId, loadFullDetails]);

  const openEdit = () => {
    if (!item) return;
    form.setFieldsValue({
      name: item.name,
      sku: item.sku,
      description: item.description,
      unit: item.unit || "unit",
      reorderLevel: item.reorderLevel,
    });
    setEditOpen(true);
  };

  const submitEdit = async (values) => {
    setLoading(true);
    try {
      await axios.put(
        `${BACKEND_URL}/clientadmin/inventoryManagement/updateItem`,
        {
          orgId,
          itemId: item.id,
          name: values.name,
          sku: values.sku,
          description: values.description,
          unit: values.unit,
          reorderLevel: values.reorderLevel,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notification.success({
        message: "Item updated",
        description: "SKU details were saved.",
        placement: "top",
      });
      setEditOpen(false);
      form.resetFields();
      loadFullDetails(1, txPagination.pageSize, false);
    } catch (err) {
      notification.error({
        message: "Could not update",
        description: inventoryGetErrorMessage(err, "Update failed"),
        placement: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BACKEND_URL}/clientadmin/inventoryManagement/deleteItem`,
        { orgId, itemId: item.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notification.success({
        message: "Item removed",
        description: "The SKU and its batches were deactivated.",
        placement: "top",
      });
      navigate("/inventoryManagement");
    } catch (err) {
      notification.error({
        message: "Could not remove",
        description: inventoryGetErrorMessage(err, "Delete failed"),
        placement: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAdjust = (presetBatchId) => {
    adjustForm.resetFields();
    adjustForm.setFieldsValue({
      transactionType: "STOCK_IN",
      quantity: 1,
      adjustmentToQuantity: item?.quantity,
      remarks: "",
      inventoryBatchId: presetBatchId || undefined,
    });
    setAdjustOpen(true);
    const list = (item?.inventoryBatches ?? [])
      .map((b) => normalizeInventoryBatch(b))
      .filter(Boolean);
    setItemBatches(list);
    if (presetBatchId && list.some((b) => b.id === presetBatchId)) {
      adjustForm.setFieldsValue({ inventoryBatchId: presetBatchId });
    } else if (list.length === 1) {
      adjustForm.setFieldsValue({ inventoryBatchId: list[0].id });
    }
  };

  const submitAdjust = async () => {
    try {
      const values = await adjustForm.validateFields();
      setLoading(true);
      const body = {
        orgId,
        inventoryBatchId: values.inventoryBatchId,
        transactionType: values.transactionType,
        remarks: values.remarks || undefined,
      };
      if (values.transactionType === "ADJUSTMENT") {
        body.adjustmentToQuantity = values.adjustmentToQuantity;
      } else {
        body.quantity = values.quantity;
      }
      await axios.post(`${BACKEND_URL}/clientadmin/inventoryManagement/adjustStock`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notification.success({
        message: "Stock updated",
        description: "Batch quantity was adjusted.",
        placement: "top",
      });
      setAdjustOpen(false);
      adjustForm.resetFields();
      loadFullDetails(1, txPagination.pageSize, false);
    } catch (err) {
      if (err?.errorFields) return;
      notification.error({
        message: "Could not adjust stock",
        description: inventoryGetErrorMessage(err, "Adjust failed"),
        placement: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddBatch = () => {
    addBatchForm.resetFields();
    setAddBatchOpen(true);
  };

  const submitAddBatch = async () => {
    try {
      const values = await addBatchForm.validateFields();
      setLoading(true);
      const payload = {
        orgId,
        itemId: item.id,
        batchNumber: values.batchNumber,
        quantity: values.quantity,
        remarks: values.remarks || undefined,
      };
      if (values.expiryDate) {
        payload.expiryDate = dayjs(values.expiryDate).format("YYYY-MM-DD");
      }
      if (values.costPrice != null && values.costPrice !== "") {
        payload.costPrice = values.costPrice;
      }
      if (values.sellingPrice != null && values.sellingPrice !== "") {
        payload.sellingPrice = values.sellingPrice;
      }
      if (values.mrp != null && values.mrp !== "") {
        payload.mrp = values.mrp;
      }
      await axios.post(`${BACKEND_URL}/clientadmin/inventoryManagement/addBatchStock`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notification.success({
        message: "Batch added",
        description: "New lot was recorded.",
        placement: "top",
      });
      setAddBatchOpen(false);
      addBatchForm.resetFields();
      loadFullDetails(1, txPagination.pageSize, false);
    } catch (err) {
      if (err?.errorFields) return;
      notification.error({
        message: "Could not add batch",
        description: inventoryGetErrorMessage(err, "Add batch failed"),
        placement: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditBatch = (row) => {
    setEditingBatch(row);
    updateBatchForm.setFieldsValue({
      costPrice:
        row.costPrice != null && row.costPrice !== ""
          ? Number(row.costPrice)
          : undefined,
      sellingPrice:
        row.sellingPrice != null && row.sellingPrice !== ""
          ? Number(row.sellingPrice)
          : undefined,
      mrp:
        row.mrp != null && row.mrp !== "" ? Number(row.mrp) : undefined,
      expiryDate: row.expiryDate ? dayjs(row.expiryDate) : undefined,
    });
    setEditBatchOpen(true);
  };

  const submitUpdateBatch = async () => {
    if (!editingBatch?.id) return;
    try {
      const values = await updateBatchForm.validateFields();
      setLoading(true);
      const body = { orgId, batchId: editingBatch.id };
      const assignPrice = (key, val) => {
        if (val === undefined) return;
        if (val === null || val === "") body[key] = null;
        else body[key] = Number(val);
      };
      assignPrice("costPrice", values.costPrice);
      assignPrice("sellingPrice", values.sellingPrice);
      assignPrice("mrp", values.mrp);
      const exp = values.expiryDate;
      if (exp !== undefined) {
        body.expiryDate = exp ? dayjs(exp).format("YYYY-MM-DD") : null;
      }
      await axios.put(
        `${BACKEND_URL}/clientadmin/inventoryManagement/updateBatch`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notification.success({
        message: "Batch updated",
        description: "Pricing and expiry were saved.",
        placement: "top",
      });
      setEditBatchOpen(false);
      setEditingBatch(null);
      updateBatchForm.resetFields();
      loadFullDetails(1, txPagination.pageSize, false);
    } catch (err) {
      if (err?.errorFields) return;
      notification.error({
        message: "Could not update batch",
        description: inventoryGetErrorMessage(err, "Update batch failed"),
        placement: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const txType = Form.useWatch("transactionType", adjustForm);

  const fmtQty = (v) => (v != null && v !== "" ? String(v) : "—");

  const txColumns = [
    {
      title: "When",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY HH:mm") : "—"),
    },
    {
      title: "Type",
      dataIndex: "transactionType",
      key: "transactionType",
      width: 110,
    },
    {
      title: "Before",
      dataIndex: "quantityBefore",
      key: "quantityBefore",
      width: 72,
      align: "right",
      render: (v) => fmtQty(v),
    },
    {
      title: "Δ",
      dataIndex: "quantityDelta",
      key: "quantityDelta",
      width: 64,
      align: "right",
      render: (v, row) =>
        row.transactionType === "ADJUSTMENT" ? "—" : fmtQty(v),
    },
    {
      title: "After",
      dataIndex: "quantityAfter",
      key: "quantityAfter",
      width: 72,
      align: "right",
      render: (v) => fmtQty(v),
    },
    {
      title: "Batch",
      dataIndex: "batchNumber",
      key: "batchNumber",
      width: 120,
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
      render: (v) => (v != null && v !== "" ? v : "—"),
    },
  ];

  const invColumns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 110,
      ellipsis: true,
      render: (v) =>
        v ? new Date(v).toLocaleDateString() : "—",
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      width: 170,
      ellipsis: true,
    },
    {
      title: "Batch",
      dataIndex: "batch",
      key: "batch",
      width: 220,
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: "Qty",
      dataIndex: "itemQuantity",
      key: "itemQuantity",
      width: 80,
      align: "right",
      render: (v) => (v != null && v !== "" ? String(v) : "—"),
    },
    {
      title: "Rate",
      dataIndex: "itemRate",
      key: "itemRate",
      width: 120,
      ellipsis: true,
      render: (v) => {
        if (v === null || v === undefined || v === "") return "—";
        if (Array.isArray(v)) {
          return v.map((n) => `₹${Number(n).toFixed(2)}`).join(", ");
        }
        return `₹${Number(v).toFixed(2)}`;
      },
    },
    {
      title: "Amount",
      dataIndex: "itemFinalAmount",
      key: "itemFinalAmount",
      width: 130,
      align: "right",
      render: (v) =>
        v != null && v !== "" ? `₹${Number(v).toFixed(2)}` : "—",
    },
  ];

  const batchColumns = [
    {
      title: "Batch / lot",
      dataIndex: "batchNumber",
      key: "batchNumber",
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 130,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "—"),
    },
    {
      title: "On hand",
      dataIndex: "quantityOnHand",
      key: "quantityOnHand",
      width: 100,
      align: "right",
    },
    {
      title: "Cost",
      key: "cost",
      width: 90,
      align: "right",
      render: (_, row) =>
        row.costPrice != null && row.costPrice !== ""
          ? `₹${Number(row.costPrice).toFixed(2)}`
          : "—",
    },
    {
      title: "Sell",
      key: "sell",
      width: 90,
      align: "right",
      render: (_, row) =>
        row.sellingPrice != null && row.sellingPrice !== ""
          ? `₹${Number(row.sellingPrice).toFixed(2)}`
          : "—",
    },
    {
      title: "MRP",
      key: "mrp",
      width: 90,
      align: "right",
      render: (_, row) =>
        row.mrp != null && row.mrp !== "" ? `₹${Number(row.mrp).toFixed(2)}` : "—",
    },
    {
      title: "Actions",
      key: "ba",
      width: 200,
      render: (_, row) => (
        <Space size="small" wrap>
          {canEdit ? (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditBatch(row)}
            >
              {/* Edit lot */}
            </Button>
          ) : null}
          {canAdjust ? (
            <Button
              type="link"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => openAdjust(row.id)}
            >
              {/* Adjust */}
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  if (!isFeatureValid(TAB, "VIEW_INVENTORY")) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: PALETTE.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          padding: 3,
        }}
      >
        <p className="m-0 text-gw-ink-3">You do not have permission to view inventory.</p>
        <Button type="primary" onClick={() => navigate("/inventoryManagement")}>
          Back to inventory
        </Button>
      </Box>
    );
  }

  if (pageLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: PALETTE.surface,
        }}
      >
        <Text type="secondary">Loading…</Text>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ minHeight: "100vh", background: PALETTE.surface, p: 3 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/inventoryManagement")}>
          Back to inventory
        </Button>
        <p className="mt-4 text-gw-ink-3">Item not found or you do not have access.</p>
      </Box>
    );
  }

  const batches = (item.inventoryBatches ?? [])
    .map((raw) => normalizeInventoryBatch(raw))
    .filter(Boolean);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        minWidth: 0,
        background: PALETTE.surface,
      }}
    >
      <div className="min-w-0 w-full flex-1 px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-6 flex min-w-0 flex-nowrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/inventoryManagement")}
              className="shrink-0"
            >
              Back
            </Button>
            <Title
              level={3}
              className="!m-0 min-w-0 flex-1 truncate sm:!text-2xl"
            >
              {item.name}
            </Title>
            {item.sku ? (
              <Tag color="blue" className="shrink-0">
                {item.sku}
              </Tag>
            ) : null}
            <Tag className="shrink-0">On hand: {item.quantity}</Tag>
          </div>
          <Space size="small" wrap={false} className="mb-0 shrink-0">
            {canEdit && (
              <Button type="primary" icon={<EditOutlined />} onClick={openEdit}>
                {/* Edit SKU */}
              </Button>
            )}
            {/* {canAdjust && (
              <>
                <Button icon={<PlusOutlined />} onClick={openAddBatch}>
                  Add batch
                </Button>
                <Button icon={<SwapOutlined />} onClick={() => openAdjust(null)}>
                  Adjust stock
                </Button>
              </>
            )} */}
            {canDelete && (
              <Popconfirm
                title="Deactivate this SKU?"
                description="The SKU and all batches will be marked inactive."
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />} loading={loading}>
                  {/* Delete */}
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        <Card className="mb-6 shadow-sm" title="SKU details">
          <div className="overflow-hidden rounded-xl border border-gw-muted bg-gradient-to-br from-white via-gw-primary-light/20 to-white">
            <div className="grid grid-cols-1 divide-y divide-gw-muted/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <section className="p-4 sm:p-5">
                <h3 className="mb-3 border-l-4 border-gw-primary pl-3 text-[11px] font-semibold uppercase tracking-wider text-gw-primary-dark">
                  {"Stock & units"}
                </h3>
                <dl className="space-y-0">
                  <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-gw-muted/50 py-2.5 first:pt-0">
                    <dt className="text-sm text-gw-ink-3">Unit</dt>
                    <dd className="text-right text-sm font-medium text-gw-ink">
                      {item.unit || "—"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-gw-muted/50 py-2.5">
                    <dt className="text-sm text-gw-ink-3">Reorder level</dt>
                    <dd className="text-right text-sm font-medium text-gw-ink tabular-nums">
                      {item.reorderLevel != null && item.reorderLevel !== ""
                        ? item.reorderLevel
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-2.5 last:pb-0">
                    <dt className="text-sm text-gw-ink-3">Lots (batches)</dt>
                    <dd className="text-right text-sm font-semibold tabular-nums text-gw-primary-dark">
                      {item.batchCount ?? 0}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="p-4 sm:p-5">
                <h3 className="mb-3 border-l-4 border-gw-primary pl-3 text-[11px] font-semibold uppercase tracking-wider text-gw-primary-dark">
                  Pricing across batches
                </h3>
                <dl className="space-y-0">
                  <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-gw-muted/50 py-2.5 first:pt-0">
                    <dt className="text-sm text-gw-ink-3">Cost</dt>
                    <dd className="max-w-[58%] text-right text-sm font-medium text-gw-ink">
                      {item.costPricingSummary ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-gw-muted/50 py-2.5">
                    <dt className="text-sm text-gw-ink-3">Selling</dt>
                    <dd className="max-w-[58%] text-right text-sm font-medium text-gw-ink">
                      {item.sellPricingSummary ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-2.5 last:pb-0">
                    <dt className="text-sm text-gw-ink-3">MRP</dt>
                    <dd className="max-w-[58%] text-right text-sm font-medium text-gw-ink">
                      {item.mrpPricingSummary ?? "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
          {item.description ? (
            <Paragraph className="!mb-0 mt-4 text-gw-ink-3">{item.description}</Paragraph>
          ) : null}
        </Card>

        <Card className="mb-6 shadow-sm" title="Batches (stock by lot)">
          <div className="min-w-0 overflow-hidden rounded-lg bg-white">
            <DataTable
              columns={batchColumns}
              dataSource={batches}
              loading={false}
              rowKey="id"
              pagination={false}
              scroll={{ x: 980 }}
            />
          </div>
        </Card>

        <Card className="mb-6 shadow-sm" title="Stock transactions (ledger)">
          <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
            <DataTable
              columns={txColumns}
              dataSource={transactions}
              loading={txLoading}
              rowKey="key"
              pagination={{
                current: txPagination.current,
                pageSize: txPagination.pageSize,
                total: txPagination.total,
                onChange: (page, pageSize) => {
                  loadFullDetails(page, pageSize, false);
                },
              }}
              scroll={{ x: 960 }}
            />
          </div>
        </Card>

        <Card className="mb-6 shadow-sm" title="Invoices">
          <Text type="secondary" className="mb-3 block text-sm">
            Invoices that include this SKU (from inventory details).
          </Text>
          <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
            <DataTable
              columns={invColumns}
              dataSource={invoices}
              loading={false}
              rowKey="key"
              pagination={{
                current: invPagination.current,
                pageSize: invPagination.pageSize,
                total: invPagination.total,
                onChange: (page, pageSize) => {
                  setInvPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize,
                    total: prev.total,
                  }));
                },
              }}
              scroll={{ x: 900 }}
            />
          </div>
        </Card>

        <Modal
          title="Edit SKU"
          open={editOpen}
          onCancel={() => {
            setEditOpen(false);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
          centered
          width="min(720px, calc(100vw - 24px))"
        >
          <Form form={form} layout="vertical" onFinish={submitEdit}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Enter name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="sku" label="SKU">
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="unit" label="Unit">
              <Input />
            </Form.Item>
            <Form.Item name="reorderLevel" label="Reorder level">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <p className="mb-0 text-sm text-gray-500">
              Cost, selling price, and MRP are set per batch when you add a batch below.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </div>
          </Form>
        </Modal>

        <Modal
          title="Add batch"
          open={addBatchOpen}
          onCancel={() => setAddBatchOpen(false)}
          onOk={submitAddBatch}
          okText="Add"
          confirmLoading={loading}
          destroyOnClose
          centered
        >
          <Form form={addBatchForm} layout="vertical">
            <Form.Item
              name="batchNumber"
              label="Batch / lot number"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Unique for this SKU" />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                { required: true },
                { type: "number", min: 0.0001, message: "Must be positive" },
              ]}
            >
              <InputNumber min={0.0001} className="w-full" />
            </Form.Item>
            <Form.Item name="expiryDate" label="Expiry">
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="costPrice" label="Cost price (per unit)">
              <InputNumber min={0} className="w-full" addonBefore="₹" placeholder="Optional" />
            </Form.Item>
            <Form.Item name="sellingPrice" label="Selling price (per unit)">
              <InputNumber min={0} className="w-full" addonBefore="₹" placeholder="Optional" />
            </Form.Item>
            <Form.Item name="mrp" label="MRP">
              <InputNumber min={0} className="w-full" addonBefore="₹" placeholder="Optional" />
            </Form.Item>
            <Form.Item name="remarks" label="Remarks">
              <TextArea rows={2} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            editingBatch
              ? `Edit lot — ${editingBatch.batchNumber || "batch"}`
              : "Edit lot"
          }
          open={editBatchOpen}
          onCancel={() => {
            setEditBatchOpen(false);
            setEditingBatch(null);
            updateBatchForm.resetFields();
          }}
          onOk={submitUpdateBatch}
          okText="Save"
          confirmLoading={loading}
          destroyOnClose
          centered
          width="min(520px, calc(100vw - 24px))"
        >
          <p className="mb-3 text-sm text-gray-500">
            Clear a price field and save to remove it on the server. Clear expiry to remove the
            expiry date.
          </p>
          <Form form={updateBatchForm} layout="vertical">
            <Form.Item name="costPrice" label="Cost price (per unit)">
              <InputNumber
                min={0}
                className="w-full"
                addonBefore="₹"
                placeholder="Optional"
                allowClear
              />
            </Form.Item>
            <Form.Item name="sellingPrice" label="Selling price (per unit)">
              <InputNumber
                min={0}
                className="w-full"
                addonBefore="₹"
                placeholder="Optional"
                allowClear
              />
            </Form.Item>
            <Form.Item name="mrp" label="MRP">
              <InputNumber
                min={0}
                className="w-full"
                addonBefore="₹"
                placeholder="Optional"
                allowClear
              />
            </Form.Item>
            <Form.Item name="expiryDate" label="Expiry">
              <DatePicker className="w-full" format="YYYY-MM-DD" allowClear />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Adjust stock"
          open={adjustOpen}
          onCancel={() => {
            setAdjustOpen(false);
            adjustForm.resetFields();
          }}
          onOk={submitAdjust}
          okText="Apply"
          confirmLoading={loading}
          destroyOnClose
          centered
          width="min(560px, calc(100vw - 24px))"
        >
          <Form form={adjustForm} layout="vertical">
            <Form.Item
              name="inventoryBatchId"
              label="Batch"
              rules={[{ required: true, message: "Select a batch" }]}
            >
              <Select
                placeholder="Choose batch"
                allowClear
                showSearch
                optionFilterProp="label"
                options={itemBatches.map((b) => ({
                  value: b.id,
                  label: `${b.batchNumber} — ${b.quantityOnHand} on hand${b.expiryDate
                    ? ` — exp ${dayjs(b.expiryDate).format("YYYY-MM-DD")}`
                    : ""
                    }`,
                }))}
              />
            </Form.Item>
            {itemBatches.length === 0 && (
              <p className="mb-3 text-sm text-amber-800">
                No batches yet. Add a batch first.
              </p>
            )}
            <Form.Item name="transactionType" label="Type" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio.Button value="STOCK_IN">Stock in</Radio.Button>
                <Radio.Button value="STOCK_OUT">Stock out</Radio.Button>
                <Radio.Button value="ADJUSTMENT">Set quantity</Radio.Button>
              </Radio.Group>
            </Form.Item>
            {(txType === "STOCK_IN" || txType === "STOCK_OUT") && (
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[
                  { required: true },
                  { type: "number", min: 0.0001, message: "Positive" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            )}
            {txType === "ADJUSTMENT" && (
              <Form.Item
                name="adjustmentToQuantity"
                label="New on-hand (this batch)"
                rules={[
                  { required: true },
                  { type: "number", min: 0, message: "≥ 0" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            )}
            <Form.Item name="remarks" label="Remarks">
              <TextArea rows={2} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Box>
  );
};

export default InventoryItemDetailPage;
