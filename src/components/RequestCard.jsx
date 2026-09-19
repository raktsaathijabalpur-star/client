import React, { memo } from "react";
import { MapPin, Building2, Clock } from "lucide-react";
import ContactActions from "./ContactActions.jsx";
import useAuthStore from "../store/authStore.js";
import { URGENCY_STYLES } from "../utils/constants.js";
import { formatRequiredBy } from "../utils/format.js";
import { donorToPatientMessage } from "../utils/contact.js";

// Card used in the DONOR feed (Home + Requests).
// Before accepting: [View Request] [I Can Help]
// After accepting:  [View Request] [WhatsApp] [Chat]
// "Accepted" comes from the server (`request.hasHelped`), so it survives a refresh.
function RequestCard({ request, onView, onAccept, busy = false }) {
  const donorName = useAuthStore((state) => state.user?.name);
  const style = URGENCY_STYLES[request.urgency] || URGENCY_STYLES.Normal;
  const mismatch = request.bloodMatch === false;
  const closed = request.status !== "Open" && request.status !== "Accepted";

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${style.border}`}
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className={`text-sm font-semibold ${style.text}`}>{request.urgency}</span>
          {request.distanceKm !== undefined && (
            <span className="text-sm text-gray-400">{request.distanceKm} km away</span>
          )}
        </div>

        <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-extrabold text-gray-900">{request.bloodGroup}</span>
          <span className="text-gray-600">
            {request.unitsRequired} Unit{request.unitsRequired === 1 ? "" : "s"} Required
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Building2 size={14} className="shrink-0" />
          <span>{request.hospitalName}</span>
          <span className="mx-1">·</span>
          <MapPin size={14} className="shrink-0" />
          <span>{request.area || request.city}</span>
        </div>

        {request.requiredBy && (
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Clock size={14} className="shrink-0" />
            <span>Required {formatRequiredBy(request.requiredBy)}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onView(request)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
        >
          View Request
        </button>

        {request.hasHelped ? (
          <ContactActions
            phone={request.contactPhone}
            userId={request.requestedBy?._id}
            name={request.patientName}
            whatsappText={donorToPatientMessage(request, donorName)}
          />
        ) : (
          <button
            type="button"
            onClick={() => onAccept(request)}
            disabled={busy || mismatch || closed}
            title={mismatch ? "Your blood group can't donate to this patient" : undefined}
            className="h-10 min-w-0 flex-1 rounded-lg bg-brand-500 px-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {mismatch ? "Not a match" : "I Can Help"}
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(RequestCard);
