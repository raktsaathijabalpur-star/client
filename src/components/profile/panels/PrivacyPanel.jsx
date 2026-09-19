import React, { useState } from "react";
import api from "../../../api/axios.js";
import useAuthStore from "../../../store/authStore.js";
import useSaveProfile from "../../../hooks/useSaveProfile.js";
import useNotificationStore from "../../../store/notificationStore.js";
import { ROLES } from "../../../utils/constants.js";
import { FormError, SaveButton, TextField, ToggleRow } from "../formBits.jsx";

export default function PrivacyPanel() {
  const user = useAuthStore((state) => state.user);
  const pushToast = useNotificationStore((state) => state.pushToast);
  const isDonor = user?.role !== ROLES.PATIENT;

  const privacy = user?.privacy ?? { showOnLeaderboard: true, showInMatches: true };
  const { save, saving, error: toggleError } = useSaveProfile();

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const setPwField = (name) => (e) => setPw((prev) => ({ ...prev, [name]: e.target.value }));

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pw.newPassword.length < 6) return setPwError("New password must be at least 6 characters.");
    if (pw.newPassword !== pw.confirm) return setPwError("The new passwords don't match.");

    setPwSaving(true);
    try {
      await api.put("/auth/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      pushToast("Password updated.", { type: "success" });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Couldn't change your password. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {isDonor && (
        <div className="divide-y divide-gray-100">
          <ToggleRow
            label="Show me on the Top Donors list"
            description="Your name, blood group and number of donations appear on the leaderboard."
            checked={privacy.showOnLeaderboard}
            disabled={saving}
            onChange={(value) =>
              save({ privacy: { showOnLeaderboard: value } }, { successMessage: "Privacy setting updated." })
            }
          />
          <ToggleRow
            label="Show me in patients' Matching Donors"
            description="Turn off to stop appearing in donor lists. You can still accept requests yourself."
            checked={privacy.showInMatches}
            disabled={saving}
            onChange={(value) =>
              save({ privacy: { showInMatches: value } }, { successMessage: "Privacy setting updated." })
            }
          />
          <FormError message={toggleError} />
        </div>
      )}

      <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
        Your phone number is never listed publicly. A patient sees it only after you accept their
        request, and you see a patient's number only after you accept.
      </p>

      <form onSubmit={handlePassword} className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Change password</h3>
        <TextField
          id="pw-current"
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={pw.currentPassword}
          onChange={setPwField("currentPassword")}
          required
        />
        <TextField
          id="pw-new"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={pw.newPassword}
          onChange={setPwField("newPassword")}
          hint="At least 6 characters."
          required
        />
        <TextField
          id="pw-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={pw.confirm}
          onChange={setPwField("confirm")}
          required
        />
        <FormError message={pwError} />
        <SaveButton saving={pwSaving} savingLabel="Updating...">
          Update password
        </SaveButton>
      </form>
    </div>
  );
}
