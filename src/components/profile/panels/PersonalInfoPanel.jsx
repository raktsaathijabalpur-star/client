import React, { useState } from "react";
import useAuthStore from "../../../store/authStore.js";
import useSaveProfile from "../../../hooks/useSaveProfile.js";
import { FormError, SaveButton, SelectField, TextField } from "../formBits.jsx";

export default function PersonalInfoPanel({ onClose }) {
  const user = useAuthStore((state) => state.user);
  const { save, saving, error } = useSaveProfile();

  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
    gender: user?.gender ?? "",
  }));

  const setField = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await save(form, { successMessage: "Personal information updated." })) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField id="pi-name" label="Full name" value={form.name} onChange={setField("name")} required />
      <TextField
        id="pi-phone"
        label="Phone number"
        value={user?.phone ?? ""}
        disabled
        hint="Your phone number is your login, so it can't be changed here."
      />
      <TextField
        id="pi-email"
        label="Email (optional)"
        type="email"
        value={form.email}
        onChange={setField("email")}
        placeholder="you@example.com"
      />
      <TextField
        id="pi-dob"
        label="Date of birth"
        type="date"
        max={today}
        value={form.dateOfBirth}
        onChange={setField("dateOfBirth")}
      />
      <SelectField id="pi-gender" label="Gender" value={form.gender} onChange={setField("gender")}>
        <option value="">Prefer not to say</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </SelectField>

      <FormError message={error} />
      <SaveButton saving={saving} />
    </form>
  );
}
