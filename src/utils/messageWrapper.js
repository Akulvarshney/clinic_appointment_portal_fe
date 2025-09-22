import { notification } from "antd";
import React, { createContext, useContext } from "react";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notificationApi, contextHolder] = notification.useNotification();

  const notificationMethods = {
    open: notificationApi.open,
    success: notificationApi.success,
    error: notificationApi.error,
    info: notificationApi.info,
    warning: notificationApi.warning,
  };

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};
