import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Home from "./pages/Home.jsx";
import DonationHistory from "./pages/DonationHistory.jsx";
import Supporters from "./pages/Supporter.jsx";
import TopDonors from "./pages/TopDonor.jsx";
import Requests from "./pages/Requests.jsx";
import Messages from "./pages/ChatBox.jsx";
import Profile from "./pages/Profile.jsx";
import AdminSupport from "./pages/AdminSupport.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import useAuthStore from "./store/authStore.js";
import { ROLES } from "./utils/constants.js";

export default function App() {
  // Revalidate any persisted token once, on app start.
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        {/* Right after signup: donor setup OR the patient's first blood request */}
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<DashboardLayout />}>
          {/* Same URLs for everyone — the page shows donor or patient content by role */}
          <Route path="/home" element={<Home />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/supporters" element={<Supporters />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin only: confirm the contributions people report from Profile -> Donate Now */}
          <Route element={<ProtectedRoute admin />}>
            <Route path="/admin/support" element={<AdminSupport />} />
          </Route>

          {/* Donor-only pages */}
          <Route element={<ProtectedRoute roles={[ROLES.DONOR]} />}>
            <Route path="/donations" element={<DonationHistory />} />
            <Route path="/top-donors" element={<TopDonors />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
