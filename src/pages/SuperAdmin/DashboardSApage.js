import React from "react";
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
} from "recharts";
import { CHART_COLORS, PALETTE } from "../../theme/palette";

const DashboardSAPage = () => {
  const barData = [
    { name: "Mon", value: 240 },
    { name: "Tue", value: 180 },
    { name: "Wed", value: 280 },
    { name: "Thu", value: 120 },
    { name: "Fri", value: 340 },
  ];

  const pieData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gw-primary-light/40 via-gw-surface to-gw-muted/30 font-sans text-gw-ink md:flex-row">
      <main className="min-w-0 flex-1 animate-fadeIn px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-4xl font-extrabold text-gw-ink tracking-wide">
            Main Dashboard
          </h2>
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gw-primary to-gw-primary-light shadow-xl border-4 border-white animate-bounce"></div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Earnings", amount: "$350.40" },
            { title: "Spend this month", amount: "$642.39" },
            {
              title: "Sales",
              amount: "$574.34",
              badge: <span className="text-green-500 text-lg ml-2">+23%</span>,
            },
            { title: "Balance", amount: "$1,000" },
          ].map(({ title, amount, badge }, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl border-l-4 border-gw-primary hover:border-gw-primary-dark transition-all duration-300 transform hover:-translate-y-1"
            >
              <h4 className="text-gray-500 font-semibold text-lg">{title}</h4>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {amount} {badge}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 animate-slideInLeft">
            <h4 className="text-2xl font-semibold mb-5 text-gray-700">
              Weekly Revenue
            </h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip cursor={{ fill: PALETTE.accentLight }} />
                <Bar dataKey="value" fill={PALETTE.primary} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 animate-slideInRight">
            <h4 className="text-2xl font-semibold mb-5 text-gray-700">
              User Groups
            </h4>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  fill={PALETTE.primary}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSAPage;
