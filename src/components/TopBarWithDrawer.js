import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { FaChartBar, FaUser } from "react-icons/fa";

const TopBarWithDrawer = ({
  organizations,
  selectedOrgId,
  onOrgChange,
  tabs,
  location,
  logout,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-3 px-3 py-3 sm:p-4 bg-gw-primary-dark text-white">
      <p className="min-w-0 flex-1 truncate text-base font-bold sm:text-lg">
        GloryWellnic
      </p>

      <div className="shrink-0">
        <Button
          type="text"
          className="!text-white text-lg flex items-center justify-center min-w-10 min-h-10"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <MenuOutlined />
        </Button>
        <Drawer
          title="Menu"
          placement="right"
          width={320}
          onClose={() => setOpen(false)}
          open={open}
          styles={{
            body: { paddingBottom: 24 },
            wrapper: { maxWidth: "min(calc(100vw - 16px), 320px)" },
          }}
        >
          {/* Organization Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              className="w-full p-2 rounded border border-gw-muted focus:outline-none focus:ring-2 focus:ring-gw-primary"
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
                <li key={tab.tab_id}>
                  <Link
                    to={tab.tab_path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 cursor-pointer no-underline text-inherit ${location.pathname === tab.tab_path
                        ? "bg-gw-primary-light/40 text-gw-primary-dark shadow-inner"
                        : "hover:bg-gw-surface hover:shadow-md"
                      }`}
                  >
                    <span className="p-2 rounded-full bg-gw-primary-light/50 text-gw-primary-dark">
                      <FaChartBar />
                    </span>
                    <span className="font-semibold">{tab.tab_name}</span>
                  </Link>
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
            <span className="p-2 rounded-full bg-red-100 text-red-600">
              <FaUser />
            </span>
            <span className="font-semibold text-gw-ink">Logout</span>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default TopBarWithDrawer;
