# OpenClaw Integration for Flipper Protocol

## Overview

OpenClaw has been successfully installed and integrated into the Flipper Protocol for agent management and notifications. OpenClaw is an agent orchestration platform that provides:

- Agent management and workspaces
- Chat channel integrations (Telegram, Discord, WhatsApp)
- Skills and plugins system
- Gateway service for WebSocket communication
- Message routing and delivery

## Installation

OpenClaw was installed globally using:
```bash
npm install -g openclaw@latest
```

## Integration Components

### 1. OpenClaw Integration Manager

**File**: [`agent/src/openclaw/openclaw-integration.ts`](agent/src/openclaw/openclaw-integration.ts)

The integration manager provides:

- **Gateway Management**: Start/stop OpenClaw WebSocket gateway
- **Health Monitoring**: Check gateway health status
- **Notification System**: Send notifications via configured channels
- **Queue Management**: Queue notifications when gateway is unavailable
- **Multi-Channel Support**: Telegram, Discord, WhatsApp

### 2. Notification Types

The integration supports four notification types:

1. **Threat Notifications**: Alert when threats are detected
2. **Protection Notifications**: Notify when protective actions are executed
3. **Strategy Notifications**: Inform about generated strategies
4. **Status Updates**: Regular agent status reports

### 3. Configuration

Configure OpenClaw integration in `.env`:

```bash
# Enable OpenClaw integration
OPENCLAW_ENABLED=true

# Enable specific channels
OPENCLAW_TELEGRAM=true
OPENCLAW_DISCORD=true
OPENCLAW_WHATSAPP=false

# Gateway configuration (optional)
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_DEV_MODE=false
```

## Usage

### Basic Setup

```typescript
import { OpenClawIntegration } from "./openclaw/openclaw-integration";

// Initialize OpenClaw integration
const openClaw = new OpenClawIntegration({
  enabled: true,
  devMode: false,
  channels: {
    telegram: true,
    discord: true,
    whatsapp: false,
  },
});

// Start the gateway
await openClaw.startGateway();
```

### Sending Notifications

```typescript
// Send threat notification
await openClaw.sendThreatNotification(
  "PRICE_CRASH",
  "HIGH",
  "Price dropped 15% in 24h",
  "STOP_LOSS"
);

// Send protection notification
await openClaw.sendProtectionNotification(
  "EMERGENCY_WITHDRAW",
  "0x123...",
  "1.5 ETH"
);

// Send strategy notification
await openClaw.sendStrategyNotification(
  "YIELD_FARMING",
  "Generate yield through liquidity provision",
  3
);

// Send status update
await openClaw.sendStatusUpdate({
  agentId: "agent-0",
  status: "running",
  cycleCount: 42,
  lastAction: "Strategy executed",
  uptime: 3600000,
  metrics: {
    totalExecutions: 50,
    successfulExecutions: 48,
    failedExecutions: 2,
  },
});
```

## Agent Integration

OpenClaw is integrated into the main agent loop in [`agent/src/index.ts`](agent/src/index.ts):

```typescript
class FlipperAgent {
  private openClaw: OpenClawIntegration;

  constructor() {
    // Initialize OpenClaw Integration
    this.openClaw = new OpenClawIntegration({
      enabled: process.env.OPENCLAW_ENABLED === "true",
      devMode: CONFIG.rpcUrl.includes("sepolia"),
      channels: {
        telegram: process.env.OPENCLAW_TELEGRAM === "true",
        discord: process.env.OPENCLAW_DISCORD === "true",
        whatsapp: process.env.OPENCLAW_WHATSAPP === "true",
      },
    });
  }

  async start(): Promise<void> {
    // Start OpenClaw Gateway if enabled
    if (this.openClaw.getConfig().enabled) {
      await this.openClaw.startGateway();
    }

    // ... rest of agent initialization
  }
}
```

## Architecture

```
Flipper Protocol
├── Custom Strategy System (DeFi Operations)
│   ├── Strategy Planning
│   ├── DEX Operations (Uniswap, SushiSwap)
│   ├── Lending Operations (Aave V3)
│   └── Strategy Execution
│
└── OpenClaw Integration (Agent Management)
    ├── Gateway Service
    ├── Notification System
    ├── Channel Integrations
    └── Agent Orchestration
```

## Benefits

1. **Separation of Concerns**: OpenClaw handles agent management and notifications, while the custom strategy system handles DeFi operations
2. **Multi-Channel Notifications**: Send alerts to Telegram, Discord, or WhatsApp
3. **Agent Orchestration**: Use OpenClaw's agent management capabilities
4. **Queue Management**: Notifications are queued when gateway is unavailable
5. **Health Monitoring**: Track gateway health and status

## OpenClaw Commands

Useful OpenClaw CLI commands:

```bash
# Start gateway
openclaw gateway --port 18789

# Check gateway health
openclaw health

# List available skills
openclaw skills list

# Send message via Telegram
openclaw message send --channel telegram --message "Hello"

# Open dashboard
openclaw dashboard

# View logs
openclaw logs
```

## Documentation

- **OpenClaw CLI**: https://docs.openclaw.ai/cli
- **OpenClaw Skills**: https://docs.openclaw.ai/cli/skills
- **OpenClaw Gateway**: https://docs.openclaw.ai/cli/gateway

## Future Enhancements

- [ ] Integrate OpenClaw skills for advanced agent capabilities
- [ ] Use OpenClaw's agent workspace management
- [ ] Implement OpenClaw's message routing for complex workflows
- [ ] Add OpenClaw's cron job scheduling for periodic tasks
- [ ] Use OpenClaw's device pairing for secure authentication

## Troubleshooting

### Gateway Won't Start

```bash
# Check if port is in use
lsof -i :18789

# Kill existing gateway
pkill -f 'openclaw gateway'

# Start with force flag
openclaw gateway --force
```

### Notifications Not Sending

1. Check gateway health: `openclaw health`
2. Verify channel configuration in `.env`
3. Check notification queue: `openClaw.getGatewayStatus()`
4. Process queued notifications: `openClaw.processQueuedNotifications()`

### Channel Configuration

Each channel requires separate setup:

```bash
# Telegram
openclaw channels login --channel telegram

# Discord
openclaw channels login --channel discord

# WhatsApp
openclaw channels login --channel whatsapp
```

## License

MIT License - See LICENSE file for details