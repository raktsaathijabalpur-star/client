import React from "react";
import { Loader2 } from "lucide-react";

// Small spinning circle (buttons, inline text)
export function Spinner({ size = 20, className = "" }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-brand-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// Centered spinner + label: use while a whole list / page section is loading
export function PageLoader({ label = "Loading", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-sm text-gray-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={34} className="animate-spin text-brand-500" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export default Spinner;
