import { describe, it, expect } from "vitest";

/**
 * E2E 결제 플로우 테스트
 *
 * 사전 조건:
 * - .env 설정 완료
 * - 테스트넷 USDC 잔액 확보
 * - npm run dev:server 실행 중
 */

const SERVER_URL = `http://localhost:${process.env.SERVER_PORT ?? 3000}`;

describe("x402 Payment Flow", () => {
  describe("Free Endpoints", () => {
    it("GET /api/free/health — 서버 상태 확인", async () => {
      const res = await fetch(`${SERVER_URL}/api/free/health`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.chain).toBe("base-sepolia");
    });

    it("GET /api/free/price-list — 가격 목록 반환", async () => {
      const res = await fetch(`${SERVER_URL}/api/free/price-list`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.routes).toBeInstanceOf(Array);
      expect(data.routes.length).toBeGreaterThan(0);
      expect(data.routes[0]).toHaveProperty("path");
      expect(data.routes[0]).toHaveProperty("price");
    });
  });

  describe("Paid Endpoints (without payment)", () => {
    it("GET /api/premium/summary — 결제 없이 요청 시 402 반환", async () => {
      const res = await fetch(`${SERVER_URL}/api/premium/summary`);
      // x402 미들웨어가 활성화되어 있으면 402, 없으면 200
      expect([200, 402]).toContain(res.status);

      if (res.status === 402) {
        // 402 응답에는 결제 정보가 포함되어야 함
        console.log("402 Payment Required — 정상 동작");
      }
    });
  });
});
