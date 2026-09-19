import { create } from "zustand";
import api from "../api/axios.js";

let seq = 0;
const MAX_LIST = 50;

// Two things live here:
//  1) toasts — the small dark pop-ups at the bottom-left
//  2) the bell — notifications saved on the SERVER (new request, donor accepted, new message…),
//     so they survive a refresh and arrive even if you were offline.
// `requestVersion` goes up when a socket event says "request data changed" so lists re-fetch.
const useNotificationStore = create((set, get) => ({
  toasts: [],
  requestVersion: 0,

  notifications: [],
  unreadCount: 0,
  notificationsLoaded: false,
  loadingNotifications: false,

  /* ------------------------------ toasts ------------------------------ */

  // link: where to go when the toast is clicked; notificationId: the bell entry to mark read then
  pushToast: (message, { type = "info", duration = 5000, link, notificationId } = {}) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, message, type, link, notificationId }] }));
    setTimeout(() => get().dismissToast(id), duration);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /* ------------------------------ bell ------------------------------ */

  fetchNotifications: async () => {
    set({ loadingNotifications: true });
    try {
      const { data } = await api.get("/notifications");
      set({
        notifications: data.notifications ?? [],
        unreadCount: data.unreadCount ?? 0,
        notificationsLoaded: true,
        loadingNotifications: false,
      });
    } catch (err) {
      set({ loadingNotifications: false });
    }
  },

  // A notification arrived live. Same _id = an existing one got newer text (e.g. more chat
  // messages from the same person): replace it and move it to the top.
  receiveNotification: (n) =>
    set((s) => {
      const wasUnread = s.notifications.some((x) => x._id === n._id && !x.read);
      const others = s.notifications.filter((x) => x._id !== n._id);
      return {
        notifications: [n, ...others].slice(0, MAX_LIST),
        unreadCount: wasUnread || n.read ? s.unreadCount : s.unreadCount + 1,
      };
    }),

  markRead: async (ids) => {
    const targets = get().notifications.filter((n) => ids.includes(n._id) && !n.read);
    if (targets.length === 0) return;
    set((s) => ({
      notifications: s.notifications.map((n) => (ids.includes(n._id) ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - targets.length),
    }));
    try {
      await api.patch("/notifications/read", { ids });
    } catch (err) {
      get().fetchNotifications(); // resync with the server
    }
  },

  markAllRead: async () => {
    if (get().unreadCount === 0) return;
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 }));
    try {
      await api.patch("/notifications/read", {});
    } catch (err) {
      get().fetchNotifications();
    }
  },

  removeNotification: async (id) => {
    const target = get().notifications.find((n) => n._id === id);
    if (!target) return;
    set((s) => ({
      notifications: s.notifications.filter((n) => n._id !== id),
      unreadCount: target.read ? s.unreadCount : Math.max(0, s.unreadCount - 1),
    }));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      get().fetchNotifications();
    }
  },

  clearAll: async () => {
    if (get().notifications.length === 0) return;
    set({ notifications: [], unreadCount: 0 });
    try {
      await api.delete("/notifications");
    } catch (err) {
      get().fetchNotifications();
    }
  },

  /* ------------------------------ misc ------------------------------ */

  bumpRequests: () => set((s) => ({ requestVersion: s.requestVersion + 1 })),

  reset: () =>
    set({
      toasts: [],
      requestVersion: 0,
      notifications: [],
      unreadCount: 0,
      notificationsLoaded: false,
      loadingNotifications: false,
    }),
}));

export default useNotificationStore;
