import React, { memo, useEffect, useState } from "react";
import { Building2, MapPin, Clock, Phone, Copy, Check } from "lucide-react";
import Modal from "./Modal.jsx";
import { REQUEST_STATUS_STYLES, URGENCY_STYLES } from "../utils/constants.js";
import { formatDate, formatRequiredBy, requestStatusLabel } from "../utils/format.js";

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <Icon size={16} className="shrink-0 text-brand-500" />
      <span>{children}</span>
    </div>
  );
}

function CopyableId({ value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // clipboard not available (e.g. non-https) — ignore
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 font-mono text-xs text-gray-700"
      title="Copy request ID"
    >
      {value}
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
}

// Same modal for both roles. What it shows depends on `request.isOwner`:
//   patient (owner) -> request ID, accepted donors, Mark as Fulfilled / Cancel
//   donor           -> I Can Donate (+ the patient's phone once they've accepted)
function DetailBody({ request, onClose, actions }) {
  const urgency = URGENCY_STYLES[request.urgency] || URGENCY_STYLES.Normal;
  const statusStyle = REQUEST_STATUS_STYLES[request.status] || REQUEST_STATUS_STYLES.Open;
  const isActive = request.status === "Open" || request.status === "Accepted";
  const helpers = request.helpers ?? [];

  // Owner: which accepted donors actually donated (all ticked by default)
  const helperIdsKey = helpers.map((h) => h.user?._id).join(",");
  const [donatedIds, setDonatedIds] = useState(
    () => new Set(helpers.map((h) => h.user?._id).filter(Boolean))
  );
  useEffect(() => {
    setDonatedIds(new Set(helpers.map((h) => h.user?._id).filter(Boolean)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helperIdsKey]);

  const toggleDonor = (id) =>
    setDonatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleFulfill = async () => {
    if (
      helpers.length === 0 &&
      !window.confirm("No donor has accepted this request yet. Mark it as fulfilled anyway?")
    ) {
      return;
    }
    await actions.fulfill(request, [...donatedIds]);
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this blood request?")) return;
    await actions.cancel(request);
  };

  const mismatch = request.bloodMatch === false;

  return (
    <Modal title="Request Details" showBack onClose={onClose}>
      <h3 className="mb-3 text-2xl font-extrabold text-gray-900">
        {request.bloodGroup} Blood Required
      </h3>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${urgency.chip}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${urgency.dot}`} />
          {request.urgency}
        </span>
        {request.isOwner && request.requestId && <CopyableId value={request.requestId} />}
      </div>

      <div className="mb-4 space-y-2.5 rounded-2xl border border-gray-200 p-4">
        <p className="text-lg font-bold text-gray-900">
          {request.unitsRequired} Unit{request.unitsRequired === 1 ? "" : "s"}
        </p>
        <InfoRow icon={Building2}>{request.hospitalName}</InfoRow>
        <InfoRow icon={MapPin}>
          {request.area ? `${request.area}, ` : ""}
          {request.city}
        </InfoRow>
        {request.requiredBy && (
          <InfoRow icon={Clock}>Required {formatRequiredBy(request.requiredBy)}</InfoRow>
        )}
        {request.contactPhone && (
          <InfoRow icon={Phone}>
            <a href={`tel:${request.contactPhone}`} className="font-semibold text-brand-600">
              {request.contactPhone}
            </a>
          </InfoRow>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm font-bold text-gray-900">Patient</p>
        <p className="text-sm text-gray-500">{request.patientName}</p>
        {request.notes && <p className="mt-1 text-sm text-gray-500">{request.notes}</p>}
      </div>

      <div className={`mb-4 rounded-lg py-2.5 text-center text-sm font-semibold ${statusStyle}`}>
        {requestStatusLabel(request)}
      </div>

      {/* ---------------- patient (owner) view ---------------- */}
      {request.isOwner && helpers.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-bold text-gray-900">Donors who accepted</p>
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
            {helpers.map((h) => {
              const donor = h.user;
              if (!donor) return null;
              return (
                <li key={donor._id} className="flex items-center gap-3 px-4 py-3">
                  {isActive && (
                    <input
                      type="checkbox"
                      checked={donatedIds.has(donor._id)}
                      onChange={() => toggleDonor(donor._id)}
                      aria-label={`${donor.name} donated`}
                      className="h-4 w-4 accent-red-600"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{donor.name}</p>
                    <p className="text-xs text-gray-500">
                      {donor.bloodGroup} · {donor.area || donor.city}
                    </p>
                  </div>
                  {donor.phone && (
                    <a
                      href={`tel:${donor.phone}`}
                      className="shrink-0 text-xs font-semibold text-brand-600"
                    >
                      {donor.phone}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          {isActive && (
            <p className="mt-2 text-xs text-gray-400">
              Tick the donors who actually donated — only they are added to their donation history.
            </p>
          )}
        </div>
      )}

      {request.isOwner && isActive && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleFulfill}
            disabled={actions.busy}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
          >
            Mark Request as Fulfilled
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={actions.busy}
            className="w-full rounded-xl py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-60"
          >
            Cancel Request
          </button>
        </div>
      )}

      {request.isOwner && request.status === "Fulfilled" && (
        <p className="text-center text-sm text-gray-500">
          Fulfilled on {formatDate(request.fulfilledAt)}
        </p>
      )}
      {request.isOwner && request.status === "Cancelled" && (
        <p className="text-center text-sm text-gray-500">
          Cancelled on {formatDate(request.cancelledAt)}
        </p>
      )}

      {/* ---------------- donor view ---------------- */}
      {!request.isOwner && isActive && !request.hasHelped && (
        <button
          type="button"
          onClick={() => actions.accept(request)}
          disabled={actions.busy || mismatch}
          className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {mismatch ? "Your blood group can't donate to this patient" : "I Can Donate"}
        </button>
      )}

      {!request.isOwner && request.hasHelped && isActive && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Thank you! The patient has been notified. Please call them on the number above
          to coordinate.
        </p>
      )}
    </Modal>
  );
}

function RequestDetailModal({ request, onClose, actions }) {
  if (!request) return null;
  return <DetailBody request={request} onClose={onClose} actions={actions} />;
}

export default memo(RequestDetailModal);
