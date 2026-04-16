# x402 AI Agent Payment PoC

## 프로젝트 개요

AI 에이전트가 x402 프로토콜(HTTP 402)을 통해 스테이블코인(USDC)으로 유료 API를 자동 결제하는 PoC.

## 기술 스택

- **Runtime**: Node.js 20+ / TypeScript 5+
- **Chain**: Base Sepolia (testnet, chain ID: 84532)
- **Token**: USDC (testnet) — Circle Faucet
- **Core**: `@x402/core`, `@x402/evm`
- **Server**: `@x402/express` (Express 미들웨어)
- **Client**: `@x402/fetch` (자동 402 결제 루프)
- **Wallet**: `viem` (계정 관리)
- **Facilitator**: `https://x402.org/facilitator` (Base Sepolia 무료)

## 디렉토리 구조

```
x402-PoC/
├── CLAUDE.md              # 이 파일 — 프로젝트 컨벤션
├── AGENT.md               # AI 에이전트 행동 명세
├── AI-Agent-Payment-PoC-Plan.md  # 구현 계획서
├── package.json
├── tsconfig.json
├── .env.example           # 환경변수 템플릿
├── src/
│   ├── server/
│   │   ├── index.ts       # Express 서버 엔트리포인트
│   │   └── routes.ts      # 유료 API 라우트 정의
│   ├── agent/
│   │   ├── index.ts       # AI Agent 엔트리포인트
│   │   └── client.ts      # x402 결제 클라이언트 래퍼
│   ├── config/
│   │   └── index.ts       # 환경변수 및 설정 로드
│   └── types/
│       └── index.ts       # 공유 타입 정의
└── test/
    └── e2e/
        └── payment.test.ts  # 결제 플로우 E2E 테스트
```

## 코딩 컨벤션

- TypeScript strict 모드 사용
- 환경변수는 `.env`에서 관리, 코드에 키 하드코딩 금지
- 모든 비동기 함수는 `async/await` 사용
- 에러 처리: 커스텀 에러 클래스 사용, 402 응답은 명시적으로 핸들링
- 로깅: `console.log` 대신 구조화된 로거 사용 권장 (최소 prefix로 `[server]`, `[agent]` 구분)
- 지갑 개인키는 절대 로그에 남기지 않을 것

## 주요 명령어

```bash
npm run dev:server    # 유료 API 서버 실행 (포트 3000)
npm run dev:agent     # AI Agent 실행 (서버에 결제 요청)
npm run test          # E2E 테스트 실행
npm run build         # TypeScript 빌드
```

## 환경변수

```
AGENT_PRIVATE_KEY=     # Agent 지갑 개인키 (Base Sepolia)
SERVER_WALLET_ADDRESS= # Server 수신 지갑 주소
BASE_SEPOLIA_RPC_URL=  # Base Sepolia RPC 엔드포인트
FACILITATOR_URL=       # x402 Facilitator URL (기본: https://x402.org/facilitator)
SERVER_PORT=3000       # API 서버 포트
```

## 결제 플로우 요약

1. Agent → `GET /api/premium/*` → Server
2. Server → `402 Payment Required` + 결제 정보 헤더 → Agent
3. Agent → USDC 서명 + `PAYMENT` 헤더로 재요청 → Server
4. Server → Facilitator에 검증 요청 → 온체인 정산
5. Server → 리소스 반환 → Agent

## 테스트넷 준비

1. MetaMask 또는 `viem`으로 테스트 지갑 2개 생성
2. [Circle Faucet](https://faucet.circle.com)에서 Base Sepolia USDC 수령
3. [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)에서 ETH(가스비) 수령
