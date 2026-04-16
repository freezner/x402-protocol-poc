# AI 에이전트 토큰 결제 PoC 구현 계획

## 개요

AI 에이전트가 블록체인 기반 토큰으로 API/서비스 비용을 자동 결제하는 시스템의 PoC를 두 가지 접근법으로 비교 검증한다.

- **안 A**: x402 프로토콜 (Coinbase/x402 Foundation)
- **안 B**: Tether WDK (Wallet Development Kit)

---

## 안 A — x402 프로토콜 기반 구현

### 1. 핵심 개념

x402는 HTTP 402 (Payment Required) 상태 코드를 활용하여, 클라이언트가 유료 API에 접근할 때 자동으로 스테이블코인 결제를 수행하는 오픈 프로토콜이다. Coinbase가 2025년 5월 출시했고 현재 x402 Foundation이 관리한다.

### 2. 결제 플로우

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  AI Agent    │  ──1──▶ │  API Server  │         │  Facilitator │
│  (Client)    │         │  (Express)   │         │  (Verifier)  │
│              │ ◀──2──  │              │         │              │
│  USDC 서명   │  ──3──▶ │  결제 검증    │ ──4──▶  │  온체인 정산  │
│              │ ◀──5──  │  리소스 반환   │ ◀──5──  │              │
└──────────────┘         └──────────────┘         └──────────────┘
```

1. Agent → Server: API 리소스 요청 (GET /api/data)
2. Server → Agent: HTTP 402 + `PAYMENT-REQUIRED` 헤더 (가격, 토큰, 수신주소, 체인)
3. Agent → Server: 서명된 결제 증명 (`PAYMENT-SIGNATURE` 헤더)
4. Server → Facilitator: 결제 검증 및 온체인 정산
5. Server → Agent: 요청한 리소스 반환

### 3. 기술 스택

| 구분 | 기술 |
|------|------|
| 체인 | Base Sepolia (테스트넷, chain ID: 84532) |
| 토큰 | USDC (테스트넷) — Circle Faucet에서 수령 |
| Server SDK | `@x402/express` 또는 `@x402/hono` |
| Client SDK | `@x402/fetch` 또는 `@x402/axios` |
| Core | `@x402/core`, `@x402/evm` |
| Facilitator | x402.org 커뮤니티 (Base Sepolia 무료) |
| AI Agent | Node.js + LangChain 또는 순수 TypeScript |
| 지갑 | ethers.js / viem (테스트넷 개인키) |

### 4. 구현 단계

**Phase 1 — 환경 설정 (1일)**

- Node.js 프로젝트 초기화 (TypeScript)
- x402 패키지 설치: `@x402/core`, `@x402/evm`, `@x402/express`, `@x402/fetch`
- Base Sepolia RPC 설정 (Alchemy/Infura 또는 공개 RPC)
- Circle Faucet에서 테스트넷 USDC 수령
- 테스트 지갑 2개 생성 (Agent용, Server 수신용)

**Phase 2 — 유료 API 서버 구축 (1일)**

```typescript
// server.ts — 핵심 코드 예시
import express from "express";
import { paymentMiddleware } from "@x402/express";

const app = express();

app.use("/api/premium", paymentMiddleware({
  price: "0.01",           // 0.01 USDC
  token: "USDC",
  chain: "base-sepolia",
  recipient: SERVER_WALLET_ADDRESS,
  facilitator: "https://x402.org/facilitator"
}));

app.get("/api/premium/ai-summary", (req, res) => {
  res.json({ summary: "AI가 생성한 프리미엄 요약 데이터" });
});
```

**Phase 3 — AI Agent 클라이언트 구현 (1-2일)**

```typescript
// agent.ts — AI Agent 결제 클라이언트
import { createX402Client } from "@x402/fetch";
import { Wallet } from "ethers";

const wallet = new Wallet(AGENT_PRIVATE_KEY);
const client = createX402Client({ wallet, chain: "base-sepolia" });

