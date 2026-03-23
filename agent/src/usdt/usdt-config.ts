// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — USD₮ Configuration
// USD₮ contract configuration for WDK integration
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";

// USD₮ Contract Address (as specified)
export const USDT_CONTRACT_ADDRESS = "0xd077a400968890eacc75cdc901f0356c943e4fdb";

// USD₮ Token Metadata
export const USDT_METADATA = {
  symbol: "USDT",
  name: "Tether USD",
  decimals: 6,
  address: USDT_CONTRACT_ADDRESS,
};

// USD₮ Usage Roles
export enum USDTUsageRole {
  BASE_ASSET = "BASE_ASSET",           // Used as the primary asset for swaps
  QUOTE_ASSET = "QUOTE_ASSET",         // Used as the pricing reference
  SETTLEMENT_LAYER = "SETTLEMENT_LAYER", // Used for final settlement
  COLLATERAL = "COLLATERAL",           // Used as lending collateral
  STABLE_RESERVE = "STABLE_RESERVE",   // Used as stable value reserve
}

// USD₮ Network Configuration
export interface USDTNetworkConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  usdtAddress: string;
  wdkSupported: boolean;
  mcpSupported: boolean;
}

// Supported Networks for USD₮
export const USDT_NETWORKS: Record<string, USDTNetworkConfig> = {
  ethereum: {
    chainId: 1,
    chainName: "Ethereum Mainnet",
    rpcUrl: "https://eth.llamarpc.com",
    usdtAddress: USDT_CONTRACT_ADDRESS,
    wdkSupported: true,
    mcpSupported: true,
  },
  sepolia: {
    chainId: 11155111,
    chainName: "Sepolia Testnet",
    rpcUrl: "https://rpc.sepolia.org",
    usdtAddress: USDT_CONTRACT_ADDRESS,
    wdkSupported: true,
    mcpSupported: true,
  },
  arbitrum: {
    chainId: 42161,
    chainName: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    usdtAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    wdkSupported: true,
    mcpSupported: true,
  },
  polygon: {
    chainId: 137,
    chainName: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    usdtAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    wdkSupported: true,
    mcpSupported: true,
  },
};

// USD₮ ERC20 ABI (minimal)
export const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// USD₮ Decision Thresholds
export interface USDTDecisionThresholds {
  minLiquidity: bigint;           // Minimum liquidity for USD₮ usage
  maxSlippage: number;            // Maximum slippage tolerance (bps)
  minVolume: bigint;              // Minimum 24h volume
  priceStabilityThreshold: number; // Price deviation threshold (%)
  gasEfficiencyThreshold: bigint; // Gas cost threshold for USD₮ usage
}

export const DEFAULT_USDT_THRESHOLDS: USDTDecisionThresholds = {
  minLiquidity: ethers.parseUnits("1000000", 6), // 1M USDT
  maxSlippage: 50, // 0.5%
  minVolume: ethers.parseUnits("10000000", 6), // 10M USDT
  priceStabilityThreshold: 0.1, // 0.1%
  gasEfficiencyThreshold: ethers.parseUnits("100000", "gwei"), // 100k gwei
};

// USD₮ Usage Context
export interface USDTUsageContext {
  role: USDTUsageRole;
  reason: string;
  confidence: number; // 0-100
  alternatives: string[];
  estimatedGasCost: bigint;
  estimatedSlippage: number;
  timestamp: number;
}

// WDK Configuration for USD₮
export interface WDKUSDTConfig {
  enabled: boolean;
  network: string;
  walletAddress: string;
  autoApprove: boolean;
  maxApprovalAmount: bigint;
  useMCP: boolean;
  mcpServerUrl?: string;
}

// MCP Toolkit Configuration
export interface MCPToolkitConfig {
  enabled: boolean;
  serverUrl: string;
  tools: string[];
  timeout: number;
}

export const DEFAULT_MCP_CONFIG: MCPToolkitConfig = {
  enabled: false,
  serverUrl: "http://localhost:3000",
  tools: [
    "check_balance",
    "sign_transaction",
    "send_transaction",
    "get_wallet_info",
    "approve_token",
    "get_token_balance",
  ],
  timeout: 30000,
};

// USD₮ Decision Rules
export interface USDTDecisionRule {
  id: string;
  name: string;
  description: string;
  condition: (context: any) => boolean;
  priority: number;
  enabled: boolean;
}

// Predefined USD₮ Decision Rules
export const USDT_DECISION_RULES: USDTDecisionRule[] = [
  {
    id: "stable_settlement",
    name: "Stable Settlement",
    description: "Use USD₮ for final settlement to ensure value stability",
    condition: (ctx) => ctx.marketVolatility > 30 || ctx.riskScore > 50,
    priority: 1,
    enabled: true,
  },
  {
    id: "liquidity_provision",
    name: "High Liquidity",
    description: "Use USD₮ when high liquidity is required",
    condition: (ctx) => ctx.requiredLiquidity > ethers.parseUnits("100000", 6),
    priority: 2,
    enabled: true,
  },
  {
    id: "gas_efficiency",
    name: "Gas Efficiency",
    description: "Use USD₮ when gas costs are favorable",
    condition: (ctx) => ctx.gasPrice < ethers.parseUnits("30", "gwei"),
    priority: 3,
    enabled: true,
  },
  {
    id: "price_stability",
    name: "Price Stability",
    description: "Use USD₮ as quote asset for price stability",
    condition: (ctx) => ctx.priceStability > 99.9,
    priority: 4,
    enabled: true,
  },
  {
    id: "cross_chain",
    name: "Cross-Chain Operations",
    description: "Use USD₮ for cross-chain settlements",
    condition: (ctx) => ctx.isCrossChain,
    priority: 5,
    enabled: true,
  },
];

// Helper Functions

/**
 * Get USD₮ address for a specific network
 */
export function getUSDTAddress(network: string): string {
  const config = USDT_NETWORKS[network];
  return config?.usdtAddress || USDT_CONTRACT_ADDRESS;
}

/**
 * Check if USD₮ is supported on a network
 */
export function isUSDTSupported(network: string): boolean {
  return USDT_NETWORKS[network]?.wdkSupported || false;
}

/**
 * Get network configuration
 */
export function getNetworkConfig(network: string): USDTNetworkConfig | undefined {
  return USDT_NETWORKS[network];
}

/**
 * Format USD₮ amount
 */
export function formatUSDT(amount: bigint): string {
  return ethers.formatUnits(amount, 6);
}

/**
 * Parse USD₮ amount
 */
export function parseUSDT(amount: string): bigint {
  return ethers.parseUnits(amount, 6);
}

/**
 * Validate USD₮ address
 */
export function validateUSDTAddress(address: string): boolean {
  return ethers.isAddress(address) && address.toLowerCase() === USDT_CONTRACT_ADDRESS.toLowerCase();
}