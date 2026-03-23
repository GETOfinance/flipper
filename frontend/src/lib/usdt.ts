"use client";

import { ethers } from "ethers";
import { SEPOLIA_USDT_ADDRESS } from "./constants";

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export const USDT_DECIMALS = 6;

export function parseUSDT(amount: string): bigint {
  return ethers.parseUnits(amount || "0", USDT_DECIMALS);
}

export function formatUSDT(amount: bigint): string {
  return ethers.formatUnits(amount, USDT_DECIMALS);
}

export function getUSDTContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(SEPOLIA_USDT_ADDRESS, ERC20_ABI, signerOrProvider);
}

