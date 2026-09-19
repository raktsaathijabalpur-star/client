import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, ArrowLeft, X } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import { PageLoader } from "../components/Spinner.jsx";
import api from "../api/axios.js";
import useAuthStore from "../store/authStore.js";
import useNotificationStore from "../store/notificationStore.js";
import { formatMonthYear } from "../utils/format.js";

export default function DonationHistory() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const requestVersion = useNotificationStore((state) => state.requestVersion);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Donations come from two places: requests a patient marked as fulfilled
  // (added automatically) and donations the donor adds manually.
  // Re-fetches when a socket event says a request was fulfilled.
  useEffect(() => {
    let active = true;
    (async () => {
      setError(null);
      try {
        const res = await api.get("/donations/me");
        if (active) setDonations(res.data?.donations ?? []);
      } catch (err) {
        console.error(err);
        if (active) setError(err.response?.data?.message || "Could not load your donation history.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [requestVersion]);

  const total = useMemo(() => donations.length, [donations]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setDateInput("");
    setLocationInput("");
    setFormError("");
  }, []);

  const handleSave = useCallback(async () => {
    if (!dateInput || !locationInput.trim()) {
      setFormError("Please fill both fields.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await api.post("/donations", { date: dateInput, location: locationInput.trim() });
      setDonations((prev) => [res.data.donation, ...prev]);
      if (res.data.user) updateUser(res.data.user); // donation count + last donation on Home
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't save this donation. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [dateInput, locationInput, closeModal, updateUser]);

  return (
    <div>
      <DashboardTopbar title="Donation History" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart className="fill-red-500 text-red-500" size={22} />
          <span className="text-lg font-bold text-gray-900">{total}</span>
          <span className="text-sm text-gray-500">Total Donations</span>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-full border border-red-600 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
        >
          + Add Donation
        </button>
      </div>

      {loading && <PageLoader label="Loading donation history" />}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm">
        {donations.map((donation) => (
          <div key={donation._id} className="flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 sm:text-base">
                {formatMonthYear(donation.date)}
              </p>
              <p className="text-xs text-gray-500 sm:text-sm">{donation.location}</p>
            </div>
            {donation.requestId && (
              <span className="shrink-0 font-mono text-xs text-gray-400">{donation.requestId}</span>
            )}
          </div>
        ))}

        {!loading && !error && donations.length === 0 && (
          <p className="px-6 py-6 text-sm text-gray-500">
            No donations recorded yet. When a patient marks a request you accepted as fulfilled, it
            appears here automatically.
          </p>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label="Back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-900">Add Donation</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="donationDate" className="mb-1.5 block text-sm text-gray-600">
                  Donation Date
                </label>
                <input
                  id="donationDate"
                  type="date"
                  max={today}
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="donationLocation" className="mb-1.5 block text-sm text-gray-600">
                  Hospital / Blood Bank
                </label>
                <input
                  id="donationLocation"
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. ABC Hospital"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {formError && <p className="text-xs text-red-600">{formError}</p>}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
