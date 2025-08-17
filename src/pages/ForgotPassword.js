import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Steps } from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../assets/constants";

const { Title, Text } = Typography;
const { Step } = Steps;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [step, setStep] = useState(1); // 1: Login ID, 2: OTP, 3: Reset Password
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loginId, setLoginId] = useState("");

  const sendOtpApi = async (identifier) => {
    const response = await fetch(`${BACKEND_URL}/noAuth/auth/forgotPassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: identifier,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return data;
  };

  const verifyOtpApi = async (identifier, otp) => {
    const response = await fetch(
      `${BACKEND_URL}/noAuth/auth/verifyPasswordResetOtp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier,
          otp: otp,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Invalid OTP");
    }

    return data;
  };

  const resetPasswordApi = async (identifier, newPassword) => {
    const response = await fetch(`${BACKEND_URL}/noAuth/auth/resetPassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: identifier,
        newPassword: newPassword,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to reset password");
    }

    return data;
  };

  const handleSendOtp = async (values) => {
    setErrorMsg("");
    setLoading(true);
    try {
      await sendOtpApi(values.loginId);
      setLoginId(values.loginId);
      setStep(2);
      form.setFieldsValue({ loginId: values.loginId });
    } catch (err) {
      setErrorMsg(err.message || "Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (values) => {
    setErrorMsg("");
    setLoading(true);
    try {
      await verifyOtpApi(loginId || values.loginId, values.otp);
      setStep(3);
      form.setFieldsValue({ loginId: loginId || values.loginId });
    } catch (err) {
      setErrorMsg(err.message || "Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }
    setErrorMsg("");
    setLoading(true);
    try {
      await resetPasswordApi(loginId || values.loginId, values.newPassword);

      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password. Please try again.");
    }
    setLoading(false);
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrorMsg("");
      form.resetFields(["otp", "newPassword", "confirmPassword"]);
    }
  };

  const stepTitles = ["Enter Login ID", "Verify OTP", "Reset Password"];

  return (
    <div className=" login-container  flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="text-center mb-6">
          <Title level={3} className="!mb-2 !text-gray-800">
            Forgot Password
          </Title>
          <Text type="secondary" className="text-base">
            {step === 1 && "Enter your Login ID to receive OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Enter your new password"}
          </Text>
        </div>

        {/* <div className="mb-6">
          <Steps current={step - 1} size="small">
            {stepTitles.map((title, index) => (
              <Step key={index} title={title} />
            ))}
          </Steps>
        </div> */}

        {/* Error Alert */}
        {errorMsg && (
          <Alert message={errorMsg} type="error" showIcon className="mb-4" />
        )}

        {/* Step 1: Login ID */}
        {step === 1 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendOtp}
            initialValues={{ loginId: "" }}
            className="space-y-4"
          >
            <Form.Item
              name="loginId"
              label="Login ID"
              rules={[
                { required: true, message: "Please enter your Login ID" },
                { min: 3, message: "Must be at least 3 characters" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your Login ID"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                // size="large"
                loading={loading}
                className="rounded-lg text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleVerifyOtp}
            initialValues={{ otp: "" }}
            className="space-y-4"
          >
            {/* Hidden field for loginId */}
            <Form.Item name="loginId" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="otp"
              label="OTP"
              rules={[
                { required: true, message: "Please enter the OTP" },
                { len: 6, message: "OTP must be 6 digits" },
                { pattern: /^\d+$/, message: "OTP must contain only numbers" },
              ]}
            >
              <Input
                prefix={<SafetyOutlined className="text-gray-400" />}
                placeholder="Enter 6-digit OTP"
                size="large"
                className="rounded-lg text-center text-lg tracking-widest"
                maxLength={6}
              />
            </Form.Item>

            <div className="flex space-x-3">
              <Button
                onClick={goBack}
                size="large"
                className="flex-1 rounded-lg h-12 text-base"
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="flex-1 rounded-lg h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </Form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleResetPassword}
            initialValues={{ newPassword: "", confirmPassword: "" }}
            className="space-y-4"
          >
            {/* Hidden field for loginId */}
            <Form.Item name="loginId" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 8, message: "Password must be at least 8 characters" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message:
                    "Password must contain uppercase, lowercase, number and special character",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter new password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="flex space-x-3">
              <Button
                onClick={goBack}
                size="large"
                className="flex-1 rounded-lg h-12 text-base"
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="flex-1 rounded-lg h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save New Password"}
              </Button>
            </div>
          </Form>
        )}

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <Text type="secondary" className="text-sm">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
