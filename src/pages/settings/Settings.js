import React, { useEffect } from "react";
import RoleManagement from "../RoleCreation";
import ClientCategories from "../ClientCategories";
import Profile from "../Profile";

const { Table, Tabs } = require("antd");
const { TabPane } = Tabs;

const Settings = () => {
  const [organizations, setOrganizations] = React.useState([]);
  const [selectedOrgId, setSelectedOrgId] = React.useState("");
  const [tabs, setTabs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState("");

  useEffect(() => {
    const storedOrgs = JSON.parse(
      localStorage.getItem("organizations") || "[]"
    );
    const storedSelected = localStorage.getItem("selectedOrganizationId");

    setOrganizations(storedOrgs);
    const selected = storedSelected || storedOrgs[0]?.organizationId;
    setSelectedOrgId(selected);

    if (selected) {
      const selectedOrg = storedOrgs.find(
        (org) => org.organizationId === selected
      );

      const roleTabs = selectedOrg?.roles?.[0]?.tabs || [];

      const settingsTab = roleTabs.find(
        (tab) => tab.tab_name === "Settings" && tab.is_valid
      );

      const validFeatures =
        settingsTab?.features?.filter((feature) => feature.is_valid) || [];

      console.log("Valid Features:", validFeatures);

      // Sort tabs to ensure PROFILE_PAGE comes first
      const sortedTabs = sortTabsByPriority(validFeatures);

      setTabs(sortedTabs);
      if (sortedTabs.length > 0) {
        // Always set Profile Page as the default active tab if it exists
        const profileTab = sortedTabs.find(
          (tab) => tab.feature_unique_name === "PROFILE_PAGE"
        );
        setActiveKey(
          profileTab ? "PROFILE_PAGE" : sortedTabs[0].feature_unique_name
        );
      }
    }
  }, []);

  // Function to sort tabs with PROFILE_PAGE first
  const sortTabsByPriority = (features) => {
    const profileTab = features.find(
      (feature) => feature.feature_unique_name === "PROFILE_PAGE"
    );
    const otherTabs = features.filter(
      (feature) => feature.feature_unique_name !== "PROFILE_PAGE"
    );

    // Return profile tab first, followed by other tabs
    return profileTab ? [profileTab, ...otherTabs] : otherTabs;
  };

  const renderActiveComponent = () => {
    switch (activeKey) {
      case "PROFILE_PAGE":
        return <Profile />;
      case "MANAGE_USERS":
        return <div>Coming Soon</div>;
      case "SYSTEM_PREFERENCES":
        return <div>Coming Soon</div>;
      case "AUDIT_LOGS":
        return <div>Coming Soon</div>;
      case "ROLE_MANAGEMENT":
        return <RoleManagement />;
      case "CLIENT_CATEGORIES":
        return <ClientCategories />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="pageCss">
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={tabs.map((feature) => ({
          key: feature.feature_unique_name,
          label: feature.feature_name,
        }))}
      />
      <div style={{ marginTop: 20 }}>{renderActiveComponent()}</div>
    </div>
  );
};

export default Settings;
