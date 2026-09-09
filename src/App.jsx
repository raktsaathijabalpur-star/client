import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Requests from "./pages/Requests.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import useAuthStore from "./store/authStore.js";

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
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/donations" element={<Placeholder title="Donations" />} />
          <Route path="/top-donors" element={<Placeholder title="Top Donors" />} />
          <Route path="/supporters" element={<Placeholder title="Supporters" />} />
          <Route path="/messages" element={<Placeholder title="Messages" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
