import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";
import {
  Card,
  Avatar,
  Tag,
  Badge,
  Button,
  Timeline,
  Typography,
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

const { Title, Text } = Typography;
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
        `${BACKEND_URL}/patient/clients/clientDetails/${clientId}`,
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
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

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
      });
      setIsEditModalVisible(true);
    }
  };

  const handleSaveClient = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        email: values.email,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : null,
        address: values.address,
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
        return "green";
      case "CONFIRMED":
        return "blue";
      case "PENDING":
        return "orange";
      case "CANCELLED":
        return "red";
      case "NO_SHOW":
        return "volcano";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleOutlined className="text-green-500" />;
      case "CONFIRMED":
        return <ClockCircleOutlined className="text-blue-500" />;
      case "PENDING":
        return <ExclamationCircleOutlined className="text-yellow-500" />;
      case "CANCELLED":
        return <CloseCircleOutlined className="text-red-500" />;
      case "NO_SHOW":
        return <MinusCircleOutlined className="text-orange-500" />;
      default:
        return <ClockCircleOutlined className="text-gray-400" />;
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
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Text className="text-gray-500">Loading client details...</Text>
        </div>
      </div>
    );
  }

  const stats = getAppointmentStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {contextHolder}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end">
          <Button
            type="link"
            onClick={() => window.history.back()}
            className="text-blue-500 hover:text-blue-700 mb-4"
          >
            &larr; Back to Clients
          </Button>
        </div>
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                className="bg-gradient-to-br from-blue-500 to-purple-600"
              />
            </div>

            {/* Client Info */}
            <div className="flex-grow">
              <Title level={2} className="!mb-2">
                {clientData?.first_name} {clientData?.last_name}
              </Title>
              <Text className="text-gray-500 block mb-3">
                Client ID: {clientData?.portalid}
              </Text>
              <div className="flex flex-wrap gap-2">
                <Tag color="blue" icon={<TeamOutlined />}>
                  {clientData?.organizations?.name}
                </Tag>
                <Tag color="green">{clientData?.gender}</Tag>
                <Tag color="purple">
                  Age: {calculateAge(clientData?.date_of_birth)}
                </Tag>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Title level={4} className="!mb-4">
                Client Information
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-gray-500" />
                  <div>
                    <Text className="text-gray-500 text-sm block">Phone</Text>
                    <Text>
                      {isMobileView ? clientData?.phone : "**********"}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-gray-500" />
                  <div>
                    <Text className="text-gray-500 text-sm block">Email</Text>
                    <Text>{clientData?.email}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HomeOutlined className="text-gray-500" />
                  <div>
                    <Text className="text-gray-500 text-sm block">Address</Text>
                    <Text>{clientData?.address}</Text>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarOutlined className="text-gray-500" />
                  <div>
                    <Text className="text-gray-500 text-sm block">
                      Date of Birth
                    </Text>
                    <Text>{formatDate(clientData?.date_of_birth)}</Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="!mb-0">
                  Appointment History
                </Title>
                <Text className="text-gray-500">
                  {clientData?.appointments?.length || 0} total appointments
                </Text>
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
                      <Text className="text-sm text-gray-500">
                        Showing {filteredAndPaginatedAppointments.total} of{" "}
                        {clientData?.appointments?.length} appointments
                      </Text>
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
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(appointment.status)}
                              <div className="flex-grow">
                                <Text strong className="block">
                                  Appointment #{appointment.portal_id}
                                </Text>
                                <Text className="text-gray-500 text-sm block">
                                  {formatDate(appointment.start_time)} •{" "}
                                  {formatTime(appointment.start_time)} -{" "}
                                  {formatTime(appointment.end_time)}
                                </Text>
                                {appointment.remarks && (
                                  <Text className="text-gray-600 text-sm block mt-1">
                                    Notes: {appointment.remarks}
                                  </Text>
                                )}
                                {appointment.cancel_remarks && (
                                  <Text className="text-red-500 text-sm block mt-1">
                                    Cancel Reason: {appointment.cancel_remarks}
                                  </Text>
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
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredAndPaginatedAppointments.total}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} of ${total} appointments`
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Title level={4} className="!mb-4">
                Appointment Statistics
                {(statusFilter !== "ALL" || searchQuery || dateFilter) && (
                  <Text className="text-sm text-gray-500 font-normal ml-2">
                    (filtered)
                  </Text>
                )}
              </Title>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.cancelled}
                  </div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.noShow}
                  </div>
                  <div className="text-sm text-gray-600">No Show</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Title level={4} className="!mb-4">
                Quick Actions
              </Title>
              <div className="space-y-3">
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
                rules={[
                  { required: true, message: "Please enter last name" },
                  {
                    min: 2,
                    message: "Last name must be at least 2 characters",
                  },
                ]}
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
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter email address" },
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
              rules={[
                { required: true, message: "Please select date of birth" },
              ]}
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
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input.TextArea rows={3} placeholder="Enter full address" />
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
    </div>
  );
};

export default ClientDetailPage;
