import React, { useEffect, useState } from "react";

import {
  Card,
  Avatar,
  Typography,
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

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

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
        `${BACKEND_URL}noAuth/auth/forgotPassword`,
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
    switch (resetPasswordStep) {
      case 0:
        return (
          <Form
            form={resetPasswordForm}
            onFinish={handleForgotPassword}
            layout="vertical"
          >
            <Form.Item
              name="identifier"
              label="Email or Login ID"
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
                placeholder="Enter your email or login ID"
                prefix={<MailOutlined />}
              />
            </Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={closeResetPasswordModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordLoading}
                className="bg-blue-600 hover:bg-blue-700"
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
          >
            <Alert
              message={`OTP sent to: ${resetIdentifier}`}
              type="info"
              className="mb-4"
              showIcon
            />
            <Form.Item
              name="otp"
              label="Enter OTP"
              rules={[
                {
                  required: true,
                  message: "Please enter the OTP!",
                },
                {
                  len: 6,
                  message: "OTP must be 6 digits!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                prefix={<KeyOutlined />}
              />
            </Form.Item>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setResetPasswordStep(0)}
                disabled={resetPasswordLoading}
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Verify OTP
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
          >
            <Form.Item
              name="newPassword"
              label="New Password"
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
                    "Password must contain uppercase, lowercase, number and special character!",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter new password"
                prefix={<LockOutlined />}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
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
                placeholder="Confirm new password"
                prefix={<LockOutlined />}
              />
            </Form.Item>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setResetPasswordStep(1)}
                disabled={resetPasswordLoading}
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetPasswordLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Reset Password
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
          <Title level={2} className="text-gray-800 mb-2">
            Profile Settings
          </Title>
          <Text className="text-gray-600">
            Manage your account information and preferences
          </Text>
        </div>

        {/* Organization & Role Selector - Only show if multiple orgs/roles exist */}
        {userData?.organizations?.length > 1 ||
        userData?.organizations?.[0]?.roles?.length > 1 ? (
          <Card className="mb-6 shadow-sm">
            <div className="mb-4">
              <Title level={4} className="mb-4 flex items-center">
                <SwapOutlined className="mr-2" />
                Switch Organization & Role
              </Title>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData?.organizations?.length > 1 && (
                  <div>
                    <Text className="block text-sm text-gray-500 mb-2">
                      Select Organization
                    </Text>
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
                    <Text className="block text-sm text-gray-500 mb-2">
                      Select Role
                    </Text>
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
              message={`Currently viewing: ${currentOrg?.name || "N/A"} as ${
                currentRole?.description || currentRole?.name || "N/A"
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
                className="bg-blue-500"
              />
              <div>
                <Title level={3} className="mb-1">
                  {userData?.full_name || "N/A"}
                </Title>
                <Text className="text-gray-600">
                  {currentRole?.description || currentRole?.name || "N/A"}
                </Text>
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
                  className="bg-blue-600 hover:bg-blue-700"
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
                      <Text className="block text-sm text-gray-500">
                        Full Name
                      </Text>
                      <Text className="text-base font-medium">
                        {userData?.full_name || "N/A"}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MailOutlined className="text-gray-500" />
                    <div>
                      <Text className="block text-sm text-gray-500">Email</Text>
                      <Text className="text-base font-medium">
                        {userData?.email || "N/A"}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PhoneOutlined className="text-gray-500" />
                    <div>
                      <Text className="block text-sm text-gray-500">Phone</Text>
                      <Text className="text-base font-medium">
                        {userData?.phone || "N/A"}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <IdcardOutlined className="text-gray-500" />
                    <div>
                      <Text className="block text-sm text-gray-500">
                        Login ID
                      </Text>
                      <Text className="text-base font-medium">
                        {userData?.login_id || "N/A"}
                      </Text>
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
                    <Text className="block text-sm text-gray-500 mb-1">
                      Full Name
                    </Text>
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
                    <Text className="block text-sm text-gray-500 mb-1">
                      Email
                    </Text>
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
                    <Text className="block text-sm text-gray-500 mb-1">
                      Phone
                    </Text>
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
                    <Text className="block text-sm text-gray-500 mb-1">
                      Login ID
                    </Text>
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
                  <Text className="block text-sm text-gray-500">
                    Organization Name
                  </Text>
                  <Text className="text-base font-medium">
                    {currentOrg.name || "N/A"}
                  </Text>
                </div>
              </div>

              {currentOrg.shortorgname && (
                <div className="flex items-center space-x-3">
                  <IdcardOutlined className="text-gray-500" />
                  <div>
                    <Text className="block text-sm text-gray-500">
                      Short Name
                    </Text>
                    <Text className="text-base font-medium">
                      {currentOrg.shortorgname}
                    </Text>
                  </div>
                </div>
              )}

              {currentOrg.address && (
                <div className="flex items-center space-x-3">
                  <UserOutlined className="text-gray-500" />
                  <div>
                    <Text className="block text-sm text-gray-500">Address</Text>
                    <Text className="text-base font-medium">
                      {currentOrg.address}
                    </Text>
                  </div>
                </div>
              )}

              {currentOrg.gstnumber && (
                <div className="flex items-center space-x-3">
                  <IdcardOutlined className="text-gray-500" />
                  <div>
                    <Text className="block text-sm text-gray-500">
                      GST Number
                    </Text>
                    <Text className="text-base font-medium">
                      {currentOrg.gstnumber}
                    </Text>
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
                      <Title level={5} className="mb-1">
                        {org.name} {org.shortorgname && `(${org.shortorgname})`}
                      </Title>
                      {org.address && (
                        <Text className="text-gray-600 text-sm">
                          {org.address}
                        </Text>
                      )}
                    </div>
                    {orgIndex === selectedOrgIndex && (
                      <Tag color="blue">Current</Tag>
                    )}
                  </div>

                  {org.roles && org.roles.length > 0 && (
                    <div className="ml-4">
                      <Text className="block text-sm text-gray-500 mb-2">
                        Roles:
                      </Text>
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
              <Text className="block text-sm text-gray-500 mb-1">
                Account Created
              </Text>
              <Text className="text-base font-medium">
                {formatDate(userData?.created_at)}
              </Text>
            </div>

            <div>
              <Text className="block text-sm text-gray-500 mb-1">
                Total Organizations
              </Text>
              <Text className="text-base font-medium">
                {userData?.organizations?.length || 0}
              </Text>
            </div>

            <div>
              <Text className="block text-sm text-gray-500 mb-1">
                Account Status
              </Text>
              <Tag color={userData?.is_valid ? "green" : "red"}>
                {userData?.is_valid ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>
        </Card>

        {/* Reset Password Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <LockOutlined className="mr-2" />
              Reset Password
            </div>
          }
          open={resetPasswordModal}
          onCancel={closeResetPasswordModal}
          footer={null}
          width={500}
          destroyOnClose
        >
          <div className="mb-6">
            <Steps current={resetPasswordStep} size="small">
              <Step title="Send OTP" description="Enter identifier" />
              <Step title="Verify OTP" description="Enter OTP code" />
              <Step title="New Password" description="Set new password" />
            </Steps>
          </div>
          {renderResetPasswordModalContent()}
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
