import React, { useState } from "react";
import { LocateFixed } from "lucide-react";
import useAuthStore from "../../../store/authStore.js";
import useSaveProfile from "../../../hooks/useSaveProfile.js";
import useCurrentLocation from "../../../hooks/useCurrentLocation.js";
import { FormError, SaveButton, TextField } from "../formBits.jsx";

export default function LocationPanel({ onClose }) {
  const user = useAuthStore((state) => state.user);
  const { save, saving, error } = useSaveProfile();
  const { locate, locating, error: locateError } = useCurrentLocation();

  const [form, setForm] = useState(() => ({
    city: user?.city ?? "",
    state: user?.state ?? "",
    area: user?.area ?? "",
    pincode: user?.pincode ?? "",
  }));

  const setField = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const handleLocate = async () => {
    try {
      const found = await locate();
      setForm((prev) => ({
        city: found.city || prev.city,
        state: found.state || prev.state,
        area: found.area || prev.area,
        pincode: String(found.pincode || prev.pincode).replace(/\D/g, "").slice(0, 6),
      }));
    } catch (err) {
      // the hook already exposes the message as `locateError`
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await save(form, { successMessage: "Location updated." })) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-60"
      >
        <LocateFixed size={16} />
        {locating ? "Finding your location..." : "Use my current location"}
      </button>
      <FormError message={locateError} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="loc-city" label="City" value={form.city} onChange={setField("city")} required />
        <TextField id="loc-state" label="State" value={form.state} onChange={setField("state")} />
      </div>
      <TextField
        id="loc-area"
        label="Area / locality"
        value={form.area}
        onChange={setField("area")}
        placeholder="e.g. Vijay Nagar"
      />
      <TextField
        id="loc-pin"
        label="Pincode"
        inputMode="numeric"
        value={form.pincode}
        // no maxLength on purpose: pasting "482 001" must become 482001, not be cut to "482 00" first
        onChange={(e) =>
          setForm((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))
        }
      />
      <p className="text-xs text-gray-400">
        Your city is used to match you with donors and requests nearby.
      </p>

      <FormError message={error} />
      <SaveButton saving={saving} />
    </form>
  );
}
