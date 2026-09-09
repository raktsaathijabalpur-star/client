import React, { memo, useCallback, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import useCurrentLocation from "../../hooks/useCurrentLocation.js";

function LocationStep({ initialValues, onContinue, submitting }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const { locate, locating, error: locationError } = useCurrentLocation();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const result = await locate();
      setValues((prev) => ({
        ...prev,
        city: result.city || prev.city,
        state: result.state || prev.state,
        area: result.area || prev.area,
        pincode: result.pincode || prev.pincode,
      }));
    } catch (err) {
      // error is already surfaced via the hook's `error` state
    }
  }, [locate]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!values.city.trim() || !values.state.trim()) {
        setError("City and state are required.");
        return;
      }
      setError("");
      onContinue(values);
    },
    [values, onContinue]
  );

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Where are you located?</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm text-gray-700 mb-1">City</label>
            <input
              id="city"
              name="city"
              type="text"
              required
              value={values.city}
              onChange={handleChange}
              placeholder="Raipur"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm text-gray-700 mb-1">State</label>
            <input
              id="state"
              name="state"
              type="text"
              required
              value={values.state}
              onChange={handleChange}
              placeholder="Chhattisgarh"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="area" className="block text-sm text-gray-700 mb-1">Area</label>
            <input
              id="area"
              name="area"
              type="text"
              value={values.area}
              onChange={handleChange}
              placeholder="Shankar Nagar"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="pincode" className="block text-sm text-gray-700 mb-1">PIN</label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              value={values.pincode}
              onChange={handleChange}
              placeholder="492001"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-60"
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          {locating ? "Locating you..." : "Use my current location"}
        </button>
        {locationError && <p className="text-xs text-red-600">{locationError}</p>}
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-6 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
      >
        {submitting ? "Creating account..." : "Continue"}
      </button>
    </form>
  );
}

export default memo(LocationStep);
