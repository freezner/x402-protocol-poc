# x402 PoC 아키텍처 개요

본 문서는 사용자가 제시한 4단계 로드맵을 저장소의 용어로 구체화한 설계 노트입니다. 변경 시 `CLAUDE.md` 의 요약과 동기화하세요.

---

## 전체 흐름

```
[Client/Agent]                          [Django Server]                    [Base Sepolia]
     │                                         │                                 │
     │  1) GET /api/premium/report             │                                 │
     │────────────────────────────────────────▶│                                 │
     │                                         │  (PaymentIntent 생성)           │
     │  2) 402 Payment Required                │                                 │
     │     X-402-Payment-To / Amount / ChainId │                                 │
     │     X-402-Payment-Id                    │                                 │
     │◀────────────────────────────────────────│                                 │
     │                                         │                                 │
     │  3) 세션 키로 USDC 전송 서명            │                                 │
     │────────────────────────────────────────────────────────────────────────▶│
     │                                         │                                 │
     │  4) POST /api/payments/receipt          │                                 │
     │     { payment_id, tx_hash }             │                                 │
     │────────────────────────────────────────▶│                                 │
     │                                         │  5) RPC/Indexer 로 TX 확인      │
     │                                         │────────────────────────────────▶│
     │                                         │◀────────────────────────────────│
     │  6) 200 OK + 원래 리소스                │                                 │
     │◀────────────────────────────────────────│                                 │
```

## 단계별 세부

### Stage 1 — 환경 구축
- **네트워크**: Base Sepolia(Chain ID `84532`). 이유: x402 레퍼런스 구현 정합성, 저가스.
- **대체안**: Solana Devnet — 별도 브랜치로 분리(Stage 1 완료 이후).
- **지갑 SDK**: Coinbase Wallet SDK(브라우저용) + Reown/WalletConnect(에이전트용). 세션 키 지원 여부가 선택 기준.
- **자산**: Base Sepolia USDC(ERC-20). Circle 또는 Coinbase Faucet 에서 확보.

### Stage 2 — 서비스 제공자(Server)
- **핸들러**: Django 뷰(또는 DRF `APIView`)에서 결제 미확인 시 `HttpResponse(status=402)` 반환.
- **헤더 스펙(초안)**:
  - `X-402-Payment-To`: 수신 주소(서버 지갑, 테스트넷 전용)
  - `X-402-Amount`: 정수 문자열(최소 단위, USDC 의 경우 6 decimals)
  - `X-402-Asset`: `USDC`
  - `X-402-Chain-Id`: `84532`
  - `X-402-Payment-Id`: ULID 또는 UUIDv7
  - `X-402-Expires-At`: ISO-8601 UTC
- **데이터 모델(초안)**:
  - `PaymentIntent(id, resource, amount, asset, chain_id, recipient, status, created_at, expires_at)`
  - `PaymentReceipt(intent, tx_hash, submitted_at, confirmed_at, block_number, status)`
  - `LatencyLog(intent, requested_at, paid_at, verified_at, released_at)`

### Stage 3 — 자동 결제 클라이언트(Payer)
- **인터셉터**: `requests` 또는 `httpx` 의 response hook 로 402 감지.
- **세션 키**: 한도(예: 1 USDC) 이하 자동 서명. 한도 초과 시 사용자 확인 요구 훅.
- **영수증 제출**: `POST /api/payments/receipt` (JSON) — `{payment_id, tx_hash, from}`.

### Stage 4 — 검증 & 해제
- **온체인 확인**: Alchemy/BaseScan RPC `eth_getTransactionReceipt`. 최소 1 confirmation 대기.
- **검증 항목**: `to == PaymentIntent.recipient`, `value/transfer amount == PaymentIntent.amount`, `chainId == 84532`, `status == success`.
- **해제 메커니즘**: `Payment-Id` 별 일회용 토큰(또는 TTL 30s 세션 쿠키) 발급 → 원래 리소스 제공.
- **Latency 측정**: `LatencyLog` 4개 타임스탬프 차이를 admin 리스트뷰에서 바로 확인.

## 미해결 결정 사항

- [ ] Base Sepolia 단일 체인으로 PoC 를 마무리할지, Solana Devnet 도 병행할지.
- [ ] 지갑 SDK 를 Coinbase 로 확정할지, Reown 단독으로 갈지.
- [ ] 서버 지갑 키 관리 방식(로컬 `.env` vs. 서버 KMS).
- [ ] 인덱서 의존도(BaseScan API 한도, Alchemy 폴백).
