# USD₮ Integration Guide for Flipper Protocol

## Overview

This guide explains how to integrate the USD₮ module into the Flipper Protocol agent. The USD₮ module provides intelligent decision-making for when and why to use USD₮ in DeFi operations.

## Integration Steps

### Step 1: Import USD₮ Module

Add the USD₮ module to your main agent file:

```typescript
import { USDTManager } from "./usdt";
import { ethers } from "ethers";
```

### Step 2: Initialize USD₮ Manager

In your agent constructor, initialize the USD₮ manager:

```typescript
class FlipperAgent {
  private usdtManager: USDTManager;

  constructor() {
    // ... existing initialization code ...

    // Initialize USD₮ Manager
    const wallet = new ethers.Wallet(CONFIG.privateKey, this.monitor.getProvider());
    this.usdtManager = new USDTManager(
      {
        address: wallet.address,
        chainId: CONFIG.rpcUrl.includes("sepolia") ? 11155111 : 1,
        provider: this.monitor.getProvider(),
        signer: wallet,
      },
      {
        network: CONFIG.rpcUrl.includes("sepolia") ? "sepolia" : "ethereum",
        enableMCP: process.env.MCP_ENABLED === "true",
        wdkConfig: {
          autoApprove: process.env.USDT_AUTO_APPROVE === "true",
          maxApprovalAmount: ethers.parseUnits(
            process.env.USDT_MAX_APPROVAL || "1000000",
            6
          ),
        },
        mcpConfig: {
          enabled: process.env.MCP_ENABLED === "true",
          serverUrl: process.env.MCP_SERVER_URL || "http://localhost:3000",
          timeout: parseInt(process.env.MCP_TIMEOUT || "30000"),
        },
      }
    );

    console.log("[Flipper Agent] USD₮ Manager initialized");
  }
}
```

### Step 3: Add USD₮ Operations to Strategy Executor

Modify the strategy executor to include USD₮ operations:

```typescript
// In strategy-executor.ts
import { USDTManager } from "../usdt";

export class StrategyExecutor {
  private usdtManager?: USDTManager;

  constructor(
    provider: ethers.JsonRpcProvider,
    wallet: ethers.Wallet,
    network: "mainnet" | "sepolia" = "sepolia",
    usdtManager?: USDTManager
  ) {
    // ... existing initialization ...
    this.usdtManager = usdtManager;
  }

  async executeAction(action: StrategyAction): Promise<ExecutionResult> {
    // Check if this is a USD₮ operation
    if (this.isUSDTOperation(action)) {
      return await this.executeUSDTOperation(action);
    }

    // ... existing action execution ...
  }

  private isUSDTOperation(action: StrategyAction): boolean {
    return action.tokenIn === "0xd077a400968890eacc75cdc901f0356c943e4fdb" ||
           action.tokenOut === "0xd077a400968890eacc75cdc901f0356c943e4fdb";
  }

  private async executeUSDTOperation(action: StrategyAction): Promise<ExecutionResult> {
    if (!this.usdtManager) {
      throw new Error("USD₮ Manager not initialized");
    }

    const response = await this.usdtManager.executeOperation({
      type: action.type as any,
      amount: action.amount,
      tokenIn: action.tokenIn,
      tokenOut: action.tokenOut,
      to: action.targetAddress,
      spender: action.targetAddress,
      urgency: action.priority === "critical" ? "critical" :
                action.priority === "high" ? "high" :
                action.priority === "medium" ? "medium" : "low",
      isCrossChain: false,
    });

    return {
      actionId: action.id,
      success: response.success,
      txHash: response.executionResult?.txHash,
      gasUsed: response.executionResult?.gasUsed,
      gasCost: response.executionResult?.gasCost,
      timestamp: Date.now(),
    };
  }
}
```

### Step 4: Add USD₮ Decision-Making to Strategy Planner

Modify the strategy planner to consider USD₮ in strategy generation:

