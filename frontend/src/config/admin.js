/**
 * Admin access control: only these wallet addresses can use the admin panel.
 * In production, this could be backed by a smart contract (e.g. onlyOwner or mapping).
 * No private keys or personal data are stored; only public addresses.
 */

const envAdmins = (import.meta.env.VITE_ADMIN_ADDRESSES ?? "").trim();
const defaultAdmins = [
  // MetaMask address(es) – must be strings
  "0xA4Bc0c9A15580F6db0DE5108c124B7e633b463e0",
];

const ADMIN_ADDRESSES = new Set(
  (envAdmins ? envAdmins.split(/[\s,]+/) : defaultAdmins).map((a) => a.toLowerCase())
);

export function isAdmin(address) {
  if (!address) return false;
  return ADMIN_ADDRESSES.has(address.toLowerCase());
}

export function getAdminAddresses() {
  return Array.from(ADMIN_ADDRESSES);
}
