// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — Lending Protocol Operations
// Handles Aave V3 lending operations with health factor awareness
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import {
  LendingProtocol,
  StrategyAction,
  ActionType,
  ExecutionResult,
  ProtocolState,
  ExecutionContext,
  Position,
  ProtocolType,
} from "./strategy-types";

// Aave V3 Pool ABI (simplified)
const AAVE_V3_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
  "function withdraw(address asset, uint256 amount, address to) external returns (uint256)",
  "function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external",
  "function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external returns (uint256)",
  "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
  "function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint256 liquidityIndex, uint256 variableBorrowIndex, uint256 currentLiquidityRate, uint256 currentVariableBorrowRate, uint256 currentStableBorrowRate, uint256 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id, address oracle))",
];

// Aave V3 Pool addresses
const AAVE_V3_POOLS = {
  MAINNET: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  SEPOLIA: "0x6Ae43d3271ff6888e21Fc4892383208583B77119",
};

// Interest rate modes
const InterestRateMode = {
  NONE: 0,
  STABLE: 1,
  VARIABLE: 2,
};

export class LendingOperations {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private pool: ethers.Contract;
  private executionHistory: ExecutionResult[] = [];

  constructor(
    provider: ethers.JsonRpcProvider,
    wallet: ethers.Wallet,
    network: "mainnet" | "sepolia" = "sepolia"
  ) {
    this.provider = provider;
    this.wallet = wallet;

    const poolAddress = network === "mainnet" ? AAVE_V3_POOLS.MAINNET : AAVE_V3_POOLS.SEPOLIA;
    this.pool = new ethers.Contract(poolAddress, AAVE_V3_POOL_ABI, this.wallet);

    console.log(`[Lending Operations] Aave V3 Pool initialized: ${poolAddress}`);
  }

