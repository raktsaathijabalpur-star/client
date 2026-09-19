import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import useChatStore from "../store/chatStore.js";
import useNotificationStore from "../store/notificationStore.js";

// Opens the built-in chat with one user: finds (or creates) the conversation,
// selects it, and goes to /messages. Used by the "Chat" buttons.
export default function useOpenChat() {
  const navigate = useNavigate();
  const startConversationWith = useChatStore((state) => state.startConversationWith);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const pushToast = useNotificationStore((state) => state.pushToast);
  const [busyId, setBusyId] = useState(null);

  const openChat = useCallback(
    async (userId) => {
      if (!userId) return;
      setBusyId(userId);
      try {
        const conversationId = await startConversationWith(userId);
        await setActiveConversation(conversationId);
        navigate("/messages");
      } catch (err) {
        pushToast(err.response?.data?.message || "Couldn't open the chat. Please try again.", {
          type: "error",
        });
        setBusyId(null);
      }
    },
    [startConversationWith, setActiveConversation, navigate, pushToast]
  );

  return { openChat, busyId };
}
