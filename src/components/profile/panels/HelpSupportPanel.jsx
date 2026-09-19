import React from "react";
import { Mail, Phone } from "lucide-react";
import { SUPPORT_CONTACT } from "../../../config/support.js";

const FAQS = [
  {
    q: "How does RaktSaathi match donors and patients?",
    a: "Patients post a request with blood group, hospital and urgency. Donors whose blood group can safely be given to that patient are alerted and can tap 'I Can Donate'. The patient also gets a list of matching donors in their city.",
  },
  {
    q: "When can I donate again?",
    a: "Whole-blood donors usually wait about three months between donations. Patients only see donors who haven't donated in the last 90 days. If you're unsure, ask the blood bank or your doctor.",
  },
  {
    q: "Who can see my phone number?",
    a: "Nobody browsing the app. A patient sees your number only after you accept their request, and you see the patient's number only after you accept.",
  },
  {
    q: "I made a mistake in a request. What now?",
    a: "Open the request from Requests, choose 'Cancel Request' and post a new one with the right details.",
  },
  {
    q: "How is my donation history updated?",
    a: "When a patient marks a request you accepted as fulfilled and ticks you as a donor, it's added automatically. You can also add older donations yourself from the Donations page.",
  },
];

export default function HelpSupportPanel() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
        <p className="text-sm font-bold text-gray-900">Talk to us</p>
        <a href={`mailto:${SUPPORT_CONTACT.email}`} className="flex items-center gap-2 text-sm text-brand-600">
          <Mail size={16} />
          {SUPPORT_CONTACT.email}
        </a>
        <a href={`tel:${SUPPORT_CONTACT.phone}`} className="flex items-center gap-2 text-sm text-brand-600">
          <Phone size={16} />
          {SUPPORT_CONTACT.phone}
        </a>
        <p className="text-xs text-gray-500">{SUPPORT_CONTACT.hours}</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-gray-900">Common questions</p>
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
        In a medical emergency, call your local emergency number or go straight to the nearest
        hospital or blood bank. RaktSaathi is a connecting platform and can't guarantee a donor.
      </p>
    </div>
  );
}
