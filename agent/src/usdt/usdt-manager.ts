// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — USD₮ Manager
// Main USD₮ management system integrating decision engine, WDK, and MCP
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import { USDTDecisionEngine, DecisionContext, USDTDecision } from "./usdt-decision-engine";
import { USDTWDKIntegration, WDKWallet } from "./usdt-wdk-integration";
import { USDTMCPIntegration } from "./usdt-mcp-integration";
import {
  WDKUSDTConfig,
  MCPToolkitConfig,
  USDTUsageRole,
} from "./usdt-config";

// USD₮ Manager Configuration
export interface USDTManagerConfig {
  network: string;
  wdkConfig?: Partial<WDKUSDTConfig>;
  mcpConfig?: Partial<MCPToolkitConfig>;
  enableMCP?: boolean;
}

// USD₮ Operation Request
export interface USDTOperationRequest {
  type: "swap" | "deposit" | "withdraw" | "borrow" | "repay" | "transfer";
  amount: bigint;
  tokenIn: string;
  tokenOut?: string;
  to?: string;
  spender?: string;
  urgency?: "low" | "medium" | "high" | "critical";
  isCrossChain?: boolean;
}

// USD₮ Operation Response
export interface USDTOperationResponse {
  success: boolean;
  decision: USDTDecision;
  executionResult?: any;
  error?: string;
  timestamp: number;
}

/**
 * USD₮ Manager
 * Main orchestrator for USD₮ operations with decision-making capabilities
 */
export class USDTManager {
  private decisionEngine: USDTDecisionEngine;
  private wdkIntegration: USDTWDKIntegration;
  private mcpIntegration?: USDTMCPIntegration;
  private config: USDTManagerConfig;
  private operationHistory: USDTOperationResponse[] = [];

  constructor(wallet: WDKWallet, config: USDTManagerConfig) {
    this.config = config;

    // Initialize WDK integration
    this.wdkIntegration = new USDTWDKIntegration(wallet, config.wdkConfig);

    // Initialize decision engine
    this.decisionEngine = new USDTDecisionEngine();

    // Initialize MCP integration if enabled
    if (config.enableMCP) {
      this.mcpIntegration = new USDTMCPIntegration(
        this.wdkIntegration,
        this.decisionEngine,
        config.mcpConfig
      );
    }

    console.log("[USD₮ Manager] Initialized");
    console.log(`  Network: ${config.network}`);
    console.log(`  MCP: ${config.enableMCP ? "Enabled" : "Disabled"}`);
  }

  /**
   * Execute a USD₮ operation with automatic decision-making
   * This is the main entry point for USD₮ operations
   */
  async executeOperation(request: USDTOperationRequest): Promise<USDTOperationResponse> {
    console.log(`[USD₮ Manager] Executing operation: ${request.type}`);
    console.log(`  Amount: ${ethers.formatUnits(request.amount, 6)} USDT`);

    try {
      // Step 1: Gather context for decision-making
      const context = await this.gatherContext(request);

      // Step 2: Make decision about USD₮ usage
      const decision = await this.decisionEngine.makeDecision(context);

      console.log(`[USD₮ Manager] Decision: ${decision.shouldUseUSDT ? "USE USD₮" : "DO NOT USE USD₮"}`);
      console.log(`  Role: ${decision.role}`);
      console.log(`  Reasoning: ${decision.reasoning}`);
      console.log(`  Confidence: ${decision.confidence}%`);

      // Step 3: Execute based on decision
      let executionResult;
      if (decision.shouldUseUSDT) {
        executionResult = await this.executeDecision(decision, request);
      } else {
        executionResult = {
          skipped: true,
          reason: "Decision indicates USD₮ should not be used",
          alternatives: decision.alternatives,
        };
      }

      // Step 4: Record execution result
      this.decisionEngine.recordExecutionResult(decision.decisionId, {
        success: executionResult.success !== false,
        actualGasCost: executionResult.gasCost || 0n,
        actualSlippage: executionResult.actualSlippage || 0,
        txHash: executionResult.txHash,
      });

      // Step 5: Create response
      const response: USDTOperationResponse = {
        success: executionResult.success !== false,
        decision,
        executionResult,
        timestamp: Date.now(),
      };

      // Step 6: Record in history
      this.operationHistory.push(response);

      console.log(`[USD₮ Manager] Operation completed: ${response.success ? "SUCCESS" : "FAILED"}`);
      return response;
    } catch (error: any) {
      console.error(`[USD₮ Manager] Operation failed: ${error.message}`);

      const response: USDTOperationResponse = {
        success: false,
        decision: {
          shouldUseUSDT: false,
          role: USDTUsageRole.BASE_ASSET,
          reasoning: "Operation failed before decision could be made",
          confidence: 0,
          alternatives: [],
          estimatedGasCost: 0n,
          estimatedSlippage: 0,
          expectedOutcome: "",
          riskLevel: "high",
          timestamp: Date.now(),
          decisionId: "",
        },
        error: error.message,
        timestamp: Date.now(),
      };

      this.operationHistory.push(response);
      return response;
    }
  }

