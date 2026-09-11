import { io } from "socket.io-client";
import useAuthStore from "../store/authStore.js";

let socket = null;

export function getSocket() {
  const token = useAuthStore.getState().token;
  if (!token) return null;

  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}