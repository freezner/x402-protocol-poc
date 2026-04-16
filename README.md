# x402 AI Agent Payment PoC

AI 에이전트가 [x402 프로토콜](https://x402.org)을 통해 유료 API를 **자동으로 USDC 결제하며 호출**하는 개념 증명(PoC).

HTTP 402 상태 코드를 결제 신호로 활용하여, 세션·로그인 없이 요청 단위로 스테이블코인을 정산한다.

---

## 아키텍처

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│     AI Agent     │ [1]Req  │    API Server    │         │   Facilitator    │
│    (src/agent)   │ ──────▶ │   (src/server)   │         │     x402.org     │
│                  │ ◀────── │                  │         │  (Base Sepolia)  │
│                  │ [2]402  │                  │         │                  │
│   Signed USDC    │ [3]Retry│ Validate Payment │ ──[4]──▶│    On-chain      │
│    (EIP-3009)    │ ──────▶ │                  │ ◀──[4]──│   Settlement     │
│                  │ ◀────── │  Return Resource │         │                  │
│                  │ [5]200  │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

| 단계 | 설명 |
|------|------|
| ① | Agent → Server: 유료 API 요청 |
| ② | Server → Agent: `HTTP 402` + 결제 요구사항 헤더 (가격, 토큰, 수신주소, 체인) |
| ③ | Agent → Server: EIP-3009 서명된 USDC 이체 증명 (`X-PAYMENT` 헤더) 포함 재요청 |
| ④ | Server ↔ Facilitator: 서명 검증 및 온체인 정산 |
| ⑤ | Server → Agent: 요청 리소스 반환 (`HTTP 200`) |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Runtime | Node.js 20+ / TypeScript 5 (strict) |
| Chain | Base Sepolia (testnet, chain ID: 84532) |
| Token | USDC (testnet) |
| Server SDK | `@x402/express` v2 |
| Client SDK | `@x402/fetch` v2 + `@x402/evm` (ExactEvmScheme) |
| Core | `@x402/core` v2 |
| Wallet | `viem` (EIP-3009 서명) |
| Facilitator | `https://x402.org/facilitator` (Base Sepolia 무료) |
| Test | Vitest |
| Linter | ESLint 9 (flat config) + typescript-eslint |
| Formatter | Prettier |

---

## 디렉토리 구조

```
.
├── src/
│   ├── server/
│   │   ├── index.ts          # Express 서버 엔트리포인트, x402 미들웨어 등록
│   │   └── routes.ts         # 유료/무료 API 라우트 정의
│   ├── agent/
│   │   ├── index.ts          # AI Agent 실행 시나리오
│   │   └── client.ts         # x402 결제 클라이언트 래퍼 (PaymentClient)
│   ├── config/
│   │   └── index.ts          # 환경변수 로드 및 유효성 검사
│   └── types/
│       └── index.ts          # 공유 타입 정의
├── test/
│   └── e2e/
│       └── payment.test.ts   # 결제 플로우 E2E 테스트 (서버 실행 필요)
├── .env.example              # 환경변수 템플릿
├── eslint.config.js          # ESLint flat config
├── vitest.config.ts          # Vitest 설정
├── tsconfig.json             # 빌드용 TypeScript 설정
└── tsconfig.test.json        # 테스트 타입체크용 TypeScript 설정
```

---

## 사전 준비

### 1. 테스트 지갑 2개 준비

| 용도 | 설명 |
|------|------|
| Agent 지갑 | 결제 주체. 개인키(`AGENT_PRIVATE_KEY`)가 필요. |
| Server 지갑 | 수신 주소(`SERVER_WALLET_ADDRESS`)만 필요. |

> **주의:** 테스트넷 전용 지갑만 사용. 메인넷 키를 절대 입력하지 말 것.

### 2. 테스트넷 자산 수령

Agent 지갑에 아래 두 자산이 필요하다.

- **테스트넷 USDC** — [Circle Faucet](https://faucet.circle.com) → Base Sepolia 선택
- **테스트넷 ETH** (가스비) — [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

### 3. RPC 엔드포인트 (선택)

공개 RPC(`https://sepolia.base.org`)를 기본으로 사용한다. 안정적인 환경이 필요하면 [Alchemy](https://alchemy.com)에서 Base Sepolia 앱을 생성하고 URL을 `BASE_SEPOLIA_RPC_URL`에 설정한다.

---

## 환경 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 아래 항목을 채운다.

```dotenv
# Agent 지갑 개인키 (0x로 시작, 테스트넷 전용)
AGENT_PRIVATE_KEY=0x_your_agent_private_key_here

# Server 수신 지갑 주소
SERVER_WALLET_ADDRESS=0x_your_server_wallet_address_here

# Base Sepolia RPC (공개 RPC 사용 가능)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# x402 Facilitator (변경 불필요)
FACILITATOR_URL=https://x402.org/facilitator

# API 서버 포트
SERVER_PORT=3000
```

---

## 설치 및 구동

### 의존성 설치

```bash
npm install
```

### 서버 실행

```bash
npm run dev:server
```

정상 기동 시 아래와 같이 출력된다.

```
============================================================
  x402 Payment Server
  http://localhost:3000
  Chain: base-sepolia (ID: 84532)
  Facilitator: https://x402.org/facilitator
  Recipient: 0xYourServerWalletAddress
============================================================

[server] Paid routes:
  /api/premium/summary — 0.01 USDC
  /api/premium/analysis — 0.05 USDC
  /api/premium/report — 0.10 USDC
```

### Agent 실행 (서버가 먼저 실행 중이어야 함)

```bash
npm run dev:agent
```

Agent는 아래 순서로 동작한다.

1. 서버 헬스 확인 (`GET /api/free/health`)
2. 가격 목록 조회 (`GET /api/free/price-list`)
3. 유료 API 순차 호출 — x402 SDK가 402 응답 수신 시 자동으로 USDC 서명 후 재요청
4. 세션 요약 출력 (총 결제액, 성공/실패 건수)

### 서버 + Agent 동시 실행

```bash
npm run dev
```

---

## API 엔드포인트

### 무료

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/free/health` | 서버 상태 및 체인 정보 |
| `GET` | `/api/free/price-list` | 유료 API 가격 목록 |

### 유료 (x402 결제 필요)

| 메서드 | 경로 | 가격 | 설명 |
|--------|------|------|------|
| `GET` | `/api/premium/summary` | 0.01 USDC | AI 생성 텍스트 요약 |
| `GET` | `/api/premium/analysis` | 0.05 USDC | 심층 데이터 분석 |
| `GET` | `/api/premium/report` | 0.10 USDC | 종합 보고서 생성 |

결제 없이 유료 엔드포인트를 호출하면 `HTTP 402 Payment Required`와 함께 결제 요구사항이 응답된다.

---

## 결제 정책

Agent는 `src/config/index.ts`에 정의된 정책 내에서 자동 결제한다.

| 정책 | 값 | 설명 |
|------|----|------|
| `maxPerRequest` | 0.10 USDC | 단일 요청 최대 결제액 |
| `maxPerSession` | 1.00 USDC | 세션 누적 최대 결제액 |
| `autoApproveUnder` | 0.05 USDC | 이하 금액은 자동 승인 |

---

## 개발 명령어

```bash
npm run build          # TypeScript 빌드 (dist/)
npm run typecheck      # 타입 검사 (src + test 전체)
npm run lint           # ESLint 검사
npm run lint:fix       # ESLint 자동 수정
npm run format         # Prettier 포매팅 적용
npm run format:check   # Prettier 포매팅 검사
npm run test           # E2E 테스트 실행 (서버 실행 필요)
npm run test:watch     # 테스트 watch 모드
npm run test:coverage  # 커버리지 리포트 포함 테스트
npm run clean          # dist/ 삭제
```

---

## 온체인 확인

결제 후 트랜잭션은 [Base Sepolia Explorer](https://sepolia.basescan.org)에서 확인 가능하다.
Server 수신 지갑 주소로 검색하면 USDC 이체 내역을 볼 수 있다.

---

## 참고 자료

- [x402 공식 사이트](https://x402.org)
- [x402 GitHub (x402 Foundation)](https://github.com/x402-foundation/x402)
- [x402 Coinbase 문서](https://docs.cdp.coinbase.com/x402/welcome)
- [Circle USDC Faucet](https://faucet.circle.com)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
