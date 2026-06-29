import React, { useState, useEffect } from "react";
import {
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
import DataTable from "../components/DataTable";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";

import { BACKEND_URL } from "../assets/constants";
import { PALETTE } from "../theme/palette";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadRange, setDownloadRange] = useState(null);
  const [downloading, setDownloading] = useState(false);

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
            date: selectedDate.startOf("day").format("YYYY-MM-DD"),
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
    console.log("sidd", reminder);
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
        `${BACKEND_URL}/clientadmin/reminderManagement/updateReminder?id=${currentReminder.uuid}`,
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
          reminderdate: values.date.startOf("day").format("YYYY-MM-DD"),
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

  const handleDownloadReminders = async () => {
    if (!downloadRange || !downloadRange[0] || !downloadRange[1]) {
      message.error("Please select a from and to date");
      return;
    }
    try {
      setDownloading(true);
      const response = await axios.get(
        `${BACKEND_URL}/clientadmin/reminderManagement/downloadReminder`,
        {
          params: {
            orgId,
            fromDate: downloadRange[0].format("YYYY-MM-DD"),
            toDate: downloadRange[1].format("YYYY-MM-DD"),
          },
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const disposition =
        response.headers?.["content-disposition"] ||
        response.headers?.["Content-Disposition"] ||
        "";
      const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(
        disposition
      );
      const filename =
        match && match[1]
          ? decodeURIComponent(match[1].trim())
          : `reminders_${dayjs().format("DD-MMM-YY_HH:mm")}.xlsx`;

      const blob = new Blob([response.data], {
        type:
          response.data?.type ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Reminders downloaded successfully");
      setShowDownloadModal(false);
      setDownloadRange(null);
    } catch (error) {
      console.error("Error downloading reminders:", error);
      message.error("Failed to download reminders");
    } finally {
      setDownloading(false);
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
      dataIndex: "remindercompletedremarks",
      width: 200,
    },
  ];

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
      <div className="min-w-0 w-full flex-1 overflow-x-hidden px-3 py-4 sm:px-6 sm:py-8">
        {/* Top Bar */}
        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <h1 className="m-0 shrink-0 text-xl font-bold text-gw-primary-dark sm:text-2xl lg:text-3xl">
            Reminders
          </h1>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
            <div className="w-full sm:w-40">
              <DatePicker
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                className="!w-full"
              />
            </div>
            <Button onClick={handleToday} className="w-full sm:w-auto">
              Today
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setShowDownloadModal(true)}
              className="w-full sm:w-auto"
            >
              Download Reminders
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto"
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
        <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
          <DataTable
            columns={columns}
            dataSource={sortedReminders}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </div>

        {/* Download Reminders Modal */}
        <Modal
          title="Download Reminders"
          open={showDownloadModal}
          onOk={handleDownloadReminders}
          onCancel={() => {
            setShowDownloadModal(false);
            setDownloadRange(null);
          }}
          okText="Download"
          confirmLoading={downloading}
          okButtonProps={{ icon: <DownloadOutlined /> }}
        >
          <p className="mb-2 text-gw-ink-3">
            Select a date range to download reminders.
          </p>
          <RangePicker
            value={downloadRange}
            onChange={(val) => setDownloadRange(val)}
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
          />
        </Modal>

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
              .catch(() => { });
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
