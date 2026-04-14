import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  Button,
  message,
  Alert,
  Tabs,
  DatePicker,
  Drawer,
  Switch,
  Spin,
} from "antd";
import DataTable from "../components/DataTable";
import { SearchOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "../utils/axiosCalls";
import debounce from "lodash/debounce";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

function toISODate(d) {
  if (!d) return undefined;
  try {
    // dayjs object (antd DatePicker default) supports format()
    if (typeof d.format === "function") return d.format("YYYY-MM-DD");
  } catch (e) {
    // ignore
  }
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

  return arr.map((f, idx) => ({
    id: f.id ?? f.feedbackId ?? f.uuid ?? idx,
    clientName:
      f.clientName ??
      fullName(f.clients) ??
      f.client?.name ??
      f.client_full_name ??
      "-",
    doctorName: f.doctorName ?? fullName(f.doctors) ?? f.doctor?.name ?? "-",
    staffName:
      fullName(f.employees) ??
      f.employeeName ??
      f.employee?.name ??
      (f.employee_id ? f.employee_id : "-"),
    serviceCategory:
      f.serviceCategory ??
      f.categoryName ??
      f.service?.categoryName ??
      f.serviceCategoryName ??
      "-",
    serviceName:
      f.serviceName ??
      f.service?.name ??
      (Array.isArray(f.feedback_services)
        ? f.feedback_services
          .map((fs) => fs?.services?.name)
          .filter(Boolean)
          .join(", ")
        : undefined) ??
      f.serviceNames?.join?.(", ") ??
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
  }));
}

function normalizeClientOptions(res) {
  const arr = Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.response?.data)
      ? res.response.data
      : Array.isArray(res?.response)
        ? res.response
        : [];
  return arr.map((c) => ({
    id: c.id ?? c.userid ?? c.userId ?? c.uuid,
    name:
      c.name ??
      [c.first_name, c.last_name].filter(Boolean).join(" ") ??
      c.firstName ??
      c.full_name ??
      c.portal_id ??
      "-",
    portalId: c.portal_id ?? c.portalId ?? c.portalid ?? "",
    phone: c.phone ?? c.phoneNumber ?? c.phone_number ?? "",
    raw: c,
  }));
}

function normalizeDoctorOptions(res) {
  const records =
    res?.data?.records ??
    res?.data?.data?.records ??
    res?.data?.data?.doctors ??
    res?.data?.doctors ??
    res?.response?.data ??
    res?.response?.records ??
    [];
  const arr = Array.isArray(records) ? records : [];
  return arr.map((d) => ({
    id: d.id ?? d.userid ?? d.userId ?? d.uuid,
    name:
      d.name ??
      [d.first_name, d.last_name].filter(Boolean).join(" ") ??
      d.firstName ??
      d.full_name ??
      "-",
    raw: d,
  }));
}

function normalizeEmployeeOptions(res) {
  const arr =
    res?.response?.data ??
    res?.data?.data ??
    res?.data?.records ??
    res?.data ??
    [];
  const safe = Array.isArray(arr) ? arr : [];
  return safe.map((e) => ({
    id: e.id ?? e.userid ?? e.userId ?? e.uuid,
    name:
      e.name ??
      [e.first_name, e.last_name].filter(Boolean).join(" ") ??
      e.firstName ??
      e.full_name ??
      "-",
    raw: e,
  }));
}

function normalizeServiceOptions(res) {
  const arr =
    res?.data?.data?.services ??
    res?.data?.services ??
    res?.data ??
    res?.response?.data ??
    [];
  const safe = Array.isArray(arr) ? arr : [];
  return safe.map((s) => ({
    id: s.id ?? s.serviceId ?? s.uuid,
    name: s.name ?? s.serviceName ?? s.portal_id ?? "-",
    raw: s,
  }));
}

