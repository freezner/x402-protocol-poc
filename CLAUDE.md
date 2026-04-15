# CLAUDE.md — x402 PoC 프로젝트 지침서

이 문서는 Claude(및 기타 AI 코딩 에이전트)가 본 프로젝트에서 작업할 때 반드시 참고해야 하는 **프로젝트 헌장(Charter)** 입니다. 코드를 작성하거나 수정하기 전에 이 문서를 먼저 읽어주세요.

---

## 1. 프로젝트 개요

- **이름**: x402-PoC
- **목표**: HTTP `402 Payment Required` 표준을 실제 블록체인 결제 흐름에 결합한 **x402 프로토콜**을 구현하여, AI 에이전트/클라이언트가 사람의 개입 없이 API 유료 데이터에 자동 결제하고 접근할 수 있는지를 검증(Proof-of-Concept)한다.
- **성격**: 연구/검증용 PoC. 프로덕션 배포가 아닌, 프로토콜 동작과 지연 시간(Latency), 안정성 측정이 우선.

## 2. 기술 스택

| 영역 | 선택 | 선택 이유 |
|------|------|-----------|
| 언어 | Python 3.11+ | 블록체인 SDK(web3.py, solana-py) 생태계와 빠른 프로토타이핑 |
| 웹 프레임워크 | **Django 5.x** | 강력한 `django-admin`을 통해 PoC 수집 로우데이터(Payment Intent, TX Hash, Latency 로그 등)를 손쉽게 검토 가능 |
| 가상환경 | **venv** (표준 라이브러리) | 외부 의존성 없이 재현성 확보. `python -m venv .venv` |
| 의존성 관리 | `requirements.txt` (+ `requirements-dev.txt`) | 단순/명시적 |
| DB | SQLite (기본) | PoC 단계에서는 단일 파일 DB로 충분 |
| 블록체인 | Base Sepolia(ERC-20 USDC) 우선, Solana Devnet 옵션 | x402 레퍼런스 구현이 Base에 맞춰져 있음 |
| 지갑 SDK | Coinbase Wallet SDK / Reown(WalletConnect) | 브라우저·에이전트 모두에서 세션 키 지원 |
| 온체인 검증 | BaseScan(Etherscan) API 또는 Alchemy/Infura RPC | 트랜잭션 영수증 확인 |

> ⚠️ **중요**: 본 저장소의 **현재 상태는 "하네스(harness)"** 단계입니다. Django 프로젝트(`manage.py`, `settings.py` 등)는 아직 생성되어 있지 않습니다. 사용자의 명시적 지시가 있기 전에는 `django-admin startproject` 등을 실행하지 마세요.

## 3. 저장소 구조 (하네스 기준)

```
x402-PoC/
├── CLAUDE.md            # (이 파일) AI 에이전트용 헌장
├── AGENT.md             # 에이전트 운영 규칙 / 작업 프로토콜
├── README.md            # 사람용 빠른 시작 가이드 (사용자 요청 시 생성)
├── docs/                # 설계 문서, 다이어그램, 연구 노트
│   └── architecture.md  # x402 아키텍처 개요 (4단계 로드맵)
├── specs/               # 기능 명세 / 엔드포인트 계약 / 데이터 모델 초안
│   └── milestones.md    # 단계별 체크리스트
├── .env.example         # 환경 변수 템플릿 (시크릿은 절대 커밋 금지)
└── .gitignore
```

> Django 프로젝트 생성 시 권장 구조는 `specs/milestones.md`의 "Stage 1" 항목 참조.

## 4. 아키텍처 요약 (4단계 로드맵)

1. **환경 구축**: Base Sepolia 테스트넷 + 테스트 USDC + 지갑 SDK 연동.
2. **서비스 제공자(Server)**: `402 Payment Required` 반환, `X-402-Payment-To` / `X-402-Amount` / `X-402-Chain-Id` / `X-402-Payment-Id` 헤더 설계.
3. **자동 결제 클라이언트(Payer)**: 402 인터셉터 → 세션 키 기반 자동 서명 → TX Hash 영수증 전달.
4. **온체인 검증 & 데이터 해제**: 인덱서 API로 TX 확정 확인 → `Payment-Id` 기반 조건부 접근 허용 → 전 구간 Latency 측정.

상세 내용은 `docs/architecture.md` 를 참조.

## 5. 코딩 & 작업 컨벤션

- **가상환경 필수**: 모든 Python 명령은 활성화된 `.venv` 내에서 실행한다. 설치는 반드시 `pip install -r requirements.txt` 형태로 관리 (수동 `pip install pkg` 후 `requirements.txt` 미반영 금지).
- **시크릿 관리**: 프라이빗 키, RPC API 키, BaseScan 키 등은 `.env` 에만 저장. `.env.example` 에는 키 이름만 적는다. **절대로** 실제 키를 커밋하거나 로그·에러 메시지에 노출하지 않는다.
- **실 자산 금지**: 메인넷 주소·메인넷 키를 사용하지 않는다. 모든 테스트는 테스트넷(Base Sepolia / Solana Devnet)에서만 수행한다.
- **Django Admin 우선**: 새 데이터 모델을 추가하면 즉시 `admin.py` 에 등록하여 로우 데이터를 즉시 열람 가능하게 한다. (PoC 채택의 핵심 이유)
- **관측성**: 결제 요청/응답의 각 단계(요청 수신 시각, 402 반환 시각, TX 수신 시각, 검증 완료 시각)를 모델 필드로 기록하여 Latency 분석을 지원한다.
- **커밋 단위**: 단계(Stage) 단위로 작은 커밋을 선호. 사용자가 명시적으로 요청하기 전에는 커밋/푸시하지 않는다.

## 6. AI 에이전트가 하지 말아야 할 것

1. 사용자의 지시 없이 `django-admin startproject` / 마이그레이션 / 서버 실행을 임의로 수행.
2. 실제 메인넷 지갑 주소·키를 파일에 작성.
3. `requirements.txt` 와 실제 설치 상태를 분리(동기화 누락).
4. 실측치 없이 Latency·성공률 등의 수치 주장.
5. 아키텍처 중대 결정(체인 선택, SDK 교체 등)을 문서 업데이트 없이 적용.

## 7. 다음 단계(진입점)

사용자가 진행을 지시하면 먼저 `specs/milestones.md` 의 **Stage 1 체크리스트**를 하나씩 밟는다. Django 프로젝트 스캐폴딩은 Stage 1의 마지막 단계이며, 그 전에 venv·requirements·환경 변수 설계가 선행되어야 한다.
