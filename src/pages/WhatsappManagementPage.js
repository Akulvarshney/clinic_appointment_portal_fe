import React, { useEffect, useState } from "react";
import { Table, Switch, Button, Card, Space, Input, Select, Badge, Tooltip, Row, Col, Statistic, Typography, Spin, message, Tabs } from "antd";
import { MessageOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, SearchOutlined, SafetyCertificateOutlined, DollarOutlined } from "@ant-design/icons";
import { getOrgWhatsappDashboard, getOrgWhatsappTemplates, toggleOrgWhatsappTemplate, getOrgWhatsappLogs } from "../services/whatsappService";

const { Title, Text } = Typography;
const { Option } = Select;

const WhatsappManagementPage = () => {
    const orgId = localStorage.getItem("selectedOrgId");

    // Dashboard Stats
    const [dashboardStats, setDashboardStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Templates
    const [templates, setTemplates] = useState([]);
    const [templateSearch, setTemplateSearch] = useState("");
    const [templatesLoading, setTemplatesLoading] = useState(false);

    // Logs
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logSearch, setLogSearch] = useState("");
    const [logStatus, setLogStatus] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchDashboard = async () => {
        if (!orgId) return;
        setStatsLoading(true);
        try {
            const stats = await getOrgWhatsappDashboard(orgId);
            setDashboardStats(stats);
        } catch (err) {
            console.error("Error loading WhatsApp dashboard stats:", err);
            message.error("Failed to load WhatsApp statistics");
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchTemplates = async () => {
        if (!orgId) return;
        setTemplatesLoading(true);
        try {
            const data = await getOrgWhatsappTemplates(orgId);
            setTemplates(data || []);
        } catch (err) {
            console.error("Error loading templates:", err);
            message.error("Failed to load message templates");
        } finally {
            setTemplatesLoading(false);
        }
    };

    const fetchLogs = async (page = 1, statusVal = logStatus, searchVal = logSearch) => {
        if (!orgId) return;
        setLogsLoading(true);
        try {
            const data = await getOrgWhatsappLogs(orgId, {
                page,
                limit: pagination.pageSize,
                status: statusVal || undefined,
                search: searchVal || undefined,
            });

            setLogs(data?.logs || []);
            setPagination((prev) => ({
                ...prev,
                current: page,
                total: data?.pagination?.total || 0,
            }));
        } catch (err) {
            console.error("Error loading logs:", err);
            message.error("Failed to load message log history");
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            fetchDashboard();
            fetchTemplates();
            fetchLogs(1);
        }
    }, [orgId]);

    const handleToggleTemplate = async (templateId, checked) => {
        try {
            await toggleOrgWhatsappTemplate(templateId, orgId, checked);
            message.success(`Template successfully ${checked ? "enabled" : "disabled"}`);
            fetchTemplates();
        } catch (error) {
            message.error("Failed to toggle template status");
        }
    };

    const handleTableChange = (p) => {
        fetchLogs(p.current);
    };

    const handleLogSearchChange = (e) => {
        const val = e.target.value;
        setLogSearch(val);
        fetchLogs(1, logStatus, val);
    };

    const handleLogStatusChange = (val) => {
        setLogStatus(val);
        fetchLogs(1, val, logSearch);
    };

    // Filter templates list based on search term
    const filteredTemplates = templates.filter(
        (t) =>
            t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
            t.body.toLowerCase().includes(templateSearch.toLowerCase()) ||
            t.twilioTemplateName.toLowerCase().includes(templateSearch.toLowerCase())
    );

    // Columns for Templates Table
    const templatesColumns = [
        {
            title: "Trigger Action",
            dataIndex: "name",
            key: "name",
            width: "25%",
            render: (text) => <span style={{ fontWeight: "600", color: "#1F2937" }}>{text}</span>,
        },
        {
            title: "Twilio Template Name",
            dataIndex: "twilioTemplateName",
            key: "twilioTemplateName",
            width: "20%",
            render: (text) => <Text type="secondary" style={{ fontSize: "12px" }}>{text}</Text>,
        },
        {
            title: "Message Body (Approved)",
            dataIndex: "body",
            key: "body",
            width: "35%",
            render: (text) => <Text style={{ fontStyle: "italic", whiteSpace: "pre-wrap", fontSize: "12px" }}>{text}</Text>,
        },
        {
            title: "Credit Cost",
            dataIndex: "creditCost",
            key: "creditCost",
            width: "10%",
            render: (credits) => <Badge count={`${credits} cr`} style={{ backgroundColor: "#3B82F6" }} />,
        },
        {
            title: "Active Toggle",
            dataIndex: "isActive",
            key: "isActive",
            width: "10%",
            render: (isActive, record) => (
                <Switch
                    checkedChildren="On"
                    unCheckedChildren="Off"
                    checked={isActive}
                    onChange={(checked) => handleToggleTemplate(record.id, checked)}
                />
            ),
        },
    ];

    // Columns for Logs Table
    const logsColumns = [
        {
            title: "Client Name",
            dataIndex: "clientName",
            key: "clientName",
            render: (text) => <span style={{ fontWeight: "500" }}>{text}</span>,
        },
        {
            title: "Phone Number",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            render: (text) => <Text copyable>{text}</Text>,
        },
        {
            title: "Action / Template",
            dataIndex: "templateName",
            key: "templateName",
            render: (text) => <Badge status="processing" text={text} />,
        },
        {
            title: "Message Body",
            dataIndex: "messageBody",
            key: "messageBody",
            ellipsis: { showTitle: false },
            render: (text) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        },
        {
            title: "Credits",
            dataIndex: "creditsDeducted",
            key: "creditsDeducted",
            render: (credits) => <span style={{ color: "#EF4444", fontWeight: "600" }}>-{credits.toFixed(1)}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status, record) => {
                if (status === "SUCCESS") {
                    return <Badge status="success" text="Success" />;
                } else if (status === "FAILED") {
                    return (
                        <Tooltip title={record.errorMessage || "Unknown error"}>
                            <Badge status="error" text="Failed ⓘ" style={{ cursor: "pointer" }} />
                        </Tooltip>
                    );
                }
                return <Badge status="warning" text="Pending" />;
            },
        },
        {
            title: "Sent Date & Time",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString(),
        },
    ];

    return (
        <div className="p-6 md:p-10 bg-gw-bg min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title level={2} style={{ color: "#111827", margin: 0, fontWeight: "800" }}>
                        WhatsApp Notification Center
                    </Title>
                    <Text type="secondary">Toggle Twilio approved templates and track remaining message credits.</Text>
                </div>
                <Space>
                    <Button icon={<SyncOutlined />} onClick={() => { fetchDashboard(); fetchTemplates(); fetchLogs(1); }}>
                        Refresh Data
                    </Button>
                </Space>
            </div>

            {/* Metrics Cards */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border border-gray-100 rounded-xl" loading={statsLoading}>
                        <Statistic
                            title="Remaining Credits"
                            value={dashboardStats?.whatsappCredits ?? 0}
                            precision={1}
                            valueStyle={{ color: (dashboardStats?.whatsappCredits ?? 0) > 15 ? "#10B981" : "#EF4444", fontWeight: "700" }}
                            prefix={<DollarOutlined />}
                        />
                        {/* <div className="mt-2">
              <Text type="secondary" size="small">
                Value per credit: <strong>${dashboardStats?.creditValue?.toFixed(2) ?? "1.00"}</strong>
              </Text>
            </div> */}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border border-gray-100 rounded-xl" loading={statsLoading}>
                        <Statistic
                            title="Sent Messages"
                            value={dashboardStats?.statistics?.SUCCESS ?? 0}
                            valueStyle={{ color: "#10B981", fontWeight: "700" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border border-gray-100 rounded-xl" loading={statsLoading}>
                        <Statistic
                            title="Failed Messages"
                            value={dashboardStats?.statistics?.FAILED ?? 0}
                            valueStyle={{ color: "#EF4444", fontWeight: "700" }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border border-gray-100 rounded-xl" loading={statsLoading}>
                        <Statistic
                            title="Pending Queue"
                            value={dashboardStats?.statistics?.PENDING ?? 0}
                            valueStyle={{ color: "#F59E0B", fontWeight: "700" }}
                            prefix={<SyncOutlined spin={dashboardStats?.statistics?.PENDING > 0} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Tabbed Tabular Views */}
            <Card className="shadow-sm border border-gray-100 rounded-xl" bodyStyle={{ padding: "20px" }}>
                <Tabs defaultActiveKey="templates" size="large" animated={{ inkBar: true, tabPane: true }}>
                    {/* Tab 1: WhatsApp Templates Tabular View */}
                    <Tabs.TabPane
                        tab={
                            <span>
                                <SafetyCertificateOutlined /> Default WhatsApp Templates
                            </span>
                        }
                        key="templates"
                    >
                        <div className="mb-4 flex justify-between items-center">
                            <Text type="secondary">List of all templates available for your clinic notifications.</Text>
                            <Input
                                placeholder="Search templates..."
                                prefix={<SearchOutlined />}
                                value={templateSearch}
                                onChange={(e) => setTemplateSearch(e.target.value)}
                                style={{ width: 250 }}
                            />
                        </div>
                        <Table
                            dataSource={filteredTemplates}
                            columns={templatesColumns}
                            rowKey="id"
                            loading={templatesLoading}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 800 }}
                            size="middle"
                        />
                    </Tabs.TabPane>

                    {/* Tab 2: Message Logs History Tabular View */}
                    <Tabs.TabPane
                        tab={
                            <span>
                                <MessageOutlined /> Message History Logs
                            </span>
                        }
                        key="logs"
                    >
                        <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
                            <Text type="secondary">Detailed audit logs of sent, pending, and failed WhatsApp notifications.</Text>
                            <Space wrap>
                                <Input
                                    placeholder="Search phone or name..."
                                    prefix={<SearchOutlined />}
                                    value={logSearch}
                                    onChange={handleLogSearchChange}
                                    style={{ width: 220 }}
                                />
                                <Select
                                    placeholder="Status"
                                    value={logStatus}
                                    onChange={handleLogStatusChange}
                                    style={{ width: 130 }}
                                    allowClear
                                >
                                    <Option value="SUCCESS">Success</Option>
                                    <Option value="FAILED">Failed</Option>
                                    <Option value="PENDING">Pending</Option>
                                </Select>
                            </Space>
                        </div>
                        <Table
                            dataSource={logs}
                            columns={logsColumns}
                            rowKey="id"
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                showSizeChanger: false,
                            }}
                            loading={logsLoading}
                            onChange={handleTableChange}
                            scroll={{ x: 900 }}
                            size="middle"
                        />
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default WhatsappManagementPage;