import React, { useState, useEffect } from "react";
import { Table, Button, Radio, message } from "antd";
import GenerateInvoiceModal from "./GenerateInvoiceModal";
import { fetchServices } from "../services/OrgServices.js";
import { fetchClients } from "../services/clientServices.js";
import { fetchInvoices } from "../services/invoicesServices.js";

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

  useEffect(() => {
    fetchServices();
  }, [orgId]);

  useEffect(() => {
    if (activeTab === "invoices") {
      fetchInvoices();
    }
  }, [activeTab]);

  const handleTabChange = (e) => setActiveTab(e.target.value);
  const handleCreate = (type) => {
    setViewData(null);
    setModalType(type);
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

  const handlePrint = (record) => {
    const printWindow = window.open("", "PRINT", "height=600,width=800");
    printWindow.document.write(
      "<html><head><title>Invoice</title></head><body>"
    );
    printWindow.document.write(
      `<pre>${JSON.stringify(record.raw, null, 2)}</pre>`
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

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
    { title: "Date Printed", dataIndex: "datePrinted", key: "datePrinted" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="default"
            size="small"
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => handlePrint(record)}
          >
            Print
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
        Bill Management
      </h1>

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

      <Table
        dataSource={data[activeTab]}
        columns={columns}
        rowKey="billId"
        bordered
      />

      <GenerateInvoiceModal
        visible={!!modalType}
        type={modalType}
        initialData={viewData}
        onClose={() => setModalType(null)}
        onSuccess={(entry) => {
          if (!modalType) return;
          saveEntry(entry, modalType + "s");
          setModalType(null);
        }}
      />
    </div>
  );
};

export default BillManagement;
