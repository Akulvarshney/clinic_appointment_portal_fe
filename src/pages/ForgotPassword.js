import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Input } from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  LockOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { BACKEND_URL } from "../assets/constants";

const RECOVERY_STEPS = [
  { id: 1, title: "Identify", label: "Login ID" },
  { id: 2, title: "Verify", label: "OTP" },
  { id: 3, title: "Secure", label: "New password" },
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loginId, setLoginId] = useState("");

  const sendOtpApi = async (identifier) => {
    const response = await fetch(`${BACKEND_URL}/noAuth/auth/forgotPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, newPassword }),
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
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      await resetPasswordApi(loginId || values.loginId, values.newPassword);
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrorMsg("");
      form.resetFields(["otp", "newPassword", "confirmPassword"]);
    }
  };

  const subtitle =
    step === 1
      ? "Enter your clinic Login ID and we will send a reset OTP."
      : step === 2
        ? "Enter the six-digit OTP sent to your registered email."
        : "Choose a strong new password to secure your workspace.";

  return (
    <div className="gwn-forgot-page">
      <div className="gwn-forgot-orb one" />
      <div className="gwn-forgot-orb two" />

      <div className="gwn-forgot-shell">
        <Link to="/login" className="gwn-forgot-back">
          <ArrowLeftOutlined />
          Back to sign in
        </Link>

        <Card className="gwn-forgot-card">
          <div className="gwn-forgot-panel">
            <div className="gwn-forgot-inner">
              <h2 className="gwn-forgot-form-title">Forgot password</h2>
              <span className="gwn-forgot-subtitle">{subtitle}</span>

              <div className="gwn-forgot-steps" aria-label="Reset progress">
                {RECOVERY_STEPS.map((item) => {
                  const done = step > item.id;
                  const active = step === item.id;

                  return (
                    <div
                      key={item.id}
                      className={[
                        "gwn-forgot-step",
                        active ? "active" : "",
                        done ? "done" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="gwn-forgot-step-top">
                        <span className="gwn-forgot-step-dot">
                          {done ? <CheckOutlined /> : item.id}
                        </span>
                        {item.title}
                      </div>
                      <span className="gwn-forgot-step-label">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

                {errorMsg && (
                  <Alert
                    message={errorMsg}
                    type="error"
                    showIcon
                    className="gwn-forgot-alert"
                  />
                )}

                {step === 1 && (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSendOtp}
                    initialValues={{ loginId: "" }}
                    className="gwn-forgot-form"
                  >
                    <Form.Item
                      name="loginId"
                      label="Login ID"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your Login ID",
                        },
                        {
                          min: 3,
                          message: "Must be at least 3 characters",
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined className="gwn-forgot-prefix" />}
                        placeholder="Enter your Login ID"
                        size="large"
                        className="gwn-forgot-input"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        className="gwn-forgot-submit"
                      >
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </Form.Item>
                  </Form>
                )}

                {step === 2 && (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleVerifyOtp}
                    initialValues={{ otp: "" }}
                    className="gwn-forgot-form"
                  >
                    <Form.Item name="loginId" hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="otp"
                      label="OTP"
                      rules={[
                        { required: true, message: "Please enter the OTP" },
                        { len: 6, message: "OTP must be 6 digits" },
                        {
                          pattern: /^\d+$/,
                          message: "OTP must contain only numbers",
                        },
                      ]}
                    >
                      <Input
                        prefix={
                          <SafetyOutlined className="gwn-forgot-prefix" />
                        }
                        placeholder="Enter 6-digit OTP"
                        size="large"
                        className="gwn-forgot-input gwn-forgot-otp"
                        maxLength={6}
                      />
                    </Form.Item>

                    <div className="gwn-forgot-actions">
                      <Button
                        onClick={goBack}
                        size="large"
                        className="gwn-forgot-secondary"
                      >
                        Back
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        className="gwn-forgot-submit"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>
                    </div>
                  </Form>
                )}

                {step === 3 && (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleResetPassword}
                    initialValues={{ newPassword: "", confirmPassword: "" }}
                    className="gwn-forgot-form"
                  >
                    <Form.Item name="loginId" hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        {
                          required: true,
                          message: "Please enter new password",
                        },
                        {
                          min: 8,
                          message: "Password must be at least 8 characters",
                        },
                        {
                          pattern:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message:
                            "Password must contain uppercase, lowercase, number and special character",
                        },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined className="gwn-forgot-prefix" />}
                        placeholder="Enter new password"
                        size="large"
                        className="gwn-forgot-input"
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Confirm Password"
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Passwords do not match"),
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined className="gwn-forgot-prefix" />}
                        placeholder="Confirm password"
                        size="large"
                        className="gwn-forgot-input"
                      />
                    </Form.Item>

                    <div className="gwn-forgot-actions">
                      <Button
                        onClick={goBack}
                        size="large"
                        className="gwn-forgot-secondary"
                      >
                        Back
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        className="gwn-forgot-submit"
                      >
                        {loading ? "Saving..." : "Save New Password"}
                      </Button>
                    </div>
                  </Form>
                )}
              <div className="gwn-forgot-footer">
                Remember your password? <Link to="/login">Sign in</Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
