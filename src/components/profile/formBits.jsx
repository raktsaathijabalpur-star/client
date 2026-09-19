import React from "react";

export const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500";

export function TextField({ id, label, hint, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-gray-600">
        {label}
      </label>
      <input id={id} className={inputClass} {...inputProps} />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function SelectField({ id, label, children, ...selectProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-gray-600">
        {label}
      </label>
      <select id={id} className={inputClass} {...selectProps}>
        {children}
      </select>
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-red-600">
      {message}
    </p>
  );
}

export function SaveButton({ saving, children = "Save changes", savingLabel = "Saving..." }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
    >
      {saving ? savingLabel : children}
    </button>
  );
}

// iOS-style on/off switch with a title and a one-line explanation
export function ToggleRow({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          checked ? "bg-brand-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