```typescript
// In strategy-planner.ts
import { USDTManager } from "../usdt";

export class StrategyPlanner {
  private usdtManager?: USDTManager;

  constructor(
    riskLimits?: Partial<RiskLimits>,
    usdtManager?: USDTManager
  ) {
    // ... existing initialization ...
    this.usdtManager = usdtManager;
  }

  private async generateYieldActions(
    positions: Position[],
    context: ExecutionContext,
    protocolStates: Map<string, ProtocolState>
  ): Promise<StrategyAction[]> {
    const actions: StrategyAction[] = [];

    // Check if USD₮ should be used for yield farming
    if (this.usdtManager) {
      const decision = await this.usdtManager.getDecisionEngine().makeDecision({
        timestamp: Date.now(),
        marketConditions: context.marketConditions,
        riskAssessment: context.riskAssessment,
        transactionDetails: {
          type: "deposit",
          amount: ethers.parseEther("10"),
          tokenIn: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
          requiredLiquidity: ethers.parseEther("10"),
          urgency: "low",
          isCrossChain: false,
        },
        walletState: {
          usdtBalance: 0n,
          ethBalance: 0n,
          totalValueUSD: 0,
          exposureToVolatileAssets: 50,
        },
        networkState: {
          chainId: 1,
          networkCongestion: 20,
          blockTime: 12,
          tps: 15,
        },
      });

      if (decision.shouldUseUSDT) {
        // Add USD₮-based yield farming action
        actions.push({
          id: this.generateActionId(),
          type: ActionType.DEPOSIT,
          protocol: ProtocolType.LENDING,
          protocolName: "Aave V3",
          targetAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
          amount: ethers.parseUnits("10", 6),
          tokenIn: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
          minAmountOut: ethers.parseUnits("10", 6),
          maxSlippage: 50,
          estimatedGas: ethers.parseUnits("200000", "wei"),
          estimatedGasCost: ethers.parseUnits("200000", "wei") * context.gasPrice,
          priority: "low",
          reasoning: decision.reasoning,
          expectedOutcome: decision.expectedOutcome,
          riskLevel: decision.riskLevel,
        });
      }
    }

    return actions;
  }
}
```

### Step 5: Add USD₮ Statistics to Agent Dashboard

Add USD₮ statistics to your agent's status reporting:

```typescript
// In agent/src/index.ts
async executeCycle(): Promise<void> {
  // ... existing cycle code ...

  // Add USD₮ statistics
  console.log("\n💰 USD₮ Statistics:");
  const usdtStats = this.usdtManager.getStatistics();
  console.log(`  Total Operations: ${usdtStats.totalOperations}`);
  console.log(`  Successful: ${usdtStats.successfulOperations}`);
  console.log(`  Failed: ${usdtStats.failedOperations}`);
  console.log(`  USD₮ Used: ${usdtStats.usdtUsedCount}`);
  console.log(`  USD₮ Not Used: ${usdtStats.usdtNotUsedCount}`);
  console.log(`  Average Confidence: ${usdtStats.averageConfidence}%`);

  // Get decision statistics
  const decisionStats = this.usdtManager.getDecisionStatistics();
  console.log(`  Decision Success Rate: ${decisionStats.successRate}%`);
}
```

### Step 6: Add Environment Variables

Add the following environment variables to your `.env` file:

```bash
# USD₮ Configuration
USDT_NETWORK=sepolia
USDT_AUTO_APPROVE=false
USDT_MAX_APPROVAL=1000000

# MCP Configuration
MCP_ENABLED=true
MCP_SERVER_URL=http://localhost:3000
MCP_TIMEOUT=30000
```

### Step 7: Update Strategy Manager

Update the strategy manager to pass USD₮ manager to components:

```typescript
// In strategy/index.ts
export class StrategyManager {
  private usdtManager: USDTManager;

  constructor(
    provider: ethers.JsonRpcProvider,
    wallet: ethers.Wallet,
    usdtManager?: USDTManager,
    network: "mainnet" | "sepolia" = "sepolia"
  ) {
    this.usdtManager = usdtManager || new USDTManager(
      {
        address: wallet.address,
        chainId: network === "sepolia" ? 11155111 : 1,
        provider,
        signer: wallet,
      },
      {
        network,
        enableMCP: false,
      }
    );

    // Initialize components with USD₮ manager
    this.strategyPlanner = new StrategyPlanner(undefined, this.usdtManager);
    this.strategyExecutor = new StrategyExecutor(provider, wallet, network, this.usdtManager);
  }
}
```

## Usage Examples

### Example 1: Execute USD₮ Transfer

