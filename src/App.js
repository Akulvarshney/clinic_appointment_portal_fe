import { Route, Routes, Navigate } from "react-router-dom";
import { useMemo, useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import DoctorManagement from "./pages/doctorManagement";
import RoleManagement from "./pages/RoleCreation";
import UserMgmt from "./pages/EmployeeManagement";

import LoggedOutLayout from "./layouts/LoggedOutLayout";
import LoggedInLayout from "./layouts/LoggedInLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import Login from "./pages/SuperAdmin/Login";
import { useAuth } from "./layouts/AuthContext";
import DashboardSAPage from "./pages/SuperAdmin/DashboardSApage";
import OrganisationListing from "./pages/SuperAdmin/OrganisationListing";
import ResourceManagement from "./pages/ResourceManagement";
import ServicesManagement from "./pages/Services";
import AppointmentPage from "./pages/AppointmentPage";
import ForgotPassword from "./pages/ForgotPassword";
import ReminderManagement from "./pages/ReminderManagement";

import "../src/App.css";
import Settings from "./pages/settings/Settings";
import ClientManagement from "./pages/ClientManagement";
import ClientDetailPage from "./pages/ClientDetailPage";
import NotificationManagement from "./pages/SuperAdmin/NotificationCreation";

// ✅ Import icons
import {
  FaTachometerAlt,
  FaUserMd,
  FaUsers,
  FaUserShield,
  FaCogs,
  FaClipboardList,
  FaCalendarCheck,
  FaBell,
  FaUserFriends,
  FaCog,
} from "react-icons/fa";

// ✅ Updated route config with icons + labels
export const ROUTE_COMPONENTS = {
  "/dashboard": {
    component: DashboardPage,
    icon: <FaTachometerAlt />,
    label: "Dashboard",
  },
  "/employeeManagement": {
    component: UserMgmt,
    icon: <FaUsers />,
    label: "Employees",
  },
  "/doctorManagement": {
    component: DoctorManagement,
    icon: <FaUserMd />,
    label: "Doctors",
  },
  "/roleManagement": {
    component: RoleManagement,
    icon: <FaUserShield />,
    label: "Roles",
  },
  "/resourceManagement": {
    component: ResourceManagement,
    icon: <FaCogs />,
    label: "Resources",
  },
  "/servicesManagement": {
    component: ServicesManagement,
    icon: <FaClipboardList />,
    label: "Services",
  },
  "/appointments": {
    component: AppointmentPage,
    icon: <FaCalendarCheck />,
    label: "Appointments",
  },
  "/reminders": {
    component: ReminderManagement,
    icon: <FaBell />,
    label: "Reminders",
  },
  "/settings": {
    component: Settings,
    icon: <FaCog />,
    label: "Settings",
  },
  "/clients": {
    component: ClientManagement,
    icon: <FaUserFriends />,
    label: "Clients",
  },
};

const getUserAllowedRoutes = (selectedOrgId, userRole) => {
  try {
    const organizationsData = JSON.parse(
      localStorage.getItem("organizations") || "[]"
    );

    let roleName = userRole;
    if (typeof userRole === "object" && userRole !== null) {
      roleName =
        userRole.role_name ||
        userRole.roleName ||
        userRole.name ||
        userRole.role ||
        JSON.stringify(userRole);
    }

    if (!organizationsData.length) {
      return [];
    }

    const selectedOrg = organizationsData.find(
      (org) => org.organizationId === selectedOrgId
    );

    if (!selectedOrg) {
      return [];
    }

    const userRoleData = selectedOrg.roles.find(
      (role) => role.role_name === roleName
    );

    if (!userRoleData) {
      return [];
    }

    const allTabs = userRoleData.tabs;
    const validTabs = allTabs.filter((tab) => tab.is_valid);
    const allowedRoutes = validTabs.map((tab) => tab.tab_path);

    const filteredRoutes = allowedRoutes.filter(
      (path) => ROUTE_COMPONENTS[path]
    );
    return filteredRoutes;
  } catch (error) {
    return [];
  }
};

function App() {
  const { isLoggedIn, role, isAuthReady } = useAuth();

  const selectedOrgId = localStorage.getItem("selectedOrgId");

  const allowedRoutes = useMemo(() => {
    if (!isLoggedIn) {
      return [];
    }

    if (role === "SUPERADMIN") {
      return [];
    }

    if (!selectedOrgId) {
      return [];
    }

    return getUserAllowedRoutes(selectedOrgId, role);
  }, [isLoggedIn, role, selectedOrgId]);

  const defaultRoute = useMemo(() => {
    if (allowedRoutes.includes("/dashboard")) return "/dashboard";
    if (allowedRoutes.length > 0) return allowedRoutes[0];
    return "/dashboard";
  }, [allowedRoutes]);

  useEffect(() => {
    const orgData = localStorage.getItem("organizations");
    if (orgData) {
      try {
        JSON.parse(orgData);
      } catch (e) {
        console.error("Failed to parse organizations:", e);
      }
    }
  }, [isLoggedIn, role, selectedOrgId, allowedRoutes, defaultRoute]);

  if (!isAuthReady) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {isLoggedIn && role === "SUPERADMIN" ? (
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin/dashboard" element={<DashboardSAPage />} />
          <Route
            path="/sa/organisationListing"
            element={<OrganisationListing />}
          />
          <Route
            path="/sa/NotificationManagement"
            element={<NotificationManagement />}
          />
          <Route path="*" element={<Navigate to="/superadmin/dashboard" />} />
        </Route>
      ) : isLoggedIn && role !== "SUPERADMIN" ? (
        <Route element={<LoggedInLayout />}>
          {allowedRoutes.map((routePath) => {
            const { component: Component } = ROUTE_COMPONENTS[routePath];

            if (routePath === "/clients") {
              return (
                <Route key={routePath} path="clients">
                  <Route index element={<ClientManagement />} />
                  <Route
                    path="detail/:clientId"
                    element={<ClientDetailPage />}
                  />
                </Route>
              );
            }

            return (
              <Route key={routePath} path={routePath} element={<Component />} />
            );
          })}

          {allowedRoutes.length === 0 && (
            <Route
              path="*"
              element={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    flexDirection: "column",
                  }}
                >
                  <h2>No Access</h2>
                  <p>You don't have permission to access any pages.</p>
                </div>
              }
            />
          )}

          {allowedRoutes.length > 0 && (
            <Route path="*" element={<Navigate to={defaultRoute} />} />
          )}
        </Route>
      ) : (
        <Route element={<LoggedOutLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/superAdmin/login" element={<Login />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;
