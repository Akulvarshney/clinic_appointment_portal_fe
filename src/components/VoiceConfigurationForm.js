import React, { useEffect, useState } from "react";
import {
  Box,
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
import VoiceFieldLabel from "./VoiceFieldLabel";
import { isValidTwilioSid } from "../utils/voiceFormat";

const emptyNumberRow = () => ({
  id: undefined,
  friendlyName: "",
  phoneNumber: "",
  status: "ENABLED",
});

const toFormRow = (number) => ({
  id: number.id,
  friendlyName: number.friendly_name || "",
  phoneNumber: number.phone_number || "",
  status: number.status || "ENABLED",
});

/**
 * Tab 3 - Configuration. Lets the org update account fields and manage the
 * list of phone numbers (add / enable / disable / delete), with the same
 * "at least one number" guarantee as the initial setup form.
 */
const VoiceConfigurationForm = ({ configuration, onSubmit, saving }) => {
  const [accountName, setAccountName] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([emptyNumberRow()]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!configuration) return;
    setAccountName(configuration.account_name || "");
    setTwilioSid(configuration.twilio_sid || "");
    setTwilioToken(""); // never pre-filled - the API never returns the token
    setPhoneNumbers(
      configuration.phoneNumbers?.length
        ? configuration.phoneNumbers.map(toFormRow)
        : [emptyNumberRow()]
    );
  }, [configuration]);

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
    // Twilio Auth Token is intentionally optional here - it's never returned
    // by the API, so leaving it blank keeps the previously stored token.

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
        id: row.id,
        phoneNumber: row.phoneNumber.trim(),
        friendlyName: row.friendlyName.trim(),
        status: row.status,
      })),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate className="max-w-3xl">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <VoiceFieldLabel>Account Name *</VoiceFieldLabel>
          <TextField
            fullWidth
            required
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
            value={twilioSid}
            onChange={(e) => setTwilioSid(e.target.value)}
            error={Boolean(errors.twilioSid)}
            helperText={errors.twilioSid}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <VoiceFieldLabel>Twilio Auth Token</VoiceFieldLabel>
          <TextField
            type="password"
            fullWidth
            placeholder="Leave blank to keep the current token"
            value={twilioToken}
            onChange={(e) => setTwilioToken(e.target.value)}
            error={Boolean(errors.twilioToken)}
            helperText={
              errors.twilioToken ||
              "For security, the current token is never shown - only enter a new one if you want to change it."
            }
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
            key={row.id || `new-${index}`}
            className="rounded-gw-3 border border-gw-line bg-gw-bg p-4"
          >
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={4}>
                <VoiceFieldLabel>Friendly Name</VoiceFieldLabel>
                <TextField
                  fullWidth
                  size="small"
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
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Stack>
    </Box>
  );
};

export default VoiceConfigurationForm;
