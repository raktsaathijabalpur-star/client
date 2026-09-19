import React from "react";

// ⚠️  This is a plain-language summary of what the app really does with data today.
// Before a public launch, have your final Terms of Use / Privacy Policy reviewed and
// replace (or link to) them here.
const SECTIONS = [
  {
    title: "What RaktSaathi is",
    body: "A free platform that connects blood donors and patients in Jabalpur. We don't sell blood, run a blood bank or guarantee that a donor will be found.",
  },
  {
    title: "What we store",
    body: "Your name, phone number, optional email, blood group, city and area, availability, donation history, the requests you post or accept, your chats, and an optional profile photo.",
  },
  {
    title: "Who can see it",
    body: "Your phone number is shared only between a patient and a donor who accepted that patient's request. Donors can appear on the Top Donors list and in a patient's matching list; you can turn both off in Privacy Settings.",
  },
  {
    title: "Your responsibilities",
    body: "Give accurate information, especially your blood group, and only post genuine requests. Whether it's safe to donate or receive blood is a medical decision for the hospital, not for this app.",
  },
  {
    title: "Deleting your data",
    body: "You can delete your account from Profile. This removes your profile, donation history, chats and the requests you created. Requests you had accepted go back to 'Finding Donors'.",
  },
];

export default function TermsPrivacyPanel() {
  return (
    <div className="space-y-5">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{section.body}</p>
        </div>
      ))}
    </div>
  );
}
