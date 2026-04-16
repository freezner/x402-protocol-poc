import express from "express";
import { config, validateConfig } from "../config/index.js";
import routes, { PAID_ROUTES } from "./routes.js";

async function main() {
  validateConfig(["server"]);

  const app = express();
  app.use(express.json());

  // ----------------------------------------------------------
  // x402 결제 미들웨어 등록
  // ----------------------------------------------------------
  // NOTE: @x402/express 패키지의 실제 API에 맞춰 조정 필요
  // 현재는 하네스 구조로, 실제 미들웨어 연결은 의존성 설치 후 확인
  try {
    const { paymentMiddlewareFromConfig } = await import("@x402/express");
    const { HTTPFacilitatorClient } = await import("@x402/core/server");

    const facilitatorClient = new HTTPFacilitatorClient({
      url: config.facilitator.url,
    });

    // RoutesConfig: Record<path, RouteConfig>
    const routes = Object.fromEntries(
      PAID_ROUTES.map((route) => [
        route.path,
        {
          accepts: {
            scheme: "exact",
            payTo: config.server.walletAddress as `0x${string}`,
            price: route.price,
            network: `eip155:${config.chain.id}` as const,
          },
          description: route.description,
        },
      ])
    );

    app.use(paymentMiddlewareFromConfig(routes, facilitatorClient));

    for (const route of PAID_ROUTES) {
      console.log(
        `[server] [x402] ${route.path} — ${route.price} USDC (${route.description})`
      );
    }
  } catch (err) {
    console.warn(
      "[server] [warn] @x402/express 로드 실패 — 결제 미들웨어 없이 실행합니다."
    );
    console.warn("[server] [warn]", (err as Error).message);
  }

  // ----------------------------------------------------------
  // 라우트 등록
  // ----------------------------------------------------------
  app.use(routes);

  // ----------------------------------------------------------
  // 서버 시작
  // ----------------------------------------------------------
  app.listen(config.server.port, () => {
    console.log("");
    console.log("=".repeat(60));
    console.log(`  x402 Payment Server`);
    console.log(`  http://localhost:${config.server.port}`);
    console.log(`  Chain: ${config.chain.name} (ID: ${config.chain.id})`);
    console.log(`  Facilitator: ${config.facilitator.url}`);
    console.log(`  Recipient: ${config.server.walletAddress}`);
    console.log("=".repeat(60));
    console.log("");
    console.log("[server] Paid routes:");
    for (const route of PAID_ROUTES) {
      console.log(`  ${route.path} — ${route.price} USDC`);
    }
    console.log("");
    console.log("[server] Free routes:");
    console.log("  /api/free/health");
    console.log("  /api/free/price-list");
    console.log("");
  });
}

main().catch((err) => {
  console.error("[server] [fatal]", err);
  process.exit(1);
});
