import axios from "axios";
import { BACKEND_URL } from "../assets/constants";

// Helper to get auth header with token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==========================================
// SUPER ADMIN ENDPOINTS
// ==========================================

export const getSAOrganizationsWhatsapp = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/admin/whatsapp/organizations`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const toggleWhatsappForOrg = async (organizationId, enabled) => {
  const response = await axios.post(
    `${BACKEND_URL}/admin/whatsapp/toggle`,
    { organizationId, enabled },
    getAuthHeaders()
  );
  return response.data.data;
};

export const addCreditsToOrg = async (organizationId, amount) => {
  const response = await axios.post(
    `${BACKEND_URL}/admin/whatsapp/add-credits`,
    { organizationId, amount },
    getAuthHeaders()
  );
  return response.data.data;
};

export const getGlobalCreditRate = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/admin/whatsapp/credit-rate`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const updateGlobalCreditRate = async (creditValue) => {
  const response = await axios.post(
    `${BACKEND_URL}/admin/whatsapp/credit-rate`,
    { creditValue },
    getAuthHeaders()
  );
  return response.data.data;
};

export const getSACustomTemplates = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/admin/whatsapp/custom-templates`,
    getAuthHeaders()
  );
  return response.data;
};

export const approveSACustomTemplate = async (templateId, payload) => {
  const response = await axios.put(
    `${BACKEND_URL}/admin/whatsapp/custom-templates/${templateId}/approve`,
    payload,
    getAuthHeaders()
  );
  return response.data;
};
// ==========================================
// CLIENT ADMIN (ORGANIZATION) ENDPOINTS
// ==========================================

export const getOrgWhatsappDashboard = async (orgId) => {
  const response = await axios.get(
    `${BACKEND_URL}/clientadmin/whatsapp/dashboard?orgId=${orgId}`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const getOrgWhatsappTemplates = async (orgId) => {
  const response = await axios.get(
    `${BACKEND_URL}/clientadmin/whatsapp/templates?orgId=${orgId}`,
    getAuthHeaders()
  );
  return response.data.data;
};

export const toggleOrgWhatsappTemplate = async (templateId, orgId, isActive) => {
  const response = await axios.put(
    `${BACKEND_URL}/clientadmin/whatsapp/templates/${templateId}/toggle`,
    { orgId, isActive },
    getAuthHeaders()
  );
  return response.data.data;
};

export const getOrgWhatsappLogs = async (orgId, params = {}) => {
  const { status, search, page = 1, limit = 10 } = params;
  let url = `${BACKEND_URL}/clientadmin/whatsapp/logs?orgId=${orgId}&page=${page}&limit=${limit}`;
  
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await axios.get(url, getAuthHeaders());
  return response.data.data;
};
