// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — OpenClaw Integration
// Agent management and notification system using OpenClaw
// ═══════════════════════════════════════════════════════════════

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface OpenClawConfig {
  enabled: boolean;
  gatewayPort?: number;
  devMode?: boolean;
  channels?: {
    telegram?: boolean;
    discord?: boolean;
    whatsapp?: boolean;
  };
}

export interface AgentNotification {
  type: "threat" | "protection" | "strategy" | "status";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  data?: any;
  timestamp: number;
}

export interface AgentStatus {
  agentId: string;
  status: "running" | "stopped" | "error";
  cycleCount: number;
  lastAction: string;
  uptime: number;
  metrics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
  };
}

/**
 * OpenClaw Integration Manager
 * Handles agent management and notifications via OpenClaw
 */
export class OpenClawIntegration {
  private config: OpenClawConfig;
  private isGatewayRunning: boolean = false;
  private notificationQueue: AgentNotification[] = [];

  constructor(config: OpenClawConfig = { enabled: true }) {
    this.config = config;
    console.log("[OpenClaw Integration] Initialized");
  }

  /**
   * Start OpenClaw Gateway
   */
  async startGateway(): Promise<boolean> {
    if (!this.config.enabled) {
      console.log("[OpenClaw Integration] Disabled, skipping gateway start");
      return false;
    }

    try {
      const port = this.config.gatewayPort || (this.config.devMode ? 19001 : 18789);
      const devFlag = this.config.devMode ? "--dev" : "";

      console.log(`[OpenClaw Integration] Starting gateway on port ${port}...`);

      // Start gateway in background
      const command = `openclaw gateway ${devFlag} --port ${port} > /dev/null 2>&1 &`;
      await execAsync(command);

      // Wait for gateway to start
      await this.sleep(3000);

      // Check if gateway is running
      const health = await this.checkGatewayHealth();
      if (health) {
        this.isGatewayRunning = true;
        console.log("[OpenClaw Integration] Gateway started successfully");
        return true;
      } else {
        console.warn("[OpenClaw Integration] Gateway health check failed");
        return false;
      }
    } catch (error: any) {
      console.error(`[OpenClaw Integration] Failed to start gateway: ${error.message}`);
      return false;
    }
  }

  /**
   * Stop OpenClaw Gateway
   */
  async stopGateway(): Promise<boolean> {
    try {
      console.log("[OpenClaw Integration] Stopping gateway...");
      await execAsync("pkill -f 'openclaw gateway'");
      this.isGatewayRunning = false;
      console.log("[OpenClaw Integration] Gateway stopped");
      return true;
    } catch (error: any) {
      console.error(`[OpenClaw Integration] Failed to stop gateway: ${error.message}`);
      return false;
    }
  }

