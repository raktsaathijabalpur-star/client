import { io } from "socket.io-client";
import useAuthStore from "../store/authStore.js";

let socket = null;
let socketToken = null; // the token this connection was opened with

export function getSocket() {
  const token = useAuthStore.getState().token;
  if (!token) return null;

  // A connection belongs to the account whose token opened it. If the signed-in
  // account changed, drop the old connection — otherwise the new user would keep
  // receiving (and sending as) the PREVIOUS user's messages.
  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      autoConnect: true,
    });
    socketToken = token;
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
}
