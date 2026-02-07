/**
 * Backend API client for elections and candidates.
 * Set VITE_API_URL in .env to your backend base URL (e.g. https://api.example.com).
 * When set, adding a candidate uploads the image to the backend and stores data there.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export function getApiBaseUrl() {
  return BASE_URL.replace(/\/$/, "");
}

export function isBackendConfigured() {
  return Boolean(getApiBaseUrl());
}

/**
 * Add a candidate with image file (for backend).
 * POST /api/elections/:electionId/candidates
 * Body: multipart/form-data with fields: name, description (optional), image (file)
 * Expected response: { candidate: { id, name, description, imageUrl } } or { id, name, description, imageUrl }
 */
export async function addCandidateToBackend(electionId, formData) {
  const base = getApiBaseUrl();
  if (!base) throw new Error("VITE_API_URL is not configured");
  const url = `${base}/api/elections/${electionId}/candidates`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      // Do not set Content-Type; browser sets multipart/form-data with boundary
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.candidate ?? data;
}

/**
 * Fetch elections from backend (optional; use when backend is source of truth).
 * GET /api/elections?includeDraft=true|false
 */
export async function fetchElectionsFromBackend(includeDraft = false) {
  const base = getApiBaseUrl();
  if (!base) return null;
  const url = `${base}/api/elections?includeDraft=${includeDraft}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetch single election from backend.
 * GET /api/elections/:id
 */
export async function fetchElectionFromBackend(id) {
  const base = getApiBaseUrl();
  if (!base) return null;
  const res = await fetch(`${base}/api/elections/${id}`);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Clear all candidates from all elections on the backend.
 * DELETE /api/elections/candidates
 */
export async function clearAllCandidatesOnBackend() {
  const base = getApiBaseUrl();
  if (!base) return;
  const res = await fetch(`${base}/api/elections/candidates`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear candidates on backend");
}
