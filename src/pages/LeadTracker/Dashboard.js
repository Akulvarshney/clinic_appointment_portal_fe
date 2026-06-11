import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import LeadTable from "../../components/LeadTracker/LeadTable";
import { useSocket } from "../../hooks/useSocket";
import { BACKEND_URL } from "../../assets/constants";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    todayLeads: 0,
    weeklyLeads: 0,
    monthlyLeads: 0,
    activePages: 0,
  });
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  
  const navigate = useNavigate();
  // Using backend URL from env, or default to current host:8080
  const socketUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
  const socket = useSocket(socketUrl);

  useEffect(() => {
    fetchStats();
    fetchLeads();
  }, [page, limit, search]);

  useEffect(() => {
    if (socket) {
      socket.on("new_lead", (newLead) => {
        toast.success(`New lead received: ${newLead.full_name || 'Someone'} from ${newLead.page_name}`);
        setLeads((prev) => [newLead, ...prev].slice(0, limit));
        setTotal((prev) => prev + 1);
        fetchStats(); // Update stats cards silently
      });
    }

    return () => {
      if (socket) socket.off("new_lead");
    };
  }, [socket, limit]);

  const fetchStats = async () => {
    try {
      const orgId = localStorage.getItem("selectedOrgId");
      const res = await axios.get(`${BACKEND_URL}/leads/dashboard-stats`, {
        params: { organizationId: orgId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeads = async () => {
    try {
      const orgId = localStorage.getItem("selectedOrgId");
      const res = await axios.get(`${BACKEND_URL}/leads`, {
        params: { page, limit, search, organizationId: orgId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setLeads(res.data.leads);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    // Basic CSV export logic
    const headers = ["Name", "Email", "Phone", "Page", "Campaign", "Date"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => [
        `"${l.full_name || ''}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        `"${l.page_name || ''}"`,
        `"${l.campaign_name || ''}"`,
        `"${new Date(l.created_time).toLocaleString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "leads_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Lead Tracker</Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate("/facebook-connect")}>
          Manage Facebook Connection
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Leads</Typography>
              <Typography variant="h4">{stats.totalLeads}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Today</Typography>
              <Typography variant="h4">{stats.todayLeads}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>This Week</Typography>
              <Typography variant="h4">{stats.weeklyLeads}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>This Month</Typography>
              <Typography variant="h4">{stats.monthlyLeads}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#e0f7fa' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Pages</Typography>
              <Typography variant="h4">{stats.activePages}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <LeadTable
        leads={leads}
        total={total}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        onExport={handleExport}
      />
    </Box>
  );
};

export default Dashboard;
