import React, { useState } from "react";
import useAuthStore from "../../../store/authStore.js";
import useSaveProfile from "../../../hooks/useSaveProfile.js";
import { FormError, SaveButton, TextField } from "../formBits.jsx";

const OPTIONS = [
  { value: true, label: "Available", dot: "bg-green-500", selected: "border-green-600 bg-green-50" },
  {
    value: false,
    label: "Temporarily unavailable",
    dot: "bg-yellow-400",
    selected: "border-yellow-500 bg-yellow-50",
  },
];

// Donors only
export default function AvailabilityPanel({ onClose }) {
  const user = useAuthStore((state) => state.user);
  const { save, saving, error } = useSaveProfile();

  const [available, setAvailable] = useState(user?.availableToDonate !== false);
  const [preferredArea, setPreferredArea] = useState(user?.preferredArea ?? "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await save(
      { availableToDonate: available, preferredArea },
      { successMessage: "Availability updated." }
    );
    if (ok) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="mb-2 text-sm text-gray-600">Current availability</p>
        <div className="space-y-3">
          {OPTIONS.map((option) => (
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
        <p className="mt-2 text-xs text-gray-400">
          While you're unavailable, patients won't see you in "Matching Donors" and you can't accept
          new requests.
        </p>
      </div>

      <TextField
        id="av-area"
        label="Preferred donation area"
        value={preferredArea}
        onChange={(e) => setPreferredArea(e.target.value)}
        placeholder="e.g. Jabalpur & nearby"
      />

      <FormError message={error} />
      <SaveButton saving={saving} />
    </form>
  );
}
