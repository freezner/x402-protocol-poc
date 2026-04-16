import "dotenv/config";

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

export function validateConfig(keys: (keyof typeof config)[]) {
  const missing: string[] = [];

  if (keys.includes("agent") && !config.agent.privateKey) {
    missing.push("AGENT_PRIVATE_KEY");
  }
  if (keys.includes("server") && !config.server.walletAddress) {
    missing.push("SERVER_WALLET_ADDRESS");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Copy .env.example to .env and fill in the values.`
    );
  }
}
