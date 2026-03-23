// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — USD₮ Decision Engine
// Agent decides WHEN and WHY to use USD₮ (not just how)
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import {
  USDTUsageRole,
  USDTUsageContext,
  USDTDecisionRule,
  USDTDecisionThresholds,
  DEFAULT_USDT_THRESHOLDS,
  USDT_DECISION_RULES,
} from "./usdt-config";

// Re-export USDTUsageRole for use in other modules
export { USDTUsageRole };

// Decision Context
export interface DecisionContext {
  timestamp: number;
  marketConditions: MarketConditions;
  riskAssessment: RiskAssessment;
  transactionDetails: TransactionDetails;
  walletState: WalletState;
  networkState: NetworkState;
}

export interface MarketConditions {
  volatility: number; // 0-100
  liquidityDepth: bigint;
  priceStability: number; // 0-100
  sentiment: "bullish" | "bearish" | "neutral";
  gasPrice: bigint;
  ethPrice: number;
}

export interface RiskAssessment {
  overallRisk: number; // 0-100
  liquidationRisk: number; // 0-100
  slippageRisk: number; // 0-100
  protocolRisk: number; // 0-100
}

export interface TransactionDetails {
  type: "swap" | "deposit" | "withdraw" | "borrow" | "repay" | "transfer";
  amount: bigint;
  tokenIn: string;
  tokenOut?: string;
  requiredLiquidity: bigint;
  urgency: "low" | "medium" | "high" | "critical";
  isCrossChain: boolean;
}

export interface WalletState {
  usdtBalance: bigint;
  ethBalance: bigint;
  totalValueUSD: number;
  exposureToVolatileAssets: number; // 0-100
}

export interface NetworkState {
  chainId: number;
  networkCongestion: number; // 0-100
  blockTime: number;
  tps: number; // transactions per second
}

// Decision Result
export interface USDTDecision {
  shouldUseUSDT: boolean;
  role: USDTUsageRole;
  reasoning: string;
  confidence: number; // 0-100
  alternatives: string[];
  estimatedGasCost: bigint;
  estimatedSlippage: number;
  expectedOutcome: string;
  riskLevel: "low" | "medium" | "high";
  timestamp: number;
  decisionId: string;
}

// Decision History
export interface DecisionHistory {
  decisionId: string;
  decision: USDTDecision;
  context: DecisionContext;
  executionResult?: {
    success: boolean;
    actualGasCost: bigint;
    actualSlippage: number;
    txHash?: string;
  };
}

/**
 * USD₮ Decision Engine
 * Determines WHEN and WHY to use USD₮ based on market conditions, risk assessment, and transaction details
 */
export class USDTDecisionEngine {
  private thresholds: USDTDecisionThresholds;
  private rules: USDTDecisionRule[];
  private decisionHistory: DecisionHistory[] = [];
  private customRules: Map<string, USDTDecisionRule> = new Map();

  constructor(thresholds?: Partial<USDTDecisionThresholds>) {
    this.thresholds = {
      ...DEFAULT_USDT_THRESHOLDS,
      ...thresholds,
    };
    this.rules = [...USDT_DECISION_RULES];
    console.log("[USD₮ Decision Engine] Initialized");
  }

  /**
   * Make a decision about whether to use USD₮
   * This is the core "WHEN and WHY" decision logic
   */
  async makeDecision(context: DecisionContext): Promise<USDTDecision> {
    console.log("[USD₮ Decision Engine] Evaluating USD₮ usage...");

    // Evaluate all decision rules
    const ruleResults = this.evaluateRules(context);

    // Determine if USD₮ should be used
    const shouldUseUSDT = this.shouldUseUSDT(ruleResults, context);

    // Determine the role and reasoning
    const role = this.determineRole(ruleResults, context);
    const reasoning = this.generateReasoning(ruleResults, context, shouldUseUSDT);

    // Calculate confidence
    const confidence = this.calculateConfidence(ruleResults, context);

    // Generate alternatives
    const alternatives = this.generateAlternatives(context, shouldUseUSDT);

    // Estimate costs
    const estimatedGasCost = this.estimateGasCost(context);
    const estimatedSlippage = this.estimateSlippage(context);

    // Determine expected outcome and risk level
    const expectedOutcome = this.generateExpectedOutcome(shouldUseUSDT, context);
    const riskLevel = this.assessRiskLevel(context);

    const decision: USDTDecision = {
      shouldUseUSDT,
      role,
      reasoning,
      confidence,
      alternatives,
      estimatedGasCost,
      estimatedSlippage,
      expectedOutcome,
      riskLevel,
      timestamp: Date.now(),
      decisionId: this.generateDecisionId(),
    };

    // Store decision in history
    this.decisionHistory.push({
      decisionId: decision.decisionId,
      decision,
      context,
    });

    console.log(`[USD₮ Decision Engine] Decision: ${shouldUseUSDT ? "USE USD₮" : "DO NOT USE USD₮"}`);
    console.log(`  Role: ${role}`);
    console.log(`  Reasoning: ${reasoning}`);
    console.log(`  Confidence: ${confidence}%`);

    return decision;
  }

