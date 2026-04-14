// RoleManagement.js
import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Alert,
  Switch,
  Spin,
} from "antd";
import DataTable from "../components/DataTable";
import axios from "axios";
import { BACKEND_URL } from "../assets/constants";
import { useNotification } from "../utils/messageWrapper";

const RoleManagement = () => {
  const notification = useNotification();
  const [roles, setRoles] = useState([]);
  const [selectedRoleData, setSelectedRoleData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [selectedTabId, setSelectedTabId] = useState(null);
  const [baselineRoleData, setBaselineRoleData] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");

  const fetchRoles = async () => {
    setTableLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/clientAdmin/userMgmt/getRoles?orgId=${orgId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
         const filteredRoles = (response.data.response || []).filter(
          (role) => !(role.is_deletable === false && role.description === "DEFAULT ADMIN" && role.is_admin===true)
        );
        setRoles(filteredRoles|| []);
      } else {
        message.error("Failed to fetch roles.");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      message.error("Something went wrong while fetching roles.");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchAllTabsAndFeatureOfRole = async (roleId) => {
    setTableLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/clientAdmin/userMgmt/getTabsAndFeaturesByRole?roleId=${roleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        const data = response.data.data || [];
        setSelectedRoleData(data);
        setBaselineRoleData(data);
        setSelectedTabId(data?.[0]?.tabId ?? null);
      } else {
        message.error("Failed to fetch role features.");
      }
    } catch (err) {
      console.error("Error fetching role features:", err);
      message.error("Something went wrong while fetching features.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggle = (tabId, featureId, newValue) => {
    const updated = selectedRoleData.map((tab) => {
      if (tab.tabId === tabId) {
        return {
          ...tab,
          features: tab.features.map((feature) =>
            feature.featureId === featureId
              ? { ...feature, isValid: newValue }
              : feature
          ),
        };
      }
      return tab;
    });
    setSelectedRoleData(updated);
  };

  const handleCreateRole = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/clientAdmin/userMgmt/createRole`,
        {
          roleName: values.roleName,
          roleDesc: values.roleDescription,
          orgId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201 || response.status === 200) {
        message.success("Role added successfully.");
        form.resetFields();
        setModalVisible(false);
        setErrorMsg("");
        setSuccessMsg("Role created successfully.");
        fetchRoles(); // Refresh table
      } else {
        message.error("Failed to add role.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setSuccessMsg("");
      setErrorMsg("Please try again later or with another Role Name");
      message.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRoleFeatureUpdates = async ({ closeAfterSave = true } = {}) => {
    setIsSubmitting(true);
    try {
      const payload = {
        roleId: editingRole.id,
        tabFeatureMapping: selectedRoleData.map((tab) => ({
          tabId: tab.tabId,
          features: tab.features.map((feature) => ({
            featureId: feature.featureId,
            isValid: feature.isValid,
          })),
        })),
      };

      await axios.post(
        `${BACKEND_URL}/clientAdmin/userMgmt/updateTabAndFeatureAccess`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Permissions updated successfully");
      setBaselineRoleData(selectedRoleData);
      if (closeAfterSave) {
        setEditModalVisible(false);
        setSelectedRoleData([]);
        setEditingRole(null);
        setSelectedTabId(null);
        setBaselineRoleData(null);
      }
      fetchRoles();
    } catch (error) {
      console.error("Error submitting features:", error);
      message.error("Failed to update role features");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabOptions = selectedRoleData.map((tab) => ({
    label: tab.tabName,
    value: tab.tabId,
  }));

  const isDirty = (() => {
    if (!baselineRoleData) return false;
    const pick = (data) =>
      (data || []).map((t) => ({
        tabId: t.tabId,
        features: (t.features || []).map((f) => ({
          featureId: f.featureId,
          isValid: Boolean(f.isValid),
        })),
      }));
    try {
      return JSON.stringify(pick(selectedRoleData)) !== JSON.stringify(pick(baselineRoleData));
    } catch {
      return true;
    }
  })();

  const handleTabChange = (nextTabId) => {
    if (!isDirty) {
      setSelectedTabId(nextTabId);
      return;
    }

    notification?.error?.({
      message: "Unsaved changes",
      description: "Please save permission changes before switching tabs.",
      placement: "topRight",
    });
  };

  const tableData = selectedRoleData
    .filter((tab) => (selectedTabId ? tab.tabId === selectedTabId : true))
    .flatMap((tab) =>
      tab.features.map((feature) => ({
        key: `${tab.tabId}-${feature.featureId}`,
        tabName: tab.tabName,
        featureName: feature.featureName,
        isValid: feature.isValid,
        tabId: tab.tabId,
        featureId: feature.featureId,
      }))
    );

  const roleColumns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Role Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button
          type="link"
          onClick={async () => {
            setEditingRole(record);
            await fetchAllTabsAndFeatureOfRole(record.id);
            setEditModalVisible(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="min-w-0 max-w-full">
      {/* Header */}
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="m-0 text-xl font-semibold sm:text-2xl">
          Role Management
        </h1>
        <Button
          type="primary"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => setModalVisible(true)}
        >
          Create Role
        </Button>
      </div>

      {/* Table */}
      <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
        <DataTable
          columns={roleColumns}
          dataSource={roles}
          loading={tableLoading}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </div>

      {/* Create Role Modal */}
      <Modal
        title="Create New Role"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setErrorMsg("");
          setSuccessMsg("");
        }}
        footer={null}
      >
        <div className="modal_outDiv">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateRole}
            autoComplete="off"
          >
            <Form.Item
              label="Role Name"
              name="roleName"
              rules={[{ required: true, message: "Role name is required" }]}
            >
              <Input placeholder="Enter role name" />
            </Form.Item>

            <Form.Item
              label="Role Description"
              name="roleDescription"
              rules={[
                { required: true, message: "Role description is required" },
              ]}
            >
              <Input placeholder="Enter role description" />
            </Form.Item>

            {errorMsg && (
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {successMsg && (
              <Alert
                message={successMsg}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting}
              >
                Save Role
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title={`Edit Role: ${editingRole?.name}`}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedRoleData([]);
          setEditingRole(null);
          setSelectedTabId(null);
          setBaselineRoleData(null);
        }}
        centered
        styles={{
          content: {
            width: "min(800px, calc(100vw - 24px))",
            maxWidth: "100%",
          },
          body: { maxHeight: "60vh", overflowY: "auto" },
        }}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => handleSubmitRoleFeatureUpdates({ closeAfterSave: true })}
            loading={isSubmitting}
          >
            Submit Changes
          </Button>,
        ]}
      >
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-gray-700">Tab</div>
          <Select
            className="w-full sm:w-[340px]"
            placeholder="Select a tab"
            value={selectedTabId}
            options={tabOptions}
            onChange={handleTabChange}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <DataTable
          columns={[
            {
              title: "Feature Name",
              dataIndex: "featureName",
              key: "featureName",
            },
            {
              title: "Access",
              dataIndex: "isValid",
              key: "isValid",
              render: (_, record) => (
                <Switch
                  checked={record.isValid}
                  onChange={(checked) =>
                    handleToggle(record.tabId, record.featureId, checked)
                  }
                />
              ),
            },
          ]}
          dataSource={tableData}
          pagination={false}
          scroll={{ y: 300 }}
          loading={tableLoading}
        />
      </Modal>
    </div>
  );
};

export default RoleManagement;
