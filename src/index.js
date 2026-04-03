import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./layouts/AuthContext";
import { App as AntdApp, ConfigProvider } from "antd";
import { NotificationProvider } from "./utils/messageWrapper";
import { PALETTE } from "./theme/palette";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <AuthProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: PALETTE.primary,
                colorInfo: PALETTE.primary,
                colorLink: PALETTE.primaryDark,
                colorBgLayout: PALETTE.surface,
                colorBgContainer: PALETTE.white,
                colorBorder: PALETTE.muted,
                borderRadius: 8,
              },
            }}
          >
            <AntdApp>
              <App />
            </AntdApp>
          </ConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </NotificationProvider>
  </React.StrictMode>
);
