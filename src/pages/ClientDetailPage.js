import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { BACKEND_URL, isFeatureValid, states } from "../assets/constants";
import { PALETTE } from "../theme/palette";
import {
  Card,
  Avatar,
  Tag,
  Badge,
  Button,
  Timeline,
  Statistic,
  Empty,
  Divider,
  message,
  Pagination,
  Select,
  Input,
  DatePicker,
  Modal,
  Form,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { Search } = Input;

const ClientDetailPage = () => {
  const { clientId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  console.log("Client ID:", clientId);
  const token = localStorage.getItem("token");
  const [clientData, setClientData] = React.useState(null);

  // Edit functionality state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Appointment filtering and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const response1 = isFeatureValid("CLIENT_LISTING", "VIEW_MOBILE");
    setIsMobileView(response1);
    console.log("isFeatureValid response:", response1);
  }, []);

  const commingSoon = () => {
    messageApi.info("This feature is coming soon!");
  };

  const fetchClientData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/patient/clients/clientDetails/${clientId}?orgId=${localStorage.getItem(
          "selectedOrgId"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );
      setClientData(response.data.data);
    } catch (error) {
      console.error(
        "Error fetching client data:",
        error.response?.data || error.message
      );
      messageApi.error("Failed to fetch client data");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/clientadmin/userMgmt/category?organization_id=${localStorage.getItem(
          "selectedOrgId"
        )}&is_valid=true`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status !== 200) {
        throw new Error("Failed to fetch categories");
      }
      console.log("Categories fetched:", res.data.categories);
      setCategories(res.data.categories || []);
    } catch (err) {
      message.error("Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // Edit client functionality
  const handleEditClient = () => {
    if (clientData) {
      form.setFieldsValue({
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        phone: clientData.phone,
        email: clientData.email,
        date_of_birth: clientData.date_of_birth
          ? dayjs(clientData.date_of_birth)
          : null,
        address: clientData.address,
        gender: clientData.gender,
        categoryId: clientData?.client_organization_category?.[0]?.category_id,
        state: clientData?.state,
      });
      setIsEditModalVisible(true);
    }
  };

  const handleSaveClient = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        orgId: localStorage.getItem("selectedOrgId"),
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        email: values.email,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : null,
        address: values.address,
        gender: values.gender,
        category: values.categoryId,
        state: values.state,
      };

      const response = await axios.put(
        `${BACKEND_URL}/patient/clients/editclientDetails/${clientData.userid}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        messageApi.success("Client details updated successfully!");
        setIsEditModalVisible(false);
        form.resetFields();
        // Refresh client data
        await fetchClientData();
      }
    } catch (error) {
      console.error(
        "Error updating client:",
        error.response?.data || error.message
      );
      messageApi.error(
        error.response?.data?.message || "Failed to update client details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return PALETTE.primaryDark;
      case "CONFIRMED":
        return PALETTE.primary;
      case "PENDING":
        return "#b8995c";
      case "CANCELLED":
        return "#b45353";
      case "NO_SHOW":
        return PALETTE.ink3;
      default:
        return PALETTE.muted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleOutlined className="text-gw-primary-dark" />;
      case "CONFIRMED":
        return <ClockCircleOutlined className="text-gw-primary" />;
      case "PENDING":
        return <ExclamationCircleOutlined className="text-amber-700/90" />;
      case "CANCELLED":
        return <CloseCircleOutlined className="text-[#b45353]" />;
      case "NO_SHOW":
        return <MinusCircleOutlined className="text-gw-ink-3" />;
      default:
        return <ClockCircleOutlined className="text-gw-ink-4" />;
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Filter and paginate appointments
  const filteredAndPaginatedAppointments = useMemo(() => {
    const appointments = clientData?.appointments || [];

    // Apply filters
    let filtered = appointments.filter((apt) => {
      // Status filter
      if (statusFilter !== "ALL" && apt.status !== statusFilter) {
        return false;
      }

      // Search filter (portal_id, remarks, cancel_remarks)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesPortalId = apt.portal_id
          ?.toString()
          .toLowerCase()
          .includes(query);
        const matchesRemarks = apt.remarks?.toLowerCase().includes(query);
        const matchesCancelRemarks = apt.cancel_remarks
          ?.toLowerCase()
          .includes(query);

        if (!matchesPortalId && !matchesRemarks && !matchesCancelRemarks) {
          return false;
        }
      }

      // Date filter
      if (dateFilter) {
        const appointmentDate = new Date(apt.start_time).toDateString();
        const filterDate = dateFilter.toDate().toDateString();
        if (appointmentDate !== filterDate) {
          return false;
        }
      }

      return true;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    // Paginate
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      appointments: paginated,
      total: filtered.length,
      allFiltered: filtered,
    };
  }, [
    clientData?.appointments,
    statusFilter,
    searchQuery,
    dateFilter,
    currentPage,
    pageSize,
  ]);

  const getAppointmentStats = () => {
    // Use filtered appointments for more relevant stats
    const appointments = filteredAndPaginatedAppointments.allFiltered;
    const total = appointments.length;
    const completed = appointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const cancelled = appointments.filter(
      (apt) => apt.status === "CANCELLED"
    ).length;
    const noShow = appointments.filter(
      (apt) => apt.status === "NO_SHOW"
    ).length;

    return { total, completed, cancelled, noShow };
  };

  // Show loading state while data is being fetched
  if (!clientData) {
    return (
      <Box
        className="flex min-h-full items-center justify-center p-6 sm:p-8"
        sx={{ background: PALETTE.surface }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gw-primary mx-auto mb-4" />
          <span className="text-gw-ink-3">Loading client details...</span>
        </div>
      </Box>
    );
  }

  const stats = getAppointmentStats();

  return (
    <Box
      className="min-h-full p-6 sm:p-8"
      sx={{ background: PALETTE.surface }}
    >
      {contextHolder}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end">
          <Button
            type="link"
            onClick={() => window.history.back()}
            className="text-gw-primary hover:text-gw-primary-dark mb-4"
          >
            &larr; Back to Clients
          </Button>
        </div>
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow border border-gw-muted/40 p-6 mb-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                className="bg-gradient-to-br from-gw-primary to-gw-primary-dark"
              />
            </div>

            {/* Client Info */}
            <div className="flex-grow">
              <h2 className="!mb-2 !text-gw-primary-dark !font-bold text-2xl">
                {clientData?.first_name} {clientData?.last_name}
              </h2>
              <div className="flex gap-5 items-center">
                <span className="text-gw-ink-3 block mb-3">
                  Client ID:{" "}
                  {clientData?.client_organization_category?.[0]?.portal_id}
                </span>
                <span className="text-gw-ink-3 block mb-3">
                  Login ID: {clientData?.users.login_id}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Tag
                  icon={<TeamOutlined />}
                  bordered={false}
                  style={{
                    backgroundColor: PALETTE.accentLight,
                    color: PALETTE.primaryDark,
                  }}
                >
                  {clientData?.organizations?.name}
                </Tag>
                <Tag
                  bordered={false}
                  style={{
                    backgroundColor: "rgba(129, 166, 198, 0.2)",
                    color: PALETTE.primaryDark,
                  }}
                >
                  {clientData?.gender}
                </Tag>
                <Tag
                  bordered={false}
                  style={{
                    backgroundColor: PALETTE.surface,
                    color: PALETTE.ink2,
                    border: `1px solid ${PALETTE.line}`,
                  }}
                >
                  Age: {calculateAge(clientData?.date_of_birth)}
                </Tag>
                {clientData?.client_organization_category?.[0]
                  ?.booked_status === "BOOKED" ? (
                  <Tag
                    bordered={false}
                    style={{
                      backgroundColor: PALETTE.primaryDark,
                      color: PALETTE.white,
                      fontWeight: 600,
                    }}
                  >
                    Booked
                  </Tag>
                ) : (
                  <Tag
                    bordered={false}
                    style={{
                      backgroundColor: "rgba(180, 83, 83, 0.15)",
                      color: "#8f3d3d",
                      fontWeight: 600,
                    }}
                  >
                    Unbooked
                  </Tag>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditClient}
              >
                Edit Client
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => commingSoon()}>
                New Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Details & Appointments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg shadow border border-gw-muted/40 p-6">
              <h4 className="!mb-4 !text-gw-primary-dark !font-semibold text-lg">
                Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-gw-primary" />
                  <div>
                    <span className="text-gw-ink-3 text-sm block">Phone</span>
                    <span>{isMobileView ? clientData?.phone : "**********"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-gw-primary" />
                  <div>
                    <span className="text-gw-ink-3 text-sm block">Email</span>
                    <span>{clientData?.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HomeOutlined className="text-gw-primary" />
                  <div>
                    <span className="text-gw-ink-3 text-sm block">Address</span>
                    <span>{clientData?.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HomeOutlined className="text-gw-primary" />
                  <div>
                    <span className="text-gw-ink-3 text-sm block">State</span>
                    <span>{clientData?.state}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarOutlined className="text-gw-primary" />
                  <div>
                    <span className="text-gw-ink-3 text-sm block">
                      Date of Birth
                    </span>
                    <span>
                      {clientData?.date_of_birth
                        ? formatDate(clientData.date_of_birth)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment History */}
            <div className="bg-white rounded-lg shadow border border-gw-muted/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="!mb-0 !text-gw-primary-dark !font-semibold text-lg">
                  Appointment History
                </h4>
                <span className="text-gw-ink-3">
                  {clientData?.appointments?.length || 0} total appointments
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                <Search
                  placeholder="Search appointments..."
                  allowClear
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined />}
                />

                <DatePicker
                  placeholder="Filter by date"
                  value={dateFilter}
                  onChange={setDateFilter}
                  allowClear
                  style={{ width: "100%" }}
                />
              </div>

              {/* Filters */}
              {clientData?.appointments?.length > 0 && (
                <div className="mb-6 space-y-4">
                  {(statusFilter !== "ALL" || searchQuery || dateFilter) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gw-ink-3">
                        Showing {filteredAndPaginatedAppointments.total} of{" "}
                        {clientData?.appointments?.length} appointments
                      </span>
                      <Button
                        size="small"
                        type="link"
                        onClick={() => {
                          setStatusFilter("ALL");
                          setSearchQuery("");
                          setDateFilter(null);
                          setCurrentPage(1);
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {filteredAndPaginatedAppointments.total > 0 ? (
                <>
                  <div className="space-y-4">
                    {filteredAndPaginatedAppointments.appointments.map(
                      (appointment) => (
                        <div
                          key={appointment.id}
                          className="border border-gw-muted/60 rounded-lg p-4 transition-shadow hover:border-gw-primary-light/70 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(appointment.status)}
                              <div className="flex-grow">
                                <strong className="block">
                                  Appointment #{appointment.portal_id}
                                </strong>
                                <span className="text-gw-ink-3 text-sm block">
                                  {formatDate(appointment.start_time)} •{" "}
                                  {formatTime(appointment.start_time)} -{" "}
                                  {formatTime(appointment.end_time)}
                                </span>
                                {appointment.remarks && (
                                  <span className="text-gw-ink-2 text-sm block mt-1">
                                    Notes: {appointment.remarks}
                                  </span>
                                )}
                                {appointment.cancel_remarks && (
                                  <span className="text-[#b45353] text-sm block mt-1">
                                    Cancel Reason: {appointment.cancel_remarks}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Tag color={getStatusColor(appointment.status)}>
                              {appointment.status.replace("_", " ")}
                            </Tag>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Pagination */}
                  {filteredAndPaginatedAppointments.total > pageSize && (
                    <div className="mt-6 flex justify-center">
                      <Pagination
                        className="gw-pagination-uniform"
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredAndPaginatedAppointments.total}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        showQuickJumper={false}
                        hideOnSinglePage={false}
                        showTotal={(total, range) =>
                          Array.isArray(range) &&
                          range[0] != null &&
                          range[1] != null
                            ? `${range[0]}–${range[1]} of ${total}`
                            : `Total ${total}`
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <Empty
                  description={
                    statusFilter !== "ALL" || searchQuery || dateFilter
                      ? "No appointments match the current filters"
                      : "No appointments found"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow border border-gw-muted/40 p-6">
              <h4 className="!mb-4 !text-gw-primary-dark !font-semibold text-lg">
                Appointment Statistics
                {(statusFilter !== "ALL" || searchQuery || dateFilter) && (
                  <span className="text-sm text-gw-ink-3 font-normal ml-2">
                    (filtered)
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gw-primary-light/30 rounded-lg border border-gw-primary-light/25">
                  <div className="text-2xl font-bold text-gw-primary-dark">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gw-ink-3">Total</div>
                </div>
                <div className="text-center p-3 bg-gw-primary-light/20 rounded-lg border border-gw-primary/20">
                  <div className="text-2xl font-bold text-gw-primary-dark">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-gw-ink-3">Completed</div>
                </div>
                <div className="text-center p-3 bg-gw-muted/45 rounded-lg border border-gw-muted">
                  <div className="text-2xl font-bold text-[#8f3d3d]">
                    {stats.cancelled}
                  </div>
                  <div className="text-sm text-gw-ink-3">Cancelled</div>
                </div>
                <div className="text-center p-3 bg-gw-surface rounded-lg border border-gw-muted/80">
                  <div className="text-2xl font-bold text-gw-ink-2">
                    {stats.noShow}
                  </div>
                  <div className="text-sm text-gw-ink-3">No Show</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border border-gw-muted/40 p-6">
              <h4 className="!mb-4 !text-gw-primary-dark !font-semibold text-lg">
                Quick Actions
              </h4>
              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="outlined"
                  // type="primary"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    fontWeight: 500,
                    ...(clientData?.client_organization_category?.[0]
                      ?.booked_status === "BOOKED"
                      ? {
                        backgroundColor: PALETTE.primaryDark,
                        borderColor: PALETTE.primaryDark,
                        color: PALETTE.white,
                      }
                      : {
                        backgroundColor: PALETTE.white,
                        borderColor: PALETTE.primary,
                        color: PALETTE.primaryDark,
                      }),
                  }}
                  onClick={async () => {
                    try {
                      const currentStatus =
                        clientData?.client_organization_category?.[0]
                          ?.booked_status;
                      const newStatus =
                        currentStatus === "BOOKED" ? "UNBOOKED" : "BOOKED";

                      await axios.put(
                        `${BACKEND_URL}/patient/clients/updateClientBookedStatus`,
                        {
                          clientId: clientData.id,
                          orgId: localStorage.getItem("selectedOrgId"),
                          status: newStatus,
                          // categoryId:
                          //   clientData.client_organization_category[0]
                          //     .category_id,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      messageApi.success(
                        `Client marked as ${newStatus} (${clientData?.client_organization_category?.[0]
                          ?.categories?.category_name || "No Category"
                        })`
                      );

                      // optionally update UI without full refresh
                      setClientData((prev) => ({
                        ...prev,
                        client_organization_category: [
                          {
                            ...prev.client_organization_category[0],
                            booked_status: newStatus,
                          },
                        ],
                      }));
                    } catch (err) {
                      console.error("Error updating client:", err);
                      messageApi.error("Failed to update client");
                    }
                  }}
                >
                  {clientData?.client_organization_category?.[0]
                    ?.booked_status === "BOOKED"
                    ? "Mark as UNBOOKED"
                    : "Mark as BOOKED"}
                </Button>

                <Button
                  type="primary"
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => commingSoon()}
                >
                  Schedule Appointment
                </Button>
                <Button
                  block
                  icon={<MailOutlined />}
                  onClick={() => commingSoon()}
                >
                  Send Email
                </Button>
                <Button
                  block
                  icon={<PhoneOutlined />}
                  onClick={() => commingSoon()}
                >
                  Call Client
                </Button>
                <Divider className="!my-4" />
                <Button
                  block
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => commingSoon()}
                >
                  Delete Client
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Client Modal */}
        <Modal
          title="Edit Client Details"
          open={isEditModalVisible}
          onCancel={handleCancelEdit}
          footer={null}
          width={600}
          destroyOnClose={true}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveClient}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[
                  { required: true, message: "Please enter first name" },
                  {
                    min: 2,
                    message: "First name must be at least 2 characters",
                  },
                ]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>

              <Form.Item
                name="last_name"
                label="Last Name"
                rules={
                  [
                    //{ required: true, message: "Please enter last name" },
                  ]
                }
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </div>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: "Please enter phone number" },
                {
                  pattern: /^[\+]?[0-9\-\s\(\)]+$/,
                  message: "Please enter a valid phone number",
                },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select gender!" }]}
            >
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Category"
              name="categoryId" // this should match your backend field name
              rules={[{ required: true, message: "Please select a category!" }]}
            >
              <Select
                placeholder="Select category"
                //value={form.getFieldValue("categoryId")} // auto-set value from Form
                onChange={(value) => form.setFieldsValue({ categoryId: value })} // updates form
                allowClear
              >
                {categories?.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.category_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                //{ required: true, message: "Please enter email address" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              name="date_of_birth"
              label="Date of Birth"
              rules={
                [
                  // { required: true, message: "Please select date of birth" },
                ]
              }
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                placeholder="Select date of birth"
                disabledDate={(current) => current && current.isAfter(dayjs())}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
            //rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input.TextArea rows={3} placeholder="Enter full address" />
            </Form.Item>

            <Form.Item name="state" label="State">
              <Select
                placeholder="Select state"
                showSearch
              // defaultValue={defaultState}
              >
                {states?.map((s) => {
                  return (
                    <Option key={s.value} value={s.value}>
                      {s.label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button onClick={handleCancelEdit} icon={<CloseOutlined />}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SaveOutlined />}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </Box>
  );
};

export default ClientDetailPage;
