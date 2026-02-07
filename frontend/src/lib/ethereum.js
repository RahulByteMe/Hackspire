export const SEPOLIA_CHAIN_ID_DEC = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export function getEthereum() {
  return window.ethereum;
}

export function isMetaMaskInstalled() {
  return Boolean(window.ethereum);
}

export async function getChainId(eth) {
  const chainIdHex = await eth.request({ method: "eth_chainId" });
  return Number.parseInt(chainIdHex, 16);
}

export async function getAccounts(eth) {
  return await eth.request({ method: "eth_accounts" });
}

export async function requestAccounts(eth) {
  return await eth.request({ method: "eth_requestAccounts" });
}

export async function switchToSepolia(eth) {
  await eth.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
  });
}
