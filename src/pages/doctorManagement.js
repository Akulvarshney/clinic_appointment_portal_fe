import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Alert,
  Spin,
  Pagination,
  Card,
  Avatar,
} from "antd";
import { PlusOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";
import { PALETTE } from "../theme/palette";

const { Option } = Select;
const { Search } = Input;

const DoctorManagement = () => {
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [roleId, setRoleId] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(9);

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

  const formatField = (value) =>
    value !== undefined && value !== null && String(value).trim() !== ""
      ? String(value)
      : "—";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        minWidth: 0,
        background: PALETTE.surface,
      }}
    >
      <div className="min-w-0 w-full flex-1 px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="m-0 text-xl font-bold text-gw-primary-dark sm:text-2xl lg:text-3xl">
            Doctor Management
          </h1>

          <div className="flex min-w-0 w-full flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
            <Search
              placeholder="Search doctors..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              className="w-full min-w-0 sm:!max-w-[400px]"
              style={{ width: "100%" }}
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
                className="w-full shrink-0 sm:w-auto"
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

        <div className=" rounded-lg  ">
          <Spin spinning={tableLoading}>
            {doctors.length === 0 && !tableLoading ? (
              <div className="text-center py-16 text-gw-ink-3">
                <UserOutlined className="text-4xl text-gw-primary mb-3 opacity-60" />
                <p className="text-base">No doctors found.</p>
                <p className="text-sm mt-1 opacity-80">
                  Try adjusting your search or add a new doctor.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {doctors.map((doc) => {
                    const fullName =
                      `${doc.first_name || ""} ${doc.last_name || ""}`.trim();
                    return (
                      <Card
                        key={doc.portalid}
                        hoverable
                        className="overflow-hidden rounded-xl border-gw-muted shadow-sm cursor-default"
                        styles={{ body: { padding: 0 } }}
                      >
                        {/* Accent bar */}
                        <div style={{ height: 3, backgroundColor: PALETTE.primaryDark }} />

                        {/* Header */}
                        <div style={{ padding: "14px 16px 12px", borderBottom: `0.5px solid ${PALETTE.muted}`, display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar size={44} icon={<UserOutlined />} style={{ backgroundColor: "#EAF0F9", color: PALETTE.primaryDark, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{formatField(fullName)}</div>
                            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>ID · {formatField(doc.portalid)}</div>
                          </div>
                        </div>

                        {/* Body — 2-col grid */}
                        <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            { label: "Email", value: doc.email },
                            { label: "Phone", value: doc.phone },
                            { label: "License", value: doc.license_number },
                            { label: "Login ID", value: doc.users?.login_id },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#aaa", fontWeight: 500 }}>{label}</span>
                              <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formatField(value)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "10px 16px", borderTop: `0.5px solid ${PALETTE.muted}`, background: "#F8F9FA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: "#3B6D11", fontWeight: 500 }}>
                            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#3B6D11", marginRight: 5 }} />
                            Active
                          </span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#EAF0F9", color: PALETTE.primaryDark, fontWeight: 500 }}>
                            {formatField(doc.specialty || "Doctor")}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {totalRecords > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={totalRecords}
                      // showSizeChanger
                      // pageSizeOptions={[10, 20, 50]}
                      showTotal={(total) => `${total} doctor${total !== 1 ? "s" : ""}`}
                      onChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </Spin>
        </div>

        <Modal
          title="Add New Doctor"
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          centered
          destroyOnClose
          styles={{
            content: {
              width: "min(800px, calc(100vw - 24px))",
              maxWidth: "100%",
            },
          }}
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
