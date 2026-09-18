import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import Modal from "../Modal.jsx";

// "Request Submitted" popup with the unique request ID (REQ-2026-000124)
export default function RequestSubmittedModal({ request, onView, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(request.requestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // clipboard not available — ignore
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="flex flex-col items-center px-2 py-4 text-center">
        <span className="mb-4 text-6xl" role="img" aria-label="Heart">
          ❤️
        </span>
        <h2 className="text-2xl font-extrabold text-gray-900">Request Submitted</h2>
        <p className="mt-2 text-sm text-gray-500">
          We've started looking for matching donors near you.
        </p>

        <button
          type="button"
          onClick={copy}
          title="Copy request ID"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-mono text-sm text-gray-800"
        >
          {request.requestId}
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>

        <button
          type="button"
          onClick={onView}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
        >
          View Request
        </button>
      </div>
    </Modal>
  );
}
