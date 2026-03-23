// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — USD₮ MCP Integration
// Model Context Protocol integration for USD₮ operations
// ═══════════════════════════════════════════════════════════════

import { ethers } from "ethers";
import {
  MCPToolkitConfig,
  DEFAULT_MCP_CONFIG,
} from "./usdt-config";
import { USDTWDKIntegration } from "./usdt-wdk-integration";
import { USDTDecisionEngine, DecisionContext, USDTDecision } from "./usdt-decision-engine";

// MCP Tool Definition
export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<any>;
}

// MCP Tool Result
export interface MCPToolResult {
  success: boolean;
  tool: string;
  result?: any;
  error?: string;
  timestamp: number;
}

// MCP Server Configuration
export interface MCPServerConfig {
  url: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * USD₮ MCP Integration Manager
 * Handles USD₮ operations via Model Context Protocol
 */
export class USDTMCPIntegration {
  private config: MCPToolkitConfig;
  private wdkIntegration: USDTWDKIntegration;
  private decisionEngine: USDTDecisionEngine;
  private tools: Map<string, MCPTool> = new Map();
  private toolHistory: MCPToolResult[] = [];

  constructor(
    wdkIntegration: USDTWDKIntegration,
    decisionEngine: USDTDecisionEngine,
    config?: Partial<MCPToolkitConfig>
  ) {
    this.wdkIntegration = wdkIntegration;
    this.decisionEngine = decisionEngine;
    this.config = {
      ...DEFAULT_MCP_CONFIG,
      ...config,
    };

    // Initialize MCP tools
    this.initializeTools();

    console.log("[USD₮ MCP Integration] Initialized");
    console.log(`  Server URL: ${this.config.serverUrl}`);
    console.log(`  Tools: ${this.config.tools.length}`);
  }

