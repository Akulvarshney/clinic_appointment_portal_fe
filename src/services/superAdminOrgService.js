import axios from "axios";
import { BACKEND_URL } from "../assets/constants";
import { message } from "antd";

export const getOrganizationDetailsForSA = async (shortName) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${BACKEND_URL}/admin/newApplication/organizationDetails/${shortName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching organization details:", err);
    message.error(err.response?.data?.message || "Failed to fetch organization details.");
    throw err;
  }
};

export const getOrganizationAdminTabs = async (shortName) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${BACKEND_URL}/admin/newApplication/organizationAdminTabs/${shortName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching organization admin tabs:", err);
    message.error(err.response?.data?.message || "Failed to fetch tabs.");
    throw err;
  }
};

export const updateOrganizationAdminTabs = async (shortName, tabFeatureMapping) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${BACKEND_URL}/admin/newApplication/organizationAdminTabs/${shortName}`,
      { tabFeatureMapping },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    message.success(response.data?.message || "Permissions updated successfully");
    return response.data;
  } catch (err) {
    console.error("Error updating organization admin tabs:", err);
    message.error(err.response?.data?.message || "Failed to update permissions.");
    throw err;
  }
};
