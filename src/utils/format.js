const pad = (n) => String(n).padStart(2, "0");

// Date -> "YYYY-MM-DDTHH:mm" in the user's LOCAL time (what <input type="datetime-local"> expects)
export function toLocalInputValue(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

// Default "Required Date": two hours from now, rounded up to the next quarter hour
export function defaultRequiredBy() {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return toLocalInputValue(d);
}

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// "Today, 5:00 pm" / "Tomorrow, 9:30 am" / "20 Aug, 5:00 pm"
export function formatRequiredBy(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (isSameDay(d, now)) return `Today, ${time}`;
  if (isSameDay(d, tomorrow)) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

// "20 Aug 2026"
export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// "August 2026"
export function formatMonthYear(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// Text for the coloured status bar. The wording depends on who is looking:
// the patient who owns the request, or a donor who accepted it.
export function requestStatusLabel(request) {
  const count = request.helpersCount ?? 0;

  if (request.isOwner) {
    if (request.status === "Open") return "Finding Donors…";
    if (request.status === "Accepted") return `${count} donor${count === 1 ? "" : "s"} accepted`;
    return request.status;
  }

  if (request.status === "Open" || request.status === "Accepted") {
    return request.hasHelped ? "You accepted this request" : "Finding Donors";
  }
  if (request.status === "Fulfilled") return "Fulfilled — thank you!";
  return request.status;
}
