import { message } from "antd";
import { apiGet, apiPost, } from "../utils/axiosCalls";
const orgId = localStorage.getItem("selectedOrgId");
const token = localStorage.getItem("token");
const basic_config = {
  headers: { Authorization: `Bearer ${token}` },
};

export const saveReceipt = async ({ clientId, total, services }) => {
  try {
    // Transform services to match backend line_items structure
    const line_items = services.map((s) => {
      return {
        service_id: s.id,
        service_name: s.name, // make sure `name` is available in your selected service
        quantity: s.qty || 1,
      };
    });
    console.log("line_items__ ", clientId, total, line_items);
    const response = await apiPost(
      `/clientadmin/receipts/createReceipt`,
      {
        organization_id: orgId,
        client_id: clientId,
        amount: total,
        line_items,
      },
      basic_config
    );
    // const response = await axios.post(`${API_BASE_URL}/receipts/save`, {
    //   organization_id: organizationId,
    //   client_id: clientId,
    //   amount: total,
    //   line_items,
    // });

    return response.data;
  } catch (error) {
    console.error("Error saving receipt:", error);
    throw error;
  }
};

export const fetchBills = async (
  searchTerm = "",
  bill_type,
  page = 1,
  limit = 10
) => {
  if (!orgId || !token) return;
  //console.log("fetch bills bill_type ", bill_type);
  const selectedOrgId = localStorage.getItem("selectedOrgId");
  const orgData = JSON.parse(localStorage.getItem("organizations") || "[]");
  const selectedOrg = orgData.find(
    (org) => org.organizationId === selectedOrgId
  );

  try {
    const response = await apiGet(
      `/clientadmin/invoices/getBills?organization_id=${selectedOrg.organizationId}&search=${searchTerm}&page=${page}&limit=${limit}&bill_type=${bill_type}`,
      basic_config
    );
    //console.log("response .data here ", response);
    const billsdata = response || [];

    //console.log("Sidd", billsdata);
    return billsdata;
  } catch (err) {
    console.error("Error fetching clients:", err);
    message.error("Failed to fetch clients");
  } finally {
  }
};

export const saveAsInvoice = async (record, setRefresh) => {
  console.log("record ", record);
  var recordId = record.id;
  try {
    const response = await apiPost(
      `/clientadmin/invoices/saveAsInvoices?orgId=${orgId}&id=${recordId}`,
      {},
      basic_config
    );
    setRefresh(Math.random());
    console.log(response);
  } catch (err) {
    console.log(err);
  }
};

//save Receipt

export const fetchReceipts = async (
  searchTerm = "",
  page = 1,
  limit = 10,
  id
) => {
  if (!orgId || !token) return;

  try {
    let url = `/clientadmin/receipts/getReceiptDetails?search=${searchTerm}&page=${page}&limit=${limit}&orgId=${orgId}`;
    if (id) {
      url += `&receiptId=${id}`;
    }
    const response = await apiGet(url, basic_config);
    console.log("response receipts.data here ", response);
    const receiptsData = response || [];

    //console.log("Sidd", receiptsData);
    return receiptsData;
  } catch (err) {
    console.error("Error fetching clients:", err);
    message.error("Failed to fetch clients");
  } finally {
  }
};
