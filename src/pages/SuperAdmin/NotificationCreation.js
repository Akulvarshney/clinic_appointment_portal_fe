// NotificationManagement.jsx
import React, { useEffect, useState } from "react";
import { Table, Switch, Button, Modal, Form, Input, message, Spin } from "antd";
import axios from "axios";
import { BACKEND_URL } from "../../assets/constants"

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/admin/newApplication/getSAnotifications`);
      setNotifications(res.data.data || []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);


  const handleToggle = async (id, currentValue) => {
    setToggleLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.patch(`${BACKEND_URL}/admin/newApplication/changeNotificationStatus?id=${id}`, {
        enabled: !currentValue,
      });
      message.success("Notification updated");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_valid: !currentValue } : n))
      );
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update notification");
    } finally {
      setToggleLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSave = async () => { 
    try {
      const values = await form.validateFields();
      setSaving(true);
      await axios.post(`${BACKEND_URL}/admin/newApplication/createNotification`, values);
      message.success("Notification created successfully");
      setModalVisible(false);
      form.resetFields();
      fetchNotifications();
    } catch (err) {
      if (err.response) {
        message.error(err.response?.data?.message || "Failed to create notification");
      } else if (err.errorFields) {
        // validation error
      } else {
        message.error("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "is_valid",
      key: "enabled",
      render: (_, record) => (
        <Spin spinning={toggleLoading[record.id] || false}>
          <Switch
            checked={record.is_valid}
            onChange={() => handleToggle(record.id, record.is_valid)}
          />
        </Spin>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Add Notification
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={notifications}
        loading={loading}
      />

      <Modal
        title="Add Notification"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Notification Name"
            rules={[{ required: true, message: "Please enter notification name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="uniqueName"
            label="Notification Unique Name"
            rules={[{ required: true, message: "Please enter Unique notification name" }]}
          >
            <Input placeholder="Enter Unique name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Notification Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea placeholder="Enter description" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationManagement;
