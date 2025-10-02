import React, { useState, useEffect } from "react";
import { Table, Button, Radio, message, Modal } from "antd";
import { Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";

import GenerateInvoiceModal from "./GenerateInvoiceModal";
import ReceiptModal from "./ReceiptModal.js";
import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";
import {
  fetchBills,
  saveAsInvoice,
  fetchReceipts,
} from "../services/invoicesServices.js";
import { BACKEND_URL } from "../assets/constants/index.js";

const BillManagement = () => {
  const orgId = localStorage.getItem("selectedOrgId");
  const [activeTab, setActiveTab] = useState("invoices");
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

  useEffect(() => {
    fetchServices();
  }, [orgId, refresh]);

  useEffect(() => {
    const loadBills = async () => {
      try {
        if (activeTab === "receipts") {
          const receiptsData = await fetchReceipts();
          const formattedReceipts = receiptsData.map((entry) => ({
            receiptId: entry.receipt_id,
            clientName: entry.clients.first_name || "-",
            amount: entry.amount,
            datePrinted: new Date(entry.created_at).toLocaleDateString(),
            raw: entry,
          }));
          setreceiptData(formattedReceipts);
        } else {
          if (activeTab === "invoices") {
            const billsdata = await fetchBills("", "INVOICE");
            // ensure it's an array
            const billsArray = Array.isArray(billsdata) ? billsdata : [];
            console.log("bills data ", billsdata);
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
            setData((prev) => ({ ...prev, invoices: formattedInvoices }));
          }

          if (activeTab === "quotations") {
            const billsdata = await fetchBills("", "QUOTATION");

            // ensure it's an array
            const billsArray = Array.isArray(billsdata) ? billsdata : [];
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
            console.log("formatted quotations >> ", formattedQuotations);
            setData((prev) => ({ ...prev, quotations: formattedQuotations }));
          }
        }
      } catch (err) {
        console.error("Error fetching bills:", err);
        setData((prev) => ({ ...prev, invoices: [], quotations: [] }));
      }
    };

    loadBills();
  }, [activeTab, orgId, refresh]);

  const handleTabChange = (e) => setActiveTab(e.target.value);
  const handleCreate = (type) => {
    setViewData(null);
    setModalType(type);
  };

  const handleConvert = async (record) => {
    try {
      console.log("save as invoice ", record);
      saveAsInvoice(record);

      // if (!res.ok) throw new Error("Failed to convert quotation");

      // message.success("Quotation converted to Invoice");

      // // Refresh bills
      // const updatedBills = await fetchBills();
      // re-trigger the useEffect logic
      setActiveTab("invoices"); // optional: directly switch to invoices tab
    } catch (err) {
      console.error(err);
      message.error("Error converting quotation");
    }
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
          <Dropdown overlay={printMenu} trigger={["click"]}>
            <Button type="primary" size="small">
              Print <DownOutlined />
            </Button>
          </Dropdown>
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

        return (
          <div className="flex gap-2">
            <Button
              type="default"
              size="small"
              onClick={() => handleView(record)}
            >
              View
            </Button>

            <Dropdown overlay={printMenu} trigger={["click"]}>
              <Button type="primary" size="small">
                Print <DownOutlined />
              </Button>
            </Dropdown>

            {activeTab === "quotations" && !record.invoiceReference && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleConvert(record)}
              >
                Save as Invoice
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
        Bill Management
      </h1>

      <div className="flex justify-between items-center">
        <Radio.Group
          value={activeTab}
          onChange={handleTabChange}
          style={{ margin: "16px 0" }}
          buttonStyle="solid"
        >
          <Radio.Button value="invoices">Invoices</Radio.Button>
          <Radio.Button value="quotations">Quotations</Radio.Button>
          <Radio.Button value="receipts">Receipts</Radio.Button>
        </Radio.Group>

        <div style={{ marginBottom: 16 }}>
          {activeTab === "invoices" && (
            <Button type="primary" onClick={() => handleCreate("invoice")}>
              Create Invoice
            </Button>
          )}
          {activeTab === "quotations" && (
            <Button type="primary" onClick={() => handleCreate("quotation")}>
              Create Quotation
            </Button>
          )}
          {activeTab === "receipts" && (
            <Button type="primary" onClick={() => handleCreate("receipt")}>
              Create Receipt
            </Button>
          )}
        </div>
      </div>

      {activeTab === "receipts" ? (
        <Table
          dataSource={receiptData} // separate receipt data
          columns={ReceiptColumns} // separate receipt columns
          rowKey="receiptId"
          bordered
        />
      ) : (
        <Table
          dataSource={data[activeTab]} // invoices or quotations
          columns={columns}
          rowKey="billId"
          bordered
        />
      )}

      {activeTab === "receipts" ? (
        <ReceiptModal
          visible={!!modalType && modalType === "receipt"}
          initialData={viewData}
          //onClose={() => setModalType(null)}
          onCancel={() => {
            console.log("Closing modal");
            setModalType(null);
          }}
          onSuccess={(entry) => {
            saveEntry(entry, "receipts");
            setModalType(null);
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
        />
      )}

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
