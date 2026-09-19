import { useCallback, useState } from "react";
import api from "../api/axios.js";
import useAuthStore from "../store/authStore.js";
import useNotificationStore from "../store/notificationStore.js";

// PUT /auth/me with only the fields that changed, then refresh the logged-in user.
// Returns true / false so a panel can close itself on success.
export default function useSaveProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const pushToast = useNotificationStore((state) => state.pushToast);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = useCallback(
    async (patch, { successMessage = "Saved." } = {}) => {
      setSaving(true);
      setError("");
      try {
        const { data } = await api.put("/auth/me", patch);
        updateUser(data.user);
        if (successMessage) pushToast(successMessage, { type: "success" });
        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't save your changes. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [updateUser, pushToast]
  );

  return { save, saving, error, clearError: () => setError("") };
}
