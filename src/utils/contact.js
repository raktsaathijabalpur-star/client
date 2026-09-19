// Phone numbers are stored the way people typed them ("98765 43210", "+91 98765-43210", "098765 43210").
// wa.me needs digits only, with the country code and no "+".
export function toWhatsAppNumber(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`; // Indian mobile without country code
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`; // 0 98765 43210
  if (digits.length >= 11 && digits.length <= 15) return digits; // already has a country code
  return null;
}

export function whatsappLink(phone, text) {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

const idPart = (request) => (request?.requestId ? ` ${request.requestId}` : "");

// Ready-made first message when a donor contacts the patient
export function donorToPatientMessage(request, donorName) {
  return (
    `Hi ${request.patientName || "there"}, I'm ${donorName || "a donor"} from RaktSaathi Jabalpur. ` +
    `I saw your request${idPart(request)} for ${request.bloodGroup} blood at ${request.hospitalName} ` +
    `and I can donate. Please share the details.`
  );
}

// ...and when the patient contacts a donor who accepted
export function patientToDonorMessage(request, donorName, patientName) {
  return (
    `Hi ${donorName || "there"}, this is ${patientName || request.patientName || "the patient"}. ` +
    `Thank you for accepting my request${idPart(request)} for ${request.bloodGroup} blood at ` +
    `${request.hospitalName}. Can we coordinate?`
  );
}
