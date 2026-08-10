import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Switch, message, Card, Space, Divider, Typography, Collapse } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "../utils/axiosCalls";

const { Title, Text } = Typography;
const { Option } = Select;

const QUESTION_TYPES = [
  "Text", "Textarea", "Number", "Email", "Date", 
  "Dropdown", "Select", "Multi-select", "Radio", 
  "Checkbox", "Rating", "Yes/No"
];

const SurveyBuilder = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  
  const token = localStorage.getItem("token");
  const orgId = localStorage.getItem("selectedOrgId");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (orgId) {
      fetchForm();
    }
  }, [orgId]);

  const fetchForm = async () => {
    setLoading(true);
    const res = await apiGet(`/clientadmin/survey/getForm?orgId=${orgId}`, { headers });
    if (res?.data) {
      form.setFieldsValue({
        title: res.data.title,
        description: res.data.description,
      });
      
      if (res.data.feedback_questions) {
        const formattedQuestions = res.data.feedback_questions.map((q, idx) => ({
          id: q.id || `q_${idx}`,
          type: q.type,
          label: q.label,
          placeholder: q.placeholder,
          is_required: q.is_required,
          options: q.options ? JSON.parse(q.options) : [],
        }));
        setQuestions(formattedQuestions);
      }
    }
    setLoading(false);
  };

  const saveForm = async (values) => {
    setLoading(true);
    const payload = {
      orgId,
      title: values.title,
      description: values.description,
      questions: questions.map((q, i) => ({
        ...q,
        display_order: i
      }))
    };

    const res = await apiPost("/clientadmin/survey/saveForm", payload, { headers });
    if (res?.message) {
      message.success("Survey form saved successfully!");
    }
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { id: Date.now().toString(), type: "Text", label: "New Question", is_required: false, options: [] }
    ]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const moveQuestion = (index, dir) => {
    if ((dir === -1 && index === 0) || (dir === 1 && index === questions.length - 1)) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[index + dir];
    updated[index + dir] = temp;
    setQuestions(updated);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Title level={2}>Survey Builder</Title>
        <Text type="secondary" className="mb-6 block">
          Design the feedback form that will be used for your organization.
        </Text>
        
        <Form form={form} layout="vertical" onFinish={saveForm}>
          <Card className="shadow-sm mb-6">
            <Form.Item name="title" label="Form Title" rules={[{ required: true }]}>
              <Input size="large" placeholder="E.g., Patient Feedback Survey" />
            </Form.Item>
            <Form.Item name="description" label="Form Description">
              <Input.TextArea rows={3} placeholder="Provide instructions for the patients..." />
            </Form.Item>
          </Card>

          <Title level={4}>Questions</Title>
          
          <div className="mb-6">
            <Collapse defaultActiveKey={['0']} accordion>
              {questions.map((q, idx) => (
                <Collapse.Panel 
                  key={q.id} 
                  header={<span className="font-semibold text-lg">{`${idx + 1}. ${q.label || 'New Question'} - [${q.type}]`}</span>}
                  extra={
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button icon={<ArrowUpOutlined />} size="small" onClick={(e) => { e.stopPropagation(); moveQuestion(idx, -1); }} disabled={idx === 0} />
                      <Button icon={<ArrowDownOutlined />} size="small" onClick={(e) => { e.stopPropagation(); moveQuestion(idx, 1); }} disabled={idx === questions.length - 1} />
                      <Button danger icon={<DeleteOutlined />} size="small" onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }} />
                    </div>
                  }
                  className="bg-white"
                >
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                      <div className="mb-2 font-medium">Question Label</div>
                      <Input 
                        value={q.label} 
                        onChange={(e) => updateQuestion(idx, "label", e.target.value)}
                        placeholder="What is your question?"
                      />
                    </div>
                    <div className="col-span-4">
                      <div className="mb-2 font-medium">Question Type</div>
                      <Select 
                        value={q.type} 
                        onChange={(v) => updateQuestion(idx, "type", v)} 
                        className="w-full"
                      >
                        {QUESTION_TYPES.map(t => <Option key={t} value={t}>{t}</Option>)}
                      </Select>
                    </div>
                    
                    <div className="col-span-8">
                      <div className="mb-2 font-medium">Placeholder (Optional)</div>
                      <Input 
                        value={q.placeholder} 
                        onChange={(e) => updateQuestion(idx, "placeholder", e.target.value)}
                        placeholder="Enter placeholder text..."
                      />
                    </div>
                    
                    <div className="col-span-4 flex items-end pb-1">
                      <Space>
                        <Switch 
                          checked={q.is_required} 
                          onChange={(v) => updateQuestion(idx, "is_required", v)}
                        />
                        <span>Required</span>
                      </Space>
                    </div>
                    
                    {["Dropdown", "Select", "Multi-select", "Radio", "Checkbox"].includes(q.type) && (
                      <div className="col-span-12 mt-2">
                        <div className="mb-2 font-medium">Options (Type and press Enter)</div>
                        <Select
                          mode="tags"
                          className="w-full"
                          value={q.options || []}
                          onChange={(opts) => {
                            updateQuestion(idx, "options", opts);
                          }}
                          placeholder="Type an option and press Enter..."
                          open={false}
                        />
                      </div>
                    )}
                  </div>
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>

          <Button 
            type="dashed" 
            block 
            icon={<PlusOutlined />} 
            onClick={addQuestion} 
            size="large"
            className="mb-6"
          >
            Add Question
          </Button>

          <Divider />

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit" size="large" loading={loading} className="px-8">
              Save Survey
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SurveyBuilder;
