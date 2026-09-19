import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Droplet, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import Toaster from "./Toaster.jsx";
import useAuthStore from "../store/authStore.js";
import useNotificationStore from "../store/notificationStore.js";
import useChatStore from "../store/chatStore.js";
import { getSocket } from "../utils/socket.js";
import { getUserId, isOwnMessage } from "../utils/chat.js";

export default function DashboardLayout() {
  const token = useAuthStore((state) => state.token);
  const myId = useAuthStore((state) => getUserId(state.user));
  const location = useLocation();

  // chats always belong to exactly one account
  useEffect(() => {
    if (myId) useChatStore.getState().bindToUser(myId);
  }, [myId]);

  // Phones / tablets: the sidebar becomes a slide-in menu opened from the top bar
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

  // Latest path, readable from the socket handlers below without re-subscribing
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  // Connect the socket as soon as the user is inside the app (not only on the
  // Messages page) so request / message events reach them wherever they are.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const { pushToast, addNotification, bumpRequests } = useNotificationStore.getState();

    // Profile -> Notifications: which pop-ups / bell alerts the user wants.
    // The request lists still refresh either way (bumpRequests) — only the alerts are muted.
    const prefs = () => useAuthStore.getState().user?.notificationPrefs ?? {};

    const announce = (title, body, type = "info", enabled = true) => {
      if (!enabled) return;
      addNotification({ title, body });
      pushToast(body, { type });
    };

    // patient: a donor pressed "I Can Donate"
    const onAccepted = ({ requestId, donor }) => {
      const who = donor?.name
        ? `${donor.name}${donor.bloodGroup ? ` (${donor.bloodGroup})` : ""}`
        : "A donor";
      announce(
        "Donor accepted",
        `${who} accepted your request ${requestId}`,
        "success",
        prefs().requestUpdates !== false
      );
      bumpRequests();
    };

    // donor: the patient closed a request I had accepted
    const onFulfilled = ({ requestId, credited }) => {
      announce(
        "Request fulfilled",
        credited
          ? `Request ${requestId} was fulfilled. Thank you for donating!`
          : `Request ${requestId} was marked as fulfilled.`,
        "info",
        prefs().requestUpdates !== false
      );
      bumpRequests();
      if (credited) useAuthStore.getState().fetchMe(); // refresh donation count / last donation
    };

    const onCancelled = ({ requestId }) => {
      announce(
        "Request cancelled",
        `Request ${requestId} was cancelled by the patient.`,
        "info",
        prefs().requestUpdates !== false
      );
      bumpRequests();
    };

    // donor: a new request that this donor's blood group can fulfil
    const onNewRequest = ({ bloodGroup, urgency, hospitalName }) => {
      bumpRequests();
      const me = useAuthStore.getState().user;
      if (me?.availableToDonate === false) return; // "Temporarily unavailable" -> no pop-up
      announce(
        "New blood request",
        `${urgency}: ${bloodGroup} needed at ${hospitalName}`,
        "info",
        prefs().newRequests !== false
      );
    };

    // someone sent me a chat message while I'm on another page
    const onMessage = ({ message }) => {
      if (isOwnMessage(message, useAuthStore.getState().user)) return;
      if (pathRef.current === "/messages") return; // the chat itself already shows it
      const text = String(message?.text ?? "");
      announce(
        "New message",
        `${message?.sender?.name ?? "Someone"}: ${text.length > 80 ? `${text.slice(0, 80)}…` : text}`
      );
    };

    // donor: the admin confirmed a contribution they reported from Profile -> Donate Now
    const onSupportVerified = ({ amount }) => {
      announce(
        "Contribution confirmed",
        `Thank you! Your ₹${Number(amount).toLocaleString("en-IN")} contribution to Jabalpur RaktSaathi was confirmed.`,
        "success"
      );
    };

    socket.on("request:accepted", onAccepted);
    socket.on("request:fulfilled", onFulfilled);
    socket.on("request:cancelled", onCancelled);
    socket.on("request:new", onNewRequest);
    socket.on("message:new", onMessage);
    socket.on("support:verified", onSupportVerified);

    return () => {
      socket.off("request:accepted", onAccepted);
      socket.off("request:fulfilled", onFulfilled);
      socket.off("request:cancelled", onCancelled);
      socket.off("request:new", onNewRequest);
      socket.off("message:new", onMessage);
      socket.off("support:verified", onSupportVerified);
    };
  }, [token]);

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
            RaktSaathi <span className="text-[10px] font-semibold tracking-wide text-brand-500">JABALPUR</span>
          </p>
        </div>
        <span className="w-10" aria-hidden="true" />
      </header>

      {/* Desktop: fixed sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

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
            <Sidebar variant="drawer" onNavigate={closeMenu} />
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
