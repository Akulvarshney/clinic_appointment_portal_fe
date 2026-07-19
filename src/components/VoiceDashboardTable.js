import React from "react";
import { Table, Typography, Card } from "antd";
import { formatDuration } from "../utils/voiceFormat";

const { Text } = Typography;

/** Statistics grouped by Twilio number, shown below the KPI cards. */
const VoiceDashboardTable = ({ numberStats, loading }) => {
  const columns = [
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Total Calls",
      dataIndex: "totalCalls",
      key: "totalCalls",
      sorter: (a, b) => a.totalCalls - b.totalCalls,
    },
    {
      title: "Total Duration",
      dataIndex: "totalDurationSeconds",
      key: "totalDurationSeconds",
      sorter: (a, b) => a.totalDurationSeconds - b.totalDurationSeconds,
      render: (seconds) => formatDuration(seconds),
    },
  ];

  return (
    <Card
      className="shadow-sm rounded-xl border-gw-line mb-6"
      title={<span className="text-gw-ink font-semibold">Statistics by Twilio Number</span>}
    >
      <Table
        columns={columns}
        dataSource={numberStats || []}
        rowKey="phoneNumber"
        loading={loading}
        pagination={false}
        size="middle"
      />
    </Card>
  );
};

export default VoiceDashboardTable;
