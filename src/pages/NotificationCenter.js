import React, { useState, useEffect } from "react";
import { Switch, message, Spin } from "antd";
import DataTable from "../components/DataTable";
import axios from "axios";
import { BACKEND_URL } from "../assets/constants";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/clientAdmin/userMgmt/getNotificationsByOrg/${localStorage.getItem(
          "selectedOrgId"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleToggle = async (checked, record) => {
    try {
      await axios.put(
        `${BACKEND_URL}/clientAdmin/userMgmt/updateNotification?id=${record.id}`,
        { is_active: checked },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, is_active: checked } : item
        )
      );

      fetchNotifications();

      message.success(
        `Notification "${record.name}" has been ${
          checked ? "activated" : "deactivated"
        }`
      );
    } catch (error) {
      console.error("Error updating notification:", error);
      message.error("Failed to update notification status");
    }
  };

  const columns = [
    {
      title: "Notification Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (_, record) => (
        <Switch
          checked={record.is_active}
          onChange={(checked) => handleToggle(checked, record)}
        />
      ),
    },
  ];

  return (
    <div className="gw-page-content min-w-0">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
          <DataTable
            columns={columns}
            dataSource={notifications}
            rowKey="id"
            pagination={false}
            scroll={{ x: 640 }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
