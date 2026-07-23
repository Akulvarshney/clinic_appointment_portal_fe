import axios from "axios";
import { BACKEND_URL } from "../assets/constants";

export const requestCustomTemplate = async (orgId, payload) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${BACKEND_URL}/clientadmin/whatsapp/${orgId}/templates`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getCustomTemplates = async (orgId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${BACKEND_URL}/clientadmin/whatsapp/${orgId}/templates`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const scheduleCampaign = async (orgId, payload) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${BACKEND_URL}/clientadmin/whatsapp/${orgId}/campaigns`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getCampaigns = async (orgId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${BACKEND_URL}/clientadmin/whatsapp/${orgId}/campaigns`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
