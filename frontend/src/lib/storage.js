function getJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function isVerified(address) {
  if (!address) return false;
  return localStorage.getItem(`verified:${address.toLowerCase()}`) === "true";
}

export function setVerified(address, verified) {
  localStorage.setItem(`verified:${address.toLowerCase()}`, verified ? "true" : "false");
}

export function getVotesForElection(electionId) {
  return getJson(`votes:${electionId}`, []);
}

export function hasVoted(electionId, address) {
  if (!address) return false;
  return getVotesForElection(electionId).some((v) => v.voter === address.toLowerCase());
}

export function storeVote(vote) {
  const key = `votes:${vote.electionId}`;
  const existing = getVotesForElection(vote.electionId);
  setJson(key, [vote, ...existing]);
}
