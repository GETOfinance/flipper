// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — USD₮ WDK Integration
// Wallet Development Kit integration for USD₮ operations
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import {
  USDT_CONTRACT_ADDRESS,
  USDT_ABI,
  USDT_METADATA,
  WDKUSDTConfig,
  getUSDTAddress,
  isUSDTSupported,
  formatUSDT,
  parseUSDT,
} from "./usdt-config";
import { USDTUsageRole, USDTDecision } from "./usdt-decision-engine";

// WDK Wallet Interface (simplified for integration)
export interface WDKWallet {
  address: string;
  chainId: number;
  provider: ethers.JsonRpcProvider;
  signer: ethers.Wallet;
}

// USD₮ Balance
export interface USDTBalance {
  address: string;
  balance: bigint;
  formattedBalance: string;
  decimals: number;
  symbol: string;
}

// USD₮ Transaction
export interface USDTTransaction {
  hash: string;
  from: string;
  to: string;
  amount: bigint;
  formattedAmount: string;
  timestamp: number;
  blockNumber: number;
  status: "pending" | "success" | "failed";
}

// USD₮ Approval
export interface USDTApproval {
  owner: string;
  spender: string;
  amount: bigint;
  formattedAmount: string;
  timestamp: number;
}

// USD₮ Operation Result
export interface USDTOperationResult {
  success: boolean;
  operation: string;
  txHash?: string;
  error?: string;
  gasUsed?: bigint;
  gasCost?: bigint;
  timestamp: number;
}

/**
 * USD₮ WDK Integration Manager
 * Handles USD₮ operations through WDK wallet
 */
export class USDTWDKIntegration {
  private config: WDKUSDTConfig;
  private wallet: WDKWallet;
  private usdtContract: ethers.Contract;
  private transactionHistory: USDTTransaction[] = [];
  private approvalHistory: USDTApproval[] = [];

  constructor(wallet: WDKWallet, config?: Partial<WDKUSDTConfig>) {
    this.wallet = wallet;
    this.config = {
      enabled: true,
      network: "ethereum",
      walletAddress: wallet.address,
      autoApprove: false,
      maxApprovalAmount: ethers.parseUnits("1000000", 6), // 1M USDT
      useMCP: false,
      ...config,
    };

    // Initialize USD₮ contract
    const usdtAddress = getUSDTAddress(this.config.network);
    this.usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, wallet.signer);

