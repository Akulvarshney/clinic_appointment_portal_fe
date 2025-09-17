import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./layouts/AuthContext";
import { App as AntdApp } from "antd";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
