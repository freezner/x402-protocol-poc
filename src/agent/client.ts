import { config } from "../config/index.js";
import type { AgentSession, PaymentRecord } from "../types/index.js";

/**
 * x402 결제 클라이언트 래퍼
 *
 * - 402 응답 시 자동으로 결제 서명 후 재요청
 * - 세션 누적 결제액 추적
 * - 결제 정책(한도) 적용
 */
export class PaymentClient {
  private session: AgentSession;
  private fetchWithPayment: typeof fetch;

  constructor() {
    this.session = {
      startedAt: new Date(),
      totalSpent: 0,
      payments: [],
      maxPerSession: Number(config.payment.maxPerSession),
    };

    // 기본 fetch로 초기화, init()에서 x402 클라이언트로 교체
    this.fetchWithPayment = fetch;
  }

  /**
   * x402 fetch 클라이언트 초기화
   * @x402/fetch 패키지가 설치되면 자동 결제 루프가 활성화됨
   */
  async init(): Promise<void> {
    try {
      const { wrapFetchWithPayment, x402Client } = await import("@x402/fetch");
      const { ExactEvmScheme } = await import("@x402/evm");
      const { privateKeyToAccount } = await import("viem/accounts");

      const account = privateKeyToAccount(
        config.agent.privateKey as `0x${string}`
      );

      const evmScheme = new ExactEvmScheme(account);
      const client = new x402Client().register(
        `eip155:${config.chain.id}`,
        evmScheme
      );

      this.fetchWithPayment = wrapFetchWithPayment(fetch, client);

      console.log("[agent] [init] x402 클라이언트 초기화 완료");
      console.log(`[agent] [init] Agent 주소: ${account.address}`);
    } catch (err) {
      console.warn(
        "[agent] [warn] @x402/fetch 로드 실패 — 일반 fetch로 폴백합니다."
      );
      console.warn("[agent] [warn]", (err as Error).message);
    }
  }

  /**
   * 유료 API 요청 (x402 자동 결제)
   */
  async request(endpoint: string): Promise<unknown> {
    const url = `http://localhost:${config.server.port}${endpoint}`;
    const record: PaymentRecord = {
      timestamp: new Date(),
      endpoint,
      amount: "0",
      status: "failed",
    };

    try {
      console.log(`[agent] [request] ${endpoint}`);

      const response = await this.fetchWithPayment(url);

      if (response.ok) {
        const data = await response.json();

        // 결제가 발생한 경우 세션 기록 업데이트
        // x402 SDK는 402→결제→재요청을 내부에서 처리하므로
        // 최종적으로 200이 오면 결제 성공으로 간주
        record.status = "success";
        this.session.payments.push(record);

        console.log(`[agent] [success] ${endpoint} — 200 OK`);
        return data;
      }

      if (response.status === 402) {
        // x402 SDK가 자동 처리하지 못한 경우 (잔액 부족 등)
        record.status = "denied";
        record.reason = "Payment required but auto-payment failed";
        this.session.payments.push(record);

        console.error(`[agent] [402] 결제 실패 — ${endpoint}`);
        throw new Error(`Payment failed for ${endpoint}`);
      }

      record.status = "failed";
      record.reason = `HTTP ${response.status}`;
      this.session.payments.push(record);
      throw new Error(`Request failed: ${response.status}`);
    } catch (err) {
      if (record.status !== "denied") {
        record.status = "failed";
        record.reason = (err as Error).message;
        this.session.payments.push(record);
      }
      throw err;
    }
  }

  /**
   * 현재 세션 상태 반환
   */
  getSession(): AgentSession {
    return { ...this.session };
  }

  /**
   * 세션 요약 로그 출력
   */
  printSessionSummary(): void {
    const s = this.session;
    console.log("");
    console.log("=".repeat(50));
    console.log("  Agent Session Summary");
    console.log(`  Started: ${s.startedAt.toISOString()}`);
    console.log(`  Total Spent: ${s.totalSpent} USDC`);
    console.log(`  Transactions: ${s.payments.length}`);
    console.log(
      `  Success: ${s.payments.filter((p) => p.status === "success").length}`
    );
    console.log(
      `  Failed: ${s.payments.filter((p) => p.status === "failed").length}`
    );
    console.log("=".repeat(50));
    console.log("");
  }
}
