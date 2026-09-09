import React, { useCallback, useMemo, useState } from "react";
import { Heart, Droplet, Calendar } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import StatCard from "../components/StatCard.jsx";
import RequestCard from "../components/RequestCard.jsx";
import RequestDetailModal from "../components/RequestDetailModal.jsx";
import useAuthStore from "../store/authStore.js";
import useRequests from "../hooks/useRequests.js";
import api from "../api/axios.js";

export default function Home() {
  // Selected separately so this page doesn't re-render on unrelated auth
  // store changes (e.g. token refresh, loading flips elsewhere).
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { requests, loading, error } = useRequests({ status: "Open" });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [helpingIds, setHelpingIds] = useState(() => new Set());

  const nearbyRequests = useMemo(() => requests.slice(0, 4), [requests]);

  const handleHelp = useCallback(async (request) => {
    try {
      await api.post(`/requests/${request._id}/help`);
      setHelpingIds((prev) => new Set(prev).add(request._id));
    } catch (err) {
      // Silently ignore duplicate-help errors; surface others minimally
      if (err.response?.status !== 409) {
        console.error(err);
      } else {
        setHelpingIds((prev) => new Set(prev).add(request._id));
      }
    }
  }, []);

  const toggleAvailability = useCallback(async () => {
    const next = !user?.availableToDonate;
    updateUser({ availableToDonate: next });
    try {
      await api.put("/auth/me", { availableToDonate: next });
    } catch (err) {
      updateUser({ availableToDonate: !next });
    }
  }, [user?.availableToDonate, updateUser]);

  return (
    <div>
      <DashboardTopbar title="Home" />

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div className="bg-gradient-to-br from-brand-600 to-brand-900 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/70 mb-2">Your Blood Group</p>
            <p className="text-4xl font-extrabold">{user?.bloodGroup}</p>
          </div>
          <button
            type="button"
            onClick={toggleAvailability}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              user?.availableToDonate ? "bg-white/15" : "bg-white/5"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                user?.availableToDonate ? "bg-green-400" : "bg-gray-400"
              }`}
            />
            {user?.availableToDonate ? "Available to Donate" : "Not Available"}
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 text-white flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors">
          <Heart className="fill-red-500 text-red-500" size={22} />
          <span className="text-lg font-bold">Find Someone to Help</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard icon={<Heart className="fill-red-500 text-red-500" size={22} />} value={user?.donationsCount ?? 0} label="Donations" />
        <StatCard icon={<Droplet className="text-brand-500 fill-brand-500" size={22} />} value={user?.livesHelped ?? 0} label="Lives Helped" />
        <StatCard
          icon={<Calendar className="text-brand-500" size={22} />}
          value={user?.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
          label="Last Donation"
        />
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Nearby Blood Requests</h2>

      {loading && <p className="text-gray-500 text-sm">Loading nearby requests...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid md:grid-cols-2 gap-5">
        {nearbyRequests.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            onViewRequest={setSelectedRequest}
            onHelp={handleHelp}
            isHelping={helpingIds.has(request._id)}
          />
        ))}
        {!loading && nearbyRequests.length === 0 && (
          <p className="text-gray-500 text-sm">No open requests near you right now.</p>
        )}
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onHelp={handleHelp}
        isHelping={selectedRequest ? helpingIds.has(selectedRequest._id) : false}
      />
    </div>
  );
}
