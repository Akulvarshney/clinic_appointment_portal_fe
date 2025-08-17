import React, { useState } from "react";
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
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // User data from the provided JSON
  const userData = {
    id: "28eedc4c-b005-4016-a363-1a678474b36e",
    email: "allenv213@gmail.com",
    full_name: "Dr. Allen",
    phone: "1231231231",
    login_id: "doc1",
    created_at: "2025-08-08T18:35:10.388Z",
    last_login: null,
    organizations: [
      {
        name: "testORG",
        shortorgname: "test",
        address: "address",
        roles: [
          {
            name: "DOCTOR",
            description: "DEFAULT DOCTOR",
            is_admin: false,
          },
        ],
      },
    ],
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone,
      login_id: userData.login_id,
    });
  };

  const handleSave = () => {
    message.success("Profile updated successfully!");
    setIsEditing(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-full ">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="text-gray-800 mb-2">
            Profile Settings
          </Title>
          <Text className="text-gray-600">
            Manage your account information and preferences
          </Text>
        </div>

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
                  {userData.full_name}
                </Title>
                <Text className="text-gray-600">
                  {userData.organizations[0]?.roles[0]?.description}
                </Text>
                <div className="mt-2">
                  <Tag color="blue">
                    {userData.organizations[0]?.roles[0]?.name}
                  </Tag>
                  {userData.organizations[0]?.roles[0]?.is_admin && (
                    <Tag color="red">Admin</Tag>
                  )}
                </div>
              </div>
            </div>

            {!isEditing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Profile
              </Button>
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
                        {userData.full_name}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MailOutlined className="text-gray-500" />
                    <div>
                      <Text className="block text-sm text-gray-500">Email</Text>
                      <Text className="text-base font-medium">
                        {userData.email}
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
                        {userData.phone}
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
                        {userData.login_id}
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
                      value={formData.full_name || userData.full_name}
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
                      value={formData.email || userData.email}
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
                      value={formData.phone || userData.phone}
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
                      value={formData.login_id || userData.login_id}
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

        {/* Organization Information */}
        <Card title="Organization Details" className="mb-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <BankOutlined className="text-gray-500" />
              <div>
                <Text className="block text-sm text-gray-500">
                  Organization
                </Text>
                <Text className="text-base font-medium">
                  {userData.organizations[0]?.name}
                </Text>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <IdcardOutlined className="text-gray-500" />
              <div>
                <Text className="block text-sm text-gray-500">Short Name</Text>
                <Text className="text-base font-medium">
                  {userData.organizations[0]?.shortorgname}
                </Text>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <UserOutlined className="text-gray-500" />
              <div>
                <Text className="block text-sm text-gray-500">Address</Text>
                <Text className="text-base font-medium">
                  {userData.organizations[0]?.address}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        <Card title="Account Information" className="shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text className="block text-sm text-gray-500 mb-1">
                Account Created
              </Text>
              <Text className="text-base font-medium">
                {formatDate(userData.created_at)}
              </Text>
            </div>

            <div>
              <Text className="block text-sm text-gray-500 mb-1">
                Account Status
              </Text>
              <Tag color="green">Active</Tag>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
