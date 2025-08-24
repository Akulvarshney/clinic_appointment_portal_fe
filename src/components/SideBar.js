import React, { useState } from "react";
import { FaUser, FaBars, FaChevronLeft } from "react-icons/fa";

import { ROUTE_COMPONENTS } from "../App"; // ✅ import route config

const Sidebar = ({
  collapsedDefault = false,
  organizations,
  selectedOrgId,
  onOrgChange,
  tabs,
  navigate,
  location,
  logout,
}) => {
  const [collapsed, setCollapsed] = useState(collapsedDefault);

  return (
    <aside
      className={`h-screen bg-gradient-to-b shadow-xl border-r border-gray-200 text-white transition-all duration-300 flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`flex flex-col flex-1 overflow-hidden rounded-lg bg-blue-900 ${
          collapsed ? "m-1" : "m-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-blue-500">
          {!collapsed && (
            <h2 className="text-lg font-semibold tracking-wide uppercase">
              GloryWellnic
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-full bg-white text-blue-700 hover:text-blue-500 transition"
          >
            {collapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Organization Selector */}
        {!collapsed && (
          <div className="p-4 border-b border-blue-500">
            <label className="text-gray-200 text-sm block mb-1">
              Select Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              className="w-full p-2 rounded bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {organizations.map((org) => (
                <option key={org.organizationId} value={org.organizationId}>
                  {org.organizationName || org.shortorgname}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto ">
          <ul className="p-2 space-y-3 my-0 mx-auto">
            {tabs
              .slice()
              .sort((a, b) => a.tab_number - b.tab_number)
              .map((tab) => {
                const routeConfig = ROUTE_COMPONENTS[tab.tab_path];
                const Icon = routeConfig?.icon || <FaUser />;

                return (
                  <li
                    key={tab.tab_id}
                    onClick={() => navigate(`${tab.tab_path}`)}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 cursor-pointer  ${
                      location.pathname === tab.tab_path
                        ? "bg-white text-blue-800 shadow-inner"
                        : "hover:bg-blue-500 hover:shadow-md"
                    }`}
                  >
                    <span className="p-2 rounded-full bg-white text-blue-700">
                      {Icon}
                    </span>
                    {!collapsed && (
                      <span className="font-semibold">{tab.tab_name}</span>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-blue-500 bg-blue-900">
          <div
            onClick={logout}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <span className="p-2 rounded-full bg-white text-red-600">
              <FaUser />
            </span>
            {!collapsed && <span className="font-semibold">Logout</span>}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
