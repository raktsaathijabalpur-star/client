import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import { PageLoader } from "../components/Spinner.jsx";
import api from "../api/axios.js";

function timeAgo(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatAmount(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

// Contributions made from Profile -> "Donate Now" -> "I've Donated".
// Real data only (no sample supporters): the API returns the ones you verified.
export default function Supporters() {
  const [supporters, setSupporters] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/supporters");
        if (!active) return;
        setSupporters(res.data?.supporters ?? []);
        setTotalCount(res.data?.totalCount ?? 0);
        setTotalAmount(res.data?.totalAmount ?? 0);
      } catch (err) {
        console.error(err);
        if (active) setError(err.response?.data?.message || "Could not load supporters.");
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
      <DashboardTopbar title="Supporters" />

      {loading && <PageLoader label="Loading supporters" />}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-6 text-center text-white sm:mb-8 sm:p-8">
        <p className="mb-2 text-4xl font-extrabold sm:text-5xl">{totalCount}</p>
        <p className="text-sm text-white/80 sm:text-base">
          {totalCount === 1 ? "person has" : "people have"} supported Jabalpur Blood Seva
        </p>
        {totalAmount > 0 && (
          <p className="mt-3 text-sm font-semibold text-white/90 sm:text-base">
            {formatAmount(totalAmount)} contributed so far
          </p>
        )}
      </div>

      <h2 className="mb-4 text-lg font-bold text-gray-900">Recent Supporters</h2>

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm">
        {supporters.map((supporter) => (
          <div
            key={supporter._id}
            className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900 sm:text-base">{supporter.name}</p>
              <p className="text-xs text-gray-500 sm:text-sm">
                {timeAgo(supporter.timestamp)}
                {supporter.status === "pending" && (
                  <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Awaiting confirmation
                  </span>
                )}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-red-600 sm:text-base">
              {formatAmount(supporter.amount)}
            </span>
          </div>
        ))}

        {!loading && !error && supporters.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            <p>No supporters yet.</p>
            <p className="mt-1">
              Be the first: open{" "}
              <Link to="/profile" className="font-semibold text-brand-600">
                Profile
              </Link>{" "}
              and tap "Donate Now".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
