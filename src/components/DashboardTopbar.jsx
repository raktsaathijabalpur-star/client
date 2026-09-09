import React, { memo } from "react";
import { Bell } from "lucide-react";

function DashboardTopbar({ title, hasNotification = true }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
      <button
        type="button"
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center"
      >
        <Bell size={18} className="text-brand-500" />
        {hasNotification && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>
    </div>
  );
}

export default memo(DashboardTopbar);
