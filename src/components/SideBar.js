import React, { useMemo, useState } from "react";
import {
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaBuilding,
} from "react-icons/fa";
import { Dropdown, Tooltip } from "antd";
import { Link } from "react-router-dom";

import { ROUTE_COMPONENTS } from "../App";

function routeIsActive(pathname, tabPath) {
  if (pathname === tabPath) return true;
  if (tabPath && tabPath !== "/" && pathname.startsWith(`${tabPath}/`))
    return true;
  return false;
}

const Sidebar = ({
  collapsedDefault = false,
  organizations,
  selectedOrgId,
  onOrgChange,
  tabs,
  location,
  logout,
}) => {
  const [collapsed, setCollapsed] = useState(collapsedDefault);

  const selectedOrg = useMemo(
    () =>
      organizations.find((o) => o.organizationId === selectedOrgId) || null,
    [organizations, selectedOrgId]
  );

  const selectedOrgLabel =
    selectedOrg?.organizationName ||
    selectedOrg?.shortorgname ||
    "Organization";

  const orgMenuItems = useMemo(
    () =>
      organizations.map((org) => ({
        key: String(org.organizationId),
        label: org.organizationName || org.shortorgname,
        disabled: org.organizationId === selectedOrgId,
      })),
    [organizations, selectedOrgId]
  );

  const onOrgMenuClick = ({ key }) => {
    onOrgChange(key);
  };

  const expandedWidth = 280;
  const collapsedWidth = 76;

  return (
    <aside
      className="relative z-30 flex h-screen shrink-0 flex-col border-r border-black/8 bg-[linear-gradient(180deg,#5c82bc_0%,#4a70a9_48%,#3a5d91_100%)] shadow-[4px_0_24px_-8px_rgba(0,0,0,0.12)] transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
      style={{ width: collapsed ? collapsedWidth : expandedWidth }}
      aria-label="Application navigation"
    >
      {/* Top: brand + collapse — collapse control sits on the edge for a “dock” affordance */}
      <div
        className={`flex shrink-0 items-center gap-2 border-b border-white/10 ${collapsed ? "flex-col px-2 py-3" : "px-4 py-3 pr-2"
          }`}
      >
        <div
          className={`flex min-w-0 flex-1 items-center gap-3 ${collapsed ? "flex-col" : ""}`}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-sm font-semibold tracking-tight text-white shadow-inner ring-1 ring-white/15"
            aria-hidden
          >
            GW
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
                Clinic OS
              </p>
              <p className="truncate text-base font-semibold leading-tight text-white">
                GloryWellnic
              </p>
            </div>
          )}
        </div>

        <Tooltip
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          placement="right"
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-controls="sidebar-main-nav"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition hover:bg-white/18 focus:outline-none focus-visible:ring-2 focus-visible:ring-gw-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-[#4a70a9] ${collapsed ? "mt-1" : ""
              }`}
          >
            {collapsed ? (
              <FaChevronRight className="text-xs opacity-95" aria-hidden />
            ) : (
              <FaChevronLeft className="text-xs opacity-95" aria-hidden />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Organization */}
      <div
        className={`shrink-0 border-b border-white/10 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}
      >
        {collapsed ? (
          <Tooltip title={selectedOrgLabel} placement="right">
            <Dropdown
              menu={{
                items: orgMenuItems,
                onClick: onOrgMenuClick,
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-white/12 bg-white/8 text-white transition hover:bg-white/14 focus:outline-none focus-visible:ring-2 focus-visible:ring-gw-primary-light"
                aria-label={`Switch organization. Current: ${selectedOrgLabel}`}
              >
                <FaBuilding className="text-lg opacity-90" aria-hidden />
              </button>
            </Dropdown>
          </Tooltip>
        ) : (
          <div>
            <label
              htmlFor="sidebar-org-select"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/50"
            >
              Organization
            </label>
            <select
              id="sidebar-org-select"
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-white/12 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-gw-ink shadow-sm focus:border-gw-primary-light focus:outline-none focus:ring-2 focus:ring-gw-primary-light/60"
            >
              {organizations.map((org) => (
                <option key={org.organizationId} value={org.organizationId}>
                  {org.organizationName || org.shortorgname}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        id="sidebar-main-nav"
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3"
        aria-label="Workspace"
      >
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {tabs
            .slice()
            .sort((a, b) => a.tab_number - b.tab_number)
            .map((tab) => {
              const routeConfig = ROUTE_COMPONENTS[tab.tab_path];
              const IconEl = routeConfig?.icon ?? <FaUser />;
              const active = routeIsActive(location.pathname, tab.tab_path);

              const itemClasses = [
                "group flex w-full cursor-pointer items-center rounded-xl border transition duration-200 ease-out outline-none",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "border-white/20 bg-gw-surface text-gw-primary-dark shadow-md shadow-black/10 ring-1 ring-white/25"
                  : "border-transparent text-white/85 hover:border-white/12 hover:bg-white/10 hover:text-white",
              ].join(" ");

              const inner = (
                <Link
                  to={tab.tab_path}
                  className={`${itemClasses} no-underline`}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={[
                      "flex shrink-0 items-center justify-center transition-colors duration-200",
                      collapsed ? "h-9 w-9 text-lg" : "h-9 w-9 text-base",
                      active
                        ? "text-gw-primary-dark"
                        : "text-white/90 group-hover:text-white",
                    ].join(" ")}
                  >
                    {IconEl}
                  </span>
                  {!collapsed && (
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-snug">
                      {tab.tab_name}
                    </span>
                  )}
                  {active && !collapsed && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-gw-primary"
                      aria-hidden
                    />
                  )}
                </Link>
              );

              return (
                <li key={tab.tab_id} className="m-0 p-0">
                  {collapsed ? (
                    <Tooltip title={tab.tab_name} placement="right">
                      {inner}
                    </Tooltip>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Sign out */}
      <div
        className={`mt-auto shrink-0 border-t border-white/10 bg-black/10 ${collapsed ? "p-2" : "p-3"}`}
      >
        {collapsed ? (
          <Tooltip title="Sign out" placement="right">
            <button
              type="button"
              onClick={logout}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/8 text-white/95 transition hover:border-red-300/40 hover:bg-red-500/15 hover:text-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
              aria-label="Sign out"
            >
              <FaSignOutAlt className="text-base" aria-hidden />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-3 py-2.5 text-left text-sm font-semibold text-white/95 transition hover:border-red-300/35 hover:bg-red-500/12 hover:text-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/18 text-red-100">
              <FaSignOutAlt aria-hidden />
            </span>
            <span>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
