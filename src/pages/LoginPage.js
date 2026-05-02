import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Card, Form, Input, Space } from "antd";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { BACKEND_URL } from "../assets/constants";
import { useAuth } from "../layouts/AuthContext";
import { PALETTE } from "../theme/palette";

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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("organizations", JSON.stringify(organizations));
      localStorage.setItem(
        "selectedOrgId",
        organizations?.[0]?.organizationId || null,
      );

      const finalRole = user?.role || organizations?.[0]?.roles?.[0] || null;
      login(user, token, organizations, finalRole);
      window.location.reload();
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
    <div className="gwn-login-page">
      <style>{`
        .gwn-login-page,
        .gwn-login-page * {
          box-sizing: border-box;
        }

        .gwn-login-page {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 96px 24px 48px;
          background:
            radial-gradient(circle at 50% -10%, rgba(123, 63, 242, 0.34) 0%, transparent 36%),
            radial-gradient(circle at 88% 78%, rgba(91, 43, 224, 0.24) 0%, transparent 34%),
            radial-gradient(circle at 8% 82%, rgba(168, 85, 247, 0.16) 0%, transparent 32%),
            linear-gradient(145deg, ${PALETTE.bg} 0%, ${PALETTE.bg2} 62%, ${PALETTE.bg} 100%);
          color: ${PALETTE.txt};
          font-family: "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .gwn-login-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(155, 107, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155, 107, 255, 0.07) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at 50% 46%, black 0%, transparent 68%);
          -webkit-mask-image: radial-gradient(circle at 50% 46%, black 0%, transparent 68%);
        }

        .gwn-login-orb {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(4px);
          opacity: 0.8;
        }

        .gwn-login-orb.one {
          width: 520px;
          height: 520px;
          top: -180px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(123, 63, 242, 0.34) 0%, transparent 68%);
        }

        .gwn-login-orb.two {
          width: 360px;
          height: 360px;
          right: -100px;
          bottom: -90px;
          background: radial-gradient(circle, rgba(91, 43, 224, 0.28) 0%, transparent 68%);
        }

        .gwn-login-shell {
          width: min(100%, 1060px);
          position: relative;
          z-index: 1;
        }

        .gwn-login-back {
          position: absolute;
          top: -56px;
          left: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: ${PALETTE.txt2};
          text-decoration: none;
          font-size: 0.78rem;
          font-weight: 400;
          transition: color 0.2s ease;
        }

        .gwn-login-back:hover {
          color: ${PALETTE.p4};
        }

        .gwn-login-card {
          overflow: hidden;
          border-radius: 24px !important;
          border: 1px solid rgba(155, 107, 255, 0.22) !important;
          background: rgba(255, 255, 255, 0.045) !important;
          box-shadow:
            0 32px 90px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .gwn-login-card .ant-card-body {
          padding: 0 !important;
        }

        .gwn-login-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          min-height: 620px;
        }

        .gwn-login-brand {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          padding: clamp(32px, 5vw, 56px);
          border-right: 1px solid rgba(155, 107, 255, 0.16);
          background:
            radial-gradient(circle at 24% 20%, rgba(196, 168, 255, 0.22) 0%, transparent 38%),
            linear-gradient(145deg, rgba(123, 63, 242, 0.16), rgba(6, 4, 13, 0.08));
        }

        .gwn-login-brand::after {
          content: "";
          position: absolute;
          inset: auto -20% -30% 10%;
          height: 300px;
          pointer-events: none;
          background: radial-gradient(ellipse, rgba(155, 107, 255, 0.16) 0%, transparent 70%);
        }

        .gwn-login-logo {
          font-size: 1.06rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${PALETTE.txt};
        }

        .gwn-login-logo span {
          color: ${PALETTE.p4};
          font-family: "Playfair Display", Georgia, serif;
          font-style: italic;
          font-weight: 400;
        }

        .gwn-login-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          margin: 48px 0 18px;
          padding: 7px 14px;
          border: 1px solid rgba(155, 107, 255, 0.28);
          border-radius: 999px;
          background: rgba(155, 107, 255, 0.1);
          color: ${PALETTE.p4};
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .gwn-login-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${PALETTE.p3};
          box-shadow: 0 0 18px rgba(155, 107, 255, 0.75);
        }

        .gwn-login-title {
          max-width: 540px;
          margin: 0;
          color: ${PALETTE.txt};
          font-size: clamp(2.8rem, 6vw, 5.7rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 0.96;
        }

        .gwn-login-title em {
          display: block;
          color: ${PALETTE.p4};
          font-family: "Playfair Display", Georgia, serif;
          font-size: 0.86em;
          font-style: italic;
          font-weight: 300;
        }

        .gwn-login-copy {
          max-width: 500px;
          margin: 24px 0 0;
          color: ${PALETTE.txt2};
          font-size: 0.92rem;
          font-weight: 300;
          line-height: 1.85;
        }

        .gwn-login-stats {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 54px;
          overflow: hidden;
          border: 1px solid rgba(155, 107, 255, 0.12);
          border-radius: 18px;
          background: rgba(155, 107, 255, 0.14);
        }

        .gwn-login-stat {
          min-height: 110px;
          padding: 20px;
          background: rgba(6, 4, 13, 0.38);
        }

        .gwn-login-stat strong {
          display: block;
          color: ${PALETTE.p4};
          font-family: "Playfair Display", Georgia, serif;
          font-size: 2.1rem;
          font-weight: 300;
          line-height: 1;
        }

        .gwn-login-stat span {
          display: block;
          margin-top: 8px;
          color: ${PALETTE.txt3};
          font-size: 0.64rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          line-height: 1.5;
          text-transform: uppercase;
        }

        .gwn-login-form-panel {
          display: flex;
          align-items: center;
          padding: clamp(30px, 4.8vw, 56px);
        }

        .gwn-login-form-inner {
          width: 100%;
          max-width: 390px;
          margin: 0 auto;
        }

        .gwn-login-form-title {
          margin: 0 0 8px;
          color: ${PALETTE.txt};
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 1.05;
        }

        .gwn-login-form-subtitle {
          display: block;
          margin-bottom: 28px;
          color: ${PALETTE.txt2};
          font-size: 0.88rem;
          font-weight: 300;
          line-height: 1.7;
        }

        .gwn-login-form .ant-form-item {
          margin-bottom: 18px !important;
        }

        .gwn-login-form .ant-form-item-label > label {
          color: ${PALETTE.txt2} !important;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .gwn-login-input,
        .gwn-login-input.ant-input-affix-wrapper {
          height: 48px !important;
          border-color: rgba(155, 107, 255, 0.18) !important;
          border-radius: 14px !important;
          background: rgba(6, 4, 13, 0.42) !important;
          color: ${PALETTE.txt} !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
        }

        .gwn-login-input:hover,
        .gwn-login-input.ant-input-affix-wrapper:hover,
        .gwn-login-input.ant-input-affix-wrapper-focused {
          border-color: rgba(196, 168, 255, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(123, 63, 242, 0.14) !important;
        }

        .gwn-login-input input,
        .gwn-login-input .ant-input {
          background: transparent !important;
          color: ${PALETTE.txt} !important;
        }

        .gwn-login-input input::placeholder,
        .gwn-login-input .ant-input::placeholder {
          color: ${PALETTE.txt3} !important;
        }

        .gwn-login-prefix,
        .gwn-login-input .ant-input-password-icon {
          color: ${PALETTE.p4} !important;
        }

        .gwn-login-submit {
          height: 48px !important;
          margin-top: 4px;
          border: 0 !important;
          border-radius: 999px !important;
          background: linear-gradient(135deg, ${PALETTE.p4}, ${PALETTE.p1}) !important;
          color: ${PALETTE.bg} !important;
          font-weight: 700 !important;
          box-shadow: 0 14px 42px rgba(123, 63, 242, 0.34) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }

        .gwn-login-submit:hover,
        .gwn-login-submit:focus {
          transform: translateY(-1px);
          box-shadow: 0 18px 52px rgba(123, 63, 242, 0.44) !important;
        }

        .gwn-login-actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: ${PALETTE.p4};
          font-size: 0.82rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .gwn-login-actions a:hover {
          color: ${PALETTE.txt};
        }

        .gwn-login-alert {
          margin-bottom: 18px;
          border-color: rgba(255, 92, 115, 0.26) !important;
          border-radius: 14px !important;
          background: rgba(255, 92, 115, 0.1) !important;
          color: ${PALETTE.txt} !important;
        }

        .gwn-login-alert .ant-alert-message {
          color: ${PALETTE.txt} !important;
        }

        @media (max-width: 860px) {
          .gwn-login-page {
            align-items: flex-start;
            padding-top: 88px;
            overflow-y: auto;
          }

          .gwn-login-grid {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .gwn-login-brand {
            border-right: none;
            border-bottom: 1px solid rgba(155, 107, 255, 0.16);
          }

          .gwn-login-stats {
            margin-top: 34px;
          }
        }

        @media (max-width: 560px) {
          .gwn-login-page {
            padding: 78px 14px 28px;
          }

          .gwn-login-back {
            top: -46px;
          }

          .gwn-login-brand,
          .gwn-login-form-panel {
            padding: 26px;
          }

          .gwn-login-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="gwn-login-orb one" />
      <div className="gwn-login-orb two" />

      <div className="gwn-login-shell">
        <Card className="gwn-login-card">
          <div className="gwn-login-grid">
            <div className="gwn-login-brand">
              <div>
                <div className="gwn-login-logo">
                  Glory<span>Well</span>Nic
                </div>
                <div className="gwn-login-eyebrow">
                  <span className="gwn-login-dot" />
                  Clinic Portal
                </div>
                <h1 className="gwn-login-title">
                  Manage your entire
                  <em>clinic, beautifully.</em>
                </h1>
                <p className="gwn-login-copy">
                  Sign in to your scheduling, billing, inventory and access
                  control workspace built for modern clinics across India.
                </p>
              </div>
            </div>

            <div className="gwn-login-form-panel">
              <div className="gwn-login-form-inner">
                <h2 className="gwn-login-form-title">Sign in</h2>
                <span className="gwn-login-form-subtitle">
                  Enter your clinic credentials to continue.
                </span>

                {errorMsg && (
                  <Alert
                    message={errorMsg}
                    type="error"
                    showIcon
                    className="gwn-login-alert"
                  />
                )}

                <Form
                  layout="vertical"
                  onFinish={handleLogin}
                  autoComplete="on"
                  className="gwn-login-form"
                >
                  <Form.Item label="Login ID" required>
                    <Input
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="Enter Login ID"
                      size="large"
                      className="gwn-login-input"
                      prefix={<UserOutlined className="gwn-login-prefix" />}
                    />
                  </Form.Item>

                  <Form.Item label="Password" required>
                    <Input.Password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      size="large"
                      className="gwn-login-input"
                      prefix={<LockOutlined className="gwn-login-prefix" />}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      className="gwn-login-submit"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </Form.Item>
                </Form>

                <Space
                  direction="vertical"
                  size={10}
                  className="gwn-login-actions"
                  style={{ width: "100%", textAlign: "center", marginTop: 8 }}
                >
                  <Link to="/forgetpassword">
                    <SafetyCertificateOutlined /> Forgot your password?
                  </Link>
                  <Link to="/superAdmin/login">
                    <TeamOutlined /> Login as Super Admin
                  </Link>
                </Space>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
