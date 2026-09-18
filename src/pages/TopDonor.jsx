import React, { useEffect, useState } from "react";
import { Droplet } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import api from "../api/axios.js";

const RANK_COLORS = {
  1: "text-red-600",
  2: "text-gray-400",
  3: "text-amber-600",
};

export default function TopDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/donors/top");
        if (active) setDonors(res.data?.donors ?? []);
      } catch (err) {
        console.error(err);
        if (active) setError(err.response?.data?.message || "Could not load top donors.");
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
      <DashboardTopbar title="Top Donors" />

      {loading && <p className="mb-3 text-sm text-gray-500">Loading top donors...</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <p className="mb-4 text-sm text-gray-500">Ranked by total donations, all time</p>

      <div className="flex flex-col gap-3">
        {donors.map((donor, idx) => {
          const rank = idx + 1;
          return (
            <div
              key={donor._id}
              className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm sm:px-6"
            >
              <span
                className={`w-6 shrink-0 text-center text-lg font-extrabold ${
                  RANK_COLORS[rank] ?? "text-gray-500"
                }`}
              >
                {rank}
              </span>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {donor.avatarUrl ? (
                  <img src={donor.avatarUrl} alt={donor.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-400">{donor.name?.charAt(0)}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900 sm:text-base">{donor.name}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                  <Droplet className="fill-red-500 text-red-500" size={12} />
                  {donor.bloodGroup} · {donor.city}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-base font-extrabold text-red-600 sm:text-lg">
                  {donor.donationsCount}
                </p>
                <p className="text-xs text-gray-400">donations</p>
              </div>
            </div>
          );
        })}

        {!loading && !error && donors.length === 0 && (
          <p className="px-2 py-6 text-sm text-gray-500">
            No donations recorded yet. The leaderboard fills up as requests get fulfilled.
          </p>
        )}
      </div>
    </div>
  );
}