```typescript
const response = await usdtManager.executeOperation({
  type: "transfer",
  amount: ethers.parseUnits("100", 6),
  tokenIn: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
  to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  urgency: "medium",
});

console.log("Decision:", response.decision.reasoning);
console.log("Success:", response.success);
```

### Example 2: Execute USD₮ Approval

```typescript
const response = await usdtManager.executeOperation({
  type: "deposit",
  amount: ethers.parseUnits("1000", 6),
  tokenIn: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
  spender: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  urgency: "low",
});

console.log("Decision:", response.decision.reasoning);
console.log("Success:", response.success);
```

### Example 3: Use MCP Tools

```typescript
const mcp = usdtManager.getMCPIntegration();

if (mcp) {
  // Check balance
  const balanceResult = await mcp.executeTool("check_balance", {
    address: wallet.address,
  });

  // Make decision
  const decisionResult = await mcp.executeTool("make_usdt_decision", {
    marketConditions: {
      volatility: 50,
      liquidityDepth: ethers.parseUnits("1000000", 6).toString(),
      priceStability: 99,
      sentiment: "neutral",
      gasPrice: ethers.parseUnits("25", "gwei").toString(),
      ethPrice: 2000,
    },
    riskAssessment: {
      overallRisk: 40,
      liquidationRisk: 30,
      slippageRisk: 35,
      protocolRisk: 25,
    },
    transactionDetails: {
      type: "swap",
      amount: ethers.parseUnits("500", 6).toString(),
      tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      requiredLiquidity: ethers.parseUnits("500", 6).toString(),
      urgency: "medium",
      isCrossChain: false,
    },
  });

  console.log("Decision:", decisionResult.result);
}
```

## Testing

### Run USD₮ Tests

```bash
cd agent
npm run test:usdt
```

### Test with Real Wallet

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC=https://rpc.sepolia.org
export USDT_NETWORK=sepolia

# Run agent
npm run start
```

## Monitoring

### Monitor USD₮ Operations

```typescript
// Get operation history
const history = usdtManager.getOperationHistory();
console.log("Recent operations:", history.slice(-10));

// Get decision history
const decisionHistory = usdtManager.getDecisionEngine().getRecentDecisions(10);
console.log("Recent decisions:", decisionHistory);

// Get statistics
const stats = usdtManager.getStatistics();
console.log("Statistics:", stats);
```

### Export State

```typescript
const state = usdtManager.exportState();
console.log("USD₮ Manager State:", JSON.stringify(state, null, 2));
```

## Troubleshooting

### Issue: USD₮ Manager Not Initialized

**Solution**: Ensure you're passing a valid wallet object to the USD₮ manager constructor.

### Issue: Decision Engine Returns Low Confidence

**Solution**: Check that market conditions and risk assessment data is accurate. Update decision thresholds if needed.

### Issue: MCP Tools Not Working

**Solution**: Ensure MCP server is running and accessible. Check MCP configuration in environment variables.

### Issue: USD₮ Operations Failing

**Solution**: Check that:
- Wallet has sufficient USD₮ balance
- Gas price is within acceptable range
- Network is supported
- Contract address is correct

## Best Practices

1. **Always Check Decision Confidence**: Review the confidence score before executing operations
2. **Monitor Decision History**: Track decisions to improve decision-making over time
3. **Use Appropriate Urgency**: Set urgency based on transaction importance
4. **Review Alternatives**: Consider alternatives when USD₮ is not recommended
5. **Test on Sepolia First**: Always test on Sepolia before using on mainnet
6. **Monitor Gas Costs**: Keep track of gas costs for USD₮ operations
7. **Set Appropriate Limits**: Configure max approval amounts and other limits

## Next Steps

1. ✅ USD₮ module implemented
2. ✅ Decision engine created
3. ✅ WDK integration complete
4. ✅ MCP tools available
5. ⏳ Integrate into main agent loop
6. ⏳ Add to strategy executor
7. ⏳ Test on Sepolia testnet
8. ⏳ Deploy to mainnet

## Support

For issues or questions:
- Check the USD₮ README: `agent/src/usdt/README.md`
- Review test file: `agent/src/usdt/test-usdt.ts`
- Consult WDK documentation: https://docs.wallet.tether.io
- Check OpenClaw documentation: https://docs.wallet.tether.io/ai/openclaw