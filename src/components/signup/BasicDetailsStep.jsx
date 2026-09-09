import React, { memo, useCallback, useState } from "react";

// Each step owns its own local field state and only reports up to the
// wizard on submit — keystrokes here never re-render the parent wizard
// or the other (unmounted) steps.
function BasicDetailsStep({ initialValues, onContinue }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!values.name.trim() || !values.phone.trim() || !values.password.trim()) {
        setError("Full name, mobile number and password are required.");
        return;
      }
      if (values.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      setError("");
      onContinue(values);
    },
    [values, onContinue]
  );

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Basic Details</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={values.name}
            onChange={handleChange}
            placeholder="Rahul Sharma"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={values.phone}
              onChange={handleChange}
              placeholder="98765 43210"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="rahul@email.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={values.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />
          <p className="text-xs text-gray-400 mt-1">You'll use this to login next time.</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <button
        type="submit"
        className="w-full mt-6 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Continue
      </button>
    </form>
  );
}

export default memo(BasicDetailsStep);
