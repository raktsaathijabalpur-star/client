import { useCallback, useMemo, useState } from "react";
import api from "../api/axios.js";
import useNotificationStore from "../store/notificationStore.js";

// accept / fulfill / cancel a request, with a shared busy flag and toasts.
// `onDone` is called after every successful action (pass the list's `refetch`).
export default function useRequestActions(onDone) {
  const [busy, setBusy] = useState(false);
  const pushToast = useNotificationStore((s) => s.pushToast);

  const run = useCallback(
    async (call, successMessage, fallbackError) => {
      setBusy(true);
      try {
        await call();
        pushToast(successMessage, { type: "success" });
        await onDone?.();
        return true;
      } catch (err) {
        pushToast(err.response?.data?.message || fallbackError, { type: "error" });
        // 409 = someone else changed it first; refresh so the UI catches up
        if (err.response?.status === 409) await onDone?.();
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onDone, pushToast]
  );

  const accept = useCallback(
    (request) =>
      run(
        () => api.post(`/requests/${request._id}/accept`),
        "Thank you! The patient has been notified.",
        "Couldn't accept this request."
      ),
    [run]
  );

  const fulfill = useCallback(
    (request, donorIds) =>
      run(
        () => api.patch(`/requests/${request._id}/fulfill`, { donorIds }),
        "Request marked as fulfilled.",
        "Couldn't mark this request as fulfilled."
      ),
    [run]
  );

  const cancel = useCallback(
    (request) =>
      run(
        () => api.patch(`/requests/${request._id}/cancel`),
        "Request cancelled.",
        "Couldn't cancel this request."
      ),
    [run]
  );

  return useMemo(() => ({ accept, fulfill, cancel, busy }), [accept, fulfill, cancel, busy]);
}
