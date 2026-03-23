// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — Strategy Planner
// AI-powered strategy generation with risk awareness
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import {
  StrategyType,
  StrategyPlan,
  StrategyAction,
  ActionType,
  ExecutionContext,
  MarketConditions,
  RiskAssessment,
  StrategyParameters,
  ProtocolState,
  Position,
  SlippageCalculation,
  RiskLimits,
} from "./strategy-types";

export class StrategyPlanner {
  private riskLimits: RiskLimits;
  private strategyHistory: StrategyPlan[] = [];
  private activeStrategies: Map<string, StrategyPlan> = new Map();

  constructor(riskLimits?: Partial<RiskLimits>) {
    this.riskLimits = {
      maxPositionSize: riskLimits?.maxPositionSize ?? ethers.parseEther("100"),
      maxDailyVolume: riskLimits?.maxDailyVolume ?? ethers.parseEther("1000"),
      maxSlippage: riskLimits?.maxSlippage ?? 50, // 0.5%
      maxGasPrice: riskLimits?.maxGasPrice ?? ethers.parseUnits("50", "gwei"),
      minHealthFactor: riskLimits?.minHealthFactor ?? 1.5,
      maxUtilizationRate: riskLimits?.maxUtilizationRate ?? 0.8,
      stopLossPercentage: riskLimits?.stopLossPercentage ?? 10, // 10%
      takeProfitPercentage: riskLimits?.takeProfitPercentage ?? 20, // 20%
    };
  }

  /**
   * Generate a strategy plan based on current conditions
   */
  async generateStrategy(
    context: ExecutionContext,
    positions: Position[],
    protocolStates: Map<string, ProtocolState>,
    objective?: string
  ): Promise<StrategyPlan> {
    console.log("[Strategy Planner] Generating strategy plan...");

    // Analyze current situation
    const analysis = this.analyzeSituation(context, positions, protocolStates);

    // Determine strategy type
    const strategyType = this.determineStrategyType(analysis, context);

    // Generate actions
    const actions = await this.generateActions(
      strategyType,
      context,
      positions,
      protocolStates,
      analysis
    );

    // Calculate estimates
    const estimates = this.calculateEstimates(actions, context);

    // Create plan
    const plan: StrategyPlan = {
      id: this.generatePlanId(),
      strategyType,
      objective: objective || this.generateObjective(strategyType, analysis),
      actions,
      estimatedTotalGas: estimates.totalGas,
      estimatedTotalGasCost: estimates.totalGasCost,
      expectedPnL: estimates.expectedPnL,
      riskScore: this.calculateRiskScore(actions, context),
      confidence: this.calculateConfidence(actions, context),
      executionTime: estimates.executionTime,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
      context,
    };

    this.strategyHistory.push(plan);
    console.log(`[Strategy Planner] Strategy generated: ${strategyType} with ${actions.length} actions`);

    return plan;
  }

  /**
   * Analyze current market and position situation
   */
  private analyzeSituation(
    context: ExecutionContext,
    positions: Position[],
    protocolStates: Map<string, ProtocolState>
  ): any {
    const totalValue = positions.reduce((sum, pos) => sum + pos.valueUSD, 0);
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0n);
    const avgPnLPercentage = positions.length > 0
      ? positions.reduce((sum, pos) => sum + pos.pnlPercentage, 0) / positions.length
      : 0;

    // Check for at-risk positions
    const atRiskPositions = positions.filter(pos => {
      if (pos.healthFactor && pos.healthFactor < this.riskLimits.minHealthFactor) {
        return true;
      }
      if (pos.pnlPercentage < -this.riskLimits.stopLossPercentage) {
        return true;
      }
      return false;
    });

    // Check for profitable positions
    const profitablePositions = positions.filter(pos =>
      pos.pnlPercentage > this.riskLimits.takeProfitPercentage
    );

