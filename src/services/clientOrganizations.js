import { apiGet, apiPost, apiPut } from "../utils/axiosCalls";

const orgId = localStorage.getItem("selectedOrgId");
const token = localStorage.getItem("token");
const basic_config = {
  headers: { Authorization: `Bearer ${token}` },
};
export const getOrgInfo = async () => {
  try {
    const response = await apiGet(
      `/clientadmin/userMgmt/getOrgBillingDetails?orgId=${orgId}`,
      basic_config
    );

    return response;
  } catch (error) {
    console.error("Error fetching organization Info:", error);
    throw error;
  }
};

export const saveOrgInfo = async (data) => {
  try {
    const response = await apiPut(
      `/clientadmin/userMgmt/saveOrgDetails?orgId=${orgId}`,
      data,
      basic_config
    );
    return response.data;
  } catch (error) {
    console.error("Error saving organization Info:", error);
    throw error;
  }
};
