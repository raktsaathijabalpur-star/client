import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios.js";
import useAuthStore from "../../../store/authStore.js";
import { FormError, TextField } from "../formBits.jsx";

export default function DeleteAccountPanel({ onClose }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    setError("");
    setDeleting(true);
    try {
      await api.delete("/auth/me", { data: { password } });
      useAuthStore.getState().logout(); // clears the session and closes the live socket
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleDelete} className="space-y-4">
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
        <p className="font-bold">This can't be undone.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Your profile, donation history and chats are deleted.</li>
          <li>Blood requests you created are cancelled and removed.</li>
          <li>Requests you had accepted go back to "Finding Donors".</li>
        </ul>
      </div>

      <TextField
        id="del-password"
        label="Enter your password to confirm"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-red-600"
        />
        I understand my account will be permanently deleted.
      </label>

      <FormError message={error} />

      <button
        type="submit"
        disabled={deleting || !confirmed || !password}
        className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete my account"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-800"
      >
        Keep my account
      </button>
    </form>
  );
}
