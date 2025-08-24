import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Alert,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import Sidebar from "../components/SideBar";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";

const { Option } = Select;
const { Search } = Input;

const DoctorManagement = () => {
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isNewDoctor, setIsNewDoctor] = useState(false);

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRoleId();
    fetchDoctorDetails();
    setIsNewDoctor(isFeatureValid("DOCTOR_MANAGEMENT", "ADD_DOCTOR"));
  }, []);

  useEffect(() => {
    fetchDoctorDetails();
  }, [currentPage, pageSize, searchTerm]);

  const fetchRoleId = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/clientAdmin/userMgmt/getRoles?orgId=${orgId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const roles = response.data.response || [];

      const docRole = roles.find(
        (role) =>
          role.name === "DOCTOR" &&
          role.description === "DEFAULT DOCTOR" &&
          role.is_deletable === false
      );

      if (docRole) {
        setRoleId(docRole.id);
      } else {
        console.warn("Doctor / DEFAULT Doctor role not found");
        message.warning(
          "Default Doctor role not found. Please contact administrator."
        );
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      message.error("Failed to fetch client roles");
    }
  };

  const fetchDoctorDetails = async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        orgId: orgId,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await axios.get(
        `${BACKEND_URL}/clientAdmin/userMgmt/getDoctors?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("doctor>>> ", response.data);

      if (response.status === 200) {
        const data = response.data.data.records || {};

        // Handle both paginated and non-paginated responses
        if (Array.isArray(data)) {
          // Non-paginated response (backward compatibility)
          setDoctors(data);
          setTotalRecords(data.length);
        } else {
          // Paginated response
          setDoctors(data.doctors || data.data || []);
          setTotalRecords(data.total || data.totalRecords || 0);
        }
      } else {
        message.error("Failed to fetch doctors.");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      message.error("Something went wrong while fetching doctors.");
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setSearchTerm("");
      setCurrentPage(1);
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleAddDoctor = () => {
    setIsModalVisible(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (values) => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!roleId) {
      setErrorMsg("Role not loaded yet. Please try again shortly.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/clientAdmin/userMgmt/createDoctor`,
        {
          roleId: roleId,
          emailId: values.email,
          firstName: "Dr. " + values.first_name,
          lastName: values.last_name,
          ...(values.dob && { DOB: values.dob.toISOString() }),
          gender: values.gender,
          address: values.address,
          emergencyContact: values.emergency_contact,
          password: values.password,
          phone: values.phone,
          login_id: values.login_id,
          orgId: orgId,
          license_number: values.license_number,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if ([200, 201].includes(response.status)) {
        form.resetFields();
        setIsModalVisible(false);
        setSuccessMsg("Doctor created successfully.");
        message.success("Doctor added successfully.");
        fetchDoctorDetails();
      } else {
        message.error("Failed to add doctor.");
      }
    } catch (error) {
      if (error.response) {
        setErrorMsg(error.response.data.message);
      }
      console.error("API Error:", error);
      message.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "portalid",
      key: "portalid",
      width: 80,
    },
    {
      title: "Name",
      key: "name",
      width: 180,
      render: (_, record) =>
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "License Number",
      dataIndex: "license_number",
      key: "license_number",
      width: 150,
    },
    {
      title: "Login ID",
      key: "login_id",
      width: 150,
      render: (_, record) => record.users?.login_id || "-",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f4f9ff" }}>
      <div className="flex-1 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            Doctor Management
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <Search
              placeholder="Search doctors..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              style={{ width: "100%", minWidth: "300px", maxWidth: "400px" }}
              onSearch={handleSearch}
              onChange={handleSearchChange}
              loading={tableLoading}
            />

            {isNewDoctor && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddDoctor}
                size="large"
                style={{ minWidth: "140px" }}
              >
                Add Doctor
              </Button>
            )}
          </div>
        </div>

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

        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            dataSource={doctors}
            loading={tableLoading}
            rowKey="portalid"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalRecords,
              showSizeChanger: false,
              showQuickJumper: false,

              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 800 }}
          />
        </div>

        <Modal
          title="Add New Doctor"
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={800}
          destroyOnClose
        >
          <div className="modal_outDiv">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="First Name"
                  name="first_name"
                  rules={[
                    { required: true, message: "Please enter first name!" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        const prefixRegex =
                          /^(mr|mrs|ms|miss|dr|prof)\.?(\s|$)/i;
                        if (prefixRegex.test(value.trim())) {
                          return Promise.reject(
                            new Error(
                              "Please enter only your first name, without prefixes."
                            )
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>

                <Form.Item label="Last Name" name="last_name">
                  <Input placeholder="Enter last name" />
                </Form.Item>

                <Form.Item
                  label="License Number"
                  name="license_number"
                  rules={[
                    { required: true, message: "Please enter license number!" },
                  ]}
                >
                  <Input placeholder="Enter license number" />
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
                  label="Date of Birth"
                  name="dob"
                  rules={[
                    { required: true, message: "Please enter phone number!" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>

                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter phone number!" },
                    { len: 10, message: "Phone number must be 10 digits!" },
                  ]}
                >
                  <Input placeholder="Enter phone number" maxLength={10} />
                </Form.Item>

                <Form.Item label="Address" name="address">
                  <Input placeholder="Enter address" />
                </Form.Item>

                <Form.Item label="Emergency Contact" name="emergency_contact">
                  <Input placeholder="Enter emergency contact" />
                </Form.Item>
              </div>

              {errorMsg && (
                <Alert
                  message={errorMsg}
                  type="error"
                  showIcon
                  className="mb-4"
                />
              )}

              {successMsg && (
                <Alert
                  message={successMsg}
                  type="success"
                  showIcon
                  className="mb-4"
                />
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={handleModalCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Doctor"}
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    </Box>
  );
};

export default DoctorManagement;
