import axios from "axios";

//const baseUrl = "https://api.example.com"; // Or import from your config
import { BACKEND_URL } from "../assets/constants";
import { message } from "antd";
export async function apiGet(url, config = {}) {
  try {
    //console.log("Backend_url ", BACKEND_URL);
    const res = await axios.get(BACKEND_URL + url, config);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("Unauthorized or  Session Expired please Sign In again");
    }
    if (error.response && error.response.status === 500) {
      throw new Error("Internal Server Error Occured");
    }
    throw error;
  }
}

export async function apiPost(url, body = {}, config = {}) {
  try {
    const res = await axios.post(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("Unauthorized or Session Expired please Sign In again");
    }
    if (error.response && error.response.status === 500) {
      throw new Error("Internal Server Error Occured");
    }
    throw error;
  }
}

export async function apiPut(url, body = {}, config = {}) {
  try {
    const res = await axios.put(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("Unauthorized or Session Expired please Sign In again");
    }
    if (error.response && error.response.status === 500) {
      throw new Error("Internal Server Error Occured");
    } else {
      throw new Error("Unknown Error occured");
    }
    throw error;
  }
}

export async function apiPatch(url, body = {}, config = {}) {
  try {
    const res = await axios.patch(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("Unauthorized or Session Expired please Sign In again");
    }
    if (error.response && error.response.status === 500) {
      throw new Error("Internal Server Error Occured");
    }
    throw error;
  }
}

export async function apiDelete(url, config = {}) {
  try {
    const res = await axios.delete(BACKEND_URL + url, config);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("Unauthorized or Session Expired please Sign In again");
    }
    if (error.response && error.response.status === 500) {
      throw new Error("Internal Server Error Occured");
    }

    throw error;
  }
}
