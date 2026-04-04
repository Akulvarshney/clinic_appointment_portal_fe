import React, { useEffect, useState } from "react";

import {
  Card,
  Avatar,
  Button,
  Input,
  Tag,
  Divider,
  Space,
  message,
  Select,
  Alert,
  Spin,
  Modal,
  Form,
  Steps,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  BankOutlined,
  SwapOutlined,
  LockOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { BACKEND_URL } from "../assets/constants";

const { Option } = Select;

const RESET_PASSWORD_STEP_ITEMS = [
  { title: "Send code", icon: <MailOutlined /> },
  { title: "Verify", icon: <KeyOutlined /> },
  { title: "New password", icon: <LockOutlined /> },
];

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  console.log("User Data:", user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  // Reset Password Modal states
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [resetPasswordStep, setResetPasswordStep] = useState(0);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resetIdentifier, setResetIdentifier] = useState("");

  // Get current selected organization and role
  const currentOrg = userData?.organizations?.[selectedOrgIndex];
  const currentRole = currentOrg?.roles?.[selectedRoleIndex];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BACKEND_URL}/clientadmin/userMgmt/getUserDetails/${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          }
        );
        setUserData(response.data.user);

        // Set default organization and role selection
        if (response.data.user?.organizations?.length > 0) {
          setSelectedOrgIndex(0);
          if (response.data.user.organizations[0]?.roles?.length > 0) {
            setSelectedRoleIndex(0);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching client data:",
          error.response?.data || error.message
        );
        message.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && token) {
      fetchUserData();
    }
  }, [user?.id, token]);

  // Reset role selection when organization changes
  useEffect(() => {
    setSelectedRoleIndex(0);
  }, [selectedOrgIndex]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      full_name: userData?.full_name,
      email: userData?.email,
      phone: userData?.phone,
      login_id: userData?.login_id,
    });
  };

  const handleSave = async () => {
    try {
      // Add API call to update user data here
      const updatePayload = {
        full_name: formData.full_name || userData?.full_name,
        email: formData.email || userData?.email,
        phone: formData.phone || userData?.phone,
        login_id: formData.login_id || userData?.login_id,
      };

      // Uncomment when update API is available
      /*
      const response = await axios.put(
        `${BACKEND_URL}/clientadmin/userMgmt/updateUser/${user?.id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data.success) {
        setUserData({ ...userData, ...updatePayload });
        message.success("Profile updated successfully!");
      }
      */

      // Temporary success message (remove when API is implemented)
      message.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOrgChange = (value) => {
    setSelectedOrgIndex(value);
  };

  const handleRoleChange = (value) => {
    setSelectedRoleIndex(value);
  };

  // Reset Password Modal Functions
  const openResetPasswordModal = () => {
    setResetPasswordModal(true);
    setResetPasswordStep(0);
    resetPasswordForm.resetFields();
    setResetIdentifier("");
    const prefillValue = userData?.email || userData?.login_id || "";
    resetPasswordForm.setFieldsValue({
      identifier: prefillValue,
    });
  };

  const closeResetPasswordModal = () => {
    setResetPasswordModal(false);
    setResetPasswordStep(0);
    resetPasswordForm.resetFields();
    setResetIdentifier("");
    setResetPasswordLoading(false);
  };

  // Step 1: Send Forgot Password OTP
  const handleForgotPassword = async (values) => {
    try {
      setResetPasswordLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/noAuth/auth/forgotPassword`,
        {
          identifier: values.identifier,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setResetIdentifier(values.identifier);
        setResetPasswordStep(1);
        message.success(
          "OTP sent successfully! Please check your email/phone."
        );
      }
    } catch (error) {
      console.error("Error sending forgot password request:", error);
      message.error(
        error.response?.data?.message || "Failed to send reset password OTP"
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (values) => {
    try {
      setResetPasswordLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/noAuth/auth/verifyPasswordResetOtp`,
        {
          identifier: resetIdentifier,
          otp: values.otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setResetPasswordStep(2);
        message.success("OTP verified successfully!");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      message.error(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (values) => {
    try {
      setResetPasswordLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/noAuth/auth/resetPassword`,
        {
          identifier: resetIdentifier,
          newPassword: values.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        message.success("Password reset successfully!");
        closeResetPasswordModal();
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      message.error(
        error.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderResetPasswordModalContent = () => {
    const formActionsClass =
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2 pt-2 border-t border-gw-muted/80";

    switch (resetPasswordStep) {
      case 0:
        return (
          <Form
            form={resetPasswordForm}
            onFinish={handleForgotPassword}
            layout="vertical"
            requiredMark={false}
            className="reset-password-modal-form"
          >
            <p className="mb-4 mt-0 text-sm text-gw-ink-3">
              We will send a one-time code to the email or phone linked to this
              account. Use the identifier below, then check your inbox or SMS.
            </p>
            <Form.Item
              name="identifier"
              label={<span className="font-medium">Email or login ID</span>}
              rules={[
                {
                  required: true,
                  message: "Please enter your email or login ID!",
                },
              ]}
            >
              <Input
                size="large"
                disabled
                placeholder="Your account email or login ID"
                prefix={<MailOutlined className="text-gw-ink-3" />}
                className="rounded-lg"
              />
            </Form.Item>
            <div className={formActionsClass}>
              <Button onClick={closeResetPasswordModal} size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordLoading}
                size="large"
                className="bg-gw-primary-dark hover:!bg-gw-primary-dark/90 sm:min-w-[120px]"
              >
                Send OTP
              </Button>
            </div>
          </Form>
        );

      case 1:
        return (
          <Form
            form={resetPasswordForm}
            onFinish={handleVerifyOTP}
            layout="vertical"
            requiredMark={false}
            className="reset-password-modal-form"
          >
            <Alert
              message="Check your messages"
              description={
                <span className="break-all">
                  We sent a 6-digit code for:{" "}
                  <strong className="text-gw-ink">{resetIdentifier}</strong>
                </span>
              }
              type="info"
              showIcon
              className="mb-5 rounded-lg border-gw-primary-light/50 bg-gw-primary-light/20"
            />
            <Form.Item
              name="otp"
              label={<span className="font-medium">Enter verification code</span>}
              rules={[
                {
                  required: true,
                  message: "Please enter the code!",
                },
                {
                  len: 6,
                  message: "Code must be 6 digits!",
                },
              ]}
            >
              <Input.OTP
                length={6}
                size="large"
                className="gap-2 [&_.ant-input-otp-input]:!rounded-lg [&_.ant-input-otp-input]:!h-11 [&_.ant-input-otp-input]:!w-10 sm:[&_.ant-input-otp-input]:!w-11"
              />
            </Form.Item>
            <div className={formActionsClass}>
              <Button
                onClick={() => setResetPasswordStep(0)}
                disabled={resetPasswordLoading}
                size="large"
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordLoading}
                size="large"
                className="bg-gw-primary-dark hover:!bg-gw-primary-dark/90 sm:min-w-[120px]"
              >
                Verify
              </Button>
            </div>
          </Form>
        );

      case 2:
        return (
          <Form
            form={resetPasswordForm}
            onFinish={handleResetPassword}
            layout="vertical"
            requiredMark={false}
            className="reset-password-modal-form"
          >
            <Alert
              message="Choose a strong password"
              description="At least 8 characters with uppercase, lowercase, a number, and a special character (@$!%*?&)."
              type="warning"
              showIcon
              className="mb-5 rounded-lg"
            />
            <Form.Item
              name="newPassword"
              label={<span className="font-medium">New password</span>}
              rules={[
                {
                  required: true,
                  message: "Please enter your new password!",
                },
                {
                  min: 8,
                  message: "Password must be at least 8 characters!",
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message:
                    "Use uppercase, lowercase, a number, and a special character.",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter new password"
                prefix={<LockOutlined className="text-gw-ink-3" />}
                className="rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={<span className="font-medium">Confirm new password</span>}
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Re-enter new password"
                prefix={<LockOutlined className="text-gw-ink-3" />}
                className="rounded-lg"
              />
            </Form.Item>
            <div className={formActionsClass}>
              <Button
                onClick={() => setResetPasswordStep(1)}
                disabled={resetPasswordLoading}
                size="large"
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordLoading}
                size="large"
                className="bg-gw-primary-dark hover:!bg-gw-primary-dark/90 sm:min-w-[140px]"
              >
                Save password
              </Button>
            </div>
          </Form>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          message="Error"
          description="Failed to load user data. Please try refreshing the page."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-gray-800 mb-2 text-3xl font-semibold m-0">
            Profile Settings
          </h2>
          <span className="text-gray-600 block">
            Manage your account information and preferences
          </span>
        </div>

        {/* Organization & Role Selector - Only show if multiple orgs/roles exist */}
        {userData?.organizations?.length > 1 ||
          userData?.organizations?.[0]?.roles?.length > 1 ? (
          <Card className="mb-6 shadow-sm">
            <div className="mb-4">
              <h4 className="mb-4 flex items-center text-lg font-semibold m-0">
                <SwapOutlined className="mr-2" />
                Switch Organization & Role
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData?.organizations?.length > 1 && (
                  <div>
                    <span className="block text-sm text-gray-500 mb-2">
                      Select Organization
                    </span>
                    <Select
                      value={selectedOrgIndex}
                      onChange={handleOrgChange}
                      className="w-full"
                      size="large"
                    >
                      {userData.organizations.map((org, index) => (
                        <Option key={org.id || index} value={index}>
                          {org.name}{" "}
                          {org.shortorgname && `(${org.shortorgname})`}
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}

                {currentOrg?.roles?.length > 1 && (
                  <div>
                    <span className="block text-sm text-gray-500 mb-2">
                      Select Role
                    </span>
                    <Select
                      value={selectedRoleIndex}
                      onChange={handleRoleChange}
                      className="w-full"
                      size="large"
                    >
                      {currentOrg.roles.map((role, index) => (
                        <Option key={role.id || index} value={index}>
                          {role.name}{" "}
                          {role.description && `- ${role.description}`}
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <Alert
              message={`Currently viewing: ${currentOrg?.name || "N/A"} as ${currentRole?.description || currentRole?.name || "N/A"
                }`}
              type="info"
              showIcon
              className="mt-4"
            />
          </Card>
        ) : null}

        {/* Main Profile Card */}
        <Card className="mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                className="bg-gw-primary"
              />
              <div>
                <h3 className="mb-1 text-xl font-semibold m-0">
                  {userData?.full_name || "N/A"}
                </h3>
                <span className="text-gray-600 block">
                  {currentRole?.description || currentRole?.name || "N/A"}
                </span>
                <div className="mt-2">
                  {currentRole?.name && (
                    <Tag color="blue">{currentRole.name}</Tag>
                  )}
                </div>
              </div>
            </div>

            {!isEditing ? (
              <Space>
                {/* <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                  className="bg-gw-primary-dark hover:opacity-90"
                >
                  Edit Profile
                </Button> */}
                <Button
                  icon={<LockOutlined />}
                  onClick={openResetPasswordModal}
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  Reset Password
                </Button>
              </Space>
            ) : (
              <Space>
                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  type="primary"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancel
                </Button>
              </Space>
            )}
          </div>

          <Divider />

          {/* Profile Information */}
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserOutlined className="text-gray-500" />
                    <div>
                      <span className="block text-sm text-gray-500">
                        Full Name
                      </span>
                      <span className="text-base font-medium block">
                        {userData?.full_name || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MailOutlined className="text-gray-500" />
                    <div>
                      <span className="block text-sm text-gray-500">Email</span>
                      <span className="text-base font-medium block">
                        {userData?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PhoneOutlined className="text-gray-500" />
                    <div>
                      <span className="block text-sm text-gray-500">Phone</span>
                      <span className="text-base font-medium block">
                        {userData?.phone || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <IdcardOutlined className="text-gray-500" />
                    <div>
                      <span className="block text-sm text-gray-500">
                        Login ID
                      </span>
                      <span className="text-base font-medium block">
                        {userData?.login_id || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm text-gray-500 mb-1">
                      Full Name
                    </span>
                    <Input
                      size="large"
                      value={formData.full_name || userData?.full_name || ""}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <span className="block text-sm text-gray-500 mb-1">
                      Email
                    </span>
                    <Input
                      size="large"
                      value={formData.email || userData?.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="block text-sm text-gray-500 mb-1">
                      Phone
                    </span>
                    <Input
                      size="large"
                      value={formData.phone || userData?.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <span className="block text-sm text-gray-500 mb-1">
                      Login ID
                    </span>
                    <Input
                      size="large"
                      disabled
                      value={formData.login_id || userData?.login_id || ""}
                      onChange={(e) =>
                        handleInputChange("login_id", e.target.value)
                      }
                      placeholder="Enter login ID"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Current Organization Information */}
        {currentOrg && (
          <Card title="Current Organization Details" className="mb-6 shadow-sm">
            <div className="space-y-4 grid sm:grid-cols-1 md:grid-cols-2 ">
              <div className="flex items-center space-x-3">
                <BankOutlined className="text-gray-500" />
                <div>
                  <span className="block text-sm text-gray-500">
                    Organization Name
                  </span>
                  <span className="text-base font-medium block">
                    {currentOrg.name || "N/A"}
                  </span>
                </div>
              </div>

              {currentOrg.shortorgname && (
                <div className="flex items-center space-x-3">
                  <IdcardOutlined className="text-gray-500" />
                  <div>
                    <span className="block text-sm text-gray-500">
                      Short Name
                    </span>
                    <span className="text-base font-medium block">
                      {currentOrg.shortorgname}
                    </span>
                  </div>
                </div>
              )}

              {currentOrg.address && (
                <div className="flex items-center space-x-3">
                  <UserOutlined className="text-gray-500" />
                  <div>
                    <span className="block text-sm text-gray-500">Address</span>
                    <span className="text-base font-medium block">
                      {currentOrg.address}
                    </span>
                  </div>
                </div>
              )}

              {currentOrg.gstnumber && (
                <div className="flex items-center space-x-3">
                  <IdcardOutlined className="text-gray-500" />
                  <div>
                    <span className="block text-sm text-gray-500">
                      GST Number
                    </span>
                    <span className="text-base font-medium block">
                      {currentOrg.gstnumber}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* All Organizations Summary - Only show if multiple organizations */}
        {userData?.organizations?.length > 1 && (
          <Card title="All Organizations & Roles" className="mb-6 shadow-sm">
            <div className="space-y-6">
              {userData.organizations.map((org, orgIndex) => (
                <div
                  key={org.id || orgIndex}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="mb-1 text-base font-semibold m-0">
                        {org.name} {org.shortorgname && `(${org.shortorgname})`}
                      </h5>
                      {org.address && (
                        <span className="text-gray-600 text-sm block">
                          {org.address}
                        </span>
                      )}
                    </div>
                    {orgIndex === selectedOrgIndex && (
                      <Tag color="blue">Current</Tag>
                    )}
                  </div>

                  {org.roles && org.roles.length > 0 && (
                    <div className="ml-4">
                      <span className="block text-sm text-gray-500 mb-2">
                        Roles:
                      </span>
                      <Space wrap>
                        {org.roles.map((role, roleIndex) => (
                          <Tag
                            key={role.id || roleIndex}
                            color={
                              orgIndex === selectedOrgIndex &&
                                roleIndex === selectedRoleIndex
                                ? "blue"
                                : "default"
                            }
                          >
                            {role.name}
                            {role.is_admin && " (Admin)"}
                            {role.department && ` - ${role.department}`}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Account Information */}
        <Card title="Account Information" className="shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-sm text-gray-500 mb-1">
                Account Created
              </span>
              <span className="text-base font-medium block">
                {formatDate(userData?.created_at)}
              </span>
            </div>

            <div>
              <span className="block text-sm text-gray-500 mb-1">
                Total Organizations
              </span>
              <span className="text-base font-medium block">
                {userData?.organizations?.length || 0}
              </span>
            </div>

            <div>
              <span className="block text-sm text-gray-500 mb-1">
                Account Status
              </span>
              <Tag color={userData?.is_valid ? "green" : "red"}>
                {userData?.is_valid ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>
        </Card>

        {/* Reset Password Modal */}
        <Modal
          title={
            <div className="flex items-center gap-4 min-w-0 pr-2">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white text-xl shadow-inner ring-1 ring-white/20"
                aria-hidden
              >
                <LockOutlined />
              </span>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="text-lg font-semibold text-white leading-snug tracking-tight m-0">
                  Reset password
                </div>
                <span className="text-sm block mt-1 text-white/80 leading-snug">
                  Secure your account in three quick steps
                </span>
              </div>
            </div>
          }
          open={resetPasswordModal}
          onCancel={closeResetPasswordModal}
          footer={null}
          width={520}
          destroyOnClose
          centered
          maskClosable={!resetPasswordLoading}
          className={
            "reset-password-modal " +
            "[&_.ant-modal-content]:!p-0 [&_.ant-modal-content]:overflow-hidden " +
            "[&_.ant-modal-header]:!m-0 [&_.ant-modal-header]:!p-0 [&_.ant-modal-header]:!border-0 " +
            "[&_.ant-modal-header]:!rounded-t-[12px] " +
            "[&_.ant-modal-header]:bg-gradient-to-br [&_.ant-modal-header]:from-gw-primary-dark [&_.ant-modal-header]:to-gw-primary " +
            "[&_.ant-modal-title]:!m-0 [&_.ant-modal-title]:!w-full [&_.ant-modal-title]:!max-w-none " +
            "[&_.ant-modal-title]:!text-left [&_.ant-modal-title]:!leading-normal [&_.ant-modal-title]:!font-normal " +
            "[&_.ant-modal-title]:px-5 [&_.ant-modal-title]:py-4 [&_.ant-modal-title]:pr-12 " +
            "[&_.ant-modal-close]:!top-4 [&_.ant-modal-close]:!right-4 [&_.ant-modal-close]:!h-10 [&_.ant-modal-close]:!w-10 " +
            "[&_.ant-modal-close]:!rounded-lg [&_.ant-modal-close]:flex [&_.ant-modal-close]:items-center [&_.ant-modal-close]:justify-center " +
            "[&_.ant-modal-close]:!text-white/90 hover:[&_.ant-modal-close]:!text-white " +
            "[&_.ant-modal-close]:hover:!bg-white/10 [&_.ant-modal-close]:!transition-colors"
          }
          styles={{
            content: { borderRadius: 12, overflow: "hidden", padding: 0 },
            header: { marginBottom: 0, borderBottom: "none" },
            body: { padding: "20px 24px 24px" },
          }}
        >
          <div className="mb-5 pb-5 border-b border-gw-muted">
            <Steps
              current={resetPasswordStep}
              size="small"
              items={RESET_PASSWORD_STEP_ITEMS}
              className="[&_.ant-steps-item-title]:!text-xs sm:[&_.ant-steps-item-title]:!text-sm"
            />
          </div>
          <div className="rounded-xl border border-gw-muted bg-gw-surface/40 p-4 sm:p-5">
            {renderResetPasswordModalContent()}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
