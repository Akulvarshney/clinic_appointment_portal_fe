import React, { useState } from "react";
import { Table, Button, Radio, Space, Modal, Input, Form, message } from "antd";

const initialData = {
  invoices: [
    {
      key: "1",
      number: "INV001",
      clientName: "Acme Corp",
      clientId: "C101",
      amount: 1200,
    },
    {
      key: "2",
      number: "INV002",
      clientName: "Globex Inc",
      clientId: "C102",
      amount: 850,
    },
  ],
  quotations: [
    {
      key: "1",
      number: "QT001",
      clientName: "Beta Ltd",
      clientId: "C201",
      amount: 560,
    },
    {
      key: "2",
      number: "QT002",
      clientName: "ZX Solutions",
      clientId: "C202",
      amount: 270,
    },
  ],
  receipts: [
    {
      key: "1",
      number: "RC001",
      clientName: "John & Co.",
      clientId: "C301",
      amount: 340,
    },
    {
      key: "2",
      number: "RC002",
      clientName: "Epsilon",
      clientId: "C302",
      amount: 1420,
    },
  ],
};

const tabConfig = [
  { key: "invoices", label: "Invoices", createText: "Create Invoice" },
  { key: "quotations", label: "Quotations", createText: "Create Quotation" },
  { key: "receipts", label: "Receipts", createText: "Create Receipt" },
];

const BillManagement = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [form] = Form.useForm();

  const handleTabChange = (e) => setActiveTab(e.target.value);

  const handleCreate = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const newEntry = {
          key: Date.now().toString(),
          ...values,
        };
        setData((prev) => ({
          ...prev,
          [activeTab]: [...prev[activeTab], newEntry],
        }));
        setIsModalVisible(false);
        message.success(
          `${tabConfig.find((t) => t.key === activeTab).label} created`
        );
      })
      .catch(() => {
        message.error("Please fill all required fields");
      });
  };

  const columns = [
    { title: "Number", dataIndex: "number", key: "number", width: 120 },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      width: 200,
    },
    { title: "Client ID", dataIndex: "clientId", key: "clientId", width: 150 },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (val) => `₹${val}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => message.info(`Viewing ${record.number}`)}
          >
            View
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => message.info(`Editing ${record.number}`)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Bill Management
        </h1>
        <Button type="primary" onClick={handleCreate}>
          {tabConfig.find((tab) => tab.key === activeTab).createText}
        </Button>
      </div>

      {/* Tabs */}
      <Radio.Group
        value={activeTab}
        onChange={handleTabChange}
        style={{ marginBottom: 24 }}
        buttonStyle="solid"
      >
        {tabConfig.map((tab) => (
          <Radio.Button key={tab.key} value={tab.key}>
            {tab.label}
          </Radio.Button>
        ))}
      </Radio.Group>

      {/* Table */}
      <Table
        dataSource={data[activeTab]}
        columns={columns}
        rowKey="key"
        loading={loading}
        bordered
      />

      {/* Modal for Create */}
      <Modal
        title={tabConfig.find((tab) => tab.key === activeTab).createText}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Number"
            name="number"
            rules={[{ required: true, message: "Please enter number" }]}
          >
            <Input placeholder="e.g. INV003" />
          </Form.Item>
          <Form.Item
            label="Client Name"
            name="clientName"
            rules={[{ required: true, message: "Please enter client name" }]}
          >
            <Input placeholder="e.g. Acme Corp" />
          </Form.Item>
          <Form.Item
            label="Client ID"
            name="clientId"
            rules={[{ required: true, message: "Please enter client ID" }]}
          >
            <Input placeholder="e.g. C105" />
          </Form.Item>
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <Input type="number" placeholder="e.g. 1200" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BillManagement;
