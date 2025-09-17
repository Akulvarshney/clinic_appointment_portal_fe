import axios from "axios";

import { BACKEND_URL } from "../assets/constants";
import { message } from "antd";
import { notification } from "antd";

function handleError(error) {
  if (error.response) {
    if (error.response.status === 401) {
      console.log("Unauthorized or Session Expired, please Sign In aaagain");
      message.error("Unauthorized or Session Expired, please Sign In again");
    } else if (error.response.status === 500) {
      message.error("Internal Server Error Occurred");
    } else {
      message.error(error.response.data?.message || "Something went wrong");
    }
  } else if (error.request) {
    message.error("No response received from server");
  } else {
    message.error("Request setup error: " + error.message);
  }
  return null; // or return {} if you want consistent return
}

export async function apiGet(url, config = {}) {
  try {
    //console.log("Backend_url ", BACKEND_URL);
    const res = await axios.get(BACKEND_URL + url, config);
    return res.data;
  } catch (error) {
    console.log(error);
    handleError(error);
    // if (error.response && error.response.status === 401) {
    //   throw new Error("Unauthorized or  Session Expired please Sign In again");
    // }
    // if (error.response && error.response.status === 500) {
    //   throw new Error("Internal Server Error Occured");
    // }
    // throw error;
  }
}

export async function apiPost(url, body = {}, config = {}) {
  try {
    const res = await axios.post(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    // if (error.response && error.response.status === 401) {
    //   throw new Error("Unauthorized or Session Expired please Sign In again");
    // }
    // if (error.response && error.response.status === 500) {
    //   throw new Error("Internal Server Error Occured");
    // }
    // throw error;
    handleError(error);
  }
}

export async function apiPut(url, body = {}, config = {}) {
  try {
    const res = await axios.put(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    // if (error.response && error.response.status === 401) {
    //   throw new Error("Unauthorized or Session Expired please Sign In again");
    // }
    // if (error.response && error.response.status === 500) {
    //   throw new Error("Internal Server Error Occured");
    // } else {
    //   throw new Error("Unknown Error occured");
    // }
    // throw error;
    handleError(error);
  }
}

export async function apiPatch(url, body = {}, config = {}) {
  try {
    const res = await axios.patch(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    // if (error.response && error.response.status === 401) {
    //   throw new Error("Unauthorized or Session Expired please Sign In again");
    // }
    // if (error.response && error.response.status === 500) {
    //   throw new Error("Internal Server Error Occured");
    // }
    // throw error;
    handleError(error);
  }
}

export async function apiDelete(url, config = {}) {
  try {
    const res = await axios.delete(BACKEND_URL + url, config);
    return res.data;
  } catch (error) {
    // if (error.response && error.response.status === 401) {
    //   throw new Error("Unauthorized or Session Expired please Sign In again");
    // }
    // if (error.response && error.response.status === 500) {
    //   throw new Error("Internal Server Error Occured");
    // }

    // throw error;
    handleError(error);
  }
}
