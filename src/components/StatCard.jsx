import React, { memo } from "react";

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center justify-center text-center shadow-sm">
      {icon}
      <div className="text-2xl font-extrabold text-gray-900 mt-1">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export default memo(StatCard);
