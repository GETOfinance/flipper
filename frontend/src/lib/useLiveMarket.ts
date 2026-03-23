// ═══════════════════════════════════════════════════════════════
// Flipper — Live Market Data Hook
// Fetches real-time ETH price from CoinGecko + Uniswap v2
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// Uniswap v2 Router on Ethereum Sepolia
const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const USDT = "0xd077a400968890eacc75cdc901f0356c943e4fdb";

const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
];

export interface LiveMarketData {
  ethPriceCoinGecko: number;
  ethPriceUniswap: number;
  priceDelta: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  ethTvl: number;
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
  oracleStatus: "consistent" | "warning" | "critical" | "loading";
}

const INITIAL_STATE: LiveMarketData = {
  ethPriceCoinGecko: 0,
  ethPriceUniswap: 0,
  priceDelta: 0,
  priceChange24h: 0,
  volume24h: 0,
  marketCap: 0,
  ethTvl: 0,
  lastUpdated: 0,
  isLoading: true,
  error: null,
  oracleStatus: "loading",
};

export function useLiveMarketData(refreshInterval = 30000) {
  const [data, setData] = useState<LiveMarketData>(INITIAL_STATE);

  const fetchData = useCallback(async () => {
    try {
      // Fetch CoinGecko + DeFiLlama in parallel
      const [cgRes, llamaRes] = await Promise.allSettled([
        fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true"
        ).then((r) => r.json()),
        fetch("https://api.llama.fi/v2/chains").then((r) => r.json()),
      ]);

      let cgPrice = 0;
      let change24h = 0;
      let volume = 0;
      let marketCap = 0;

      if (cgRes.status === "fulfilled" && cgRes.value?.ethereum) {
        const eth = cgRes.value.ethereum;
        cgPrice = eth.usd || 0;
        change24h = eth.usd_24h_change || 0;
        volume = eth.usd_24h_vol || 0;
        marketCap = eth.usd_market_cap || 0;
      }

      let ethTvl = 0;
      if (llamaRes.status === "fulfilled" && Array.isArray(llamaRes.value)) {
        const ethChain = llamaRes.value.find(
          (c: { name: string }) => c.name === "Ethereum"
        );
        if (ethChain) ethTvl = ethChain.tvl || 0;
      }

      // Fetch Uniswap v2 on-chain price
      let uniPrice = 0;
      try {
        const sepoliaProvider = new ethers.JsonRpcProvider(
          "https://rpc.sepolia.org"
        );
        const router = new ethers.Contract(
          UNISWAP_ROUTER,
          ROUTER_ABI,
          sepoliaProvider
        );
        const amountIn = ethers.parseEther("1");
        const amounts = await router.getAmountsOut(amountIn, [WETH, USDT]);
        uniPrice = parseFloat(ethers.formatEther(amounts[1]));
      } catch {
        // Uniswap price unavailable — use CoinGecko only
        uniPrice = cgPrice;
      }

      // Calculate delta
      const delta =
        cgPrice > 0 && uniPrice > 0
          ? Math.abs(((cgPrice - uniPrice) / uniPrice) * 100)
          : 0;

      const oracleStatus: LiveMarketData["oracleStatus"] =
        delta > 5 ? "critical" : delta > 1 ? "warning" : "consistent";

      setData({
        ethPriceCoinGecko: cgPrice,
        ethPriceUniswap: uniPrice,
        priceDelta: delta,
        priceChange24h: change24h,
        volume24h: volume,
        marketCap: marketCap,
        ethTvl: ethTvl,
        lastUpdated: Date.now(),
        isLoading: false,
        error: null,
        oracleStatus,
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch",
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return data;
}
