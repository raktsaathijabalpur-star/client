import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Droplet, Calendar } from "lucide-react";
import DashboardTopbar from "../../components/DashboardTopbar.jsx";
import StatCard from "../../components/StatCard.jsx";
import RequestCard from "../../components/RequestCard.jsx";
import RequestDetailModal from "../../components/RequestDetailModal.jsx";
import useAuthStore from "../../store/authStore.js";
import useNotificationStore from "../../store/notificationStore.js";
import useRequests from "../../hooks/useRequests.js";
import useRequestActions from "../../hooks/useRequestActions.js";
import api from "../../api/axios.js";

// Dashboard for users who signed up via "Donate Blood"
export default function DonorHome() {
  // Selected separately so this page doesn't re-render on unrelated auth
  // store changes (e.g. token refresh, loading flips elsewhere).
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const pushToast = useNotificationStore((state) => state.pushToast);

  const { requests, loading, error, refetch } = useRequests();
  const actions = useRequestActions(refetch);

  const [selectedId, setSelectedId] = useState(null);

  const nearbyRequests = useMemo(() => requests.slice(0, 4), [requests]);
  const selectedRequest = useMemo(
    () => requests.find((r) => r._id === selectedId) ?? null,
    [requests, selectedId]
  );

  const handleView = useCallback((request) => setSelectedId(request._id), []);

  const toggleAvailability = useCallback(async () => {
    const next = !user?.availableToDonate;
    updateUser({ availableToDonate: next });
    try {
      await api.put("/auth/me", { availableToDonate: next });
    } catch (err) {
      updateUser({ availableToDonate: !next });
      pushToast("Couldn't update your availability. Please try again.", { type: "error" });
    }
  }, [user?.availableToDonate, updateUser, pushToast]);

  return (
    <div>
      <DashboardTopbar title="Home" />

      <div className="mb-4 grid gap-4 sm:mb-6 sm:gap-5 md:grid-cols-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-5 text-white sm:p-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-white/70">Your Blood Group</p>
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
              className={`h-2.5 w-2.5 rounded-full ${
                user?.availableToDonate ? "bg-green-400" : "bg-gray-400"
              }`}
            />
            {user?.availableToDonate ? "Available to Donate" : "Not Available"}
          </button>
        </div>

        <Link
          to="/requests"
          className="flex items-center justify-center gap-3 rounded-2xl bg-gray-900 p-5 text-white transition-colors hover:bg-gray-800 sm:justify-start sm:p-6"
        >
          <Heart className="fill-red-500 text-red-500" size={22} />
          <span className="text-lg font-bold">Find Someone to Help</span>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:gap-5">
        <StatCard
          icon={<Heart className="fill-red-500 text-red-500" size={22} />}
          value={user?.donationsCount ?? 0}
          label="Donations"
        />
        <StatCard
          icon={<Droplet className="fill-brand-500 text-brand-500" size={22} />}
          value={user?.livesHelped ?? 0}
          label="Lives Helped"
        />
        <StatCard
          icon={<Calendar className="text-brand-500" size={22} />}
          value={
            user?.lastDonationDate
              ? new Date(user.lastDonationDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
          label="Last Donation"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Nearby Blood Requests</h2>
        <Link to="/requests" className="text-sm font-semibold text-brand-600">
          See all
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading nearby requests...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-5 md:grid-cols-2">
        {nearbyRequests.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            onView={handleView}
            onAccept={actions.accept}
            busy={actions.busy}
          />
        ))}
        {!loading && !error && nearbyRequests.length === 0 && (
          <p className="text-sm text-gray-500">No open requests near you right now.</p>
        )}
      </div>

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedId(null)}
        actions={actions}
      />
    </div>
  );
}
