import React, { useEffect, useRef, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import useAuthStore from "../store/authStore.js";
import useChatStore from "../store/chatStore.js";

function timeString(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function Messages() {
  const currentUser = useAuthStore((s) => s.user);

  const conversations = useChatStore((s) => s.conversations);
  const loadingConversations = useChatStore((s) => s.loadingConversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const messages = useChatStore((s) => s.messages);
  const loadingMessages = useChatStore((s) => s.loadingMessages);
  const onlineMap = useChatStore((s) => s.onlineMap);
  const typingUserId = useChatStore((s) => s.typingUserId);
  const allUsers = useChatStore((s) => s.allUsers);
  const loadingUsers = useChatStore((s) => s.loadingUsers);

  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const fetchAllUsers = useChatStore((s) => s.fetchAllUsers);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const startConversationWith = useChatStore((s) => s.startConversationWith);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const initListeners = useChatStore((s) => s.initListeners);
  const emitTyping = useChatStore((s) => s.emitTyping);

  const [input, setInput] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [startingChatWith, setStartingChatWith] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    initListeners();
    fetchConversations();
    fetchAllUsers();
  }, [initListeners, fetchConversations, fetchAllUsers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations.find((c) => c._id === activeConversationId);
  const isOtherOnline = activeConversation
    ? onlineMap[activeConversation.otherUser?._id] ?? activeConversation.online
    : false;

  // Users jinke saath abhi tak koi conversation nahi hai — "start new chat" list ke liye
  const usersWithoutConversation = allUsers.filter(
    (u) => !conversations.some((c) => c.otherUser?._id === u._id)
  );

  const handleSelectConversation = (conversationId) => {
    setActiveConversation(conversationId);
    setShowChatOnMobile(true);
  };

  const handleStartNewChat = async (otherUserId) => {
    setStartingChatWith(otherUserId);
    try {
      const conversationId = await startConversationWith(otherUserId);
      await setActiveConversation(conversationId);
      setShowChatOnMobile(true);
    } catch (err) {
      console.error(err);
    } finally {
      setStartingChatWith(null);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    if (activeConversation) emitTyping(activeConversation.otherUser?._id, false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeConversation) return;
    emitTyping(activeConversation.otherUser?._id, true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(activeConversation.otherUser?._id, false);
    }, 1500);
  };

  return (
    <div>
      <DashboardTopbar title="Messages" />

      <div className="flex h-[calc(100vh-160px)] min-h-[500px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
        {/* Left panel: conversations + all users */}
        <div
          className={`w-full md:w-80 shrink-0 border-r border-gray-100 bg-white overflow-y-auto ${
            showChatOnMobile ? "hidden md:block" : "block"
          }`}
        >
          {loadingConversations && (
            <p className="text-gray-500 text-sm p-5">Loading conversations...</p>
          )}

          {/* Existing conversations */}
          {conversations.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => handleSelectConversation(c._id)}
              className={`w-full text-left px-5 py-4 border-b border-gray-50 flex items-center gap-3 transition-colors ${
                c._id === activeConversationId ? "bg-red-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 font-bold text-sm">
                {c.otherUser?.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm truncate">{c.otherUser?.name}</p>
                <p className="text-gray-500 text-xs truncate">{c.lastMessage || "Say hello 👋"}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}

          {!loadingConversations && conversations.length === 0 && (
            <p className="text-gray-400 text-xs px-5 pt-5 pb-2">No conversations yet.</p>
          )}

          {/* Start new chat — DB ke baaki users */}
          {(usersWithoutConversation.length > 0 || loadingUsers) && (
            <div className="mt-2">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wide px-5 py-2">
                Start a Conversation
              </p>

              {loadingUsers && <p className="text-gray-400 text-xs px-5 pb-3">Loading users...</p>}

              {usersWithoutConversation.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => handleStartNewChat(u._id)}
                  disabled={startingChatWith === u._id}
                  className="w-full text-left px-5 py-3 border-b border-gray-50 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 font-bold text-xs">
                    {u.name?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                    <p className="text-gray-400 text-xs truncate">
                      {u.bloodGroup} · {u.city}
                    </p>
                  </div>
                  <MessageCircle size={16} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className={`flex-1 flex flex-col bg-white ${showChatOnMobile ? "flex" : "hidden md:flex"}`}>
          {!activeConversation && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start chatting
            </div>
          )}

          {activeConversation && (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden text-gray-500 mr-1"
                >
                  ←
                </button>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                  {activeConversation.otherUser?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {activeConversation.otherUser?.name}
                  </p>
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      isOtherOnline ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOtherOnline ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    {isOtherOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingMessages && <p className="text-gray-400 text-xs">Loading messages...</p>}

                {messages.map((m) => {
                  const isMine = m.sender?._id === currentUser?._id || m.sender === currentUser?._id;
                  return (
                    <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-red-600 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm">{m.text}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isMine ? "text-white/70" : "text-gray-400"
                          }`}
                        >
                          {timeString(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {typingUserId === activeConversation.otherUser?._id && (
                  <p className="text-gray-400 text-xs">typing...</p>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-red-400"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 hover:bg-red-700 transition-colors"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}