# Flipper Protocol — Strategy System

A comprehensive strategy planning and execution system for DeFi operations with clear abstraction between strategy planning and execution, with full awareness of slippage, risk, and protocol state.

## Overview

The Strategy System provides an OpenClaw-like abstraction layer for managing DeFi operations across multiple protocols including DEXs (Uniswap, SushiSwap), lending protocols (Aave V3), and vaults.

## Architecture

### Core Components

1. **Strategy Types** ([`strategy-types.ts`](strategy-types.ts))
   - Type definitions for all strategy-related interfaces
   - Protocol types (DEX, Lending, Vault)
   - Strategy actions and execution contexts
   - Risk assessment and market conditions

2. **Strategy Planner** ([`strategy-planner.ts`](strategy-planner.ts))
   - AI-powered strategy generation
   - Multi-factor risk analysis
   - Action prioritization
   - Strategy optimization

3. **Strategy Executor** ([`strategy-executor.ts`](strategy-executor.ts))
   - Coordinates execution across protocols
   - Priority-based action execution
   - Gas price optimization
   - Comprehensive metrics tracking

4. **DEX Operations** ([`dex-operations.ts`](dex-operations.ts))
   - Uniswap V2/V3 integration
   - SushiSwap support
   - Slippage calculation
   - Liquidity provision/removal

5. **Lending Operations** ([`lending-operations.ts`](lending-operations.ts))
   - Aave V3 integration
   - Health factor monitoring
   - Supply/borrow/repay operations
   - Protocol state tracking

6. **Strategy Manager** ([`index.ts`](index.ts))
   - Main entry point
   - Coordinates all components
   - Provides unified API

## Features

### Strategy Planning

- **AI-Powered Analysis**: Uses LLM reasoning to generate optimal strategies
- **Multi-Factor Risk Assessment**: Considers volatility, liquidity, concentration, and momentum
- **Dynamic Strategy Selection**: Automatically chooses best strategy based on conditions
- **Priority-Based Actions**: Critical actions executed first

### Strategy Types

1. **HODL**: Maintain positions and monitor
2. **YIELD_FARMING**: Generate yield through liquidity provision
3. **ARBITRAGE**: Exploit price differences across venues
4. **LIQUIDITY_PROVISION**: Add/remove liquidity from pools
5. **RISK_HEDGING**: Reduce exposure to volatile assets
6. **EMERGENCY_EXIT**: Quick exit to prevent losses
7. **REBALANCE**: Optimize portfolio allocation

### Protocol Support

#### DEX Protocols
- Uniswap V2
- Uniswap V3
- SushiSwap
- Curve (planned)
- Balancer (planned)

#### Lending Protocols
- Aave V3
- Compound (planned)
- Lido (planned)

### Risk Awareness

- **Slippage Calculation**: Dynamic slippage based on liquidity and price impact
- **Health Factor Monitoring**: Real-time health factor tracking for lending positions
- **Gas Price Optimization**: Waits execution if gas prices are too high
- **Protocol State Awareness**: Considers utilization rates, APY, and protocol health

### Execution Features

- **Priority-Based Execution**: Critical actions executed first
- **Gas Optimization**: Estimates and optimizes gas usage
- **Error Handling**: Graceful failure handling with fallbacks
- **Metrics Tracking**: Comprehensive execution metrics

## Usage

### Basic Setup

```typescript
import { StrategyManager } from "./strategy";
import { ethers } from "ethers";

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
const wallet = new ethers.Wallet(privateKey, provider);

// Create strategy manager
const strategyManager = new StrategyManager(
  provider,
  wallet,
  {
    maxSlippage: 50, // 0.5%
    maxGasPrice: ethers.parseUnits("50", "gwei"),
    stopLossPercentage: 10, // 10%
    takeProfitPercentage: 20, // 20%
  },
  "sepolia"
);
```

### Generate and Execute Strategy

