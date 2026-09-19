import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import { PageLoader } from "../components/Spinner.jsx";
import { StatusBadge, formatAmount, METHOD_LABEL } from "../components/admin/adminBits.jsx";
import api from "../api/axios.js";
import { formatTimeAgo } from "../utils/format.js";

function StatCard({ label, value, hint, tone = "default", to }) {
  const tones = {
    default: "border-gray-200 bg-white",
    attention: "border-amber-200 bg-amber-50",
  };
  const body = (
    <div className={`h-full rounded-2xl border p-4 shadow-sm sm:p-5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500 sm:text-sm">{hint}</p>}
    </div>
  );
  return to ? (
    <Link to={to} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function Section({ title, action, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Admin home: the numbers that matter + what needs attention
export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/admin/overview");
        if (active) setData(res.data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Could not load the overview.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <DashboardTopbar title="Overview" />

      {loading && <PageLoader label="Loading overview" />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {data && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Raised"
              value={formatAmount(data.amounts.verified)}
              hint={`${data.counts.verified} confirmed contribution${data.counts.verified === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Waiting for you"
              value={data.counts.pending}
              hint={data.counts.pending > 0 ? `${formatAmount(data.amounts.pending)} to verify` : "Nothing to verify"}
              tone={data.counts.pending > 0 ? "attention" : "default"}
              to="/admin/support"
            />
            <StatCard label="This month" value={formatAmount(data.thisMonth)} hint="confirmed this month" />
            <StatCard
              label="Supporters"
              value={data.contributors}
              hint={data.contributors === 1 ? "person has contributed" : "people have contributed"}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Section
              title="Needs your attention"
              action={
                data.counts.pending > 0 && (
                  <Link to="/admin/support" className="text-sm font-semibold text-brand-600">
                    Review all
                  </Link>
                )
              }
            >
              {data.waiting.length === 0 ? (
                <p className="py-4 text-sm text-gray-500">All caught up. Nothing is waiting for verification.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.waiting.map((item) => (
                    <li key={item._id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{item.user?.name ?? "(deleted user)"}</p>
                        <p className="text-xs text-gray-500">
                          {METHOD_LABEL[item.method] ?? item.method} · waiting {formatTimeAgo(item.createdAt).replace(" ago", "")}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-red-600">{formatAmount(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Top contributors">
              {data.topContributors.length === 0 ? (
                <p className="py-4 text-sm text-gray-500">No confirmed contributions yet.</p>
              ) : (
                <ol className="divide-y divide-gray-100">
                  {data.topContributors.map((row, index) => (
                    <li key={row.user?._id ?? index} className="flex items-center gap-3 py-3">
                      <span className="w-5 shrink-0 text-center text-sm font-extrabold text-gray-400">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{row.user?.name ?? "(deleted user)"}</p>
                        <p className="text-xs text-gray-500">
                          {row.count} contribution{row.count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-gray-900">{formatAmount(row.total)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          </div>

          <Section
            title="Recent activity"
            action={
              <Link to="/admin/history" className="text-sm font-semibold text-brand-600">
                Full history
              </Link>
            }
          >
            {data.recent.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">No contributions have been reported yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.recent.map((item) => (
                  <li key={item._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.user?.name ?? "(deleted user)"}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(item.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={item.status} />
                      <span className="w-20 text-right text-sm font-bold text-gray-900">{formatAmount(item.amount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
