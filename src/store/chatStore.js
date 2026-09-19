import { create } from "zustand";
import api from "../api/axios.js";
import { getSocket } from "../utils/socket.js";

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  loadingConversations: true,
  loadingMessages: false,
  onlineMap: {}, // userId -> boolean
  typingUserId: null,
  allUsers: [],
  loadingUsers: false,
  ownerId: null, // the user this data was loaded for
};

// The listeners this store attached. Kept here so initListeners() can remove
// exactly its own handlers — a bare socket.off("message:new") would also remove
// other parts of the app that listen to the same event (e.g. the "new message" toast).
let attached = null;

const useChatStore = create((set, get) => ({
  ...initialState,

  // Called on logout so the next user doesn't see the previous user's chats
  reset: () => set({ ...initialState }),

  // Safety net: if the signed-in user ever differs from the one this data was loaded
  // for (any route the account could change by), drop everything instead of showing it.
  bindToUser: (userId) => {
    const { ownerId } = get();
    if (ownerId === userId) return;
    if (ownerId === null) {
      set({ ownerId: userId });
      return;
    }
    set({ ...initialState, ownerId: userId });
  },

  fetchAllUsers: async () => {
    set({ loadingUsers: true });
    try {
      const { data } = await api.get("/users");
      set({ allUsers: data.users, loadingUsers: false });
    } catch (err) {
      console.error(err);
      set({ loadingUsers: false });
    }
  },

  // { silent: true } refreshes the list without the "Loading..." flash
  fetchConversations: async ({ silent = false } = {}) => {
    if (!silent) set({ loadingConversations: true });
    try {
      const { data } = await api.get("/conversations");
      set({ conversations: data.conversations, loadingConversations: false });
    } catch (err) {
      console.error(err);
      set({ loadingConversations: false });
    }
  },

  setActiveConversation: async (conversationId) => {
    set({ activeConversationId: conversationId, messages: [], loadingMessages: true });
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      // the person may have opened another chat while this was loading
      if (get().activeConversationId !== conversationId) return;

      set((state) => {
        // keep any message that arrived live while the history was loading
        const loaded = new Set(data.messages.map((m) => m._id));
        const arrivedMeanwhile = state.messages.filter((m) => !loaded.has(m._id));
        return { messages: [...data.messages, ...arrivedMeanwhile], loadingMessages: false };
      });
      // Clear unread badge locally
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    } catch (err) {
      console.error(err);
      set({ loadingMessages: false });
    }
  },

  startConversationWith: async (otherUserId) => {
    const { data } = await api.post("/conversations", { otherUserId });
    await get().fetchConversations({ silent: true });
    return data.conversation._id;
  },

  sendMessage: (text) => {
    const { activeConversationId } = get();
    if (!activeConversationId || !text.trim()) return;

    const socket = getSocket();
    if (!socket) return;

    // Server echoes back via message:new and we dedupe by _id
    socket.emit(
      "message:send",
      { conversationId: activeConversationId, text: text.trim() },
      (res) => {
        if (!res?.ok) console.error(res?.error);
      }
    );
  },

  // Called when the Messages page opens, to wire up live listeners
  initListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    // remove the handlers from a previous call (this store's own only)
    if (attached) {
      attached.socket.off("message:new", attached.onMessage);
      attached.socket.off("presence:update", attached.onPresence);
      attached.socket.off("typing", attached.onTyping);
    }

    const onMessage = ({ conversationId, message }) => {
      const { activeConversationId, conversations } = get();

      if (conversationId === activeConversationId) {
        set((state) => {
          if (state.messages.some((m) => m._id === message._id)) return state;
          return { messages: [...state.messages, message] };
        });
      }

      // First message of a brand-new conversation (started by the other person):
      // it isn't in our list yet, so fetch the list instead of dropping the message.
      if (!conversations.some((c) => c._id === conversationId)) {
        get().fetchConversations({ silent: true });
        return;
      }

      set((state) => ({
        conversations: state.conversations
          .map((c) =>
            c._id === conversationId
              ? {
                  ...c,
                  lastMessage: message.text,
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    conversationId === activeConversationId ? 0 : (c.unreadCount || 0) + 1,
                }
              : c
          )
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
      }));
    };

    const onPresence = ({ userId, online }) => {
      set((state) => ({ onlineMap: { ...state.onlineMap, [userId]: online } }));
    };

    const onTyping = ({ userId, isTyping }) => {
      set({ typingUserId: isTyping ? userId : null });
    };

    socket.on("message:new", onMessage);
    socket.on("presence:update", onPresence);
    socket.on("typing", onTyping);
    attached = { socket, onMessage, onPresence, onTyping };
  },

  emitTyping: (otherUserId, isTyping) => {
    const socket = getSocket();
    socket?.emit("typing", {
      conversationId: get().activeConversationId,
      otherUserId,
      isTyping,
    });
  },
}));

export default useChatStore;
