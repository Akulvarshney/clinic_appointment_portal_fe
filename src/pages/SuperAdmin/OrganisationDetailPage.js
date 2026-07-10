import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Table, Typography, Switch, Button, Select, Row, Col, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import DataTable from "../../components/DataTable";
import {
  getOrganizationDetailsForSA,
  getOrganizationAdminTabs,
  updateOrganizationAdminTabs,
} from "../../services/superAdminOrgService";

const { Title, Text } = Typography;

const OrganisationDetailPage = () => {
  const { orgShortName } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [orgDetails, setOrgDetails] = useState(null);
  
  const [roleTabsData, setRoleTabsData] = useState([]);
  const [selectedTabId, setSelectedTabId] = useState(null);

  useEffect(() => {
    if (orgShortName) {
      fetchData();
    }
  }, [orgShortName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const detailsRes = await getOrganizationDetailsForSA(orgShortName);
      setOrgDetails(detailsRes.data);

      const tabsRes = await getOrganizationAdminTabs(orgShortName);
      const tabs = tabsRes.data?.tabs || [];
      setRoleTabsData(tabs);
      if (tabs.length > 0) {
        setSelectedTabId(tabs[0].tabId);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch organization details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (tabId, newValue) => {
    const updated = roleTabsData.map((tab) =>
      tab.tabId === tabId ? { ...tab, isValid: newValue } : tab
    );
    setRoleTabsData(updated);
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const payload = roleTabsData.map((tab) => ({
        tabId: tab.tabId,
        isValid: tab.isValid,
      }));

      await updateOrganizationAdminTabs(orgShortName, payload);
      message.success("Role Tabs Access updated successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to update Role Tabs Access");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !orgDetails) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spin tip="Loading organization details..." size="large" />
      </div>
    );
  }

  const { organization, metrics, admins } = orgDetails;

  const adminColumns = [
    { title: "Full Name", dataIndex: "full_name", key: "full_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Login ID", dataIndex: "login_id", key: "login_id" },
    { 
      title: "Created At", 
      dataIndex: "created_at", 
      key: "created_at",
      render: (text) => new Date(text).toLocaleDateString()
    },
  ];

  const tabColumns = [
    { title: "Tab Name", dataIndex: "tabName", key: "tabName" },
    {
      title: "Access",
      dataIndex: "isValid",
      key: "isValid",
      render: (_, record) => (
        <Switch
          checked={record.isValid}
          onChange={(checked) => handleToggle(record.tabId, checked)}
        />
      ),
    },
  ];

  return (
    <div className="min-w-0 max-w-full p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          {organization.name}
        </Title>
      </div>

      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <Title level={4}>Overview</Title>
        <Text type="secondary">
          Address: {organization.address || "N/A"} | State: {organization.state || "N/A"} | 
          Joined: {new Date(organization.created_at).toLocaleDateString()}
        </Text>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card title="Doctors" bordered={false} className="shadow-sm">
            <Text className="text-2xl font-bold">{metrics.doctors || 0}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Employees" bordered={false} className="shadow-sm">
            <Text className="text-2xl font-bold">{metrics.employees || 0}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Clients" bordered={false} className="shadow-sm">
            <Text className="text-2xl font-bold">{metrics.clients || 0}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card title="Appointments" bordered={false} className="shadow-sm">
            <Text className="text-2xl font-bold">{metrics.appointments || 0}</Text>
          </Card>
        </Col>
      </Row>

      <div className="mb-8">
        <Title level={4}>Organization Admins</Title>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
          <DataTable
            columns={adminColumns}
            dataSource={admins}
            rowKey="id"
            pagination={false}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={4} style={{ margin: 0 }}>Manage Role Tabs Access</Title>
          <Button type="primary" loading={saving} onClick={handleSavePermissions}>
            Save Changes
          </Button>
        </div>
        
        <Table
          columns={tabColumns}
          dataSource={roleTabsData}
          pagination={false}
          rowKey="tabId"
          bordered
        />
      </div>
    </div>
  );
};

export default OrganisationDetailPage;
