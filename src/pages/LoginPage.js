import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../assets/constants";
import { PALETTE } from "../theme/palette";
import { useAuth } from "../layouts/AuthContext";
import { Form, Input, Button, Card, Alert, Space } from "antd";

const LoginPage = () => {
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
      const firstOrgId = organizations?.[0]?.organizationId || null;
      localStorage.setItem("selectedOrgId", firstOrgId);
      localStorage.setItem("selectedOrganizationId", firstOrgId);

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
    <div className="min-h-[90vh] justify-center items-center flex flex-col bg-gw-surface">
      <Card
        className="w-full max-w-md p-6"
        style={{
          borderRadius: "12px",
          boxShadow: "0 12px 28px rgba(129, 166, 198, 0.25)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h3
            className="text-xl font-semibold m-0 mb-1"
            style={{ color: PALETTE.primaryDark }}
          >
            Sign in
          </h3>
          <span className="text-gray-500 text-sm">Enter your credentials to continue</span>
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
              className="login-button"
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
          <Link
            to="/forgetpassword"
            className="text-sm text-gw-primary hover:text-gw-primary-dark"
          >
            Forgot your password?
          </Link>
          <Link
            to="/superAdmin/login"
            className="text-sm text-gw-primary hover:text-gw-primary-dark"
          >
            Login as Super Admin
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
