import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getVoiceDashboard, getVoiceDashboardExtended } from "../services/voiceApi";

const EMPTY_DASHBOARD = {
  kpis: {
    totalCalls: 0,
    completedCalls: 0,
    failedCalls: 0,
    totalDurationSeconds: 0,
    averageDurationSeconds: 0,
  },
  numberStats: [],
};

/**
 * Loads Voice Calls KPIs + per-number stats (top section of the page).
 * Today's KPIs load automatically; the extended "this month" / "total till
 * date" KPIs are only fetched on demand (e.g. "View More"), never on mount.
 */
export default function useVoiceDashboard(orgId, { enabled = true } = {}) {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [extended, setExtended] = useState(null);
  const [extendedLoading, setExtendedLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!orgId || !enabled) return;
    setLoading(true);
    try {
      const data = await getVoiceDashboard(orgId);
      setDashboard(data || EMPTY_DASHBOARD);
    } catch (err) {
      console.error("Error loading voice dashboard:", err);
      toast.error(err?.response?.data?.message || "Failed to load voice call statistics");
    } finally {
      setLoading(false);
    }
  }, [orgId, enabled]);

  const fetchExtendedDashboard = useCallback(async () => {
    if (!orgId) return;
    setExtendedLoading(true);
    try {
      const data = await getVoiceDashboardExtended(orgId);
      setExtended(data);
    } catch (err) {
      console.error("Error loading extended voice dashboard:", err);
      toast.error(err?.response?.data?.message || "Failed to load extended voice call statistics");
    } finally {
      setExtendedLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    fetchDashboard,
    extended,
    extendedLoading,
    fetchExtendedDashboard,
  };
}
