import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button as MuiButton } from "@mui/material";
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
import { PlusOutlined } from "@ant-design/icons";
import Sidebar from "../components/SideBar";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";

const { Option } = Select;

const UserManagement = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [rowLoadingStates, setRowLoadingStates] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");
  const [isAllowedToAddEmployee, setIsAllowedToAddEmployee] = useState(false);
  const [isAllowedToChangeRole, setIsAllowedToChangeRole] = useState(false);

  console.log("isAllowedToAddEmployee", isAllowedToAddEmployee);
  console.log("isAllowedToChangeRole", isAllowedToChangeRole);

  useEffect(() => {
    setIsAllowedToAddEmployee(
      isFeatureValid("EMPLOYEE_MANAGEMENT", "ADD_EMPLOYEE")
    );
    setIsAllowedToChangeRole(isFeatureValid("EMPLOYEE_MANAGEMENT", "CHANGE_EMP_ROLE") )
    fetchRoles();
    fetchEmployeeDetails(pagination.current, searchText);
  }, []);

  // Separate effect for search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployeeDetails(1, searchText); // Reset to first page when searching
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/clientAdmin/userMgmt/getRoles`,
        {
          params: { orgId: orgId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("roles before filter", response.data.response);
      const allRoles = response.data.response;
      setRoles(response.data.response);
      setFilteredRoles(allRoles.filter((role) => role.is_deletable === true));
      console.log("roles after filter", filteredRoles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchEmployeeDetails = async (page = 1, search = "") => {
    setTableLoading(true);
    try {
      const params = {
        orgId: orgId,
        page: page,
        search: search,
      };

      const response = await axios.get(
        `${BACKEND_URL}/clientAdmin/userMgmt/getEmployees`,
        {
          params: params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const { data, total, page: currentPage } = response.data.response;
        setUsers(data || []);
        setPagination({
          current: currentPage,
          total: total,
        });
      } else {
        message.error("Failed to fetch employees.");
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      message.error("Something went wrong while fetching employees.");
    } finally {
      setTableLoading(false);
    }
  };

  const handleAddEmployee = () => {
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
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/clientAdmin/userMgmt/createEmployee`,
        {
          roleId: values.roleId,
          emailId: values.email,
          firstName: values.first_name,
          lastName: values.last_name,
          DOB: values.dob ? values.dob.toISOString() : null,
          gender: values.gender,
          address: values.address,
          emergencyContact: values.emergency_contact,
          phone: values.phone,
          orgId: orgId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201 || response.status === 200) {
        form.resetFields();
        setIsModalVisible(false);
        setSuccessMsg("Employee created successfully.");
        message.success("Employee added successfully.");
        fetchEmployeeDetails(pagination.current, searchText); // Refresh the table
      } else {
        message.error("Failed to add employee.");
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

  const handleRoleChange = async (userId, newRoleId) => {
    setRowLoadingStates((prev) => ({ ...prev, [userId]: true }));
    try {
      await axios.put(
        `${BACKEND_URL}/clientAdmin/userMgmt/updateUserRole`,
        {
          userId,
          newRoleId,
          orgId: orgId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchEmployeeDetails(pagination.current, searchText);
      message.success("Role updated successfully.");
    } catch (error) {
      console.error("Role update failed:", error);
      message.error("Failed to update role");
    } finally {
      setRowLoadingStates((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle table pagination changes
  const handleTableChange = (paginationInfo) => {
    const { current } = paginationInfo;
    fetchEmployeeDetails(current, searchText);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
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
      width: 150,
      render: (_, record) => {
        // Fixed: Combine first_name and last_name properly
        const firstName = record.first_name || "";
        const lastName = record.last_name || "";
        return `${firstName} ${lastName}`.trim() || "-";
      },
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
      title: "Login ID",
      key: "login_id",
      width: 150,
      render: (_, record) => {
        // Fixed: Access login_id from the correct path
        return record?.users?.login_id || "-";
      },
    },
    {
      title: "Change Role",
      key: "role",
      width: 180,
      render: (_, record) => {
        return (
          <Select
            size="small"
            value={
              // Fixed: Access role ID from the correct path
              record?.users?.user_organizations?.[0]?.user_roles?.[0]?.roles
                ?.id || ""
            }
            disabled={!isAllowedToChangeRole}
            onChange={(value) => handleRoleChange(record.userid, value)}
            loading={rowLoadingStates[record.userid]}
            style={{ minWidth: 120 }}
          >
            {filteredRoles.map((role) => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        );
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f4f9ff" }}>
      <div className="flex-1 p-6 sm:p-8">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
              Employee Management
            </h1>
            <div className="flex gap-3 items-center">
              <Input.Search
                placeholder="Search employees..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setSearchText("");
                  }
                }}
                style={{ width: 300 }}
                size="large"
              />
              {isAllowedToAddEmployee ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddEmployee}
                  size="large"
                >
                  Add Employee
                </Button>
              ) : null}
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
              dataSource={users}
              loading={tableLoading}
              rowKey="id" // Fixed: Use 'id' as rowKey since it's unique
              pagination={{
                current: pagination.current,
                total: pagination.total,
                pageSize: 10,
                showQuickJumper: false,
                showTotal: (total, range) => `Total ${total} employees`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 800 }}
            />
          </div>
        </div>

        <Modal
          title="Add New Employee"
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={800}
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
                  ]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>

                <Form.Item label="Last Name" name="last_name">
                  <Input placeholder="Enter last name" />
                </Form.Item>

                <Form.Item
                  label="Role"
                  name="roleId"
                  rules={[{ required: true, message: "Please select a role!" }]}
                >
                  <Select placeholder="Select role">
                    {filteredRoles.map((role) => (
                      <Option key={role.id} value={role.id}>
                        {role.name}
                      </Option>
                    ))}
                  </Select>
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

                <Form.Item label="Date of Birth" name="dob">
                  <DatePicker style={{ width: "100%" }} />
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
                  {isSubmitting ? "Creating..." : "Create Employee"}
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    </Box>
  );
};

export default UserManagement;
