import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios.js";
import { disconnectSocket } from "../utils/socket.js";
import useChatStore from "./chatStore.js";
import useNotificationStore from "./notificationStore.js";

// Single source of truth for auth state. Components subscribe with a
// selector (e.g. `useAuthStore((s) => s.user)`) so they only re-render
// when the specific slice they read actually changes — Zustand does this
// out of the box without any memoization boilerplate.
// Wipes everything that belongs to the previous account: the live socket, chats, notifications.
// Called on logout AND before a different account signs in.
function clearSession() {
  disconnectSocket();
  useChatStore.getState().reset();
  useNotificationStore.getState().reset();
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,

      login: async (identifier, password) => {
        const { data } = await api.post("/auth/login", { identifier, password });
        clearSession(); // never carry the previous account's socket / chats into this one
        set({ token: data.token, user: data.user, isAuthenticated: true });
        return data.user;
      },

      register: async (payload) => {
        const { data } = await api.post("/auth/register", payload);
        clearSession();
        set({ token: data.token, user: data.user, isAuthenticated: true });
        return data.user;
      },

      logout: () => {
        clearSession();
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (patch) => {
        set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user }));
      },

      // Revalidate the persisted token against the API on app start.
      // Keeps a stale/expired token from silently granting access.
      fetchMe: async () => {
        const { token } = get();
        if (!token) {
          set({ loading: false, isAuthenticated: false });
          return;
        }
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user, isAuthenticated: true, loading: false });
        } catch (err) {
          set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
      },
    }),
    {
      name: "Blood Seva-auth", // localStorage key
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;
