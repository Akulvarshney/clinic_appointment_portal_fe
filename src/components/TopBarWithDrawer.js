import React, { useState } from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { FaChartBar, FaUser } from "react-icons/fa";

const TopBarWithDrawer = ({
  organizations,
  selectedOrgId,
  onOrgChange,
  tabs,
  navigate,
  location,
  logout,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-between items-center p-4 bg-blue-500 text-white">
      <p className="text-lg font-bold">GloryWellnic</p>

      <div>
        <Button
          type="text"
          className="text-white text-lg"
          onClick={() => setOpen(true)}
        >
          <MenuOutlined />
        </Button>
        <Drawer title="Menu" onClose={() => setOpen(false)} open={open}>
          {/* Organization Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {organizations.map((org) => (
                <option key={org.organizationId} value={org.organizationId}>
                  {org.organizationName || org.shortorgname}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <ul className="space-y-3">
            {tabs
              .slice()
              .sort((a, b) => a.tab_number - b.tab_number)
              .map((tab) => (
                <li
                  key={tab.tab_id}
                  onClick={() => {
                    navigate(`${tab.tab_path}`);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                    location.pathname === tab.tab_path
                      ? "bg-blue-100 text-blue-800 shadow-inner"
                      : "hover:bg-blue-50 hover:shadow-md"
                  }`}
                >
                  <span className="p-2 rounded-full bg-blue-200 text-blue-700">
                    <FaChartBar />
                  </span>
                  <span className="font-semibold">{tab.tab_name}</span>
                </li>
              ))}
          </ul>

          {/* Logout */}
          <div
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="mt-6 flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
          >
            <span className="p-2 rounded-full bg-red-200 text-red-600">
              <FaUser />
            </span>
            <span className="font-semibold">Logout</span>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default TopBarWithDrawer;
