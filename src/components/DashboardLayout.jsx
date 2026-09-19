import React from "react";
import AppShell from "./AppShell.jsx";
import Sidebar from "./Sidebar.jsx";

// Frame for the donor / patient pages
export default function DashboardLayout() {
  return (
    <AppShell
      renderSidebar={(variant, onNavigate) => <Sidebar variant={variant} onNavigate={onNavigate} />}
    />
  );
}