// 402 응답 시 자동으로 결제 후 재요청
const response = await client.fetch("http://localhost:3000/api/premium/ai-summary");
const data = await response.json();
```

**Phase 4 — 통합 테스트 및 검증 (1일)**

- 정상 결제 → 리소스 반환 확인
- 잔액 부족 시 에러 처리 확인
- 트랜잭션 해시로 Base Sepolia Explorer에서 온체인 확인
- 여러 건 연속 결제 (pay-per-request) 시나리오 테스트

### 5. 장단점

**장점**
- HTTP 네이티브: 기존 REST API에 미들웨어만 추가하면 됨
- 세션/로그인 불필요: 매 요청마다 독립 결제
- AI Agent 특화: 자동 402→결제→재요청 루프가 SDK에 내장
- 생태계 성숙: 75M+ 트랜잭션 처리 실적, Google A2A 연동 지원
- 테스트넷 Facilitator 무료 제공

**단점**
- 스테이블코인(USDC) 중심 — 다른 토큰 지원은 Permit2 필요
- Facilitator 의존 (자체 운영 시 추가 인프라 필요)
- 현재 EVM/Solana만 공식 지원

---

## 안 B — Tether WDK 기반 구현

### 1. 핵심 개념

Tether WDK는 셀프커스터디 멀티체인 지갑 개발 툴킷으로, AI 에이전트에 지갑 기능을 임베딩하여 자율적으로 결제/수신/스왑을 수행할 수 있게 한다. MCP 서버 통합과 Agent Skills를 제공하여 AI 에이전트와의 연동이 1급 시민으로 지원된다.

### 2. 결제 플로우

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  AI Agent    │         │  WDK Wallet  │         │  API Server  │
│  (LLM)      │ ──1──▶  │  (MCP/SDK)   │         │  (수신측)     │
│              │ ◀──2──  │  잔액 확인    │         │              │
│  결제 지시   │  ──3──▶ │  TX 서명/전송  │ ──4──▶  │  TX 수신 확인 │
│              │ ◀──5──  │              │ ◀──5──  │  리소스 반환   │
└──────────────┘         └──────────────┘         └──────────────┘
```

1. AI Agent가 서비스 이용 결정 → WDK 지갑에 결제 지시
2. WDK가 잔액/가스비 확인
3. WDK가 트랜잭션 서명 및 전송
4. Server가 온체인 TX 수신 확인 (또는 웹훅)
5. Server가 리소스/서비스 반환

### 3. 기술 스택

| 구분 | 기술 |
|------|------|
| 체인 | Ethereum Sepolia 또는 Solana Devnet |
| 토큰 | USDT (테스트넷) 또는 SOL/ETH |
| WDK Core | `@tetherto/wdk-core` |
| Wallet Module | `@tetherto/wdk-wallet-evm` 또는 `wdk-wallet-solana` |
| MCP Toolkit | `@tetherto/wdk-mcp-toolkit` |
| AI Agent | LangChain + MCP 또는 순수 TypeScript |
| 결제 확인 | ethers.js 이벤트 리스너 또는 Solana WebSocket |

### 4. 구현 단계

**Phase 1 — 환경 설정 (1-2일)**

- Node.js 프로젝트 초기화
- WDK 패키지 설치: `@tetherto/wdk-core`, `@tetherto/wdk-wallet-evm`
- 테스트넷 RPC 설정
- WDK로 Agent 지갑 생성 (셀프커스터디, BIP-39 시드)
- 테스트넷 토큰 수령 (Faucet)

**Phase 2 — WDK MCP 서버 구성 (1-2일)**

```typescript
// mcp-server.ts — AI Agent용 MCP 지갑 도구 노출
import { WDKMCPToolkit } from "@tetherto/wdk-mcp-toolkit";

const toolkit = new WDKMCPToolkit({
  wallet: agentWallet,
  chains: ["ethereum-sepolia"],
  tools: ["check_balance", "send_transaction", "get_tx_history"]
});

// MCP 서버로 AI Agent에 지갑 도구 제공
toolkit.startServer({ port: 8080 });
```

**Phase 3 — AI Agent + 결제 로직 구현 (2-3일)**

```typescript
// agent.ts — WDK 기반 결제 에이전트
import { WDKWallet } from "@tetherto/wdk-wallet-evm";

const wallet = await WDKWallet.create({
  network: "sepolia",
  seed: AGENT_SEED_PHRASE
});

// 서비스 가격 확인 후 결제
const servicePrice = await fetch("http://api-server/price").then(r => r.json());
const tx = await wallet.sendTransaction({
  to: SERVICE_WALLET,
  amount: servicePrice.amount,
  token: "USDT"
});

// TX 확인 후 서비스 요청
await tx.wait();
const result = await fetch("http://api-server/service", {
  headers: { "X-Payment-TX": tx.hash }
});
```

**Phase 4 — 서버 측 결제 검증 (1일)**