  /**
   * Gather context for decision-making
   */
  private async gatherContext(request: USDTOperationRequest): Promise<DecisionContext> {
    // Get wallet state
    const balance = await this.wdkIntegration.getBalance();
    const provider = this.wdkIntegration.getWalletInfo().provider;
    const feeData = await provider.getFeeData();

    // Create context
    const context: DecisionContext = {
      timestamp: Date.now(),
      marketConditions: {
        volatility: 30, // Default, would be fetched from market data
        liquidityDepth: ethers.parseUnits("1000000", 6), // Default
        priceStability: 99.9, // Default
        sentiment: "neutral",
        gasPrice: feeData.gasPrice || ethers.parseUnits("20", "gwei"),
        ethPrice: 2000, // Default, would be fetched from oracle
      },
      riskAssessment: {
        overallRisk: 30, // Default
        liquidationRisk: 20, // Default
        slippageRisk: 25, // Default
        protocolRisk: 15, // Default
      },
      transactionDetails: {
        type: request.type,
        amount: request.amount,
        tokenIn: request.tokenIn,
        tokenOut: request.tokenOut,
        requiredLiquidity: request.amount,
        urgency: request.urgency || "medium",
        isCrossChain: request.isCrossChain || false,
      },
      walletState: {
        usdtBalance: balance.balance,
        ethBalance: 0n, // Would be fetched
        totalValueUSD: parseFloat(balance.formattedBalance),
        exposureToVolatileAssets: 50, // Default
      },
      networkState: {
        chainId: 1, // Would be fetched
        networkCongestion: 20, // Default
        blockTime: 12, // Default
        tps: 15, // Default
      },
    };

    return context;
  }

  /**
   * Execute a USD₮ decision
   */
  private async executeDecision(decision: USDTDecision, request: USDTOperationRequest): Promise<any> {
    const params: any = {};

    // Set parameters based on request type
    if (request.to) params.to = request.to;
    if (request.spender) params.spender = request.spender;
    if (request.amount) params.amount = request.amount;

    return await this.wdkIntegration.executeDecision(decision, params);
  }

  /**
   * Get USD₮ balance
   */
  async getBalance() {
    return await this.wdkIntegration.getBalance();
  }

  /**
   * Transfer USD₮
   */
  async transfer(to: string, amount: bigint) {
    return await this.wdkIntegration.transfer(to, amount);
  }

  /**
   * Approve USD₮ spending
   */
  async approve(spender: string, amount: bigint) {
    return await this.wdkIntegration.approve(spender, amount);
  }

  /**
   * Get decision statistics
   */
  getDecisionStatistics() {
    return this.decisionEngine.getStatistics();
  }

  /**
   * Get operation history
   */
  getOperationHistory() {
    return [...this.operationHistory];
  }

  /**
   * Get MCP integration (if enabled)
   */
  getMCPIntegration(): USDTMCPIntegration | undefined {
    return this.mcpIntegration;
  }

  /**
   * Get WDK integration
   */
  getWDKIntegration(): USDTWDKIntegration {
    return this.wdkIntegration;
  }

  /**
   * Get decision engine
   */
  getDecisionEngine(): USDTDecisionEngine {
    return this.decisionEngine;
  }

  /**
   * Get configuration
   */
  getConfig(): USDTManagerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<USDTManagerConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("[USD₮ Manager] Configuration updated");
  }

  /**
   * Get manager statistics
   */
  getStatistics(): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    usdtUsedCount: number;
    usdtNotUsedCount: number;
    averageConfidence: number;
  } {
    const total = this.operationHistory.length;
    const successful = this.operationHistory.filter(r => r.success).length;
    const failed = total - successful;
    const usdtUsed = this.operationHistory.filter(r => r.decision.shouldUseUSDT).length;
    const usdtNotUsed = total - usdtUsed;
    const avgConfidence = total > 0
      ? this.operationHistory.reduce((sum, r) => sum + r.decision.confidence, 0) / total
      : 0;

    return {
      totalOperations: total,
      successfulOperations: successful,
      failedOperations: failed,
      usdtUsedCount: usdtUsed,
      usdtNotUsedCount: usdtNotUsed,
      averageConfidence: Math.round(avgConfidence),
    };
  }

  /**
   * Export manager state
   */
  exportState(): any {
    return {
      config: this.config,
      decisionStatistics: this.getDecisionStatistics(),
      operationStatistics: this.getStatistics(),
      recentOperations: this.operationHistory.slice(-10),
      recentDecisions: this.decisionEngine.getRecentDecisions(10),
    };
  }
}