"use client";

import { ethers } from "ethers";

// NOTE:
// This is a deterministic, client-side WDK-wallet *stand-in*.
// It creates a stable (pinned) wallet per connected MetaMask address.
// No project-critical flows currently depend on a backend-held private key.

const STORAGE_KEY = "flipper:wdkWallet:v1";

type StoredMap = Record<string, { privateKey: string; address: string; createdAt: number }>;

function loadMap(): StoredMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredMap;
  } catch {
    return {};
  }
}

function saveMap(map: StoredMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Returns a stable pseudo-WDK wallet pinned to a MetaMask EOA.
 *
 * Security note: this stores a private key in localStorage for demo purposes.
 */
export function getOrCreatePinnedWDKWallet(metaMaskAddress: string): { address: string; privateKey: string } {
  const key = metaMaskAddress.toLowerCase();
  const map = loadMap();

  const existing = map[key];
  if (existing?.privateKey && existing.address) {
    return { address: existing.address, privateKey: existing.privateKey };
  }

  // Create deterministic-ish wallet per address:
  // random 32 bytes + pinning guarantees same WDK wallet for same MetaMask address.
  // (Deterministic derivation could be done from a signature, but that requires user signing.)
  const wallet = ethers.Wallet.createRandom();
  const created = {
    privateKey: wallet.privateKey,
    address: wallet.address,
    createdAt: Date.now(),
  };
  map[key] = created;
  saveMap(map);
  return { address: created.address, privateKey: created.privateKey };
}

export function clearPinnedWDKWallet(metaMaskAddress: string) {
  const key = metaMaskAddress.toLowerCase();
  const map = loadMap();
  if (map[key]) {
    delete map[key];
    saveMap(map);
  }
}

