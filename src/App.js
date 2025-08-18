import { Route, Routes, Navigate } from "react-router-dom";

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

import "../src/App.css";
import Settings from "./pages/settings/Settings";
import ClientManagement from "./pages/ClientManagement";
import ClientDetailPage from "./pages/ClientDetailPage";

function App() {
  const { isLoggedIn, role, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return null;
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
          <Route path="*" element={<Navigate to="/superadmin/dashboard" />} />
        </Route>
      ) : isLoggedIn && role !== "SUPERADMIN" ? (
        <Route element={<LoggedInLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="clients">
            <Route index element={<ClientManagement />} />
            <Route path="detail/:clientId" element={<ClientDetailPage />} />
          </Route>
          <Route path="/roleManagement" element={<RoleManagement />} />
          <Route path="/employeeManagement" element={<UserMgmt />} />
          <Route path="/doctorManagement" element={<DoctorManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/resourceManagement" element={<ResourceManagement />} />
          <Route path="/servicesManagement" element={<ServicesManagement />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
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
