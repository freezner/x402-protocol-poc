import { validateConfig } from "../config/index.js";
import { PaymentClient } from "./client.js";

async function main() {
  validateConfig(["agent", "server"]);

  console.log("");
  console.log("=".repeat(60));
  console.log("  x402 Payment Agent — Starting");
  console.log("=".repeat(60));
  console.log("");

  // ----------------------------------------------------------
  // 1. 클라이언트 초기화
  // ----------------------------------------------------------
  const client = new PaymentClient();
  await client.init();

  // ----------------------------------------------------------
  // 2. 무료 엔드포인트로 서버 상태 확인
  // ----------------------------------------------------------
  console.log("\n[agent] === Phase 1: 서버 상태 확인 ===\n");

  try {
    const health = await client.request("/api/free/health");
    console.log("[agent] 서버 헬스:", JSON.stringify(health, null, 2));
  } catch (_err) {
    console.error("[agent] [fatal] 서버에 연결할 수 없습니다.");
    console.error("[agent] 먼저 npm run dev:server 를 실행하세요.");
    process.exit(1);
  }

  // ----------------------------------------------------------
  // 3. 가격 목록 확인
  // ----------------------------------------------------------
  const priceList = await client.request("/api/free/price-list");
  console.log("[agent] 가격 목록:", JSON.stringify(priceList, null, 2));

  // ----------------------------------------------------------
  // 4. 유료 API 호출 (x402 자동 결제)
  // ----------------------------------------------------------
  console.log("\n[agent] === Phase 2: 유료 API 결제 테스트 ===\n");

  const paidEndpoints = [
    "/api/premium/summary",    // 0.01 USDC
    "/api/premium/analysis",   // 0.05 USDC
    "/api/premium/report",     // 0.10 USDC
  ];

  for (const endpoint of paidEndpoints) {
    try {
      console.log(`\n[agent] --- 요청: ${endpoint} ---`);
      const result = await client.request(endpoint);
      console.log("[agent] 응답:", JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(`[agent] [error] ${endpoint}: ${(err as Error).message}`);
    }
  }

  // ----------------------------------------------------------
  // 5. 세션 요약
  // ----------------------------------------------------------
  console.log("\n[agent] === 세션 완료 ===\n");
  client.printSessionSummary();
}

main().catch((err) => {
  console.error("[agent] [fatal]", err);
  process.exit(1);
});
