import React, { useCallback, useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import api from "../api/axios.js";
import useNotificationStore from "../store/notificationStore.js";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const METHOD_LABEL = { bank: "Bank transfer", qr: "QR code" };

const formatAmount = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const formatWhen = (value) =>
  new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// Admin only. Contributions people reported from Profile -> "I've Donated".
// Check your bank / UPI statement, then Verify: it appears on the Supporters page
// and the donor gets a "confirmed" pop-up.
export default function AdminSupport() {
  const pushToast = useNotificationStore((state) => state.pushToast);

  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [amounts, setAmounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const latestCall = useRef(0);

  const load = useCallback(async () => {
    const call = ++latestCall.current;
    setError("");
    try {
      const { data } = await api.get("/admin/support", { params: { status: tab } });
      if (call !== latestCall.current) return; // a newer tab was opened meanwhile
      setItems(data.items ?? []);
      setCounts(data.counts ?? { pending: 0, verified: 0, rejected: 0 });
      setAmounts(data.amounts ?? { pending: 0, verified: 0, rejected: 0 });
    } catch (err) {
      if (call === latestCall.current) setError(err.response?.data?.message || "Could not load contributions.");
    } finally {
      if (call === latestCall.current) setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const changeStatus = async (item, status) => {
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
        status === "verified" ? "Verified. It now shows on the Supporters page." : status === "rejected" ? "Rejected." : "Moved back to Pending.",
        { type: "success" }
      );
      await load();
    } catch (err) {
      pushToast(err.response?.data?.message || "Couldn't update this contribution.", { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <DashboardTopbar title="Verify Donations" />

      <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Check your bank / UPI statement first. Verify only when the money has actually reached your account.
      </p>

      <div className="mb-5 grid w-full grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-white p-1 sm:inline-grid sm:w-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            aria-pressed={tab === t.value}
            className={`whitespace-nowrap rounded-lg px-1 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
              tab === t.value ? "bg-brand-50 text-brand-600" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label} ({counts[t.value]})
          </button>
        ))}
      </div>

      {amounts[tab] > 0 && (
        <p className="mb-4 text-sm text-gray-600">
          Total {tab}: <span className="font-bold text-gray-900">{formatAmount(amounts[tab])}</span>
        </p>
      )}

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900">{item.user?.name ?? "(deleted user)"}</p>
                {item.user?.phone && (
                  <a href={`tel:${item.user.phone}`} className="flex items-center gap-1 text-sm text-brand-600">
                    <Phone size={13} />
                    {item.user.phone}
                  </a>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {METHOD_LABEL[item.method] ?? item.method} · {formatWhen(item.createdAt)}
                </p>
                <p className="text-xs text-gray-400">
                  {item.showName ? "Name will be shown publicly" : "Will appear as Anonymous"}
                </p>
              </div>
              <span className="shrink-0 text-xl font-extrabold text-red-600">{formatAmount(item.amount)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              {item.status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => changeStatus(item, "verified")}
                    disabled={busyId === item._id}
                    className="h-10 flex-1 rounded-lg bg-green-600 text-sm font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => changeStatus(item, "rejected")}
                    disabled={busyId === item._id}
                    className="h-10 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => changeStatus(item, "pending")}
                  disabled={busyId === item._id}
                  className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  Move back to Pending
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && !error && items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Nothing {tab} right now.
          </p>
        )}
      </div>
    </div>
  );
}
