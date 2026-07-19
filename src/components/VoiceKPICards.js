import React, { useState } from "react";
import { Card, Statistic, Spin } from "antd";
import {
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { formatDuration } from "../utils/voiceFormat";

const buildPrimaryCards = (kpis) => [
  {
    title: "Total Calls",
    value: kpis.totalCalls ?? 0,
    icon: <PhoneOutlined />,
    color: "#C46C48",
  },
  {
    title: "Completed Calls",
    value: kpis.completedCalls ?? 0,
    icon: <CheckCircleOutlined />,
    color: "#5BA876",
  },
  {
    title: "Failed Calls",
    value: kpis.failedCalls ?? 0,
    icon: <CloseCircleOutlined />,
    color: "#C24A2E",
  },
  {
    title: "Total Duration",
    value: formatDuration(kpis.totalDurationSeconds),
    icon: <FieldTimeOutlined />,
    color: "#8B857D",
  },
  {
    title: "Average Duration",
    value: formatDuration(kpis.averageDurationSeconds),
    icon: <ClockCircleOutlined />,
    color: "#D4A640",
  },
];

const buildPeriodCards = (periodKpis) => [
  {
    title: "Total Calls",
    value: periodKpis?.totalCalls ?? 0,
    icon: <PhoneOutlined />,
    color: "#C46C48",
  },
  {
    title: "Completed Calls",
    value: periodKpis?.completedCalls ?? 0,
    icon: <CheckCircleOutlined />,
    color: "#5BA876",
  },
  {
    title: "Failed Calls",
    value: periodKpis?.failedCalls ?? 0,
    icon: <CloseCircleOutlined />,
    color: "#C24A2E",
  },
  {
    title: "Total Duration",
    value: formatDuration(periodKpis?.totalDurationSeconds),
    icon: <FieldTimeOutlined />,
    color: "#8B857D",
  },
];

const KpiRow = ({ cards, loading }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {cards.map((card) => (
      <Card
        key={card.title}
        className="shadow-sm rounded-xl border-gw-line"
        loading={loading}
      >
        <Statistic
          title={<span className="text-gw-ink-2">{card.title}</span>}
          value={card.value}
          valueStyle={{ color: card.color, fontWeight: 700 }}
          prefix={card.icon}
        />
      </Card>
    ))}
  </div>
);

/**
 * Top-of-page KPI cards for the Voice Calls dashboard. Shows today's KPIs
 * by default; "View More" lazily fetches and reveals "this month" / "total
 * till date" KPIs so the extra data is never requested unless asked for.
 */
const VoiceKPICards = ({ kpis, loading, extended, extendedLoading, onViewMore }) => {
  const [expanded, setExpanded] = useState(false);
  const safeKpis = kpis || {};

  const handleToggle = () => {
    if (!expanded && !extended && !extendedLoading) {
      onViewMore?.();
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gw-ink-2">
          Today
        </span>
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-1 text-sm font-medium text-gw-accent hover:text-gw-accent-hover"
        >
          {expanded ? "View Less" : "View More"}
          {expanded ? <UpOutlined /> : <DownOutlined />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {buildPrimaryCards(safeKpis).map((card) => (
          <Card
            key={card.title}
            className="shadow-sm rounded-xl border-gw-line"
            loading={loading}
          >
            <Statistic
              title={<span className="text-gw-ink-2">{card.title}</span>}
              value={card.value}
              valueStyle={{ color: card.color, fontWeight: 700 }}
              prefix={card.icon}
            />
          </Card>
        ))}
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {extendedLoading && !extended ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : (
            <>
              <div>
                <span className="block mb-2 text-xs font-semibold uppercase tracking-wide text-gw-ink-2">
                  This Month
                </span>
                <KpiRow cards={buildPeriodCards(extended?.month)} loading={extendedLoading} />
              </div>
              <div>
                <span className="block mb-2 text-xs font-semibold uppercase tracking-wide text-gw-ink-2">
                  Total Till Date
                </span>
                <KpiRow cards={buildPeriodCards(extended?.allTime)} loading={extendedLoading} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceKPICards;
