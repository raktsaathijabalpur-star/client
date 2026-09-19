import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Phone, Search } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import { PageLoader } from "../components/Spinner.jsx";
import {
  METHOD_LABEL,
  StatusBadge,
  formatAmount,
  formatWhen,
  useSupportActions,
} from "../components/admin/adminBits.jsx";
import api from "../api/axios.js";

const PAGE_SIZE = 15;
const FILTERS = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

// Every contribution ever reported: who gave what, how, when, and who confirmed it.
export default function AdminHistory() {
  const [status, setStatus] = useState("all");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const latestCall = useRef(0);

  // wait until the person stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const load = useCallback(async () => {
    const call = ++latestCall.current;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/support", { params: { status, q: search, page, limit: PAGE_SIZE } });
      if (call === latestCall.current) setData(res.data);
    } catch (err) {
      if (call === latestCall.current) setError(err.response?.data?.message || "Could not load the history.");
    } finally {
      if (call === latestCall.current) setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const { busyId, changeStatus } = useSupportActions(load);

  const items = data?.items ?? [];
  const counts = data?.counts ?? { pending: 0, verified: 0, rejected: 0 };
  const totalAll = counts.pending + counts.verified + counts.rejected;
  const tabCount = { all: totalAll, ...counts };
  const from = data && data.total > 0 ? (data.page - 1) * PAGE_SIZE + 1 : 0;
  const to = data ? Math.min(data.page * PAGE_SIZE, data.total) : 0;

  const actions = (item) =>
    item.status === "pending" ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => changeStatus(item, "verified")}
          disabled={busyId === item._id}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
        >
          Verify
        </button>
        <button
          type="button"
          onClick={() => changeStatus(item, "rejected")}
          disabled={busyId === item._id}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => changeStatus(item, "pending")}
        disabled={busyId === item._id}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        Move to pending
      </button>
    );

  const reviewedText = (item) =>
    item.reviewedAt ? `${item.reviewedBy?.name ?? "Admin"} · ${formatWhen(item.reviewedAt)}` : "—";

  return (
    <div>
      <DashboardTopbar title="Contribution History" />

      {/* filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-white p-1 sm:grid-cols-4 lg:inline-grid lg:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              aria-pressed={status === f.value}
              className={`whitespace-nowrap rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                status === f.value ? "bg-brand-50 text-brand-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f.label} ({tabCount[f.value]})
            </button>
          ))}
        </div>

        <label className="relative block lg:w-72">
          <span className="sr-only">Search by name or phone</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search name or phone"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-base outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm"
          />
        </label>
      </div>

      {data && (
        <p className="mb-3 text-sm text-gray-600">
          {data.total === 0 ? (
            "No contributions found"
          ) : (
            <>
              Showing <span className="font-bold text-gray-900">{from}–{to}</span> of{" "}
              <span className="font-bold text-gray-900">{data.total}</span>
              {" · "}
              <span className="font-bold text-gray-900">{formatAmount(data.filteredAmount)}</span> in total
            </>
          )}
        </p>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && !data && <PageLoader label="Loading history" />}

      {data && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
          {/* desktop: table */}
          {items.length > 0 && (
            <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Donor</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Submitted</th>
                    <th className="px-4 py-3 font-semibold">Reviewed</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item._id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.user?.name ?? "(deleted user)"}</p>
                        {item.user?.phone && (
                          <a href={`tel:${item.user.phone}`} className="text-xs text-brand-600">
                            {item.user.phone}
                          </a>
                        )}
                        <p className="text-[11px] text-gray-400">{item.showName ? "Name public" : "Anonymous"}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-gray-900">{formatAmount(item.amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">{METHOD_LABEL[item.method] ?? item.method}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatWhen(item.createdAt)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{reviewedText(item)}</td>
                      <td className="px-4 py-3">{actions(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* phone: cards */}
          {items.length > 0 && (
            <div className="space-y-3 md:hidden">
              {items.map((item) => (
                <div key={item._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">{item.user?.name ?? "(deleted user)"}</p>
                      {item.user?.phone && (
                        <a href={`tel:${item.user.phone}`} className="flex items-center gap-1 text-sm text-brand-600">
                          <Phone size={13} />
                          {item.user.phone}
                        </a>
                      )}
                    </div>
                    <span className="shrink-0 text-lg font-extrabold text-red-600">{formatAmount(item.amount)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <StatusBadge status={item.status} />
                    <span>{METHOD_LABEL[item.method] ?? item.method}</span>
                    <span>{formatWhen(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {item.showName ? "Name public" : "Anonymous"}
                    {item.reviewedAt && ` · Reviewed by ${reviewedText(item)}`}
                  </p>
                  <div className="mt-3">{actions(item)}</div>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 && !loading && (
            <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              {search ? `No contributions match "${search}".` : "No contributions here yet."}
            </p>
          )}

          {/* paging */}
          {data.pages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {data.page} of {data.pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages || loading}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
