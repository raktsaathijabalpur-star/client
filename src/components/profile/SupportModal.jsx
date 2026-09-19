import React, { useState } from "react";
import { Check, Copy, Landmark, QrCode } from "lucide-react";
import Modal from "../Modal.jsx";
import api from "../../api/axios.js";
import useNotificationStore from "../../store/notificationStore.js";
import { SUPPORT_ACCOUNT, isSupportAccountConfigured } from "../../config/support.js";

const PRESETS = [100, 500, 1000];
const MAX_AMOUNT = 1000000;

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // clipboard not available — ignore
    }
  };
  return (
    <button type="button" onClick={copy} aria-label="Copy" className="ml-2 text-gray-400 hover:text-gray-700">
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
}

function DetailRow({ label, value, copyable = false }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="flex items-center font-semibold text-gray-900">
        {value}
        {copyable && <CopyButton value={value} />}
      </span>
    </div>
  );
}

// "Support Jabalpur Blood Seva" — amount chips, Bank Transfer / QR Code, "I've Donated"
export default function SupportModal({ onClose }) {
  const pushToast = useNotificationStore((state) => state.pushToast);

  const [preset, setPreset] = useState(null);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("bank");
  const [showName, setShowName] = useState(true); // "Show my name on the Supporters page"
  const [qrMissing, setQrMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amount = custom !== "" ? Number(custom) : preset;
  const amountValid = Number.isInteger(amount) && amount >= 1 && amount <= MAX_AMOUNT;

  const choosePreset = (value) => {
    setPreset(value);
    setCustom("");
  };

  const changeCustom = (e) => {
    setCustom(e.target.value.replace(/\D/g, "").slice(0, 7)); // digits only
    setPreset(null);
  };

  const handleDonated = async () => {
    if (!amountValid) {
      setError("Please choose or enter an amount first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/support", { amount, method, showName });
      pushToast(data.message || "Thank you for your support!", { type: "success", duration: 7000 });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't record your contribution. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Support Jabalpur Blood Seva" onClose={onClose} maxWidth="max-w-lg">
      <p className="mb-5 text-center text-sm text-gray-500">
        Your kindness just helped someone. Consider supporting Jabalpur Blood Seva so we can keep
        connecting donors and patients for free.
      </p>

      <p className="mb-2 text-sm text-gray-600">Choose an amount</p>
      <div className="mb-3 grid grid-cols-3 gap-3">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => choosePreset(value)}
            aria-pressed={preset === value}
            className={`rounded-xl border-2 py-3.5 text-sm font-bold transition-colors ${
              preset === value
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-gray-200 text-gray-900 hover:bg-gray-50"
            }`}
          >
            ₹{value.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      <input
        type="text"
        inputMode="numeric"
        value={custom}
        onChange={changeCustom}
        placeholder="Enter custom amount (₹)"
        aria-label="Custom amount in rupees"
        className="mb-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { value: "bank", label: "Bank Transfer", icon: Landmark },
          { value: "qr", label: "QR Code", icon: QrCode },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMethod(value)}
            aria-pressed={method === value}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
              method === value
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-gray-200 text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {!isSupportAccountConfigured ? (
        <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bank details haven't been added yet. Please add them in <code>src/config/support.js</code>.
        </p>
      ) : (
        <div className="mb-5 rounded-2xl border border-gray-200 px-5 py-3">
          {method === "bank" ? (
            <>
              <DetailRow label="Account Name" value={SUPPORT_ACCOUNT.name} />
              <DetailRow label="Account Number" value={SUPPORT_ACCOUNT.number} copyable />
              <DetailRow label="IFSC Code" value={SUPPORT_ACCOUNT.ifsc} copyable />
            </>
          ) : qrMissing ? (
            <p className="py-6 text-center text-sm text-gray-500">
              QR code isn't available right now. Please use Bank Transfer.
            </p>
          ) : (
            <div className="flex flex-col items-center py-2">
              <img
                src={SUPPORT_ACCOUNT.qrImage}
                alt="QR code to support Jabalpur Blood Seva"
                onError={() => setQrMissing(true)}
                className="h-44 w-44 object-contain"
              />
              <p className="mt-2 text-xs text-gray-500">Scan with any UPI app</p>
            </div>
          )}
        </div>
      )}

      <label className="mb-4 flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={showName}
          onChange={(e) => setShowName(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-red-600"
        />
        Show my name on the Supporters page (otherwise I appear as "Anonymous supporter")
      </label>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleDonated}
        disabled={submitting || !amountValid}
        className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : amountValid ? `I've Donated ₹${amount.toLocaleString("en-IN")}` : "I've Donated"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-800"
      >
        Skip for now
      </button>
    </Modal>
  );
}
