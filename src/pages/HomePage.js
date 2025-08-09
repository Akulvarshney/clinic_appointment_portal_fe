import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Stack,
  Container,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Fade,
  Alert,
} from "@mui/material";

import LoginIcon from "@mui/icons-material/Login";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { BACKEND_URL } from "../assets/constants";
import { message, notification } from "antd";

const HomePage = () => {
  const [openNewForm, setOpenNewForm] = useState(false);
  const [openTrackForm, setOpenTrackForm] = useState(false);

  const [OrgName, setOrgName] = useState(false);
  const [yourFullName, setyourFullName] = useState(false);
  const [OrgShortName, setOrgShortName] = useState(false);
  const [OrgPhone, setOrgPhone] = useState(false);
  const [orgEmail, setorgEmail] = useState(false);
  const [orgAddress, setorgAddress] = useState(false);
  const [errorMsgNewApplication, seterrorMsgNewApplication] = useState(false);

  const [trackingMobile, setTrackingMobile] = useState(false);
  const [trackingId, setTrackingId] = useState(false);
  const [errorTrackApplication, seterrorTrackApplication] = useState("");

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 440,
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
  };

  const submitNewApplicationRequest = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/noAuth/newApplication/submitApplication`,
        {
          org_name: OrgName,
          phone: OrgPhone,
          org_short_name: OrgShortName,
          client_name: yourFullName,
          email: orgEmail,
          address: orgAddress,
        }
      );

      console.log("response ", response.data);

      if (!response.data.success) {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to submit application.",
        });
        seterrorMsgNewApplication(
          response.data.message || "Failed to submit application."
        );
        return;
      }

      // ✅ Show success notification
      notification.success({
        message: "Success",
        description: response.data.message || "Application submitted.",
      });

      // ✅ Reset form
      setOrgName("");
      setOrgShortName("");
      setOrgPhone("");
      setyourFullName("");
      setorgEmail("");
      setorgAddress("");
      seterrorMsgNewApplication("");

      // ✅ Close modal
      setOpenNewForm(false);
    } catch (error) {
      const msg =
        error.response?.data?.message || "An unexpected error occurred.";
      const status = error.response?.status;

      notification.error({
        message: `Error${status ? ` (${status})` : ""}`,
        description: msg,
      });

      seterrorMsgNewApplication(msg);
    }
  };

  const trackApplicationStatus = async () => {
    seterrorTrackApplication("");
    if (!trackingId || !trackingMobile) {
      seterrorTrackApplication("Enter Mobile Number and TrackingId");
    }
    try {
      const response = await axios.get(
        `${BACKEND_URL}/noAuth/newApplication/trackApplication?mobileNumber=${trackingMobile}&trackingId=${trackingId}`
      );
      console.log("response ", response.data); // "1" if the organization name is also corrrect
    } catch (error) {
      if (error.response?.status === 401) {
        seterrorTrackApplication(error.response.data.message);
        // seterrorMsgNewApplication("Invalid LoginId or password.");
      } else {
        seterrorTrackApplication("An error occurred. Please try again.");
      }
    }
  };

  const openNotification = () => {
    console.log("asdads");
    notification.success({
      message: "Test Success",
      description: "This is a test notification",
    });
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to right top, #c6f1ff, #d3d2ff)",
        overflow: "hidden",
      }}
    >
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ height: "calc(100vh - 64px)" }}
      >
        <Fade in={true} timeout={1000}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              fontWeight="bold"
              color="primary.dark"
              gutterBottom
            >
              Welcome to ClinicEase
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={5}>
              Your gateway to simplified healthcare form submissions.
            </Typography>

            <Stack spacing={3} direction="row" justifyContent="center">
              <Button
                variant="contained"
                size="large"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 10,
                  fontWeight: "bold",
                  backgroundColor: "#1976d2",
                  boxShadow: 3,
                  "&:hover": { backgroundColor: "#1565c0" },
                }}
                onClick={() => setOpenNewForm(true)}
              >
                Become our Client
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<SearchIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 10,
                  fontWeight: "bold",
                  color: "#388e3c",
                  borderColor: "#388e3c",
                  boxShadow: 3,
                  "&:hover": {
                    backgroundColor: "#e8f5e9",
                  },
                }}
                onClick={() => setOpenTrackForm(true)}
              >
                Check Status
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Grid>
      {/* Modal for New Form */}
      <Modal open={openNewForm} onClose={() => setOpenNewForm(false)}>
        <Box
          sx={{
            ...modalStyle,
            width: 500, // increased modal width
            borderRadius: 4, // rounded corners
            boxShadow: 24,
            p: 4,
            backgroundColor: "#fff",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            align="center"
            sx={{ color: "#333" }}
          >
            Submit New Application
          </Typography>

          <Stack spacing={2} mt={2}>
            <TextField
              label="Organization Name"
              fullWidth
              size="medium"
              variant="outlined"
              sx={{ borderRadius: 2 }}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <TextField
              label="Your Full Name"
              fullWidth
              size="medium"
              variant="outlined"
              sx={{ borderRadius: 2 }}
              onChange={(e) => setyourFullName(e.target.value)}
            />
            <TextField
              label="Organization Short Name"
              fullWidth
              size="medium"
              variant="outlined"
              sx={{ borderRadius: 2 }}
              onChange={(e) => setOrgShortName(e.target.value)}
            />
            <TextField
              label="Mobile"
              fullWidth
              size="medium"
              variant="outlined"
              sx={{ borderRadius: 2 }}
              onChange={(e) => setOrgPhone(e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              size="medium"
              variant="outlined"
              sx={{ borderRadius: 2 }}
              onChange={(e) => setorgEmail(e.target.value)}
            />
            <TextField
              label="Address"
              fullWidth
              size="medium"
              multiline
              rows={2}
              variant="outlined"
              onChange={(e) => setorgAddress(e.target.value)}
              sx={{ borderRadius: 2 }}
            />
            {errorMsgNewApplication && (
              <Alert severity="error" sx={{ fontSize: "0.85rem" }}>
                {errorMsgNewApplication}
              </Alert>
            )}
            <Button
              variant="contained"
              fullWidth
              onClick={submitNewApplicationRequest}
              sx={{
                borderRadius: 3,
                py: 1.2,
                backgroundColor: "#1976d2",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#115293",
                },
              }}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* Modal for Track Application */}
      <Modal open={openTrackForm} onClose={() => setOpenTrackForm(false)}>
        <Box
          sx={{
            ...modalStyle,
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            background: "linear-gradient(to right, #e0f7fa, #ffffff)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            align="center"
          >
            🚀 Track Application
          </Typography>
          <Stack spacing={2} mt={2}>
            <TextField
              label="Mobile Number"
              fullWidth
              size="small"
              variant="outlined"
              onChange={(e) => setTrackingMobile(e.target.value)}
              InputProps={{
                startAdornment: (
                  <span style={{ paddingRight: 8, color: "#888" }}>📱</span>
                ),
              }}
            />
            <TextField
              label="Tracking ID"
              fullWidth
              size="small"
              variant="outlined"
              onChange={(e) => setTrackingId(e.target.value)}
              InputProps={{
                startAdornment: (
                  <span style={{ paddingRight: 8, color: "#888" }}>🔍</span>
                ),
              }}
            />

            {errorTrackApplication && (
              <Alert severity="error" sx={{ fontSize: "0.85rem" }}>
                {errorTrackApplication}
              </Alert>
            )}
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ borderRadius: 3, py: 1 }}
              onClick={trackApplicationStatus}
            >
              Track Now
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
