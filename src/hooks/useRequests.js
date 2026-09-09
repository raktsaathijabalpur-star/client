import { useCallback, useEffect, useState } from "react";
import api from "../api/axios.js";

// Reusable data-fetching hook for blood requests, with optional filters.
// Keeps components declarative and avoids duplicating fetch/loading/error logic.
export default function useRequests(filters = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filters);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/requests", { params: filters });
      setRequests(data.requests);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load blood requests");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}
