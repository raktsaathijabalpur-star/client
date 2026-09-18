import React, { memo } from "react";
import { Building2, Clock } from "lucide-react";
import { REQUEST_STATUS_STYLES, URGENCY_STYLES } from "../../utils/constants.js";
import { formatRequiredBy, requestStatusLabel } from "../../utils/format.js";

// One row/card in "Your Active Requests", "History" and "Accepted by me".
// The whole card is clickable and opens the request detail modal.
function MyRequestCard({ request, onView }) {
  const urgency = URGENCY_STYLES[request.urgency] || URGENCY_STYLES.Normal;
  const statusStyle = REQUEST_STATUS_STYLES[request.status] || REQUEST_STATUS_STYLES.Open;

  return (
    <button
      type="button"
      onClick={() => onView(request)}
      className={`w-full rounded-2xl border border-l-4 border-gray-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-gray-300 ${urgency.border}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={`flex items-center gap-2 text-sm font-semibold ${urgency.text}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${urgency.dot}`} />
          {request.urgency}
        </span>
        {request.requestId && (
          <span className="font-mono text-xs text-gray-400">{request.requestId}</span>
        )}
      </div>

      <p className="text-xl font-extrabold text-gray-900">{request.bloodGroup} Blood Required</p>

      <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <span>
          {request.unitsRequired} Unit{request.unitsRequired === 1 ? "" : "s"}
        </span>
        <span className="mx-1">·</span>
        <Building2 size={14} />
        <span>{request.hospitalName}</span>
        {request.requiredBy && (
          <>
            <span className="mx-1">·</span>
            <Clock size={14} />
            <span>{formatRequiredBy(request.requiredBy)}</span>
          </>
        )}
      </div>

      <div
        className={`mt-4 rounded-lg py-2 text-center text-sm font-semibold ${statusStyle}`}
      >
        {requestStatusLabel(request)}
      </div>
    </button>
  );
}

export default memo(MyRequestCard);
