import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  message,
  Alert,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";

import { BACKEND_URL } from "../assets/constants";

const { TextArea } = Input;
const { Option } = Select;

const ReminderPage = () => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [reminders, setReminders] = useState([]);
  const [remark, setRemark] = useState("");
  const [currentReminder, setCurrentReminder] = useState(null);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");

  const fetchClients = async (searchTerm = "") => {
    if (!orgId || !token) return;

    try {
      setClientLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/patient/clients/clientListing`,
        {
          params: {
            search: searchTerm,
            page: 1,
            limit: 10,
            orgId,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("client datadddd >> ", response.data.data);

      const clients = response.data.data || [];
      setClientOptions(clients);
    } catch (err) {
      console.error("Error fetching clients:", err);
      message.error("Failed to fetch clients");
    } finally {
      setClientLoading(false);
    }
  };

  // Fetch reminders
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/clientadmin/reminderManagement/getReminders`,
        {
          params: {
            orgId: orgId,
            date: selectedDate.startOf("day").toISOString(),
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("reminders>>> ", response.data);
      if (response.status === 200) {
        setReminders(response.data.response || []);
      } else {
        message.error("Failed to fetch reminders");
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      message.error("Something went wrong while fetching reminders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);
  useEffect(() => {
    fetchReminders();
  }, [selectedDate]);

  const handleToday = () => setSelectedDate(dayjs());

  const handleCheckReminder = (reminder) => {
    setCurrentReminder(reminder);
    setShowRemarkModal(true);
  };

  const saveRemark = async () => {
    if (!remark.trim()) {
      message.error("Please enter remarks");
      return;
    }
    try {
      await axios.put(
        `${BACKEND_URL}/clientadmin/reminderManagement/updateReminder/${currentReminder.id}/complete`,
        {
          remarks: remark,
          orgId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Remark saved successfully");
      setShowRemarkModal(false);
      setRemark("");
      setCurrentReminder(null);
      fetchReminders(); // refresh
    } catch (error) {
      console.error("Error saving remark:", error);
      message.error("Failed to save remark");
    }
  };

  const handleAddReminder = async (values) => {
    try {
      await axios.post(
        `${BACKEND_URL}/clientadmin/reminderManagement/saveReminder`,
        {
          orgId,
          clientId: values.client,
          reminderdate: values.date.startOf("day").toISOString(),
          comments: values.comments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      form.resetFields();
      setShowAddModal(false);
      setSuccessMsg("Reminder added successfully!");
      fetchReminders(); // refresh
    } catch (error) {
      console.error("Error adding reminder:", error);
      message.error("Failed to add reminder");
    }
  };

  const sortedReminders = [
    ...reminders.filter((r) => r.status === "unchecked"), // show unchecked first
    ...reminders.filter((r) => r.status === "checked"), // then checked
  ];

  const columns = [
    {
      title: "Done",
      dataIndex: "status",
      render: (checked, record) => (
        <Checkbox
          checked={record.status === "checked"}
          onChange={() => handleCheckReminder(record)}
        />
      ),
      width: 70,
    },
    {
      title: "Client",
      dataIndex: ["client", "first_name"], // nested field
      render: (_, record) => record.clients?.first_name || "—",
      width: 150,
    },
    {
      title: "Reminder Date",
      dataIndex: "reminderdate", // matches backend field
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "—"),
      width: 150,
    },
    {
      title: "Added On",
      dataIndex: "createdat_date",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "—"),
      width: 200,
    },
    {
      title: "Comments",
      dataIndex: "remindercomments",
      width: 200,
    },
    {
      title: "Last Remarks",
      dataIndex: "remarks",
      width: 200,
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f4f9ff" }}>
      {/* Sidebar should be here if you have one */}
      <div className="flex-1 p-6 sm:p-8 overflow-x-hidden w-full">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            Reminders
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <DatePicker
              value={selectedDate}
              onChange={(val) => setSelectedDate(val)}
              style={{ width: 160 }}
            />
            <Button onClick={handleToday}>Today</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddModal(true)}
            >
              Add Reminder
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <Alert
            message={successMsg}
            type="success"
            showIcon
            closable
            className="mb-4"
            onClose={() => setSuccessMsg("")}
          />
        )}
        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            className="mb-4"
            onClose={() => setErrorMsg("")}
          />
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            dataSource={sortedReminders}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </div>

        {/* Remark Modal */}
        <Modal
          title="Add Remarks"
          open={showRemarkModal}
          onOk={saveRemark}
          onCancel={() => setShowRemarkModal(false)}
        >
          <TextArea
            rows={4}
            placeholder="Enter remarks"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </Modal>

        {/* Add Reminder Modal */}
        <Modal
          title="Add New Reminder"
          open={showAddModal}
          onCancel={() => setShowAddModal(false)}
          onOk={() => {
            form
              .validateFields()
              .then((values) => handleAddReminder(values))
              .catch(() => {});
          }}
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Client"
              name="client"
              rules={[{ required: true, message: "Select client" }]}
            >
              <Select
                showSearch
                placeholder="Search client"
                filterOption={false}
                onSearch={fetchClients}
                loading={clientLoading}
              >
                {clientOptions.map((client) => (
                  <Option key={client.id} value={client.id}>
                    {client.first_name} ({client.phone})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Reminder Date"
              name="date"
              rules={[{ required: true, message: "Pick date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Comments"
              name="comments"
              rules={[{ required: true, message: "Enter comments" }]}
            >
              <TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Box>
  );
};

export default ReminderPage;
