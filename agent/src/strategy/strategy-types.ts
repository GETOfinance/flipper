// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — Strategy Abstraction Layer
// Clear separation between strategy planning and execution
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";

// ─── Strategy Types ─────────────────────────────────────────────

export enum StrategyType {
  HODL = "HODL",
  YIELD_FARMING = "YIELD_FARMING",
  ARBITRAGE = "ARBITRAGE",
  LIQUIDITY_PROVISION = "LIQUIDITY_PROVISION",
  RISK_HEDGING = "RISK_HEDGING",
  EMERGENCY_EXIT = "EMERGENCY_EXIT",
  REBALANCE = "REBALANCE",
}

export enum ProtocolType {
  DEX = "DEX",
  LENDING = "LENDING",
  VAULT = "VAULT",
  BRIDGE = "BRIDGE",
}

export enum DEXProtocol {
  UNISWAP_V2 = "UNISWAP_V2",
  UNISWAP_V3 = "UNISWAP_V3",
  SUSHISWAP = "SUSHISWAP",
  CURVE = "CURVE",
  BALANCER = "BALANCER",
}

export enum LendingProtocol {
  AAVE_V3 = "AAVE_V3",
  COMPOUND = "COMPOUND",
  LIDO = "LIDO",
}

// ─── Strategy State ─────────────────────────────────────────────

export interface StrategyState {
  strategyType: StrategyType;
  isActive: boolean;
  startTime: number;
  totalValueLocked: bigint;
  realizedPnL: bigint;
  unrealizedPnL: bigint;
  executionCount: number;
  lastExecutionTime: number;
  parameters: StrategyParameters;
}

export interface StrategyParameters {
  maxSlippage: number;        // 0-100 basis points
  minLiquidity: bigint;       // Minimum liquidity required
  maxGasPrice: bigint;        // Maximum gas price in wei
  riskTolerance: number;      // 0-100
  rebalanceThreshold: number; // 0-100 basis points
  stopLossThreshold: number;  // 0-100 basis points
  takeProfitThreshold: number; // 0-100 basis points
}

// ─── Protocol State ─────────────────────────────────────────────

export interface ProtocolState {
  protocolType: ProtocolType;
  protocolName: string;
  address: string;
  isActive: boolean;
  healthFactor?: number;      // For lending protocols
  utilizationRate?: number;   // For lending protocols
  liquidity?: bigint;         // For DEX protocols
  volume24h?: bigint;         // For DEX protocols
  feeRate?: number;           // For DEX protocols
  apy?: number;               // For yield protocols
  lastUpdated: number;
}

// ─── Execution Context ─────────────────────────────────────────

export interface ExecutionContext {
  timestamp: number;
  blockNumber: number;
  gasPrice: bigint;
  ethPrice: number;
  marketConditions: MarketConditions;
  riskAssessment: RiskAssessment;
}

export interface MarketConditions {
  volatility: number;         // 0-100
  liquidityDepth: bigint;
  priceImpact: number;        // 0-100 basis points
  spread: number;             // 0-100 basis points
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface RiskAssessment {
  overallRisk: number;        // 0-100
  liquidationRisk: number;    // 0-100
  slippageRisk: number;       // 0-100
  protocolRisk: number;       // 0-100
  smartContractRisk: number;  // 0-100
}

// ─── Strategy Actions ───────────────────────────────────────────

export interface StrategyAction {
  id: string;
  type: ActionType;
  protocol: ProtocolType;
  protocolName: string;
  targetAddress: string;
  amount: bigint;
  tokenIn: string;
  tokenOut?: string;
  minAmountOut?: bigint;
  maxSlippage: number;
  estimatedGas: bigint;
  estimatedGasCost: bigint;
  priority: "low" | "medium" | "high" | "critical";
  reasoning: string;
  expectedOutcome: string;
  riskLevel: "low" | "medium" | "high";
}

export enum ActionType {
  SWAP = "SWAP",
  DEPOSIT = "DEPOSIT",
  SUPPLY = "SUPPLY",
  WITHDRAW = "WITHDRAW",
  BORROW = "BORROW",
  REPAY = "REPAY",
  ADD_LIQUIDITY = "ADD_LIQUIDITY",
  REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY",
  STAKE = "STAKE",
  UNSTAKE = "UNSTAKE",
  CLAIM_REWARDS = "CLAIM_REWARDS",
  EMERGENCY_EXIT = "EMERGENCY_EXIT",
}

// ─── Strategy Plan ─────────────────────────────────────────────

export interface StrategyPlan {
  id: string;
  strategyType: StrategyType;
  objective: string;
  actions: StrategyAction[];
  estimatedTotalGas: bigint;
  estimatedTotalGasCost: bigint;
  expectedPnL: bigint;
  riskScore: number;          // 0-100
  confidence: number;         // 0-100
  executionTime: number;      // Estimated execution time in ms
  createdAt: number;
  expiresAt: number;
  context: ExecutionContext;
}

// ─── Execution Result ───────────────────────────────────────────

export interface ExecutionResult {
  actionId: string;
  success: boolean;
  txHash?: string;
  gasUsed?: bigint;
  gasCost?: bigint;
  actualSlippage?: number;
  actualAmountOut?: bigint;
  error?: string;
  timestamp: number;
  blockNumber?: number;
}

// ─── Strategy Metrics ─────────────────────────────────────────

export interface StrategyMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalGasSpent: bigint;
  totalGasCost: bigint;
  averageSlippage: number;
  totalPnL: bigint;
  sharpeRatio?: number;
  maxDrawdown?: number;
  winRate?: number;
}

// ─── Position Data ─────────────────────────────────────────────

export interface Position {
  protocol: ProtocolType;
  protocolName: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: bigint;
  valueUSD: number;
  entryPrice: number;
  currentPrice: number;
  pnl: bigint;
  pnlPercentage: number;
  healthFactor?: number;
  isCollateral?: boolean;
  isBorrowed?: boolean;
}

// ─── Slippage Calculation ─────────────────────────────────────

export interface SlippageCalculation {
  expectedAmountOut: bigint;
  minAmountOut: bigint;
  maxSlippage: number;
  priceImpact: number;
  liquidityDepth: bigint;
  recommendedSlippage: number;
  confidence: number;
}

// ─── Risk Limits ───────────────────────────────────────────────

export interface RiskLimits {
  maxPositionSize: bigint;
  maxDailyVolume: bigint;
  maxSlippage: number;
  maxGasPrice: bigint;
  minHealthFactor: number;
  maxUtilizationRate: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
}
