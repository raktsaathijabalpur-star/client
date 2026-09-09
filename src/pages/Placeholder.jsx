import React, { memo } from "react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";

function Placeholder({ title }) {
  return (
    <div>
      <DashboardTopbar title={title} hasNotification={false} />
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
        {title} coming soon.
      </div>
    </div>
  );
}

export default memo(Placeholder);
