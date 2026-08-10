import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  DatePicker,
  Drawer,
  Spin,
} from "antd";
import { Link } from "react-router-dom";
import { isFeatureValid } from "../assets/constants";
import DataTable from "../components/DataTable";
import { SearchOutlined } from "@ant-design/icons";
import { apiGet } from "../utils/axiosCalls";

function toISODate(d) {
  if (!d) return undefined;
  try {
    if (typeof d.format === "function") return d.format("YYYY-MM-DD");
  } catch (e) {}
  if (d instanceof Date && !Number.isNaN(d.valueOf())) {
    return d.toISOString().slice(0, 10);
  }
  return undefined;
}

function normalizeFeedbackRows(raw) {
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data?.items)
      ? raw.data.items
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.response)
          ? raw.response
          : Array.isArray(raw?.response?.data)
            ? raw.response.data
            : [];

  const fullName = (obj) => {
    if (!obj) return "";
    const first = obj.first_name ?? obj.firstName ?? obj.firstname ?? "";
    const last = obj.last_name ?? obj.lastName ?? obj.lastname ?? "";
    const joined = [first, last].filter(Boolean).join(" ").trim();
    return joined || obj.name || "";
  };

  return arr.map((f, idx) => {
    return {
      id: f.id ?? f.feedbackId ?? f.uuid ?? idx,
      clientName:
        f.clientName ??
        fullName(f.appointments?.clients) ??
        fullName(f.clients) ??
        f.client?.name ??
        f.client_full_name ??
        "-",
      doctorName: f.doctorName ?? fullName(f.appointments?.doctors) ?? fullName(f.doctors) ?? f.doctor?.name ?? "-",
      staffName:
        fullName(f.appointments?.employees) ??
        fullName(f.employees) ??
        f.employeeName ??
        f.employee?.name ??
        "-",
      serviceName:
        f.serviceName ??
        f.appointments?.services?.name ??
        f.service?.name ??
        "-",
      experience: f.experience ?? "-",
      comments: f.comments ?? f.comment ?? "-",
      hasComplaint: Boolean(f.hasComplaint ?? f.has_complaint),
      complaintText: f.complaintText ?? f.complaint_text ?? "-",
      date:
        f.date ??
        f.created_at?.slice?.(0, 10) ??
        f.createdAt?.slice?.(0, 10) ??
        "-",
      status: f.status || "Pending",
      raw: f
    };
  });
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [feedbackSearchInput, setFeedbackSearchInput] = useState("");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftHasComplaint, setDraftHasComplaint] = useState(undefined);
  const [draftFromTo, setDraftFromTo] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [filters, setFilters] = useState({
    hasComplaint: undefined,
    fromTo: null,
  });

  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const viewDetails = (record) => {
    setSelectedFeedback(record);
    setDetailsDrawerOpen(true);
  };

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");
  const fetchFeedbackSeq = useRef(0);
  const basic_config = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  const fetchFeedbacks = async () => {
    if (!orgId || !token) return;
    setTableLoading(true);
    setErrorMsg("");
    const seq = ++fetchFeedbackSeq.current;
    try {
      const params = new URLSearchParams();
      params.set("orgId", orgId);
      if (typeof filters.hasComplaint === "boolean") {
        params.set("hasComplaint", String(filters.hasComplaint));
      }
      const from = toISODate(filters.fromTo?.[0]);
      const to = toISODate(filters.fromTo?.[1]);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const q = feedbackSearch?.trim();
      if (q) params.set("search", q);

      params.set("page", String(pagination.current));
      params.set("limit", String(pagination.pageSize));

      const res = await apiGet(
        `/clientadmin/feedback/getFeedback?${params.toString()}`,
        basic_config
      );
      if (seq !== fetchFeedbackSeq.current) return;

      const rows = normalizeFeedbackRows(res);
      setFeedbacks(rows);

      const total =
        res?.data?.total ??
        res?.total ??
        res?.response?.total ??
        res?.response?.count ??
        res?.count ??
        rows.length;
      setPagination((p) => ({ ...p, total: Number(total) || rows.length }));
    } catch (e) {
      console.error(e);
      if (seq === fetchFeedbackSeq.current) {
        setErrorMsg("Failed to fetch feedbacks. Please try again.");
        message.error("Failed to fetch feedbacks");
      }
    } finally {
      if (seq === fetchFeedbackSeq.current) setTableLoading(false);
    }
  };

  const openFilters = () => {
    setDraftSearch(feedbackSearchInput);
    setDraftHasComplaint(filters.hasComplaint);
    setDraftFromTo(filters.fromTo);
    setFiltersDrawerOpen(true);
  };

  const applyFilters = () => {
    setPagination((p) => ({ ...p, current: 1 }));
    setFeedbackSearchInput(draftSearch);
    setFeedbackSearch(draftSearch);
    setFilters((f) => ({
      ...f,
      hasComplaint: draftHasComplaint,
      fromTo: draftFromTo,
    }));
    setFiltersDrawerOpen(false);
  };

  const resetFilters = () => {
    setDraftSearch("");
    setDraftHasComplaint(undefined);
    setDraftFromTo(null);

    setPagination((p) => ({ ...p, current: 1 }));
    setFeedbackSearchInput("");
    setFeedbackSearch("");
    setFilters((f) => ({
      ...f,
      hasComplaint: undefined,
      fromTo: null,
    }));
    setFiltersDrawerOpen(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [
    orgId,
    token,
    feedbackSearch,
    pagination.current,
    pagination.pageSize,
    filters.hasComplaint,
    filters.fromTo,
  ]);

  const surveyColumns = [
    { title: "Client Name", dataIndex: "clientName", key: "clientName", width: 140 },
    { title: "Doctor Name", dataIndex: "doctorName", key: "doctorName", width: 140 },
    { title: "Staff Name", dataIndex: "staffName", key: "staffName", width: 140, ellipsis: true },
    {
      title: "Status", dataIndex: "status", key: "status", width: 120, render: (text) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${text === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {text}
        </span>
      )
    },
    { title: "Date", dataIndex: "date", key: "date", width: 110 },
    { title: "Actions", key: "actions", width: 100, render: (_, record) => <Button type="link" onClick={() => viewDetails(record)}>View Details</Button> },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Feedback Management</h1>
        {isFeatureValid("FEEDBACK_MANAGEMENT", "SURVEY_BUILDER") && (
          <Link to="/feedbackManagement/surveyBuilder">
            <Button type="primary" size="large">
              Survey Builder
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700">Filters</div>
            <div className="text-xs text-gray-500">
              {feedbackSearch?.trim()
                ? `Search: "${feedbackSearch.trim()}"`
                : "Search: All"}{" "}
              ·{" "}
              {typeof filters.hasComplaint === "boolean"
                ? `Complaint: ${filters.hasComplaint ? "Yes" : "No"}`
                : "Complaint: All"}{" "}
              · {filters.fromTo ? "Date: Selected" : "Date: Any"}
            </div>
          </div>
          <Button onClick={openFilters} size="large">
            Filters
          </Button>
        </div>

        <Drawer
          title="Filters"
          open={filtersDrawerOpen}
          onClose={() => setFiltersDrawerOpen(false)}
          width={420}
          destroyOnClose={false}
          extra={
            <div className="flex gap-2">
              <Button onClick={resetFilters}>Reset</Button>
              <Button type="primary" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Search</div>
              <Input
                placeholder="Search (comments, name, etc)..."
                prefix={<SearchOutlined />}
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                allowClear
                size="large"
                className="!w-full"
              />
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Complaint</div>
              <Select
                placeholder="All"
                value={
                  typeof draftHasComplaint === "boolean"
                    ? String(draftHasComplaint)
                    : undefined
                }
                onChange={(v) =>
                  setDraftHasComplaint(
                    v === "true" ? true : v === "false" ? false : undefined
                  )
                }
                allowClear
                size="large"
                className="w-full"
              >
                <Select.Option value="true">Yes</Select.Option>
                <Select.Option value="false">No</Select.Option>
              </Select>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-gray-700">Date Range</div>
              <DatePicker.RangePicker
                value={draftFromTo}
                onChange={(dates) => setDraftFromTo(dates)}
                size="large"
                className="w-full"
              />
            </div>
          </div>
        </Drawer>

        <DataTable
          columns={surveyColumns}
          dataSource={feedbacks}
          loading={tableLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onChange={(pag) => {
            setPagination((p) => ({
              ...p,
              current: pag.current,
              pageSize: pag.pageSize,
            }));
          }}
        />
      </div>

      <Drawer
        title="Feedback Details"
        width={500}
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
      >
        {selectedFeedback ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Client Name</div>
                <div className="font-medium text-gray-900">{selectedFeedback.clientName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium text-gray-900">{selectedFeedback.date}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Doctor</div>
                <div className="font-medium text-gray-900">{selectedFeedback.doctorName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Staff</div>
                <div className="font-medium text-gray-900">{selectedFeedback.staffName}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Services</div>
                <div className="font-medium text-gray-900">{selectedFeedback.serviceName}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="font-medium">{selectedFeedback.status}</div>
            </div>
            
            {selectedFeedback.status === "Completed" && (
              <>
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-1">Experience Rating</div>
                  <div className="font-medium">{selectedFeedback.experience}</div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-1">Comments</div>
                  <div className="text-gray-900 whitespace-pre-wrap">
                    {selectedFeedback.comments}
                  </div>
                </div>
              </>
            )}

            {selectedFeedback.hasComplaint && (
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-red-600 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Complaint Recorded
                </div>
                <div className="text-gray-900 whitespace-pre-wrap bg-red-50 p-3 rounded">
                  {selectedFeedback.complaintText}
                </div>
              </div>
            )}
            
            {selectedFeedback.raw?.feedback_answers?.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Survey Responses</h3>
                <div className="space-y-4">
                  {selectedFeedback.raw.feedback_answers?.map((ans, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {ans.feedback_questions?.label}
                      </div>
                      <div className="text-gray-900">
                        {ans.answer_text || ans.answer_json || "No answer provided"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Spin />
        )}
      </Drawer>
    </div>
  );
};

export default FeedbackManagement;
