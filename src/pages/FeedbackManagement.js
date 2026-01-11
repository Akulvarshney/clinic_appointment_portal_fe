import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  Button,
  Table,
  Rate,
  message,
  Alert,
  Tabs,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const FeedbackManagement = () => {
  const [activeKey, setActiveKey] = useState("new-feedback");
  const [form] = Form.useForm();
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      clientName: "John Doe",
      staffName: "Dr. Smith",
      serviceCategory: "Consultation",
      serviceName: "General Checkup",
      experience: "Good",
      effectiveness: 4,
      comments: "Very satisfied with the service",
      date: "2024-01-15",
    },
    {
      id: 2,
      clientName: "Jane Smith",
      staffName: "Dr. Johnson",
      serviceCategory: "Treatment",
      serviceName: "Dental Cleaning",
      experience: "Excellent",
      effectiveness: 5,
      comments: "Excellent care and attention",
      date: "2024-01-14",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Hardcoded data
  const clients = [
    { id: 1, name: "John Doe", portalId: "CLI001" },
    { id: 2, name: "Jane Smith", portalId: "CLI002" },
    { id: 3, name: "Bob Johnson", portalId: "CLI003" },
    { id: 4, name: "Alice Brown", portalId: "CLI004" },
  ];

  const staff = [
    { id: 1, name: "Dr. Smith", role: "Doctor" },
    { id: 2, name: "Dr. Johnson", role: "Dentist" },
    { id: 3, name: "Nurse Mary", role: "Nurse" },
    { id: 4, name: "Dr. Wilson", role: "Physician" },
  ];

  const serviceCategories = [
    "Hair Restoration",
    "Hair Transplant",
    "Skin",
    "Slimming",
    "Ayurveda",
    "Laser Hair Removal",
    "Salon",
  ];

  const experienceOptions = [
    { label: "Poor", value: "Poor" },
    { label: "Fair", value: "Fair" },
    { label: "Good", value: "Good" },
    { label: "Excellent", value: "Excellent" },
  ];

  const handleSubmit = (values) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      try {
        const selectedClient = clients.find(c => c.id === values.clientId);
        const selectedStaff = staff.find(s => s.id === values.staffId);

        const newFeedback = {
          id: feedbacks.length + 1,
          clientName: selectedClient?.name || "",
          staffName: selectedStaff?.name || "",
          serviceCategory: values.serviceCategory,
          serviceName: values.serviceName,
          experience: values.experience,
          effectiveness: values.effectiveness,
          comments: values.comments,
          date: new Date().toISOString().split('T')[0],
        };

        setFeedbacks([newFeedback, ...feedbacks]);
        form.resetFields();
        setSuccessMsg("Feedback submitted successfully!");
        message.success("Feedback submitted successfully!");
        setLoading(false);
      } catch (error) {
        setErrorMsg("Failed to submit feedback. Please try again.");
        message.error("Failed to submit feedback");
        setLoading(false);
      }
    }, 1000);
  };

  const renderActiveComponent = () => {
    switch (activeKey) {
      case "new-feedback":
        return (
          <div>
           
            <div className="bg-white p-6 rounded-lg shadow mt-4">
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

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item
                  label="Select Client"
                  name="clientId"
                  rules={[{ required: true, message: "Please select a client!" }]}
                >
                  <Select placeholder="Choose a client">
                    {clients.map((client) => (
                      <Option key={client.id} value={client.id}>
                        {client.name} ({client.portalId})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Select Staff"
                  name="staffId"
                  rules={[{ required: true, message: "Please select staff!" }]}
                >
                  <Select placeholder="Choose staff member">
                    {staff.map((member) => (
                      <Option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="1. Service Category"
                  name="serviceCategory"
                  rules={[{ required: true, message: "Please select a service category!" }]}
                >
                  <Radio.Group>
                    {serviceCategories.map((category) => (
                      <Radio key={category} value={category}>
                        {category}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="2. Name of Service"
                  name="serviceName"
                  rules={[{ required: true, message: "Please enter the service name!" }]}
                >
                  <Input placeholder="Enter the specific service received" />
                </Form.Item>

                <Form.Item
                  label="3. How was your experience with us?"
                  name="experience"
                  rules={[{ required: true, message: "Please rate your experience!" }]}
                >
                  <Radio.Group>
                    {experienceOptions.map((option) => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>

               

                <Form.Item
                  label="4. Comments"
                  name="comments"
                  rules={[{ required: true, message: "Please enter your comments!" }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Please share any additional comments or suggestions..."
                  />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-6">
                  <Button onClick={() => form.resetFields()}>
                    Reset
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        );
      case "view-feedbacks":
        return (
          <div>
            
            <div className="bg-white rounded-lg shadow mt-4">
              <Table
                columns={[
                  {
                    title: "Client Name",
                    dataIndex: "clientName",
                    key: "clientName",
                    width: "15%",
                  },
                  {
                    title: "Staff Name",
                    dataIndex: "staffName",
                    key: "staffName",
                    width: "15%",
                  },
                  {
                    title: "Service Category",
                    dataIndex: "serviceCategory",
                    key: "serviceCategory",
                    width: "12%",
                  },
                  {
                    title: "Service Name",
                    dataIndex: "serviceName",
                    key: "serviceName",
                    width: "15%",
                  },
                  {
                    title: "Experience Rating",
                    dataIndex: "experience",
                    key: "experience",
                    width: "12%",
                    render: (rating) => (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                        rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                        rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rating}
                      </span>
                    ),
                  },

                  {
                    title: "Comments",
                    dataIndex: "comments",
                    key: "comments",
                    width: "20%",
                    ellipsis: true,
                  },
                  {
                    title: "Date",
                    dataIndex: "date",
                    key: "date",
                    width: "10%",
                  },
                ]}
                dataSource={feedbacks}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  showQuickJumper: false,
                }}
              />
            </div>
          </div>
        );
      default:
        return <div>Not Found</div>;
    }
  };

  const tabItems = [
    {
      key: "new-feedback",
      label: "New Feedback",
    },
    {
      key: "view-feedbacks",
      label: "View Feedbacks",
    },
  ];

  return (
    <div className="pageCss">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
          Feedbacks
        </h1>
      </div>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={tabItems}
      />
      <div style={{ marginTop: 20 }}>{renderActiveComponent()}</div>
    </div>
  );
};

export default FeedbackManagement;
