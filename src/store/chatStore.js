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
};

const useChatStore = create((set, get) => ({
  ...initialState,

  // Called on logout so the next user doesn't see the previous user's chats
  reset: () => set({ ...initialState }),

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

  fetchConversations: async () => {
    set({ loadingConversations: true });
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
      set({ messages: data.messages, loadingMessages: false });
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
    await get().fetchConversations();
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

  // Called once on app/chat mount to wire up live listeners
  initListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("message:new");
    socket.on("message:new", ({ conversationId, message }) => {
      const { activeConversationId } = get();
      if (conversationId === activeConversationId) {
        set((state) => {
          if (state.messages.some((m) => m._id === message._id)) return state;
          return { messages: [...state.messages, message] };
        });
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
    });

    socket.off("presence:update");
    socket.on("presence:update", ({ userId, online }) => {
      set((state) => ({ onlineMap: { ...state.onlineMap, [userId]: online } }));
    });

    socket.off("typing");
    socket.on("typing", ({ userId, isTyping }) => {
      set({ typingUserId: isTyping ? userId : null });
    });
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
