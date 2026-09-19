import React, { useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";

// Generic centered modal: dark overlay, white card, Esc / outside-click to close.
// Pass `title` for the "← Title  ✕" header used in the design; leave it out
// for a plain card with just a close button in the corner.
export default function Modal({ onClose, title, showBack = false, maxWidth = "max-w-md", children }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:max-h-[90vh] sm:p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBack && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Back"
                  className="text-gray-500 hover:text-gray-800"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
