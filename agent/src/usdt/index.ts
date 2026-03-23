// ═══════════════════════════════════════════════════════════════
// Flipper Protocol — USD₮ Module
// Main export file for USD₮ integration
// ═══════════════════════════════════════════════════════════════

// Configuration
export {
  USDT_CONTRACT_ADDRESS,
  USDT_METADATA,
  USDTUsageRole,
  USDTNetworkConfig,
  USDT_NETWORKS,
  USDT_ABI,
  USDTDecisionThresholds,
  DEFAULT_USDT_THRESHOLDS,
  USDTUsageContext,
  WDKUSDTConfig,
  MCPToolkitConfig,
  DEFAULT_MCP_CONFIG,
  USDTDecisionRule,
  USDT_DECISION_RULES,
  getUSDTAddress,
  isUSDTSupported,
  getNetworkConfig,
  formatUSDT,
  parseUSDT,
  validateUSDTAddress,
} from "./usdt-config";

// Decision Engine
export {
  USDTDecisionEngine,
  DecisionContext,
  MarketConditions,
  RiskAssessment,
  TransactionDetails,
  WalletState,
  NetworkState,
  USDTDecision,
  DecisionHistory,
} from "./usdt-decision-engine";

// WDK Integration
export {
  USDTWDKIntegration,
  WDKWallet,
  USDTBalance,
  USDTTransaction,
  USDTApproval,
  USDTOperationResult,
} from "./usdt-wdk-integration";

// MCP Integration
export {
  USDTMCPIntegration,
  MCPTool,
  MCPToolResult,
  MCPServerConfig,
} from "./usdt-mcp-integration";

// Manager
export {
  USDTManager,
  USDTManagerConfig,
  USDTOperationRequest,
  USDTOperationResponse,
} from "./usdt-manager";