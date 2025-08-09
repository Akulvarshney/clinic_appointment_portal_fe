// api/organization.js
import axios from "axios";
import { BACKEND_URL } from "../assets/constants";
import { message } from "antd";

const token = localStorage.getItem("token");

export const organizationlisting = async (status) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/admin/newApplication/getApplications/${status}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error fetching organization listing:", error);
    throw error;
  }
};

export async function handleActionOnApplication(id, action, remark) {
  try {
    const bodyData = {
      id: id,
      Action: action,
      Remarks: remark,
    };
    const response = await axios.post(
      `${BACKEND_URL}/admin/newApplication/applicationAction`,
      bodyData
    );
    return response.data;
  } catch (err) {
    console.log("Error updating application status:", err);
    const msg = err.response?.data?.message || "Failed to fetch users";
    message.error(msg);
    throw err;
  }
}
