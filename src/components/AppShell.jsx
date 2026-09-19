import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Droplet, Menu, X } from "lucide-react";
import Toaster from "./Toaster.jsx";
import useRealtime from "../hooks/useRealtime.js";

// The frame around every signed-in page: sidebar on desktop, top bar + slide-in menu on
// phones / tablets, pop-ups, and the live connection. Which sidebar to show is up to the caller:
//   <AppShell renderSidebar={(variant, onNavigate) => <Sidebar variant={variant} onNavigate={onNavigate} />} />
export default function AppShell({ renderSidebar, badge }) {
  useRealtime();

  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false); // close the menu after navigating
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden"; // don't scroll the page behind the menu
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f4f2f0] lg:flex">
      {/* Phones / tablets: slim top bar with the menu button */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Droplet className="fill-brand-500 text-brand-500" size={22} />
          <p className="text-base font-extrabold leading-none">
            RaktSaathi{" "}
            <span className="text-[10px] font-semibold tracking-wide text-brand-500">
              {badge ?? "JABALPUR"}
            </span>
          </p>
        </div>
        <span className="w-10" aria-hidden="true" />
      </header>

      {/* Desktop: fixed sidebar */}
      <div className="hidden lg:block">{renderSidebar("desktop")}</div>

      {/* Phones / tablets: slide-in menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMenu} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            {renderSidebar("drawer", closeMenu)}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
