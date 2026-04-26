import React, { useMemo, useState } from "react";
import {
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaBuilding,
  FaRegCommentDots,
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

  const onOrgMenuClick = ({ key }) => onOrgChange(key);

  const expandedWidth = 240;
  const collapsedWidth = 72;

  return (
    <aside
      className="relative z-30 flex h-screen shrink-0 flex-col border-r border-gw-line bg-gw-bg-2 transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
      style={{ width: collapsed ? collapsedWidth : expandedWidth }}
      aria-label="Application navigation"
    >
      {/* Brand + collapse */}
      <div
        className={`flex shrink-0 items-center gap-2 border-b border-gw-line ${collapsed ? "flex-col px-2 py-4" : "px-4 py-4 pr-2"}`}
      >
        <div
          className={`flex min-w-0 flex-1 items-center gap-3 ${collapsed ? "flex-col" : ""}`}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-gw-2 bg-gw-ink text-[12px] font-semibold tracking-tight text-gw-bg"
            aria-hidden
          >
            GW
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-[10px] font-medium uppercase tracking-eyebrow text-gw-ink-3">
                Clinic OS
              </p>
              <p className="m-0 truncate font-display text-[18px] leading-tight text-gw-ink">
                Glory WellNic
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
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-gw-1 border border-gw-line bg-gw-bg text-gw-ink-2 transition hover:bg-gw-bg-3 hover:text-gw-ink focus:outline-none ${collapsed ? "mt-1" : ""}`}
          >
            {collapsed ? (
              <FaChevronRight className="text-[10px]" aria-hidden />
            ) : (
              <FaChevronLeft className="text-[10px]" aria-hidden />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Organization */}
      <div
        className={`shrink-0 border-b border-gw-line ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}
      >
        {collapsed ? (
          <Tooltip title={selectedOrgLabel} placement="right">
            <Dropdown
              menu={{ items: orgMenuItems, onClick: onOrgMenuClick }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                className="flex h-10 w-full items-center justify-center rounded-gw-2 border border-gw-line bg-gw-bg text-gw-ink-2 transition hover:bg-gw-bg-3 hover:text-gw-ink focus:outline-none"
                aria-label={`Switch organization. Current: ${selectedOrgLabel}`}
              >
                <FaBuilding className="text-[14px]" aria-hidden />
              </button>
            </Dropdown>
          </Tooltip>
        ) : (
          <div>
            <label
              htmlFor="sidebar-org-select"
              className="mb-1.5 block text-[10px] font-medium uppercase tracking-eyebrow text-gw-ink-3"
            >
              Organization
            </label>
            <select
              id="sidebar-org-select"
              value={selectedOrgId}
              onChange={(e) => onOrgChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-gw-2 border border-gw-line bg-gw-bg py-2.5 pl-3 pr-3 text-[13px] font-medium text-gw-ink focus:border-gw-ink focus:outline-none"
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
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {tabs
            .slice()
            .sort((a, b) => a.tab_number - b.tab_number)
            .map((tab) => {
              const routeConfig = ROUTE_COMPONENTS[tab.tab_path];
              const IconEl = routeConfig?.icon ?? <FaUser />;
              const active = routeIsActive(location.pathname, tab.tab_path);

              const itemClasses = [
                "group flex w-full cursor-pointer items-center rounded-gw-2 transition duration-150 ease-out outline-none no-underline",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-2.5 py-2",
                active
                  ? "bg-gw-bg text-gw-ink shadow-gw-1 ring-1 ring-gw-line"
                  : "text-gw-ink-2 hover:bg-gw-bg/70 hover:text-gw-ink",
              ].join(" ");

              const inner = (
                <Link
                  to={tab.tab_path}
                  className={itemClasses}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={[
                      "flex shrink-0 items-center justify-center transition-colors duration-150",
                      collapsed ? "h-8 w-8 text-[16px]" : "h-7 w-7 text-[14px]",
                      active ? "text-gw-accent" : "text-gw-ink-3 group-hover:text-gw-ink-2",
                    ].join(" ")}
                  >
                    {IconEl}
                  </span>
                  {!collapsed && (
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-snug">
                      {tab.tab_name}
                    </span>
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

      {/* AI assistant card — design.md §4 sidebar */}
      {!collapsed && (
        <div className="shrink-0 px-3 pb-2">
          <div className="rounded-gw-3 border border-gw-line bg-gw-accent-soft/60 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gw-accent text-white">
                <FaRegCommentDots className="text-[12px]" aria-hidden />
              </span>
              <p className="m-0 text-[11px] font-medium uppercase tracking-eyebrow text-gw-ink-2">
                AI Assistant
              </p>
            </div>
            <p className="mt-2 mb-0 font-display text-[15px] leading-tight text-gw-ink">
              <em>"Reschedule today's afternoon..."</em>
            </p>
            <button
              type="button"
              className="mt-2 inline-flex h-7 items-center rounded-full bg-gw-ink px-3 text-[11px] font-semibold text-gw-bg hover:bg-black"
            >
              Ask
            </button>
          </div>
        </div>
      )}

      {/* Sign out */}
      <div
        className={`mt-auto shrink-0 border-t border-gw-line ${collapsed ? "p-2" : "p-3"}`}
      >
        {collapsed ? (
          <Tooltip title="Sign out" placement="right">
            <button
              type="button"
              onClick={logout}
              className="flex h-10 w-full items-center justify-center rounded-gw-2 border border-gw-line bg-gw-bg text-gw-ink-2 transition hover:border-gw-danger/40 hover:bg-gw-danger-soft hover:text-gw-danger focus:outline-none"
              aria-label="Sign out"
            >
              <FaSignOutAlt className="text-[14px]" aria-hidden />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-gw-2 border border-gw-line bg-gw-bg px-3 py-2 text-left text-[13px] font-medium text-gw-ink-2 transition hover:border-gw-danger/30 hover:bg-gw-danger-soft hover:text-gw-danger focus:outline-none"
          >
            <FaSignOutAlt className="text-[13px]" aria-hidden />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
