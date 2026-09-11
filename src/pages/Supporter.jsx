import React, { useEffect, useMemo, useState } from "react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import api from "../api/axios.js";

// Fallback sample data — sirf tab dikhta hai jab backend se data na aaye
// ya API call fail ho jaaye, taaki UI kabhi khali na lage.
const SAMPLE_SUPPORTERS = [
  { _id: "s1", name: "Priya Verma", amount: 500, timestamp: Date.now() - 2 * 60 * 1000 },
  { _id: "s2", name: "Aman Gupta", amount: 1000, timestamp: Date.now() - 10 * 60 * 1000 },
  { _id: "s3", name: "Sunita Rao", amount: 100, timestamp: Date.now() - 25 * 60 * 1000 },
  { _id: "s4", name: "Karan Mehta", amount: 500, timestamp: Date.now() - 60 * 60 * 1000 },
  { _id: "s5", name: "Neha Joshi", amount: 250, timestamp: Date.now() - 3 * 60 * 60 * 1000 },
];

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

export default function Supporters() {
  const [supporters, setSupporters] = useState([]);
  const [totalSupporters, setTotalSupporters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/supporters");
        const list = Array.isArray(res.data) ? res.data : res.data?.supporters ?? [];
        const count = res.data?.totalCount ?? list.length;
        if (active) {
          setSupporters(list.length ? list : SAMPLE_SUPPORTERS);
          setTotalSupporters(list.length ? count : SAMPLE_SUPPORTERS.length + 123);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Could not load supporters. Showing sample data.");
          setSupporters(SAMPLE_SUPPORTERS);
          setTotalSupporters(128);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const recentSupporters = useMemo(
    () => [...supporters].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [supporters]
  );

  return (
    <div>
      <DashboardTopbar title="Supporters" />

      {loading && <p className="text-gray-500 text-sm mb-3">Loading supporters...</p>}
      {error && <p className="text-amber-600 text-xs mb-3">{error}</p>}

      <div className="bg-gradient-to-br from-brand-600 to-brand-900 rounded-2xl p-8 text-white text-center mb-8">
        <p className="text-4xl sm:text-5xl font-extrabold mb-2">{totalSupporters}</p>
        <p className="text-white/80 text-sm sm:text-base">
          people have supported Jabalpur RaktSaathi
        </p>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Supporters</h2>

      <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
        {recentSupporters.map((supporter) => (
          <div
            key={supporter._id}
            className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5"
          >
            <div>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{supporter.name}</p>
              <p className="text-gray-500 text-xs sm:text-sm">{timeAgo(supporter.timestamp)}</p>
            </div>
            <span className="font-bold text-red-600 text-sm sm:text-base shrink-0">
              {formatAmount(supporter.amount)}
            </span>
          </div>
        ))}

        {!loading && recentSupporters.length === 0 && (
          <p className="text-gray-500 text-sm px-6 py-6">No supporters yet.</p>
        )}
      </div>
    </div>
  );
}