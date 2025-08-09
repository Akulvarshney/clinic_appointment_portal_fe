import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, Alert, Card, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../assets/constants";
import { useAuth } from "../../layouts/AuthContext";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/noAuth/auth/superadmin/login`,
        {
          login_id: values.loginId,
          password: values.password,
        }
      );

      console.log("Login success:", response.data);

      const { token, user } = response.data;

      login(user, token);
      // Save user & token
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "SUPERADMIN") {
        navigate("/superadmin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("An error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = () => {
    // Add forgot password logic here
    console.log("Forgot password clicked");
  };

  const handleClientLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <Card className="login-card">
          <div className="login-content">
            {/* Header */}
            <div className="login-header">
              <Title level={3} className="login-title">
                Sign in
              </Title>
              <Text className="login-subtitle">SuperAdmin Login Page</Text>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                className="error-alert"
              />
            )}

            {/* Login Form */}
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              layout="vertical"
              className="login-form"
              initialValues={{
                loginId: "admin", // Default login ID
                password: "admin123", // Default password
              }}
            >
              <Form.Item
                name="loginId"
                label="Login ID"
                rules={[
                  {
                    required: true,
                    message: "Please input your login ID!",
                  },
                ]}
                className="form-item"
              >
                <Input
                  prefix={<UserOutlined className="input-prefix" />}
                  placeholder="Enter your login ID"
                  size="large"
                  className="form-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                className="form-item"
              >
                <Input.Password
                  prefix={<LockOutlined className="input-prefix" />}
                  placeholder="Enter your password"
                  size="large"
                  className="form-input"
                />
              </Form.Item>

              <Form.Item className="form-item">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="login-button"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </Form.Item>
            </Form>

            {/* Action Buttons */}
            <div className="login-actions">
              <Button
                type="link"
                onClick={handleForgotPassword}
                className="action-button"
              >
                Forgot your password?
              </Button>
              <Button
                type="link"
                onClick={handleClientLogin}
                className="action-button"
              >
                Login as Client
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
