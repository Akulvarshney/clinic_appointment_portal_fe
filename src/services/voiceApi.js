import axios from "axios";
import { BACKEND_URL } from "../assets/constants";

// Helper to get auth header with token (same convention as whatsappService.js)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==========================================
// CONFIGURATION
// ==========================================

export const getVoiceConfiguration = async (orgId) => {
  const response = await axios.get(
    `${BACKEND_URL}/voice/configuration?orgId=${orgId}`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const createVoiceConfiguration = async ({
  orgId,
  accountName,
  twilioSid,
  twilioToken,
  phoneNumbers,
}) => {
  const response = await axios.post(
    `${BACKEND_URL}/voice/configuration`,
    { orgId, accountName, twilioSid, twilioToken, phoneNumbers },
    getAuthHeaders()
  );
  return response.data.data;
};

export const updateVoiceConfiguration = async ({
  orgId,
  accountName,
  twilioSid,
  twilioToken,
  phoneNumbers,
}) => {
  const response = await axios.put(
    `${BACKEND_URL}/voice/configuration`,
    { orgId, accountName, twilioSid, twilioToken, phoneNumbers },
    getAuthHeaders()
  );
  return response.data.data;
};

// ==========================================
// DASHBOARD
// ==========================================

export const getVoiceDashboard = async (orgId) => {
  const response = await axios.get(
    `${BACKEND_URL}/voice/dashboard?orgId=${orgId}`,
    getAuthHeaders()
  );
  return response.data.data;
};

/** Extended KPIs (this month + total till date) - fetched only on demand. */
export const getVoiceDashboardExtended = async (orgId) => {
  const response = await axios.get(
    `${BACKEND_URL}/voice/dashboard/extended?orgId=${orgId}`,
    getAuthHeaders()
  );
  return response.data.data;
};

// ==========================================
// CALL LOGS / MAKE CALL
// ==========================================

export const getVoiceCalls = async (orgId, params = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
    search,
    dateFrom,
    dateTo,
    status,
    direction,
    fromNumber,
    clientId,
  } = params;

  const query = new URLSearchParams({ orgId, page, limit });
  if (sortBy) query.append("sortBy", sortBy);
  if (sortOrder) query.append("sortOrder", sortOrder);
  if (search) query.append("search", search);
  if (dateFrom) query.append("dateFrom", dateFrom);
  if (dateTo) query.append("dateTo", dateTo);
  if (status) query.append("status", status);
  if (direction) query.append("direction", direction);
  if (fromNumber) query.append("fromNumber", fromNumber);
  if (clientId) query.append("clientId", clientId);

  const response = await axios.get(
    `${BACKEND_URL}/voice/calls?${query.toString()}`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const createVoiceCall = async ({ orgId, from_number, to_number, client_id }) => {
  const response = await axios.post(
    `${BACKEND_URL}/voice/calls`,
    { orgId, from_number, to_number, client_id },
    getAuthHeaders()
  );
  return response.data.data;
};

/** Fetches recording audio as a blob (keeps Twilio credentials server-side only). */
export const fetchVoiceCallRecordingBlob = async (callId, orgId, download = false) => {
  const response = await axios.get(
    `${BACKEND_URL}/voice/calls/${callId}/recording?orgId=${orgId}&download=${download}`,
    { ...getAuthHeaders(), responseType: "blob" }
  );
  return response.data;
};

// ==========================================
// CLIENT SEARCH (for the "Registered Client" call type)
// ==========================================

export const searchClients = async (orgId, search, limit = 10) => {
  const response = await axios.get(
    `${BACKEND_URL}/patient/clients/clientSearch?orgId=${orgId}&search=${encodeURIComponent(
      search || ""
    )}&limit=${limit}`,
    getAuthHeaders()
  );
  return response.data?.data || [];
};