  /**
   * Evaluate all decision rules against the context
   */
  private evaluateRules(context: DecisionContext): Map<string, boolean> {
    const results = new Map<string, boolean>();

    for (const rule of this.rules) {
      if (!rule.enabled) {
        results.set(rule.id, false);
        continue;
      }

      try {
        const triggered = rule.condition(context);
        results.set(rule.id, triggered);
        console.log(`[USD₮ Decision Engine] Rule "${rule.name}": ${triggered ? "TRIGGERED" : "not triggered"}`);
      } catch (error: any) {
        console.error(`[USD₮ Decision Engine] Rule "${rule.name}" evaluation error: ${error.message}`);
        results.set(rule.id, false);
      }
    }

    return results;
  }

  /**
   * Determine if USD₮ should be used based on rule results
   */
  private shouldUseUSDT(ruleResults: Map<string, boolean>, context: DecisionContext): boolean {
    // Count triggered rules
    const triggeredRules = Array.from(ruleResults.values()).filter(r => r).length;

    // High priority rules (priority 1-2) have more weight
    const highPriorityTriggered = Array.from(this.rules)
      .filter(r => r.priority <= 2 && ruleResults.get(r.id))
      .length;

    // Decision logic:
    // 1. If any high-priority rule is triggered, use USD₮
    // 2. If at least 2 medium-priority rules are triggered, use USD₮
    // 3. If market conditions are volatile, use USD₮
    // 4. If risk assessment is high, use USD₮

    if (highPriorityTriggered > 0) {
      return true;
    }

    if (triggeredRules >= 2) {
      return true;
    }

    if (context.marketConditions.volatility > 50) {
      return true;
    }

    if (context.riskAssessment.overallRisk > 60) {
      return true;
    }

    // Check for specific transaction types that benefit from USD₮
    if (context.transactionDetails.urgency === "critical" || context.transactionDetails.urgency === "high") {
      return true;
    }

    if (context.transactionDetails.isCrossChain) {
      return true;
    }

    return false;
  }

  /**
   * Determine the role USD₮ will play
   */
  private determineRole(ruleResults: Map<string, boolean>, context: DecisionContext): USDTUsageRole {
    // Priority-based role determination
    const triggeredRules = Array.from(this.rules)
      .filter(r => ruleResults.get(r.id))
      .sort((a, b) => a.priority - b.priority);

    if (triggeredRules.length > 0) {
      const topRule = triggeredRules[0];
      
      // Map rule to role
      switch (topRule.id) {
        case "stable_settlement":
          return USDTUsageRole.SETTLEMENT_LAYER;
        case "liquidity_provision":
          return USDTUsageRole.BASE_ASSET;
        case "price_stability":
          return USDTUsageRole.QUOTE_ASSET;
        case "cross_chain":
          return USDTUsageRole.SETTLEMENT_LAYER;
        default:
          return USDTUsageRole.BASE_ASSET;
      }
    }

    // Default role based on transaction type
    switch (context.transactionDetails.type) {
      case "swap":
        return USDTUsageRole.BASE_ASSET;
      case "deposit":
      case "withdraw":
        return USDTUsageRole.COLLATERAL;
      case "borrow":
      case "repay":
        return USDTUsageRole.SETTLEMENT_LAYER;
      default:
        return USDTUsageRole.BASE_ASSET;
    }
  }

