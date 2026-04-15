# Milestones — 단계별 체크리스트

각 단계는 `AGENT.md` §5 의 검증 기준을 충족해야 완료로 간주된다.

## Stage 0 — 하네스 (현재 단계)
- [x] `CLAUDE.md` 작성
- [x] `AGENT.md` 작성
- [x] `docs/architecture.md` 초안
- [x] `specs/milestones.md` (본 파일)
- [x] `.env.example`, `.gitignore` 템플릿
- [ ] 사용자 승인 후 Stage 1 진입

## Stage 1 — 환경 구축
- [ ] `python -m venv .venv` 로 가상환경 생성
- [ ] `requirements.txt` 초기 작성: `Django>=5.0,<6.0`, `web3`, `python-dotenv`, `requests`
- [ ] `requirements-dev.txt`: `pytest`, `pytest-django`, `ruff`, `black`
- [ ] `.env.example` 에 필요한 키 정의 (`BASE_SEPOLIA_RPC_URL`, `BASESCAN_API_KEY`, `SERVER_WALLET_ADDRESS`, `SERVER_WALLET_PRIVATE_KEY`(테스트넷 전용 경고), `USDC_CONTRACT_ADDRESS`)
- [ ] 테스트넷 USDC/ETH 확보 (Faucet 링크를 `docs/` 에 기록)
- [ ] Django 프로젝트 스캐폴딩: `django-admin startproject config .`
- [ ] 앱 스캐폴딩: `payments`, `gateway`, `wallet`, `observability`
- [ ] `python manage.py migrate` → `createsuperuser` → admin 접속 확인

## Stage 2 — 서비스 제공자(Server)
- [ ] `PaymentIntent`, `PaymentReceipt`, `LatencyLog` 모델 + admin 등록
- [ ] `/api/premium/<resource>/` 뷰: 미결제 시 402 + `X-402-*` 헤더 반환
- [ ] Payment-Id 생성기(ULID/UUIDv7) + 중복 방지 테스트
- [ ] pytest: 402 응답 헤더 계약 테스트

## Stage 3 — 자동 결제 클라이언트(Payer)
- [ ] `client/` 디렉토리에 `httpx` 기반 인터셉터 작성
- [ ] `web3.py` 로 USDC `transfer` 트랜잭션 서명/전송
- [ ] 세션 키 한도 검증(초과 시 서명 거부)
- [ ] `POST /api/payments/receipt` 로 TX Hash 전달
- [ ] 엔드투엔드 스크립트: 요청 → 402 → 결제 → 재요청 → 200

## Stage 4 — 검증 & 데이터 해제
- [ ] `verify_receipt` 서비스: RPC `eth_getTransactionReceipt` 로 TX 확정
- [ ] 금액/수신자/체인 ID 일치 검증
- [ ] `Payment-Id` 기반 단기 액세스 토큰 발급
- [ ] `LatencyLog` 에 4개 타임스탬프 기록, admin 리스트뷰에서 노출
- [ ] 최종 데모: 전 과정 Latency 측정 리포트를 `docs/benchmarks.md` 에 저장
