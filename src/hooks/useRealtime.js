import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import useChatStore from "../store/chatStore.js";
import useNotificationStore from "../store/notificationStore.js";
import { getSocket } from "../utils/socket.js";
import { getUserId } from "../utils/chat.js";

// Everything that has to run while someone is inside the app (donor / patient / admin layouts):
//  - load the bell from the server
//  - keep ONE live connection and react to what the server pushes
export default function useRealtime() {
  const token = useAuthStore((state) => state.token);
  const myId = useAuthStore((state) => getUserId(state.user));
  const location = useLocation();

  // latest path, readable from the socket handlers below without re-subscribing
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  // chats always belong to exactly one account
  useEffect(() => {
    if (myId) useChatStore.getState().bindToUser(myId);
  }, [myId]);

  // the bell: saved notifications (a fresh account starts empty and loads its own)
  useEffect(() => {
    if (myId) useNotificationStore.getState().fetchNotifications();
  }, [myId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const { bumpRequests, receiveNotification, markRead, pushToast } = useNotificationStore.getState();

    // The server saves every notification and pushes it here as "notification:new".
    // (Whether a person gets one at all is decided on the server from their Notification settings.)
    const onNotification = (n) => {
      receiveNotification(n);

      // already looking at that very chat: no pop-up, and it counts as read
      const activeId = useChatStore.getState().activeConversationId;
      if (n.type === "message" && pathRef.current === "/messages" && activeId && n.link === `/messages?c=${activeId}`) {
        markRead([n._id]);
        return;
      }

      const good = n.type === "request:accepted" || n.type === "support:verified";
      pushToast(n.body, { type: good ? "success" : "info", link: n.link, notificationId: n._id });
    };

    // Request events only refresh the lists that are on screen
    const onAccepted = () => bumpRequests();
    const onCancelled = () => bumpRequests();
    const onNewRequest = () => bumpRequests();
    const onFulfilled = ({ credited }) => {
      bumpRequests();
      if (credited) useAuthStore.getState().fetchMe(); // refresh donation count / last donation
    };

    socket.on("notification:new", onNotification);
    socket.on("request:accepted", onAccepted);
    socket.on("request:fulfilled", onFulfilled);
    socket.on("request:cancelled", onCancelled);
    socket.on("request:new", onNewRequest);

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("request:accepted", onAccepted);
      socket.off("request:fulfilled", onFulfilled);
      socket.off("request:cancelled", onCancelled);
      socket.off("request:new", onNewRequest);
    };
  }, [token]);
}
