import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import {
  Droplet,
  Home,
  Heart,
  Trophy,
  Users,
  MessageCircle,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";

const DONOR_NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/requests", label: "Requests", icon: Droplet },
  { to: "/donations", label: "Donations", icon: Heart },
  { to: "/top-donors", label: "Top Donors", icon: Trophy },
  { to: "/supporters", label: "Supporters", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

const PATIENT_NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/requests", label: "My Requests", icon: Droplet },
  { to: "/supporters", label: "Supporters", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

// variant="desktop" -> the fixed left column (shown from the `lg` breakpoint up)
// variant="drawer"  -> the same content inside the slide-in menu on phones / tablets
function Sidebar({ variant = "desktop", onNavigate }) {
  // Separate selectors: this component re-renders when `user` changes
  // (name/bloodGroup edits) but not when unrelated store fields update.
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const baseNav = user?.role === "patient" ? PATIENT_NAV : DONOR_NAV;
  // admins get one extra entry: confirm reported donations
  const navItems = user?.isAdmin
    ? [...baseNav, { to: "/admin/support", label: "Verify Donations", icon: ShieldCheck }]
    : baseNav;

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
            <p className="text-lg font-extrabold leading-none">RaktSaathi</p>
            <p className="text-[11px] font-semibold tracking-wide text-brand-500">JABALPUR</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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
        <div className="flex items-center gap-3 px-2 py-3">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
              {user?.name?.slice(0, 2).toUpperCase() || "U"}
            </div>
          )}
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.name || "Guest"}</p>
            <p className="truncate text-xs text-gray-500">
              {user?.bloodGroup} · {user?.area || user?.city}
            </p>
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

export default memo(Sidebar);
