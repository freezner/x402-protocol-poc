import "dotenv/config";
import { settingsStore } from "./settings.js";

export const config = {
  agent: {
    privateKey: process.env.AGENT_PRIVATE_KEY ?? "",
  },
  server: {
    port: Number(process.env.SERVER_PORT ?? 3000),
    walletAddress: process.env.SERVER_WALLET_ADDRESS ?? "",
  },
  chain: {
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
    name: "base-sepolia" as const,
    id: 84532,
  },
  facilitator: {
    url: process.env.FACILITATOR_URL ?? "https://x402.org/facilitator",
  },
  payment: {
    maxPerRequest: "0.10",   // USDC
    maxPerSession: "1.00",   // USDC
    autoApproveUnder: "0.05", // USDC
  },
} as const;

/** settings 파일 우선, 없으면 .env 폴백 */
export function getAgentPrivateKey(): string {
  return settingsStore.getAgentPrivateKey() ?? config.agent.privateKey;
}

/** settings 파일 우선, 없으면 .env 폴백 */
export function getServerWalletAddress(): string {
  return settingsStore.getServerWalletAddress() ?? config.server.walletAddress;
}

export function validateConfig(keys: (keyof typeof config)[]) {
  const missing: string[] = [];

  if (keys.includes("agent") && !getAgentPrivateKey()) {
    missing.push("AGENT_PRIVATE_KEY (.env 또는 /settings 메뉴에서 설정)");
  }
  if (keys.includes("server") && !getServerWalletAddress()) {
    missing.push("SERVER_WALLET_ADDRESS (.env 또는 /settings 메뉴에서 설정)");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required config: ${missing.join(", ")}\n` +
      `Copy .env.example to .env or configure via the /settings page.`
    );
  }
}
