// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — Strategy Executor
// Coordinates execution of strategy plans across protocols
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import {
  StrategyPlan,
  StrategyAction,
  ActionType,
  ExecutionResult,
  StrategyMetrics,
  ProtocolType,
  DEXProtocol,
} from "./strategy-types";
import { DEXOperations } from "./dex-operations";
import { LendingOperations } from "./lending-operations";

export class StrategyExecutor {
  private dexOperations: DEXOperations;
  private lendingOperations: LendingOperations;
  private executionHistory: ExecutionResult[] = [];
  private activePlans: Map<string, StrategyPlan> = new Map();
  private metrics: StrategyMetrics = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalGasSpent: 0n,
    totalGasCost: 0n,
    averageSlippage: 0,
    totalPnL: 0n,
  };

  constructor(
    provider: ethers.JsonRpcProvider,
    wallet: ethers.Wallet,
    network: "mainnet" | "sepolia" = "sepolia"
  ) {
    this.dexOperations = new DEXOperations(provider, wallet);
    this.lendingOperations = new LendingOperations(provider, wallet, network);

    console.log("[Strategy Executor] Initialized");
  }

  /**
   * Execute a complete strategy plan
   */
  async executePlan(plan: StrategyPlan): Promise<ExecutionResult[]> {
    console.log(`[Strategy Executor] Executing plan: ${plan.id}`);
    console.log(`  Strategy: ${plan.strategyType}`);
    console.log(`  Actions: ${plan.actions.length}`);
    console.log(`  Estimated gas cost: ${ethers.formatEther(plan.estimatedTotalGasCost)} ETH`);

    this.activePlans.set(plan.id, plan);

    const results: ExecutionResult[] = [];

    // Sort actions by priority
    const sortedActions = [...plan.actions].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (const action of sortedActions) {
      try {
        // Check if plan has expired
        if (Date.now() > plan.expiresAt) {
          console.warn(`[Strategy Executor] Plan ${plan.id} expired, skipping remaining actions`);
          break;
        }

        // Check gas price
        const feeData = await this.dexOperations.getProvider().getFeeData();
        if (feeData.gasPrice && feeData.gasPrice > ethers.parseUnits("50", "gwei")) {
          console.warn(`[Strategy Executor] Gas price too high: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
          break;
        }

        // Execute action
        const result = await this.executeAction(action);
        results.push(result);

        // Update metrics
        this.updateMetrics(result);

        // If critical action fails, stop execution
        if (!result.success && action.priority === "critical") {
          console.error(`[Strategy Executor] Critical action failed, stopping execution`);
          break;
        }

        // Wait between actions to avoid nonce conflicts
        await this.sleep(2000);
      } catch (error: any) {
        console.error(`[Strategy Executor] Action execution error: ${error.message}`);
        results.push({
          actionId: action.id,
          success: false,
          error: error.message,
          timestamp: Date.now(),
        });
      }
    }

    this.activePlans.delete(plan.id);
    console.log(`[Strategy Executor] Plan execution complete: ${results.filter(r => r.success).length}/${results.length} successful`);

    return results;
  }

  /**
   * Execute a single strategy action
   */
  async executeAction(action: StrategyAction): Promise<ExecutionResult> {
    console.log(`[Strategy Executor] Executing action: ${action.type}`);
    console.log(`  Protocol: ${action.protocolName}`);
    console.log(`  Priority: ${action.priority}`);
    console.log(`  Amount: ${ethers.formatEther(action.amount)}`);

    let result: ExecutionResult;

    switch (action.type) {
      case ActionType.SWAP:
        result = await this.executeSwap(action);
        break;

      case ActionType.DEPOSIT:
      case ActionType.SUPPLY:
        result = await this.executeSupply(action);
        break;

      case ActionType.WITHDRAW:
        result = await this.executeWithdraw(action);
        break;

      case ActionType.BORROW:
        result = await this.executeBorrow(action);
        break;

      case ActionType.REPAY:
        result = await this.executeRepay(action);
        break;

      case ActionType.ADD_LIQUIDITY:
        result = await this.executeAddLiquidity(action);
        break;

      case ActionType.REMOVE_LIQUIDITY:
        result = await this.executeRemoveLiquidity(action);
        break;

      case ActionType.EMERGENCY_EXIT:
        result = await this.executeEmergencyExit(action);
        break;

      default:
        result = {
          actionId: action.id,
          success: false,
          error: `Unsupported action type: ${action.type}`,
          timestamp: Date.now(),
        };
    }

    this.executionHistory.push(result);
    return result;
  }

  /**
   * Execute swap action
   */
  private async executeSwap(action: StrategyAction): Promise<ExecutionResult> {
    try {
      return await this.dexOperations.executeSwap(action, DEXProtocol.UNISWAP_V2);
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute supply/deposit action
   */
  private async executeSupply(action: StrategyAction): Promise<ExecutionResult> {
    try {
      return await this.lendingOperations.supply(action);
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute withdraw action
   */
  private async executeWithdraw(action: StrategyAction): Promise<ExecutionResult> {
    try {
      return await this.lendingOperations.withdraw(action);
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute borrow action
   */
  private async executeBorrow(action: StrategyAction): Promise<ExecutionResult> {
    try {
      return await this.lendingOperations.borrow(action);
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute repay action
   */
  private async executeRepay(action: StrategyAction): Promise<ExecutionResult> {
    try {
      return await this.lendingOperations.repay(action);
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute add liquidity action
   */
  private async executeAddLiquidity(action: StrategyAction): Promise<ExecutionResult> {
    try {
      return await this.dexOperations.addLiquidity(action, DEXProtocol.UNISWAP_V2);
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute remove liquidity action
   */
  private async executeRemoveLiquidity(action: StrategyAction): Promise<ExecutionResult> {
    try {
      return await this.dexOperations.removeLiquidity(action, DEXProtocol.UNISWAP_V2);
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute emergency exit action
   */
  private async executeEmergencyExit(action: StrategyAction): Promise<ExecutionResult> {
    console.log(`[Strategy Executor] EMERGENCY EXIT triggered`);

    // Emergency exit prioritizes speed over optimal execution
    try {
      // Try to withdraw from lending protocol first
      if (action.protocol === ProtocolType.LENDING) {
        return await this.lendingOperations.withdraw(action);
      }
      // Otherwise, swap to stable asset
      else if (action.tokenOut) {
        return await this.dexOperations.executeSwap(action, DEXProtocol.UNISWAP_V2);
      }
      else {
        throw new Error("No valid emergency exit path");
      }
    } catch (error: any) {
      return {
        actionId: action.id,
        success: false,
        error: `Emergency exit failed: ${error.message}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Update execution metrics
   */
  private updateMetrics(result: ExecutionResult): void {
    this.metrics.totalExecutions++;

    if (result.success) {
      this.metrics.successfulExecutions++;
      if (result.gasUsed) {
        this.metrics.totalGasSpent += result.gasUsed;
      }
      if (result.gasCost) {
        this.metrics.totalGasCost += result.gasCost;
      }
      if (result.actualSlippage !== undefined) {
        // Update average slippage
        const totalSlippage = this.metrics.averageSlippage * (this.metrics.successfulExecutions - 1);
        this.metrics.averageSlippage = (totalSlippage + result.actualSlippage) / this.metrics.successfulExecutions;
      }
    } else {
      this.metrics.failedExecutions++;
    }
  }

  /**
   * Get execution metrics
   */
  getMetrics(): StrategyMetrics {
    return { ...this.metrics };
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): ExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Get active plans
   */
  getActivePlans(): StrategyPlan[] {
    return Array.from(this.activePlans.values());
  }

  /**
   * Cancel an active plan
   */
  cancelPlan(planId: string): boolean {
    if (this.activePlans.has(planId)) {
      this.activePlans.delete(planId);
      console.log(`[Strategy Executor] Plan cancelled: ${planId}`);
      return true;
    }
    return false;
  }

  /**
   * Get DEX operations handler
   */
  getDEXOperations(): DEXOperations {
    return this.dexOperations;
  }

  /**
   * Get lending operations handler
   */
  getLendingOperations(): LendingOperations {
    return this.lendingOperations;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