  /**
   * Get user account data from Aave
   */
  async getUserAccountData(userAddress: string): Promise<any> {
    try {
      const data = await this.pool.getUserAccountData(userAddress);
      return {
        totalCollateralBase: data.totalCollateralBase,
        totalDebtBase: data.totalDebtBase,
        availableBorrowsBase: data.availableBorrowsBase,
        currentLiquidationThreshold: data.currentLiquidationThreshold,
        ltv: data.ltv,
        healthFactor: data.healthFactor,
      };
    } catch (error: any) {
      console.error(`[Lending Operations] Failed to get user data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get reserve data for a token
   */
  async getReserveData(tokenAddress: string): Promise<any> {
    try {
      const data = await this.pool.getReserveData(tokenAddress);
      return {
        liquidityIndex: data.liquidityIndex,
        currentLiquidityRate: data.currentLiquidityRate,
        currentVariableBorrowRate: data.currentVariableBorrowRate,
        currentStableBorrowRate: data.currentStableBorrowRate,
        aTokenAddress: data.aTokenAddress,
        variableDebtTokenAddress: data.variableDebtTokenAddress,
        stableDebtTokenAddress: data.stableDebtTokenAddress,
      };
    } catch (error: any) {
      console.error(`[Lending Operations] Failed to get reserve data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supply assets to Aave
   */
  async supply(action: StrategyAction): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[Lending Operations] Supplying: ${action.amount} ${action.tokenIn}`);

    try {
      const tx = await this.pool.supply(
        action.tokenIn,
        action.amount,
        this.wallet.address,
        0 // referral code
      );

      const receipt = await tx.wait();

      const rawGasPrice =
        (receipt as any).gasPrice ?? (receipt as any).effectiveGasPrice ?? 0n;
      const gasPrice: bigint =
        typeof rawGasPrice === "bigint" ? rawGasPrice : BigInt(rawGasPrice);

      const result: ExecutionResult = {
        actionId: action.id,
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        gasCost: receipt.gasUsed * gasPrice,
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
      };

      this.executionHistory.push(result);
      console.log(`[Lending Operations] Supply executed: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[Lending Operations] Supply failed: ${error.message}`);

      const result: ExecutionResult = {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      this.executionHistory.push(result);
      return result;
    }
  }

  /**
   * Withdraw assets from Aave
   */
  async withdraw(action: StrategyAction): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[Lending Operations] Withdrawing: ${action.amount} ${action.tokenIn}`);

    try {
      const tx = await this.pool.withdraw(
        action.tokenIn,
        action.amount,
        this.wallet.address
      );

      const receipt = await tx.wait();

      const rawGasPrice =
        (receipt as any).gasPrice ?? (receipt as any).effectiveGasPrice ?? 0n;
      const gasPrice: bigint =
        typeof rawGasPrice === "bigint" ? rawGasPrice : BigInt(rawGasPrice);

      const result: ExecutionResult = {
        actionId: action.id,
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        gasCost: receipt.gasUsed * gasPrice,
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
      };

      this.executionHistory.push(result);
      console.log(`[Lending Operations] Withdraw executed: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[Lending Operations] Withdraw failed: ${error.message}`);

      const result: ExecutionResult = {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      this.executionHistory.push(result);
      return result;
    }
  }

  /**
   * Borrow assets from Aave
   */
  async borrow(action: StrategyAction): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[Lending Operations] Borrowing: ${action.amount} ${action.tokenOut}`);

    try {
      // Check health factor before borrowing
      const userData = await this.getUserAccountData(this.wallet.address);
      const healthFactor = Number(userData.healthFactor) / 1e18;

      if (healthFactor < 1.5) {
        throw new Error(`Health factor too low: ${healthFactor.toFixed(2)}`);
      }

      const tx = await this.pool.borrow(
        action.tokenOut!,
        action.amount,
        InterestRateMode.VARIABLE,
        0, // referral code
        this.wallet.address
      );

      const receipt = await tx.wait();

      const rawGasPrice =
        (receipt as any).gasPrice ?? (receipt as any).effectiveGasPrice ?? 0n;
      const gasPrice: bigint =
        typeof rawGasPrice === "bigint" ? rawGasPrice : BigInt(rawGasPrice);

      const result: ExecutionResult = {
        actionId: action.id,
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        gasCost: receipt.gasUsed * gasPrice,
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
      };

      this.executionHistory.push(result);
      console.log(`[Lending Operations] Borrow executed: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[Lending Operations] Borrow failed: ${error.message}`);

      const result: ExecutionResult = {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      this.executionHistory.push(result);
      return result;
    }
  }

  /**
   * Repay borrowed assets to Aave
   */
  async repay(action: StrategyAction): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[Lending Operations] Repaying: ${action.amount} ${action.tokenIn}`);

    try {
      const tx = await this.pool.repay(
        action.tokenIn,
        action.amount,
        InterestRateMode.VARIABLE,
        this.wallet.address
      );

      const receipt = await tx.wait();

      const rawGasPrice =
        (receipt as any).gasPrice ?? (receipt as any).effectiveGasPrice ?? 0n;
      const gasPrice: bigint =
        typeof rawGasPrice === "bigint" ? rawGasPrice : BigInt(rawGasPrice);

      const result: ExecutionResult = {
        actionId: action.id,
        success: true,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        gasCost: receipt.gasUsed * gasPrice,
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
      };

      this.executionHistory.push(result);
      console.log(`[Lending Operations] Repay executed: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[Lending Operations] Repay failed: ${error.message}`);

      const result: ExecutionResult = {
        actionId: action.id,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      this.executionHistory.push(result);
      return result;
    }
  }

  /**
   * Get protocol state for Aave
   */
  async getProtocolState(): Promise<ProtocolState> {
    try {
      // Get reserve data for major tokens
      const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

      const wethData = await this.getReserveData(wethAddress);
      const usdcData = await this.getReserveData(usdcAddress);

      // Calculate utilization rate
      const liquidityRate = Number(wethData.currentLiquidityRate);
      const borrowRate = Number(wethData.currentVariableBorrowRate);
      const utilizationRate = borrowRate / (liquidityRate + borrowRate) * 100;

      // Calculate APY (simplified)
      const supplyAPY = (liquidityRate / 1e25) * 100; // Ray to percentage
      const borrowAPY = (borrowRate / 1e25) * 100;

      return {
        protocolType: ProtocolType.LENDING,
        protocolName: "Aave V3",
        address: this.pool.target as string,
        isActive: true,
        utilizationRate: Math.min(100, utilizationRate),
        apy: supplyAPY,
        lastUpdated: Date.now(),
      };
    } catch (error: any) {
      console.error(`[Lending Operations] Failed to get protocol state: ${error.message}`);
      return {
        protocolType: ProtocolType.LENDING,
        protocolName: "Aave V3",
        address: this.pool.target as string,
        isActive: false,
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * Get user positions from Aave
   */
  async getUserPositions(userAddress: string): Promise<Position[]> {
    try {
      const userData = await this.getUserAccountData(userAddress);
      const positions: Position[] = [];

      // In production, you'd query aToken and debtToken contracts for actual balances
      // For now, create a simplified position based on account data

      if (userData.totalCollateralBase > 0) {
        positions.push({
          protocol: ProtocolType.LENDING,
          protocolName: "Aave V3",
          tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          tokenSymbol: "WETH",
          amount: userData.totalCollateralBase,
          valueUSD: Number(userData.totalCollateralBase) / 1e8, // Simplified conversion
          entryPrice: 2000, // Placeholder
          currentPrice: 2000, // Placeholder
          pnl: 0n,
          pnlPercentage: 0,
          healthFactor: Number(userData.healthFactor) / 1e18,
          isCollateral: true,
          isBorrowed: false,
        });
      }

      if (userData.totalDebtBase > 0) {
        positions.push({
          protocol: ProtocolType.LENDING,
          protocolName: "Aave V3",
          tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          tokenSymbol: "USDC",
          amount: userData.totalDebtBase,
          valueUSD: Number(userData.totalDebtBase) / 1e6,
          entryPrice: 1,
          currentPrice: 1,
          pnl: 0n,
          pnlPercentage: 0,
          healthFactor: Number(userData.healthFactor) / 1e18,
          isCollateral: false,
          isBorrowed: true,
        });
      }

      return positions;
    } catch (error: any) {
      console.error(`[Lending Operations] Failed to get user positions: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if health factor is at risk
   */
  async isHealthFactorAtRisk(userAddress: string, threshold: number = 1.5): Promise<boolean> {
    try {
      const userData = await this.getUserAccountData(userAddress);
      const healthFactor = Number(userData.healthFactor) / 1e18;
      return healthFactor < threshold;
    } catch (error: any) {
      console.error(`[Lending Operations] Failed to check health factor: ${error.message}`);
      return false;
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): ExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Get pool contract
   */
  getPool(): ethers.Contract {
    return this.pool;
  }
}
