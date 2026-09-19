// ⚠️  FILL THESE IN before you go live.
// They are shown to users in Profile -> "Donate Now" and "Help & Support".
// While the account number still contains "XXXX", the donate window shows a
// "not set up yet" notice instead of real-looking bank details.
export const SUPPORT_ACCOUNT = {
  name: "Jabalpur Blood Seva",
  number: "XXXXXXXXXXXX",
  ifsc: "XXXX0XXXXXX",
  // Put your QR image in frontend/public/support-qr.png (or change this path)
  qrImage: "/support-qr.png",
};

export const SUPPORT_CONTACT = {
  email: "help@your-domain.com",
  phone: "+91 00000 00000",
  hours: "Mon–Sat, 10 am – 6 pm",
};

export const isSupportAccountConfigured = !/X{4}/.test(SUPPORT_ACCOUNT.number);