  /**
   * Generate reasoning for the decision
   */
  private generateReasoning(
    ruleResults: Map<string, boolean>,
    context: DecisionContext,
    shouldUseUSDT: boolean
  ): string {
    if (!shouldUseUSDT) {
      return "Market conditions are stable and risk is low. Alternative assets provide better efficiency.";
    }

    const triggeredRules = Array.from(this.rules)
      .filter(r => ruleResults.get(r.id))
      .sort((a, b) => a.priority - b.priority);

    const reasons: string[] = [];

    for (const rule of triggeredRules.slice(0, 3)) {
      reasons.push(rule.description);
    }

    // Add context-specific reasoning
    if (context.marketConditions.volatility > 50) {
      reasons.push(`High market volatility (${context.marketConditions.volatility}%) requires stable asset`);
    }

    if (context.riskAssessment.overallRisk > 60) {
      reasons.push(`High risk assessment (${context.riskAssessment.overallRisk}/100) necessitates USD₮ stability`);
    }

    if (context.transactionDetails.urgency === "critical") {
      reasons.push("Critical urgency requires USD₮ for reliable execution");
    }

    if (context.transactionDetails.isCrossChain) {
      reasons.push("Cross-chain operation requires USD₮ for consistent settlement");
    }

    return reasons.join(". ");
  }

