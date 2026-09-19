import React from "react";
import useAuthStore from "../../../store/authStore.js";
import useSaveProfile from "../../../hooks/useSaveProfile.js";
import { ROLES } from "../../../utils/constants.js";
import { FormError, ToggleRow } from "../formBits.jsx";

export default function NotificationsPanel() {
  const user = useAuthStore((state) => state.user);
  const isDonor = user?.role !== ROLES.PATIENT;
  const prefs = user?.notificationPrefs ?? { newRequests: true, requestUpdates: true };
  const { save, saving, error } = useSaveProfile();

  const toggle = (key) => (value) =>
    save({ notificationPrefs: { [key]: value } }, { successMessage: "Notification setting updated." });

  return (
    <div>
      <div className="divide-y divide-gray-100">
        {isDonor && (
          <ToggleRow
            label="New blood requests"
            description="A pop-up when a patient needs blood you can donate."
            checked={prefs.newRequests}
            disabled={saving}
            onChange={toggle("newRequests")}
          />
        )}
        <ToggleRow
          label="Updates on requests"
          description={
            isDonor
              ? "When a request you accepted is fulfilled or cancelled."
              : "When a donor accepts your request, or you're told it was closed."
          }
          checked={prefs.requestUpdates}
          disabled={saving}
          onChange={toggle("requestUpdates")}
        />
      </div>
      <FormError message={error} />
      <p className="mt-4 text-xs text-gray-400">
        These control the pop-ups and bell alerts shown while you're using Blood Seva.
      </p>
    </div>
  );
}
