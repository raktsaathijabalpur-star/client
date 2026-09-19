import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import DashboardTopbar from "../components/DashboardTopbar.jsx";
import Modal from "../components/Modal.jsx";
import AvatarUploader from "../components/profile/AvatarUploader.jsx";
import SupportModal from "../components/profile/SupportModal.jsx";
import PersonalInfoPanel from "../components/profile/panels/PersonalInfoPanel.jsx";
import BloodInfoPanel from "../components/profile/panels/BloodInfoPanel.jsx";
import LocationPanel from "../components/profile/panels/LocationPanel.jsx";
import AvailabilityPanel from "../components/profile/panels/AvailabilityPanel.jsx";
import PrivacyPanel from "../components/profile/panels/PrivacyPanel.jsx";
import NotificationsPanel from "../components/profile/panels/NotificationsPanel.jsx";
import HelpSupportPanel from "../components/profile/panels/HelpSupportPanel.jsx";
import TermsPrivacyPanel from "../components/profile/panels/TermsPrivacyPanel.jsx";
import DeleteAccountPanel from "../components/profile/panels/DeleteAccountPanel.jsx";
import useAuthStore from "../store/authStore.js";
import { ROLES } from "../utils/constants.js";

// Each menu row either opens a panel in a modal, or jumps to another page ("to").
const PANELS = {
  personal: { title: "Personal Information", Component: PersonalInfoPanel },
  blood: { title: "Blood Information", Component: BloodInfoPanel },
  location: { title: "Location", Component: LocationPanel },
  availability: { title: "Availability", Component: AvailabilityPanel },
  privacy: { title: "Privacy Settings", Component: PrivacyPanel },
  notifications: { title: "Notifications", Component: NotificationsPanel },
  help: { title: "Help & Support", Component: HelpSupportPanel },
  terms: { title: "Terms & Privacy", Component: TermsPrivacyPanel },
  delete: { title: "Delete Account", Component: DeleteAccountPanel },
};

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState(null);
  const [showSupport, setShowSupport] = useState(false);

  const isDonor = user?.role !== ROLES.PATIENT;

  const menu = useMemo(
    () => [
      { id: "personal", label: "Personal Information" },
      { id: "blood", label: "Blood Information" },
      { id: "location", label: "Location" },
      isDonor
        ? { id: "history", label: "Donation History", to: "/donations" }
        : { id: "history", label: "Request History", to: "/requests" },
      ...(isDonor ? [{ id: "availability", label: "Availability" }] : []),
      { id: "privacy", label: "Privacy Settings" },
      { id: "notifications", label: "Notifications" },
      { id: "help", label: "Help & Support" },
      { id: "terms", label: "Terms & Privacy" },
      { id: "delete", label: "Delete Account" },
    ],
    [isDonor]
  );

  const handleSelect = (item) => {
    if (item.to) navigate(item.to);
    else setActivePanel(item.id);
  };

  const closePanel = () => setActivePanel(null);
  const panel = activePanel ? PANELS[activePanel] : null;

  return (
    <div>
      <DashboardTopbar title="Profile" />

      <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <AvatarUploader />

          <h2 className="mt-4 text-center text-xl font-extrabold text-gray-900">{user?.name}</h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-600">
              {user?.bloodGroup}
            </span>
            <span className="text-sm text-gray-500">{user?.area || user?.city}</span>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-5 text-white">
            <p className="font-extrabold">Support Jabalpur RaktSaathi</p>
            <p className="mt-2 text-sm text-white/85">
              Help us keep this platform free for donors and patients.
            </p>
            <button
              type="button"
              onClick={() => setShowSupport(true)}
              className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-brand-600 transition-colors hover:bg-gray-100"
            >
              Donate Now
            </button>
          </div>
        </section>

        <nav aria-label="Profile settings" className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {menu.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-[15px] text-gray-800 transition-colors hover:bg-gray-50"
                >
                  {item.label}
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {panel && (
        <Modal title={panel.title} showBack onClose={closePanel} maxWidth="max-w-lg">
          <panel.Component onClose={closePanel} />
        </Modal>
      )}

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </div>
  );
}
