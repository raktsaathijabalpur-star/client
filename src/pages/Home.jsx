import React from "react";
import useAuthStore from "../store/authStore.js";
import DonorHome from "./home/DonorHome.jsx";
import PatientHome from "./home/PatientHome.jsx";

// One route (/home), two dashboards. The role is chosen at signup
// (Landing -> "Donate Blood" or "Need Blood").
export default function Home() {
  const role = useAuthStore((state) => state.user?.role);
  return role === "patient" ? <PatientHome /> : <DonorHome />;
}
