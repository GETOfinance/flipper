// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — DEX Operations Handler
// Handles DEX operations with slippage and liquidity awareness
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import {
  DEXProtocol,
  StrategyAction,
  ActionType,
  ExecutionResult,
  SlippageCalculation,
  ProtocolState,
  ExecutionContext,
} from "./strategy-types";

// Uniswap V2 Router ABI (simplified)
const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
];

// Uniswap V3 Quoter ABI (simplified)
const UNISWAP_V3_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint amountIn, uint160 sqrtPriceLimitX96) external returns (uint amountOut)",
];

// Common token addresses (Ethereum Mainnet)
const TOKEN_ADDRESSES = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
};

// DEX Router addresses
const DEX_ROUTERS = {
  UNISWAP_V2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  SUSHISWAP: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
};

// Uniswap V3 Quoter address
const UNISWAP_V3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

export class DEXOperations {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private dexContracts: Map<string, ethers.Contract> = new Map();
  private executionHistory: ExecutionResult[] = [];

  constructor(provider: ethers.JsonRpcProvider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;

    // Initialize DEX contracts
    this.initializeDEXContracts();
  }

  /**
   * Expose read-only provider for callers (e.g. StrategyExecutor gas checks)
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Initialize DEX contracts
   */
  private initializeDEXContracts(): void {
    // Uniswap V2 Router
    const uniV2Router = new ethers.Contract(
      DEX_ROUTERS.UNISWAP_V2,
      UNISWAP_V2_ROUTER_ABI,
      this.wallet
    );
    this.dexContracts.set("UNISWAP_V2", uniV2Router);

    // SushiSwap Router
    const sushiRouter = new ethers.Contract(
      DEX_ROUTERS.SUSHISWAP,
      UNISWAP_V2_ROUTER_ABI,
      this.wallet
    );
    this.dexContracts.set("SUSHISWAP", sushiRouter);

    // Uniswap V3 Quoter
    const uniV3Quoter = new ethers.Contract(
      UNISWAP_V3_QUOTER,
      UNISWAP_V3_QUOTER_ABI,
      this.provider
    );
    this.dexContracts.set("UNISWAP_V3_QUOTER", uniV3Quoter);

    console.log("[DEX Operations] DEX contracts initialized");
  }

