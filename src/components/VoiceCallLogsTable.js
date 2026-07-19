import React, { useMemo, useState } from "react";
import {
  Table,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Tooltip,
  Button,
  Modal,
  Typography,
} from "antd";
import {
  SearchOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";
import { searchClients, fetchVoiceCallRecordingBlob } from "../services/voiceApi";
import { formatDuration, formatDateTime } from "../utils/voiceFormat";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const STATUS_COLORS = {
  QUEUED: "default",
  RINGING: "blue",
  IN_PROGRESS: "processing",
  COMPLETED: "green",
  BUSY: "orange",
  FAILED: "red",
  NO_ANSWER: "orange",
  CANCELED: "default",
};

const DIRECTION_COLORS = {
  INBOUND: "blue",
  OUTBOUND: "purple",
};

/**
 * Tab 1 - Call Logs. Server-side paginated/filterable/sortable table driven
 * entirely by props from useVoiceCalls, so the page owns all data-fetching.
 */
const VoiceCallLogsTable = ({
  orgId,
  logs,
  loading,
  pagination,
  filters,
  onFilterChange,
  onSorterChange,
  onPageChange,
  fromNumberOptions = [],
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [clientOptions, setClientOptions] = useState([]);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [player, setPlayer] = useState({ open: false, url: null, loading: false });

  const fetchClientOptions = useMemo(
    () =>
      debounce(async (search) => {
        if (!orgId) return;
        setClientSearchLoading(true);
        try {
          const clients = await searchClients(orgId, search, 10);
          setClientOptions(
            (clients || []).map((c) => ({
              value: c.id,
              label: [c.first_name, c.last_name].filter(Boolean).join(" ") || c.phone,
            }))
          );
        } catch (err) {
          console.error("Error searching clients:", err);
        } finally {
          setClientSearchLoading(false);
        }
      }, 300),
    [orgId]
  );

  const handleSearch = (value) => {
    setSearchValue(value);
    onFilterChange({ search: value });
  };

  const handleDateRangeChange = (dates) => {
    onFilterChange({
      dateFrom: dates?.[0] ? dates[0].startOf("day").toISOString() : null,
      dateTo: dates?.[1] ? dates[1].endOf("day").toISOString() : null,
    });
  };

  const handlePlay = async (record) => {
    setPlayer({ open: true, url: null, loading: true });
    try {
      const blob = await fetchVoiceCallRecordingBlob(record.id, orgId, false);
      const url = URL.createObjectURL(blob);
      setPlayer({ open: true, url, loading: false });
    } catch (err) {
      console.error("Error loading recording:", err);
      toast.error("Failed to load recording");
      setPlayer({ open: false, url: null, loading: false });
    }
  };

  const handleDownload = async (record) => {
    try {
      const blob = await fetchVoiceCallRecordingBlob(record.id, orgId, true);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${record.twilio_call_sid}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading recording:", err);
      toast.error("Failed to download recording");
    }
  };

  const closePlayer = () => {
    if (player.url) URL.revokeObjectURL(player.url);
    setPlayer({ open: false, url: null, loading: false });
  };

  const columns = [
    { title: "From Number", dataIndex: "from_number", key: "from_number", sorter: true },
    { title: "To Number", dataIndex: "to_number", key: "to_number" },
    {
      title: "Client",
      key: "client",
      render: (_, record) =>
        record.client
          ? [record.client.first_name, record.client.last_name].filter(Boolean).join(" ")
          : <Text type="secondary">-</Text>,
    },
    {
      title: "Direction",
      dataIndex: "direction",
      key: "direction",
      render: (direction) => <Tag color={DIRECTION_COLORS[direction] || "default"}>{direction}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={STATUS_COLORS[status] || "default"}>{status}</Tag>,
    },
    {
      title: "Duration",
      dataIndex: "duration_seconds",
      key: "duration_seconds",
      sorter: true,
      render: (seconds) => formatDuration(seconds),
    },
    {
      title: "Called At",
      dataIndex: "created_at",
      key: "created_at",
      sorter: true,
      render: (_, record) => formatDateTime(record.started_at || record.created_at),
    },
    {
      title: "Recording",
      key: "recording",
      render: (_, record) =>
        record.recording_url ? (
          <Space>
            <Tooltip title="Play">
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handlePlay(record)}
              />
            </Tooltip>
            <Tooltip title="Download">
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record)}
              />
            </Tooltip>
          </Space>
        ) : (
          <Text type="secondary">No Recording</Text>
        ),
    },
  ];

  const handleTableChange = (paginationConfig, _tableFilters, sorterConfig) => {
    onPageChange(paginationConfig.current, paginationConfig.pageSize);
    if (sorterConfig?.field) {
      onSorterChange({
        sortBy: sorterConfig.field,
        sortOrder: sorterConfig.order === "ascend" ? "asc" : "desc",
      });
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <Space wrap>
          <Input
            placeholder="Search from/to number, SID..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <RangePicker onChange={handleDateRangeChange} />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 140 }}
            value={filters.status}
            onChange={(value) => onFilterChange({ status: value })}
            options={[
              "QUEUED",
              "RINGING",
              "IN_PROGRESS",
              "COMPLETED",
              "BUSY",
              "FAILED",
              "NO_ANSWER",
              "CANCELED",
            ].map((s) => ({ value: s, label: s.replace("_", " ") }))}
          />
          <Select
            placeholder="Direction"
            allowClear
            style={{ width: 130 }}
            value={filters.direction}
            onChange={(value) => onFilterChange({ direction: value })}
            options={[
              { value: "INBOUND", label: "Inbound" },
              { value: "OUTBOUND", label: "Outbound" },
            ]}
          />
          <Select
            placeholder="From Number"
            allowClear
            style={{ width: 170 }}
            value={filters.fromNumber}
            onChange={(value) => onFilterChange({ fromNumber: value })}
            options={fromNumberOptions.map((n) => ({ value: n, label: n }))}
          />
          <Select
            placeholder="Client"
            allowClear
            showSearch
            filterOption={false}
            loading={clientSearchLoading}
            style={{ width: 180 }}
            value={filters.clientId}
            onSearch={fetchClientOptions}
            onChange={(value) => onFilterChange({ clientId: value })}
            options={clientOptions}
            notFoundContent={clientSearchLoading ? "Searching..." : "No clients found"}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        scroll={{ x: 1100 }}
        size="middle"
      />

      <Modal
        title="Call Recording"
        open={player.open}
        onCancel={closePlayer}
        footer={null}
        destroyOnClose
      >
        {player.loading ? (
          <Text type="secondary">Loading recording...</Text>
        ) : (
          player.url && (
            <audio controls autoPlay src={player.url} style={{ width: "100%" }} />
          )
        )}
      </Modal>
    </>
  );
};

export default VoiceCallLogsTable;
