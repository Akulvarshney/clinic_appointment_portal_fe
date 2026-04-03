import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import debounce from "lodash/debounce";
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
import { BACKEND_URL, isFeatureValid, states } from "../assets/constants";
import { PALETTE } from "../theme/palette";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiPatch } from "../utils/axiosCalls";
const { Option } = Select;
const { Search } = Input;
const token = localStorage.getItem("token");
const basic_config = {
  headers: { Authorization: `Bearer ${token}` },
};

const ClientManagement = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [roleId, setRoleId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sort, setSort] = useState("portalid");
  const [sortDir, setSortDir] = useState("desc");
  const [categorySelected, setCategorySelected] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isAddClientFeatureValid, setIsAddClientFeatureValid] = useState(false);

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");

  const [defaultState, setDefaultState] = useState(null);

  useEffect(() => {
    const organizations = JSON.parse(localStorage.getItem("organizations"));
    const selectedOrg = localStorage.getItem("selectedOrgId");

    const defaultState = organizations.find(
      (org) => org.organizationId === selectedOrg
    )?.state;

    console.log("defaultState>>> ", defaultState);
    setDefaultState(defaultState);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await fetchRoleId();
      checkMobileView();
      fetchCategories();
      checkAddClientFeatureValid();
    };
    initialize();
  }, []);

  useEffect(() => {
    fetchClients();
  }, [search, pagination.current, categorySelected, sort, sortDir]);

  const fetchRoleId = async () => {
    try {
      // const response = await axios.get(
      //   `${BACKEND_URL}/clientAdmin/userMgmt/getRoles?orgId=${orgId}`,
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
      const response = await apiGet(
        `/clientAdmin/userMgmt/getRoles?orgId=${orgId}`,
        basic_config
      );

      const roles = response.response || [];
      //console.log("roles>>> ", roles);
      const clientRole = roles.find(
        (role) =>
          role.name === "CLIENT" &&
          role.description === "DEFAULT CLIENT" &&
          role.is_deletable === false
      );

      if (clientRole) {
        setRoleId(clientRole.id);
      } else {
        console.warn("CLIENT / DEFAULT CLIENT role not found");
        message.warning(
          "Default client role not found. Please contact administrator."
        );
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      message.error("Failed to fetch client roles");
    }
  };

  const checkMobileView = () => {
    try {
      const response = isFeatureValid("CLIENT_LISTING", "VIEW_MOBILE");
      setIsMobileView(response);
    } catch (err) {
      console.error("Error checking mobile view permission:", err);
    }
  };

  const checkAddClientFeatureValid = () => {
    const response = isFeatureValid("CLIENT_LISTING", "ADD_CLIENT");
    setIsAddClientFeatureValid(response);
    return response;
  };

  const fetchClients = async () => {
    setTableLoading(true);
    try {
      // const response = await axios.get(
      //   `${BACKEND_URL}/patient/clients/clientListing`,
      //   {
      //     params: {
      //       search,
      //       page: pagination.current,
      //       limit: pagination.pageSize,
      //       orgId,
      //       categoryId: categorySelected,
      //       sort,
      //       sortDir,
      //     },
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );

      const response = await apiGet(`/patient/clients/clientListing`, {
        params: {
          search,
          page: pagination.current,
          limit: pagination.pageSize,
          orgId,
          categoryId: categorySelected,
          sort,
          sortDir,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("clients?? ", response);
      setClients(response.data || []);

      // Fix pagination total calculation
      setPagination((prev) => ({
        ...prev,
        total:
          response.totalCount ||
          response.total ||
          response.totalPages * prev.pageSize,
      }));
    } catch (err) {
      console.error("Error fetching clients:", err);
      message.error("Failed to fetch clients");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // const res = await axios.get(
      //   `${BACKEND_URL}/clientadmin/userMgmt/category?organization_id=${localStorage.getItem(
      //     "selectedOrgId"
      //   )}&is_valid=true`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem("token")}`,
      //     },
      //   }
      // );
      const res = await apiGet(
        `/clientadmin/userMgmt/category?organization_id=${localStorage.getItem(
          "selectedOrgId"
        )}&is_valid=true`,
        basic_config
      );
      console.log("Categories fetched:", res.categories);
      setCategories(res.categories || []);
    } catch (err) {
      message.error("Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    form.resetFields();
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

    if (!roleId) {
      setErrorMsg("Role not loaded yet. Please try again shortly.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/patient/clients/registerClient`,
        {
          Firstname: values.first_name,
          Secondname: values.last_name,
          address: values.address,
          state: values.state,
          city: values.city,
          pinCode: values.pinCode,
          country: "INDIA",
          mobile: values.mobile,
          dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
          gender: values.gender,
          occupation: values.occupation,
          email: values.email,
          emergencyContact: values.emergency_contact,
          organization_id: orgId,
          category: values.category,
          roleId: roleId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if ([200, 201].includes(response.status)) {
        form.resetFields();
        setIsModalVisible(false);
        setSuccessMsg("Client registered successfully.");
        message.success("Client registered successfully.");
        fetchClients();
      } else {
        message.error("Failed to register client.");
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again later.";
      setErrorMsg(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
      }, 500),
    []
  );

  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  // Fix table change handler to properly handle pagination
  const handleTableChange = (paginationInfo, filters, sorter) => {
    setPagination({
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
      total: paginationInfo.total,
    });

    // fetchClients();
  };

  // Fix category filter handler
  const handleCategoryFilter = (value) => {
    console.log("Category selected:", value);
    setCategorySelected(value || null); // Handle clear case
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "first_name",
      key: "name",
      width: "22%",

      render: (firstName, record) => {
        const fullName =
          `${firstName || ""} ${record.last_name || ""}`.trim() || "-";
        return (
          <Link
            to={`/clients/detail/${record.id}`}
            style={{ cursor: "pointer" }}
          >
            {fullName}
          </Link>
        );
      },
    },
    {
      title: (
        <p
          // type="link"
          onClick={() => {
            setSort("portalid");
            setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
          }}
        >
          Client ID {sortDir === "asc" ? "▲" : "▼"}
        </p>
      ),
      key: "portalid",
      width: "14%",
      // sorter: true,

      render: (_, record) =>
        record.client_organization_category?.[0]?.portal_id || "-",
    },
    ...(isMobileView
      ? [
        {
          title: "Mobile",
          dataIndex: "phone",
          key: "phone",
          width: "18%",
        },
      ]
      : []),

    {
      title: "State",
      dataIndex: "state",
      key: "state",
      ellipsis: true,
      width: "10%",
    },
    // {
    //   title: "Date of Birth",
    //   dataIndex: "date_of_birth",
    //   key: "date_of_birth",
    //   render: (dob) =>
    //     dob
    //       ? new Date(dob).toLocaleDateString("en-US", {
    //           year: "numeric",
    //           month: "2-digit",
    //           day: "2-digit",
    //         })
    //       : "-",
    // },
    // {
    //   title: "Gender",
    //   dataIndex: "gender",
    //   key: "gender",
    // },
    // {
    //   title: "Occupation",
    //   dataIndex: "occupation",
    //   key: "occupation",
    //   ellipsis: true,
    // },
    {
      title: "Category",
      key: "category",
      width: "18%",
      dataIndex: ["categories", "category_name"],
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200 }}
            placeholder="Select Category"
            value={categorySelected}
            onChange={handleCategoryFilter}
            allowClear
            onClear={() => handleCategoryFilter(null)}
          >
            {categories?.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.category_name}
              </Option>
            ))}
          </Select>
        </div>
      ),
      //render: (_, record) => record.categories?.category_name || "-",
      render: (_, record) =>
        record.client_organization_category?.[0]?.categories?.category_name ||
        "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: "18%",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: PALETTE.surface }}>
      <div className="flex-1 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gw-primary-dark">
            Client Management
          </h1>
          <div className="flex gap-3 items-center">
            <Search
              placeholder="Search by name, mobile..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch("");
                } else {
                  handleSearch(e.target.value);
                }
              }}
              style={{ maxWidth: 400 }}
            />

            {isAddClientFeatureValid ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddClient}
                size="large"
              >
                Register Client
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
            dataSource={clients}
            loading={tableLoading}
            rowKey={(record) => record.id || record.portalid}
            pagination={{
              ...pagination,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
            onChange={handleTableChange}
          />
          {/* <Table
            columns={columns}
            dataSource={clients}
            loading={tableLoading}
            rowKey={(record) => record.id || record.portalid}
            pagination={{
              ...pagination,
              showSizeChanger: false, // 🔴 removes rows per page dropdown
              showQuickJumper: false,
            }}
            onChange={handleTableChange}
            bordered
            className="rounded-xl shadow-md border border-gray-200 overflow-hidden 
             [&_.ant-table-thead>tr>th]:bg-gw-primary-dark 
             [&_.ant-table-thead>tr>th]:text-white 
             [&_.ant-table-thead>tr>th]:font-semibold 
             [&_.ant-table-thead>tr>th]:text-center 
             [&_.ant-table-tbody>tr>td]:text-gray-700 
             [&_.ant-table-tbody>tr>td]:text-sm"
            rowClassName={(_, index) =>
              index % 2 === 0
                ? "bg-gray-50 hover:bg-gray-100 transition"
                : "bg-white hover:bg-gray-100 transition"
            }
          /> */}
        </div>

        <Modal
          title="Register New Client"
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
              initialValues={{
                state: defaultState || undefined,
                country: "India",
              }}
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
                  label="Mobile Number"
                  name="mobile"
                  rules={[
                    { required: true, message: "Please enter mobile number!" },
                    { len: 10, message: "Mobile number must be 10 digits!" },
                  ]}
                >
                  <Input placeholder="Enter mobile number" maxLength={10} />
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
                  name="category"
                  rules={[
                    { required: true, message: "Please select category!" },
                  ]}
                >
                  <Select placeholder="Select category" loading={loading}>
                    {categories?.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.category_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Date of Birth" name="dob">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address!",
                    },
                  ]}
                >
                  <Input placeholder="Enter email" type="email" />
                </Form.Item>

                <Form.Item label="Occupation" name="occupation">
                  <Input placeholder="Enter occupation" />
                </Form.Item>

                <Form.Item label="Emergency Contact" name="emergency_contact">
                  <Input placeholder="Enter emergency contact" />
                </Form.Item>
              </div>

              {/* Address Section */}
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={3} placeholder="Enter complete address" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="City" name="city">
                  <Input placeholder="Enter city" />
                </Form.Item>

                <Form.Item
                  label="State"
                  name="state"
                  rules={[{ required: true, message: "Please select State." }]}
                >
                  <Select
                    placeholder="Select state"
                    showSearch
                    defaultValue={defaultState}
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

                <Form.Item label="Country" name="country">
                  <Input
                    placeholder="Enter country"
                    defaultValue={"India"}
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  label="Pin Code"
                  name="pinCode"
                  rules={[
                    {
                      pattern: /^[0-9]{5,10}$/,
                      message: "Please enter a valid pin code!",
                    },
                  ]}
                >
                  <Input placeholder="Enter pin code" maxLength={10} />
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
                  {isSubmitting ? "Registering..." : "Register Client"}
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    </Box>
  );
};

export default ClientManagement;
