// AppointmentPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import axios from "axios";
import { AutoComplete } from "antd";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import { BACKEND_URL } from "../assets/constants";

const { Option } = Select;

const START_HOUR = 8;
const END_HOUR = 21;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 45;
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

// Simple Portal modal wrapper if you ever need custom modal (we use antd Modal below)
const PortalModal = ({ children, onClose }) =>
  ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 10,
          maxWidth: 400,
          width: "100%",
          padding: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: "Arial, sans-serif",
          fontSize: 14,
          color: "#222",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );

export default function AppointmentPage() {
  
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });

  const [Employees, setEmployees] = useState([]); // resources / columns
  const [Resources, setResources] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [refreshAppointments, setRefreshAppointments] = useState(false);


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
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  };
  const goToday = () => {
    const d = new Date();
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
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

        const employees = response.data.response || [];
        console.log("Employeeesss "   , employees)
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
    
  }, [orgId, token ]);

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
    
  }, [orgId, token ]);


useEffect(() => {
  async function fetchAppointments() {
    try {
     const date = dayjs(currentDate).startOf('day').toISOString();

      const response = await axios.get(
        `${BACKEND_URL}/appointments/appt/getActiveAppointments?orgId=${orgId}&date=${date}`,
        {
          
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apptsFromAPI = response.data.response || [];


      const formattedAppts = apptsFromAPI.map(appt => ({
        id: appt.id,
        title: appt.title || "Appointment",
        start: new Date(appt.start_time), 
        end: new Date(appt.end_time),     
        resourceId: appt.resource_id,     
        client: appt.clientName || "",   
      }));

      setAppointments(formattedAppts);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      message.error("Failed to fetch appointments");
    }
  }

  if (orgId && token) {
    fetchAppointments();
  }
}, [orgId, token, Resources,currentDate,refreshAppointments]); 

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

// Debounced search function
const searchClients = debounce(async (value) => {
  if (!value) {
    setClientOptions([]);
    return;
  }

  try {
    const response = await axios.get(
      `${BACKEND_URL}/patient/clients/clientSearch`,
      {
        params: {
          search: value, 
          limit: 5,      
          orgId,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = response.data.data || [];
    console.log("data" ,data)

    setClientOptions(
      data.map((c) => ({
        value: c.id,
        label: `${c.first_name} (${c.phone || "No phone"})`,
      }))
    );
  } catch (err) {
    console.error("Error fetching clients:", err);
    message.error("Failed to fetch clients");
  }
}, 300);

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
    if (isOverlapping(proposed, appointments)) {
      alert("Cannot move: appointment overlaps an existing appointment.");
      return;
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, resourceId, start: finalStart, end: finalEnd } : a
      )
    );
  };

  // Resize handlers
  const startResize = (e, id, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    const initStart = new Date(appt.start),
      initEnd = new Date(appt.end);

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
        return;
      }

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

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };


  const onDoubleClickCol = (e, resourceId) => {
   // alert(resourceId)
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
      date: dayjs(currentDate),
    });
    setShowNewApptModal(true);
  };

  const onClickAppointment = (appt) => {
    setDetailAppt(appt);
    setShowDetailModal(true);
  };

  const saveNewAppointment = async (valuesFromForm) => {
    // things to be update later : service dropdown , doctor , note
  try {
    console.log(valuesFromForm)
    const today = dayjs().startOf("day");
        const date = valuesFromForm.date || ""
    if (date.isBefore(today, "day")) {
      //message.error("Cannot pick a past date. Please select today or a future date.");
      console.log("Cannot pick a past date. Please select today or a future date.")
      return;
    }
    const values = valuesFromForm || form.getFieldsValue();

    const title = values.title || "Appointment";
     const remarks = values.notes || "";
    const client = values.client || "";
    const resourceId = newApptInfo?.resourceId;
    const start = newApptInfo?.start;
    const end = newApptInfo?.end;
    console.log(start)
    console.log(end)
    if (!resourceId || !start || !end) {
      message.error("Slot not selected properly");
      return;
    }

    // This object is sent to the backend (no mkId, backend generates it)
    const newAppt = {
      title,
      clientId: client, // assuming client is the ID
      resourceId,
      date,
      start,
      end,
      orgId,
      remarks
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
    setRefreshAppointments(prev => !prev); 
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
          Drag to move • Drag edges to resize • Double-click to add • Click appointment
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
    return appts.map((a) => {
      const minsTop = clamp(minutesSinceStart(a.start), 0, totalMinutes);
      const topPx = (minsTop / SLOT_MINUTES) * SLOT_HEIGHT;
      const durMins = Math.max(15, (a.end - a.start) / 60000);
      const heightPx = Math.max(16, (durMins / SLOT_MINUTES) * SLOT_HEIGHT);
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
          title={
            a.title +
            "\n" +
            timeLabel(a.start.getHours(), a.start.getMinutes()) +
            " — " +
            timeLabel(a.end.getHours(), a.end.getMinutes())
          }
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            top: topPx,
            height: heightPx,
            borderRadius: 7,
            border: "1px solid #bcd",
            background: r.color || "#e2eafc",
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
          {/* bottom resize handle */}
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
            {a.title}
          </div>
          <div style={{ fontSize: 12, color: "#345" }}>
            {timeLabel(a.start.getHours(), a.start.getMinutes())} —{" "}
            {timeLabel(a.end.getHours(), a.end.getMinutes())}
          </div>
          {a.client ? (
            <div
              style={{
                fontSize: 12,
                color: "#567",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Client: {a.client}
            </div>
          ) : null}
        </div>
      );
    });
  }

  function renderResourceColumns() {
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
              onDoubleClick={(e) => onDoubleClickCol(e, r.id)}
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
          gridTemplateColumns: `repeat(${Resources.length || 1}, minmax(0,1fr))`,
          height: HEADER_H,
          userSelect: "none",
        }}
      >
        {(Resources.length ? Resources : [{ id: "loading", name: "Loading..." }]).map(
          (r, i) => (
            <div
              key={r.id + "_" + i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                color: "#345",
                borderRight: i === Resources.length - 1 ? "none" : "1px solid #e0e7ef",
                height: "100%",
                userSelect: "none",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
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
          )
        )}
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
        <Form form={form} layout="vertical" initialValues={{ date: dayjs(currentDate) }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Appointment title" />
          </Form.Item>
          {/* <Form.Item name="client" label="Client" rules={[{ required: false }]}>
            <Input placeholder="Client name" />
          </Form.Item> */}
             <Form.Item name="client" label="Client" rules={[{ required: false }]}>
              <AutoComplete
                options={clientOptions}
                onSearch={searchClients}
                placeholder="Search client name"
                allowClear
                filterOption={false} 
              />
            </Form.Item> 

          <Form.Item name="employeeId" label="Employee" rules={[{ required: false }]}>
            <Select placeholder="Select employee (optional)">
              {Employees.map((Employee) => (
                <Option key={Employee.name} value={Employee.id}>
                  {Employee.name}
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
              ? `${timeLabel(newApptInfo.start.getHours(), newApptInfo.start.getMinutes())} — ${timeLabel(
                  newApptInfo.end.getHours(),
                  newApptInfo.end.getMinutes()
                )}`
              : "not selected"}
          </div>
        </Form>
      </Modal>

      {/* Appointment Detail Modal (Antd) */}
      <Modal title="Appointment" open={showDetailModal} onOk={closeDetailModal} onCancel={closeDetailModal} okText="Close" cancelButtonProps={{ style: { display: "none" } }}>
        {detailAppt && (
          <div>
            <h3 style={{ marginTop: 0 }}>{detailAppt.title}</h3>
            <div>
              <b>Client:</b> {detailAppt.client || "N/A"}
            </div>
            <div>
              <b>Time:</b>{" "}
              {timeLabel(detailAppt.start.getHours(), detailAppt.start.getMinutes())} —{" "}
              {timeLabel(detailAppt.end.getHours(), detailAppt.end.getMinutes())}
            </div>
            <div>
              <b>Resource:</b> {(Resources.find((r) => r.id === detailAppt.resourceId) || {}).name || detailAppt.resourceId}
            </div>
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