const FeedbackManagement = () => {
  const [activeKey, setActiveKey] = useState("new-feedback");
  const [form] = Form.useForm();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
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

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");
  const fetchFeedbackSeq = useRef(0);
  const basic_config = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  const [clientOptions, setClientOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);

  const [clientLoading, setClientLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);

  const experienceOptions = [
    { label: "POOR", value: "POOR" },
    { label: "FAIR", value: "FAIR" },
    { label: "GOOD", value: "GOOD" },
    { label: "EXCELLENT", value: "EXCELLENT" },
  ];

  const fetchClients = async (search = "") => {
    if (!orgId || !token) return;
    setClientLoading(true);
    try {
      const res = await apiGet(`/patient/clients/clientListing`, {
        params: { search, page: 1, limit: 10, orgId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientOptions(normalizeClientOptions(res));
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch clients");
    } finally {
      setClientLoading(false);
    }
  };

  const fetchDoctors = async (search = "") => {
    if (!orgId || !token) return;
    setDoctorLoading(true);
    try {
      const params = new URLSearchParams({
        orgId,
        page: "1",
        limit: "10",
      });
      if (search?.trim()) params.append("search", search.trim());
      const res = await apiGet(
        `/clientAdmin/userMgmt/getDoctors?${params.toString()}`,
        basic_config
      );
      setDoctorOptions(normalizeDoctorOptions(res));
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch doctors");
    } finally {
      setDoctorLoading(false);
    }
  };

  const fetchEmployees = async (search = "") => {
    if (!orgId || !token) return;
    setEmployeeLoading(true);
    try {
      const res = await apiGet(`/clientAdmin/userMgmt/getEmployees`, {
        params: { orgId, page: 1, search, status: "ENABLED" },
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeeOptions(normalizeEmployeeOptions(res));
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch employees");
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchServices = async (search = "") => {
    if (!orgId || !token) return;
    setServiceLoading(true);
    try {
      const res = await apiGet(`/clientadmin/serviceManagement/getServices`, {
        params: { orgId, page: 1, limit: 20, search },
        headers: { Authorization: `Bearer ${token}` },
      });
      setServiceOptions(normalizeServiceOptions(res));
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch services");
    } finally {
      setServiceLoading(false);
    }
  };

  const debouncedFetchClients = useMemo(() => debounce(fetchClients, 300), [orgId, token]);
  const debouncedFetchDoctors = useMemo(() => debounce(fetchDoctors, 300), [orgId, token]);
  const debouncedFetchEmployees = useMemo(
    () => debounce(fetchEmployees, 300),
    [orgId, token]
  );
  const debouncedFetchServices = useMemo(() => debounce(fetchServices, 300), [orgId, token]);

  useEffect(() => {
    // Prime dropdowns for better UX on first open
    fetchClients("");
    fetchDoctors("");
    fetchEmployees("");
    fetchServices("");

    return () => {
      debouncedFetchClients.cancel();
      debouncedFetchDoctors.cancel();
      debouncedFetchEmployees.cancel();
      debouncedFetchServices.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce cancellation + initial fetch
  }, [orgId, token]);

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
    if (activeKey !== "view-feedbacks") return;
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchFeedbacks uses latest state
  }, [
    activeKey,
    orgId,
    token,
    feedbackSearch,
    pagination.current,
    pagination.pageSize,
    filters.hasComplaint,
    filters.fromTo,
  ]);

  const handleSubmit = async (values) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      if (!orgId || !token) {
        setErrorMsg("Missing orgId or token. Please login again.");
        message.error("Missing orgId or token");
        return;
      }

      const payload = {
        orgId,
        clientId: values.clientId,
        doctorId: values.doctorId,
        employeeId: values.employeeId || undefined,
        serviceIds: values.serviceIds || [],
        experience: values.experience,
        comments: values.comments,
        hasComplaint: Boolean(values.hasComplaint),
        complaintText: values.hasComplaint ? values.complaintText : undefined,
      };

      const res = await apiPost(
        `/clientadmin/feedback/createFeedback`,
        payload,
        basic_config
      );

      if (res?.success === false) {
        throw new Error(res?.message || "Create feedback failed");
      }

      form.resetFields();
      setSuccessMsg("Feedback submitted successfully!");
      message.success("Feedback submitted successfully!");
      setActiveKey("view-feedbacks");
      setPagination((p) => ({ ...p, current: 1 }));
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to submit feedback. Please try again.");
      message.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const renderActiveComponent = () => {
    switch (activeKey) {
      case "new-feedback":
        return (
          <div>

            <div className="bg-white p-6 rounded-lg shadow mt-4">
              {successMsg && (
                <Alert
                  message={successMsg}
                  type="success"
                  showIcon
                  closable
                  className="mb-4"
                  onClose={() => setSuccessMsg("")}
                />
              )}

              {errorMsg && (
                <Alert
                  message={errorMsg}
                  type="error"
                  showIcon
                  closable
                  className="mb-4"
                  onClose={() => setErrorMsg("")}
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                initialValues={{ hasComplaint: false }}
              >
                <div className="space-y-4">
                  <Form.Item
                    label="Client"
                    name="clientId"
                    rules={[{ required: true, message: "Please select a client!" }]}
                  >
                    <Select
                      showSearch
                      placeholder="Search client..."
                      filterOption={false}
                      onSearch={(v) => debouncedFetchClients(v)}
                      notFoundContent={clientLoading ? <Spin size="small" /> : null}
                      loading={clientLoading}
                      optionLabelProp="label"
                    >
                      {clientOptions.map((c) => (
                        <Option
                          key={c.id}
                          value={c.id}
                          label={`${c.name}${c.phone ? ` (${c.phone})` : ""}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {c.name}
                              {c.phone ? ` (${c.phone})` : ""}
                            </span>
                            {/* <span className="text-xs text-gray-500">{c.id}</span> */}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Doctor"
                    name="doctorId"
                    rules={[{ required: true, message: "Please select a doctor!" }]}
                  >
                    <Select
                      showSearch
                      placeholder="Search doctor..."
                      filterOption={false}
                      onSearch={(v) => debouncedFetchDoctors(v)}
                      notFoundContent={doctorLoading ? <Spin size="small" /> : null}
                      loading={doctorLoading}
                      optionLabelProp="label"
                    >
                      {doctorOptions.map((d) => (
                        <Option key={d.id} value={d.id} label={d.name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{d.name}</span>
                            {/* <span className="text-xs text-gray-500">{d.id}</span> */}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Employee (optional)"
                    name="employeeId"
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Search employee..."
                      filterOption={false}
                      onSearch={(v) => debouncedFetchEmployees(v)}
                      notFoundContent={employeeLoading ? <Spin size="small" /> : null}
                      loading={employeeLoading}
                      optionLabelProp="label"
                    >
                      {employeeOptions.map((e) => (
                        <Option key={e.id} value={e.id} label={e.name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{e.name}</span>
                            {/* <span className="text-xs text-gray-500">{e.id}</span> */}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Service IDs"
                    name="serviceIds"
                    rules={[{ required: true, message: "Please add at least one serviceId!" }]}
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Search & select services..."
                      filterOption={false}
                      onSearch={(v) => debouncedFetchServices(v)}
                      loading={serviceLoading}
                      notFoundContent={serviceLoading ? <Spin size="small" /> : null}
                      optionLabelProp="label"
                    >
                      {serviceOptions.map((s) => (
                        <Option key={s.id} value={s.id} label={s.name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{s.name}</span>
                            {/* <span className="text-xs text-gray-500">{s.id}</span> */}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Experience"
                    name="experience"
                    rules={[{ required: true, message: "Please rate your experience!" }]}
                  >
                    <Radio.Group>
                      {experienceOptions.map((option) => (
                        <Radio key={option.value} value={option.value}>
                          {option.label}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    label="Comments"
                    name="comments"
                    rules={[{ required: true, message: "Please enter your comments!" }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Please share any additional comments or suggestions..."
                    />
                  </Form.Item>

                  <Form.Item
                    label="Has Complaint?"
                    name="hasComplaint"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) =>
                      getFieldValue("hasComplaint") ? (
                        <Form.Item
                          label="Complaint Text"
                          name="complaintText"
                          rules={[
                            { required: true, message: "Please enter complaint text!" },
                          ]}
                        >
                          <TextArea rows={3} placeholder="Describe the complaint..." />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={() => form.resetFields()}>
                      Reset
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {loading ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        );
      case "view-feedbacks":
        return (
          <div>
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
                    className="!w-full"
                    size="large"
                  >
                    <Option value="true">Yes</Option>
                    <Option value="false">No</Option>
                  </Select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium text-gray-700">Date range</div>
                  <RangePicker
                    className="!w-full"
                    value={draftFromTo}
                    onChange={(val) => setDraftFromTo(val)}
                    size="large"
                  />
                </div>
              </div>
            </Drawer>

            <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
              <DataTable
                columns={[
                  {
                    title: "Client Name",
                    dataIndex: "clientName",
                    key: "clientName",
                    width: 140,
                  },
                  {
                    title: "Doctor Name",
                    dataIndex: "doctorName",
                    key: "doctorName",
                    width: 140,
                  },
                  {
                    title: "Service Name",
                    dataIndex: "serviceName",
                    key: "serviceName",
                    width: 140,
                  },
                  {
                    title: "Staff Name",
                    dataIndex: "staffName",
                    key: "staffName",
                    width: 160,
                    ellipsis: true,
                  },
                  {
                    title: "Experience Rating",
                    dataIndex: "experience",
                    key: "experience",
                    width: 140,
                    render: (rating) => (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${String(rating).toUpperCase() === "EXCELLENT"
                          ? "bg-green-100 text-green-800"
                          : String(rating).toUpperCase() === "GOOD"
                            ? "bg-gw-primary-light/40 text-gw-primary-dark"
                            : String(rating).toUpperCase() === "FAIR"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {rating}
                      </span>
                    ),
                  },

                  {
                    title: "Comments",
                    dataIndex: "comments",
                    key: "comments",
                    width: 200,
                    ellipsis: true,
                  },
                  {
                    title: "Complaint",
                    dataIndex: "hasComplaint",
                    key: "hasComplaint",
                    width: 120,
                    render: (v) =>
                      v ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          No
                        </span>
                      ),
                  },
                  {
                    title: "Complaint Text",
                    dataIndex: "complaintText",
                    key: "complaintText",
                    width: 220,
                    ellipsis: true,
                  },
                  {
                    title: "Date",
                    dataIndex: "date",
                    key: "date",
                    width: 110,
                  },
                ]}
                dataSource={feedbacks}
                rowKey="id"
                scroll={{ x: 1100 }}
                loading={tableLoading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page) => setPagination((p) => ({ ...p, current: page })),
                }}
              />
            </div>
          </div>
        );
      default:
        return <div>Not Found</div>;
    }
  };

  const tabItems = [
    {
      key: "new-feedback",
      label: "New Feedback",
    },
    {
      key: "view-feedbacks",
      label: "View Feedbacks",
    },
  ];

  return (
    <div className="pageCss min-w-0 max-w-full">
      <div className="mb-4 sm:mb-6">
        <h1 className="m-0 text-xl font-bold text-gw-primary-dark sm:text-2xl lg:text-3xl">
          Feedbacks
        </h1>
      </div>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={tabItems}
        className="min-w-0 [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-wrap]:pb-1 [&_.ant-tabs-nav-list]:flex-nowrap"
      />
      <div className="mt-4 min-w-0 sm:mt-5">{renderActiveComponent()}</div>
    </div>
  );
};

export default FeedbackManagement;
