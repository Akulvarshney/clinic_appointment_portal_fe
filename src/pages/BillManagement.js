import React, { useState, useEffect, useMemo } from "react";
import { Button, Radio, message, Modal, Input, Tooltip, Dropdown, Menu } from "antd";
import DataTable from "../components/DataTable";
import {
  EditOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import debounce from "lodash/debounce";

import GenerateInvoiceModal from "./GenerateInvoiceModal";
import { isFeatureValid } from "../assets/constants";
import ReceiptModal from "./ReceiptModal.js";
import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";

import {
  fetchBills,
  saveAsInvoice,
  fetchReceipts,
} from "../services/invoicesServices.js";
import { BACKEND_URL } from "../assets/constants/index.js";
import axios from "axios";
import { getOrgInfo } from "../services/clientOrganizations.js";
const { Search } = Input;

const BillManagement = () => {
  const orgId = localStorage.getItem("selectedOrgId");
  const [activeTab, setActiveTab] = useState("");
  //const [activeTab, setActiveTab] = useState("invoices");
  const [data, setData] = useState({
    invoices: [],
    quotations: [],
    receipts: [],
  });
  const [modalType, setModalType] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [invoices, setInvoice] = useState([]);
  const [receiptData, setreceiptData] = useState([]);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [printUrl, setPrintUrl] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 20,
    total: 0,
  });

  const [orgDetail, setOrgDetail] = useState(null);

  const [isInvoiceView, setIsInvoiceView] = useState(false);
  const [isQuotationView, setIsQuotationView] = useState(false);
  const [isReceiptView, setIsReceiptView] = useState(false);
  const [canCreateInvoice, setCanCreateInvoice] = useState(false);
  const [canCreateQuotation, setCanCreateQuotation] = useState(false);
  const [canCreateReceipt, setCanCreateReceipt] = useState(false);
  const [canSaveAsInvoice, setCanSaveAsInvoice] = useState(false);
  const [canPrintInvoice, setCanPrintInvoice] = useState(false);
  const [canEditQuotation, setCanEditQuotation] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [loadingBillDetails, setLoadingBillDetails] = useState(false);
  const [convertConfirmOpen, setConvertConfirmOpen] = useState(false);
  const [quotationPendingConvert, setQuotationPendingConvert] = useState(null);

  useEffect(() => {
    const getinfo = async () => {
      const response = await getOrgInfo();

      console.log("123123", response);

      if (response) {
        setOrgDetail(response);
      }
    };

    getinfo();
  }, []);

  const fetchBillDetails = async (billId, billType) => {
    try {
      setLoadingBillDetails(true);
      const token = localStorage.getItem("token");
      const selectedOrgId = localStorage.getItem("selectedOrgId");

      // Adjust endpoint based on bill type
      const endpoint = `/clientadmin/invoices/billDetail/${billId}`;

      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          organization_id: selectedOrgId,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error("Error fetching bill details:", error);

      return null;
    } finally {
      setLoadingBillDetails(false);
    }
  };

  const handleEdit = async (record) => {
    const billType = activeTab === "invoices" ? "invoice" : "quotation";
    const billDetails = await fetchBillDetails(record.id, billType);

    if (billDetails) {
      // Transform API response to match modal's expected format
      const formattedData = {
        id: billDetails.id,
        invoiceNumber: billDetails.invoice_number,
        invoiceDate: billDetails.invoice_date,
        dueDate: billDetails.due_date,
        // Extract client data from the nested clients object
        billTo: billDetails.clients
          ? {
            id: billDetails.clients.id,
            first_name: billDetails.clients.first_name,
            last_name: billDetails.clients.last_name,
            email: billDetails.clients.email,
            phone: billDetails.clients.phone,
            address: billDetails.clients.address,
            state: billDetails.clients.state,
          }
          : {
            id: billDetails.client_id,
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            address: "",
            state: "",
          },
        // Map bill_line_items (not line_items) to items array
        items:
          billDetails.bill_line_items?.map((item) => ({
            id: item.id,
            kind: item.line_kind || (item.inventory_item_id ? "INVENTORY" : "SERVICE"),
            serviceId: item.service_id,
            inventoryItemId: item.inventory_item_id,
            inventoryBatchId: item.inventory_batch_id,
            inventoryBatchNumber: item.inventory_batch_number,
            description: item.description,
            qty: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
            gst: Number(item.gst_percentage) || 0,
          })) || [],
        discountPercent: Number(billDetails.discount_percentage) || 0,
        notes: billDetails.notes || "",
        terms: billDetails.terms ,
        shippingCharges: Number(billDetails.shipping_charges) || 0,
        bankCharges: billDetails.bank_charges || null,
        billToText: billDetails.bill_to_text || "",
        billFromText: billDetails.bill_from_text || "",
      };

      setEditingBill(formattedData);
      setModalType(billType);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const varisInvoiceView = isFeatureValid("BILLING", "VIEW_INVOICE");
      setIsInvoiceView(varisInvoiceView);
      console.log("VIEW_INVOICE", varisInvoiceView);

      const varisQuotationView = isFeatureValid("BILLING", "VIEW_QUOTATION");
      setIsQuotationView(varisQuotationView);

      const varisReceiptView = isFeatureValid("BILLING", "VIEW_RECEIPT");
      setIsReceiptView(varisReceiptView);

      if (isInvoiceView) {
        setActiveTab("invoices");
      } else if (isQuotationView) {
        setActiveTab("quotations");
      } else if (isReceiptView) {
        setActiveTab("receipts");
      }

      const varcanCreateInvoice = isFeatureValid("BILLING", "CREATE_INVOICE");
      setCanCreateInvoice(varcanCreateInvoice);

      const varcanCreateQuotation = isFeatureValid(
        "BILLING",
        "CREATE_QUOTATION"
      );
      setCanCreateQuotation(varcanCreateQuotation);

      const varcanCreateReceipt = isFeatureValid("BILLING", "CREATE_RECEIPT");
      setCanCreateReceipt(varcanCreateReceipt);

      const varcanSaveAsInvoice = isFeatureValid("BILLING", "SAVE_AS_INVOICE");
      setCanSaveAsInvoice(varcanSaveAsInvoice);

      const varcanPrintInvoice = isFeatureValid("BILLING", "PRINT_INVOICES");
      setCanPrintInvoice(varcanPrintInvoice);

      const varCanEditQuotation = isFeatureValid("BILLING", "EDIT_QUOTATION");
      setCanEditQuotation(varCanEditQuotation);
    };
    initialize();
  }, [
    isInvoiceView,
    isQuotationView,
    isReceiptView,
    canCreateInvoice,
    canCreateQuotation,
    canCreateReceipt,
    canSaveAsInvoice,
    canPrintInvoice,
    canEditQuotation,
  ]);

  useEffect(() => {
    fetchServices();
  }, [orgId, refresh]);

  useEffect(() => {
    const loadBills = async () => {
      try {
        if (activeTab === "receipts") {
          const receiptsData = await fetchReceipts(
            search,
            pagination.current,
            pagination.limit
          );
          const formattedReceipts = receiptsData.data.map((entry) => ({
            receiptId: entry.receipt_id,
            clientName: entry.clients.first_name || "-",
            amount: entry.amount,
            datePrinted: new Date(entry.created_at).toLocaleDateString(),
            raw: entry,
          }));
          setreceiptData(formattedReceipts);
          setPagination((prev) => ({
            ...prev,
            total: receiptsData.total || 0,
          }));
        } else {
          if (activeTab === "invoices") {
            console.log("pagination", pagination);
            const billsdata = await fetchBills(
              // Function to call API
              search,
              "INVOICE",
              pagination.current,
              pagination.limit
            );
            console.log("pagination here ", billsdata.pagination);

            const billsArray = Array.isArray(billsdata.data)
              ? billsdata.data
              : [];
            //console.log("bills data ", billsdata);
            const formattedInvoices = billsArray
              .filter((entry) => entry.bill_type === "INVOICE")
              .map((entry) => ({
                id: entry.invoice_id,
                billId: entry.invoice_number,
                clientName: entry.client_name || "-",
                clientEmail: entry.client_email || "-",
                billTo: entry.bill_to || "",
                amount: entry.final_amount,
                datePrinted: new Date(entry.invoice_date).toLocaleDateString(),
                invoiceReference: entry.invoice_reference || "-",
                raw: entry,
              }));
            setIsLoading(false);
            setData((prev) => ({ ...prev, invoices: formattedInvoices }));

            setPagination((prev) => ({
              ...prev,
              total: billsdata.pagination?.total_records || 0,
            }));
          }

          if (activeTab === "quotations") {
            //alert("onclick");
            const billsdata = await fetchBills(
              search,
              "QUOTATION",
              pagination.current,
              pagination.limit
            );

            // ensure it's an array
            const billsArray = Array.isArray(billsdata.data)
              ? billsdata.data
              : [];
            const formattedQuotations = billsArray
              .filter((entry) => entry.bill_type === "QUOTATION")
              .map((entry) => ({
                id: entry.invoice_id,
                billId: entry.invoice_number,
                clientName: entry.client_name || "-",
                clientEmail: entry.client_email || "-",
                billTo: entry.bill_to || "",
                amount: entry.final_amount,
                datePrinted: new Date(entry.invoice_date).toLocaleDateString(),
                invoiceReference: entry.invoice_reference,
                raw: entry,
              }));
            //console.log("formatted quotations >> ", formattedQuotations);
            setData((prev) => ({ ...prev, quotations: formattedQuotations }));
            setPagination((prev) => ({
              ...prev,
              total: billsdata.pagination?.total_records || 0,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching bills:", err);
        setData((prev) => ({ ...prev, invoices: [], quotations: [] }));
      }
    };

    loadBills();
  }, [activeTab, orgId, refresh, search, pagination.current]);

  //const handleTabChange = (e) => setActiveTab(e.target.value);
  const handleTabChange = (e) => {
    const newTab = e.target.value;
    setActiveTab(newTab);

    // Reset page to 1 whenever tab changes
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: 0, // optional: ensures table updates correctly
    }));
  };
  const handleCreate = (type) => {
    setViewData(null);
    setEditingBill(null);
    setModalType(type);
  };

  const openConvertConfirm = (record) => {
    setQuotationPendingConvert(record);
    setConvertConfirmOpen(true);
  };

  const performConvertToInvoice = async (record) => {
    try {
      await saveAsInvoice(record, setRefresh);
      setActiveTab("invoices");
      message.success("Quotation saved as invoice");
      setConvertConfirmOpen(false);
      setQuotationPendingConvert(null);
    } catch (err) {
      console.error(err);
      message.error("Error converting quotation");
      throw err;
    }
  };

  // Create debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
      }, 500),
    []
  );

  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  const saveEntry = (entry, typeKey) => {
    const transformed = {
      billId: entry?.id || `BILL-${Date.now()}`,
      clientName: entry?.client?.name || entry?.clientName || "Unknown",
      billTo: entry?.billTo || "",
      amount: entry?.grandTotal || entry?.amount || 0,
      datePrinted: entry?.datePrinted || new Date().toLocaleDateString(),
      raw: entry,
    };

    setData((prev) => ({
      ...prev,
      [typeKey]: [...prev[typeKey], transformed],
    }));

    message.success(`${typeKey.slice(0, -1)} created`);
  };

  const updateEntryReceipt = (entry) => {
    console.log("receiptId ", entry);
    setreceiptData((prev) => [
      ...prev,
      {
        receiptId: entry.id,
        clientName: entry.client?.first_name || "-",
        amount: entry.amount,
        datePrinted: new Date(entry.created_at).toLocaleDateString(),
        raw: entry,
      },
    ]);
    setRefresh(Math.random);
    setModalType(null);
  };

  const handleView = (record) => {
    setViewData(record.raw);
    setModalType(record.raw.type || "invoice");
  };

  const handlePrint = (record, printType) => {
    const url =
      printType === "a4"
        ? `${BACKEND_URL}/invoice/${record.id}`
        : `${BACKEND_URL}/invoice2/${record.id}`;

    setPrintUrl(url);
    setPrintModalVisible(true);
  };

  const handlePrintReceipt = (record, printType) => {
    console.log("!23", record);

    const url =
      printType === "a4"
        ? `${BACKEND_URL}/receipt/${record.raw.id}`
        : `${BACKEND_URL}/receipt2/${record.raw.id}`;

    setPrintUrl(url);
    setPrintModalVisible(true);
  };

  const ReceiptColumns = [
    { title: "Receipt ID", dataIndex: "receiptId", key: "receiptId" },
    { title: "Client Name", dataIndex: "clientName", key: "clientName" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    {
      title: "Action",
      key: "action",
      width: 72,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const printMenu = (
          <Menu
            onClick={({ key }) => {
              if (key === "a4") {
                handlePrintReceipt(record, "a4");
              } else if (key === "thermal") {
                handlePrintReceipt(record, "thermal");
              }
            }}
            items={[
              { key: "a4", label: "A4" },
              { key: "thermal", label: "Thermal" },
            ]}
          />
        );

        return (
          <Tooltip title="Print receipt">
            <span className="inline-flex">
              <Dropdown overlay={printMenu} trigger={["click"]}>
                <Button
                  type="default"
                  size="small"
                  className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-100 hover:text-cyan-800"
                  icon={
                    <PrinterOutlined className="text-cyan-600" />
                  }
                  aria-label="Print receipt"
                />
              </Dropdown>
            </span>
          </Tooltip>
        );
      },
    },
  ];
  const columns = [
    { title: "Bill ID", dataIndex: "billId", key: "billId" },
    { title: "Client Name", dataIndex: "clientName", key: "clientName" },
    { title: "Bill To", dataIndex: "billTo", key: "billTo" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => `₹${val}`,
    },
    ...(activeTab === "quotations"
      ? [
        {
          title: "Invoice Id",
          dataIndex: "invoiceReference",
          key: "invoiceReference",
        },
      ]
      : []),
    { title: "Date Generated", dataIndex: "datePrinted", key: "datePrinted" },

    {
      title: "Action",
      key: "action",
      width: 148,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const printMenu = (
          <Menu
            onClick={({ key }) => {
              if (key === "a4") {
                handlePrint(record, "a4");
              } else if (key === "thermal") {
                handlePrint(record, "thermal");
              }
            }}
            items={[
              { key: "a4", label: "A4" },
              { key: "thermal", label: "Thermal" },
            ]}
          />
        );

        const printTrigger = (
          <Tooltip title="Print (A4 or thermal)">
            <span className="inline-flex">
              <Dropdown overlay={printMenu} trigger={["click"]}>
                <Button
                  type="default"
                  size="small"
                  className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-100 hover:text-cyan-800"
                  icon={
                    <PrinterOutlined className="text-cyan-600" />
                  }
                  aria-label="Print bill"
                />
              </Dropdown>
            </span>
          </Tooltip>
        );

        return (
          <div className="flex flex-nowrap items-center justify-center gap-1">
            {activeTab === "quotations" && !record.invoiceReference ? (
              <Tooltip title="Edit quotation">
                <span className="inline-flex">
                  <Button
                    type="default"
                    size="small"
                    className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-800"
                    icon={
                      <EditOutlined className="text-indigo-600" />
                    }
                    onClick={() => handleEdit(record)}
                    loading={loadingBillDetails}
                    disabled={!canEditQuotation}
                    aria-label="Edit quotation"
                  />
                </span>
              </Tooltip>
            ) : null}
            {activeTab === "invoices" && (
              <Tooltip
                title={
                  canPrintInvoice
                    ? "Print (A4 or thermal)"
                    : "You do not have permission to print"
                }
              >
                <span className="inline-flex">
                  <Dropdown
                    overlay={printMenu}
                    trigger={["click"]}
                    disabled={!canPrintInvoice}
                  >
                    <Button
                      type="default"
                      size="small"
                      className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-100 hover:text-cyan-800 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                      icon={
                        <PrinterOutlined className="text-cyan-600" />
                      }
                      disabled={!canPrintInvoice}
                      aria-label="Print invoice"
                    />
                  </Dropdown>
                </span>
              </Tooltip>
            )}
            {activeTab === "quotations" && printTrigger}

            {activeTab === "quotations" && !record.invoiceReference && (
              <Tooltip title="Save as invoice">
                <span className="inline-flex">
                  <Button
                    type="default"
                    size="small"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800"
                    icon={
                      <SaveOutlined className="text-emerald-600" />
                    }
                    onClick={() => openConvertConfirm(record)}
                    disabled={!canSaveAsInvoice}
                    aria-label="Save as invoice"
                  />
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="gw-page-content">
      <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <h1 className="m-0 shrink-0 text-xl font-bold text-gw-primary-dark sm:text-2xl lg:text-3xl">
          Bill Management
        </h1>
        <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
          <div className="w-full shrink-0 sm:w-[280px] md:w-[300px]">
          <Search
            placeholder="Search by bill id, bill to..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: "100%" }}
            onSearch={handleSearch}
            onChange={(e) => {
              if (!e.target.value) {
                handleSearch("");
              } else {
                handleSearch(e.target.value);
              }
            }}
          />
          </div>
          {activeTab === "invoices" && canCreateInvoice && (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="w-full shrink-0 sm:w-auto"
              onClick={() => handleCreate("invoice")}
            >
              Create Invoice
            </Button>
          )}
          {activeTab === "quotations" && canCreateQuotation && (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="w-full shrink-0 sm:w-auto"
              onClick={() => handleCreate("quotation")}
            >
              Create Quotation
            </Button>
          )}
          {activeTab === "receipts" && canCreateReceipt && (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="w-full shrink-0 sm:w-auto"
              onClick={() => handleCreate("receipt")}
            >
              Create Receipt
            </Button>
          )}
        </div>
      </div>

      <Radio.Group
        value={activeTab}
        onChange={handleTabChange}
        className="mb-4 flex flex-wrap gap-2"
        buttonStyle="solid"
      >
        <Radio.Button value="invoices" disabled={!isInvoiceView}>
          Invoices
        </Radio.Button>
        <Radio.Button value="quotations" disabled={!isQuotationView}>
          Quotations
        </Radio.Button>
        <Radio.Button value="receipts" disabled={!isReceiptView}>
          Receipts
        </Radio.Button>
      </Radio.Group>

      {activeTab === "receipts" ? (
        <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
        <DataTable
          className="bill-management-table"
          dataSource={receiptData} // separate receipt data
          columns={ReceiptColumns} // separate receipt columns
          rowKey="receiptId"
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.limit,
            total: pagination.total,
          }}
          onChange={(newPagination) => {
            setPagination((prev) => ({
              ...prev,
              current: newPagination.current,
              limit: newPagination.pageSize,
            }));
          }}
        />
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
        <DataTable
          className="bill-management-table"
          dataSource={data[activeTab]} // invoices or quotations
          columns={columns}
          rowKey="billId"
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.limit,
            total: pagination.total,
          }}
          onChange={(newPagination) => {
            setPagination((prev) => ({
              ...prev,
              current: newPagination.current,
              limit: newPagination.pageSize,
            }));
          }}
        />
        </div>
      )}

      {activeTab === "receipts" ? (
        <ReceiptModal
          visible={!!modalType && modalType === "receipt"}
          initialData={viewData}
          onClose={() => setModalType(null)}
          onCancel={() => {
            console.log("Closing modal");
            setModalType(null);
          }}
          onSuccess={(entry) => {
            updateEntryReceipt(entry);
            //setModalType(null);
          }}
        />
      ) : (
        <GenerateInvoiceModal
          visible={
            !!modalType &&
            (modalType === "invoice" || modalType === "quotation")
          }
          type={modalType}
          initialData={viewData}
          setRefresh={setRefresh}
          onClose={() => setModalType(null)}
          onSuccess={(entry) => {
            if (!modalType) return;
            saveEntry(entry, modalType + "s");
            setModalType(null);
          }}
          editData={editingBill}
        />
      )}

      <Modal
        title="Save quotation as invoice?"
        open={convertConfirmOpen}
        onCancel={() => {
          setConvertConfirmOpen(false);
          setQuotationPendingConvert(null);
        }}
        onOk={async () => {
          if (quotationPendingConvert) {
            await performConvertToInvoice(quotationPendingConvert);
          }
        }}
        okText="Save as invoice"
        cancelText="Cancel"
        okButtonProps={{ className: "bg-emerald-600 hover:bg-emerald-700" }}
      >
        <p className="m-0 text-gray-700">
          This will create an invoice from quotation{" "}
          <strong>{quotationPendingConvert?.billId}</strong> for{" "}
          <strong>{quotationPendingConvert?.clientName}</strong>. You can review
          it on the Invoices tab after conversion.
        </p>
      </Modal>

      <Modal
        title="Print Preview"
        open={printModalVisible}
        onCancel={() => {
          setPrintModalVisible(false);
          setPrintUrl("");
        }}
        width="80%"
        footer={null}
      >
        <iframe
          id="print-iframe"
          src={printUrl}
          loading={isLoading}
          style={{
            width: "100%",
            height: "70vh",
            border: "1px solid #ddd",
          }}
          title="Print Preview"
        />
      </Modal>
    </div>
  );
};

export default BillManagement;
