import React, { memo, useCallback, useRef, useState } from "react";

const GENDERS = ["Male", "Female", "Other"];

function PersonalDetailsStep({ initialValues, onContinue }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDateChange = useCallback((e) => {
    setValues((prev) => ({ ...prev, dateOfBirth: e.target.value }));
  }, []);

  const handleGenderSelect = useCallback((gender) => {
    setValues((prev) => ({ ...prev, gender }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setValues((prev) => ({ ...prev, avatarFile: file, avatarPreview: previewUrl }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setError("");
      onContinue(values);
    },
    [values, onContinue]
  );

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Personal Details</h2>

      <div className="flex flex-col items-center mb-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-center text-xs text-gray-500 overflow-hidden bg-gray-50 hover:border-brand-400 transition-colors"
        >
          {values.avatarPreview ? (
            <img src={values.avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <span className="px-2 leading-tight">
              Add photo
              <br />
              (optional)
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-gray-500 mt-2"
        >
          or <span className="underline">browse files</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="dob" className="block text-sm text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            value={values.dateOfBirth}
            onChange={handleDateChange}
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          />
        </div>

        <div>
          <p className="block text-sm text-gray-700 mb-1">Gender</p>
          <div className="grid grid-cols-3 gap-3">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGenderSelect(g)}
                className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                  values.gender === g
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
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

export default memo(PersonalDetailsStep);
