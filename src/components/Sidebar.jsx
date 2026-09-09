import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import {
  Droplet,
  Home,
  Heart,
  Trophy,
  Users,
  MessageCircle,
  User as UserIcon,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/requests", label: "Requests", icon: Droplet },
  { to: "/donations", label: "Donations", icon: Heart },
  { to: "/top-donors", label: "Top Donors", icon: Trophy },
  { to: "/supporters", label: "Supporters", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

function Sidebar() {
  // Two separate selectors: this component re-renders when `user` changes
  // (name/bloodGroup edits) but not when unrelated store fields update.
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-72 shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <Droplet className="text-brand-500 fill-brand-500" size={26} />
          <div>
            <p className="font-extrabold text-lg leading-none">RaktSaathi</p>
            <p className="text-[11px] tracking-wide text-brand-500 font-semibold">JABALPUR</p>
          </div>
        </div>

        <nav className="px-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-gray-50"
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
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
            {user?.name?.slice(0, 2).toUpperCase() || "U"}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">{user?.name || "Guest"}</p>
            <p className="text-xs text-gray-500">
              {user?.bloodGroup} · {user?.area || user?.city}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg border border-gray-300 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
