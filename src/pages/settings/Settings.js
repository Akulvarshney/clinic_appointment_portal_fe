import React, { useEffect } from "react";
import RoleManagement from "../RoleCreation";
import ClientCategories from "../ClientCategories";
import Profile from "../Profile";
import NotificationCenter from "../NotificationCenter";
import OrganizationInfo from "../OrganizationInfo";

const { Tabs } = require("antd");

const Settings = () => {
  const [tabs, setTabs] = React.useState([]);
  const [activeKey, setActiveKey] = React.useState("");

  useEffect(() => {
    const storedOrgs = JSON.parse(
      localStorage.getItem("organizations") || "[]"
    );
    const storedSelected = localStorage.getItem("selectedOrganizationId");

    const selected = storedSelected || storedOrgs[0]?.organizationId;

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
      case "ORGANIZATION_INFO":
        return <OrganizationInfo />;
      case "ROLE_MANAGEMENT":
        return <RoleManagement />;
      case "CLIENT_CATEGORIES":
        return <ClientCategories />;
      case "NOTIFICATION_CENTER":
        return <NotificationCenter />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="pageCss min-w-0 max-w-full">
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        className="gw-settings-tabs min-w-0 [&_.ant-tabs-nav]:mb-2 [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-wrap]:pb-1 [&_.ant-tabs-nav-list]:flex-nowrap"
        items={tabs.map((feature) => ({
          key: feature.feature_unique_name,
          label: feature.feature_name,
        }))}
      />
      <div className="mt-4 min-w-0 sm:mt-5">{renderActiveComponent()}</div>
    </div>
  );
};

export default Settings;
