import React, { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Typography,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import VoiceFieldLabel from "./VoiceFieldLabel";
import { isValidTwilioSid } from "../utils/voiceFormat";

const emptyNumberRow = () => ({ friendlyName: "", phoneNumber: "", status: "ENABLED" });

/**
 * First-time setup form for the Voice Calls module. Shown instead of the
 * KPI/tabs layout until an organization has a Voice configuration saved.
 */
const VoiceSetupForm = ({ onSubmit, saving }) => {
  const [accountName, setAccountName] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([emptyNumberRow()]);
  const [errors, setErrors] = useState({});

  const updateNumberRow = (index, field, value) => {
    setPhoneNumbers((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addNumberRow = () => setPhoneNumbers((prev) => [...prev, emptyNumberRow()]);

  const removeNumberRow = (index) => {
    setPhoneNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const nextErrors = {};
    if (!accountName.trim()) nextErrors.accountName = "Account Name is required";
    if (!twilioSid.trim()) {
      nextErrors.twilioSid = "Twilio Account SID is required";
    } else if (!isValidTwilioSid(twilioSid)) {
      nextErrors.twilioSid = "Must start with 'AC' and be 34 characters long, exactly as shown in your Twilio Console";
    }
    if (!twilioToken.trim()) nextErrors.twilioToken = "Twilio Auth Token is required";

    if (phoneNumbers.length === 0) {
      nextErrors.phoneNumbers = "At least one phone number is required";
    } else {
      const seen = new Set();
      phoneNumbers.forEach((row, index) => {
        if (!row.phoneNumber.trim()) {
          nextErrors[`phoneNumber_${index}`] = "Phone number is required";
        } else {
          const key = row.phoneNumber.trim().toLowerCase();
          if (seen.has(key)) {
            nextErrors[`phoneNumber_${index}`] = "Phone numbers cannot repeat";
          }
          seen.add(key);
        }
      });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      accountName: accountName.trim(),
      twilioSid: twilioSid.trim(),
      twilioToken: twilioToken.trim(),
      phoneNumbers: phoneNumbers.map((row) => ({
        phoneNumber: row.phoneNumber.trim(),
        friendlyName: row.friendlyName.trim(),
        status: row.status,
      })),
    });
  };

  return (
    <Box className="flex justify-center items-start py-10 px-4">
      <Paper elevation={0} className="shadow-gw-2 border border-gw-line rounded-gw-4 w-full max-w-3xl p-6 sm:p-10">
        <Stack direction="row" spacing={1.5} alignItems="center" className="mb-2">
          <Box className="w-10 h-10 rounded-full bg-gw-accent-soft flex items-center justify-center">
            <PhoneInTalkIcon sx={{ color: "#C46C48", fontSize: 22 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 500, color: "#2B2722" }}>
            Set Up Voice Calls
          </Typography>
        </Stack>
        <Typography variant="body2" className="mb-8 text-gw-ink-2">
          Connect your Twilio account to start making and tracking voice calls from the CRM.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <VoiceFieldLabel>Account Name *</VoiceFieldLabel>
              <TextField
                fullWidth
                required
                placeholder="e.g. Glory Wellness Clinic"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                error={Boolean(errors.accountName)}
                helperText={errors.accountName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <VoiceFieldLabel>Twilio Account SID *</VoiceFieldLabel>
              <TextField
                fullWidth
                required
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={twilioSid}
                onChange={(e) => setTwilioSid(e.target.value)}
                error={Boolean(errors.twilioSid)}
                helperText={errors.twilioSid}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <VoiceFieldLabel>Twilio Auth Token *</VoiceFieldLabel>
              <TextField
                type="password"
                fullWidth
                required
                placeholder="Enter Twilio Auth Token"
                value={twilioToken}
                onChange={(e) => setTwilioToken(e.target.value)}
                error={Boolean(errors.twilioToken)}
                helperText={errors.twilioToken}
              />
            </Grid>
          </Grid>

          <Divider className="my-8" />

          <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-4">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2B2722" }}>
              Twilio Phone Numbers
            </Typography>
            <Button startIcon={<AddIcon />} onClick={addNumberRow} size="small">
              Add Number
            </Button>
          </Stack>

          {errors.phoneNumbers && (
            <Typography color="error" variant="caption" display="block" className="mb-3">
              {errors.phoneNumbers}
            </Typography>
          )}

          <Stack spacing={3}>
            {phoneNumbers.map((row, index) => (
              <Box
                key={index}
                className="rounded-gw-3 border border-gw-line bg-gw-bg p-4"
              >
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} sm={4}>
                    <VoiceFieldLabel>Friendly Name</VoiceFieldLabel>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Front Desk"
                      value={row.friendlyName}
                      onChange={(e) => updateNumberRow(index, "friendlyName", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <VoiceFieldLabel>Phone Number *</VoiceFieldLabel>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      placeholder="+91XXXXXXXXXX"
                      value={row.phoneNumber}
                      onChange={(e) => updateNumberRow(index, "phoneNumber", e.target.value)}
                      error={Boolean(errors[`phoneNumber_${index}`])}
                      helperText={errors[`phoneNumber_${index}`]}
                    />
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <VoiceFieldLabel>Status</VoiceFieldLabel>
                    <FormControl fullWidth size="small">
                      <Select
                        value={row.status}
                        onChange={(e) => updateNumberRow(index, "status", e.target.value)}
                      >
                        <MenuItem value="ENABLED">Enabled</MenuItem>
                        <MenuItem value="DISABLED">Disabled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4} sm={1} className="flex justify-end sm:pt-6">
                    <IconButton
                      color="error"
                      onClick={() => removeNumberRow(index)}
                      disabled={phoneNumbers.length === 1}
                      aria-label="Remove Number"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>

          <Divider className="my-8" />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ px: 3 }}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default VoiceSetupForm;
