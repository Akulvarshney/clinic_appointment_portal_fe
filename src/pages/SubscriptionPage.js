import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { Table } from "antd";
import { PALETTE } from "../theme/palette";
import { isFeatureValid } from "../assets/constants";
import {
  getSelectedOrgId,
  getOrgById,
  isSelectedOrgExpired,
} from "../utils/orgSubscription";

/** Hardcoded until subscription APIs exist. */
const ALL_MODULES = [
  { key: "DASHBOARD", name: "Dashboard" },
  { key: "APPOINTMENT", name: "Appointments" },
  { key: "REMINDER", name: "Reminders" },
  { key: "CLIENT_LISTING", name: "Clients" },
  { key: "EMPLOYEE_MANAGEMENT", name: "Employees" },
  { key: "DOCTOR_MANAGEMENT", name: "Doctors" },
  { key: "SERVICE_MANAGEMENT", name: "Services" },
  { key: "RESOURCE_MANAGEMENT", name: "Resources" },
  { key: "BILLING", name: "Billing" },
  { key: "SETTINGS", name: "Settings" },
  { key: "FEEDBACK_MANAGEMENT", name: "Feedback" },
  { key: "INVENTORY_MANAGEMENT", name: "Inventory" },
  { key: "LEADS_TRACKER", name: "Lead Tracker" },
  { key: "VOICE_CALLS", name: "Voice Calls" },
  { key: "SUBSCRIPTION", name: "Subscription" },
];

const PREVIOUS_SUBSCRIPTIONS = [
  {
    id: "1",
    planName: "Growth Plan",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    amount: "₹24,000",
    status: "Expired",
  },
  {
    id: "2",
    planName: "Starter Plan",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    amount: "₹12,000",
    status: "Expired",
  },
];

const PAYMENT_HISTORY = [
  {
    id: "p1",
    date: "2025-01-05",
    description: "Growth Plan – Annual",
    amount: "₹24,000",
    method: "UPI",
    status: "Paid",
  },
  {
    id: "p2",
    date: "2024-01-08",
    description: "Starter Plan – Annual",
    amount: "₹12,000",
    method: "Card",
    status: "Paid",
  },
  {
    id: "p3",
    date: "2023-06-12",
    description: "Starter Plan – Half yearly",
    amount: "₹6,500",
    method: "Net Banking",
    status: "Paid",
  },
];

const SUBSCRIBED_MODULE_KEYS = [
  "DASHBOARD",
  "APPOINTMENT",
  "REMINDER",
  "CLIENT_LISTING",
  "EMPLOYEE_MANAGEMENT",
  "DOCTOR_MANAGEMENT",
  "SERVICE_MANAGEMENT",
  "RESOURCE_MANAGEMENT",
  "BILLING",
  "SETTINGS",
  "SUBSCRIPTION",
];

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const StatusPill = ({ active, label }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
    ].join(" ")}
  >
    {label}
  </span>
);

const SectionCard = ({ title, children, action }) => (
  <section className="rounded-xl border border-gw-line bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="m-0 text-base font-semibold text-gw-ink sm:text-lg">
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const SubscriptionPage = () => {
  const canViewHistory = isFeatureValid("SUBSCRIPTION", "VIEW_SUBS_HISTORY");

  const { orgName, isExpired } = useMemo(() => {
    const orgId = getSelectedOrgId();
    const org = getOrgById(orgId);
    return {
      orgName: org?.organizationName || org?.shortorgname || "Organization",
      isExpired: isSelectedOrgExpired(orgId),
    };
  }, []);

  const subscribedModules = useMemo(
    () => ALL_MODULES.filter((m) => SUBSCRIBED_MODULE_KEYS.includes(m.key)),
    []
  );

  const otherModules = useMemo(
    () => ALL_MODULES.filter((m) => !SUBSCRIBED_MODULE_KEYS.includes(m.key)),
    []
  );

  const previousColumns = [
    { title: "Plan", dataIndex: "planName", key: "planName" },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      render: formatDate,
    },
    {
      title: "End",
      dataIndex: "endDate",
      key: "endDate",
      render: formatDate,
    },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <StatusPill active={status === "Active"} label={status} />
      ),
    },
  ];

  const paymentColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: formatDate,
    },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Method", dataIndex: "method", key: "method" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <StatusPill active={status === "Paid"} label={status} />
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100%",
        width: "100%",
        background: PALETTE.surface,
      }}
    >
      <div className="min-w-0 w-full flex-1 space-y-5 px-3 py-4 sm:px-6 sm:py-8">
        <div>
          <h1 className="m-0 text-xl font-bold text-gw-primary-dark sm:text-2xl lg:text-3xl">
            Subscription
          </h1>
          <p className="mt-2 mb-0 max-w-xl text-sm text-gw-ink-2 sm:text-base">
            View plan status, payment history, and module access for{" "}
            <span className="font-medium text-gw-ink">{orgName}</span>.
          </p>
        </div>

        {/* Current status */}
        <SectionCard title="Current status">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill
              active={!isExpired}
              label={isExpired ? "Expired" : "Active"}
            />
            <p className="m-0 text-sm text-gw-ink-2">
              {isExpired
                ? "This organization's subscription has expired. Renew to restore full access."
                : "This organization's subscription is active."}
            </p>
          </div>
        </SectionCard>

        {/* Previous subscription */}
        {canViewHistory && (
          <SectionCard title="Previous subscription">
            <Table
              rowKey="id"
              columns={previousColumns}
              dataSource={PREVIOUS_SUBSCRIPTIONS}
              pagination={false}
              size="middle"
              scroll={{ x: true }}
              locale={{ emptyText: "No previous subscriptions" }}
            />
          </SectionCard>
        )}

        {/* Payment history */}
        {canViewHistory && (
          <SectionCard title="Payment history">
            <Table
              rowKey="id"
              columns={paymentColumns}
              dataSource={PAYMENT_HISTORY}
              pagination={{ pageSize: 5, hideOnSinglePage: true }}
              size="middle"
              scroll={{ x: true }}
              locale={{ emptyText: "No payments found" }}
            />
          </SectionCard>
        )}

        {/* Modules */}
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Subscribed modules">
            <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
              {subscribedModules.map((mod) => (
                <li
                  key={mod.key}
                  className="flex items-center gap-2 rounded-lg border border-gw-line bg-gw-surface px-3 py-2 text-sm text-gw-ink"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  {mod.name}
                </li>
              ))}
            </ul>
            {subscribedModules.length === 0 && (
              <p className="m-0 text-sm text-gw-ink-3">No modules subscribed.</p>
            )}
          </SectionCard>

          <SectionCard title="Other modules">
            <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
              {otherModules.map((mod) => (
                <li
                  key={mod.key}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gw-line bg-gw-surface px-3 py-2 text-sm text-gw-ink-3"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-gw-ink-3/40" />
                  {mod.name}
                </li>
              ))}
            </ul>
            {otherModules.length === 0 && (
              <p className="m-0 text-sm text-gw-ink-3">
                All available modules are included in the subscription.
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </Box>
  );
};

export default SubscriptionPage;
