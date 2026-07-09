import React, { useEffect, useState } from "react";
import { Table, Switch, Button, Modal, InputNumber, Card, Form, Space, message, Spin, Typography } from "antd";
import { CreditCardOutlined, SafetyOutlined, SettingOutlined } from "@ant-design/icons";
import {
  getSAOrganizationsWhatsapp,
  toggleWhatsappForOrg,
  addCreditsToOrg,
  getGlobalCreditRate,
  updateGlobalCreditRate,
} from "../../services/whatsappService";

const { Title, Text } = Typography;

const WhatsappManagementSA = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creditRate, setCreditRate] = useState(1.0);
  const [rateLoading, setRateLoading] = useState(false);
  
  // Modal states
  const [creditsModalVisible, setCreditsModalVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState(100);
  const [creditingLoading, setCreditingLoading] = useState(false);

  const fetchSAData = async () => {
    setLoading(true);
    try {
      const data = await getSAOrganizationsWhatsapp();
      setOrganizations(data || []);
    } catch (error) {
      console.error("Error loading SA organizations:", error);
      message.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalRate = async () => {
    setRateLoading(true);
    try {
      const data = await getGlobalCreditRate();
      setCreditRate(data?.creditValue ?? 1.0);
    } catch (error) {
      console.error("Error loading global credit rate:", error);
    } finally {
      setRateLoading(false);
    }
  };

  useEffect(() => {
    fetchSAData();
    fetchGlobalRate();
  }, []);

  const handleToggleWhatsapp = async (orgId, checked) => {
    try {
      await toggleWhatsappForOrg(orgId, checked);
      message.success(`WhatsApp notifications ${checked ? "enabled" : "disabled"} successfully`);
      fetchSAData();
    } catch (error) {
      message.error("Failed to update WhatsApp feature state");
    }
  };

  const handleSaveRate = async (values) => {
    setRateLoading(true);
    try {
      await updateGlobalCreditRate(values.creditValue);
      message.success("Global credit value rate updated successfully");
      fetchGlobalRate();
    } catch (error) {
      message.error("Failed to save global credit rate");
    } finally {
      setRateLoading(false);
    }
  };

  const handleAddCreditsSubmit = async () => {
    if (!selectedOrg || creditsToAdd <= 0) return;
    setCreditingLoading(true);
    try {
      await addCreditsToOrg(selectedOrg.id, creditsToAdd);
      message.success(`Successfully added ${creditsToAdd} credits to ${selectedOrg.name}`);
      setCreditsModalVisible(false);
      setSelectedOrg(null);
      setCreditsToAdd(100);
      fetchSAData();
    } catch (error) {
      message.error("Failed to top up credit balance");
    } finally {
      setCreditingLoading(false);
    }
  };

  const columns = [
    {
      title: "Organization Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: "600", color: "#1F2937" }}>{text}</span>,
    },
    {
      title: "Short Name",
      dataIndex: "shortorgname",
      key: "shortorgname",
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: "Feature Toggle",
      dataIndex: "whatsapp_enabled",
      key: "whatsapp_enabled",
      render: (enabled, record) => (
        <Switch
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
          checked={enabled}
          onChange={(checked) => handleToggleWhatsapp(record.id, checked)}
        />
      ),
    },
    {
      title: "Credits Balance",
      dataIndex: "whatsapp_credits",
      key: "whatsapp_credits",
      render: (credits) => (
        <span style={{ fontWeight: "bold", color: credits > 10 ? "#10B981" : "#EF4444" }}>
          {credits.toFixed(1)}
        </span>
      ),
    },
    {
      title: "Total Messages Sent",
      dataIndex: ["_count", "whatsapp_logs"],
      key: "logs_count",
      render: (count) => <Text>{count || 0}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="default"
          icon={<CreditCardOutlined />}
          onClick={() => {
            setSelectedOrg(record);
            setCreditsModalVisible(true);
          }}
          disabled={!record.whatsapp_enabled}
        >
          Add Credits
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-10 bg-[#FAFBFC] min-h-screen">
      <div className="mb-8">
        <Title level={2} style={{ color: "#111827", margin: 0, fontWeight: "800" }}>
          WhatsApp System Management
        </Title>
        <Text type="secondary">Portal Admin view to control WhatsApp configurations, organization toggles, and credits top-ups.</Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card
          title={
            <span className="flex items-center gap-2 text-gw-primary-dark">
              <SettingOutlined /> Global Credit Configuration
            </span>
          }
          className="shadow-sm border border-gray-100 rounded-xl"
        >
          <Form
            layout="vertical"
            initialValues={{ creditValue: creditRate }}
            key={creditRate}
            onFinish={handleSaveRate}
          >
            <Form.Item
              name="creditValue"
              label="Value of 1 Credit (Currency units)"
              rules={[{ required: true, message: "Please input credit conversion rate" }]}
              extra="Defines how much money 1 WhatsApp credit is valued at in your billing reports."
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0.01}
                step={0.05}
                precision={2}
                disabled={rateLoading}
              />
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <Button type="primary" htmlType="submit" loading={rateLoading} block>
                Update Credit Value
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2 text-gw-primary-dark">
              <SafetyOutlined /> WhatsApp Integration Status
            </span>
          }
          className="shadow-sm border border-gray-100 rounded-xl lg:col-span-2"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text type="secondary">Total Clients Enabled</Text>
              <Title level={3} style={{ margin: "8px 0 0 0" }}>
                {organizations.filter((o) => o.whatsapp_enabled).length}
              </Title>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text type="secondary">Total Credits Distributed</Text>
              <Title level={3} style={{ margin: "8px 0 0 0", color: "#10B981" }}>
                {organizations.reduce((sum, o) => sum + (o.whatsapp_credits || 0), 0).toFixed(0)}
              </Title>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text type="secondary">Total Messages Logs</Text>
              <Title level={3} style={{ margin: "8px 0 0 0", color: "#3B82F6" }}>
                {organizations.reduce((sum, o) => sum + (o._count?.whatsapp_logs || 0), 0)}
              </Title>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Tenant Organizations WhatsApp Details"
        className="shadow-sm border border-gray-100 rounded-xl"
      >
        {loading ? (
          <div className="text-center py-10">
            <Spin tip="Fetching tenant details..." />
          </div>
        ) : (
          <Table
            dataSource={organizations}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      {/* Add Credits Modal */}
      <Modal
        title={`Add Credits: ${selectedOrg?.name}`}
        open={creditsModalVisible}
        onOk={handleAddCreditsSubmit}
        onCancel={() => {
          setCreditsModalVisible(false);
          setSelectedOrg(null);
        }}
        confirmLoading={creditingLoading}
        destroyOnClose
      >
        <div className="py-4">
          <p className="mb-4">
            Current Credit Balance: <strong>{selectedOrg?.whatsapp_credits?.toFixed(1)} credits</strong>
          </p>
          <Form layout="vertical">
            <Form.Item label="Amount of Credits to add">
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                max={10000}
                value={creditsToAdd}
                onChange={setCreditsToAdd}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default WhatsappManagementSA;