```typescript
// Create execution context
const executionContext = await strategyManager.createExecutionContext(
  provider,
  ethPrice,
  marketConditions,
  riskAssessment
);

// Get positions and protocol states
const positions = await strategyManager.getAllPositions(userAddress);
const protocolStates = await strategyManager.getProtocolStates();

// Generate and execute strategy
const result = await strategyManager.generateAndExecuteStrategy(
  executionContext,
  positions,
  protocolStates,
  "Maximize yield while minimizing risk"
);

console.log(`Strategy: ${result.plan.strategyType}`);
console.log(`Actions: ${result.plan.actions.length}`);
console.log(`Executed: ${result.results.filter(r => r.success).length}/${result.results.length}`);
```

### Direct DEX Operations

```typescript
const dexOps = strategyManager.getDEXOperations();

// Calculate slippage
const slippage = await dexOps.calculateSlippage(
  tokenIn,
  tokenOut,
  amountIn,
  "UNISWAP_V2"
);

console.log(`Recommended slippage: ${slippage.recommendedSlippage / 100}%`);

// Execute swap
const result = await dexOps.executeSwap(action, "UNISWAP_V2");
```

### Direct Lending Operations

```typescript
const lendingOps = strategyManager.getLendingOperations();

// Get user account data
const userData = await lendingOps.getUserAccountData(userAddress);
console.log(`Health factor: ${Number(userData.healthFactor) / 1e18}`);

// Supply assets
const result = await lendingOps.supply(action);

// Borrow assets
const result = await lendingOps.borrow(action);
```

## Agent Integration

The strategy system is integrated into the main agent loop in [`index.ts`](../index.ts):

```
Phase 1: OBSERVE — Gather market data
Phase 2: ANALYZE — Run AI risk assessment
Phase 2.5: AI REASONING — Generate LLM analysis
Phase 2.7: DEX DATA — Get on-chain prices
Phase 3: DECIDE — Detect threats
Phase 3.5: STRATEGY PLANNING — Generate optimal strategy (NEW)
Phase 4: EXECUTE — Execute on-chain actions
```

## Testing

Run the comprehensive test suite:

```bash
cd agent
npm run test-strategy
```

Or run directly:

```bash
npx ts-node src/strategy/test-strategy.ts
```

## Configuration

### Environment Variables

```bash
# RPC endpoint
SEPOLIA_RPC=https://rpc.sepolia.org

# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Strategy parameters
MAX_SLIPPAGE=50
MAX_GAS_PRICE=50000000000
STOP_LOSS_PERCENTAGE=10
TAKE_PROFIT_PERCENTAGE=20
```

### Risk Limits

Configure risk limits when initializing the StrategyManager:

```typescript
const riskLimits = {
  maxPositionSize: ethers.parseEther("100"),
  maxDailyVolume: ethers.parseEther("1000"),
  maxSlippage: 50, // 0.5%
  maxGasPrice: ethers.parseUnits("50", "gwei"),
  minHealthFactor: 1.5,
  maxUtilizationRate: 0.8,
  stopLossPercentage: 10, // 10%
  takeProfitPercentage: 20, // 20%
};
```

## Metrics

The system tracks comprehensive execution metrics:

- Total executions
- Success/failure rates
- Gas spent and costs
- Average slippage
- Total PnL
- Sharpe ratio
- Max drawdown
- Win rate

Access metrics:

```typescript
const metrics = strategyManager.getExecutor().getMetrics();
console.log(`Total executions: ${metrics.totalExecutions}`);
console.log(`Success rate: ${(metrics.successfulExecutions / metrics.totalExecutions * 100).toFixed(2)}%`);
```

## Security Considerations

1. **Private Key Security**: Never commit private keys to version control
2. **Slippage Protection**: Always use appropriate slippage tolerances
3. **Gas Price Limits**: Set maximum gas prices to prevent overpaying
4. **Health Factor Monitoring**: Monitor lending positions to prevent liquidation
5. **Dry Run Mode**: Test strategies in dry run mode before live execution

## Future Enhancements

- [ ] Additional DEX support (Curve, Balancer)
- [ ] Additional lending protocols (Compound, Lido)
- [ ] Vault protocol integration
- [ ] Cross-chain operations
- [ ] Advanced arbitrage strategies
- [ ] MEV protection
- [ ] Flash loan integration
- [ ] Governance participation

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## Support

For issues and questions, please open an issue on GitHub.