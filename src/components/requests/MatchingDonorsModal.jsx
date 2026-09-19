import React from "react";
import { MessageCircle } from "lucide-react";
import Modal from "../Modal.jsx";
import useOpenChat from "../../hooks/useOpenChat.js";

// List of potential donors for a patient's request, with a "Message" button
// that opens (or creates) an in-app chat with that donor.
export default function MatchingDonorsModal({ donors, onClose }) {
  const { openChat, busyId } = useOpenChat();

  return (
    <Modal title="Matching Donors" onClose={onClose}>
      {donors.length === 0 ? (
        <p className="text-sm text-gray-500">
          No matching donors are available right now. We'll keep looking.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
          {donors.map((donor) => (
            <li key={donor._id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                {donor.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{donor.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {donor.bloodGroup} · {donor.area || donor.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openChat(donor._id)}
                disabled={busyId === donor._id}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-60"
              >
                <MessageCircle size={14} />
                Message
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
