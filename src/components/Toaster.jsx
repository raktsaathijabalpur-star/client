import React from "react";
import { Heart } from "lucide-react";
import useNotificationStore from "../store/notificationStore.js";

// Dark pop-ups at the bottom-left (same look as the design's
// "Neha Joshi just donated ₹250…" toast). Click one to dismiss it.
export default function Toaster() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[60] flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          role="status"
          onClick={() => dismissToast(toast.id)}
          className="flex items-start gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-left text-white shadow-lg"
        >
          <Heart
            size={18}
            className={`mt-0.5 shrink-0 ${
              toast.type === "error" ? "text-amber-400" : "fill-red-500 text-red-500"
            }`}
          />
          <span className="text-sm leading-snug">{toast.message}</span>
        </button>
      ))}
    </div>
  );
}
