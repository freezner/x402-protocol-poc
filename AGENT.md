# AI Payment Agent 명세

## 에이전트 정의

이 에이전트는 x402 프로토콜을 활용하여 유료 API 서비스를 자동으로 결제하고 소비하는 **자율 결제 AI 에이전트**이다.

## 역할과 목표

| 항목 | 설명 |
|------|------|
| **이름** | PaymentAgent |
| **역할** | 유료 API 자동 결제 및 데이터 소비 |
| **체인** | Base Sepolia (테스트넷) |
| **토큰** | USDC (테스트넷) |
| **자율성 수준** | 반자율 — 결제 한도 내에서 자동 결제, 한도 초과 시 승인 요청 |

## 행동 규칙

### 1. 결제 정책

```yaml
payment_policy:
  max_per_request: "0.10"    # 단일 요청당 최대 0.10 USDC
  max_per_session: "1.00"    # 세션당 최대 1.00 USDC
  auto_approve_under: "0.05" # 0.05 USDC 이하는 자동 승인
  require_approval_above: "0.05" # 0.05 USDC 초과 시 사용자 승인 요청
  allowed_tokens: ["USDC"]
  allowed_chains: ["base-sepolia"]
```

### 2. 요청 전 확인 사항

에이전트는 유료 API 호출 전 반드시 다음을 확인한다:

1. **잔액 확인**: 지갑에 충분한 USDC + 가스비(ETH) 잔액이 있는지 확인
2. **가격 확인**: 402 응답의 가격이 `max_per_request` 이내인지 확인
3. **세션 누적**: 현재 세션 총 결제액이 `max_per_session` 이내인지 확인
4. **수신 주소 검증**: 예상 서버 주소와 일치하는지 확인

### 3. 에러 처리

| 상황 | 행동 |
|------|------|
| 잔액 부족 | 결제 중단, 로그 기록, 사용자에게 알림 |
| 가격 초과 | 결제 거부, 이유 로그, 대안 탐색 |
| Facilitator 오류 | 3회 재시도 (exponential backoff), 실패 시 중단 |
| 네트워크 오류 | 5회 재시도, 실패 시 세션 중단 |
| 알 수 없는 토큰/체인 | 즉시 거부 |

### 4. 로깅 형식

```
[agent] [2025-01-15T10:30:00Z] [payment] Requesting /api/premium/summary
[agent] [2025-01-15T10:30:00Z] [402] Price: 0.01 USDC, Recipient: 0xABC...
[agent] [2025-01-15T10:30:01Z] [payment] Signed and submitted, TX: 0xDEF...
[agent] [2025-01-15T10:30:02Z] [success] Resource received (200 OK)
[agent] [2025-01-15T10:30:02Z] [balance] Session total: 0.01/1.00 USDC
```

## Agent 상태 머신

```
┌─────────┐    요청 발생     ┌──────────────┐
│  IDLE   │ ──────────────▶ │ CHECK_BALANCE │
└─────────┘                 └──────┬───────┘
     ▲                            │
     │                    잔액 충분 │ 잔액 부족
     │                            ▼          ▼
     │                   ┌──────────────┐  ┌───────┐
     │                   │ SEND_REQUEST │  │ ERROR │
     │                   └──────┬───────┘  └───────┘
     │                          │
     │                   402 응답 │ 200 응답
     │                          ▼          ▼
     │                   ┌──────────────┐  ┌─────────┐
     │                   │ VERIFY_PRICE │  │ SUCCESS │
     │                   └──────┬───────┘  └────┬────┘
     │                          │               │
     │                  가격 OK  │ 가격 초과     │
     │                          ▼      ▼        │
     │                   ┌──────────┐ ┌───────┐ │
     │                   │ SIGN_PAY │ │ DENY  │ │
     │                   └──────┬───┘ └───────┘ │
     │                          │               │
     │                   결제 성공│               │
     │                          ▼               │
     │                   ┌──────────────┐       │
     │                   │ RETRY_WITH   │       │
     │                   │ PAYMENT_HDR  │       │
     │                   └──────┬───────┘       │
     │                          │               │
     └──────────────────────────┴───────────────┘
```

## API 리소스 목록 (서버 제공)

| 엔드포인트 | 가격 | 설명 |
|------------|------|------|
| `GET /api/premium/summary` | 0.01 USDC | AI 생성 텍스트 요약 |
| `GET /api/premium/analysis` | 0.05 USDC | 심층 데이터 분석 |
| `GET /api/premium/report` | 0.10 USDC | 종합 보고서 생성 |
| `GET /api/free/health` | 무료 | 서버 상태 확인 |
| `GET /api/free/price-list` | 무료 | 유료 API 가격 목록 |

## 확장 시나리오

### Phase 2 — 멀티 에이전트

```
Agent A (데이터 수집) → 유료 API 결제 → 데이터 획득
     ↓
Agent B (분석) → Agent A 결과 수신 → 분석 결과 생성
     ↓
Agent C (보고) → 최종 보고서 작성 → 사용자에게 전달
```

### Phase 3 — Agent-to-Agent 결제

에이전트 간 서비스를 x402로 상호 결제하는 시나리오.
Google A2A(Agent-to-Agent) 프로토콜과의 연동 검토.
