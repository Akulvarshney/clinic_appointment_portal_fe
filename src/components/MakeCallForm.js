import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";
import PhoneForwardedIcon from "@mui/icons-material/PhoneForwarded";
import debounce from "lodash/debounce";
import { searchClients } from "../services/voiceApi";
import VoiceFieldLabel from "./VoiceFieldLabel";

const CALL_TYPE = { MANUAL: "MANUAL", CLIENT: "CLIENT" };

/**
 * Tab 2 - Make Call. Inline form (no modal) for placing an outbound call
 * either to a manually entered number or to a registered client's mobile
 * number. Resets itself after a successful call.
 */
const MakeCallForm = ({ orgId, enabledNumbers = [], onCreateCall, creating }) => {
  const [fromNumber, setFromNumber] = useState("");
  const [callType, setCallType] = useState(CALL_TYPE.MANUAL);
  const [toNumber, setToNumber] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (enabledNumbers.length > 0 && !fromNumber) {
      setFromNumber(enabledNumbers[0].phone_number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledNumbers]);

  const fetchClientOptions = debounce(async (search) => {
    if (!orgId) return;
    setClientSearchLoading(true);
    try {
      const clients = await searchClients(orgId, search, 10);
      setClientOptions(clients || []);
    } catch (err) {
      console.error("Error searching clients:", err);
    } finally {
      setClientSearchLoading(false);
    }
  }, 300);

  const resetForm = () => {
    setCallType(CALL_TYPE.MANUAL);
    setToNumber("");
    setSelectedClient(null);
    setClientOptions([]);
  };

  const handleCall = async () => {
    setError("");
    setSuccess("");
    if (!fromNumber) {
      setError("Please select a from number");
      return;
    }
    if (callType === CALL_TYPE.MANUAL && !toNumber.trim()) {
      setError("Please enter a phone number to call");
      return;
    }
    if (callType === CALL_TYPE.CLIENT && !selectedClient) {
      setError("Please select a client to call");
      return;
    }

    try {
      await onCreateCall({
        from_number: fromNumber,
        ...(callType === CALL_TYPE.MANUAL
          ? { to_number: toNumber.trim() }
          : { client_id: selectedClient.id }),
      });
      setSuccess("Call initiated successfully.");
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to initiate call");
    }
  };

  return (
    <Box className="max-w-2xl py-4">
      <Box className="flex items-center gap-2 mb-5">
        <PhoneForwardedIcon sx={{ color: "#C46C48" }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2B2722" }}>
          Place an Outbound Call
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <VoiceFieldLabel>From Number *</VoiceFieldLabel>
          <FormControl fullWidth required>
            <Select
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
              displayEmpty
            >
              {enabledNumbers.length === 0 && (
                <MenuItem value="" disabled>
                  No enabled numbers available
                </MenuItem>
              )}
              {enabledNumbers.map((number) => (
                <MenuItem key={number.id || number.phone_number} value={number.phone_number}>
                  {number.friendly_name
                    ? `${number.friendly_name} (${number.phone_number})`
                    : number.phone_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <VoiceFieldLabel>Call Type</VoiceFieldLabel>
          <FormControl>
            <RadioGroup
              row
              value={callType}
              onChange={(e) => setCallType(e.target.value)}
            >
              <FormControlLabel
                value={CALL_TYPE.MANUAL}
                control={<Radio />}
                label="Manual Number"
              />
              <FormControlLabel
                value={CALL_TYPE.CLIENT}
                control={<Radio />}
                label="Registered Client"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          {callType === CALL_TYPE.MANUAL ? (
            <>
              <VoiceFieldLabel>To Number *</VoiceFieldLabel>
              <TextField
                fullWidth
                required
                placeholder="+91XXXXXXXXXX"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
                helperText="Include the country code, e.g. +91 for India. If omitted, +91 is assumed."
              />
            </>
          ) : (
            <>
              <VoiceFieldLabel>Search Registered Client *</VoiceFieldLabel>
              <Autocomplete
                options={clientOptions}
                getOptionLabel={(option) =>
                  [option.first_name, option.last_name].filter(Boolean).join(" ") +
                  (option.phone ? ` (${option.phone})` : "")
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={clientSearchLoading}
                value={selectedClient}
                onChange={(_, value) => setSelectedClient(value)}
                onInputChange={(_, value) => fetchClientOptions(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search by name or mobile number"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {clientSearchLoading ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </>
          )}
        </Grid>

        {callType === CALL_TYPE.CLIENT && selectedClient && (
          <Grid item xs={12}>
            <Typography variant="body2" className="text-gw-ink-2">
              Will call: <strong>{selectedClient.phone || "No mobile number on file"}</strong>
            </Typography>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Grid>
        )}

        {success && (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: "#5BA876" }}>
              {success}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleCall}
            disabled={creating}
            startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <PhoneForwardedIcon />}
            sx={{ px: 3 }}
          >
            {creating ? "Calling..." : "Call Now"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MakeCallForm;
