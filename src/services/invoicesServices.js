import { message } from "antd";
import { apiGet, apiPost, apiPut } from "../utils/axiosCalls";
import { useNotification } from "../utils/messageWrapper.js";
const orgId = localStorage.getItem("selectedOrgId");
const token = localStorage.getItem("token");
const basic_config = {
  headers: { Authorization: `Bearer ${token}` },
};

export const fetchBills = async (searchTerm = "", page = 1, limit = 10) => {
  if (!orgId || !token) return;

  const selectedOrgId = localStorage.getItem("selectedOrgId");
  const orgData = JSON.parse(localStorage.getItem("organizations") || "[]");
  const selectedOrg = orgData.find(
    (org) => org.organizationId === selectedOrgId
  );

  try {
    const response = await apiGet(
      `/clientadmin/invoices/getBills?organization_id=${selectedOrg.organizationId}&search=${searchTerm}&page=1&limit=10&orgId=${orgId}`,
      basic_config
    );
    const billsdata = response.data || [];

    console.log("Sidd", billsdata);
    return billsdata;
  } catch (err) {
    console.error("Error fetching clients:", err);
    message.error("Failed to fetch clients");
  } finally {
  }
};

export const saveAsInvoice = async (record) => {
  console.log("record ", record);
  var recordId = record.id;
  try {
    const response = await apiPost(
      `/clientadmin/invoices/saveAsInvoices?orgId=${orgId}&id=${recordId}`,
      {},
      basic_config
    );
    console.log(response);
  } catch (err) {
    console.log(err);
  }
};
