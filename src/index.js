import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./layouts/AuthContext";
import { App as AntdApp, ConfigProvider } from "antd";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { NotificationProvider } from "./utils/messageWrapper";
import { PALETTE } from "./theme/palette";
import muiTheme from "./theme/muiTheme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <AuthProvider>
          <MuiThemeProvider theme={muiTheme}>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: PALETTE.accent,
                  colorInfo: PALETTE.accent,
                  colorLink: PALETTE.accentHover,
                  colorBgLayout: PALETTE.bg,
                  colorBgContainer: PALETTE.white,
                  colorBorder: PALETTE.line,
                  colorBorderSecondary: PALETTE.line,
                  colorText: PALETTE.ink,
                  colorTextSecondary: PALETTE.ink2,
                  colorTextTertiary: PALETTE.ink3,
                  colorSuccess: PALETTE.success,
                  colorWarning: PALETTE.warning,
                  colorError: PALETTE.danger,
                  borderRadius: 10,
                  fontFamily:
                    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: 13,
                },
                components: {
                  Button: { borderRadius: 999, controlHeight: 40, fontWeight: 600 },
                  Input: { borderRadius: 10, controlHeight: 44 },
                  Select: { borderRadius: 10, controlHeight: 44 },
                  Card: { borderRadiusLG: 14 },
                  Table: { headerBg: PALETTE.bg2, headerColor: PALETTE.ink2 },
                },
              }}
            >
              <AntdApp>
                <App />
              </AntdApp>
            </ConfigProvider>
          </MuiThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </NotificationProvider>
  </React.StrictMode>
);
