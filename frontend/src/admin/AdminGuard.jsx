import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdmin } from "../config/admin";
import { useWallet } from "../state/wallet";

export function AdminGuard({ children }) {
  const wallet = useWallet();
  const location = useLocation();

  if (wallet.status !== "connected" || !wallet.address) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin(wallet.address)) {
    return <Navigate to="/admin/login" state={{ denied: true, from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
