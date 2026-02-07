# Hackspire — Hybrid Blockchain Voting (Frontend)

React + Tailwind frontend implementing the PRD:
- MetaMask wallet connect
- Sepolia network detection + switch prompt
- Aadhaar + OTP **mock** verification (stored locally)
- Elections dashboard
- Voting flow (demo-ready even without a contract)
- Results page (auto-computed from stored votes)

## Setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Admin Panel

- **URL**: `/admin` (or click “Admin” in the user app header).
- **Auth**: Wallet-based. Only pre-defined admin addresses can access. Non-admin wallets see “Access denied”.
- **Setup**: Add your MetaMask address as admin:
  - In `.env`: `VITE_ADMIN_ADDRESSES=0xYourAddress` (comma-separated for multiple), or
  - In `src/config/admin.ts`: add your address to the `defaultAdmins` array.
- **Features**: Create elections (name, description, start/end), add candidates (only when Draft), start/end elections, view results, finalize results. Admin cannot vote, modify votes, or see Aadhaar/OTP data.
- **Contract design**: See `docs/ADMIN_CONTRACT_DESIGN.md` for admin-only functions and security decisions.

## Notes (Hackathon-friendly)

- **Identity verification is simulated**: no Aadhaar is stored; verification is stored locally per wallet address.
- **Voting is simulated by default** (stored locally), so you can demo end-to-end without deploying a contract.
- If you later want on-chain voting, wire a contract address/ABI in `src/lib/contracts.ts` (placeholder included).


