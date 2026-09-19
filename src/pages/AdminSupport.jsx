import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import { PageLoader } from "../components/Spinner.jsx";
import { METHOD_LABEL, formatAmount, formatWhen, useSupportActions } from "../components/admin/adminBits.jsx";
import api from "../api/axios.js";

// The queue: contributions people reported ("I've Donated") that are waiting for you.
// Check your bank / UPI statement, then Verify — it appears on the Supporters page and the
// donor is notified. Reject if the money never arrived. (Everything already handled is in History.)
export default function AdminSupport() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ count: 0, amount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const latestCall = useRef(0);

  const load = useCallback(async () => {
    const call = ++latestCall.current;
    setError("");
    try {
      const { data } = await api.get("/admin/support", { params: { status: "pending", limit: 50 } });
      if (call !== latestCall.current) return;
      setItems(data.items ?? []);
      setSummary({ count: data.counts?.pending ?? 0, amount: data.amounts?.pending ?? 0 });
    } catch (err) {
      if (call === latestCall.current) setError(err.response?.data?.message || "Could not load contributions.");
    } finally {
      if (call === latestCall.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { busyId, changeStatus } = useSupportActions(load);

  return (
    <div>
      <DashboardTopbar title="Verify Donations" />

      <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Check your bank / UPI statement first. Verify only when the money has actually reached your account.
      </p>

      {!loading && !error && (
        <p className="mb-4 text-sm text-gray-600">
          <span className="font-bold text-gray-900">{summary.count}</span> waiting
          {summary.count > 0 && (
            <>
              {" "}
              · <span className="font-bold text-gray-900">{formatAmount(summary.amount)}</span> in total
            </>
          )}
        </p>
      )}

      {loading && <PageLoader label="Loading contributions" />}
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
            </div>
          </div>
        ))}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            <p className="font-semibold text-gray-700">All caught up.</p>
            <p className="mt-1">Nothing is waiting for verification.</p>
            <Link to="/admin/history" className="mt-3 inline-block font-semibold text-brand-600">
              See the full history
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
