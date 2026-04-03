import axios from "axios";
import React, { useState, useEffect } from "react";
import { Select } from "antd";
import { useNavigate } from "react-router-dom"; // ✅ navigation
import Sidebar from "../components/SideBar.js";
import { BACKEND_URL } from "../assets/constants";
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
  PieChartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { CHART_COLORS, PALETTE } from "../theme/palette";

const DashboardPage = () => {
  const orgId = localStorage.getItem("selectedOrgId");
  const [stats, setStats] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barData, setbarData] = useState([]);
  const { Option } = Select;
  const navigate = useNavigate(); // ✅ for navigation

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
    //Balance: "/billing",
  };

  const icons = [
    <UserOutlined />,
    <CalendarOutlined />,
    <PieChartOutlined />,
    <DollarOutlined />,
  ];

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
          }
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
          }
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
          }
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gw-primary-light/40 via-gw-surface to-gw-muted/30 font-sans text-gw-ink">
      <main className="flex-1 px-6 md:px-12 py-10 animate-fadeIn">
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
            <div
              key={i}
              onClick={() => navigate(kpiRoutes[title] || "/")}
              className="cursor-pointer relative bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl border-l-4 border-gw-primary hover:border-gw-primary-dark transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 text-gw-primary text-2xl">
                {icons[i % icons.length]}
              </div>
              <h4 className="text-gray-500 font-semibold text-lg">{title}</h4>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {amount} {badge}
              </p>
            </div>
          ))}
        </div>

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
                <Bar dataKey="value" fill={PALETTE.primary} radius={[10, 10, 0, 0]} />
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
                        entry.color ||
                        CHART_COLORS[index % CHART_COLORS.length]
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