    console.log(`[USD₮ WDK Integration] Initialized for ${wallet.address}`);
    console.log(`  Network: ${this.config.network}`);
    console.log(`  USD₮ Address: ${usdtAddress}`);
  }

  /**
   * Get USD₮ balance
   */
  async getBalance(): Promise<USDTBalance> {
    try {
      const balance = await this.usdtContract.balanceOf(this.wallet.address);

      const balanceInfo: USDTBalance = {
        address: this.wallet.address,
        balance,
        formattedBalance: formatUSDT(balance),
        decimals: USDT_METADATA.decimals,
        symbol: USDT_METADATA.symbol,
      };

      console.log(`[USD₮ WDK Integration] Balance: ${balanceInfo.formattedBalance} ${balanceInfo.symbol}`);
      return balanceInfo;
    } catch (error: any) {
      console.error(`[USD₮ WDK Integration] Failed to get balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transfer USD₮
   */
  async transfer(to: string, amount: bigint): Promise<USDTOperationResult> {
    console.log(`[USD₮ WDK Integration] Transferring ${formatUSDT(amount)} USDT to ${to}`);

    try {
      const tx = await this.usdtContract.transfer(to, amount);
      const receipt = await tx.wait();

      const rawGasPrice =
        (receipt as any).gasPrice ?? (receipt as any).effectiveGasPrice ?? 0n;
      const gasPrice: bigint =
        typeof rawGasPrice === "bigint" ? rawGasPrice : BigInt(rawGasPrice);

      const result: USDTOperationResult = {
        success: true,
        operation: "transfer",
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        gasCost: receipt.gasUsed * gasPrice,
        timestamp: Date.now(),
      };

      // Record transaction
      this.transactionHistory.push({
        hash: receipt.hash,
        from: this.wallet.address,
        to,
        amount,
        formattedAmount: formatUSDT(amount),
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
        status: "success",
      });

      console.log(`[USD₮ WDK Integration] Transfer successful: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[USD₮ WDK Integration] Transfer failed: ${error.message}`);

      return {
        success: false,
        operation: "transfer",
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Approve USD₮ spending
   */
  async approve(spender: string, amount: bigint): Promise<USDTOperationResult> {
    console.log(`[USD₮ WDK Integration] Approving ${formatUSDT(amount)} USDT for ${spender}`);

    try {
      // Check if auto-approve is enabled and amount is within limit
      if (this.config.autoApprove && amount > this.config.maxApprovalAmount) {
        throw new Error(`Amount exceeds max approval limit: ${formatUSDT(this.config.maxApprovalAmount)} USDT`);
      }

      const tx = await this.usdtContract.approve(spender, amount);
      const receipt = await tx.wait();

      const rawGasPrice =
        (receipt as any).gasPrice ?? (receipt as any).effectiveGasPrice ?? 0n;
      const gasPrice: bigint =
        typeof rawGasPrice === "bigint" ? rawGasPrice : BigInt(rawGasPrice);

      const result: USDTOperationResult = {
        success: true,
        operation: "approve",
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        gasCost: receipt.gasUsed * gasPrice,
        timestamp: Date.now(),
      };

      // Record approval
      this.approvalHistory.push({
        owner: this.wallet.address,
        spender,
        amount,
        formattedAmount: formatUSDT(amount),
        timestamp: Date.now(),
      });

      console.log(`[USD₮ WDK Integration] Approval successful: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[USD₮ WDK Integration] Approval failed: ${error.message}`);

      return {
        success: false,
        operation: "approve",
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get allowance
   */
  async getAllowance(owner: string, spender: string): Promise<bigint> {
    try {
      const allowance = await this.usdtContract.allowance(owner, spender);
      console.log(`[USD₮ WDK Integration] Allowance: ${formatUSDT(allowance)} USDT`);
      return allowance;
    } catch (error: any) {
      console.error(`[USD₮ WDK Integration] Failed to get allowance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transfer USD₮ from another address (requires approval)
   */
  async transferFrom(from: string, to: string, amount: bigint): Promise<USDTOperationResult> {
    console.log(`[USD₮ WDK Integration] Transferring ${formatUSDT(amount)} USDT from ${from} to ${to}`);

    try {
      const tx = await this.usdtContract.transferFrom(from, to, amount);
      const receipt = await tx.wait();

      const rawGasPrice =
        (receipt as any).gasPrice ?? (receipt as any).effectiveGasPrice ?? 0n;
      const gasPrice: bigint =
        typeof rawGasPrice === "bigint" ? rawGasPrice : BigInt(rawGasPrice);

      const result: USDTOperationResult = {
        success: true,
        operation: "transferFrom",
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        gasCost: receipt.gasUsed * gasPrice,
        timestamp: Date.now(),
      };

      // Record transaction
      this.transactionHistory.push({
        hash: receipt.hash,
        from,
        to,
        amount,
        formattedAmount: formatUSDT(amount),
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
        status: "success",
      });

      console.log(`[USD₮ WDK Integration] TransferFrom successful: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[USD₮ WDK Integration] TransferFrom failed: ${error.message}`);

      return {
        success: false,
        operation: "transferFrom",
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute USD₮ operation based on decision
   */
  async executeDecision(decision: USDTDecision, params: {
    to?: string;
    amount?: bigint;
    spender?: string;
  }): Promise<USDTOperationResult> {
    console.log(`[USD₮ WDK Integration] Executing decision: ${decision.decisionId}`);
    console.log(`  Role: ${decision.role}`);
    console.log(`  Reasoning: ${decision.reasoning}`);

    if (!decision.shouldUseUSDT) {
      return {
        success: false,
        operation: "none",
        error: "Decision indicates USD₮ should not be used",
        timestamp: Date.now(),
      };
    }

    try {
      // Execute based on role
      switch (decision.role) {
        case USDTUsageRole.BASE_ASSET:
          return await this.executeAsBaseAsset(params);
        case USDTUsageRole.QUOTE_ASSET:
          return await this.executeAsQuoteAsset(params);
        case USDTUsageRole.SETTLEMENT_LAYER:
          return await this.executeAsSettlementLayer(params);
        case USDTUsageRole.COLLATERAL:
          return await this.executeAsCollateral(params);
        case USDTUsageRole.STABLE_RESERVE:
          return await this.executeAsStableReserve(params);
        default:
          throw new Error(`Unknown role: ${decision.role}`);
      }
    } catch (error: any) {
      console.error(`[USD₮ WDK Integration] Decision execution failed: ${error.message}`);

      return {
        success: false,
        operation: "decision_execution",
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute USD₮ as base asset
   */
  private async executeAsBaseAsset(params: any): Promise<USDTOperationResult> {
    if (!params.to || !params.amount) {
      throw new Error("Missing required parameters: to, amount");
    }

    return await this.transfer(params.to, params.amount);
  }

  /**
   * Execute USD₮ as quote asset
   */
  private async executeAsQuoteAsset(params: any): Promise<USDTOperationResult> {
    if (!params.spender || !params.amount) {
      throw new Error("Missing required parameters: spender, amount");
    }

    return await this.approve(params.spender, params.amount);
  }

  /**
   * Execute USD₮ as settlement layer
   */
  private async executeAsSettlementLayer(params: any): Promise<USDTOperationResult> {
    if (!params.to || !params.amount) {
      throw new Error("Missing required parameters: to, amount");
    }

    return await this.transfer(params.to, params.amount);
  }

  /**
   * Execute USD₮ as collateral
   */
  private async executeAsCollateral(params: any): Promise<USDTOperationResult> {
    if (!params.spender || !params.amount) {
      throw new Error("Missing required parameters: spender, amount");
    }

    return await this.approve(params.spender, params.amount);
  }

  /**
   * Execute USD₮ as stable reserve
   */
  private async executeAsStableReserve(params: any): Promise<USDTOperationResult> {
    // For stable reserve, we just hold the USD₮
    return {
      success: true,
      operation: "hold",
      timestamp: Date.now(),
    };
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(): USDTTransaction[] {
    return [...this.transactionHistory];
  }

  /**
   * Get approval history
   */
  getApprovalHistory(): USDTApproval[] {
    return [...this.approvalHistory];
  }

  /**
   * Get wallet info
   */
  getWalletInfo(): WDKWallet {
    return { ...this.wallet };
  }

  /**
   * Get configuration
   */
  getConfig(): WDKUSDTConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WDKUSDTConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("[USD₮ WDK Integration] Configuration updated");
  }

  /**
   * Check if USD₮ is supported on current network
   */
  isSupported(): boolean {
    return isUSDTSupported(this.config.network);
  }

  /**
   * Get USD₮ contract
   */
  getContract(): ethers.Contract {
    return this.usdtContract;
  }

  /**
   * Estimate gas for operation
   */
  async estimateGas(operation: string, params: any): Promise<bigint> {
    try {
      switch (operation) {
        case "transfer":
          return await this.usdtContract.transfer.estimateGas(params.to, params.amount);
        case "approve":
          return await this.usdtContract.approve.estimateGas(params.spender, params.amount);
        case "transferFrom":
          return await this.usdtContract.transferFrom.estimateGas(params.from, params.to, params.amount);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      console.error(`[USD₮ WDK Integration] Gas estimation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch approve multiple spenders
   */
  async batchApprove(spenders: Array<{ address: string; amount: bigint }>): Promise<USDTOperationResult[]> {
    console.log(`[USD₮ WDK Integration] Batch approving ${spenders.length} spenders`);

    const results: USDTOperationResult[] = [];

    for (const spender of spenders) {
      const result = await this.approve(spender.address, spender.amount);
      results.push(result);
    }

    return results;
  }

  /**
   * Revoke approval
   */
  async revokeApproval(spender: string): Promise<USDTOperationResult> {
    console.log(`[USD₮ WDK Integration] Revoking approval for ${spender}`);

    return await this.approve(spender, 0n);
  }

  /**
   * Get total USD₮ value in wallet
   */
  async getTotalValue(): Promise<number> {
    const balance = await this.getBalance();
    return parseFloat(balance.formattedBalance);
  }
}