  /**
   * Calculate slippage for a swap
   */
  async calculateSlippage(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    dexProtocol: DEXProtocol = DEXProtocol.UNISWAP_V2
  ): Promise<SlippageCalculation> {
    try {
      const expectedAmountOut = await this.getQuote(tokenIn, tokenOut, amountIn, dexProtocol);
      const liquidityDepth = await this.getLiquidityDepth(tokenIn, tokenOut, dexProtocol);
      const priceImpact = this.calculatePriceImpact(amountIn, liquidityDepth);

      // Recommended slippage based on price impact and liquidity
      const recommendedSlippage = Math.min(100, Math.max(10, Math.ceil(priceImpact * 2)));

      return {
        expectedAmountOut,
        minAmountOut: this.applySlippage(expectedAmountOut, recommendedSlippage),
        maxSlippage: recommendedSlippage,
        priceImpact,
        liquidityDepth,
        recommendedSlippage,
        confidence: this.calculateConfidence(liquidityDepth, priceImpact),
      };
    } catch (error: any) {
      console.error(`[DEX Operations] Slippage calculation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get quote for a swap
   */
  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    dexProtocol: DEXProtocol = DEXProtocol.UNISWAP_V2
  ): Promise<bigint> {
    try {
      if (dexProtocol === DEXProtocol.UNISWAP_V3) {
        const quoter = this.dexContracts.get("UNISWAP_V3_QUOTER");
        if (!quoter) throw new Error("Uniswap V3 Quoter not initialized");

        const amountOut = await quoter.quoteExactInputSingle(
          tokenIn,
          tokenOut,
          3000, // 0.3% fee tier
          amountIn,
          0
        );
        return amountOut;
      } else {
        // Uniswap V2 / SushiSwap
        const router = this.dexContracts.get(dexProtocol);
        if (!router) throw new Error(`${dexProtocol} router not initialized`);

        const path = [tokenIn, tokenOut];
        const amounts = await router.getAmountsOut(amountIn, path);
        return amounts[1];
      }
    } catch (error: any) {
      console.error(`[DEX Operations] Quote failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a swap
   */
  async executeSwap(
    action: StrategyAction,
    dexProtocol: DEXProtocol = DEXProtocol.UNISWAP_V2
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[DEX Operations] Executing swap: ${action.tokenIn} -> ${action.tokenOut}`);

    try {
      const router = this.dexContracts.get(dexProtocol);
      if (!router) throw new Error(`${dexProtocol} router not initialized`);

      // Calculate slippage
      const slippage = await this.calculateSlippage(
        action.tokenIn,
        action.tokenOut!,
        action.amount,
        dexProtocol
      );

      // Use the higher of action's maxSlippage or calculated recommended slippage
      const effectiveSlippage = Math.max(action.maxSlippage, slippage.recommendedSlippage);
      const minAmountOut = this.applySlippage(slippage.expectedAmountOut, effectiveSlippage);

      // Execute swap
      const path = [action.tokenIn, action.tokenOut!];
      const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

      const tx = await router.swapExactTokensForTokens(
        action.amount,
        minAmountOut,
        path,
        this.wallet.address,
        deadline
      );

      const receipt = await tx.wait();
      const amounts = receipt.logs?.[0]?.args?.amounts;

      // Ethers providers can expose gas price fields differently (gasPrice vs effectiveGasPrice)
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
        actualSlippage: this.calculateActualSlippage(
          slippage.expectedAmountOut,
          amounts?.[1] || 0n
        ),
        actualAmountOut: amounts?.[1],
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
      };

      this.executionHistory.push(result);
      console.log(`[DEX Operations] Swap executed: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[DEX Operations] Swap failed: ${error.message}`);

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
   * Add liquidity to a pool
   */
  async addLiquidity(
    action: StrategyAction,
    dexProtocol: DEXProtocol = DEXProtocol.UNISWAP_V2
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[DEX Operations] Adding liquidity: ${action.tokenIn}`);

    try {
      const router = this.dexContracts.get(dexProtocol);
      if (!router) throw new Error(`${dexProtocol} router not initialized`);

      // For simplicity, assume we're adding single-sided liquidity
      // In production, you'd need to calculate optimal token amounts
      const tokenA = action.tokenIn;
      const tokenB = TOKEN_ADDRESSES.WETH; // Default to WETH pair
      const amountADesired = action.amount;
      const amountBDesired = action.amount; // 1:1 ratio for simplicity

      const deadline = Math.floor(Date.now() / 1000) + 300;

      const tx = await router.addLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        action.minAmountOut || amountADesired * 99n / 100n, // 1% slippage
        action.minAmountOut || amountBDesired * 99n / 100n,
        this.wallet.address,
        deadline
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
      console.log(`[DEX Operations] Liquidity added: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[DEX Operations] Add liquidity failed: ${error.message}`);

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
   * Remove liquidity from a pool
   */
  async removeLiquidity(
    action: StrategyAction,
    dexProtocol: DEXProtocol = DEXProtocol.UNISWAP_V2
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    console.log(`[DEX Operations] Removing liquidity: ${action.tokenIn}`);

    try {
      const router = this.dexContracts.get(dexProtocol);
      if (!router) throw new Error(`${dexProtocol} router not initialized`);

      const tokenA = action.tokenIn;
      const tokenB = TOKEN_ADDRESSES.WETH;
      const liquidity = action.amount;

      const deadline = Math.floor(Date.now() / 1000) + 300;

      const tx = await router.removeLiquidity(
        tokenA,
        tokenB,
        liquidity,
        0n, // Accept any amount
        0n,
        this.wallet.address,
        deadline
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
      console.log(`[DEX Operations] Liquidity removed: ${receipt.hash}`);
      return result;
    } catch (error: any) {
      console.error(`[DEX Operations] Remove liquidity failed: ${error.message}`);

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
   * Get liquidity depth for a pair
   */
  private async getLiquidityDepth(
    tokenIn: string,
    tokenOut: string,
    dexProtocol: DEXProtocol
  ): Promise<bigint> {
    // In production, you'd query the pair contract for reserves
    // For now, return a reasonable default
    return ethers.parseEther("1000000"); // 1M tokens
  }

  /**
   * Calculate price impact
   */
  private calculatePriceImpact(amountIn: bigint, liquidityDepth: bigint): number {
    if (liquidityDepth === 0n) return 100;
    const impact = Number(amountIn) / Number(liquidityDepth) * 100;
    return Math.min(100, Math.max(0, impact));
  }

  /**
   * Apply slippage to amount
   */
  private applySlippage(amount: bigint, slippageBps: number): bigint {
    const slippageFactor = (10000 - slippageBps) / 10000;
    return (amount * BigInt(Math.floor(slippageFactor * 10000))) / 10000n;
  }

  /**
   * Calculate actual slippage
   */
  private calculateActualSlippage(expected: bigint, actual: bigint): number {
    if (expected === 0n) return 0;
    const slippage = ((Number(expected) - Number(actual)) / Number(expected)) * 10000;
    return Math.max(0, Math.round(slippage));
  }

  /**
   * Calculate confidence in slippage calculation
   */
  private calculateConfidence(liquidityDepth: bigint, priceImpact: number): number {
    // Higher liquidity and lower price impact = higher confidence
    const liquidityScore = Math.min(100, Number(liquidityDepth) / 1e18 * 0.01);
    const impactScore = Math.max(0, 100 - priceImpact * 10);
    return Math.round((liquidityScore + impactScore) / 2);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): ExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Get DEX contract
   */
  getDEXContract(dexProtocol: DEXProtocol): ethers.Contract | undefined {
    return this.dexContracts.get(dexProtocol);
  }
}
