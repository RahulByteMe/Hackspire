# Admin System: Contract Design & Security

This document describes how the admin panel integrates with the voting system, the intended smart contract interface for admin-only functions, and security decisions. It is intended for hackathon demos and viva.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     User-facing frontend                         │
│  (Connect wallet → Verify identity [off-chain] → Vote on-chain)  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ reads elections & casts votes
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain (e.g. Sepolia)                     │
│  • Elections (id, name, status, start/end, candidates)         │
│  • One vote per wallet (enforced on-chain)                      │
│  • Results computed from contract state                         │
└─────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ admin-only: create, start, end, add candidates, finalize
┌─────────────────────────────────────────────────────────────────┐
│                     Admin panel (this repo)                      │
│  • Wallet-based auth (only pre-defined admin addresses)         │
│  • Create/start/end elections, add candidates, view/finalize   │
│  • Does NOT see Aadhaar/OTP; does NOT vote or modify votes      │
└─────────────────────────────────────────────────────────────────┘
```

- **User app**: Same React app; routes `/`, `/verify`, `/elections`, `/elections/:id/vote`, `/elections/:id/results`. Reads elections from a single source (currently `electionStore` → localStorage; production → contract). Casts vote (currently simulated; production → contract).
- **Admin panel**: Routes `/admin/login`, `/admin/dashboard`, `/admin/elections`, `/admin/elections/:id/candidates`, `/admin/results`. Mutations go through `electionStore` (demo) or contract (production).

---

## 2. Admin Access Control

### Frontend

- **Config**: `src/config/admin.ts`. Admin addresses are taken from:
  - Env: `VITE_ADMIN_ADDRESSES` (comma-separated), or
  - Default list in code (empty by default; add your MetaMask address for demo).
- **Check**: `isAdmin(address)` — returns true only if `address` (lowercase) is in the allowed set.
- **Guard**: `AdminGuard` wraps all admin routes except `/admin/login`. It:
  - Redirects to `/admin/login` if wallet is not connected.
  - Redirects to `/admin/login` with `state.denied = true` if connected but not admin.
- **No private keys or personal data** are stored; only public wallet addresses are used.

### Intended Smart Contract (Access Control)

On-chain, admin authority should be enforced in the contract, not only in the UI:

- **Option A — Single owner**: `address public admin;` set in constructor; modifier `onlyAdmin { require(msg.sender == admin); _; }`.
- **Option B — Multiple admins**: `mapping(address => bool) public admins;` and modifier `onlyAdmin { require(admins[msg.sender]); _; }`.

Only these functions should be callable by admin (and no one else):

- Create election (name, description, startTime, endTime).
- Start election (set status to Active).
- End election (set status to Closed).
- Add candidate (electionId, name, party/description) — **only when status == Draft**.
- Finalize results (electionId) — **only when status == Closed** (and optionally only once).

The frontend admin panel is designed to call these; the contract must reject non-admin callers.

---

## 3. Admin Contract Functions (Proposed)

| Function              | Access   | Description |
|-----------------------|----------|-------------|
| `createElection(name, description, startTime, endTime)` | Admin only | Create election in Draft; no candidates yet. |
| `startElection(electionId)` | Admin only | Set status to Active; no more candidates. |
| `endElection(electionId)`   | Admin only | Set status to Closed; no more votes. |
| `addCandidate(electionId, name, partyOrDescription)` | Admin only | Add candidate; reverts if election not Draft. |
| `finalizeResults(electionId)` | Admin only | Set finalized flag and winner (from current counts); only when Closed. |
| `castVote(electionId, candidateId)` | Any verified voter | User-facing; one vote per wallet; reverts if already voted or not Active. |
| `getElection(id)`, `getCandidates(id)`, `getVoteCount(id, candidateId)`, `getResults(id)` | Anyone (view) | Read-only; used by both user app and admin panel. |

- **Voter identity**: Aadhaar/OTP stay off-chain. The contract does not receive or store them. The frontend may require “verified” status (off-chain) before showing “Vote”; the contract only enforces one vote per `msg.sender` (and election rules).

---

## 4. Security Decisions

1. **Admin cannot vote**  
   Enforced by policy and UI: admin panel has no “Vote” action. Optionally, contract can enforce that `admin` (or addresses in `admins`) cannot call `castVote`.

2. **Admin cannot modify votes**  
   No function to change or delete a vote. Votes are append-only; results are derived from contract state.

3. **Admin does not see Aadhaar/OTP**  
   Verification is off-chain; admin panel and contract never receive or display this data.

4. **Candidates only in Draft**  
   `addCandidate` reverts if election is not in Draft (so not Active/Closed). Frontend disables “Add candidate” when status !== Draft.

5. **Transparent and auditable**  
   Elections, candidates, and votes are on-chain (or in a single source of truth). Results are computed from the same data; finalize only records the winner, it does not overwrite votes.

6. **Pre-defined admins only**  
   Frontend: only addresses in `VITE_ADMIN_ADDRESSES` or `config/admin.ts` can open admin routes. Contract: only `admin` or `admins[msg.sender]` can call admin functions.

---

## 5. How Admin Frontend Connects to User Frontend

- **Same codebase**: One React app; user routes under `/`, admin routes under `/admin`.
- **Same wallet**: MetaMask used for both; admin routes require that the connected address is in the admin list.
- **Same data source for elections**:
  - **Demo**: `electionStore` (localStorage). Admin creates/starts/ends and adds candidates here; user app reads from the same store (Draft elections are hidden from users).
  - **Production**: Replace `electionStore` reads/writes with contract calls (ethers.js). User app reads elections and casts vote; admin app calls create/start/end/addCandidate/finalize.
- **Votes**: Demo uses `storage.ts` (localStorage); production uses contract state. Results in admin panel and user-facing results page both derive from the same source (storage now; contract later).

---

## 6. Demo Setup (Hackathon)

1. **Add yourself as admin**  
   In `.env`: `VITE_ADMIN_ADDRESSES=0xYourMetaMaskAddress`  
   Or in `src/config/admin.ts`: add your address to `defaultAdmins`.

2. **Run app**  
   `npm run dev` → open user app, click “Admin” or go to `/admin` → connect wallet → if address is admin, you get Dashboard; else “Access denied” with instructions.

3. **Create election**  
   Admin → Manage Elections → Create election (name, description, start/end) → Add candidates (while Draft) → Start election. User app then sees it under Elections and can vote.

4. **Results**  
   Admin → Results → select election → view counts → after ending election, “Finalize results” to set winner. User-facing results page shows the same numbers (and can show “Finalized” when you wire that field).

---

## 7. File Reference

| Area            | Files |
|-----------------|--------|
| Admin config    | `src/config/admin.ts` |
| Election store  | `src/lib/electionStore.ts` |
| Admin layout    | `src/admin/AdminLayout.tsx`, `AdminGuard.tsx`, `AdminShell.tsx` |
| Admin pages     | `src/admin/AdminLoginPage.tsx`, `AdminDashboardPage.tsx`, `AdminElectionsPage.tsx`, `AdminCandidatesPage.tsx`, `AdminResultsPage.tsx` |
| Routes          | `src/App.tsx` (admin under `/admin`, user under `/`) |
| User data flow | `src/pages/ElectionsPage.tsx`, `VotePage.tsx`, `ResultsPage.tsx` use `getElections` / `getElectionById` from `electionStore` |

This design keeps the system decentralized and transparent while giving the election authority a clear, restricted role for managing elections and viewing/finalizing results—suitable for explaining in a demo or viva.
