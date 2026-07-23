import React, { useEffect, useState } from "react";
import { Table, Switch, Button, Card, Space, Input, Select, Badge, Tooltip, Row, Col, Statistic, Typography, message, Tabs, Modal, Form, DatePicker, Upload } from "antd";
import { MessageOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, SearchOutlined, SafetyCertificateOutlined, DollarOutlined, CloudUploadOutlined, FileExcelOutlined, SendOutlined } from "@ant-design/icons";
import { getOrgWhatsappDashboard, getOrgWhatsappTemplates, toggleOrgWhatsappTemplate, getOrgWhatsappLogs } from "../services/whatsappService";
import { requestCustomTemplate, getCustomTemplates, scheduleCampaign, getCampaigns } from "../services/whatsappCampaignService";
import * as XLSX from "xlsx";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

    // Bulk Messaging
    const [customTemplates, setCustomTemplates] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Modals
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewMessageContent, setPreviewMessageContent] = useState("");
    const [templateForm] = Form.useForm();
    const [campaignForm] = Form.useForm();
    const [excelData, setExcelData] = useState([]);
    const [selectedTargetType, setSelectedTargetType] = useState(null);

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

    const fetchBulkData = async () => {
        if (!orgId) return;
        setBulkLoading(true);
        try {
            const [cTemplates, cCampaigns] = await Promise.all([
                getCustomTemplates(orgId),
                getCampaigns(orgId)
            ]);
            setCustomTemplates(cTemplates || []);
            setCampaigns(cCampaigns || []);
        } catch (err) {
            console.error("Error loading bulk data:", err);
            message.error("Failed to load bulk messaging data");
        } finally {
            setBulkLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) {
            fetchDashboard();
            fetchTemplates();
            fetchLogs(1);
            fetchBulkData();
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
            t.twilioTemplateId.toLowerCase().includes(templateSearch.toLowerCase())
    );

    const handlePreviewMessage = (text) => {
        setPreviewMessageContent(text);
        setIsPreviewModalOpen(true);
    };

    // Bulk Messaging Handlers
    const handleRequestTemplate = async (values) => {
        try {
            await requestCustomTemplate(orgId, values);
            message.success("Custom template requested successfully.");
            setIsTemplateModalOpen(false);
            templateForm.resetFields();
            fetchBulkData();
        } catch (error) {
            message.error("Failed to request template.");
        }
    };

    const handleScheduleCampaign = async (values) => {
        try {
            let targetData = [];
            if (values.targetType === "EXCEL_UPLOAD") {
                if (excelData.length === 0) {
                    return message.error("Please upload a valid Excel file containing phone numbers.");
                }
                targetData = excelData;
            }

            const payload = {
                customTemplateId: values.customTemplateId,
                scheduledAt: values.scheduledAt.toISOString(),
                targetType: values.targetType,
                targetData: targetData
            };

            await scheduleCampaign(orgId, payload);
            message.success("Campaign scheduled successfully.");
            setIsCampaignModalOpen(false);
            campaignForm.resetFields();
            setExcelData([]);
            fetchBulkData();
        } catch (error) {
            message.error("Failed to schedule campaign.");
        }
    };

    const handleExcelUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // Assuming the phone numbers are in the first column or labeled "Phone"
                // For simplicity, we just extract the first column of each row if it looks like a phone number or just string
                let numbers = [];
                for (let i = 1; i < jsonData.length; i++) { // Skip header
                    const row = jsonData[i];
                    if (row && row.length > 0 && row[0]) {
                        numbers.push(String(row[0]).trim());
                    }
                }

                if (numbers.length > 0) {
                    setExcelData(numbers);
                    message.success(`Successfully parsed ${numbers.length} numbers.`);
                } else {
                    message.error("No valid data found in the Excel file.");
                }
            } catch (error) {
                console.error("Excel parse error:", error);
                message.error("Failed to parse Excel file.");
            }
        };
        reader.readAsArrayBuffer(file);
        return false; // Prevent default upload
    };


    // Columns
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
            dataIndex: "twilioTemplateId",
            key: "twilioTemplateId",
            width: "20%",
            render: (text) => <Text type="secondary" style={{ fontSize: "12px" }}>{text}</Text>,
        },
        {
            title: "Message Body (Approved)",
            dataIndex: "body",
            key: "body",
            width: "35%",
            render: (text) => (
                <Button
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => handlePreviewMessage(text)}
                >
                    View Message
                </Button>
            ),
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
            render: (text) => (
                <Button
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => handlePreviewMessage(text)}
                >
                    View Message
                </Button>
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
                            <span style={{ display: 'inline-block', cursor: "pointer" }}>
                                <Badge status="error" text="Failed ⓘ" />
                            </span>
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

    const customTemplatesColumns = [
        {
            title: "Template Name",
            dataIndex: "template_name",
            key: "template_name",
        },
        {
            title: "Message Body",
            dataIndex: "message_body",
            key: "message_body",
            width: "40%",
            render: (text) => (
                <Button
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => handlePreviewMessage(text)}
                >
                    View Message
                </Button>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "orange";
                return <Badge color={color} text={status} />;
            }
        },
        {
            title: "Requested Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (text) => new Date(text).toLocaleDateString(),
        }
    ];

    const campaignsColumns = [
        {
            title: "Template",
            key: "template",
            render: (_, record) => record.custom_template?.template_name
        },
        {
            title: "Target Type",
            dataIndex: "target_type",
            key: "target_type",
            render: (text) => text.replace("_", " ")
        },
        {
            title: "Scheduled For",
            dataIndex: "scheduled_at",
            key: "scheduled_at",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color = status === "COMPLETED" ? "green" : status === "FAILED" ? "red" : "blue";
                return <Badge color={color} text={status} />;
            }
        }
    ];

    return (
        <div className="p-6 md:p-10 bg-gw-bg min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title level={2} style={{ color: "#111827", margin: 0, fontWeight: "800" }}>
                        WhatsApp Notification Center
                    </Title>
                    <Text type="secondary">Toggle Twilio approved templates, request bulk campaigns, and track history.</Text>
                </div>
                <Space>
                    <Button icon={<SyncOutlined />} onClick={() => { fetchDashboard(); fetchTemplates(); fetchLogs(1); fetchBulkData(); }}>
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
                                <SafetyCertificateOutlined /> Default Templates
                            </span>
                        }
                        key="templates"
                    >
                        <div className="mb-4 flex justify-between items-center">
                            <Text type="secondary">List of all system templates available for your clinic notifications.</Text>
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

                    {/* Tab 2: Bulk Messaging & Custom Templates */}
                    <Tabs.TabPane
                        tab={
                            <span>
                                <CloudUploadOutlined /> Bulk Messaging
                            </span>
                        }
                        key="bulk"
                    >
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <Title level={4} style={{ margin: 0 }}>Custom Templates</Title>
                                <Button type="primary" onClick={() => setIsTemplateModalOpen(true)}>Request New Template</Button>
                            </div>
                            <Table
                                dataSource={customTemplates}
                                columns={customTemplatesColumns}
                                rowKey="id"
                                loading={bulkLoading}
                                pagination={{ pageSize: 5 }}
                                size="small"
                            />
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <Title level={4} style={{ margin: 0 }}>Broadcast Campaigns</Title>
                                <Button type="primary" icon={<SendOutlined />} onClick={() => setIsCampaignModalOpen(true)}>Schedule Campaign</Button>
                            </div>
                            <Table
                                dataSource={campaigns}
                                columns={campaignsColumns}
                                rowKey="id"
                                loading={bulkLoading}
                                pagination={{ pageSize: 5 }}
                                size="small"
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* Tab 3: Message Logs History Tabular View */}
                    <Tabs.TabPane
                        tab={
                            <span>
                                <MessageOutlined /> Message History
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

            {/* Request Template Modal */}
            <Modal
                title="Request Custom Template"
                open={isTemplateModalOpen}
                onCancel={() => setIsTemplateModalOpen(false)}
                onOk={() => templateForm.submit()}
            >
                <Form form={templateForm} layout="vertical" onFinish={handleRequestTemplate}>
                    <Form.Item name="templateName" label="Template Name" rules={[{ required: true, message: 'Please enter a name for this template' }]}>
                        <Input placeholder="e.g. DIWALI_OFFER_2026" />
                    </Form.Item>
                    <Form.Item name="messageBody" label="Message Body (Static Text Only)" rules={[{ required: true, message: 'Please enter the message body' }]}>
                        <TextArea rows={4} placeholder="Enter your static message here without any variables." />
                    </Form.Item>
                    <Text type="secondary">Note: Custom templates require approval from Glorywellnic before they can be used in campaigns.</Text>
                </Form>
            </Modal>

            {/* Message Preview Modal */}
            <Modal
                title="WhatsApp Message Preview"
                open={isPreviewModalOpen}
                onCancel={() => setIsPreviewModalOpen(false)}
                footer={null}
                centered
                width={380}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
                    <div style={{
                        width: '320px',
                        height: '620px',
                        border: '14px solid #333',
                        borderRadius: '36px',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#efeae2',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        {/* Phone Camera Notch */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '120px',
                            height: '25px',
                            backgroundColor: '#333',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px',
                            zIndex: 10
                        }}></div>

                        {/* WhatsApp Header */}
                        <div style={{
                            backgroundColor: '#075e54',
                            color: 'white',
                            padding: '35px 15px 10px 15px', // extra top padding for the notch
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            Glorywellnic
                        </div>

                        {/* WhatsApp Message Area */}
                        <div style={{
                            padding: '20px 15px',
                            display: 'flex',
                            flexDirection: 'column',
                            height: 'calc(100% - 140px)',
                            overflowY: 'auto'
                        }}>
                            <div style={{
                                backgroundColor: '#dcf8c6',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                borderTopLeftRadius: '0px',
                                alignSelf: 'flex-start',
                                maxWidth: '90%',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                fontSize: '10px',
                                color: '#111',
                                boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
                            }}>
                                {previewMessageContent}
                            </div>
                        </div>

                        {/* WhatsApp Input Area (Mock) */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '10px',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                flex: 1,
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '10px 15px',
                                color: '#888',
                                fontSize: '14px'
                            }}>
                                Message
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#128C7E',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'white'
                            }}>
                                <SendOutlined />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Schedule Campaign Modal */}
            <Modal
                title="Schedule Broadcast Campaign"
                open={isCampaignModalOpen}
                onCancel={() => setIsCampaignModalOpen(false)}
                onOk={() => campaignForm.submit()}
            >
                <Form form={campaignForm} layout="vertical" onFinish={handleScheduleCampaign}>
                    <Form.Item name="customTemplateId" label="Select Approved Template" rules={[{ required: true }]}>
                        <Select placeholder="Select a template">
                            {customTemplates.filter(t => t.status === "APPROVED").map(t => (
                                <Option key={t.id} value={t.id}>{t.template_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="scheduledAt" label="Scheduled Date & Time" rules={[{ required: true }]}>
                        <DatePicker showTime style={{ width: '100%' }} disabledDate={d => !d || d.isBefore(moment().startOf('day'))} />
                    </Form.Item>
                    <Form.Item name="targetType" label="Target Audience" rules={[{ required: true }]}>
                        <Select placeholder="Select audience" onChange={(val) => setSelectedTargetType(val)}>
                            <Option value="ALL_CLIENTS">All Associated Clients</Option>
                            {/* <Option value="SELECTED_CLIENTS">Select Few Clients</Option> */}
                            <Option value="EXCEL_UPLOAD">Upload Excel of Numbers</Option>
                        </Select>
                    </Form.Item>

                    {selectedTargetType === "EXCEL_UPLOAD" && (
                        <Form.Item label="Upload Excel File">
                            <Upload beforeUpload={handleExcelUpload} accept=".xlsx, .xls, .csv" maxCount={1}>
                                <Button icon={<FileExcelOutlined />}>Click to Upload Excel</Button>
                            </Upload>
                            {excelData.length > 0 && <div className="mt-2 text-green-600">{excelData.length} numbers ready.</div>}
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default WhatsappManagementPage;