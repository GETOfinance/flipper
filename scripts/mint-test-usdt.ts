/**
 * Mint test USDT on Sepolia (or any configured Hardhat network).
 *
 * SECURITY:
 * - Do NOT hardcode private keys in this script.
 * - Provide PRIVATE_KEY via environment variables (see .env.example).
 *
 * Usage (recommended: environment variables; avoids Hardhat CLI arg parsing issues):
 *   PRIVATE_KEY=... MINT_TOKEN=0xb60B42C095d08776a6ecc9a246180FE37AbA02A5 \
 *   MINT_TO=0x3a18f9f0E07269D2a9161A0E83745b4e8BbAdEE8 MINT_AMOUNT=100 \
 *   npx hardhat run scripts/mint-test-usdt.ts --network sepolia
 *
 * Optional:
 *   - MINT_DECIMALS=6
 *   - MINT_DRY_RUN=true
 *
 * Advanced (only if your Hardhat version allows forwarding args):
 *   PRIVATE_KEY=... npx hardhat run scripts/mint-test-usdt.ts --network sepolia -- \
 *     --token ... --to ... --amount 100
 */

import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

type Args = {
  token: string;
  to: string;
  amount: string;
  decimals?: string;
  dryRun?: boolean;
};

function getArgValue(argv: string[], name: string): string | undefined {
  const idx = argv.indexOf(name);
  if (idx === -1) return undefined;
  return argv[idx + 1];
}

function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

function parseArgs(argv: string[]): Args {
  // Prefer env vars (Hardhat v2 commonly rejects unknown args / `--` separator)
  const token = getArgValue(argv, "--token") || process.env.MINT_TOKEN || "";
  const to = getArgValue(argv, "--to") || process.env.MINT_TO || "";
  const amount = getArgValue(argv, "--amount") || process.env.MINT_AMOUNT || "";
  const decimals = getArgValue(argv, "--decimals") || process.env.MINT_DECIMALS;
  const dryRun = hasFlag(argv, "--dry-run") || String(process.env.MINT_DRY_RUN || "").toLowerCase() === "true";

  if (!token || !ethers.isAddress(token)) {
    throw new Error(
      "Missing/invalid token. Set MINT_TOKEN=<address> (recommended) or pass --token <address> if supported by your Hardhat CLI"
    );
  }
  if (!to || !ethers.isAddress(to)) {
    throw new Error(
      "Missing/invalid recipient. Set MINT_TO=<address> (recommended) or pass --to <address> if supported by your Hardhat CLI"
    );
  }
  if (!amount) {
    throw new Error(
      "Missing amount. Set MINT_AMOUNT=<number> (recommended) or pass --amount <number> if supported by your Hardhat CLI"
    );
  }

  return { token, to, amount, decimals, dryRun };
}

function normalizePrivateKey(pk: string): string {
  const trimmed = pk.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

const TEST_ERC20_MINT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  // Common test-token mint shapes
  "function mint(address to, uint256 amount)",
  "function mint(uint256 amount)",
];

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const rawPk = process.env.PRIVATE_KEY || "";
  if (!rawPk) {
    throw new Error("Missing PRIVATE_KEY in environment. Set it like PRIVATE_KEY=... (see .env.example)");
  }
  const pk = normalizePrivateKey(rawPk);
  const wallet = new ethers.Wallet(pk, ethers.provider);

  const net = await ethers.provider.getNetwork();
  console.log(`Network:  ${net.name} (chainId=${net.chainId})`);
  console.log(`Sender:   ${wallet.address}`);
  console.log(`Token:    ${args.token}`);
  console.log(`Mint to:  ${args.to}`);
  console.log(`Amount:   ${args.amount}`);
  if (args.dryRun) console.log("Mode:    DRY RUN (no transaction will be sent)");

  const code = await ethers.provider.getCode(args.token);
  if (!code || code === "0x") {
    throw new Error(`No contract code at token address: ${args.token}`);
  }

  const token = new ethers.Contract(args.token, TEST_ERC20_MINT_ABI, wallet);

  let decimals: number = 6;
  if (args.decimals) {
    decimals = Number(args.decimals);
  } else {
    try {
      decimals = Number(await token.decimals());
    } catch {
      // default to 6 for USDT-like tokens
    }
  }

  let symbol = "TOKEN";
  try {
    symbol = String(await token.symbol());
  } catch {
    // ignore
  }

  const amountUnits = ethers.parseUnits(args.amount, decimals);
  const before = await token.balanceOf(args.to);
  console.log(`Balance before: ${ethers.formatUnits(before, decimals)} ${symbol}`);

  // Try mint(to, amount) first, then fallback to mint(amount)
  const tryMintTo = async () => {
    const tx = await token.mint(args.to, amountUnits);
    console.log(`Sent tx (mint(to,amount)): ${tx.hash}`);
    return tx;
  };
  const tryMintSelf = async () => {
    const tx = await token.mint(amountUnits);
    console.log(`Sent tx (mint(amount)): ${tx.hash}`);
    return tx;
  };

  if (args.dryRun) {
    console.log("Dry-run complete.");
    return;
  }

  let receiptHash = "";
  try {
    const tx = await tryMintTo();
    const receipt = await tx.wait();
    receiptHash = receipt?.hash || tx.hash;
  } catch (e1: any) {
    console.log(`mint(to,amount) failed: ${String(e1?.shortMessage || e1?.message || e1).slice(0, 200)}`);
    console.log("Trying mint(amount) fallback (mints to the sender in many test tokens)...");
    const tx = await tryMintSelf();
    const receipt = await tx.wait();
    receiptHash = receipt?.hash || tx.hash;
  }

  const after = await token.balanceOf(args.to);
  console.log(`Balance after:  ${ethers.formatUnits(after, decimals)} ${symbol}`);
  console.log(`Tx hash:        ${receiptHash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
