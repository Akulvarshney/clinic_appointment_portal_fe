import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { message } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  PieChartOutlined,
  DollarOutlined,
  BellOutlined,
  PlusOutlined,
  DownloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const DashboardPage = () => {
  const orgId = localStorage.getItem("selectedOrgId");
  const [stats, setStats] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barData, setbarData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Appointment Reminder",
      message: "Dr. Smith has an appointment in 30 minutes",
      time: "5 min ago",
      type: "reminder",
    },
    {
      id: 2,
      title: "Payment Received",
      message: "₹3,500 received from John Doe",
      time: "1 hour ago",
      type: "payment",
    },
    {
      id: 3,
      title: "New Client Registration",
      message: "Emma Wilson completed registration",
      time: "2 hours ago",
      type: "client",
    },
  ]);
  const { Option } = Select;
  const navigate = useNavigate(); // ✅ for navigation

  // Refs for export functionality
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const dashboardRef = useRef(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Time-based greeting functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅";
    if (hour < 17) return "☀️";
    return "🌙";
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Export functions
  const exportChartAsImage = async (chartRef, filename) => {
    if (!chartRef.current) {
      message.error("Chart not found!");
      return;
    }

    try {
      message.loading({ content: "Generating image...", key: "export" });

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${filename}_${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL();
      link.click();

      message.success({
        content: "Image downloaded successfully!",
        key: "export",
      });
    } catch (error) {
      console.error("Export failed:", error);
      message.error({ content: "Failed to export image!", key: "export" });
    }
  };

  const exportDashboardAsPDF = async () => {
    if (!dashboardRef.current) {
      message.error("Dashboard content not found!");
      return;
    }

    try {
      message.loading({ content: "Generating PDF...", key: "pdf" });

      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        width: dashboardRef.current.scrollWidth,
        height: dashboardRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `dashboard_report_${new Date().toISOString().split("T")[0]}.pdf`
      );
      message.success({ content: "PDF downloaded successfully!", key: "pdf" });
    } catch (error) {
      console.error("PDF export failed:", error);
      message.error({ content: "Failed to export PDF!", key: "pdf" });
    }
  };

  const exportChartDataAsCSV = (data, filename) => {
    try {
      if (!data || data.length === 0) {
        message.error("No data to export!");
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => row[header]).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("CSV exported successfully!");
    } catch (error) {
      console.error("CSV export failed:", error);
      message.error("Failed to export CSV!");
    }
  };

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
    <div
      ref={dashboardRef}
      className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 font-sans text-gray-800 overflow-x-hidden"
    >
      <main className="flex-1 px-4 sm:px-6 md:px-12 py-6 md:py-10 animate-fadeIn">
        {/* HEADER */}
        <header className="mb-10">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getTimeIcon()}</span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {getGreeting()}, Admin!
                  </h1>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {getCurrentDate()} • Here's what's happening with your clinic
                  today
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Title */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm">
              Dashboard Overview
            </h2>
            <div className="flex items-center gap-3">
              {/* Export Button */}
              <button
                onClick={exportDashboardAsPDF}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <DownloadOutlined />
                Export Report
              </button>
            </div>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {stats.map(({ title, amount, badge }, i) => {
            // Mock trend data - in real app this would come from API
            const trend = Math.random() > 0.5 ? "up" : "down";
            const trendValue = Math.floor(Math.random() * 25) + 5;
            const isPositive = trend === "up";

            return (
              <div
                key={i}
                onClick={() => navigate(kpiRoutes[title] || "/")}
                className="cursor-pointer relative group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 hover:border-blue-300/50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Icon with enhanced styling */}
                <div className="absolute top-4 right-4 text-blue-500/80 text-2xl group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                  {icons[i % icons.length]}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-gray-600 font-medium text-sm uppercase tracking-wider group-hover:text-gray-800 transition-colors duration-300">
                      {title}
                    </h4>
                    {/* Trend indicator */}
                    {/* <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isPositive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span>{isPositive ? "↗" : "↘"}</span>
                      <span>{trendValue}%</span>
                    </div> */}
                  </div>

                  <p className="text-4xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                    {amount}
                    {badge && (
                      <span className="text-lg text-gray-500 ml-1">
                        {badge}
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    vs last month
                  </p>
                </div>

                {/* Subtle border animation */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            );
          })}
        </div>

        {/* PROGRESS INDICATORS */}
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            📊 Monthly Goals Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Appointment Goal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Appointments
                </span>
                <span className="text-sm text-gray-500">245/300</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: "82%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">82% of monthly target</p>
            </div>

            {/* Revenue Goal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Revenue
                </span>
                <span className="text-sm text-gray-500">₹85K/₹100K</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: "85%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">85% of monthly target</p>
            </div>

            {/* New Clients Goal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  New Clients
                </span>
                <span className="text-sm text-gray-500">45/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: "90%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">90% of monthly target</p>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* BAR CHART */}
          <div
            ref={barChartRef}
            className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/30 group flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                📅 Appointments (Next 7 Days)
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    exportChartDataAsCSV(barData, "appointments_data")
                  }
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title="Export as CSV"
                >
                  📊
                </button>
                <button
                  onClick={() =>
                    exportChartAsImage(barChartRef, "appointments_chart")
                  }
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title="Download as Image"
                >
                  <DownloadOutlined />
                </button>
              </div>
            </div>

            {/* Placeholder for consistent spacing */}
            <div className="mb-6">
              {/* Empty space to match pie chart filters */}
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6", radius: 4 }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    className="hover:opacity-80 transition-opacity duration-300"
                  />
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* PIE CHART */}
          <div
            ref={pieChartRef}
            className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/30 group flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                🧑‍🤝‍🧑 Client Categories
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    exportChartDataAsCSV(pieData, "client_categories_data")
                  }
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title="Export as CSV"
                >
                  📊
                </button>
                <button
                  onClick={() =>
                    exportChartAsImage(pieChartRef, "client_categories_chart")
                  }
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title="Download as Image"
                >
                  <DownloadOutlined />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-end gap-3 mb-6">
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Month"
                style={{ width: 130, borderRadius: "12px" }}
                allowClear
                className="rounded-xl"
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
                style={{ width: 130, borderRadius: "12px" }}
                allowClear
                className="rounded-xl"
              >
                {yearList.map((year) => (
                  <Option key={year.value} value={year.value}>
                    {year.label}
                  </Option>
                ))}
              </Select>
            </div>

            {loading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-200 rounded-full mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={95}
                    innerRadius={40}
                    legendType="circle"
                    labelLine={false}
                    label={false}
                    className="hover:opacity-90 transition-opacity duration-300"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.color ||
                          [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#06b6d4",
                          ][index % 6]
                        }
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    ))}
                  </Pie>

                  {/* Enhanced Legend */}
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value, entry) => (
                      <span
                        style={{
                          color: "#374151",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {value} ({entry.payload.value})
                      </span>
                    )}
                  />

                  {/* Enhanced Tooltip */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Quick action menu */}
          {showQuickActions && (
            <div className="absolute bottom-16 right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-2 min-w-48 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <button
                onClick={() => navigate("/appointments")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors duration-300"
              >
                <CalendarOutlined />
                New Appointment
              </button>
              <button
                onClick={() => navigate("/clients")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors duration-300"
              >
                <UserOutlined />
                Add Client
              </button>
              <button
                onClick={() => navigate("/reminders")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <BellOutlined />
                Send Reminder
              </button>
              <button
                onClick={() => navigate("/billing")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                <DollarOutlined />
                Generate Invoice
              </button>
            </div>
          )}

          {/* Main FAB */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-xl ${
              showQuickActions ? "rotate-45" : ""
            }`}
          >
            <PlusOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
