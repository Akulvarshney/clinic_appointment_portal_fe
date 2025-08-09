import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
} from "@mui/material";
import { BACKEND_URL } from "../assets/constants";

import Sidebar from "../components/SideBar.js";

const ClientRegistration = () => {
  const [formData, setFormData] = React.useState({
    Firstname: "",
    Secondname: "",
    address: "",
    mobile: "",
    dob: "",
    gender: "",
    occupation: "",
    email: "",
    emergencyContact: "",
  });

  const [errorMsg, seterrorMsg] = React.useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [roleId, setRoleId] = React.useState(null);
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const orgId = localStorage.getItem("selectedOrgId");
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${BACKEND_URL}/clientAdmin/userMgmt/getRoles?orgId=${orgId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const roles = res.data.response || [];
        const clientRole = roles.find(
          (role) =>
            role.name === "CLIENT" && role.description === "DEFAULT CLIENT"
        );
        if (clientRole) {
          setRoleId(clientRole.id);
        } else {
          console.warn("CLIENT / DEFAULT CLIENT role not found");
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    seterrorMsg("");
    try {
      if (
        !formData.Firstname ||
        !formData.address ||
        !formData.mobile ||
        !formData.gender ||
        !formData.dob
      ) {
        seterrorMsg("Please Enter all the Mandatory fields");
        return;
      }
      if (!roleId) {
        seterrorMsg("Role not loaded yet. Please try again shortly.");
        return;
      }

      const orgId = localStorage.getItem("selectedOrgId");
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/patient/clients/registerClient`,
        {
          Firstname: formData.Firstname,
          Secondname: formData.Secondname,
          address: formData.address,
          mobile: formData.mobile,
          dob: formData.dob,
          gender: formData.gender,
          occupation: formData.occupation,
          email: formData.email,
          emergencyContact: formData.emergencyContact,
          organization_id: orgId,
          roleId: roleId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setFormData({ roleName: "", roleDescription: "" });
        //setErrors({});
        seterrorMsg("");
        setSuccessMsg("Role created successfully.");
        // message.success("Role added successfully.");
      } else {
        seterrorMsg("Failed to Register Client");
      }
    } catch (error) {
      console.error("API Error:", error);
      setSuccessMsg("");
      seterrorMsg("Registration:failed. Please try again later");
      // message.error(
      //   error.response?.data?.message ||
      //     "Something went wrong. Please try again."
      // );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(to right, #e6f0ff, #f8fbff)",
      }}
    >
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: "#0047ab", fontWeight: "bold", mb: 4 }}
        >
          Client Registration
        </Typography>

        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 3, background: "#ffffffcc" }}
        >
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="Firstname"
                label="First Name"
                value={formData.Firstname}
                onChange={handleChange}
                fullWidth
                required
                sx={{ minWidth: 300 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="Secondname"
                label="Last Name"
                value={formData.Secondname}
                onChange={handleChange}
                fullWidth
                sx={{ minWidth: 300 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mobile"
                label="Mobile Number"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                fullWidth
                required
                sx={{ minWidth: 300 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
                sx={{ minWidth: 600 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ minWidth: 380 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dob"
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                fullWidth
                select
                required
                sx={{ minWidth: 210 }}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="occupation"
                label="Occupation"
                value={formData.occupation}
                onChange={handleChange}
                fullWidth
                sx={{ minWidth: 300 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="emergencyContact"
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={handleChange}
                fullWidth
                sx={{ minWidth: 300 }}
              />
            </Grid>

            <Divider sx={{ my: 3, width: "100%" }} />

            {/* Medical & Emergency Info */}
          </Grid>
          {errorMsg && (
            <Alert sx={{ mb: 2, mt: 2 }} severity="error">
              {errorMsg}
            </Alert>
          )}
          {successMsg && (
            <Alert sx={{ mb: 2, mt: 2 }} severity="success">
              {successMsg}
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              mt: 4,
              background: "#007bff",
              ":hover": { background: "#0056b3" },
              px: 4,
              py: 1,
              fontWeight: "bold",
            }}
          >
            Submit
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default ClientRegistration;
