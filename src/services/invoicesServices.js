import { message } from "antd";
import { apiGet, apiPost, apiPut } from "../utils/axiosCalls";

const orgId = localStorage.getItem("selectedOrgId");
const token = localStorage.getItem("token");
const basic_config = {
  headers: { Authorization: `Bearer ${token}` },
};

export const fetchInvoices = async (searchTerm = "", page = 1, limit = 10) => {
  if (!orgId || !token) return;

  const selectedOrgId = localStorage.getItem("selectedOrgId");
  const orgData = JSON.parse(localStorage.getItem("organizations") || "[]");
  const selectedOrg = orgData.find(
    (org) => org.organizationId === selectedOrgId
  );

  try {
    const response = await apiGet(
      `/clientadmin/invoices/getInvoice?organization_id=${selectedOrg.organizationId}&search=${searchTerm}&page=1&limit=10&orgId=${orgId}`,
      basic_config
    );
    const clients = response.data || [];

    console.log(clients);
    return clients;
  } catch (err) {
    console.error("Error fetching clients:", err);
    message.error("Failed to fetch clients");
  } finally {
  }
};
