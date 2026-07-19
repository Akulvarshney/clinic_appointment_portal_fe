import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getVoiceCalls, createVoiceCall } from "../services/voiceApi";

const DEFAULT_FILTERS = {
  search: "",
  dateFrom: null,
  dateTo: null,
  status: undefined,
  direction: undefined,
  fromNumber: undefined,
  clientId: undefined,
};

/**
 * Drives the server-side paginated / filterable / sortable Call Logs table
 * (Tab 1), and exposes createCall for the Make Call flow (Tab 2) so a newly
 * placed call can immediately refresh the logs list.
 */
export default function useVoiceCalls(orgId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({ sortBy: "created_at", sortOrder: "desc" });

  const fetchCalls = useCallback(
    async (overrides = {}) => {
      if (!orgId) return;
      const page = overrides.page ?? pagination.current;
      const limit = overrides.limit ?? pagination.pageSize;
      const nextFilters = overrides.filters ?? filters;
      const nextSorter = overrides.sorter ?? sorter;

      setLoading(true);
      try {
        const data = await getVoiceCalls(orgId, {
          page,
          limit,
          sortBy: nextSorter.sortBy,
          sortOrder: nextSorter.sortOrder,
          ...nextFilters,
        });
        setLogs(data?.logs || []);
        setPagination((prev) => ({
          ...prev,
          current: data?.pagination?.page || page,
          pageSize: data?.pagination?.limit || limit,
          total: data?.pagination?.total || 0,
        }));
      } catch (err) {
        console.error("Error loading call logs:", err);
        toast.error(err?.response?.data?.message || "Failed to load call logs");
      } finally {
        setLoading(false);
      }
    },
    [orgId, pagination, filters, sorter]
  );

  // Initial load once the organization is known (mirrors useVoiceDashboard /
  // useVoiceConfiguration, which both fetch on mount).
  useEffect(() => {
    fetchCalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the org changes; fetchCalls reads latest state internally
  }, [orgId]);

  const applyFilters = useCallback(
    (newFilters) => {
      const merged = { ...filters, ...newFilters };
      setFilters(merged);
      fetchCalls({ page: 1, filters: merged });
    },
    [filters, fetchCalls]
  );

  const applySorter = useCallback(
    (newSorter) => {
      setSorter(newSorter);
      fetchCalls({ page: 1, sorter: newSorter });
    },
    [fetchCalls]
  );

  const changePage = useCallback(
    (page, limit) => {
      fetchCalls({ page, limit });
    },
    [fetchCalls]
  );

  const createCall = useCallback(
    async (payload) => {
      setCreating(true);
      try {
        const result = await createVoiceCall({ orgId, ...payload });
        toast.success("Call initiated successfully");
        fetchCalls({ page: 1 });
        return result;
      } catch (err) {
        console.error("Error creating call:", err);
        toast.error(err?.response?.data?.message || "Failed to initiate call");
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [orgId, fetchCalls]
  );

  return {
    logs,
    loading,
    creating,
    filters,
    pagination,
    sorter,
    fetchCalls,
    applyFilters,
    applySorter,
    changePage,
    createCall,
  };
}