  /**
   * Initialize MCP tools
   */
  private initializeTools(): void {
    // Tool: Check USD₮ Balance
    this.tools.set("check_balance", {
      name: "check_balance",
      description: "Check USD₮ balance for a wallet address",
      parameters: {
        address: {
          type: "string",
          description: "Wallet address to check balance for",
          required: true,
        },
      },
      handler: async (params) => {
        return await this.wdkIntegration.getBalance();
      },
    });

    // Tool: Get Wallet Info
    this.tools.set("get_wallet_info", {
      name: "get_wallet_info",
      description: "Get wallet information including address and chain ID",
      parameters: {},
      handler: async (params) => {
        return this.wdkIntegration.getWalletInfo();
      },
    });

    // Tool: Transfer USD₮
    this.tools.set("transfer_usdt", {
      name: "transfer_usdt",
      description: "Transfer USD₮ to another address",
      parameters: {
        to: {
          type: "string",
          description: "Recipient address",
          required: true,
        },
        amount: {
          type: "string",
          description: "Amount to transfer (in USDT, e.g., '100.5')",
          required: true,
        },
      },
      handler: async (params) => {
        const amount = ethers.parseUnits(params.amount, 6);
        return await this.wdkIntegration.transfer(params.to, amount);
      },
    });

    // Tool: Approve USD₮ Spending
    this.tools.set("approve_usdt", {
      name: "approve_usdt",
      description: "Approve USD₮ spending for a spender address",
      parameters: {
        spender: {
          type: "string",
          description: "Spender address to approve",
          required: true,
        },
        amount: {
          type: "string",
          description: "Amount to approve (in USDT, e.g., '1000')",
          required: true,
        },
      },
      handler: async (params) => {
        const amount = ethers.parseUnits(params.amount, 6);
        return await this.wdkIntegration.approve(params.spender, amount);
      },
    });

    // Tool: Get Allowance
    this.tools.set("get_allowance", {
      name: "get_allowance",
      description: "Get USD₮ allowance for a spender",
      parameters: {
        owner: {
          type: "string",
          description: "Owner address",
          required: true,
        },
        spender: {
          type: "string",
          description: "Spender address",
          required: true,
        },
      },
      handler: async (params) => {
        const allowance = await this.wdkIntegration.getAllowance(params.owner, params.spender);
        return {
          allowance: allowance.toString(),
          formatted: ethers.formatUnits(allowance, 6),
        };
      },
    });

    // Tool: Make USD₮ Decision
    this.tools.set("make_usdt_decision", {
      name: "make_usdt_decision",
      description: "Make a decision about whether to use USD₮ based on market conditions",
      parameters: {
        marketConditions: {
          type: "object",
          description: "Market conditions including volatility, liquidity, etc.",
          required: true,
        },
        riskAssessment: {
          type: "object",
          description: "Risk assessment including overall risk, liquidation risk, etc.",
          required: true,
        },
        transactionDetails: {
          type: "object",
          description: "Transaction details including type, amount, urgency, etc.",
          required: true,
        },
      },
      handler: async (params) => {
        const context: DecisionContext = {
          timestamp: Date.now(),
          marketConditions: params.marketConditions,
          riskAssessment: params.riskAssessment,
          transactionDetails: params.transactionDetails,
          walletState: {
            usdtBalance: 0n,
            ethBalance: 0n,
            totalValueUSD: 0,
            exposureToVolatileAssets: 0,
          },
          networkState: {
            chainId: 1,
            networkCongestion: 0,
            blockTime: 12,
            tps: 15,
          },
        };
        return await this.decisionEngine.makeDecision(context);
      },
    });

    // Tool: Execute USD₮ Decision
    this.tools.set("execute_usdt_decision", {
      name: "execute_usdt_decision",
      description: "Execute a USD₮ decision based on the decision result",
      parameters: {
        decision: {
          type: "object",
          description: "USD₮ decision object",
          required: true,
        },
        params: {
          type: "object",
          description: "Execution parameters (to, amount, spender, etc.)",
          required: true,
        },
      },
      handler: async (params) => {
        return await this.wdkIntegration.executeDecision(params.decision, params.params);
      },
    });

    // Tool: Get Transaction History
    this.tools.set("get_transaction_history", {
      name: "get_transaction_history",
      description: "Get USD₮ transaction history",
      parameters: {
        limit: {
          type: "number",
          description: "Number of transactions to return",
          required: false,
        },
      },
      handler: async (params) => {
        const history = this.wdkIntegration.getTransactionHistory();
        const limit = params.limit || history.length;
        return history.slice(-limit);
      },
    });

    // Tool: Get Approval History
    this.tools.set("get_approval_history", {
      name: "get_approval_history",
      description: "Get USD₮ approval history",
      parameters: {
        limit: {
          type: "number",
          description: "Number of approvals to return",
          required: false,
        },
      },
      handler: async (params) => {
        const history = this.wdkIntegration.getApprovalHistory();
        const limit = params.limit || history.length;
        return history.slice(-limit);
      },
    });

    // Tool: Estimate Gas
    this.tools.set("estimate_gas", {
      name: "estimate_gas",
      description: "Estimate gas cost for a USD₮ operation",
      parameters: {
        operation: {
          type: "string",
          description: "Operation type (transfer, approve, transferFrom)",
          required: true,
        },
        params: {
          type: "object",
          description: "Operation parameters",
          required: true,
        },
      },
      handler: async (params) => {
        const gas = await this.wdkIntegration.estimateGas(params.operation, params.params);
        return {
          gas: gas.toString(),
          formatted: ethers.formatUnits(gas, "gwei"),
        };
      },
    });

    // Tool: Batch Approve
    this.tools.set("batch_approve", {
      name: "batch_approve",
      description: "Approve USD₮ spending for multiple spenders",
      parameters: {
        spenders: {
          type: "array",
          description: "Array of spender objects with address and amount",
          required: true,
        },
      },
      handler: async (params) => {
        const spenders = params.spenders.map((s: any) => ({
          address: s.address,
          amount: ethers.parseUnits(s.amount, 6),
        }));
        return await this.wdkIntegration.batchApprove(spenders);
      },
    });

    // Tool: Revoke Approval
    this.tools.set("revoke_approval", {
      name: "revoke_approval",
      description: "Revoke USD₮ approval for a spender",
      parameters: {
        spender: {
          type: "string",
          description: "Spender address to revoke approval for",
          required: true,
        },
      },
      handler: async (params) => {
        return await this.wdkIntegration.revokeApproval(params.spender);
      },
    });

    // Tool: Get Decision Statistics
    this.tools.set("get_decision_stats", {
      name: "get_decision_stats",
      description: "Get USD₮ decision statistics",
      parameters: {},
      handler: async (params) => {
        return this.decisionEngine.getStatistics();
      },
    });

    // Tool: Get Decision History
    this.tools.set("get_decision_history", {
      name: "get_decision_history",
      description: "Get USD₮ decision history",
      parameters: {
        limit: {
          type: "number",
          description: "Number of decisions to return",
          required: false,
        },
      },
      handler: async (params) => {
        const history = this.decisionEngine.getDecisionHistory();
        const limit = params.limit || history.length;
        return history.slice(-limit);
      },
    });

    console.log(`[USD₮ MCP Integration] ${this.tools.size} tools initialized`);
  }

