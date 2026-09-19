import React, { useCallback, useState } from "react";
import api from "../../api/axios.js";
import useNotificationStore from "../../store/notificationStore.js";

export const formatAmount = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export const METHOD_LABEL = { bank: "Bank transfer", qr: "QR code" };

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700",
  verified: "bg-green-50 text-green-700",
  rejected: "bg-gray-100 text-gray-600",
};
const STATUS_LABEL = { pending: "Pending", verified: "Verified", rejected: "Rejected" };

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        STATUS_STYLE[status] ?? STATUS_STYLE.pending
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// Verify / Reject / Move back to pending — always asks first (it's money).
// `onDone` is called after a successful change (pass the page's reload function).
export function useSupportActions(onDone) {
  const pushToast = useNotificationStore((state) => state.pushToast);
  const [busyId, setBusyId] = useState(null);

  const changeStatus = useCallback(
    async (item, status) => {
      const who = item.user?.name ?? "this user";
      const question = {
        verified: `Confirm that ${formatAmount(item.amount)} from ${who} has reached your account?`,
        rejected: `Reject ${formatAmount(item.amount)} from ${who}? (the money was not received)`,
        pending: `Move ${formatAmount(item.amount)} from ${who} back to Pending?`,
      }[status];
      if (!window.confirm(question)) return;

      setBusyId(item._id);
      try {
        await api.patch(`/admin/support/${item._id}`, { status });
        pushToast(
          status === "verified"
            ? "Verified. It now shows on the Supporters page."
            : status === "rejected"
            ? "Rejected."
            : "Moved back to Pending.",
          { type: "success" }
        );
        await onDone?.();
      } catch (err) {
        pushToast(err.response?.data?.message || "Couldn't update this contribution.", { type: "error" });
      } finally {
        setBusyId(null);
      }
    },
    [onDone, pushToast]
  );

  return { busyId, changeStatus };
}
