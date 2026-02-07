import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminGuard } from "./AdminGuard";
import { AdminShell } from "./AdminShell";

export function AdminLayout() {
  const location = useLocation();
  const isLogin = location.pathname === "/admin/login" || location.pathname === "/admin";

  if (isLogin) {
    return <Outlet />;
  }

  return (
    <AdminGuard>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AdminGuard>
  );
}
