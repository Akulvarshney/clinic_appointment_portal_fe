import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getVoiceConfiguration,
  createVoiceConfiguration,
  updateVoiceConfiguration,
} from "../services/voiceApi";

/**
 * Loads and mutates the org's Voice (Twilio) configuration. `configuration`
 * is `null` until a setup form has been submitted at least once - this is
 * what the VoiceCalls page uses to decide whether to show the setup form or
 * the full dashboard/tabs.
 */
export default function useVoiceConfiguration(orgId) {
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfiguration = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await getVoiceConfiguration(orgId);
      setConfiguration(data || null);
    } catch (err) {
      console.error("Error loading voice configuration:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load voice configuration"
      );
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  const saveConfiguration = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const saveFn = configuration ? updateVoiceConfiguration : createVoiceConfiguration;
        const data = await saveFn({ orgId, ...payload });
        setConfiguration(data);
        toast.success(
          configuration
            ? "Voice configuration updated successfully"
            : "Voice configuration created successfully"
        );
        return data;
      } catch (err) {
        console.error("Error saving voice configuration:", err);
        toast.error(err?.response?.data?.message || "Failed to save voice configuration");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [orgId, configuration]
  );

  return {
    configuration,
    hasConfiguration: Boolean(configuration),
    loading,
    saving,
    fetchConfiguration,
    saveConfiguration,
  };
}
