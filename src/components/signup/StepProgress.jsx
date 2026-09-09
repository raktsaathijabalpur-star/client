import React, { memo } from "react";
import { ArrowLeft } from "lucide-react";

// Pure/presentational: re-renders only when step/total actually change.
function StepProgress({ step, totalSteps, onBack }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="text-gray-500 hover:text-gray-800 shrink-0"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1 flex gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-brand-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(StepProgress);