```typescript
// server.ts — TX 해시 검증 후 서비스 제공
app.get("/service", async (req, res) => {
  const txHash = req.headers["x-payment-tx"];
  const receipt = await provider.getTransactionReceipt(txHash);
  
  if (receipt && receipt.status === 1) {
    // 금액, 수신주소 검증
    res.json({ data: "프리미엄 AI 서비스 결과" });
  } else {
    res.status(402).json({ error: "결제 미확인" });
  }
});
```

**Phase 5 — 통합 테스트 (1일)**

- 지갑 생성 → 잔액 확인 → 결제 → 서비스 수신 전체 플로우
- MCP 도구를 통한 AI Agent 자율 결제 테스트
- 크로스체인 시나리오 (EVM → Solana 브릿지) 가능성 확인

### 5. 장단점

**장점**
- 풀 월렛 기능: 결제뿐 아니라 스왑, 브릿지, DeFi 상호작용까지 가능
- MCP 네이티브: AI Agent가 MCP 도구로 직접 지갑 조작
- 멀티체인: 20+ 체인 지원 (BTC, EVM, Solana, TON 등)
- 셀프커스터디: 에이전트가 자체 키를 관리하여 중앙 의존 없음
- Agent Skills 문서화 잘 되어 있음

**단점**
- 결제 프로토콜이 아닌 지갑 툴킷 → 결제 검증 로직을 직접 구현해야 함
- x402 대비 더 많은 커스텀 코드 필요
- 상대적으로 신규 프로젝트 (2025년 10월 출시)
- Facilitator 같은 결제 정산 레이어가 없음

---

## 비교 요약

| 비교 항목 | 안 A: x402 | 안 B: Tether WDK |
|-----------|-----------|------------------|
| **핵심 성격** | 결제 프로토콜 (HTTP 네이티브) | 지갑 개발 툴킷 |
| **구현 난이도** | 낮음 (미들웨어 추가) | 중간 (결제 검증 직접 구현) |
| **예상 기간** | 3-4일 | 5-7일 |
| **테스트넷** | Base Sepolia (무료 Facilitator) | Ethereum Sepolia / Solana Devnet |
| **주요 토큰** | USDC | USDT, 멀티토큰 |
| **AI Agent 연동** | SDK 자동 결제 루프 | MCP 서버 + Agent Skills |
| **멀티체인** | EVM + Solana | 20+ 체인 |
| **결제 검증** | Facilitator가 처리 | 직접 구현 필요 |
| **확장성** | API 과금 특화 | 결제 + DeFi + 스왑 + 브릿지 |
| **생태계 성숙도** | 높음 (75M+ TX) | 중간 (성장 중) |

---

## 권장 실행 전략

### 단기 (PoC 검증) → 안 A: x402 추천

x402는 "AI Agent가 API를 호출하고 자동 결제한다"는 핵심 시나리오를 가장 빠르게 검증할 수 있다. 미들웨어 하나로 서버 구축이 끝나고, 클라이언트 SDK가 402→결제→재요청을 자동 처리한다.

### 중장기 (프로덕션 확장) → 안 B: WDK 병행

WDK는 에이전트에게 완전한 금융 자율성(잔액 관리, 토큰 스왑, 크로스체인 브릿지)을 부여할 수 있어, 단순 API 과금을 넘어서는 시나리오에 적합하다. 또한 WDK 자체가 x402를 내부 지원하므로, 두 접근법을 결합하는 것도 가능하다.

### 제안: 2-Phase PoC

```
Phase 1 (Week 1): x402로 핵심 결제 플로우 검증
  → AI Agent가 유료 API를 자동 결제하며 호출하는 시나리오

Phase 2 (Week 2): WDK로 에이전트 지갑 자율성 검증  
  → 잔액 관리, 토큰 스왑, MCP 통합 시나리오
  → x402 결제를 WDK 지갑으로 수행하는 통합 시나리오
```

---

## 참고 자료

- x402 공식: https://x402.org
- x402 GitHub: https://github.com/x402-foundation/x402
- x402 Coinbase 문서: https://docs.cdp.coinbase.com/x402/welcome
- Tether WDK 문서: https://docs.wdk.tether.io
- WDK MCP Toolkit: https://github.com/tetherto/wdk-mcp-toolkit
- WDK Agent Skills: https://docs.wdk.tether.io/ai/agent-skills
- Circle USDC Faucet: https://faucet.circle.com
- Base Sepolia Explorer: https://sepolia.basescan.org
