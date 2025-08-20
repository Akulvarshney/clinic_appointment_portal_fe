import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Stack,
  Grid,
  Alert,
  Paper,
  Divider,
  Fade,
  Container,
  Card,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GroupIcon from "@mui/icons-material/Group";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SecurityIcon from "@mui/icons-material/Security";
import BoltIcon from "@mui/icons-material/Bolt";
import { BACKEND_URL } from "../assets/constants";
import { notification } from "antd";

const HomePage = () => {
  const [openNewForm, setOpenNewForm] = useState(false);
  const [openTrackForm, setOpenTrackForm] = useState(false);

  const [OrgName, setOrgName] = useState("");
  const [yourFullName, setyourFullName] = useState("");
  const [OrgShortName, setOrgShortName] = useState("");
  const [OrgPhone, setOrgPhone] = useState("");
  const [orgEmail, setorgEmail] = useState("");
  const [orgAddress, setorgAddress] = useState("");
  const [errorMsgNewApplication, seterrorMsgNewApplication] = useState("");
  const [successMsgNewApplication, setSuccessMsgNewApplication] = useState("");

  const [trackingMobile, setTrackingMobile] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [errorTrackApplication, seterrorTrackApplication] = useState("");
  const [successTrackApplication, setsuccessTrackApplication] = useState("");

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 480,
    borderRadius: 8,
    p: 5,
    background: "#fff",
    boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
  };

  const submitNewApplicationRequest = async () => {
    seterrorMsgNewApplication("");
    setSuccessMsgNewApplication("");
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

      if (!response.data.success) {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to submit application.",
        });
        seterrorMsgNewApplication(response.data.message || "Failed.");
        return;
      }

      const trackingId = response.data.trackingId;
      setSuccessMsgNewApplication(
        `Application Submitted ✔ Tracking ID: ${trackingId}`
      );

      setTimeout(() => {
        setOpenNewForm(false);
        setOrgName("");
        setOrgShortName("");
        setOrgPhone("");
        setyourFullName("");
        setorgEmail("");
        setorgAddress("");
        seterrorMsgNewApplication("")
        seterrorMsgNewApplication("");
        setSuccessMsgNewApplication("");
      }, 6000);
    } catch (error) {
      const msg = error.response?.data?.message || "Unexpected error";
      notification.error({ message: "Error", description: msg });
      seterrorMsgNewApplication("Unexpected Error Occurred");
    }
  };

  const trackApplicationStatus = async () => {
    seterrorTrackApplication("");
    setsuccessTrackApplication("");
    if (!trackingId || !trackingMobile) {
      seterrorTrackApplication("Enter Mobile Number & Tracking ID");
      return;
    }
    try {
      const response = await axios.get(
        `${BACKEND_URL}/noAuth/newApplication/trackApplication?mobileNumber=${trackingMobile}&trackingId=${trackingId}`
      );
      setsuccessTrackApplication(`${response.data.message}`);
    } catch (error) {
      if (error.response?.status === 401) {
        seterrorTrackApplication(error.response.data.message);
      } else {
        seterrorTrackApplication("Something went wrong. Try again.");
      }
    }
  };

  return (
    <Box sx={{ background: "#f9fbff", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 14,
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={900}>
            <Box>
              <Typography
                variant="h2"
                fontWeight="900"
                gutterBottom
                sx={{ textShadow: "0 4px 15px rgba(0,0,0,0.3)", letterSpacing: 2 }}
              >
                GloryWellnic
              </Typography>
              <Typography
                variant="h5"
                sx={{ opacity: 0.9, mb: 7, fontWeight: 500, lineHeight: 1.4 }}
              >
                Simplifying Management, Amplifying Care
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={4}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{
                    px: 6,
                    py: 1.8,
                    borderRadius: "50px",
                    fontWeight: "700",
                    backgroundColor: "white",
                    color: "#1976d2",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
                    transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: "#f0f0f0", transform: "scale(1.05)" },
                  }}
                  onClick={() => {setOpenNewForm(true); seterrorMsgNewApplication(""); setSuccessMsgNewApplication("") }}
                >
                  Become our Partner
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SearchIcon />}
                  sx={{
                    px: 6,
                    py: 1.8,
                    borderRadius: "50px",
                    fontWeight: "700",
                    color: "white",
                    borderColor: "white",
                    boxShadow: "0 4px 15px rgba(255,255,255,0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.15)",
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={() => {setOpenTrackForm(true); seterrorTrackApplication(""); setsuccessTrackApplication("");}}
                >
                  Check Status
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Partner Steps */}
      <Box sx={{ py: 12, backgroundColor: "#fff" }}>
        <Container>
          <Typography
            variant="h4"
            align="center"
            fontWeight="900"
            gutterBottom
            sx={{ letterSpacing: 1 }}
          >
            Steps to Become Our Partner
          </Typography>
          <Grid container spacing={6} justifyContent="center" sx={{ mt: 6 }}>
            {[
              {
                icon: <AssignmentTurnedInIcon color="primary" fontSize="large" />,
                title: "Submit Application",
                desc: "Provide your clinic or organization details to get started.",
                bgColor: "rgba(25, 118, 210, 0.1)",
              },
              {
                icon: <VerifiedUserIcon color="primary" fontSize="large" />,
                title: "Super Admin Approval",
                desc: "We will verify the details and approve the Organization Request",
                bgColor: "rgba(63, 81, 181, 0.1)",
              },
              {
                icon: <MailOutlineIcon color="primary" fontSize="large" />,
                title: "Receive Credentials",
                desc: "You’ll get admin credentials via email and can login instantly.",
                bgColor: "rgba(66, 165, 245, 0.1)",
              },
            ].map((step, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  elevation={6}
                  sx={{
                    p: 5,
                    borderRadius: 6,
                    backgroundColor: step.bgColor,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "default",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.16)",
                    },
                  }}
                >
                  {step.icon}
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ mt: 1 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ px: 1, maxWidth: 320 }}
                  >
                    {step.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 14, backgroundColor: "#f4f8ff" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            fontWeight="900"
            gutterBottom
            sx={{ letterSpacing: 1, mb: 6 }}
          >
            Why Choose GloryWellnic?
          </Typography>
          <Grid container spacing={5} justifyContent="center">
            {[
              {
                icon: <GroupIcon fontSize="large" sx={{ color: "#1976d2" }} />,
                title: "User & Role Management",
                desc:
                  "Create multiple users, assign roles, and set custom permissions with precision and ease.",
                bgColor: "rgba(25, 118, 210, 0.15)",
              },
              {
                icon: <EventAvailableIcon fontSize="large" sx={{ color: "#1e88e5" }} />,
                title: "Smart Appointment Scheduling",
                desc:
                  "Effortlessly book and manage appointments with a sleek, integrated calendar.",
                bgColor: "rgba(30, 136, 229, 0.15)",
              },
              {
                icon: <SecurityIcon fontSize="large" sx={{ color: "#43a047" }} />,
                title: "Secure & Reliable",
                desc:
                  "Enterprise-grade authentication and tracking to safeguard clinic data.",
                bgColor: "rgba(67, 160, 71, 0.15)",
              },
              {
                icon: <BoltIcon fontSize="large" sx={{ color: "#fdd835" }} />,
                title: "Simple & Fast",
                desc:
                  "Designed with busy professionals in mind, for effortless, speedy operations.",
                bgColor: "rgba(253, 216, 53, 0.15)",
              },
            ].map((feature, i) => (
              <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: "flex" }}>
                <Paper
                  elevation={5}
                  sx={{
                    p: 5,
                    borderRadius: 6,
                    backgroundColor: feature.bgColor,
                    textAlign: "center",
                    height: "100%",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "default",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {feature.icon}
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ flexGrow: 1, px: 1 }}>
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 5,
          textAlign: "center",
          bgcolor: "#1976d2",
          color: "white",
          borderTop: "5px solid #42a5f5",
          letterSpacing: 1,
          fontWeight: 500,
        }}
      >
        © 2025 GloryWellnic. All rights reserved.
      </Box>

      {/* New Application Modal */}
      <Modal open={openNewForm} onClose={() => setOpenNewForm(false)}>
        <Paper sx={modalStyle}>
          <Typography
            variant="h6"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Become our Client
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <TextField
              label="Organization Name"
              fullWidth
              onChange={(e) => setOrgName(e.target.value)}
            />
            <TextField
              label="Your Full Name"
              fullWidth
              onChange={(e) => setyourFullName(e.target.value)}
            />
            <TextField
              label="Organization Short Name"
              fullWidth
              onChange={(e) => setOrgShortName(e.target.value)}
            />
            <TextField
              label="Mobile"
              fullWidth
              onChange={(e) => setOrgPhone(e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              onChange={(e) => setorgEmail(e.target.value)}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={3}
              onChange={(e) => setorgAddress(e.target.value)}
            />

            {errorMsgNewApplication && (
              <Alert severity="error">{errorMsgNewApplication}</Alert>
            )}
            {successMsgNewApplication && (
              <Alert severity="success">{successMsgNewApplication}</Alert>
            )}

            <Button
              variant="contained"
              onClick={submitNewApplicationRequest}
              fullWidth
              sx={{ py: 1.6, fontWeight: "bold", fontSize: "1rem" }}
            >
              Submit
            </Button>
          </Stack>
        </Paper>
      </Modal>

      {/* Track Application Modal */}
      <Modal open={openTrackForm} onClose={() => setOpenTrackForm(false)}>
        <Paper sx={modalStyle}>
          <Typography
            variant="h6"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Track Application
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <TextField
              label="Mobile Number"
              fullWidth
              onChange={(e) => setTrackingMobile(e.target.value)}
            />
            <TextField
              label="Tracking ID"
              fullWidth
              onChange={(e) => setTrackingId(e.target.value)}
            />
            {errorTrackApplication && (
              <Alert severity="error">{errorTrackApplication}</Alert>
            )}
            {successTrackApplication && (
              <Alert severity="success">{successTrackApplication}</Alert>
            )}

            <Button
              variant="contained"
              color="success"
              onClick={trackApplicationStatus}
              fullWidth
              sx={{ py: 1.6, fontWeight: "bold", fontSize: "1rem" }}
            >
              Track Now
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
};

export default HomePage;
