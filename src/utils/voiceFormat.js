/** Formats a duration given in seconds as e.g. "3m 45s" (or "45s" if under a minute). */
export const formatDuration = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
};

/** Renders a UTC timestamp using the browser's local timezone for display. */
export const formatDateTime = (isoString) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString();
};

/** Real Twilio Account SIDs always look like "AC" + 32 hex/alphanumeric chars. */
const TWILIO_SID_PATTERN = /^AC[a-zA-Z0-9]{32}$/;

/** Validates a Twilio Account SID's shape (catches typos/placeholders before saving). */
export const isValidTwilioSid = (value) => TWILIO_SID_PATTERN.test(String(value || "").trim());
