import React from "react";
import AppShell from "./AppShell.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

// Frame for the admin panel (own sidebar, same pop-ups / bell / live updates)
export default function AdminLayout() {
  return (
    <AppShell
      badge="ADMIN"
      renderSidebar={(variant, onNavigate) => <AdminSidebar variant={variant} onNavigate={onNavigate} />}
    />
  );
}
