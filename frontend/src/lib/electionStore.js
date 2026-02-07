/**
 * Single source of truth for elections.
 * Admin creates/starts/ends elections and adds candidates; user app reads Active/Closed only.
 * Demo: persisted in localStorage; production would use smart contract.
 */

import { elections as seedElections } from "../data/elections";

const STORAGE_KEY = "hackspire:elections";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedElections];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...seedElections];
  } catch {
    return [...seedElections];
  }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** All elections; for admin pass includeDraft=true to see Draft. */
export function getElections(includeDraft = false) {
  const list = load();
  if (includeDraft) return list;
  return list.filter((e) => e.status === "Active" || e.status === "Closed");
}

export function getElectionById(id, includeDraft = false) {
  const list = load();
  const e = list.find((x) => x.id === id);
  if (!e) return undefined;
  if (!includeDraft && e.status === "Draft") return undefined;
  return e;
}

export function getElectionByIdAdmin(id) {
  return load().find((x) => x.id === id);
}

function nextId(prefix, existing) {
  const ids = new Set(existing.map((x) => x.id));
  for (let i = 0; i < 1000; i++) {
    const id = i === 0 ? prefix : `${prefix}-${i}`;
    if (!ids.has(id)) return id;
  }
  return `${prefix}-${Date.now()}`;
}

/** Admin: create election (status Draft). */
export function createElection(params) {
  const list = load();
  const id = nextId(
    params.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 24) || "election",
    list
  );
  const election = {
    id,
    name: params.name,
    description: params.description,
    status: "Draft",
    startAt: params.startAt,
    endsAt: params.endsAt,
    candidates: []
  };
  list.push(election);
  save(list);
  return election;
}

/** Admin: set election status to Active (start). */
export function startElection(id) {
  const list = load();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return;
  if (list[idx].status !== "Draft") return;
  list[idx] = { ...list[idx], status: "Active" };
  save(list);
}

/** Admin: set election status to Closed (end). */
export function endElection(id) {
  const list = load();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], status: "Closed" };
  save(list);
}

/** Read image file as data URL (for local storage when no backend). */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Admin: add candidate; only when status is Draft.
 * imageFile is required. When VITE_API_URL is set, uploads to backend and merges response; otherwise stores image as base64 locally.
 * @param {string} electionId
 * @param {{ name: string, description?: string, imageFile: File }} payload
 * @returns {Promise<{ id, name, description, imageUrl?: string, imageData?: string }>}
 */
export async function addCandidate(electionId, payload) {
  const { name, description, imageFile } = payload;
  if (!imageFile || !(imageFile instanceof File)) throw new Error("Candidate image is required");
  const list = load();
  const idx = list.findIndex((e) => e.id === electionId);
  if (idx === -1) throw new Error("Election not found");
  if (list[idx].status !== "Draft") throw new Error("Cannot add candidates after election is active");
  const existing = list[idx].candidates;

  const { getApiBaseUrl, addCandidateToBackend } = await import("./api.js");
  const baseUrl = getApiBaseUrl();

  if (baseUrl) {
    const formData = new FormData();
    formData.append("name", name.trim());
    if (description?.trim()) formData.append("description", description.trim());
    formData.append("image", imageFile);
    const candidate = await addCandidateToBackend(electionId, formData);
    list[idx] = {
      ...list[idx],
      candidates: [...existing, { id: candidate.id, name: candidate.name, description: candidate.description ?? undefined, imageUrl: candidate.imageUrl }]
    };
    save(list);
    return list[idx].candidates[list[idx].candidates.length - 1];
  }

  const id = nextId("c", existing);
  const imageData = await fileToDataUrl(imageFile);
  const newCandidate = { id, name: name.trim(), description: description?.trim() || undefined, imageData };
  list[idx] = {
    ...list[idx],
    candidates: [...existing, newCandidate]
  };
  save(list);
  return newCandidate;
}

/** Admin: finalize election (set winner from current vote counts). */
export function finalizeElection(id, winnerId) {
  const list = load();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], finalized: true, winnerId };
  save(list);
}

/** Clear all stored elections and candidates (localStorage). Next load will use seed data. */
export function clearAllStoredData() {
  localStorage.removeItem(STORAGE_KEY);
}
