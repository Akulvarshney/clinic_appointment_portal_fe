import axios from "axios";
import React, { useState, useEffect } from "react";
import { Select, Spin, Dropdown, Modal, Form, Input, message, Button, Alert } from "antd";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { BACKEND_URL } from "../assets/constants";
import { apiGet } from "../utils/axiosCalls";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  UserOutlined,
  CalendarOutlined,
  RightOutlined,
  FieldTimeOutlined,
  DollarOutlined,
  KeyOutlined,
  LockOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { CHART_COLORS, PALETTE } from "../theme/palette";

function getStatusColor(status) {
  switch (status) {
    case "BOOKED":
      return "rgba(170, 205, 220, 0.55)";
    case "CONFIRMED":
      return "#c5f0dd";
    case "VISITED":
      return "#b2f5a6";
    case "NO_SHOW":
      return "#f2e59b";
    case "CANCELLED":
      return "#f5a17a";
    case "CLOSED":
      return "#97989c";
    default:
      return "#ffffff";
  }
}

const UPCOMING_PREVIEW_LIMIT = 6;

const DashboardPage = () => {
  const orgId = localStorage.getItem("selectedOrgId");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barData, setbarData] = useState([]);
  const [upcomingToday, setUpcomingToday] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const { Option } = Select;
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Reset Password Modal states
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetForm] = Form.useForm();
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  const monthsList = [
    { label: "All", value: null },
    { label: "Jan", value: 1 },
    { label: "Feb", value: 2 },
    { label: "Mar", value: 3 },
    { label: "Apr", value: 4 },
    { label: "May", value: 5 },
    { label: "Jun", value: 6 },
    { label: "Jul", value: 7 },
    { label: "Aug", value: 8 },
    { label: "Sep", value: 9 },
    { label: "Oct", value: 10 },
    { label: "Nov", value: 11 },
    { label: "Dec", value: 12 },
  ];
  const yearList = [
    { label: "2025", value: 2025 },
    { label: "2026", value: 2026 },
  ];

  // Example mapping of KPI → page
  const kpiRoutes = {
    "Total Clients": "/clients",
    "Today Appointments": "/appointments",
    "Today's Reminders": "/reminders",
    "New Clients this month": "/clients",
    "Total Sale Today": "/billing",
    "Total Sale this month": "/billing",
  };

  const kpiIcons = {
    "Total Clients": <UserOutlined />,
    "Today Appointments": <CalendarOutlined />,
    "Today's Reminders": <FieldTimeOutlined />,
    "New Clients this month": <UserOutlined />,
    "Total Sale Today": <DollarOutlined />,
    "Total Sale this month": <DollarOutlined />,
  };
  console.log("loggedInUser>>> ", loggedInUser);
  const displayName =
    loggedInUser?.full_name ||
    loggedInUser?.email ||
    "Account";

  const userMenuItems = [
    {
      key: "user-info",
      label: (
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
            {displayName}
          </p>
        </div>
      ),
      disabled: true,
    },
    {
      key: "reset-password",
      icon: <KeyOutlined className="text-base text-gw-primary" />,
      label: <span className="text-sm font-semibold text-gray-700 py-1 inline-block">Reset Password</span>,
      onClick: () => {
        resetForm.resetFields();
        setResetErrorMsg("");
        setResetSuccessMsg("");
        setResetModalVisible(true);
      },
    },
  ];

  const handleResetPassword = async (values) => {
    setResetErrorMsg("");
    setResetSuccessMsg("");
    try {
      setResetSubmitting(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await axios.post(
        `${BACKEND_URL}/clientadmin/resetpassword`,
        {
          resetUserId: user?.id,
          newpassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const successMessage =
        response.data?.message || "Password reset successfully!";
      setResetSuccessMsg(successMessage);
      toast.success(successMessage);
      message.success(successMessage);

      setTimeout(() => {
        resetForm.resetFields();
        setResetModalVisible(false);
        setResetSuccessMsg("");
      }, 1200);
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to reset password. Please try again.";
      setResetErrorMsg(errorMessage);
      toast.error(errorMessage);
      message.error(errorMessage);
    } finally {
      setResetSubmitting(false);
    }
  };

  // ✅ Fetch KPI stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/clientAdmin/getDashboardDetails/KPI?orgId=${orgId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setStats(res.data.response);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ✅ Fetch bar chart
  useEffect(() => {
    const fetchBar = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/clientAdmin/getDashboardDetails/barChart?orgId=${orgId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setbarData(res.data.response);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBar();
  }, []);

  // ✅ Fetch pie chart
  useEffect(() => {
    const fetchClientCategories = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/clientAdmin/getDashboardDetails/PieChart`,
          {
            params: { orgId, month: selectedMonth, year: selectedYear },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        console.log(res.data.response);
        setPieData(res.data.response);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientCategories();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    async function fetchTodayUpcoming() {
      if (!orgId) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      const basic_config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        setUpcomingLoading(true);
        const date = dayjs().startOf("day").toISOString();
        const response = await apiGet(
          `/appointments/appt/getActiveAppointments?orgId=${orgId}&date=${date}`,
          basic_config,
        );

        const apptsFromAPI = response?.response || [];
        const now = new Date();

        const formatted = apptsFromAPI.map((appt) => ({
          id: appt.id,
          title: appt.title || "Appointment",
          start: new Date(appt.start_time),
          end: new Date(appt.end_time),
          client: appt.clients?.first_name || "",
          service: appt.services?.name || "",
          status: appt.status || "",
          employeeName: appt.employees?.first_name || "",
          doctorName: appt.doctors?.first_name || "",
          color: getStatusColor(appt.status) || PALETTE.accentLight,
        }));

        const upcoming = formatted
          .filter((a) => a.end > now)
          .sort((a, b) => a.start - b.start)
          .slice(0, UPCOMING_PREVIEW_LIMIT);

        setUpcomingToday(upcoming);
      } catch (err) {
        console.error("Error fetching today's appointments:", err);
        setUpcomingToday([]);
      } finally {
        setUpcomingLoading(false);
      }
    }

    const t = setTimeout(fetchTodayUpcoming, 50);
    return () => clearTimeout(t);
  }, [orgId]);

  const formatTimeRange = (start, end) => {
    const opts = { hour: "2-digit", minute: "2-digit" };
    return `${start.toLocaleTimeString([], opts)} – ${end.toLocaleTimeString(
      [],
      opts,
    )}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gw-primary-light/40 via-gw-surface to-gw-muted/30 font-sans text-gw-ink md:flex-row">
      <main className="min-w-0 flex-1 animate-fadeIn px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gw-primary-dark to-gw-primary drop-shadow-sm">
            Dashboard Overview
          </h2>
          <Dropdown
            menu={{
              items: userMenuItems,
              className: "min-w-[220px] p-2 shadow-2xl rounded-2xl border border-gray-100/80 bg-white/95 backdrop-blur-md",
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button
              type="button"
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-gray-50 text-gw-ink font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 border border-gray-200/80 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gw-primary to-gw-primary-light text-white flex items-center justify-center text-base shadow-sm">
                <UserOutlined />
              </div>
              <span className="text-sm font-bold text-gray-800">{displayName}</span>
              <DownOutlined className="text-xs text-gray-400" />
            </button>
          </Dropdown>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map(({ title, amount, badge }, i) => (
            <Link
              key={i}
              to={kpiRoutes[title] || "/"}
              className="cursor-pointer relative bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl border-l-4 border-gw-primary hover:border-gw-primary-dark transition-all duration-300 transform hover:-translate-y-1 block no-underline text-inherit"
            >
              <div className="absolute top-4 right-4 text-gw-primary text-2xl">
                {kpiIcons[title] || <UserOutlined />}
              </div>
              <h4 className="text-gray-500 font-semibold text-lg">{title}</h4>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {typeof amount === "number" && title.toLowerCase().includes("sale")
                  ? `Rs. ${amount.toLocaleString("en-IN")}`
                  : `${amount ?? 0} ${badge || ""}`}
              </p>
            </Link>
          ))}
        </div>

        {/* Today's upcoming appointments */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-gw-primary/15 bg-gradient-to-br from-white/90 via-white/75 to-gw-primary-light/20 backdrop-blur-md shadow-lg">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gw-primary/10 blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-4 p-6 sm:p-7 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gw-primary text-white shadow-md">
                  <FieldTimeOutlined className="text-xl" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-gw-ink sm:text-2xl">
                    Today&apos;s lineup
                  </h3>
                  <p className="mt-1 max-w-xl text-sm text-gray-600">
                    Upcoming visits for your organization on{" "}
                    <span className="font-semibold text-gw-primary-dark">
                      {dayjs().format("dddd, MMM D")}
                    </span>
                    .
                  </p>
                </div>
              </div>
              <Link
                to="/appointments"
                className="inline-flex items-center gap-1 self-start rounded-full border border-gw-primary/30 bg-white/60 px-4 py-2 text-sm font-semibold text-gw-primary-dark shadow-sm transition hover:border-gw-primary hover:bg-white"
              >
                Open calendar
                <RightOutlined className="text-xs" />
              </Link>
            </div>

            <div className="relative border-t border-gw-primary/10 bg-white/40 px-4 py-4 sm:px-6 sm:py-5">
              {upcomingLoading ? (
                <div className="flex justify-center py-10">
                  <Spin size="large" />
                </div>
              ) : upcomingToday.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gw-primary/25 bg-white/50 px-6 py-10 text-center">
                  <p className="text-base font-medium text-gray-700">
                    No upcoming appointments left today
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    You&apos;re caught up—or nothing is scheduled from here on.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcomingToday.map((appt) => (
                    <li
                      key={appt.id}
                      className="group flex gap-3 rounded-xl border border-gray-100/80 bg-white/80 p-3 shadow-sm transition hover:border-gw-primary/25 hover:shadow-md sm:gap-4 sm:p-4 animate-fadeIn"
                    >
                      <div
                        className="w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: appt.color }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-mono text-sm font-semibold tabular-nums text-gw-primary-dark">
                            {formatTimeRange(appt.start, appt.end)}
                          </span>
                          {appt.status && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-600">
                              {appt.status}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-base font-semibold text-gray-900">
                          {appt.title}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-600">
                          {[appt.client, appt.service]
                            .filter(Boolean)
                            .join(" · ") || "No client or service details"}
                        </p>
                        {(appt.employeeName || appt.doctorName) && (
                          <p className="mt-1 text-xs text-gray-500">
                            {[appt.employeeName, appt.doctorName]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BAR CHART */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <h4 className="text-2xl font-semibold mb-5 text-gray-700 flex items-center gap-2">
              📅 Appointments (Next 7 Days)
            </h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip cursor={{ fill: PALETTE.accentLight }} />
                <Bar
                  dataKey="value"
                  fill={PALETTE.primary}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-5">
              <h4 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
                🧑‍🤝‍🧑 Client Categories
              </h4>
            </div>
            <div className="flex justify-end gap-4 mb-5">
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Month"
                style={{ width: 140 }}
                allowClear
              >
                {monthsList.map((month) => (
                  <Option key={month.value} value={month.value}>
                    {month.label}
                  </Option>
                ))}
              </Select>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                placeholder="Year"
                style={{ width: 140 }}
                allowClear
              >
                {yearList.map((year) => (
                  <Option key={year.value} value={year.value}>
                    {year.label}
                  </Option>
                ))}
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="40%"
                  outerRadius={90}
                  legendType="circle"
                  labelLine={false}
                  label={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.color || CHART_COLORS[index % CHART_COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                {/* Legend with values */}
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value, entry) =>
                    `${value} (${entry.payload.value})`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RESET PASSWORD MODAL */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-gw-primary-dark font-bold text-lg">
              <LockOutlined />
              <span>Reset Password</span>
            </div>
          }
          open={resetModalVisible}
          onCancel={() => {
            resetForm.resetFields();
            setResetErrorMsg("");
            setResetSuccessMsg("");
            setResetModalVisible(false);
          }}
          footer={null}
          destroyOnClose
        >
          {resetSuccessMsg && (
            <Alert
              message={resetSuccessMsg}
              type="success"
              showIcon
              className="mt-3 mb-2"
            />
          )}

          {resetErrorMsg && (
            <Alert
              message={resetErrorMsg}
              type="error"
              showIcon
              className="mt-3 mb-2"
            />
          )}

          <Form
            form={resetForm}
            layout="vertical"
            onFinish={handleResetPassword}
            className="mt-4"
          >
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter new password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm new password"
              />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  resetForm.resetFields();
                  setResetErrorMsg("");
                  setResetSuccessMsg("");
                  setResetModalVisible(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetSubmitting}
                className="bg-gw-primary hover:bg-gw-primary-dark"
              >
                Save Password
              </Button>
            </div>
          </Form>
        </Modal>
      </main>
    </div>
  );
};

export default DashboardPage;
