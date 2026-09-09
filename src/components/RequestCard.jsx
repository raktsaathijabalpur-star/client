import React, { memo } from "react";
import { MapPin, Building2 } from "lucide-react";
import { URGENCY_STYLES } from "../utils/constants.js";

// Presentational, memoized so the whole requests grid doesn't re-render
// when only one card's local state (e.g. "helping" status) changes.
function RequestCard({ request, onViewRequest, onHelp, isHelping }) {
  const style = URGENCY_STYLES[request.urgency] || URGENCY_STYLES.Normal;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${style.border} p-5 shadow-sm flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-semibold ${style.text}`}>{request.urgency}</span>
          {request.distanceKm !== undefined && (
            <span className="text-sm text-gray-400">{request.distanceKm} km away</span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-extrabold text-gray-900">{request.bloodGroup}</span>
          <span className="text-gray-600">{request.unitsRequired} Units Required</span>
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-1 mt-2">
          <Building2 size={14} />
          <span>{request.hospitalName}</span>
          <span className="mx-1">·</span>
          <MapPin size={14} />
          <span>{request.area || request.city}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={() => onViewRequest(request)}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          View Request
        </button>
        <button
          type="button"
          onClick={() => onHelp(request)}
          disabled={isHelping}
          className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {isHelping ? "Thank you!" : "I Can Help"}
        </button>
      </div>
    </div>
  );
}

export default memo(RequestCard);
