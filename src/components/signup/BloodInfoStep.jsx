import React, { memo, useCallback, useState } from "react";
import { BLOOD_GROUPS } from "../../utils/constants.js";

function BloodInfoStep({ initialValues, onContinue }) {
  const [bloodGroup, setBloodGroup] = useState(initialValues.bloodGroup);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!bloodGroup) {
        setError("Please select your blood group to continue.");
        return;
      }
      setError("");
      onContinue({ bloodGroup });
    },
    [bloodGroup, onContinue]
  );

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Blood Information</h2>
      <p className="text-gray-500 text-sm mb-6">What&apos;s your blood group?</p>

      <div className="grid grid-cols-4 gap-3">
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            type="button"
            onClick={() => setBloodGroup(bg)}
            className={`aspect-square rounded-xl border flex items-center justify-center font-bold text-lg transition-colors ${
              bloodGroup === bg
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-gray-200 text-gray-800 hover:bg-gray-50"
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <button
        type="submit"
        className="w-full mt-6 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Continue
      </button>
    </form>
  );
}

export default memo(BloodInfoStep);
