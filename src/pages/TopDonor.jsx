import React, { useEffect, useState } from "react";
import { Droplet, Bell } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import api from "../api/axios.js";

// Fallback sample data — sirf tab dikhta hai jab backend se data na aaye
// ya API call fail ho jaaye, taaki UI kabhi khali na lage.
const SAMPLE_DONORS = [
  { _id: "d1", name: "Priya Verma", bloodGroup: "O+", city: "Raipur", donationsCount: 11, avatarUrl: null },
  { _id: "d2", name: "Amit Sharma", bloodGroup: "O+", city: "Raipur", donationsCount: 6, avatarUrl: null },
  { _id: "d3", name: "Karan Mehta", bloodGroup: "O+", city: "Raipur", donationsCount: 2, avatarUrl: null },
];

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
        const list = Array.isArray(res.data) ? res.data : res.data?.donors ?? [];
        if (active) setDonors(list.length ? list : SAMPLE_DONORS);
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Could not load top donors. Showing sample data.");
          setDonors(SAMPLE_DONORS);
        }
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
      <div className="flex items-center justify-between mb-1">
        <DashboardTopbar title="Top Donors" />
      </div>

      {loading && <p className="text-gray-500 text-sm mb-3">Loading top donors...</p>}
      {error && <p className="text-amber-600 text-xs mb-3">{error}</p>}

      <p className="text-gray-500 text-sm mb-4">Ranked by total donations, all time</p>

      <div className="flex flex-col gap-3">
        {donors.map((donor, idx) => {
          const rank = idx + 1;
          return (
            <div
              key={donor._id}
              className="flex items-center gap-4 rounded-2xl bg-white shadow-sm px-5 py-4 sm:px-6"
            >
              <span
                className={`w-6 text-center font-extrabold text-lg shrink-0 ${
                  RANK_COLORS[rank] ?? "text-gray-500"
                }`}
              >
                {rank}
              </span>

              <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                {donor.avatarUrl ? (
                  <img src={donor.avatarUrl} alt={donor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm font-bold">
                    {donor.name?.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{donor.name}</p>
                <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
                  <Droplet className="fill-red-500 text-red-500" size={12} />
                  {donor.bloodGroup} · {donor.city}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-extrabold text-red-600 text-base sm:text-lg">
                  {donor.donationsCount}
                </p>
                <p className="text-gray-400 text-xs">donations</p>
              </div>
            </div>
          );
        })}

        {!loading && donors.length === 0 && (
          <p className="text-gray-500 text-sm px-6 py-6">No donor data available yet.</p>
        )}
      </div>
    </div>
  );
}