  /**
   * Execute an MCP tool
   */
  async executeTool(toolName: string, params: any): Promise<MCPToolResult> {
    console.log(`[USD₮ MCP Integration] Executing tool: ${toolName}`);

    const tool = this.tools.get(toolName);
    if (!tool) {
      const result: MCPToolResult = {
        success: false,
        tool: toolName,
        error: `Tool not found: ${toolName}`,
        timestamp: Date.now(),
      };
      this.toolHistory.push(result);
      return result;
    }

    try {
      const result = await tool.handler(params);
      const toolResult: MCPToolResult = {
        success: true,
        tool: toolName,
        result,
        timestamp: Date.now(),
      };
      this.toolHistory.push(toolResult);
      console.log(`[USD₮ MCP Integration] Tool executed successfully: ${toolName}`);
      return toolResult;
    } catch (error: any) {
      const toolResult: MCPToolResult = {
        success: false,
        tool: toolName,
        error: error.message,
        timestamp: Date.now(),
      };
      this.toolHistory.push(toolResult);
      console.error(`[USD₮ MCP Integration] Tool execution failed: ${toolName} - ${error.message}`);
      return toolResult;
    }
  }

  /**
   * Get available tools
   */
  getAvailableTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool by name
   */
  getTool(toolName: string): MCPTool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Get tool history
   */
  getToolHistory(): MCPToolResult[] {
    return [...this.toolHistory];
  }

  /**
   * Get tool statistics
   */
  getToolStatistics(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    mostUsedTool: string;
    toolUsageCount: Record<string, number>;
  } {
    const total = this.toolHistory.length;
    const successful = this.toolHistory.filter(r => r.success).length;
    const failed = total - successful;

    const toolUsageCount: Record<string, number> = {};
    for (const result of this.toolHistory) {
      toolUsageCount[result.tool] = (toolUsageCount[result.tool] || 0) + 1;
    }

    const mostUsedTool = Object.entries(toolUsageCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";

    return {
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      mostUsedTool,
      toolUsageCount,
    };
  }

  /**
   * Execute multiple tools in sequence
   */
  async executeToolSequence(toolSequence: Array<{ tool: string; params: any }>): Promise<MCPToolResult[]> {
    console.log(`[USD₮ MCP Integration] Executing tool sequence: ${toolSequence.length} tools`);

    const results: MCPToolResult[] = [];

    for (const { tool, params } of toolSequence) {
      const result = await this.executeTool(tool, params);
      results.push(result);

      // Stop sequence if a tool fails
      if (!result.success) {
        console.warn(`[USD₮ MCP Integration] Tool sequence stopped due to failure: ${tool}`);
        break;
      }
    }

    return results;
  }

  /**
   * Get configuration
   */
  getConfig(): MCPToolkitConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MCPToolkitConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("[USD₮ MCP Integration] Configuration updated");
  }

  /**
   * Check if MCP is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Enable or disable MCP
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`[USD₮ MCP Integration] ${enabled ? "Enabled" : "Disabled"}`);
  }

  /**
   * Get tool schema for AI agents
   */
  getToolSchema(): any {
    return {
      name: "usdt_toolkit",
      description: "USD₮ operations toolkit for wallet and transaction management",
      tools: Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
    };
  }
}