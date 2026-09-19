// The login / register / profile API returns the user as `{ id, ... }`, while
// chat messages come from MongoDB as `sender: { _id, name }`. Comparing
// `sender._id === user._id` therefore never matched (user._id is undefined) and
// the person's own messages were drawn as if they were received. Always go
// through these helpers so both shapes work.
export const getUserId = (user) => (user ? String(user.id ?? user._id ?? "") : "");

export function isOwnMessage(message, user) {
  const me = getUserId(user);
  if (!me) return false;
  const sender = message?.sender;
  const senderId = sender && typeof sender === "object" ? sender._id ?? sender.id : sender;
  return String(senderId ?? "") === me;
}