  /**
   * Check Gateway Health
   */
  async checkGatewayHealth(): Promise<boolean> {
    try {
      const { stdout } = await execAsync("openclaw health --json");
      const health = JSON.parse(stdout);
      return health.status === "healthy";
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Send Notification via OpenClaw
   */
  async sendNotification(notification: AgentNotification): Promise<boolean> {
    if (!this.isGatewayRunning || !this.config.enabled) {
      // Queue notification for later
      this.notificationQueue.push(notification);
      console.log(`[OpenClaw Integration] Notification queued: ${notification.title}`);
      return false;
    }

    try {
      const message = this.formatNotification(notification);

      // Send via configured channels
      const results = [];

      if (this.config.channels?.telegram) {
        results.push(await this.sendToTelegram(message));
      }

      if (this.config.channels?.discord) {
        results.push(await this.sendToDiscord(message));
      }

      if (this.config.channels?.whatsapp) {
        results.push(await this.sendToWhatsApp(message));
      }

      const success = results.some(r => r);
      if (success) {
        console.log(`[OpenClaw Integration] Notification sent: ${notification.title}`);
      } else {
        console.warn(`[OpenClaw Integration] Failed to send notification: ${notification.title}`);
      }

      return success;
    } catch (error: any) {
      console.error(`[OpenClaw Integration] Failed to send notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Send Threat Notification
   */
  async sendThreatNotification(
    threatType: string,
    severity: string,
    reasoning: string,
    suggestedAction: string
  ): Promise<boolean> {
    const notification: AgentNotification = {
      type: "threat",
      severity: severity as "info" | "warning" | "critical",
      title: `🚨 ${threatType} Detected`,
      message: `${reasoning}\n\nSuggested Action: ${suggestedAction}`,
      timestamp: Date.now(),
    };

    return await this.sendNotification(notification);
  }

  /**
   * Send Protection Notification
   */
  async sendProtectionNotification(
    action: string,
    txHash: string,
    amount: string
  ): Promise<boolean> {
    const notification: AgentNotification = {
      type: "protection",
      severity: "warning",
      title: `🛡️ Protection Executed: ${action}`,
      message: `Transaction: ${txHash}\nAmount: ${amount}`,
      timestamp: Date.now(),
    };

    return await this.sendNotification(notification);
  }

  /**
   * Send Strategy Notification
   */
  async sendStrategyNotification(
    strategyType: string,
    objective: string,
    actionsCount: number
  ): Promise<boolean> {
    const notification: AgentNotification = {
      type: "strategy",
      severity: "info",
      title: `🎯 Strategy Generated: ${strategyType}`,
      message: `Objective: ${objective}\nActions: ${actionsCount}`,
      timestamp: Date.now(),
    };

    return await this.sendNotification(notification);
  }

  /**
   * Send Status Update
   */
  async sendStatusUpdate(status: AgentStatus): Promise<boolean> {
    const notification: AgentNotification = {
      type: "status",
      severity: "info",
      title: `📊 Agent Status: ${status.status.toUpperCase()}`,
      message: `Cycle: ${status.cycleCount}\nLast Action: ${status.lastAction}\nUptime: ${Math.floor(status.uptime / 60)}m\nExecutions: ${status.metrics.successfulExecutions}/${status.metrics.totalExecutions}`,
      timestamp: Date.now(),
    };

    return await this.sendNotification(notification);
  }

  /**
   * Process Queued Notifications
   */
  async processQueuedNotifications(): Promise<number> {
    if (!this.isGatewayRunning || this.notificationQueue.length === 0) {
      return 0;
    }

    let sent = 0;
    for (const notification of this.notificationQueue) {
      const success = await this.sendNotification(notification);
      if (success) sent++;
    }

    this.notificationQueue = [];
    console.log(`[OpenClaw Integration] Processed ${sent} queued notifications`);
    return sent;
  }

  /**
   * Format Notification Message
   */
  private formatNotification(notification: AgentNotification): string {
    const emoji = notification.type === "threat" ? "🚨" :
                  notification.type === "protection" ? "🛡️" :
                  notification.type === "strategy" ? "🎯" : "📊";

    const severity = notification.severity.toUpperCase();

    return `
${emoji} Flipper Protocol Alert

Type: ${notification.type}
Severity: ${severity}
Title: ${notification.title}

${notification.message}

Timestamp: ${new Date(notification.timestamp).toISOString()}
    `.trim();
  }

  /**
   * Send to Telegram
   */
  private async sendToTelegram(message: string): Promise<boolean> {
    try {
      // Use OpenClaw's message send command
      const command = `openclaw message send --channel telegram --message "${message.replace(/"/g, '\\"')}"`;
      await execAsync(command);
      return true;
    } catch (error: any) {
      console.error(`[OpenClaw Integration] Telegram send failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Send to Discord
   */
  private async sendToDiscord(message: string): Promise<boolean> {
    try {
      const command = `openclaw message send --channel discord --message "${message.replace(/"/g, '\\"')}"`;
      await execAsync(command);
      return true;
    } catch (error: any) {
      console.error(`[OpenClaw Integration] Discord send failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Send to WhatsApp
   */
  private async sendToWhatsApp(message: string): Promise<boolean> {
    try {
      const command = `openclaw message send --channel whatsapp --message "${message.replace(/"/g, '\\"')}"`;
      await execAsync(command);
      return true;
    } catch (error: any) {
      console.error(`[OpenClaw Integration] WhatsApp send failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get Gateway Status
   */
  async getGatewayStatus(): Promise<{
    running: boolean;
    health?: string;
    port?: number;
  }> {
    const health = await this.checkGatewayHealth();
    return {
      running: this.isGatewayRunning,
      health: health ? "healthy" : "unhealthy",
      port: this.config.gatewayPort || (this.config.devMode ? 19001 : 18789),
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enable/Disable Integration
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`[OpenClaw Integration] ${enabled ? "Enabled" : "Disabled"}`);
  }

  /**
   * Get Configuration
   */
  getConfig(): OpenClawConfig {
    return { ...this.config };
  }
}