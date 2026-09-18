import React, { memo, useState } from "react";
import { Bell } from "lucide-react";
import useNotificationStore from "../store/notificationStore.js";

function DashboardTopbar({ title }) {
  const [open, setOpen] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const toggle = () => {
    if (!open) markAllRead();
    setOpen(!open);
  };

  return (
    <div className="relative mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>

      <button
        type="button"
        aria-label="Notifications"
        onClick={toggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"
      >
        <Bell size={18} className="text-brand-500" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <p className="border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-900">
              Notifications
            </p>
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500">You're all caught up.</p>
            ) : (
              <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default memo(DashboardTopbar);
