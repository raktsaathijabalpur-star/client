import React, { memo } from "react";
import { MessageCircle } from "lucide-react";
import WhatsAppIcon from "./icons/WhatsAppIcon.jsx";
import useOpenChat from "../hooks/useOpenChat.js";
import { whatsappLink } from "../utils/contact.js";

// The two "get in touch" buttons shown once a donor has accepted a request:
//   WhatsApp -> opens WhatsApp chat with that phone number (new tab / WhatsApp app)
//   Chat     -> opens the in-app chat with that user
// variant="icon"    -> two square icon buttons (cards, lists)
// variant="labeled" -> two wide buttons with text (modal)
function ContactActions({ phone, userId, name = "", whatsappText = "", variant = "icon" }) {
  const { openChat, busyId } = useOpenChat();
  const link = whatsappLink(phone, whatsappText);
  const chatBusy = busyId !== null && busyId === userId;

  const isIcon = variant === "icon";
  const base = isIcon
    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
    : "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors";

  return (
    <div className={isIcon ? "flex shrink-0 gap-2" : "flex w-full gap-3"}>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${name}`.trim()}
          title="Message on WhatsApp"
          className={`${base} bg-[#25D366] text-white hover:bg-[#1ebe5b]`}
        >
          <WhatsAppIcon size={isIcon ? 20 : 18} />
          {!isIcon && "WhatsApp"}
        </a>
      )}

      {userId && (
        <button
          type="button"
          onClick={() => openChat(userId)}
          disabled={chatBusy}
          aria-label={`Chat with ${name}`.trim()}
          title="Chat in RaktSaathi"
          className={`${base} bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60`}
        >
          <MessageCircle size={isIcon ? 20 : 18} />
          {!isIcon && "Chat"}
        </button>
      )}
    </div>
  );
}

export default memo(ContactActions);
