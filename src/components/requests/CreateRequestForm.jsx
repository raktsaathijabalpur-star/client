import React, { useCallback, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import api from "../../api/axios.js";
import useAuthStore from "../../store/authStore.js";
import { BLOOD_GROUPS, URGENCY_LEVELS, URGENCY_OPTION_STYLES } from "../../utils/constants.js";
import { defaultRequiredBy, toLocalInputValue } from "../../utils/format.js";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// "Let's find the help you need." — used on the patient onboarding page and
// inside the "+ Request Blood" modal.
// Contact phone, city and area are taken from the patient's profile.
export default function CreateRequestForm({ onCreated, heading = "Let's find the help you need." }) {
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState(() => ({
    bloodGroup: "",
    hospitalName: "",
    requiredBy: defaultRequiredBy(),
    urgency: "Normal",
    unitsRequired: 1,
    patientName: user?.name ?? "",
  }));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const minDateTime = useMemo(() => toLocalInputValue(new Date()), []);

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const changeUnits = (delta) =>
    setForm((prev) => ({
      ...prev,
      unitsRequired: Math.min(20, Math.max(1, prev.unitsRequired + delta)),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.bloodGroup) return setError("Please select the blood group you need.");
    if (!form.hospitalName.trim()) return setError("Please enter the hospital name.");
    if (!form.requiredBy || Number.isNaN(new Date(form.requiredBy).getTime())) {
      return setError("Please choose when the blood is required.");
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/requests", {
        bloodGroup: form.bloodGroup,
        hospitalName: form.hospitalName.trim(),
        patientName: form.patientName.trim() || user?.name,
        unitsRequired: form.unitsRequired,
        urgency: form.urgency,
        requiredBy: new Date(form.requiredBy).toISOString(),
        city: user?.city,
        area: user?.area,
        contactPhone: user?.phone,
      });
      onCreated(data.request);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-6 text-2xl font-extrabold text-gray-900">{heading}</h2>

      <div className="mb-5 grid grid-cols-4 gap-2 sm:gap-3">
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            type="button"
            onClick={() => setField("bloodGroup", bg)}
            aria-pressed={form.bloodGroup === bg}
            className={`rounded-xl border-2 py-3 text-sm font-bold transition-colors ${
              form.bloodGroup === bg
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-gray-200 text-gray-900 hover:bg-gray-50"
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hospitalName" className="mb-1 block text-sm text-gray-600">
            Hospital Name
          </label>
          <input
            id="hospitalName"
            type="text"
            value={form.hospitalName}
            onChange={(e) => setField("hospitalName", e.target.value)}
            placeholder="ABC Hospital"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="requiredBy" className="mb-1 block text-sm text-gray-600">
            Required Date
          </label>
          <input
            id="requiredBy"
            type="datetime-local"
            min={minDateTime}
            value={form.requiredBy}
            onChange={(e) => setField("requiredBy", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="patientName" className="mb-1 block text-sm text-gray-600">
            Patient Name
          </label>
          <input
            id="patientName"
            type="text"
            value={form.patientName}
            onChange={(e) => setField("patientName", e.target.value)}
            placeholder="Rahul Sharma"
            className={inputClass}
          />
        </div>
        <div>
          <span className="mb-1 block text-sm text-gray-600">Units Required</span>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-2 py-1.5">
            <button
              type="button"
              onClick={() => changeUnits(-1)}
              aria-label="Fewer units"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold text-gray-900">{form.unitsRequired}</span>
            <button
              type="button"
              onClick={() => changeUnits(1)}
              aria-label="More units"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <p className="mb-2 text-sm text-gray-600">Urgency</p>
      <div className="mb-6 grid grid-cols-1 gap-2 min-[360px]:grid-cols-3 sm:gap-3">
        {URGENCY_LEVELS.map((level) => {
          const style = URGENCY_OPTION_STYLES[level];
          const selected = form.urgency === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setField("urgency", level)}
              aria-pressed={selected}
              className={`flex items-center justify-center gap-1 rounded-xl border px-1 py-3 text-[11px] font-semibold transition-colors min-[400px]:text-xs sm:gap-2 sm:text-sm ${
                selected ? style.selected : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${style.dot}`} />
              {level}
            </button>
          );
        })}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
