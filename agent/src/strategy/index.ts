// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — Strategy Module
// Main entry point for strategy planning and execution
// ═══════════════════════════════════════════════════════════════

export * from "./strategy-types";
export * from "./strategy-planner";
export * from "./strategy-executor";
export * from "./dex-operations";
export * from "./lending-operations";

import { ethers } from "ethers";
import { StrategyPlanner } from "./strategy-planner";
import { StrategyExecutor } from "./strategy-executor";
import { DEXOperations } from "./dex-operations";
import { LendingOperations } from "./lending-operations";
import {
  StrategyPlan,
  StrategyParameters,
  RiskLimits,
  ExecutionContext,
  MarketConditions,
  RiskAssessment,
  Position,
  ProtocolState,
} from "./strategy-types";

/**
 * Strategy Manager - Coordinates planning and execution
 */
export class StrategyManager {
  private planner: StrategyPlanner;
  private executor: StrategyExecutor;
  private dexOperations: DEXOperations;
  private lendingOperations: LendingOperations;

  constructor(
    provider: ethers.JsonRpcProvider,
    wallet: ethers.Wallet,
    riskLimits?: Partial<RiskLimits>,
    network: "mainnet" | "sepolia" = "sepolia"
  ) {
    this.planner = new StrategyPlanner(riskLimits);
    this.executor = new StrategyExecutor(provider, wallet, network);
    this.dexOperations = this.executor.getDEXOperations();
    this.lendingOperations = this.executor.getLendingOperations();

    console.log("[Strategy Manager] Initialized");
  }

  /**
   * Generate and execute a strategy plan
   */
  async generateAndExecuteStrategy(
    context: ExecutionContext,
    positions: Position[],
    protocolStates: Map<string, ProtocolState>,
    objective?: string
  ): Promise<{
    plan: StrategyPlan;
    results: any[];
    metrics: any;
  }> {
    console.log("[Strategy Manager] Generating and executing strategy...");

    // Generate plan
    const plan = await this.planner.generateStrategy(
      context,
      positions,
      protocolStates,
      objective
    );

    // Execute plan
    const results = await this.executor.executePlan(plan);

    // Get metrics
    const metrics = this.executor.getMetrics();

    return {
      plan,
      results,
      metrics,
    };
  }

  /**
   * Get current positions from all protocols
   */
  async getAllPositions(userAddress: string): Promise<Position[]> {
    const positions: Position[] = [];

    // Get lending positions
    const lendingPositions = await this.lendingOperations.getUserPositions(userAddress);
    positions.push(...lendingPositions);

    // In production, you'd also get DEX positions, vault positions, etc.

    return positions;
  }

  /**
   * Get protocol states
   */
  async getProtocolStates(): Promise<Map<string, ProtocolState>> {
    const states = new Map<string, ProtocolState>();

    // Get Aave state
    const aaveState = await this.lendingOperations.getProtocolState();
    states.set("AAVE_V3", aaveState);

    // In production, you'd also get DEX states, vault states, etc.

    return states;
  }

  /**
   * Create execution context
   */
  async createExecutionContext(
    provider: ethers.JsonRpcProvider,
    ethPrice: number,
    marketConditions: MarketConditions,
    riskAssessment: RiskAssessment
  ): Promise<ExecutionContext> {
    const feeData = await provider.getFeeData();
    const blockNumber = await provider.getBlockNumber();

    return {
      timestamp: Date.now(),
      blockNumber,
      gasPrice: feeData.gasPrice || 0n,
      ethPrice,
      marketConditions,
      riskAssessment,
    };
  }

  /**
   * Get planner
   */
  getPlanner(): StrategyPlanner {
    return this.planner;
  }

  /**
   * Get executor
   */
  getExecutor(): StrategyExecutor {
    return this.executor;
  }

  /**
   * Get DEX operations
   */
  getDEXOperations(): DEXOperations {
    return this.dexOperations;
  }

  /**
   * Get lending operations
   */
  getLendingOperations(): LendingOperations {
    return this.lendingOperations;
  }
}