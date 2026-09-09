import React, { memo } from "react";
import { X, Phone, Building2, MapPin, Droplet } from "lucide-react";
import { URGENCY_STYLES } from "../utils/constants.js";

function RequestDetailModal({ request, onClose, onHelp, isHelping }) {
  if (!request) return null;
  const style = URGENCY_STYLES[request.urgency] || URGENCY_STYLES.Normal;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <span className={`text-sm font-semibold ${style.text}`}>{request.urgency}</span>
        <h2 className="text-xl font-extrabold mt-1 mb-4">{request.patientName}</h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Droplet size={16} className="text-brand-500" />
            <span className="font-semibold">{request.bloodGroup}</span>
            <span className="text-gray-500">· {request.unitsRequired} units required</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-brand-500" />
            <span>{request.hospitalName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-brand-500" />
            <span>{request.area ? `${request.area}, ` : ""}{request.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-brand-500" />
            <span>{request.contactPhone}</span>
          </div>
          {request.notes && (
            <p className="text-gray-500 pt-2 border-t border-gray-100">{request.notes}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onHelp(request)}
          disabled={isHelping}
          className="w-full mt-6 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {isHelping ? "Thank you for helping!" : "I Can Help"}
        </button>
      </div>
    </div>
  );
}

export default memo(RequestDetailModal);
