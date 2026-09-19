import React, { memo } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, Droplet, History, LayoutDashboard, ShieldCheck } from "lucide-react";
import Avatar from "./Avatar.jsx";
import useAuthStore from "../store/authStore.js";

// The admin panel has its own small menu: no Home / Donations / Top Donors here.
const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/support", label: "Verify Donations", icon: ShieldCheck },
  { to: "/admin/history", label: "Contribution History", icon: History },
];

function AdminSidebar({ variant = "desktop", onNavigate }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const shell =
    variant === "drawer"
      ? "flex h-full w-full flex-col justify-between bg-white"
      : "sticky top-0 flex h-screen w-72 shrink-0 flex-col justify-between border-r border-gray-200 bg-white";

  return (
    <aside className={shell}>
      <div className="min-h-0 overflow-y-auto">
        <div className="flex items-center gap-2 px-6 py-6">
          <Droplet className="fill-brand-500 text-brand-500" size={26} />
          <div>
            <p className="text-lg font-extrabold leading-none">Blood Seva</p>
            <p className="text-[11px] font-semibold tracking-wide text-brand-500">ADMIN PANEL</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4 pb-6">
        <Link
          to="/home"
          onClick={onNavigate}
          className="mb-3 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to app
        </Link>

        <div className="flex items-center gap-3 px-2 py-3">
          <Avatar user={user} size={36} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.name || "Admin"}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default memo(AdminSidebar);
