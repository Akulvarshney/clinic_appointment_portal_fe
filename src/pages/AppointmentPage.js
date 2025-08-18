import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import axios from "axios";
import { AutoComplete, Button } from "antd";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import { BACKEND_URL, isFeatureValid } from "../assets/constants";
import { Divider, Descriptions, Tag } from "antd";

const { Option } = Select;

const START_HOUR = 8;
const END_HOUR = 21;
const SLOT_MINUTES = 15;
const SLOT_HEIGHT = 30;
const HEADER_H = 40;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function snapTo(mins, step = SLOT_MINUTES) {
  return Math.round(mins / step) * step;
}
function floorSnapTo(mins, step = SLOT_MINUTES) {
  return Math.floor(mins / step) * step;
}
function minutesSinceStart(d) {
  return (d.getHours() - START_HOUR) * 60 + d.getMinutes();
}
function timeLabel(h, m = 0) {
  return new Date(0, 0, 0, h, m).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function mkId() {
  return Math.random().toString(36).slice(2, 9);
}
function isOverlapping(newAppt, appointmentsList) {
  return appointmentsList.some((a) => {
    if (a.id === newAppt.id) return false;
    if (a.resourceId !== newAppt.resourceId) return false;
    return (
      (newAppt.start >= a.start && newAppt.start < a.end) ||
      (newAppt.end > a.start && newAppt.end <= a.end) ||
      (newAppt.start <= a.start && newAppt.end >= a.end)
    );
  });
}

function getStatusColor(status) {
  switch (status) {
    case "BOOKED":
      return "#e2eafc"; // light blue
    case "CONFIRMED":
      return "#c5f0dd"; // light mint green
    case "VISITED":
      return "#b2f5a6"; // pastel green
    case "NO_SHOW":
      return "#f2e59b"; // soft yellow
    case "CANCELLED":
      return "#f5a17a"; // light orange/red
    case "CLOSED":
      return "#97989c"; // grey
    default:
      return "#ffffff"; // fallback white
  }
}

export default function AppointmentPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });

  const [isAllowedToAddAppointment, setIsAllowedToAddAppointment] =
    useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const response1 = isFeatureValid("APPOINTMENT", "ADD_APPOINTMENT");

    setIsAllowedToAddAppointment(response1);

    console.log("isFeatureValid response:", response1);
  }, []);

  const [Employees, setEmployees] = useState([]); // resources / columns
  const [Resources, setResources] = useState([]);
  const [Doctor, setDoctor] = useState([]);
  const [Services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [refreshAppointments, setRefreshAppointments] = useState(false);
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");

  const [clientOptions, setClientOptions] = useState([]);

  const colRefs = useRef({});
  const timeRulerRef = useRef(null);
  const mainColumnsRef = useRef(null);

  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [newApptInfo, setNewApptInfo] = useState(null); // { resourceId, start, end }
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAppt, setDetailAppt] = useState(null);

  const [form] = Form.useForm();

  const orgId = localStorage.getItem("selectedOrgId");
  const token = localStorage.getItem("token");

  const moveDay = (delta) => {
    console.log("Moving day by:", delta);
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + delta);
    console.log("New date will be:", newDate);
    setCurrentDate(newDate);
  };

  const goToday = () => {
    const today = new Date();
    const newDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    console.log("Going to today:", newDate);
    setCurrentDate(newDate);
  };

  const totalMinutes = (END_HOUR - START_HOUR) * 60;
  const slotCount = totalMinutes / SLOT_MINUTES;

  // build times array (for time-ruler rows)
  const timeSlots = useMemo(() => {
    const out = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) out.push({ h, m });
    }
    return out;
  }, []);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/clientAdmin/userMgmt/getEmployees?orgId=${orgId}&status=ENABLED`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const employees = response.data.response.data || [];
        console.log("Employeeesss ", employees);
        const formatted = employees.map((emp) => ({
          id: emp.id,
          name: emp.first_name,
          color: "#e3f2fd",
          dot: emp.color || "#789",
        }));
        setEmployees(formatted);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEmployees();
  }, [orgId, token]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/clientAdmin/userMgmt/getDoctors?orgId=${orgId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const doctor = response.data.response || [];
        //console.log("doctor "   , doctor)
        const formatted = doctor.map((doc) => ({
          id: doc.id,
          name: doc.first_name,
          color: "#e3f2fd",
          dot: doc.color || "#789",
        }));
        setDoctor(formatted);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDoctors();
  }, [orgId, token]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/clientAdmin/serviceManagement/getActiveServices?orgId=${orgId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const services = response.data.data || [];
        //console.log("services "   , services)
        const formatted = services.map((service) => ({
          id: service.id,
          name: service.name,
          color: "#e3f2fd",
          dot: service.color || "#789",
        }));
        //console.log("formatted services>> ", formatted )
        setServices(formatted);
      } catch (err) {
        console.error(err);
      }
    }
    fetchServices();
  }, [orgId, token]);

  // Fetch resources for columns
  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/clientAdmin/resourceManagement/getResources?orgId=${orgId}&status=ENABLED`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const roles = response.data.response || [];
        const formatted = roles.map((emp) => ({
          id: emp.id,
          name: emp.name,
          color: "#e3f2fd",
          dot: emp.color || "#789",
        }));
        setResources(formatted);
      } catch (err) {
        console.error(err);
      }
    }
    fetchResources();
  }, [orgId, token]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/patient/clients/clientListing`,
          {
            params: {
              // search,
              // page: pagination.current,
              limit: 10000,
              orgId,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setClientOptions(response.data.data || []);
      } catch (err) {
        console.error("Error fetching clients:", err);
        message.error("Failed to fetch clients");
      }
    };
    fetchClients();
  }, [orgId, token]);

  const updateAppointmentStatus = async (appId, status) => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/appointments/appt/changeAppointmentStatus?id=${appId}&status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === appId ? { ...app, status: status } : app
        )
      );
      setTimeout(() => {
        setShowDetailModal(false);
      }, 1500);
      return res.data;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelRemarks.trim()) {
      alert("Please Enter the cancellation Remarks");
      //message.error("Please enter cancellation remarks");
      return;
    }
    try {
      await axios.post(
        `${BACKEND_URL}/appointments/appt/cancelAppointment?id=${detailAppt.id}`,
        {
          Cancel_remarks: cancelRemarks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDetailAppt((prev) => ({
        ...prev,
        status: "CANCELLED",
        remarks: cancelRemarks,
      }));

      message.success("Appointment cancelled");
      setShowCancelInput(false);
      setShowDetailModal(false);
      setCancelRemarks("");
      setRefreshAppointments((prev) => !prev);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      message.error("Failed to cancel appointment");
    }
  };

  // FIXED: Fetch appointments with proper dependencies and loading state
  useEffect(() => {
    async function fetchAppointments() {
      // Only fetch if we have the required data
      if (!orgId || !token) {
        console.log("Missing orgId or token, skipping fetch");
        return;
      }

      try {
        setAppointmentsLoading(true);
        // Clear existing appointments immediately when date changes
        setAppointments([]);

        const date = dayjs(currentDate).startOf("day").toISOString();
        console.log("Fetching appointments for date:", date);
        console.log("Current date object:", currentDate);

        const response = await axios.get(
          `${BACKEND_URL}/appointments/appt/getActiveAppointments?orgId=${orgId}&date=${date}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const apptsFromAPI = response.data.response || [];
        console.log("Raw appointments from API:", apptsFromAPI);

        const formattedAppts = apptsFromAPI.map((appt) => ({
          id: appt.id,
          title: appt.title || "Appointment",
          start: new Date(appt.start_time),
          end: new Date(appt.end_time),
          resourceId: appt.resource_id,
          client: appt.clients?.first_name || "",
          service: appt.services?.name || "",
          status: appt.status || "",
          remarks: appt.remarks,
          color: getStatusColor(appt.status) || "#e2eafc",
        }));

        console.log("Formatted appointments:", formattedAppts);
        console.log(
          "Setting appointments state with:",
          formattedAppts.length,
          "appointments"
        );
        setAppointments(formattedAppts);
        setAppointmentsLoading(false);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        message.error("Failed to fetch appointments");
        // Clear appointments on error to prevent showing stale data
        setAppointments([]);
        setAppointmentsLoading(false);
      }
    }

    // Add a small delay to ensure state updates are processed
    const timeoutId = setTimeout(fetchAppointments, 50);
    return () => clearTimeout(timeoutId);
  }, [orgId, token, currentDate, refreshAppointments]); // FIXED: Removed Resources dependency

  useEffect(() => {
    const timeElem = timeRulerRef.current;
    const mainElem = mainColumnsRef.current;
    if (!timeElem || !mainElem) return;
    const syncScroll = () => {
      timeElem.scrollTop = mainElem.scrollTop;
    };
    mainElem.addEventListener("scroll", syncScroll);
    return () => mainElem.removeEventListener("scroll", syncScroll);
  }, []);

  // Drag start
  const onDragStart = (e, appt) => {
    const duration = Math.max(15, (appt.end - appt.start) / 60000);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id: appt.id, duration, offsetY })
    );
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOverCol = (e) => e.preventDefault();

  const applyMove = (id, resourceId, clientY, offsetY) => {
    const col = colRefs.current[resourceId];
    if (!col) return;
    const rect = col.getBoundingClientRect();

    const y = clientY - rect.top - offsetY;
    const minsFromTop = floorSnapTo((y / SLOT_HEIGHT) * SLOT_MINUTES);
    const clamped = clamp(minsFromTop, 0, totalMinutes - SLOT_MINUTES);
    const startH = Math.floor(clamped / 60) + START_HOUR;
    const startM = clamped % 60;

    return { startH, startM };
  };

  const onDropOnCol = (e, resourceId) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return;
    }
    const { id, duration, offsetY } = parsed;
    const pos = applyMove(id, resourceId, e.clientY, offsetY);
    if (!pos) return;

    const newStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      pos.startH,
      pos.startM
    );

    const newEnd = new Date(newStart.getTime() + duration * 60000);

    const dayEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      END_HOUR,
      0
    );

    const finalEnd = newEnd > dayEnd ? dayEnd : newEnd;
    const finalStart = new Date(finalEnd.getTime() - duration * 60000);

    const proposed = { id, resourceId, start: finalStart, end: finalEnd };
    //console.log("Proposed>>> " , proposed);
    if (isOverlapping(proposed, appointments)) {
      alert("Cannot move: appointment overlaps an existing appointment.");
      return;
    }
    // call the reschedule api here.
    rescheduleAppointment(proposed);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, resourceId, start: finalStart, end: finalEnd } : a
      )
    );
  };

  const rescheduleAppointment = async (proposed) => {
    const response = await axios.post(
      `${BACKEND_URL}/appointments/appt/rescheduleAppointments`,
      proposed,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(response);
  };

  const startResize = (e, id, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    const initStart = new Date(appt.start),
      initEnd = new Date(appt.end);

    let newStartNew = initStart;
    let newEndNew = initEnd;

    const onMove = (ev) => {
      const deltaPx = ev.clientY - startY;
      const deltaMins = snapTo((deltaPx / SLOT_HEIGHT) * SLOT_MINUTES);
      let newStart = new Date(initStart),
        newEnd = new Date(initEnd);

      if (direction === "top") {
        newStart = new Date(initStart.getTime() + deltaMins * 60000);
        if (newStart >= newEnd)
          newStart = new Date(newEnd.getTime() - SLOT_MINUTES * 60000);
        const dayStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          START_HOUR,
          0
        );
        if (newStart < dayStart) newStart = dayStart;
      } else {
        newEnd = new Date(initEnd.getTime() + deltaMins * 60000);
        if (newEnd <= newStart)
          newEnd = new Date(newStart.getTime() + SLOT_MINUTES * 60000);
        const dayEnd = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          END_HOUR,
          0
        );
        if (newEnd > dayEnd) newEnd = dayEnd;
      }

      const snapEdge = (d) => {
        const mins = floorSnapTo(minutesSinceStart(d));
        const H = Math.floor(mins / 60) + START_HOUR;
        const M = mins % 60;
        return new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          H,
          M
        );
      };

      if (direction === "top") newStart = snapEdge(newStart);
      else newEnd = snapEdge(newEnd);

      const proposed = {
        id,
        resourceId: appt.resourceId,
        start: direction === "top" ? newStart : appt.start,
        end: direction === "bottom" ? newEnd : appt.end,
      };

      if (isOverlapping(proposed, appointments)) {
        alert("Cannot move: appointment overlaps an existing appointment.");
        return;
      }

      newEndNew = newEnd;
      newStartNew = newStart;
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                start: direction === "top" ? newStart : a.start,
                end: direction === "bottom" ? newEnd : a.end,
              }
            : a
        )
      );
    };

    const onUp = async () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const proposed = {
        id,
        resourceId: appt.resourceId,
        start: newStartNew,
        end: newEndNew,
      };
      rescheduleAppointment(proposed);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const onDoubleClickCol = (e, resourceId) => {
    // Check if user is allowed to add appointments
    if (!isAllowedToAddAppointment) {
      messageApi.error("You are not allowed to add an appointment.");
      return;
    }

    // Check if the current date is in the past
    const today = dayjs().startOf("day");
    const currentDateDayjs = dayjs(currentDate).startOf("day");

    if (currentDateDayjs.isBefore(today, "day")) {
      messageApi.error(
        "Cannot create appointments for past dates. Please select today or a future date."
      );
      return;
    }

    // Proceed with normal appointment creation logic
    const col = colRefs.current[resourceId];
    if (!col) return;

    const rect = col.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minsFromTop = floorSnapTo((y / SLOT_HEIGHT) * SLOT_MINUTES);
    const clamped = clamp(minsFromTop, 0, totalMinutes - SLOT_MINUTES);
    const h = Math.floor(clamped / 60) + START_HOUR;
    const m = clamped % 60;

    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      h,
      m
    );
    const end = new Date(start.getTime() + SLOT_MINUTES * 60000);

    setNewApptInfo({ resourceId, start, end });
    form.setFieldsValue({
      title: "",
      client: "",
      employeeId: "",
      notes: "",
      doctorId: "",
      service: "",
      date: dayjs(currentDate),
    });
    setShowNewApptModal(true);
  };

  const onClickAppointment = (appt) => {
    //console.log("appt here>>> " , appt)
    setDetailAppt(appt);
    setShowCancelInput(false);
    setShowDetailModal(true);
  };

  const saveNewAppointment = async (valuesFromForm) => {
    // things to be update later : service dropdown , doctor , note
    try {
      console.log("values formmmm ", valuesFromForm);
      const today = dayjs().startOf("day");
      const date = valuesFromForm.date || "";
      if (date.isBefore(today, "day")) {
        //message.error("Cannot pick a past date. Please select today or a future date.");
        console.log(
          "Cannot pick a past date. Please select today or a future date."
        );
        return;
      }
      const values = valuesFromForm || form.getFieldsValue();

      const title = values.title || "Appointment";
      const remarks = values.notes || "";
      const clientId = values.clientId || "";
      const resourceId = newApptInfo?.resourceId;
      const start = newApptInfo?.start;
      const end = newApptInfo?.end;
      const doctorId = values.doctorId;
      const serviceId = values.service;

      console.log(start);
      console.log(end);
      if (!resourceId || !start || !end) {
        message.error("Slot not selected properly");
        return;
      }

      // This object is sent to the backend (no mkId, backend generates it)
      const newAppt = {
        title,
        clientId,
        resourceId,
        date,
        start,
        end,
        orgId,
        remarks,
        doctorId,
        serviceId,
      };
      console.log(newAppt);

      // Optional: local overlap check before calling backend
      if (isOverlapping(newAppt, appointments)) {
        message.error("Cannot create: overlaps existing appointment");
        return;
      }

      // Make API call
      const response = await axios.post(
        `${BACKEND_URL}/appointments/appt/bookappointment`,
        newAppt,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments((prev) => [...prev, response.data]);

      // Reset modal and selection
      setShowNewApptModal(false);
      setNewApptInfo(null);
      setRefreshAppointments((prev) => !prev);
      message.success("Appointment saved successfully");
    } catch (err) {
      console.error("Error saving appointment:", err);
      message.error("Failed to save appointment");
    }
  };

  const closeNewApptModal = () => {
    setShowNewApptModal(false);
    setNewApptInfo(null);
  };
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailAppt(null);
  };

  // Render helpers (JSX) — kept styling similar to your original file
  function renderToolbar() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid #e0e7ef",
          background: "#e3f2fd",
          fontWeight: 700,
          fontSize: 14,
          color: "#222",
          userSelect: "none",
        }}
      >
        {contextHolder}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => moveDay(-1)}
            style={{
              padding: "0 10px",
              borderRadius: 6,
              border: "none",
              background: "#fff",
              cursor: "pointer",
            }}
            aria-label="Previous day"
          >
            ←
          </button>
          <div>
            {currentDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <button
            type="button"
            onClick={() => moveDay(1)}
            style={{
              padding: "0 10px",
              borderRadius: 6,
              border: "none",
              background: "#fff",
              cursor: "pointer",
            }}
            aria-label="Next day"
          >
            →
          </button>

          <button
            type="button"
            onClick={goToday}
            style={{
              marginLeft: 12,
              padding: "0 10px",
              borderRadius: 6,
              border: "none",
              background: "#e0e7ef",
              cursor: "pointer",
            }}
            aria-label="Today"
          >
            Today
          </button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 500, color: "#555" }}>
          Drag to move • Drag edges to resize • Double-click to add • Click
          appointment
          {appointmentsLoading && " • Loading..."}
          <div style={{ fontSize: 11, marginTop: 4 }}>
            Showing {appointments.length} appointments for{" "}
            {currentDate.toDateString()}
          </div>
        </div>
      </div>
    );
  }

  function renderTimeRuler() {
    return (
      <div
        ref={timeRulerRef}
        style={{
          borderRight: "1px solid #e0e7ef",
          background: "#f8fafc",
          position: "relative",
          overflowY: "scroll",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          userSelect: "none",
        }}
      >
        <div style={{ height: HEADER_H, borderBottom: "1px solid #e0e7ef" }} />
        {timeSlots.map(({ h, m }, i) => (
          <div
            key={i}
            style={{
              height: SLOT_HEIGHT,
              borderBottom: "1px dashed #e0e7ef",
              paddingRight: 8,
              textAlign: "right",
              fontSize: 11,
              color: "#789",
              display: "flex",
              alignItems: "flex-start",
              userSelect: "none",
            }}
          >
            {(m === 0 || m === 30) && (
              <span style={{ transform: "translateY(-2px)", width: "100%" }}>
                {timeLabel(h, m)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderAppointmentsForResource(r) {
    const appts = appointments.filter((a) => a.resourceId === r.id);
    console.log(
      `Rendering ${appts.length} appointments for resource ${r.id} (${r.name}):`,
      appts
    );

    if (appts.length === 0) {
      console.log(`No appointments found for resource ${r.id}`);
    }

    return appts.map((a) => {
      const minsTop = clamp(minutesSinceStart(a.start), 0, totalMinutes);
      const topPx = (minsTop / SLOT_MINUTES) * SLOT_HEIGHT;
      const durMins = Math.max(15, (a.end - a.start) / 60000);
      const heightPx = Math.max(16, (durMins / SLOT_MINUTES) * SLOT_HEIGHT);

      console.log(`Appointment ${a.id}: top=${topPx}px, height=${heightPx}px`);

      return (
        <div
          key={a.id}
          draggable
          onDragStart={(e) => onDragStart(e, a)}
          onClick={() => onClickAppointment(a)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClickAppointment(a);
          }}
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            top: topPx,
            height: heightPx,
            borderRadius: 7,
            border: "1px solid #bcd",
            background: getStatusColor(a.status),
            boxShadow: "0 2px 10px #b9eafb77",
            cursor: "grab",
            userSelect: "none",
            zIndex: 20,
            outline: "none",
            padding: "8px 10px 6px",
            color: "#125",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* top resize handle */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -2,
              height: 8,
              cursor: "ns-resize",
              zIndex: 21,
            }}
            onMouseDown={(e) => startResize(e, a.id, "top")}
          />

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -2,
              height: 8,
              cursor: "ns-resize",
              zIndex: 21,
            }}
            onMouseDown={(e) => startResize(e, a.id, "bottom")}
          />
          <div
            style={{
              fontWeight: "bold",
              fontSize: 13,
              marginBottom: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {a.client} ( {a.service} )
          </div>
          <div style={{ fontSize: 12, color: "#345" }}>
            {timeLabel(a.start.getHours(), a.start.getMinutes())} —{" "}
            {timeLabel(a.end.getHours(), a.end.getMinutes())}
          </div>
        </div>
      );
    });
  }

  function renderResourceColumns() {
    console.log(
      "Rendering resource columns. Total appointments:",
      appointments.length
    );
    console.log("Current appointments:", appointments);

    return (
      <div
        style={{
          display: "grid",
          position: "relative",
          gridTemplateColumns: `repeat(${Resources.length}, minmax(0,1fr))`,
          minHeight: slotCount * SLOT_HEIGHT,
          background: "#f9fafb",
          height: "100%",
          userSelect: "none",
        }}
      >
        {Resources.length ? (
          Resources.map((r) => (
            <div
              key={r.id}
              ref={(el) => (colRefs.current[r.id] = el)}
              style={{
                position: "relative",
                borderRight: "1px solid #e0e7ef",
                background: "#fff",
              }}
              onDragOver={onDragOverCol}
              onDrop={(e) => onDropOnCol(e, r.id)}
              onDoubleClick={(e) => {
                if (isAllowedToAddAppointment) {
                  onDoubleClickCol(e, r.id);
                } else {
                  messageApi.error(
                    "You are not allowed to add an appointment."
                  );
                }
              }}
              title="Double-click empty space to add appointment"
            >
              {/* empty slot lines */}
              {Array.from({ length: slotCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: SLOT_HEIGHT,
                    borderBottom: "1px solid #f6f8fa",
                  }}
                />
              ))}
              {/* render appointments absolutely positioned */}
              {renderAppointmentsForResource(r)}
            </div>
          ))
        ) : (
          <div style={{ padding: 20 }}>Loading resources...</div>
        )}
      </div>
    );
  }

  function renderStickyHeader() {
    return (
      <div
        style={{
          display: "grid",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderBottom: "1px solid #e0e7ef",
          gridTemplateColumns: `repeat(${
            Resources.length || 1
          }, minmax(0,1fr))`,
          height: HEADER_H,
          userSelect: "none",
        }}
      >
        {(Resources.length
          ? Resources
          : [{ id: "loading", name: "Loading..." }]
        ).map((r, i) => (
          <div
            key={r.id + "_" + i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "#345",
              borderRight:
                i === Resources.length - 1 ? "none" : "1px solid #e0e7ef",
              height: "100%",
              userSelect: "none",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  height: 14,
                  width: 14,
                  borderRadius: 7,
                  display: "inline-block",
                  background: r.dot || "#789",
                }}
              />
              {r.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* New Appointment Modal - Antd */}
      <Modal
        title="New Appointment"
        open={showNewApptModal}
        onOk={() => {
          form
            .validateFields()
            .then((vals) => {
              saveNewAppointment(vals);
            })
            .catch(() => {});
        }}
        onCancel={closeNewApptModal}
        okText="Save"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs(currentDate) }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Appointment title" />
          </Form.Item>

          <Form.Item name="clientId" label="Client">
            <Select
              showSearch
              placeholder="Select client"
              optionFilterProp="children"
              onChange={(value, option) => {
                form.setFieldsValue({ clientId: option.value });
              }}
              filterOption={(input, option) =>
                (option?.children?.toString() ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {clientOptions.map((client) => (
                <Option key={client.id} value={client.id}>
                  {client.first_name} ({client.phone || client.portalid})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: false }]}
          >
            <Select placeholder="Select employee (optional)">
              {Employees.map((Employee) => (
                <Option key={Employee.name} value={Employee.id}>
                  {Employee.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="doctorId"
            label="Doctor"
            rules={[{ required: false }]}
          >
            <Select placeholder="Select Doctor (optional)">
              {Doctor.map((Doctor) => (
                <Option key={Doctor.name} value={Doctor.id}>
                  {Doctor.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="service"
            label="Service"
            rules={[{ required: false }]}
          >
            <Select placeholder="Select Service (optional)">
              {Services.map((Service) => (
                <Option key={Service.name} value={Service.id}>
                  {Service.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date" label="Date">
            <DatePicker value={dayjs(currentDate)} disabled />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <div style={{ fontSize: 12, color: "#555" }}>
            Slot:{" "}
            {newApptInfo
              ? `${timeLabel(
                  newApptInfo.start.getHours(),
                  newApptInfo.start.getMinutes()
                )} — ${timeLabel(
                  newApptInfo.end.getHours(),
                  newApptInfo.end.getMinutes()
                )}`
              : "not selected"}
          </div>
        </Form>
      </Modal>

      {/* Appointment Detail Modal (Antd) */}
      <Modal
        title={
          <span style={{ fontWeight: "bold", fontSize: 18 }}>
            🗓 Appointment Details
          </span>
        }
        open={showDetailModal}
        onOk={closeDetailModal}
        onCancel={closeDetailModal}
        okText="Close"
        cancelButtonProps={{ style: { display: "none" } }}
        width={900} // wider modal
        bodyStyle={{
          padding: "20px 32px",
          maxHeight: "75vh", // limits height so footer is visible
          overflowY: "auto",
        }}
      >
        {detailAppt && (
          <div>
            {/* Title */}
            <h2 style={{ marginBottom: 16, color: "#1890ff" }}>
              {detailAppt.title}
            </h2>

            {/* Appointment Info */}
            <Descriptions
              bordered
              column={2} // show in 2 columns to reduce vertical scroll
              size="middle"
              labelStyle={{ fontWeight: "bold", width: 150 }}
            >
              <Descriptions.Item label="Client">
                {detailAppt.client || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Time">
                {timeLabel(
                  detailAppt.start.getHours(),
                  detailAppt.start.getMinutes()
                )}{" "}
                —{" "}
                {timeLabel(
                  detailAppt.end.getHours(),
                  detailAppt.end.getMinutes()
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Resource">
                {(Resources.find((r) => r.id === detailAppt.resourceId) || {})
                  .name || detailAppt.resourceId}
              </Descriptions.Item>

              <Descriptions.Item label="Employee Name">
                {(Resources.find((r) => r.id === detailAppt.resourceId) || {})
                  .name || detailAppt.resourceId}
              </Descriptions.Item>

              <Descriptions.Item label="Service Name">
                {detailAppt.service || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Doctor">
                {(Doctor.find((d) => d.id === detailAppt.doctorId) || {})
                  .name || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Select
                  value={detailAppt.status}
                  style={{ width: 180 }}
                  onChange={async (value) => {
                    try {
                      await updateAppointmentStatus(detailAppt.id, value);
                      setDetailAppt((prev) => ({ ...prev, status: value }));
                      setAppointments((prev) =>
                        prev.map((appt) =>
                          appt.id === detailAppt.id
                            ? { ...appt, status: value }
                            : appt
                        )
                      );
                    } catch (err) {
                      message.error("Could not update status");
                    }
                  }}
                  options={[
                    { label: "Booked", value: "BOOKED" },
                    { label: "Confirmed", value: "CONFIRMED" },
                    { label: "Visited", value: "VISITED" },
                    { label: "No Show", value: "NO_SHOW" },
                  ]}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Remarks">
                {detailAppt.remarks || (
                  <em style={{ color: "#999" }}>No remarks</em>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Cancellation Section */}
            {!showCancelInput ? (
              <Button
                danger
                type="primary"
                block
                style={{ marginTop: 12 }}
                onClick={() => setShowCancelInput(true)}
              >
                Cancel Appointment
              </Button>
            ) : (
              <div style={{ marginTop: 12 }}>
                <Input.TextArea
                  placeholder="Enter cancellation remarks"
                  rows={3}
                  value={cancelRemarks}
                  onChange={(e) => setCancelRemarks(e.target.value)}
                />
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    danger
                    type="primary"
                    onClick={handleCancelAppointment}
                  >
                    Save Cancellation
                  </Button>
                  <Button onClick={() => setShowCancelInput(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Main page */}
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: 18,
          fontFamily: "Arial, sans-serif",
          userSelect: "none",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <div
          style={{
            height: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            borderRadius: 18,
            border: "1px solid #e0e7ef",
            background: "#fff",
            boxShadow: "0 2px 16px #e3f2fd88",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {renderToolbar()}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              height: "calc(100vh - 80px)",
            }}
          >
            {renderTimeRuler()}
            <div
              ref={mainColumnsRef}
              style={{
                overflowY: "scroll",
                position: "relative",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                userSelect: "none",
              }}
            >
              {renderStickyHeader()}
              {renderResourceColumns()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
