import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Checkbox, List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress, Paper } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../../assets/constants";

const FacebookConnect = () => {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    checkStatus();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleCallback(code);
    }
  }, []);

  const checkStatus = async () => {
    try {
      const orgId = localStorage.getItem("selectedOrgId");
      const res = await axios.get(`${BACKEND_URL}/facebook-auth/status`, {
        params: { organizationId: orgId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.connected) {
        setStatus("connected");
        fetchPages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("selectedOrgId");
      const res = await axios.get(`${BACKEND_URL}/facebook-auth/pages`, {
        params: { organizationId: orgId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setPages(res.data);
      setSelectedPages(res.data.filter(p => p.isSubscribed).map(p => p.id));
    } catch (err) {
      toast.error("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const orgId = localStorage.getItem("selectedOrgId");
      const res = await axios.get(`${BACKEND_URL}/facebook-auth/connect`, {
        params: { organizationId: orgId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error("Failed to initiate connection");
    }
  };

  const handleCallback = async (code) => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("selectedOrgId");
      await axios.post(`${BACKEND_URL}/facebook-auth/callback`, {
        code,
        redirectUri: `${window.location.origin}/facebook-callback`,
        organizationId: orgId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Facebook Connected!");
      setStatus("connected");
      fetchPages();

      // Clean up URL
      window.history.replaceState({}, document.title, "/facebook-connect");
    } catch (err) {
      toast.error("Failed to connect Facebook");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (pageId) => {
    const currentIndex = selectedPages.indexOf(pageId);
    const newSelected = [...selectedPages];

    if (currentIndex === -1) {
      newSelected.push(pageId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedPages(newSelected);
  };

  const handleSavePages = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("selectedOrgId");
      const pagesToSave = pages.filter(p => selectedPages.includes(p.id));
      await axios.post(`${BACKEND_URL}/facebook-auth/save-pages`, { pages: pagesToSave, organizationId: orgId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Pages tracked successfully!");
    } catch (err) {
      toast.error("Failed to save pages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>Facebook Integration</Typography>

      {status === "disconnected" ? (
        <Paper sx={{ p: 4, textAlign: "center", mt: 4 }}>
          <FacebookIcon sx={{ fontSize: 60, color: "#1877F2", mb: 2 }} />
          <Typography variant="h6" gutterBottom>Connect your Facebook Account</Typography>
          <Typography color="textSecondary" mb={3}>
            Connect to sync your Facebook Lead Ads automatically.
          </Typography>
          <Button variant="contained" size="large" onClick={handleConnect} sx={{ bgcolor: "#1877F2" }}>
            Connect Facebook
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>Select Pages to Track</Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <List>
                {pages.map((page) => (
                  <ListItem key={page.id} button onClick={() => handleToggle(page.id)}>
                    <ListItemAvatar>
                      <Avatar src={page.profileImage} />
                    </ListItemAvatar>
                    <ListItemText primary={page.name} secondary={page.category} />
                    <Checkbox
                      edge="end"
                      checked={selectedPages.indexOf(page.id) !== -1}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSavePages}
                disabled={selectedPages.length === 0}
                sx={{ mt: 2 }}
              >
                Save Tracking
              </Button>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default FacebookConnect;
