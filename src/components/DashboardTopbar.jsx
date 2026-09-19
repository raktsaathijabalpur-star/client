import React, { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Droplet, Heart, HeartHandshake, IndianRupee, MessageCircle, X } from "lucide-react";
import useNotificationStore from "../store/notificationStore.js";
import { PageLoader } from "./Spinner.jsx";
import { formatTimeAgo } from "../utils/format.js";

// icon + colours per notification type
const TYPE_META = {
  "request:new": { icon: Droplet, style: "bg-brand-50 text-brand-500" },
  "request:accepted": { icon: HeartHandshake, style: "bg-green-50 text-green-600" },
  "request:fulfilled": { icon: Heart, style: "bg-red-50 text-red-500" },
  "request:cancelled": { icon: X, style: "bg-gray-100 text-gray-500" },
  message: { icon: MessageCircle, style: "bg-blue-50 text-blue-600" },
  "support:verified": { icon: IndianRupee, style: "bg-green-50 text-green-600" },
  "support:new": { icon: IndianRupee, style: "bg-amber-50 text-amber-600" },
};

function DashboardTopbar({ title }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loading = useNotificationStore((s) => s.loadingNotifications && !s.notificationsLoaded);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const clearAll = useNotificationStore((s) => s.clearAll);

  // click a notification: mark it read and go to what it is about
  const openItem = (n) => {
    markRead([n._id]);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative mb-4 flex items-center justify-between gap-3 sm:mb-6">
      <h1 className="min-w-0 truncate text-xl font-extrabold text-gray-900 sm:text-2xl">{title}</h1>

      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white"
      >
        <Bell size={18} className="text-brand-500" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-12 z-40 w-[24rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                    {unreadCount} new
                  </span>
                )}
              </p>
              <div className="flex shrink-0 items-center gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-brand-600 disabled:text-gray-300"
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="text-gray-500 hover:text-gray-800 disabled:text-gray-300"
                >
                  Clear all
                </button>
              </div>
            </div>

            {loading ? (
              <PageLoader label="Loading notifications" className="py-8" />
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">You're all caught up.</p>
            ) : (
              <ul className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
                {notifications.map((n) => {
                  const meta = TYPE_META[n.type] ?? TYPE_META["request:new"];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={n._id}
                      data-unread={!n.read}
                      className={`flex items-start gap-2 pr-2 ${n.read ? "" : "bg-brand-50/40"}`}
                    >
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.style}`}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">{n.title}</span>
                            {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                          </span>
                          <span className="mt-0.5 block break-words text-xs text-gray-600">{n.body}</span>
                          <span className="mt-1 block text-[11px] text-gray-400">
                            {formatTimeAgo(n.createdAt)}
                            {n.count > 1 && ` · ${n.count} new`}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeNotification(n._id)}
                        aria-label="Dismiss notification"
                        className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default memo(DashboardTopbar);
