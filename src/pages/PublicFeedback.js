import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form, Input, Button, Radio, Checkbox, Select, DatePicker, Rate, message, Card, Typography, Spin, Alert, Divider } from "antd";
import { motion } from "framer-motion";
import { apiGet, apiPost } from "../utils/axiosCalls";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PublicFeedback = () => {
  const { feedbackId } = useParams();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [surveyForm, setSurveyForm] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (feedbackId) {
      fetchFeedbackDetails();
    }
  }, [feedbackId]);

  const fetchFeedbackDetails = async () => {
    setLoading(true);
    const res = await apiGet(`/noAuth/feedback/${feedbackId}`);
    if (res?.data) {
      setFeedbackData(res.data.feedback);
      if (res.data.isCompleted) {
        setAlreadySubmitted(true);
      } else {
        setSurveyForm(res.data.activeForm);
      }
    } else {
      setError("Failed to load feedback details.");
    }
    setLoading(false);
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    
    const answers = [];
    for (const [questionId, val] of Object.entries(values)) {
      if (val !== undefined && val !== null && val !== "") {
        const q = surveyForm.feedback_questions.find(q => q.id === questionId);
        let answerText = null;
        let answerJson = null;
        
        if (Array.isArray(val) || typeof val === "object") {
          answerJson = val;
        } else {
          answerText = String(val);
        }
        
        answers.push({
          questionId,
          answerText,
          answerJson
        });
      }
    }

    const payload = {
      formId: surveyForm.id,
      answers
    };

    const res = await apiPost(`/noAuth/feedback/${feedbackId}`, payload);
    if (res) {
      setSuccess(true);
      message.success("Thank you! Your feedback has been submitted.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gw-bg-2"><Spin size="large" /></div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gw-bg-2 p-4">
        <Alert message="Error" description={error} type="error" showIcon className="max-w-md w-full shadow-lg rounded-2xl" />
      </div>
    );
  }

  if (success || alreadySubmitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gw-bg-2 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="text-center shadow-2xl rounded-3xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-7xl mb-6 text-green-500 drop-shadow-md"
            >
              🎉
            </motion.div>
            <Title level={2} className="!text-gray-800 mb-2">Thank You!</Title>
            <Text className="text-gray-500 block text-lg mb-4">
              {alreadySubmitted ? "You have already submitted this feedback." : "Your feedback helps us improve our services."}
            </Text>
          </Card>
        </motion.div>
      </div>
    );
  }

  const renderQuestionInput = (q) => {
    const opts = q.options ? JSON.parse(q.options) : [];
    switch (q.type) {
      case "Textarea":
        return <TextArea rows={4} size="large" placeholder={q.placeholder || "Type your thoughts here..."} className="rounded-xl" />;
      case "Number":
        return <Input type="number" size="large" placeholder={q.placeholder} className="rounded-xl" />;
      case "Email":
        return <Input type="email" size="large" placeholder={q.placeholder} className="rounded-xl" />;
      case "Date":
        return <DatePicker size="large" className="w-full rounded-xl" placeholder={q.placeholder} />;
      case "Dropdown":
      case "Select":
        return (
          <Select size="large" className="w-full rounded-xl" placeholder={q.placeholder || "Select an option"}>
            {opts.map(o => <Option key={o} value={o}>{o}</Option>)}
          </Select>
        );
      case "Multi-select":
        return (
          <Select mode="multiple" size="large" className="w-full rounded-xl" placeholder={q.placeholder || "Select options"}>
            {opts.map(o => <Option key={o} value={o}>{o}</Option>)}
          </Select>
        );
      case "Radio":
        return (
          <Radio.Group className="w-full">
            <div className="space-y-3 flex flex-col">
              {opts.map(o => (
                <Radio key={o} value={o} className="text-base text-gray-700 hover:text-gw-accent transition-colors">
                  {o}
                </Radio>
              ))}
            </div>
          </Radio.Group>
        );
      case "Checkbox":
        return <Checkbox.Group options={opts} className="flex flex-col space-y-3 text-base text-gray-700" />;
      case "Rating":
        return <Rate className="text-3xl text-yellow-400" />;
      case "Yes/No":
        return (
          <Radio.Group className="w-full">
            <div className="flex space-x-6">
              <Radio value="Yes" className="text-base text-gray-700 hover:text-gw-accent transition-colors">Yes</Radio>
              <Radio value="No" className="text-base text-gray-700 hover:text-gw-accent transition-colors">No</Radio>
            </div>
          </Radio.Group>
        );
      case "Text":
      default:
        return <Input size="large" placeholder={q.placeholder || "Type here..."} className="rounded-xl" />;
    }
  };

  const clientName = feedbackData?.appointments?.clients?.first_name 
    ? `${feedbackData.appointments.clients.first_name} ${feedbackData.appointments.clients.last_name || ''}` 
    : "Valued Client";

  return (
    <div className="min-h-screen bg-gw-bg-2">
      {/* Top Branding Bar */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gw-accent flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gw-accent tracking-tight">
              GloryWellnic
            </span>
          </div>
          <Text className="text-xs font-semibold text-gw-ink-3 uppercase tracking-widest hidden sm:block">
            Patient Portal
          </Text>
        </div>
      </div>

      <div className="py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl rounded-3xl border-0 overflow-hidden bg-white/80 backdrop-blur-md">
            
            {/* Header Section */}
            <div className="bg-gw-accent p-8 -m-6 mb-8 text-center relative overflow-hidden flex flex-col items-center">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <Title level={2} className="!text-white mb-2 relative z-10 font-semibold tracking-wide">
                Feedback Survey
              </Title>
              <Text className="text-white/80 block text-lg font-medium relative z-10">
                {feedbackData?.organizations?.name || "Our Clinic"}
              </Text>
            </div>

            {/* Welcome Message */}
            <div className="mb-10 px-2">
              <div className="p-6 bg-gw-bg-3 rounded-2xl border border-gw-line shadow-sm">
                <Text className="text-gray-700 block text-lg mb-4 text-center">
                  Hello <strong className="text-gw-ink font-semibold">{clientName}</strong>, we hope you had a great experience!
                </Text>
                
                <div className="bg-white rounded-xl overflow-hidden border border-gw-line shadow-sm">
                  <table className="w-full text-left text-sm text-gray-600">
                    <tbody className="divide-y divide-gw-line">
                      <tr>
                        <th className="px-4 py-3 bg-gw-bg-3 font-medium text-gray-700 w-1/3">Patient</th>
                        <td className="px-4 py-3 font-semibold text-gray-800">{clientName}</td>
                      </tr>
                      {feedbackData?.appointments?.doctors?.first_name && (
                        <tr>
                          <th className="px-4 py-3 bg-gw-bg-3 font-medium text-gray-700">Doctor</th>
                          <td className="px-4 py-3">{feedbackData.appointments.doctors.first_name} {feedbackData.appointments.doctors.last_name || ''}</td>
                        </tr>
                      )}
                      {feedbackData?.appointments?.services?.name && (
                        <tr>
                          <th className="px-4 py-3 bg-gw-bg-3 font-medium text-gray-700">Service</th>
                          <td className="px-4 py-3">{feedbackData.appointments.services.name}</td>
                        </tr>
                      )}
                      <tr>
                        <th className="px-4 py-3 bg-gw-bg-3 font-medium text-gray-700">Date</th>
                        <td className="px-4 py-3">
                          {feedbackData?.appointments?.date_time ? new Date(feedbackData.appointments.date_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <Text className="text-gray-600 text-center block mt-4 text-base">
                  We would love to hear your feedback!
                </Text>
              </div>
            </div>

            {/* Survey Form */}
            {surveyForm && surveyForm.feedback_questions && surveyForm.feedback_questions.length > 0 ? (
              <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional" className="px-2">
                
                <div className="mb-8 text-center">
                  <Title level={3} className="!text-gray-800">{surveyForm.title}</Title>
                  {surveyForm.description && <Text className="text-gray-500 text-base block mt-2">{surveyForm.description}</Text>}
                </div>

                {surveyForm.feedback_questions.map((q, index) => (
                  <motion.div 
                    key={q.id} 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="mb-8"
                  >
                    <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300">
                      <Form.Item
                        name={q.id}
                        label={<span className="text-lg font-medium text-gray-800 mb-2 block">{`${index + 1}. ${q.label}`}</span>}
                        rules={[{ required: q.is_required, message: "This question is required" }]}
                        className="mb-0"
                      >
                        <div className="mt-2">
                          {renderQuestionInput(q)}
                        </div>
                      </Form.Item>
                    </div>
                  </motion.div>
                ))}

                <Divider className="my-10" />
                
                {/* Submit Button */}
                <motion.div 
                  className="flex justify-center pb-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    loading={submitting} 
                    className="px-14 h-14 rounded-full text-lg font-medium shadow-lg hover:shadow-xl bg-gw-accent hover:from-blue-700 hover:to-teal-600 border-0 transition-all"
                  >
                    Submit Feedback
                  </Button>
                </motion.div>
              </Form>
            ) : (
              <Alert message="No active survey form found." type="warning" className="rounded-xl shadow-sm" />
            )}
          </Card>
        </motion.div>
        
        <div className="mt-8 text-center">
          <Text className="text-gray-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} GloryWellnic. All rights reserved.
          </Text>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PublicFeedback;
