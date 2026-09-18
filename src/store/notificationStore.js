import { create } from "zustand";

let seq = 0;

// Toasts (the dark pop-ups at the bottom-left), the bell's notification list,
// and `requestVersion` — a counter that goes up whenever a socket event says
// "request data changed", so list hooks know to silently re-fetch.
// Everything here lives in memory only (cleared on refresh / logout).
const useNotificationStore = create((set, get) => ({
  toasts: [],
  notifications: [],
  unreadCount: 0,
  requestVersion: 0,

  pushToast: (message, { type = "info", duration = 5000 } = {}) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), duration);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  addNotification: ({ title, body }) =>
    set((s) => ({
      notifications: [
        { id: ++seq, title, body, at: new Date().toISOString() },
        ...s.notifications,
      ].slice(0, 30),
      unreadCount: s.unreadCount + 1,
    })),

  markAllRead: () => set({ unreadCount: 0 }),

  bumpRequests: () => set((s) => ({ requestVersion: s.requestVersion + 1 })),

  reset: () => set({ toasts: [], notifications: [], unreadCount: 0, requestVersion: 0 }),
}));

export default useNotificationStore;
