import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../layouts/AuthContext";
import { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import TopBarWithDrawer from "../components/TopBarWithDrawer";
import {
  canNavigateWhenOrgExpired,
  getExpiredRedirectPath,
} from "../utils/orgSubscription";

const LoggedInLayout = () => {
  const { logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  // New: when org is expired, block non-allowed routes (check uses allowed URL list in util).
  useEffect(() => {
    if (!selectedOrgId || !organizations.length) return;

    const redirectPath = getExpiredRedirectPath(selectedOrgId, role);
    if (!redirectPath) return;

    if (!canNavigateWhenOrgExpired(location.pathname, selectedOrgId, role)) {
      navigate(redirectPath, { replace: true });
    }
  }, [location.pathname, selectedOrgId, organizations, navigate, role]);

  const handleOrgChange = (newOrgId) => {
    setSelectedOrgId(newOrgId);
    localStorage.setItem("selectedOrganizationId", newOrgId);
    localStorage.setItem("selectedOrgId", newOrgId);
    updateTabs(organizations, newOrgId);

    const redirectPath = getExpiredRedirectPath(newOrgId, role);
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden md:h-[100dvh] md:max-h-[100dvh] md:flex-row md:overflow-hidden">
      <div className="hidden shrink-0 md:block">
        <Sidebar
          collapsedDefault={false}
          organizations={organizations}
          selectedOrgId={selectedOrgId}
          onOrgChange={handleOrgChange}
          tabs={tabs}
          location={location}
          logout={logout}
        />
      </div>

      <div className="shrink-0 md:hidden">
        <TopBarWithDrawer
          organizations={organizations}
          selectedOrgId={selectedOrgId}
          onOrgChange={handleOrgChange}
          tabs={tabs}
          location={location}
          logout={logout}
        />
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-gw-surface">
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedInLayout;
