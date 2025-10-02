import axios from "axios";
import { BACKEND_URL } from "../assets/constants";

import toast from "react-hot-toast";

function handleError(error) {
  if (error.response) {
    if (error.response.status === 401) {
      toast.error("Unauthorized or Session Expired, please Sign In again");
      console.log("Unauthorized or Session Expired, please Sign In again");
    } else if (error.response.status === 500) {
      toast.error("Internal Server Error Occurred");
      console.log("Internal Server Error Occurred");
    } else if (error.response.status === 404) {
      toast.error("Internal Server Error Occurred : Not Found");
      console.log("Internal Server Error Occurred : Not Found");
    } else {
      toast.error(error.response.data?.message || "Something went wrong");
      console.log(error.response.data?.message || "Something went wrong");
    }
  } else if (error.request) {
    toast.error("No response received from server");
  } else {
    toast.error("Request setup error: " + error.message);
  }
  return null;
}

// GET request
export async function apiGet(url, config = {}) {
  try {
    const res = await axios.get(BACKEND_URL + url, config);
    return res.data;
  } catch (error) {
    console.error(error);
    handleError(error);
  }
}

// POST request
export async function apiPost(url, body = {}, config = {}) {
  try {
    //console.log("siddddddddddddddddd");
    const res = await axios.post(BACKEND_URL + url, body, config);
    //console.log("ghgghghghgghhghghgh");
    return res.data;
  } catch (error) {
    //alert("alert here");
    console.error(error);
    handleError(error);
  }
}

// PUT request
export async function apiPut(url, body = {}, config = {}) {
  try {
    const res = await axios.put(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    console.error(error);
    handleError(error);
  }
}

// PATCH request
export async function apiPatch(url, body = {}, config = {}) {
  try {
    const res = await axios.patch(BACKEND_URL + url, body, config);
    return res.data;
  } catch (error) {
    console.error(error);
    handleError(error);
  }
}

// DELETE request
export async function apiDelete(url, config = {}) {
  try {
    const res = await axios.delete(BACKEND_URL + url, config);
    return res.data;
  } catch (error) {
    console.error(error);
    handleError(error);
  }
}
