import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Toaster from "./Toaster.jsx";
import useAuthStore from "../store/authStore.js";
import useNotificationStore from "../store/notificationStore.js";
import { getSocket } from "../utils/socket.js";

export default function DashboardLayout() {
  const token = useAuthStore((state) => state.token);

  // Connect the socket as soon as the user is inside the app (not only on the
  // Messages page) so request events reach them wherever they are.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const { pushToast, addNotification, bumpRequests } = useNotificationStore.getState();

    const announce = (title, body, type = "info") => {
      addNotification({ title, body });
      pushToast(body, { type });
    };

    // patient: a donor pressed "I Can Donate"
    const onAccepted = ({ requestId, donor }) => {
      const who = donor?.name
        ? `${donor.name}${donor.bloodGroup ? ` (${donor.bloodGroup})` : ""}`
        : "A donor";
      announce("Donor accepted", `${who} accepted your request ${requestId}`, "success");
      bumpRequests();
    };

    // donor: the patient closed a request I had accepted
    const onFulfilled = ({ requestId, credited }) => {
      announce(
        "Request fulfilled",
        credited
          ? `Request ${requestId} was fulfilled. Thank you for donating!`
          : `Request ${requestId} was marked as fulfilled.`
      );
      bumpRequests();
      if (credited) useAuthStore.getState().fetchMe(); // refresh donation count / last donation
    };

    const onCancelled = ({ requestId }) => {
      announce("Request cancelled", `Request ${requestId} was cancelled by the patient.`);
      bumpRequests();
    };

    // donor: a new request that this donor's blood group can fulfil
    const onNewRequest = ({ bloodGroup, urgency, hospitalName }) => {
      bumpRequests();
      const me = useAuthStore.getState().user;
      if (me?.availableToDonate === false) return; // "Temporarily unavailable" -> no pop-up
      announce("New blood request", `${urgency}: ${bloodGroup} needed at ${hospitalName}`);
    };

    socket.on("request:accepted", onAccepted);
    socket.on("request:fulfilled", onFulfilled);
    socket.on("request:cancelled", onCancelled);
    socket.on("request:new", onNewRequest);

    return () => {
      socket.off("request:accepted", onAccepted);
      socket.off("request:fulfilled", onFulfilled);
      socket.off("request:cancelled", onCancelled);
      socket.off("request:new", onNewRequest);
    };
  }, [token]);

  return (
    <div className="flex min-h-screen bg-[#f4f2f0]">
      <Sidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
