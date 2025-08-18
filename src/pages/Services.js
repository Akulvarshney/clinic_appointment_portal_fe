import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Alert,
  Tag,
  Space,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { Box } from "@mui/material";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";

const { TextArea } = Input;

const Services = () => {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [loadingServiceId, setLoadingServiceId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [isNewService, setIsNewService] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");

  const token = localStorage.getItem("token");
  const orgId = localStorage.getItem("selectedOrgId");

  // Fetch services with pagination + search
  const fetchServices = async (
    page = pagination.current,
    limit = pagination.pageSize,
    search = searchText
  ) => {
    setTableLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/clientadmin/serviceManagement/getServices`,
        {
          params: { orgId, page, limit, search },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetched Services:", response.data);
      const { services, totalRecords, currentPage } = response.data.data;

      setServices(services || []);
      setPagination((prev) => ({
        ...prev,
        current: currentPage || page,
        pageSize: limit,
        total: totalRecords || prev.total,
      }));
    } catch (err) {
      console.error("Error fetching services:", err);
      message.error("Failed to fetch services");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    setIsNewService(isFeatureValid("SERVICE_MANAGEMENT", "ADD_SERVICE"));
  }, []);

  const handleAddService = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalVisible(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleEditService = (service) => {
    setEditingService(service);
    form.setFieldsValue({
      name: service.name,
      description: service.description,
      price: service.price,
    });
    setIsModalVisible(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingService(null);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (values) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (editingService) {
        // Update existing service
        await axios.put(
          `${BACKEND_URL}/clientadmin/serviceManagement/updateService`,
          {
            id: editingService.id,
            serviceName: values.name,
            desc: values.description,
            price: values.price,
            orgId: orgId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Service updated successfully");
        setSuccessMsg("Service updated successfully");
      } else {
        // Create new service
        await axios.post(
          `${BACKEND_URL}/clientadmin/serviceManagement/createService`,
          {
            serviceName: values.name,
            desc: values.description,
            price: values.price,
            orgId: orgId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Service added successfully");
        setSuccessMsg("Service added successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingService(null);
      fetchServices();
    } catch (err) {
      const errorMessage = editingService
        ? "Failed to update service"
        : "Failed to add service";
      setErrorMsg(errorMessage);
      message.error(errorMessage);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoadingServiceId(id);
      await axios.put(
        `${BACKEND_URL}/clientadmin/serviceManagement/updateService`,
        {
          id,
          status: newStatus,
          orgId: orgId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Status updated successfully");
      setSuccessMsg("Status updated successfully");
      setErrorMsg("");
      fetchServices();
    } catch (err) {
      setErrorMsg("Failed to update status");
      setSuccessMsg("");
      message.error("Failed to update status");
      console.error("Status update error:", err);
    } finally {
      setLoadingServiceId(null);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "portal_id", key: "portal_id" },
    { title: "Service Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const isEnabled = status === "ENABLED";
        return (
          <Popconfirm
            title={`Are you sure you want to ${
              isEnabled ? "disable" : "enable"
            } this service?`}
            onConfirm={() =>
              handleStatusChange(record.id, isEnabled ? "DISABLED" : "ENABLED")
            }
            okText="Yes"
            cancelText="No"
          >
            <Tag
              color={isEnabled ? "green" : "red"}
              style={{ cursor: "pointer" }}
            >
              {status}
            </Tag>
          </Popconfirm>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditService(record)}
            size="small"
          >
            Edit
          </Button>
          {/* <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDeleteService(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={loadingServiceId === record.id}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f4f9ff" }}>
      <div className="flex-1 p-6 sm:p-8">
        {/* Header with Search + Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            Service Management
          </h1>
          <div className="flex gap-2">
            <Input.Search
              placeholder="Search services"
              allowClear
              onSearch={(value) => {
                setSearchText(value);
                fetchServices(1, pagination.pageSize, value);
              }}
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddService}
              size="large"
            >
              Add Service
            </Button>
          </div>
        </div>

        {/* Alerts */}
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            dataSource={services}
            loading={tableLoading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: false,
              showQuickJumper: false,
              onChange: (page, pageSize) => {
                fetchServices(page, pageSize, searchText);
              },
            }}
            scroll={{ x: 800 }}
          />
        </div>

        {/* Modal */}
        <Modal
          title={editingService ? "Edit Service" : "Add New Service"}
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
              <Form.Item
                label="Service Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter service name!" },
                  {
                    min: 2,
                    message: "Service name must be at least 2 characters!",
                  },
                ]}
              >
                <Input placeholder="Enter service name" />
              </Form.Item>

              <Form.Item label="Description" name="description">
                <TextArea rows={3} placeholder="Enter service description" />
              </Form.Item>

              <Form.Item
                label="Price"
                name="price"
                rules={[
                  { required: true, message: "Please enter price!" },
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message:
                      "Please enter a valid price (e.g., 100 or 100.50)!",
                  },
                ]}
              >
                <Input
                  placeholder="Enter price"
                  type="number"
                  min="0"
                  step="0.01"
                  addonBefore="₹"
                />
              </Form.Item>

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
                <Button type="primary" htmlType="submit" loading={loading}>
                  {loading
                    ? editingService
                      ? "Updating..."
                      : "Creating..."
                    : editingService
                    ? "Update Service"
                    : "Create Service"}
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    </Box>
  );
};

export default Services;