  /**
   * Calculate confidence in the decision
   */
  private calculateConfidence(ruleResults: Map<string, boolean>, context: DecisionContext): number {
    let confidence = 50; // Base confidence

    // Increase confidence based on triggered rules
    const triggeredRules = Array.from(ruleResults.values()).filter(r => r).length;
    confidence += triggeredRules * 10;

    // Increase confidence based on rule priority
    const highPriorityTriggered = Array.from(this.rules)
      .filter(r => r.priority <= 2 && ruleResults.get(r.id))
      .length;
    confidence += highPriorityTriggered * 15;

    // Adjust based on market conditions
    if (context.marketConditions.volatility > 50) {
      confidence += 10;
    }

    if (context.marketConditions.priceStability > 99) {
      confidence += 5;
    }

    // Adjust based on risk assessment
    if (context.riskAssessment.overallRisk > 60) {
      confidence += 10;
    }

    // Adjust based on wallet state
    if (context.walletState.usdtBalance > ethers.parseUnits("1000", 6)) {
      confidence += 5;
    }

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Generate alternatives to USD₮
   */
  private generateAlternatives(context: DecisionContext, shouldUseUSDT: boolean): string[] {
    const alternatives: string[] = [];

    if (!shouldUseUSDT) {
      alternatives.push("USDC - Alternative stablecoin with lower fees");
      alternatives.push("DAI - Decentralized stablecoin");
      alternatives.push("Native ETH - For gas-efficient transactions");
    } else {
      alternatives.push("USDC - If USD₮ liquidity is insufficient");
      alternatives.push("DAI - If decentralized settlement is preferred");
    }

    // Add context-specific alternatives
    if (context.transactionDetails.type === "swap") {
      alternatives.push("Direct token-to-token swap via DEX");
    }

    if (context.transactionDetails.isCrossChain) {
      alternatives.push("Native bridge tokens");
    }

    return alternatives;
  }

  /**
   * Estimate gas cost for USD₮ transaction
   */
  private estimateGasCost(context: DecisionContext): bigint {
    const baseGas = 21000n; // Base transaction gas
    const transferGas = 65000n; // ERC20 transfer gas
    const approvalGas = 46000n; // ERC20 approval gas

    let totalGas = baseGas;

    // Add gas based on transaction type
    switch (context.transactionDetails.type) {
      case "swap":
        totalGas += transferGas + approvalGas + 150000n; // Swap gas
        break;
      case "deposit":
      case "withdraw":
        totalGas += transferGas + approvalGas + 100000n;
        break;
      case "borrow":
      case "repay":
        totalGas += transferGas + approvalGas + 120000n;
        break;
      case "transfer":
        totalGas += transferGas;
        break;
    }

    // Adjust for network congestion
    const congestionMultiplier = 1 + (context.networkState.networkCongestion / 100);
    totalGas = BigInt(Math.floor(Number(totalGas) * congestionMultiplier));

    return totalGas * context.marketConditions.gasPrice;
  }

  /**
   * Estimate slippage for USD₮ transaction
   */
  private estimateSlippage(context: DecisionContext): number {
    let slippage = 10; // Base slippage (0.1%)

    // Adjust based on liquidity
    const liquidityRatio = Number(context.transactionDetails.requiredLiquidity) / Number(context.marketConditions.liquidityDepth);
    slippage += liquidityRatio * 100;

    // Adjust based on volatility
    slippage += context.marketConditions.volatility * 0.5;

    // Adjust based on urgency
    switch (context.transactionDetails.urgency) {
      case "critical":
        slippage += 50;
        break;
      case "high":
        slippage += 30;
        break;
      case "medium":
        slippage += 15;
        break;
    }

    return Math.min(100, Math.max(5, Math.round(slippage)));
  }

  /**
   * Generate expected outcome description
   */
  private generateExpectedOutcome(shouldUseUSDT: boolean, context: DecisionContext): string {
    if (!shouldUseUSDT) {
      return "Transaction will proceed with alternative assets, potentially achieving better efficiency but with higher volatility exposure.";
    }

    const outcomes: string[] = [];

    outcomes.push("USD₮ provides stable value preservation");

    if (context.marketConditions.volatility > 50) {
      outcomes.push("reduces exposure to market volatility");
    }

    if (context.riskAssessment.overallRisk > 60) {
      outcomes.push("mitigates liquidation and slippage risks");
    }

    if (context.transactionDetails.urgency === "critical") {
      outcomes.push("ensures reliable execution under time pressure");
    }

    if (context.transactionDetails.isCrossChain) {
      outcomes.push("provides consistent settlement across chains");
    }

    return outcomes.join(", ") + ".";
  }

  /**
   * Assess risk level of the decision
   */
  private assessRiskLevel(context: DecisionContext): "low" | "medium" | "high" {
    const riskScore = (
      context.riskAssessment.overallRisk +
      context.marketConditions.volatility +
      context.networkState.networkCongestion
    ) / 3;

    if (riskScore < 30) return "low";
    if (riskScore < 60) return "medium";
    return "high";
  }

  /**
   * Generate unique decision ID
   */
  private generateDecisionId(): string {
    return `usdt-decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a custom decision rule
   */
  addCustomRule(rule: USDTDecisionRule): void {
    this.customRules.set(rule.id, rule);
    this.rules.push(rule);
    console.log(`[USD₮ Decision Engine] Custom rule added: ${rule.name}`);
  }

  /**
   * Remove a custom decision rule
   */
  removeCustomRule(ruleId: string): boolean {
    if (this.customRules.has(ruleId)) {
      this.customRules.delete(ruleId);
      this.rules = this.rules.filter(r => r.id !== ruleId);
      console.log(`[USD₮ Decision Engine] Custom rule removed: ${ruleId}`);
      return true;
    }
    return false;
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      console.log(`[USD₮ Decision Engine] Rule "${rule.name}" ${enabled ? "enabled" : "disabled"}`);
      return true;
    }
    return false;
  }

  /**
   * Update decision thresholds
   */
  updateThresholds(thresholds: Partial<USDTDecisionThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log("[USD₮ Decision Engine] Thresholds updated");
  }

  /**
   * Get decision history
   */
  getDecisionHistory(): DecisionHistory[] {
    return [...this.decisionHistory];
  }

  /**
   * Get recent decisions
   */
  getRecentDecisions(count: number = 10): DecisionHistory[] {
    return this.decisionHistory.slice(-count);
  }

  /**
   * Record execution result for a decision
   */
  recordExecutionResult(decisionId: string, result: DecisionHistory["executionResult"]): boolean {
    const historyEntry = this.decisionHistory.find(h => h.decisionId === decisionId);
    if (historyEntry) {
      historyEntry.executionResult = result;
      console.log(`[USD₮ Decision Engine] Execution result recorded for ${decisionId}`);
      return true;
    }
    return false;
  }

  /**
   * Get decision statistics
   */
  getStatistics(): {
    totalDecisions: number;
    usdtUsedCount: number;
    usdtNotUsedCount: number;
    averageConfidence: number;
    successRate: number;
  } {
    const total = this.decisionHistory.length;
    const usdtUsed = this.decisionHistory.filter(h => h.decision.shouldUseUSDT).length;
    const usdtNotUsed = total - usdtUsed;
    const avgConfidence = total > 0
      ? this.decisionHistory.reduce((sum, h) => sum + h.decision.confidence, 0) / total
      : 0;
    const successful = this.decisionHistory.filter(h => h.executionResult?.success).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      totalDecisions: total,
      usdtUsedCount: usdtUsed,
      usdtNotUsedCount: usdtNotUsed,
      averageConfidence: Math.round(avgConfidence),
      successRate: Math.round(successRate),
    };
  }
}