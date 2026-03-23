// Contract addresses - deployed on Ethereum Sepolia Testnet (Chain ID 11155111)
export const CONTRACTS = {
  REGISTRY: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0xac77139C2856788b7EEff767969353adF95D335e",
  VAULT: process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x73CE32Ece5d21836824C55c5EDB9d09b07F3a56E",
  DECISION_LOGGER: process.env.NEXT_PUBLIC_LOGGER_ADDRESS || "0xEbfb45d0c075d8BdabD6421bdFB9A4b9570219ea",
};

export const CHAIN_CONFIG = {
  sepolia: {
    chainId: "0xaa36a7",
    chainIdDecimal: 11155111,
    chainName: "Sepolia Testnet",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  ethereum: {
    chainId: "0x1",
    chainIdDecimal: 1,
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
};

// USD₮ (Tether) on Sepolia.
// Default is the project-standard Sepolia test token address, but can be overridden
// to support custom USDT/test-ERC20 deployments.
export const SEPOLIA_USDT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_ADDRESS || "0xd077a400968890eacc75cdc901f0356c943e4fdb";

export const RISK_LEVELS = ["None", "Low", "Medium", "High", "Critical"] as const;
export const RISK_COLORS = ["#6b7280", "#22c55e", "#eab308", "#f97316", "#ef4444"] as const;
export const ACTION_TYPES = ["Emergency Withdraw", "Rebalance", "Alert Only", "Stop Loss", "Take Profit"] as const;
export const AGENT_TIERS = ["Scout", "Guardian", "Sentinel", "Archon"] as const;
export const AGENT_STATUSES = ["Active", "Paused", "Decommissioned"] as const;
