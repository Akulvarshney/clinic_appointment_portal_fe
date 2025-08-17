import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../assets/constants";
import { useAuth } from "../layouts/AuthContext";
import { Form, Input, Button, Typography, Card, Alert, Space } from "antd";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMsg("");
    if (!loginId || !password) {
      setErrorMsg("Login ID and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/noAuth/auth/login`, {
        loginId,
        password,
      });

      const { token, user, organizations } = response.data.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("organizations", JSON.stringify(organizations));
      localStorage.setItem(
        "selectedOrgId",
        organizations?.[0]?.organizationId || null
      );

      const finalRole = user?.role || organizations?.[0]?.roles?.[0] || null;
      login(user, token, organizations, finalRole);
      window.location.reload();
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("An error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[90vh] justify-center items-center flex flex-col  bg-gray-50">
      <Card
        className="w-full max-w-md p-6"
        style={{
          borderRadius: "12px",
          boxShadow: "0 12px 28px rgba(59, 130, 246, 0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <Title level={3} style={{ color: "#1e3a8a", marginBottom: "0.3rem" }}>
            Sign in
          </Title>
          <Text type="secondary">Enter your credentials to continue</Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            style={{ marginBottom: "1rem" }}
          />
        )}

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Login ID" required>
            <Input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="Enter Login ID"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Password" required>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                background: "linear-gradient(to right, #3b82f6, #2563eb)",
                border: "none",
                fontWeight: "600",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Form.Item>
        </Form>

        <Space
          direction="vertical"
          style={{
            width: "100%",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          <Button
            type="link"
            size="small"
            onClick={() => navigate("/forgetpassword")}
          >
            Forgot your password?
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate("/superAdmin/login")}
          >
            Login as Super Admin
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
