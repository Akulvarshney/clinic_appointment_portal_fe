import React, { useEffect } from "react";
import RoleManagement from "../RoleCreation";
import ClientCategories from "../ClientCategories";

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
      setTabs(validFeatures);
      if (validFeatures.length > 0) {
        setActiveKey(validFeatures[0].feature_unique_name);
      }
    }
  }, []);

  const renderActiveComponent = () => {
    switch (activeKey) {
      case "MANAGE_USERS":
        return <div>Comming Soon</div>;
      case "SYSTEM_PREFERENCES":
        return <div>Comming Soon</div>;
      case "AUDIT_LOGS":
        return <div>Comming Soon</div>;
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
