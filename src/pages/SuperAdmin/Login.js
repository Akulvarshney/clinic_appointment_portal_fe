import React, { useState } from "react";
import axios from "axios";
import { Alert, Button, Card, Form, Input } from "antd";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../assets/constants";
import { useAuth } from "../../layouts/AuthContext";

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
        },
      );

      const { token, user } = response.data;

      login(user, token, [], user.role);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "SUPERADMIN") {
        navigate("/superadmin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMsg(
          error.response.data?.message || "Invalid login ID or password.",
        );
      } else {
        setErrorMsg("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gwn-super-login-page">
      <div className="gwn-super-orb one" />
      <div className="gwn-super-orb two" />

      <div className="gwn-super-shell">
        <Card className="gwn-super-card">
          <div className="gwn-super-kicker">
            <span className="gwn-super-dot" />
            Super Admin
          </div>

          <h1 className="gwn-super-title">Sign in</h1>
          <span className="gwn-super-subtitle">
            Access the GloryWellNic administrative workspace.
          </span>

          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              className="gwn-super-alert"
            />
          )}

          <Form
            form={form}
            name="superadmin-login"
            onFinish={handleLogin}
            autoComplete="off"
            layout="vertical"
            className="gwn-super-form"
            initialValues={{
              loginId: "admin",
              password: "admin123",
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
            >
              <Input
                prefix={<UserOutlined className="gwn-super-prefix" />}
                placeholder="Enter your login ID"
                size="large"
                className="gwn-super-input"
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
            >
              <Input.Password
                prefix={<LockOutlined className="gwn-super-prefix" />}
                placeholder="Enter your password"
                size="large"
                className="gwn-super-input"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="gwn-super-submit"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Form.Item>
          </Form>

          <div className="gwn-super-actions">
            <button type="button" onClick={() => navigate("/forgetpassword")}>
              <SafetyCertificateOutlined /> Forgot your password?
            </button>
            <Link to="/login">Login as Client</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
