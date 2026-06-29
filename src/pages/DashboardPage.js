import axios from "axios";
import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
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
  const [stats, setStats] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barData, setbarData] = useState([]);
  const [upcomingToday, setUpcomingToday] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const { Option } = Select;
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    //Balance: "/billing",
  };

  const kpiIcons = {
    "Total Clients": <UserOutlined />,
    "Today Appointments": <CalendarOutlined />,
    "Today's Reminders": <FieldTimeOutlined />,
    "New Clients this month": <UserOutlined />,
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gw-primary to-gw-primary-light shadow-lg border-4 border-white flex items-center justify-center text-white font-bold text-xl">
            ✨
          </div>
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
                {amount} {badge}
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
      </main>
    </div>
  );
};

export default DashboardPage;
