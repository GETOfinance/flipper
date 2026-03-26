<div align="center">

# 🛡️ Flipper Protocol

### AI-Powered Autonomous DeFi Guardian Agent for Ethereum

[![Built for Ethereum](https://img.shields.io/badge/Built_for-Ethereum-627EEA?style=for-the-badge&logo=ethereum)](https://ethereum.org/)
[![Multi-LLM Support](https://img.shields.io/badge/LLM_Support-OpenAI%20%7C%20OpenRouter%20%7C%20Ollama%20%7C%20LM_Studio%20%7C%20Groq-00e0ff?style=for-the-badge)](https://github.com/flipper-protocol)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Tests](https://img.shields.io/badge/Tests-54%2F54_Passing-22c55e?style=for-the-badge)](./test/)

*An autonomous AI agent — powered by multi-LLM reasoning (OpenAI/OpenRouter/Ollama/LM Studio/Groq) + Uniswap on-chain data — that monitors your DeFi positions on Ethereum 24/7, detects risks in real-time, and executes protective on-chain transactions before you lose money.*



</div>


## 🎯 The Problem

**DeFi users lose billions annually** to rug pulls, flash loan attacks, liquidity drains, and price crashes. These losses happen when users aren't watching — overnight, during work, or because market conditions change faster than humans can react.

| Pain Point | Status Quo | Flipper Solution |
|------------|-----------|------------------|
| Monitoring | Manual, intermittent | AI-powered 24/7 autonomous monitoring |
| Threat Detection | Simple price alerts | 5-vector heuristic + Multi-LLM reasoning + DEX data |
| Response Time | Minutes to hours | Sub-second autonomous execution |
| Custody | Surrender keys | Fully non-custodial (emergency exit always available) |
| Transparency | Black box | Every decision immutably logged on-chain with reasoning hash |
| Customization | One-size-fits-all | Per-user risk profiles (slippage, stop-loss, auto-actions) |
| Agent Identity | Anonymous bots | ERC-721 NFT agent identity with reputation scoring |
| LLM Flexibility | Single provider | Multi-provider support (OpenAI, OpenRouter, Ollama, LM Studio, Groq) |

---

## 💡 What Flipper Does

Flipper is a **fully autonomous AI guardian agent** that runs a continuous autonomous loop:

```
OBSERVE → ANALYZE → AI REASON → DEX VERIFY → DECIDE → EXECUTE
```

1. **👁️ OBSERVE** — Fetches live ETH price, volume, liquidity from CoinGecko + DeFiLlama
2. **🧠 ANALYZE** — 5-vector weighted risk scoring (price 30%, liquidity 25%, volume 15%, holders 15%, momentum 15%)
3. **🤖 AI REASON** — Multi-LLM-powered analysis (OpenAI/OpenRouter/Ollama/LM Studio/Groq) with structured JSON output
4. **📊 DEX VERIFY** — Cross-references CoinGecko prices against Uniswap V2 on-chain reserves for price manipulation detection
5. **⚡ DECIDE** — Threat classification with confidence scoring; hashes both heuristic + LLM reasoning for on-chain attestation
6. **🛡️ EXECUTE** — Autonomous protective transactions (stop-loss, emergency withdrawal, rebalance) per user-defined risk profiles

---

---

## 🎯 Project Overview

**Flipper Protocol** is an AI-Powered Autonomous DeFi Guardian Agent that monitors DeFi positions on Ethereum 24/7, detects threats in real-time using multi-LLM reasoning + Uniswap DEX verification, and executes protective on-chain transactions.

### Core Features

| Feature | Description |
|---------|-------------|
| **Multi-LLM AI** | Support for OpenAI, OpenRouter, LM Studio, Ollama, and Groq providers |
| **5-Vector Risk Engine** | Weighted scoring: Price (30%), Liquidity (25%), Volume (15%), Holders (15%), Momentum (15%) |
| **Uniswap V2 Integration** | On-chain price verification for oracle manipulation detection |
| **Non-Custodial Vault** | Users retain full control with emergency withdrawal always available |
| **ERC-721 Agent NFTs** | Verifiable on-chain identity with 4-tier reputation system |
| **Immutable Audit Trail** | Every AI decision logged on-chain with keccak256 reasoning hash |

### Agent Decision Loop (30-second cycles)

```
OBSERVE → ANALYZE → AI REASON → DEX VERIFY → DECIDE → EXECUTE
   │          │          │           │          │         │
   │          │          │           │          │         └─> On-chain TXs
   │          │          │           │          └─> Threat Assessment
   │          │          │           └─> Uniswap V2 Price Cross-Check
   │          │          └─> Multi-LLM Natural Language Analysis
   │          └─> 5-Vector Weighted Risk Scoring
   └─> CoinGecko + DeFiLlama Live Data
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Smart Contracts** | Solidity | 0.8.24 | Via-IR optimized contracts |
| **Framework** | Hardhat | 2.22.17 | Development & testing |
| **Libraries** | OpenZeppelin | 5.1.0 | ERC-721, security primitives |
| **Agent Runtime** | TypeScript + Node.js | v18+ | Type-safe async I/O |
| **LLM Providers** | OpenAI, Groq, OpenRouter, Ollama, LM Studio | Various | Natural language reasoning |
| **DEX Integration** | Uniswap V2 | Mainnet | On-chain price feeds |
| **Market Data** | CoinGecko, DeFiLlama | Free APIs | Live price/TVL data |
| **Frontend** | Next.js 14 | App Router | Dashboard UI |
| **Styling** | Tailwind CSS | v3 | Utility-first CSS |
| **Blockchain** | ethers.js | v6 | TypeScript-native Web3 |
| **Testing** | Hardhat + Chai | - | 54 comprehensive tests |

---

## 🎯 Strategy System (OpenClaw Architecture)

> **Advanced strategy planning and execution with clear abstraction and full protocol awareness**

Flipper Protocol implements a comprehensive strategy system following **OpenClaw's architecture and design principles**. Since OpenClaw packages are not publicly available on npm, we've built a custom implementation that provides the same clear abstraction between strategy planning and execution with full awareness of slippage, risk, and protocol state.

### Key Features

✅ **Clear Abstraction**: Separation between strategy planning and execution

✅ **Risk Awareness**: Comprehensive risk assessment and monitoring

✅ **Protocol Awareness**: Full awareness of DEX, lending, and vault protocol states

✅ **Slippage Protection**: Dynamic slippage calculation and protection

✅ **Health Factor Monitoring**: Real-time health factor tracking for lending positions

✅ **AI-Powered**: LLM-powered strategy generation

✅ **Priority-Based Execution**: Critical actions executed first

✅ **Comprehensive Metrics**: Full tracking of execution metrics

✅ **Multi-Protocol Support**: Uniswap V2/V3, SushiSwap, Aave V3

✅ **Gas Optimization**: Intelligent gas price optimization



## 💰 USDT Integration

### Overview

The USDT module provides intelligent decision-making for USD₮ (Tether) usage in DeFi operations. It integrates with WDK (Wallet Development Kit) and MCP (Model Context Protocol) to enable autonomous USD₮ operations.

### USDT Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| USDT Manager | [`agent/src/usdt/usdt-manager.ts`](agent/src/usdt/usdt-manager.ts) | 328 | Main orchestrator |
| Decision Engine | [`agent/src/usdt/usdt-decision-engine.ts`](agent/src/usdt/usdt-decision-engine.ts) | 590 | WHEN & WHY decisions |
| WDK Integration | [`agent/src/usdt/usdt-wdk-integration.ts`](agent/src/usdt/usdt-wdk-integration.ts) | 440 | Wallet operations |
| MCP Integration | [`agent/src/usdt/usdt-mcp-integration.ts`](agent/src/usdt/usdt-mcp-integration.ts) | 487 | AI tool integration |
| USDT Config | [`agent/src/usdt/usdt-config.ts`](agent/src/usdt/usdt-config.ts) | 224 | Configuration types |

### USDT Contract Address

```
0xd077a400968890eacc75cdc901f0356c943e4fdb
```

### Decision Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Stable Settlement | Volatility > 30% or Risk > 50 | Use USDT for final settlement |
| High Liquidity | Required liquidity > 100K USDT | Use USDT |
| Gas Efficiency | Gas price < 30 gwei | Use USDT |
| Price Stability | Price stability > 99.9% | Use USDT as quote asset |
| Cross-Chain | Cross-chain settlement | Use USDT |

### MCP Tools (15 tools)

1. `check_balance` - Check USD₮ balance
2. `get_wallet_info` - Get wallet information
3. `transfer_usdt` - Transfer USD₮
4. `approve_usdt` - Approve USD₮ spending
5. `get_allowance` - Get USD₮ allowance
6. `make_usdt_decision` - Make USD₮ usage decision
7. `execute_usdt_decision` - Execute USD₮ decision
8. `get_transaction_history` - Get transaction history
9. `get_approval_history` - Get approval history
10. `estimate_gas` - Estimate gas cost
11. `batch_approve` - Batch approve multiple spenders
12. `revoke_approval` - Revoke approval
13. `get_decision_stats` - Get decision statistics
14. `get_decision_history` - Get decision history
15. `get_tool_schema` - Get tool schema for AI agents

### Key Functions

```typescript
// Execute USDT operation with automatic decision-making
executeOperation(request: USDTOperationRequest): Promise<USDTOperationResponse>

// Make USDT usage decision
makeDecision(context: DecisionContext): Promise<USDTDecision>

// WDK operations
getUSDTBalance(): Promise<bigint>
transferUSDT(to: string, amount: bigint): Promise<string>
approveUSDT(spender: string, amount: bigint): Promise<string>
```


### Strategy Types

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **HODL** | Maintain positions and monitor market conditions | Stable market, low risk |
| **YIELD_FARMING** | Generate yield through strategic liquidity provision | Bullish market, low volatility |
| **ARBITRAGE** | Exploit price differences across venues | Price discrepancies detected |
| **LIQUIDITY_PROVISION** | Add/remove liquidity from pools | Optimize pool participation |
| **RISK_HEDGING** | Reduce exposure to volatile assets | High volatility detected |
| **EMERGENCY_EXIT** | Quick exit to prevent liquidation | Critical threats detected |
| **REBALANCE** | Take profits and rebalance portfolio | Profit targets reached |

### Protocol Support

#### DEX Protocols
- **Uniswap V2**: Full integration with router and factory
- **Uniswap V3**: Advanced routing with multiple fee tiers
- **SushiSwap**: Alternative DEX for better prices
- **Curve** (planned): Stablecoin optimized swaps
- **Balancer** (planned): Multi-asset pools

#### Lending Protocols
- **Aave V3**: Full integration with health factor monitoring
- **Compound** (planned): Additional lending options
- **Lido** (planned): Staked ETH integration

### Agent Cycle

The agent follows this cycle with strategy planning:

```
Phase 1: OBSERVE — Gather market data from CoinGecko and Uniswap
Phase 2: ANALYZE — Run multi-factor risk analysis
Phase 2.5: AI REASONING — Generate LLM-powered analysis with context
Phase 2.7: DEX DATA — Get on-chain prices from Uniswap
Phase 3: DECIDE — Detect threats and determine appropriate actions
Phase 3.5: STRATEGY PLANNING — Generate optimal strategy
  - Create execution context with market conditions
  - Get current positions from all protocols
  - Get protocol states (Aave, DEXs)
  - Generate AI-powered strategy plan
  - Execute strategy actions with priority ordering
Phase 4: EXECUTE — Log decisions on-chain and trigger protective actions
```

### Strategy Components

| Component | File | Description |
|-----------|------|-------------|
| **Strategy Types** | `agent/src/strategy/strategy-types.ts` | Type definitions and interfaces |
| **Strategy Planner** | `agent/src/strategy/strategy-planner.ts` | AI-powered strategy generation |
| **DEX Operations** | `agent/src/strategy/dex-operations.ts` | DEX integration and slippage calculation |
| **Lending Operations** | `agent/src/strategy/lending-operations.ts` | Aave V3 integration and health monitoring |
| **Strategy Executor** | `agent/src/strategy/strategy-executor.ts` | Coordinates execution across protocols |
| **Strategy Manager** | `agent/src/strategy/index.ts` | Main entry point and unified API |

### Risk Limits

Configurable risk limits ensure safe operation:

```typescript
{
  maxPositionSize: ethers.parseEther("100"),      // Maximum position size
  maxDailyVolume: ethers.parseEther("1000"),      // Maximum daily volume
  maxSlippage: 50,                                // 0.5% max slippage
  maxGasPrice: ethers.parseUnits("50", "gwei"),   // Maximum gas price
  minHealthFactor: 1.5,                           // Minimum health factor
  maxUtilizationRate: 0.8,                        // Maximum protocol utilization
  stopLossPercentage: 10,                         // 10% stop loss
  takeProfitPercentage: 20,                       // 20% take profit
}
```

### Usage Example

```typescript
import { StrategyManager } from "./strategy";

// Initialize strategy manager
const strategyManager = new StrategyManager(
  provider,
  wallet,
  riskLimits,
  "sepolia"
);

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
---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FLIPPER PROTOCOL                              │
│                                                                      │
│   ┌────────────┐   ┌───────────────┐   ┌──────────────┐             │
│   │  OBSERVE   │──▶│   ANALYZE     │──▶│  AI REASON   │             │
│   │            │   │               │   │              │             │
│   │ CoinGecko  │   │ 5-Vector      │   │ Multi-LLM    │             │
│   │ DeFiLlama  │   │ Risk Engine   │   │ Provider:    │             │
│   │ ETH RPC    │   │ (449 LOC)     │   │ OpenAI/      │             │
│   └────────────┘   └───────────────┘   │ OpenRouter/  │             │
│                                         │ Ollama/      │             │
│   ┌────────────┐   ┌───────────────┐   │ LM Studio/   │             │
│   │ DEX VERIFY │──▶│    DECIDE     │   │ Groq         │             │
│   │            │   │               │   └──────┬───────┘             │
│   │ Uniswap V2 │   │ Threat        │          │                     │
│   │ Router     │   │ Detection +   │          │                     │
│   │ (On-chain) │   │ Confidence    │   ┌──────────────┐             │
│   └────────────┘   └───────────────┘   │   EXECUTE    │             │
│                                         │              │             │
│                                         │ On-chain TXs │             │
│                                         └──────┬───────┘             │
│   ┌─────────────────────────────────────────────▼────────────────┐   │
│   │                  ETHEREUM (SEPOLIA TESTNET)                   │   │
│   │                                                              │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐     │   │
│   │  │FlipperRegistry│ │  FlipperVault │ │DecisionLogger │     │   │
│   │  │  (ERC-721)   │  │(Non-Custodial)│  │  (Immutable   │     │   │
│   │  │Agent Identity│  │  Protection  │  │  Audit Log)   │     │   │
│   │  │ + Reputation │  │ + Risk Profs │  │  + AI Hashes  │     │   │
│   │  └──────────────┘  └──────────────┘  └───────────────┘     │   │
│   └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture (3 Contracts, 1,326 LOC)

| Contract | LOC | Purpose | Key Features |
|----------|-----|---------|--------------|
| **FlipperRegistry** | 415 | Agent identity & reputation | ERC-721 NFTs, 4 tiers (Scout→Archon), 1-5 reputation scoring, performance tracking |
| **FlipperVault** | 573 | Non-custodial asset protection | ETH/ERC20 deposits, per-user risk profiles, agent authorization, emergency withdrawal |
| **DecisionLogger** | 338 | On-chain decision audit trail | Immutable records, risk snapshots, reasoning hashes (keccak256 of AI analysis), 6 decision types |

---

## 🤖 AI Reasoning Engine (Multi-LLM Powered)

> **Not just heuristics — Flipper uses real LLM inference with flexible provider selection**

The AI engine ([`agent/src/ai-engine.ts`](agent/src/ai-engine.ts:1), 380 LOC) supports **multiple LLM providers** for natural language market reasoning:

### Supported Providers

| Provider | Models | Use Case |
|----------|--------|----------|
| **OpenAI** | GPT-4o-mini, GPT-4o, GPT-3.5-turbo | Production, high-quality reasoning |
| **OpenRouter** | Claude 3.5 Sonnet, GPT-4o-mini, Llama 3.1 70B | Multi-provider access, cost optimization |
| **Ollama** | Llama 3.2, Mistral, CodeLlama | Local inference, open-source models |
| **LM Studio** | Custom local models | Local inference, privacy, offline |
| **Groq** | Llama 3.3 70B, Mixtral 8x7B | Fast inference, free tier |


### AI Capabilities

| Capability | Method | Description |
|-----------|--------|-------------|
| **Market Analysis** | `analyzeMarket()` | Full market snapshot analysis with structured risk assessment |
| **Token Risk Scan** | `analyzeToken()` | Per-token risk flags: rug pull, honeypot, wash trading, whale manipulation |
| **Threat Reports** | `generateThreatReport()` | Executive summary of active threats with trend context |
| **Heuristic Fallback** | Automatic | When no API key is configured, falls back to rule-based analysis (zero downtime) |

### On-Chain AI Attestation

Every AI decision is hashed and stored on-chain:

```typescript
// Combines heuristic + LLM reasoning into a single attestation hash
const combinedReasoning = `${heuristicReasoning} | AI: ${llmAnalysis.reasoning}`;
const reasoningHash = keccak256(toUtf8Bytes(combinedReasoning));
// → Stored in DecisionLogger as immutable proof of AI reasoning
```


### AI Reasoning Engine (ai-engine.ts)

```
                    ┌─────────────────┐
                    │  Market Data    │
                    │  Risk Snapshot  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Has API Key?   │
                    └────┬───────┬────┘
                    YES  │       │  NO
               ┌─────────▼──┐ ┌─▼──────────┐
               │  LLM Call   │ │  Heuristic  │
               │  (Groq/     │ │  Fallback   │
               │   OpenAI)   │ │  Engine     │
               └──────┬──────┘ └──────┬──────┘
                      │               │
                      └───────┬───────┘
                              │
                    ┌─────────▼─────────┐
                    │   AIAnalysis {    │
                    │     reasoning,    │
                    │     riskScore,    │
                    │     confidence,   │
                    │     threats,      │
                    │     sentiment,    │
                    │     insights      │
                    │   }              │
                    └──────────────────┘
```


---

## 📊 Uniswap V2 On-Chain Integration

> **Real-time DEX price verification directly from Uniswap smart contracts**

The Uniswap provider ([`agent/src/uniswap.ts`](agent/src/uniswap.ts:1), 300 LOC) reads **on-chain reserve data** from Uniswap V2 on Ethereum:

| Feature | Method | Description |
|---------|--------|-------------|
| **Token Price (USD)** | `getTokenPriceUSD()` | Routes through WETH→USDC via Router contract |
| **ETH Price** | `getETHPrice()` | Direct ETH/USDC on-chain price |
| **Pair Data** | `getPairData()` | Reserves, symbols, decimals, USD liquidity |
| **Portfolio Tracking** | `getPortfolioPrices()` | Multi-token price monitoring |
| **Token Risk** | `analyzeTokenRisk()` | Liquidity depth, concentration, red flags |
| **DEX Depth** | `getTotalPairs()` | Total Uniswap pair count |

### Price Oracle Cross-Verification

```
CoinGecko Price:   $3,450.50  (API)
Uniswap Price:     $3,450.38  (On-chain Router)
Price Delta:        0.003%  → CONSISTENT ✓

If delta > 1%  → Potential price manipulation
If delta > 5%  → CRITICAL: Oracle attack likely
```

**Supported Ethereum Tokens**: WETH, USDC, USDT, DAI, WBTC, LINK, UNI, AAVE

---

## 🔍 On-Chain Proof

> **Contracts ready for deployment to Ethereum Sepolia Testnet (Chain ID 11155111)**

### Contract Deployment

Contracts are ready for deployment to Ethereum Sepolia Testnet:

| Contract | Status | Description |
|----------|--------|-------------|
| **FlipperRegistry** | Ready to deploy | ERC-721 agent identity & reputation system |
| **FlipperVault** | Ready to deploy | Non-custodial vault with risk profiles |
| **DecisionLogger** | Ready to deploy | Immutable decision audit trail |

**Deployment Command:**
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 📊 Contract Addresses deployed (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| FlipperRegistry | `0xac77139C2856788b7EEff767969353adF95D335e` |
| FlipperVault | `0x73CE32Ece5d21836824C55c5EDB9d09b07F3a56E` |
| DecisionLogger | `0xEbfb45d0c075d8BdabD6421bdFB9A4b9570219ea` |
| USDT (Tether) | `0xd077a400968890eacc75cdc901f0356c943e4fdb` |

---

---

## 🧪 Tests (54/54 Passing)

```
  FlipperRegistry (20 tests)
    ✓ Deployment, Agent Registration (5), Agent Management (3)
    ✓ Reputation System (4), Agent Stats (4), Admin Functions (3)

  FlipperVault (20 tests)
    ✓ Deployment, ETH Deposits (3), ETH Withdrawals (3)
    ✓ Agent Authorization (3), Risk Profile (3)
    ✓ Protection Execution (4), Emergency & Admin (3)

  DecisionLogger (14 tests)
    ✓ Deployment, Decision Logging (4), Risk Snapshots (3)
    ✓ View Functions (4), Admin Functions (2)

  54 passing
```

---

## 📂 Project Structure

```
flipper-protocol/
├── contracts/                           # Solidity smart contracts (1,326 LOC)
│   ├── FlipperRegistry.sol              # ERC-721 agent identity & reputation (415 LOC)
│   ├── FlipperVault.sol                 # Non-custodial vault & protection (573 LOC)
│   └── DecisionLogger.sol               # On-chain decision audit log (338 LOC)
│
├── agent/                               # AI Guardian Agent Engine
│   └── src/
│       ├── index.ts                     # Main loop: OBSERVE→ANALYZE→AI→DEX→DECIDE→STRATEGY→EXECUTE (400+ LOC)
│       ├── ai-engine.ts                 # 🧠 Multi-LLM AI reasoning — OpenAI/OpenRouter/Ollama/LM Studio/Groq (380 LOC)
│       ├── uniswap.ts                   # 📊 Uniswap V2 on-chain price feeds (300 LOC)
│       ├── analyzer.ts                  # 5-vector weighted risk analysis engine (449 LOC)
│       ├── monitor.ts                   # Position & market data monitor (live+fallback)
│       ├── market-provider.ts           # CoinGecko + DeFiLlama live data feeds
│       ├── executor.ts                  # On-chain transaction executor
│       ├── simulate.ts                  # Demo simulation (no blockchain required)
│       └── strategy/                    # 🎯 OpenClaw Strategy System (NEW)
│           ├── index.ts                 # Strategy Manager - Main entry point
│           ├── strategy-types.ts        # Type definitions and interfaces
│           ├── strategy-planner.ts      # AI-powered strategy generation
│           ├── strategy-executor.ts     # Coordinates execution across protocols
│           ├── dex-operations.ts        # DEX integration (Uniswap V2/V3, SushiSwap)
│           ├── lending-operations.ts    # Aave V3 integration and health monitoring
│           ├── test-strategy.ts         # Comprehensive test suite
│           ├── README.md                # Complete strategy documentation
│           └── INTEGRATION_SUMMARY.md   # Integration details
│
├── scripts/
│   ├── deploy.ts                        # Multi-contract Ethereum deployment
│   ├── demo-e2e.ts                      # 10-phase local Hardhat E2E demo
│   ├── demo-onchain.ts                  # 7-phase Sepolia Testnet demo (6 TXs)
│   └── demo-comprehensive.ts            # 🔥 15-phase Sepolia Testnet demo (full threat lifecycle)
│
├── test/                                # 54 comprehensive tests
│   ├── FlipperRegistry.test.ts         # 20 tests
│   ├── FlipperVault.test.ts            # 20 tests
│   └── DecisionLogger.test.ts          # 14 tests
│
├── frontend/                            # Next.js 14 Dashboard
│   └── src/
│       ├── app/
│       │   ├── page.tsx                 # Dashboard with live data + AI display + on-chain data
│       │   ├── layout.tsx               # OG meta tags, dark cyberpunk theme
│       │   └── globals.css              # Glassmorphism + animation CSS
│       ├── components/
│       │   └── AgentSimulation.tsx       # 🎮 Interactive 6-phase agent simulation (518 LOC)
│       └── lib/
│           ├── constants.ts             # Contract addresses & chain config
│           ├── useLiveMarket.ts         # 🔴 LIVE CoinGecko + Uniswap price hook
│           ├── useWallet.ts             # MetaMask wallet hook
│           ├── useContracts.ts          # Contract read/write hooks (+ public RPC)
│           └── abis.ts                  # Full contract ABIs
│
├── hardhat.config.ts                    # Ethereum Sepolia + Etherscan verification
├── deployment.json                      # Deployed contract addresses
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm
- MetaMask (for frontend interaction)

### 1. Clone & Install

```bash
cd rs
npm install --legacy-peer-deps
```

### 2. Run Tests

```bash
npx hardhat test
# 54 passing ✓
```

### 3. Run the E2E Demo (Local Hardhat)

```bash
npx hardhat run scripts/demo-e2e.ts
```

### 4. Run Comprehensive Demo (Ethereum Sepolia)

```bash
cp .env.example .env
# Add PRIVATE_KEY with Sepolia ETH balance
npx hardhat run scripts/demo-comprehensive.ts --network sepolia
```

15-phase threat lifecycle: normal → volatility warning → threat detected → protection triggered → recovery → review.

### 5. Start the AI Agent

```bash
cd agent && npm install

# Configure your LLM provider in .env
# Example for OpenAI:
# LLM_PROVIDER=openai
# OPENAI_API_KEY=your_key_here
# AI_MODEL=gpt-4o-mini

# Example for local Ollama:
# LLM_PROVIDER=ollama
# OLLAMA_API_URL=http://localhost:11434/v1/chat/completions
# AI_MODEL=llama3.2

npx ts-node src/index.ts
```

### 6. Start the Frontend

```bash
cd frontend && npm install && npm run dev
# Open http://localhost:3000
```

### 7. Deploy to Ethereum Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## ⚙️ Configuration

### Environment Variables

Copy [`.env.example`](.env.example:1) to `.env` and configure:

```bash
# Ethereum Sepolia Configuration
SEPOLIA_RPC=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here

# Contract Addresses (set after deployment)
VAULT_ADDRESS=
REGISTRY_ADDRESS=
LOGGER_ADDRESS=

# Agent Configuration
AGENT_ID=0
POLL_INTERVAL=30000
DRY_RUN=true

# LLM Provider Configuration
# Choose your provider: openai, openrouter, lmstudio, ollama, groq
LLM_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# OpenRouter Configuration (multi-provider access)
OPENROUTER_API_KEY=your_openrouter_api_key

# LM Studio Configuration (local inference)
LMSTUDIO_API_URL=http://localhost:1234/v1/chat/completions

# Ollama Configuration (local inference)
OLLAMA_API_URL=http://localhost:11434/v1/chat/completions

# Groq Configuration (fast, free tier)
GROQ_API_KEY=your_groq_api_key

# AI Model Selection (provider-specific)
AI_MODEL=gpt-4o-mini

# Data Configuration
USE_LIVE_DATA=true

# Etherscan API (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### LLM Provider Selection

**For Production (OpenAI):**
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
AI_MODEL=gpt-4o-mini
```

**For Cost Optimization (OpenRouter):**
```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
AI_MODEL=anthropic/claude-3.5-sonnet
```

**For Local Privacy (Ollama):**
```bash
LLM_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434/v1/chat/completions
AI_MODEL=llama3.2
```

**For Fast Free Inference (Groq):**
```bash
LLM_PROVIDER=groq
GROQ_API_KEY=gsk-...
AI_MODEL=llama-3.3-70b-versatile
```

**For Custom Local Models (LM Studio):**
```bash
LLM_PROVIDER=lmstudio
LMSTUDIO_API_URL=http://localhost:1234/v1/chat/completions
AI_MODEL=llama-3-8b-instruct
```

See [`.env.example`](.env.example:1) for complete model catalog and configuration examples.

---

## ⛓️ Smart Contracts

### Agent Tiers (ERC-721)

| Tier | Name | Description |
|------|------|-------------|
| 0 | Scout | Default on registration |
| 1 | Guardian | Promoted by admin, basic operations |
| 2 | Sentinel | Higher authority, complex strategies |
| 3 | Archon | Maximum trust level, all capabilities |

### Risk Profile (Per User)

```solidity
struct RiskProfile {
    uint256 maxSlippage;           // Max acceptable slippage (bps)
    uint256 stopLossThreshold;     // Stop-loss trigger (bps)
    uint256 maxSingleActionValue;  // Max value per action
    bool allowAutoWithdraw;        // Allow emergency withdrawals
    bool allowAutoSwap;            // Allow auto-rebalancing
}
```

### 5-Vector Risk Analysis

| Vector | Weight | Description |
|--------|--------|-------------|
| **Price Volatility** | 30% | 24h price change magnitude and direction |
| **Liquidity Health** | 25% | Pool liquidity changes and depth |
| **Volume Analysis** | 15% | Trading volume anomalies and spike detection |
| **Holder Concentration** | 15% | Whale ownership and centralization risk |
| **Momentum Analysis** | 15% | Combined trend signals (price × volume × liquidity) |

### Threat Types

| Threat | Trigger | Severity |
|--------|---------|----------|
| Rug Pull | Simultaneous liquidity drain + price crash | CRITICAL |
| Flash Loan Attack | Extreme volume spikes (>1000%) | CRITICAL |
| Whale Movement | Top holder >70% concentration | HIGH |
| Price Crash | >20% decline in 24h | HIGH |
| Liquidity Drain | >25% liquidity decrease | MEDIUM |
| Abnormal Volume | >200% volume increase | LOW |

---

## 📡 Data Sources

| Provider | Data | Type |
|----------|------|------|
| **CoinGecko** | ETH price, 24h change, volume | Free REST API |
| **DeFiLlama** | Ethereum chain TVL, liquidity | Free REST API |
| **Uniswap V2** | On-chain token prices, pair reserves, liquidity | On-chain (ethers.js) |
| **Multi-LLM Providers** | LLM market reasoning, threat analysis | Optional API |
| **Ethereum RPC** | Gas price, block number, contract state | On-chain |

---


## 🔒 Security

- **Non-Custodial**: Users retain full control — emergency withdrawal always available
- **Agent Authorization**: Users explicitly authorize which agents can act on their behalf
- **Risk Profiles**: Per-user configurable limits (slippage, stop-loss, action value caps)
- **On-Chain Audit**: Every AI decision permanently logged with reasoning hash attestation
- **ReentrancyGuard**: All fund-moving functions protected
- **OpenZeppelin**: Battle-tested contract libraries throughout
- **Dual-Source Verification**: CoinGecko + Uniswap on-chain prices cross-referenced

---

## 🖥️ Frontend


- **🎮 Interactive Agent Simulation**: Click "Run Agent Cycle" to watch Flipper execute a full 6-phase guardian loop (OBSERVE → ANALYZE → AI REASON → DEX VERIFY → DECIDE → EXECUTE) with animated phase timeline, typewriter terminal output, and real market data — see exactly how the AI agent works
- **Live market data**: Real-time ETH price from CoinGecko + Uniswap V2 on-chain price, auto-refreshing every 30s
- **Price oracle cross-verification**: Shows live delta between API and DEX prices with status indicators
- **No-wallet mode**: Reads on-chain data via public Ethereum RPC (no MetaMask required)
- **Wallet mode**: Full interaction — deposit, authorize agent, set risk profile, withdraw
- **AI Analysis display**: Real-time AI reasoning driven by live market data, sentiment, risk scores
- **13 TX evidence table**: Every transaction clickable with Etherscan links
- **Auto-refresh**: 30-second polling of on-chain state + market data
- **Contract verification**: Etherscan links, Sourcify badges

### Frontend Environment

```bash
NEXT_PUBLIC_REGISTRY_ADDRESS=0xac77139C2856788b7EEff767969353adF95D335e
NEXT_PUBLIC_VAULT_ADDRESS=0x73CE32Ece5d21836824C55c5EDB9d09b07F3a56E
NEXT_PUBLIC_LOGGER_ADDRESS=0xEbfb45d0c075d8BdabD6421bdFB9A4b9570219ea
```


---
Apache 2.0 license

---

<div align="center">

**Built with 🛡️ for Ethereum · Good Vibes Only**

*Flipper Protocol — Your DeFi positions deserve a guardian that never sleeps, powered by advanced strategy planning and execution following OpenClaw architecture.*

</div>
