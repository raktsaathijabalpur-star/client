import React, { useState } from "react";
import useAuthStore from "../../../store/authStore.js";
import useSaveProfile from "../../../hooks/useSaveProfile.js";
import { BLOOD_GROUPS, ROLES } from "../../../utils/constants.js";
import { FormError, SaveButton, TextField } from "../formBits.jsx";

export default function BloodInfoPanel({ onClose }) {
  const user = useAuthStore((state) => state.user);
  const { save, saving, error } = useSaveProfile();
  const isDonor = user?.role !== ROLES.PATIENT;

  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup ?? "");
  const [lastDonationDate, setLastDonationDate] = useState(
    user?.lastDonationDate ? String(user.lastDonationDate).slice(0, 10) : ""
  );
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const patch = { bloodGroup };
    if (isDonor) patch.lastDonationDate = lastDonationDate;
    if (await save(patch, { successMessage: "Blood information updated." })) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="mb-2 text-sm text-gray-600">Blood group</p>
        <div className="grid grid-cols-4 gap-3">
          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setBloodGroup(group)}
              aria-pressed={bloodGroup === group}
              className={`rounded-xl border-2 py-3 text-sm font-bold transition-colors ${
                bloodGroup === group
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-gray-200 text-gray-900 hover:bg-gray-50"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Double-check this. Donors and patients are matched using your blood group.
        </p>
      </div>

      {isDonor && (
        <TextField
          id="bi-last"
          label="Last donation date (optional)"
          type="date"
          max={today}
          value={lastDonationDate}
          onChange={(e) => setLastDonationDate(e.target.value)}
        />
      )}

      <FormError message={error} />
      <SaveButton saving={saving} />
    </form>
  );
}
