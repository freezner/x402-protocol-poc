/** 유료 API 라우트 정의 */
export interface PaidRoute {
  path: string;
  price: string;       // USDC 단위 (예: "0.01")
  description: string;
}

/** Agent 결제 기록 */
export interface PaymentRecord {
  timestamp: Date;
  endpoint: string;
  amount: string;
  txHash?: string;
  status: "success" | "failed" | "denied";
  reason?: string;
}

/** Agent 세션 상태 */
export interface AgentSession {
  startedAt: Date;
  totalSpent: number;       // USDC 누적 (숫자)
  payments: PaymentRecord[];
  maxPerSession: number;
}

/** 서버 헬스 응답 */
export interface HealthResponse {
  status: "ok";
  timestamp: string;
  chain: string;
  facilitator: string;
}

/** 유료 API 가격 목록 응답 */
export interface PriceListResponse {
  routes: PaidRoute[];
}