    return {
      totalValue,
      totalPnL,
      avgPnLPercentage,
      atRiskPositions,
      profitablePositions,
      positionCount: positions.length,
      marketVolatility: context.marketConditions.volatility,
      marketSentiment: context.marketConditions.sentiment,
      overallRisk: context.riskAssessment.overallRisk,
    };
  }

  /**
   * Determine the appropriate strategy type
   */
  private determineStrategyType(analysis: any, context: ExecutionContext): StrategyType {
    // Emergency conditions
    if (analysis.atRiskPositions.length > 0) {
      return StrategyType.EMERGENCY_EXIT;
    }

    // High risk conditions
    if (context.riskAssessment.overallRisk > 70) {
      return StrategyType.RISK_HEDGING;
    }

    // Profit taking opportunity
    if (analysis.profitablePositions.length > 0 && analysis.avgPnLPercentage > 15) {
      return StrategyType.REBALANCE;
    }

    // Bullish market with low risk
    if (context.marketConditions.sentiment === "bullish" && context.riskAssessment.overallRisk < 30) {
      return StrategyType.YIELD_FARMING;
    }

    // Default to HODL
    return StrategyType.HODL;
  }

  /**
   * Generate strategy actions
   */
  private async generateActions(
    strategyType: StrategyType,
    context: ExecutionContext,
    positions: Position[],
    protocolStates: Map<string, ProtocolState>,
    analysis: any
  ): Promise<StrategyAction[]> {
    const actions: StrategyAction[] = [];

    switch (strategyType) {
      case StrategyType.EMERGENCY_EXIT:
        actions.push(...await this.generateEmergencyActions(positions, context));
        break;

      case StrategyType.RISK_HEDGING:
        actions.push(...await this.generateHedgingActions(positions, context));
        break;

      case StrategyType.REBALANCE:
        actions.push(...await this.generateRebalanceActions(positions, context, analysis));
        break;

      case StrategyType.YIELD_FARMING:
        actions.push(...await this.generateYieldActions(positions, context, protocolStates));
        break;

      case StrategyType.HODL:
        // No actions for HODL strategy
        break;
    }

    return actions;
  }

  /**
   * Generate emergency exit actions
   */
  private async generateEmergencyActions(
    positions: Position[],
    context: ExecutionContext
  ): Promise<StrategyAction[]> {
    const actions: StrategyAction[] = [];

    for (const position of positions) {
      if (position.healthFactor && position.healthFactor < this.riskLimits.minHealthFactor) {
        // Emergency withdraw from lending protocol
        actions.push({
          id: this.generateActionId(),
          type: ActionType.WITHDRAW,
          protocol: position.protocol,
          protocolName: position.protocolName,
          targetAddress: position.tokenAddress,
          amount: position.amount,
          tokenIn: position.tokenAddress,
          minAmountOut: position.amount,
          maxSlippage: 10, // 0.1% for emergency
          estimatedGas: ethers.parseUnits("200000", "wei"),
          estimatedGasCost: ethers.parseUnits("200000", "wei") * context.gasPrice,
          priority: "critical",
          reasoning: `Emergency exit: Health factor ${position.healthFactor.toFixed(2)} below threshold ${this.riskLimits.minHealthFactor}`,
          expectedOutcome: "Withdraw position to prevent liquidation",
          riskLevel: "high",
        });
      }

      if (position.pnlPercentage < -this.riskLimits.stopLossPercentage) {
        // Stop loss action
        actions.push({
          id: this.generateActionId(),
          type: ActionType.SWAP,
          protocol: position.protocol,
          protocolName: position.protocolName,
          targetAddress: position.tokenAddress,
          amount: position.amount,
          tokenIn: position.tokenAddress,
          tokenOut: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
          minAmountOut: this.calculateMinAmountOut(position.amount, position.pnlPercentage, 10),
          maxSlippage: 20, // 0.2% for stop loss
          estimatedGas: ethers.parseUnits("150000", "wei"),
          estimatedGasCost: ethers.parseUnits("150000", "wei") * context.gasPrice,
          priority: "critical",
          reasoning: `Stop loss triggered: Position down ${position.pnlPercentage.toFixed(2)}%`,
          expectedOutcome: "Swap to stable asset to limit losses",
          riskLevel: "high",
        });
      }
    }

    return actions;
  }

  /**
   * Generate hedging actions
   */
  private async generateHedgingActions(
    positions: Position[],
    context: ExecutionContext
  ): Promise<StrategyAction[]> {
    const actions: StrategyAction[] = [];

    // Reduce exposure to volatile assets
    for (const position of positions) {
      if (position.pnlPercentage < -5 && position.amount > 0n) {
        const hedgeAmount = position.amount / 2n; // Hedge 50%

        actions.push({
          id: this.generateActionId(),
          type: ActionType.SWAP,
          protocol: position.protocol,
          protocolName: position.protocolName,
          targetAddress: position.tokenAddress,
          amount: hedgeAmount,
          tokenIn: position.tokenAddress,
          tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
          minAmountOut: this.calculateMinAmountOut(hedgeAmount, 0, 30),
          maxSlippage: 30, // 0.3%
          estimatedGas: ethers.parseUnits("150000", "wei"),
          estimatedGasCost: ethers.parseUnits("150000", "wei") * context.gasPrice,
          priority: "high",
          reasoning: `Risk hedging: Reduce exposure to ${position.tokenSymbol}`,
          expectedOutcome: "Swap 50% to stable asset to reduce risk",
          riskLevel: "medium",
        });
      }
    }

    return actions;
  }

  /**
   * Generate rebalance actions
   */
  private async generateRebalanceActions(
    positions: Position[],
    context: ExecutionContext,
    analysis: any
  ): Promise<StrategyAction[]> {
    const actions: StrategyAction[] = [];

    // Take profit on profitable positions
    for (const position of analysis.profitablePositions) {
      const takeProfitAmount = position.amount / 3n; // Take 1/3 profit

      actions.push({
        id: this.generateActionId(),
        type: ActionType.SWAP,
        protocol: position.protocol,
        protocolName: position.protocolName,
        targetAddress: position.tokenAddress,
        amount: takeProfitAmount,
        tokenIn: position.tokenAddress,
        tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        minAmountOut: this.calculateMinAmountOut(takeProfitAmount, position.pnlPercentage, 20),
        maxSlippage: 20, // 0.2%
        estimatedGas: ethers.parseUnits("150000", "wei"),
        estimatedGasCost: ethers.parseUnits("150000", "wei") * context.gasPrice,
        priority: "medium",
        reasoning: `Take profit: ${position.tokenSymbol} up ${position.pnlPercentage.toFixed(2)}%`,
        expectedOutcome: "Realize profits and rebalance to stable assets",
        riskLevel: "low",
      });
    }

    return actions;
  }

  /**
   * Generate yield farming actions
   */
  private async generateYieldActions(
    positions: Position[],
    context: ExecutionContext,
    protocolStates: Map<string, ProtocolState>
  ): Promise<StrategyAction[]> {
    const actions: StrategyAction[] = [];

    // Find best yield opportunities
    for (const [protocolName, state] of protocolStates.entries()) {
      if (state.apy && state.apy > 5 && state.isActive) {
        // Add liquidity to high-yield protocol
        const stableAmount = ethers.parseEther("10"); // 10 USDC

        actions.push({
          id: this.generateActionId(),
          type: ActionType.ADD_LIQUIDITY,
          protocol: state.protocolType,
          protocolName: state.protocolName,
          targetAddress: state.address,
          amount: stableAmount,
          tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
          minAmountOut: stableAmount,
          maxSlippage: 50, // 0.5%
          estimatedGas: ethers.parseUnits("300000", "wei"),
          estimatedGasCost: ethers.parseUnits("300000", "wei") * context.gasPrice,
          priority: "low",
          reasoning: `Yield farming: ${state.protocolName} offers ${state.apy.toFixed(2)}% APY`,
          expectedOutcome: `Generate ${state.apy.toFixed(2)}% APY on deposited assets`,
          riskLevel: "medium",
        });
      }
    }

    return actions;
  }

  /**
   * Calculate minimum amount out with slippage
   */
  private calculateMinAmountOut(amount: bigint, pnlPercentage: number, slippageBps: number): bigint {
    const slippageFactor = (10000 - slippageBps) / 10000;
    const pnlFactor = (100 + pnlPercentage) / 100;
    return (amount * BigInt(Math.floor(slippageFactor * pnlFactor * 10000))) / 10000n;
  }

  /**
   * Calculate estimates for the plan
   */
  private calculateEstimates(actions: StrategyAction[], context: ExecutionContext): any {
    const totalGas = actions.reduce((sum, action) => sum + action.estimatedGas, 0n);
    const totalGasCost = actions.reduce((sum, action) => sum + action.estimatedGasCost, 0n);
    const expectedPnL = actions.reduce((sum, action) => {
      // Estimate PnL based on action type and priority
      if (action.priority === "critical") {
        return sum - ethers.parseEther("0.1"); // Loss mitigation
      } else if (action.priority === "medium") {
        return sum + ethers.parseEther("0.05"); // Profit taking
      }
      return sum;
    }, 0n);

    const executionTime = actions.length * 5000; // 5 seconds per action

    return {
      totalGas,
      totalGasCost,
      expectedPnL,
      executionTime,
    };
  }

  /**
   * Calculate risk score for the plan
   */
  private calculateRiskScore(actions: StrategyAction[], context: ExecutionContext): number {
    let riskScore = 0;

    for (const action of actions) {
      if (action.priority === "critical") riskScore += 30;
      else if (action.priority === "high") riskScore += 20;
      else if (action.priority === "medium") riskScore += 10;
      else riskScore += 5;

      if (action.riskLevel === "high") riskScore += 15;
      else if (action.riskLevel === "medium") riskScore += 10;
    }

    // Add market risk
    riskScore += context.riskAssessment.overallRisk * 0.3;

    return Math.min(100, Math.round(riskScore));
  }

  /**
   * Calculate confidence score for the plan
   */
  private calculateConfidence(actions: StrategyAction[], context: ExecutionContext): number {
    let confidence = 80;

    // Reduce confidence based on market volatility
    confidence -= context.marketConditions.volatility * 0.3;

    // Increase confidence based on action count
    confidence += Math.min(10, actions.length * 2);

    return Math.min(100, Math.max(0, Math.round(confidence)));
  }

  /**
   * Generate objective description
   */
  private generateObjective(strategyType: StrategyType, analysis: any): string {
    switch (strategyType) {
      case StrategyType.EMERGENCY_EXIT:
        return "Emergency exit to prevent liquidation and limit losses";
      case StrategyType.RISK_HEDGING:
        return "Reduce exposure and hedge against market volatility";
      case StrategyType.REBALANCE:
        return "Take profits and rebalance portfolio to optimal allocation";
      case StrategyType.YIELD_FARMING:
        return "Generate yield through strategic liquidity provision";
      case StrategyType.HODL:
        return "Maintain current positions and monitor market conditions";
      default:
        return "Execute optimal strategy based on current conditions";
    }
  }

  /**
   * Generate unique plan ID
   */
  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique action ID
   */
  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get strategy history
   */
  getHistory(): StrategyPlan[] {
    return [...this.strategyHistory];
  }

  /**
   * Get active strategies
   */
  getActiveStrategies(): StrategyPlan[] {
    return Array.from(this.activeStrategies.values());
  }

  /**
   * Activate a strategy
   */
  activateStrategy(plan: StrategyPlan): void {
    this.activeStrategies.set(plan.id, plan);
    console.log(`[Strategy Planner] Strategy activated: ${plan.id}`);
  }

  /**
   * Deactivate a strategy
   */
  deactivateStrategy(planId: string): void {
    this.activeStrategies.delete(planId);
    console.log(`[Strategy Planner] Strategy deactivated: ${planId}`);
  }
}