import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ElectionsPage } from "./pages/ElectionsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ResultsPage } from "./pages/ResultsPage";
import { VerifyPage } from "./pages/VerifyPage";
import { VotePage } from "./pages/VotePage";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminLoginPage } from "./admin/AdminLoginPage";
import { AdminDashboardPage } from "./admin/AdminDashboardPage";
import { AdminElectionsPage } from "./admin/AdminElectionsPage";
import { AdminCandidatesPage } from "./admin/AdminCandidatesPage";
import { AdminResultsPage } from "./admin/AdminResultsPage";

export function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/login" replace />} />
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="elections" element={<AdminElectionsPage />} />
        <Route path="elections/:electionId/candidates" element={<AdminCandidatesPage />} />
        <Route path="results" element={<AdminResultsPage />} />
      </Route>

      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="elections" element={<ElectionsPage />} />
        <Route path="elections/:electionId/vote" element={<VotePage />} />
        <Route path="elections/:electionId/results" element={<ResultsPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
