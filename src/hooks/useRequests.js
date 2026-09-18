import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import useNotificationStore from "../store/notificationStore.js";

// Shared fetch logic: loading / error state, stale-response protection, and a
// silent re-fetch whenever a socket event says request data changed
// (e.g. "a donor accepted your request").
function useApiList(url, params, listKey, fallbackError) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const version = useNotificationStore((s) => s.requestVersion);
  const paramsKey = JSON.stringify(params ?? {});
  const latestCall = useRef(0);

  const fetchItems = useCallback(
    async ({ silent = false } = {}) => {
      const call = ++latestCall.current;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(url, { params: JSON.parse(paramsKey) });
        if (call === latestCall.current) setItems(data[listKey] ?? []);
      } catch (err) {
        if (call === latestCall.current) {
          setError(err.response?.data?.message || fallbackError);
        }
      } finally {
        if (call === latestCall.current) setLoading(false);
      }
    },
    [url, paramsKey, listKey, fallbackError]
  );

  // initial load + whenever url / filters change
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // silent refresh when a socket event bumps the version
  const seenVersion = useRef(version);
  useEffect(() => {
    if (version !== seenVersion.current) {
      seenVersion.current = version;
      fetchItems({ silent: true });
    }
  }, [version, fetchItems]);

  const refetch = useCallback(() => fetchItems({ silent: true }), [fetchItems]);

  return { items, loading, error, refetch };
}

// Donor feed: open requests created by patients.  GET /requests
export default function useRequests(filters = {}) {
  const { items, loading, error, refetch } = useApiList(
    "/requests",
    filters,
    "requests",
    "Failed to load blood requests"
  );
  return { requests: items, loading, error, refetch };
}

// "My requests".  GET /requests/mine?scope=active|history|all
//   patient -> requests they created
//   donor   -> requests they accepted
export function useMyRequests(scope = "all") {
  const { items, loading, error, refetch } = useApiList(
    "/requests/mine",
    { scope },
    "requests",
    "Failed to load your requests"
  );
  return { requests: items, loading, error, refetch };
}

// Donors who could give to one specific request.  GET /requests/:id/matching-donors
export function useMatchingDonors(requestId) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const version = useNotificationStore((s) => s.requestVersion);

  useEffect(() => {
    if (!requestId) {
      setDonors([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    api
      .get(`/requests/${requestId}/matching-donors`)
      .then(({ data }) => active && setDonors(data.donors ?? []))
      .catch(() => active && setDonors([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [requestId, version]);

  return { donors, count: donors.length, loading };
}
