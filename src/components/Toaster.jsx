import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import useNotificationStore from "../store/notificationStore.js";

// Dark pop-ups at the bottom-left. Click one to open what it is about
// (when it has a link) — it is dismissed either way.
export default function Toaster() {
  const navigate = useNavigate();
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);
  const markRead = useNotificationStore((s) => s.markRead);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[60] flex max-w-[calc(100vw-3rem)] flex-col gap-3 sm:max-w-sm">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          role="status"
          onClick={() => {
            dismissToast(toast.id);
            if (toast.notificationId) markRead([toast.notificationId]); // you've seen it
            if (toast.link) navigate(toast.link);
          }}
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
