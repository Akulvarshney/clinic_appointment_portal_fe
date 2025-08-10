import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Select, Tag, message } from "antd";
import axios from "axios";
import { BACKEND_URL } from "../assets/constants";

const { Option } = Select;

const ClientCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/clientadmin/userMgmt/category?organization_id=${localStorage.getItem(
          "selectedOrgId"
        )}`,
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return message.warning("Enter category name");

    try {
      await axios.post(
        `${BACKEND_URL}/clientAdmin/userMgmt/category`,
        {
          category_name: newCategoryName,
          organization_id: localStorage.getItem("selectedOrgId"),
          is_valid: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Category added");
      fetchCategories();
      setNewCategoryName("");
      setIsAddModalVisible(false);
    } catch (err) {
      message.error("Failed to add category");
      console.error(err);
    }
  };

  const handleEditCategory = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/clientAdmin/userMgmt/category/${editCategory.id}`,
        {
          is_valid: editCategory.status === "Active",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Category updated");
      fetchCategories();
      setEditCategory(null);
      setIsEditModalVisible(false);
    } catch (err) {
      message.error("Failed to update category");
      console.error(err);
    }
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "category_name",
      key: "category_name",
    },
    {
      title: "Status",
      dataIndex: "is_valid",
      key: "is_valid",
      render: (is_valid) => (
        <Tag color={is_valid ? "green" : "red"}>
          {is_valid ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          onClick={() => {
            setEditCategory({
              ...record,
              status: record.is_valid ? "Active" : "Inactive",
            });
            setIsEditModalVisible(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Client Category</h1>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add Category
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Add Category"
        open={isAddModalVisible}
        onOk={handleAddCategory}
        onCancel={() => setIsAddModalVisible(false)}
      >
        <Input
          placeholder="Enter category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </Modal>

      <Modal
        title="Edit Category Status"
        open={isEditModalVisible}
        onOk={handleEditCategory}
        onCancel={() => setIsEditModalVisible(false)}
      >
        {editCategory && (
          <Select
            value={editCategory.status}
            onChange={(value) =>
              setEditCategory((prev) => ({ ...prev, status: value }))
            }
            style={{ width: "100%" }}
          >
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        )}
      </Modal>
    </div>
  );
};

export default ClientCategories;
