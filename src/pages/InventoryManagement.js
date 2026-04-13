import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
} from "antd";
import DataTable from "../components/DataTable";
import {
  PlusOutlined,
  SearchOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";
import { PALETTE } from "../theme/palette";
import { useNotification } from "../utils/messageWrapper";
import {
  normalizeInventoryItem,
  normalizeInventoryTransaction,
  inventoryGetErrorMessage,
} from "../utils/inventoryHelpers";

const { TextArea } = Input;
const { Search } = Input;

const TAB = "INVENTORY_MANAGEMENT";

const InventoryManagement = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [canView, setCanView] = useState(false);
  const [canAdd, setCanAdd] = useState(false);
  const [canViewTx, setCanViewTx] = useState(false);

  const notification = useNotification();

  const token = localStorage.getItem("token");
  const orgId = localStorage.getItem("selectedOrgId");

  const fetchItems = async (page, limit, search) => {
    const p = page ?? pagination.current;
    const l = limit ?? pagination.pageSize;
    const s = search !== undefined ? search : searchText;
    if (!orgId || !canView) return;
    setTableLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/clientadmin/inventoryManagement/getItems`, {
        params: { orgId, page: p, limit: l, search: s || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = response.data?.data ?? response.data ?? {};
      const rawList = payload.items ?? payload.data?.items ?? [];
      const totalRecords =
        payload.totalRecords ?? payload.total ?? rawList.length;
      const currentPage = payload.currentPage ?? p;

      setItems(rawList.map(normalizeInventoryItem).filter(Boolean));
      setPagination((prev) => ({
        ...prev,
        current: currentPage || p,
        pageSize: l,
        total: Number(totalRecords) || 0,
      }));
    } catch (err) {
      console.error("Error fetching inventory:", err);
      notification.error({
        message: "Could not load inventory",
        description: inventoryGetErrorMessage(err, "Failed to fetch inventory"),
        placement: "top",
      });
    } finally {
      setTableLoading(false);
    }
  };

  const fetchTransactions = async (page, limit) => {
    const pg = page ?? txPagination.current;
    const lim = limit ?? txPagination.pageSize;
    if (!orgId || !canViewTx) return;
    setTxLoading(true);
    try {
      const params = { orgId, page: pg, limit: lim };
      const response = await axios.get(`${BACKEND_URL}/clientadmin/inventoryManagement/getTransactions`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = response.data?.data ?? response.data ?? {};
      const rawList =
        payload.transactions ?? payload.data?.transactions ?? [];
      const totalRecords =
        payload.totalRecords ?? payload.total ?? rawList.length;
      const currentPage = payload.currentPage ?? pg;

      setTransactions(
        rawList.map((r, i) => normalizeInventoryTransaction(r, i)).filter(Boolean)
      );
      setTxPagination((prev) => ({
        ...prev,
        current: currentPage || pg,
        pageSize: lim,
        total: Number(totalRecords) || 0,
      }));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      notification.error({
        message: "Could not load transactions",
        description: inventoryGetErrorMessage(err, "Failed to fetch transactions"),
        placement: "top",
      });
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    const view = isFeatureValid(TAB, "VIEW_INVENTORY");
    setCanView(view);
    setCanAdd(isFeatureValid(TAB, "ADD_INVENTORY"));
    setCanViewTx(isFeatureValid(TAB, "VIEW_INVENTORY_TRANSACTIONS"));
    if (!view) {
      notification.warning({
        message: "No access",
        description:
          "You do not have permission to view inventory for this organization.",
        placement: "top",
        duration: 6,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- mount: feature flags + one-time warning

  useEffect(() => {
    if (canView && orgId) {
      fetchItems(1, 10, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [canView, orgId]);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ unit: "unit", initialQuantity: 0 });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const initialQty = Number(values.initialQuantity) || 0;
      const body = {
        orgId,
        name: values.name,
        sku: values.sku || undefined,
        description: values.description,
        unit: values.unit || "unit",
        initialQuantity: initialQty,
        reorderLevel: values.reorderLevel,
      };
      if (initialQty > 0) {
        body.batchNumber = values.batchNumber;
        if (values.expiryDate) {
          body.expiryDate = dayjs(values.expiryDate).format("YYYY-MM-DD");
        }
      }
      await axios.post(`${BACKEND_URL}/clientadmin/inventoryManagement/createItem`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      notification.success({
        message: "Item created",
        description: "The inventory SKU was added.",
        placement: "top",
      });

      setIsModalVisible(false);
      form.resetFields();
      fetchItems();
    } catch (err) {
      const msg = inventoryGetErrorMessage(err, "Failed to create item");
      notification.error({
        message: "Could not create item",
        description: msg,
        placement: "top",
      });
      console.error("Inventory save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAllTransactions = () => {
    setTxModalOpen(true);
    fetchTransactions(1, txPagination.pageSize);
  };

  const initialQtyWatch = Form.useWatch("initialQuantity", form);
  const showFirstBatchFields = Number(initialQtyWatch) > 0;

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
      width: 118,
    },
    {
      title: "Item",
      dataIndex: "itemName",
      key: "itemName",
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 100,
      render: (v) => v || "—",
    },
    {
      title: "Before",
      dataIndex: "quantityBefore",
      key: "quantityBefore",
      width: 80,
      align: "right",
      render: (v) => fmtQty(v),
    },
    {
      title: "Δ",
      dataIndex: "quantityDelta",
      key: "quantityDelta",
      width: 72,
      align: "right",
      render: (v, row) => {
        if (row.transactionType === "ADJUSTMENT") return "—";
        return fmtQty(v);
      },
    },
    {
      title: "After",
      dataIndex: "quantityAfter",
      key: "quantityAfter",
      width: 80,
      align: "right",
      render: (v) => fmtQty(v),
    },
    {
      title: "Set to",
      dataIndex: "adjustmentToQuantity",
      key: "adjustmentToQuantity",
      width: 80,
      align: "right",
      render: (v, row) => {
        if (row.transactionType !== "ADJUSTMENT") return "—";
        if (v != null) return String(v);
        return fmtQty(row.quantityAfter);
      },
    },
    {
      title: "Batch",
      dataIndex: "batchNumber",
      key: "batchNumber",
      width: 100,
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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 120,
      render: (v) => v || "—",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      width: 90,
    },
    {
      title: "On hand",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Reorder",
      dataIndex: "reorderLevel",
      key: "reorderLevel",
      width: 100,
      render: (v) => (v != null && v !== "" ? v : "—"),
    },
    {
      title: "Cost (batch)",
      dataIndex: "costPricingSummary",
      key: "costPricingSummary",
      width: 120,
      render: (v) => v || "—",
    },
    {
      title: "Sale (batch)",
      dataIndex: "sellPricingSummary",
      key: "sellPricingSummary",
      width: 120,
      render: (v) => v || "—",
    },
    {
      title: "Batches",
      key: "batches",
      width: 160,
      ellipsis: true,
      render: (_, record) => {
        const n = record.batchCount ?? 0;
        if (!n) return "—";
        return (
          <span title={record.batchLabels || ""}>
            {n} lot{n !== 1 ? "s" : ""}
            {record.batchLabels ? ` (${record.batchLabels})` : ""}
          </span>
        );
      },
    },
    {
      title: "Details",
      key: "details",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Link
          className="font-medium text-gw-primary-dark hover:underline"
          to={`/inventoryManagement/item/${record.id}`}
        >
          View
        </Link>
      ),
    },
  ];

  if (!canView) {
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
          <p className="m-0 text-gw-ink-3">
            You do not have permission to view inventory for this organization.
          </p>
        </div>
      </Box>
    );
  }

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
        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <h1 className="m-0 shrink-0 text-xl font-bold text-gw-primary-dark sm:text-2xl lg:text-3xl">
            Inventory Management
          </h1>
          <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <div className="w-full shrink-0 sm:w-[280px] md:w-[300px]">
              <Search
                placeholder="Search name, SKU, description, batch"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                style={{ width: "100%" }}
                onSearch={(value) => {
                  setSearchText(value);
                  fetchItems(1, pagination.pageSize, value);
                }}
              />
            </div>
            {canViewTx && (
              <Button
                size="large"
                icon={<HistoryOutlined />}
                onClick={openAllTransactions}
                className="w-full shrink-0 sm:w-auto"
              >
                All transactions
              </Button>
            )}
            {canAdd && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                size="large"
                className="w-full shrink-0 sm:w-auto"
              >
                Add item
              </Button>
            )}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
          <DataTable
            columns={columns}
            dataSource={items}
            loading={tableLoading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                fetchItems(page, pageSize, searchText);
              },
            }}
            scroll={{ x: 1200 }}
          />
        </div>

        <Modal
          title="Add inventory item (SKU)"
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          centered
          destroyOnClose
          styles={{
            content: {
              width: "min(800px, calc(100vw - 24px))",
              maxWidth: "100%",
            },
          }}
        >
          <div className="modal_outDiv">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              initialValues={{ unit: "unit", initialQuantity: 0 }}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter item name" }]}
              >
                <Input placeholder="Item name" />
              </Form.Item>
              <Form.Item label="SKU" name="sku">
                <Input placeholder="Unique SKU (optional)" />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <TextArea rows={2} placeholder="Description" />
              </Form.Item>
              <Form.Item label="Unit" name="unit">
                <Input placeholder="e.g. strip, box, unit" />
              </Form.Item>
              <Form.Item label="Initial quantity" name="initialQuantity">
                <InputNumber min={0} className="w-full" placeholder="0" />
              </Form.Item>
              {showFirstBatchFields && (
                <>
                  <Form.Item
                    label="First batch number"
                    name="batchNumber"
                    rules={[
                      {
                        required: true,
                        message:
                          "Batch number is required when initial quantity is greater than 0",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. BATCH-A1" />
                  </Form.Item>
                  <Form.Item label="Expiry (first batch)" name="expiryDate">
                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                  </Form.Item>
                </>
              )}
              <Form.Item label="Reorder level" name="reorderLevel">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <p className="mb-0 text-sm text-gray-500">
                Create SKU does not set cost, selling price, or MRP. Set those per batch on the
                item page (Add batch, or Edit lot on an existing batch). If you enter opening
                stock here, the first lot is created without prices until you update that lot.
              </p>

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={handleModalCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create item
                </Button>
              </div>
            </Form>
          </div>
        </Modal>

        <Modal
          title="Stock transactions"
          open={txModalOpen}
          onCancel={() => setTxModalOpen(false)}
          footer={null}
          width="min(1120px, calc(100vw - 24px))"
          destroyOnClose
          centered
        >
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
                  fetchTransactions(page, pageSize);
                },
              }}
              scroll={{ x: 1100 }}
            />
          </div>
        </Modal>
      </div>
    </Box>
  );
};

export default InventoryManagement;
