# x402 목업 제작 작업계획 (실제 기능 연동)

> 원본: `x402-PoC/mockup.md`  
> 원칙: 기존 `/bank-demo` (S0~S16)는 **그대로 두고**, 별도 경로에 실제 기능이 연동된 모바일 목업을 신규 구축

---

## 1. 개요

x402 프로토콜 기반 지갑 서비스의 5개 시나리오를 **실제 백엔드 API와 통신하는 모바일 목업**으로 구현한다.  
기존 은행 데모 UI는 발표/레퍼런스용으로 그대로 유지하며, 새 목업은 격리된 경로에서 독립적으로 동작한다.

---

## 2. 설계 원칙

| 원칙 | 적용 방식 |
|------|-----------|
| 기존 코드 보존 | `/bank-demo` 및 `bankDemo.ts` **절대 수정 금지** |
| 경로 격리 | 새 목업은 `/mockup` 경로로 배포 |
| 실제 기능 연동 | 모든 화면은 실제 API 호출 + x402 실결제 + 상태 저장 |
| 최소 수정 | 기존 `routes.ts`에 라우트 1줄, 새 파일 `mockup.ts` 1개만 추가 |
| 인메모리 상태 재사용 | `demoStateStore`, `budgetStore`, `autoChargeStore`, `m2mWalletStore` 그대로 사용 |

---

## 3. 시나리오 → 화면 매핑

| # | 시나리오 | 화면 ID | 실제 기능 | 연동 API |
|---|----------|---------|-----------|----------|
| 1 | 은행 앱 인트로 | M0 | 정적 인트로 + 데모 시작 | 없음 |
| 2 | 계좌 조회 (지갑 통합) | M1 | 실시간 잔액·거래내역·카테고리 사용량 조회 | `GET /api/demo/account` |
| 3 | 지갑 앱 → 마이크로결제 | M2 | 콘텐츠 5건 x402 실결제 순차 실행 | `POST /api/demo/micropayment` |
| 4 | AI 에이전트 결제 설정 | M3 | 예산·자동승인·M2M 설정 저장/조회 | `GET/POST /api/demo/settings` |
| 5 | PassKey 지갑 인증/서명 | M4 | WebAuthn `navigator.credentials` 실제 호출 → 서명 후 x402 결제 전송 | `POST /api/demo/sign-and-pay` |

---

## 4. API 확장 계획 (신규)

기존 `demoStateStore` 등을 재사용하여 아래 엔드포인트를 `routes.ts`에 추가한다.

| 엔드포인트 | 메소드 | 설명 | 상태 소스 |
|-----------|--------|------|-----------|
| `/api/demo/account` | GET | 계좌 잔액, 사용량, 카테고리별 게이지, 최근 거래, 위임 AI 정보 | `demoStateStore` |
| `/api/demo/micropayment` | POST | 콘텐츠 5건 순차 x402 결제 실행 후 거래내역 반영 | `demoStateStore` + `fetchWithPayment` |
| `/api/demo/settings` | GET | 예산/자동승인/M2M 설정 조회 | `budgetStore` + `autoChargeStore` + `m2mWalletStore` |
| `/api/demo/settings` | POST | 설정 업데이트 후 저장 | 위 스토어 `.update()` |
| `/api/demo/sign-and-pay` | POST | (PassKey 목업) 클라이언트에서 서명 플로우 완료 후 서버에 결제 결과 보고 | `demoStateStore` |
| `/api/demo/reset` | POST | 데모 상태 초기화 | `demoStateStore.reset()` 등 |

---

## 5. 파일 구조 (신규만 기술)

```
src/
  server/
    mockup.ts          # [신규] /mockup HTML/JS. 모바일 뷰포트 + SPA 스크린 전환 + fetch API 연동
    routes.ts          # [수정] /mockup 라우트 1줄 + /api/demo/* 엔드포인트 추가
```

**기존 파일 터치 금지 목록:** `bankDemo.ts`, `demoState.ts`, `index.ts`, `config/*`, `agent/*`

---

## 6. 화면 상세

### M0 인트로 (`/mockup` 진입 시)
- AI 은행 로고 + "x402 PoC | Product Demo" eyebrow
- "데모 시작" 버튼 → M1로 전환

### M1 계좌 조회
- 상단: 계좌 잔액 (`balanceKrw`), 월 사용액/사용률
- 중단: 카테고리별 게이지 (교통/숙박/식음료/콘텐츠)
- 하단: 최근 거래 리스트 (시간, 가맹점, 금액, 상태)
- 데이터: `GET /api/demo/account` → `demoStateStore.getAccount()`

### M2 마이크로결제
- 상단: "기사 5건 결제" 요약 + 누적 결제액
- 리스트: 5건의 기사 항목 (각 `POST /api/demo/micropayment`로 순차 호출)
- 진행 상태: 로딩 → 성공/실패 표시
- 각 건은 실제 `/api/premium/content/brief-{1~5}` x402 유료 엔드포인트 호출
- 성공 시 `demoStateStore.addApprovedTransaction()` 반영

### M3 AI 결제 설정
- 탭 구성: 예산(S13) / 자동승인(S14) / M2M(S15)
- 각 필드는 실제 `GET /api/demo/settings`로 로드, `POST`로 저장
- 저장 즉시 인메모리 스토어에 반영

### M4 PassKey 서명
- 생체인식/PassKey 호출 버튼 (`navigator.credentials.create()`)
- 지원되지 않는 브라우저: "이 브라우저는 PassKey를 지원하지 않습니다" → 수동 서명 폴백
- 성공 시: 클라이언트에서 x402 결제 서명 → `POST /api/demo/sign-and-pay`로 결과 전송 → 서버가 거래내역에 추가
- UI는 은행 앱 스타일 "검증 게이트" 카드 재사용

---

## 7. 구현 우선순위

| 단계 | 작업 | 수정 파일 | 상태 |
|------|------|-----------|------|
| 1 | `/api/demo/account` API | `routes.ts` | ✅ 이미 구현됨 |
| 2 | M0 + M1 화면 (`mockup.ts`) | `mockup.ts` (신규) | ✅ 구현 완료 |
| 3 | `/api/demo/micropayment` API + M2 화면 | `routes.ts`, `mockup.ts` | ✅ 이미 구현됨 / 목업 연동 완료 |
| 4 | `/api/demo/settings` API + M3 화면 | `routes.ts`, `mockup.ts` | ✅ 구현 완료 |
| 5 | `/api/demo/sign-and-pay` + M4 PassKey 화면 | `routes.ts`, `mockup.ts` | ✅ 구현 완료 |
| 6 | `/api/demo/reset` API | `routes.ts` | ✅ 이미 구현됨 |

---

## 8. 비고

- `/bank-demo`와 `/mockup`은 **완전히 독립된 경로**로, 서로 영향을 주지 않는다.
- `/mockup`의 데이터는 `demoStateStore` 등 **기존 인메모리 스토어를 공유**하므로, `/bank-demo`에서 실행한 결제도 `/mockup`에서 조회 가능하다 (반대도 동일).
- x402 미들웨어 및 유료 라우트는 기존 것을 그대로 재사용한다.
- PassKey는 **실제 WebAuthn API**(`navigator.credentials.create`)를 호출하되, 서명 완료 후 서버의 `/api/demo/sign-and-pay`로 결제 결과를 보고한다.
- **타입 체크, 린트, 빌드 모두 통과** (`npm run typecheck && npm run lint && npm run build`).
