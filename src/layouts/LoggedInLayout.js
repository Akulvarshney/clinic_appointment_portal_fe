import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../layouts/AuthContext";
import { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import TopBarWithDrawer from "../components/TopBarWithDrawer";

const LoggedInLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const storedOrgs = JSON.parse(
      localStorage.getItem("organizations") || "[]"
    );
    const storedSelected = localStorage.getItem("selectedOrganizationId");

    setOrganizations(storedOrgs);
    const selected = storedSelected || storedOrgs[0]?.organizationId;
    setSelectedOrgId(selected);

    if (selected) updateTabs(storedOrgs, selected);
  }, []);

  const updateTabs = (orgs, orgId) => {
    const selectedOrg = orgs.find((org) => org.organizationId === orgId);
    const roleTabs = selectedOrg?.roles?.[0]?.tabs || [];
    const validTabs = roleTabs.filter((tab) => tab.is_valid);
    setTabs(validTabs);
  };

  const handleOrgChange = (newOrgId) => {
    setSelectedOrgId(newOrgId);
    localStorage.setItem("selectedOrganizationId", newOrgId);
    updateTabs(organizations, newOrgId);
  };

  return (
    <div style={{ height: "100vh" }} className="flex flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar
          collapsedDefault={false}
          organizations={organizations}
          selectedOrgId={selectedOrgId}
          onOrgChange={handleOrgChange}
          tabs={tabs}
          navigate={navigate}
          location={location}
          logout={logout}
        />
      </div>

      <div className="md:hidden">
        <TopBarWithDrawer
          organizations={organizations}
          selectedOrgId={selectedOrgId}
          onOrgChange={handleOrgChange}
          tabs={tabs}
          navigate={navigate}
          location={location}
          logout={logout}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedInLayout;
