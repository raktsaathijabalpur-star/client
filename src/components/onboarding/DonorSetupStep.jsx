import React, { useState } from "react";
import api from "../../api/axios.js";
import useAuthStore from "../../store/authStore.js";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const AVAILABILITY = [
  { value: true, label: "Available", dot: "bg-green-500", selected: "border-green-600 bg-green-50" },
  {
    value: false,
    label: "Temporarily unavailable",
    dot: "bg-yellow-400",
    selected: "border-yellow-500 bg-yellow-50",
  },
];

// "You're about to become someone's hope ❤️" — shown once, right after a donor signs up
export default function DonorSetupStep({ onDone }) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [lastDonationDate, setLastDonationDate] = useState("");
  const [preferredArea, setPreferredArea] = useState(user?.area ?? "");
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { availableToDonate: available, preferredArea: preferredArea.trim() };
      if (lastDonationDate) payload.lastDonationDate = lastDonationDate;

      const { data } = await api.put("/auth/me", payload);
      updateUser(data.user);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save your details. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-6 text-2xl font-extrabold text-gray-900">
        You're about to become someone's hope{" "}
        <span role="img" aria-label="heart">
          ❤️
        </span>
      </h2>

      <div className="mb-5 flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50/60 px-5 py-4">
        <span className="text-sm text-gray-600">Your Blood Group</span>
        <span className="text-xl font-extrabold text-brand-600">{user?.bloodGroup}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="lastDonationDate" className="mb-1 block text-sm text-gray-600">
            Last Donation Date <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="lastDonationDate"
            type="date"
            max={today}
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="preferredArea" className="mb-1 block text-sm text-gray-600">
            Preferred Donation Area
          </label>
          <input
            id="preferredArea"
            type="text"
            value={preferredArea}
            onChange={(e) => setPreferredArea(e.target.value)}
            placeholder="e.g. Jabalpur & nearby"
            className={inputClass}
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">Current Availability</p>
          <div className="space-y-3">
            {AVAILABILITY.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setAvailable(option.value)}
                aria-pressed={available === option.value}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold text-gray-900 transition-colors ${
                  available === option.value ? option.selected : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded-full ${option.dot}`} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Start Helping"}
      </button>
    </form>
  );
}
