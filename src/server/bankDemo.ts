export function getBankDemoHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI 에이전트 전용 계좌 데모</title>
  <style>
    :root {
      --bank-primary: #003d82;
      --accent: #0066ff;
      --success: #00a85a;
      --warning: #ff7a00;
      --danger: #e03131;
      --coin: #f5b400;
      --surface: #f5f7fa;
      --surface-strong: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --line: #d9e2ec;
      --shadow: 0 22px 48px rgba(15, 23, 42, 0.12);
      --radius: 20px;
      --phone-w: 360px;
      --phone-h: 780px;
      font-family: Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background:
      radial-gradient(circle at top left, rgba(0, 102, 255, 0.14), transparent 26%),
      linear-gradient(180deg, #eef4fb 0%, #f7fafc 100%);
      color: var(--text);
    }
    body { padding: 28px; }
    a { color: inherit; }
    button { font: inherit; }

    .layout {
      display: grid;
      grid-template-columns: minmax(380px, 460px) minmax(340px, 1fr);
      gap: 28px;
      max-width: 1320px;
      margin: 0 auto;
      align-items: start;
    }

    .phone-shell {
      position: sticky;
      top: 24px;
      display: flex;
      justify-content: center;
    }

    .phone {
      width: var(--phone-w);
      height: var(--phone-h);
      border-radius: 34px;
      background: #09162b;
      padding: 10px;
      box-shadow: 0 30px 60px rgba(0, 23, 61, 0.24);
    }

    .phone-inner {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
      border-radius: 26px;
      background: var(--surface);
    }

    .screen {
      position: absolute;
      inset: 0;
      overflow-y: auto;
      padding: 20px 18px 26px;
      background: var(--surface);
      opacity: 0;
      pointer-events: none;
      transform: translateX(24px);
      transition: opacity 0.28s ease, transform 0.28s ease;
    }

    .screen.active {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
    }

    .screen.bank-full {
      padding: 0;
      background: var(--bank-primary);
      color: #fff;
    }

    .screen-wrap { padding: 28px 24px; min-height: 100%; }
    .hero-center {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 16px;
    }

    .brand-mark {
      width: 72px;
      height: 72px;
      border-radius: 24px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.18);
      font-size: 28px;
      font-weight: 700;
    }

    .eyebrow {
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.76);
    }

    .hero-title {
      font-size: 30px;
      line-height: 1.24;
      font-weight: 700;
      letter-spacing: 0;
    }

    .hero-sub {
      font-size: 14px;
      line-height: 1.65;
      color: rgba(255,255,255,0.78);
      max-width: 240px;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 13px;
      color: var(--muted);
    }

    .topbar strong { color: var(--text); font-size: 17px; }
    .stack { display: grid; gap: 12px; }

    .card {
      background: var(--surface-strong);
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
    }

    .balance-card {
      background: linear-gradient(160deg, #003d82 0%, #0a59b5 100%);
      color: #fff;
      border: none;
    }

    .balance-label, .meta-text {
      font-size: 12px;
      color: rgba(255,255,255,0.76);
    }

    .balance-amount {
      font-size: 31px;
      line-height: 1.1;
      margin: 8px 0 10px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .quick-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .quick-item, .mini-pill, .setting-chip, .ai-badge, .merchant-node, .request-card, .report-chip, .small-action {
      border-radius: 14px;
      background: var(--surface-strong);
      border: 1px solid var(--line);
    }

    .quick-item {
      padding: 12px 8px;
      text-align: center;
      font-size: 12px;
      color: var(--muted);
    }

    .promo {
      padding: 18px;
      background: linear-gradient(145deg, #0a4ea4 0%, #0b78ff 100%);
      color: #fff;
      border: none;
    }

    .promo h3, .section-title, .value-card h3, .screen-title, .danger-title {
      margin: 0;
      letter-spacing: 0;
    }

    .promo h3 { font-size: 22px; line-height: 1.28; }
    .promo p { margin: 10px 0 14px; font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.8); }

    .cta, .ghost, .danger-btn, .secondary-btn {
      width: 100%;
      border: none;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    .cta { background: var(--accent); color: #fff; }
    .ghost { background: rgba(255,255,255,0.14); color: #fff; border: 1px solid rgba(255,255,255,0.18); }
    .secondary-btn { background: #edf4ff; color: var(--bank-primary); }
    .danger-btn { background: var(--bank-primary); color: #fff; }

    .screen-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .screen-subtitle { margin: 0 0 16px; color: var(--muted); font-size: 13px; line-height: 1.55; }

    .value-card h3 { font-size: 16px; margin-bottom: 6px; }
    .value-card p, .list-note, .timeline-copy, .receipt-note, .report-note {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .step-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }

    .step {
      padding: 9px 10px;
      border-radius: 12px;
      background: #eaf1fb;
      color: var(--muted);
      font-size: 12px;
      text-align: center;
      font-weight: 600;
    }

    .step.active { background: #d8e8ff; color: var(--bank-primary); }
    .setting-row, .ai-row, .transaction-row, .report-row, .micro-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .setting-row + .setting-row, .ai-row + .ai-row, .transaction-row + .transaction-row, .report-row + .report-row, .micro-row + .micro-row {
      margin-top: 12px;
    }

    .setting-chip {
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--bank-primary);
      background: #edf4ff;
      border-color: #d4e5ff;
    }

    .toggle-on {
      color: var(--success);
      font-weight: 700;
    }

    .muted { color: var(--muted); }
    .small { font-size: 12px; }
    .tiny { font-size: 11px; }

    .gauge-block + .gauge-block { margin-top: 12px; }
    .gauge-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .bar {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: #e5edf7;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: 999px;
      width: 0;
      transition: width 0.55s ease;
      background: linear-gradient(90deg, #0d5bcc 0%, #39a4ff 100%);
    }

    .fill.orange { background: linear-gradient(90deg, #ff8b1f 0%, #ffb34f 100%); }
    .fill.green { background: linear-gradient(90deg, #00a85a 0%, #46d98f 100%); }

    .ai-badge {
      padding: 14px;
      background: #fff;
    }

    .notif {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px;
      border-radius: 16px;
      background: #eef6ff;
      border: 1px solid #d7e7ff;
      color: var(--bank-primary);
      font-size: 13px;
      line-height: 1.5;
      animation: notifPulse 2s ease-in-out infinite;
    }

    @keyframes notifPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.32); }
      50%       { box-shadow: 0 0 0 7px rgba(0, 102, 255, 0); }
    }

    .request-list, .merchant-list, .article-list {
      display: grid;
      gap: 10px;
    }

    .request-card, .merchant-node {
      padding: 12px;
      background: #fff;
    }

    .request-card.pending { border-style: dashed; }
    .request-card.done { border-color: #b9e6cd; background: #f1fff7; }
    .merchant-node.done { border-color: #b9e6cd; background: #f1fff7; }

    .verify-gate {
      position: relative;
      padding: 16px;
      border-radius: 20px;
      background: linear-gradient(160deg, #003d82 0%, #0a57b1 100%);
      color: #fff;
      overflow: hidden;
    }

    .verify-gate.pulse::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0, 168, 90, 0.24);
      animation: gatePulse 0.45s ease;
    }

    @keyframes gatePulse {
      from { opacity: 0.85; }
      to { opacity: 0; }
    }

    .verify-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.74);
    }

    .verify-item:last-child { border-bottom: none; }
    .verify-item.pass { color: #fff; }
    .verify-item.pass span:last-child { color: #8ef1bb; }

    .runtime-note, .status-card, .action-card, .copy-card {
      background: rgba(255,255,255,0.92);
      border: 1px solid rgba(210, 220, 232, 0.9);
      border-radius: 20px;
      padding: 18px;
      box-shadow: var(--shadow);
    }

    .right-panel {
      display: grid;
      gap: 16px;
      align-content: start;
    }

    .headline {
      display: grid;
      gap: 10px;
      padding: 4px 0;
    }

    .headline h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.18;
      letter-spacing: 0;
    }

    .headline p {
      margin: 0;
      font-size: 15px;
      line-height: 1.7;
      color: #45556c;
      max-width: 720px;
    }

    .pill-row, .action-row, .screen-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .mini-pill, .report-chip, .small-action {
      padding: 8px 11px;
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      background: #fff;
    }

    .small-action {
      cursor: pointer;
      border: 1px solid var(--line);
      color: var(--bank-primary);
      background: #edf4ff;
      border-radius: 12px;
      padding: 10px 14px;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .stat {
      padding: 14px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid var(--line);
    }

    .stat-label { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
    .stat-value { font-size: 22px; font-weight: 700; letter-spacing: 0; }
    .stat-sub { font-size: 12px; color: var(--muted); margin-top: 6px; line-height: 1.5; }

    .status-line {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e7edf5;
      font-size: 13px;
    }

    .status-line:last-child { border-bottom: none; }

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
      background: #b8c6d8;
    }

    .dot.on { background: var(--success); }
    .dot.warn { background: var(--warning); }

    .action-btn {
      width: 100%;
      border: none;
      border-radius: 14px;
      padding: 13px 14px;
      background: var(--bank-primary);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    .action-btn.alt { background: #edf4ff; color: var(--bank-primary); }
    .action-btn:disabled { opacity: 0.64; cursor: wait; }

    .runtime-log {
      margin-top: 12px;
      border-radius: 16px;
      background: #08111f;
      color: #dce7f5;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      line-height: 1.65;
      min-height: 92px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .alert-modal {
      padding: 20px;
      background: #fff7f1;
      border: 1px solid #ffd7b2;
      border-radius: 22px;
      box-shadow: inset 0 0 0 1px rgba(255, 122, 0, 0.08);
    }

    .danger-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--warning);
      margin-bottom: 12px;
    }

    .alert-reasons {
      display: grid;
      gap: 8px;
      margin: 14px 0 18px;
      color: #8b5a2b;
      font-size: 13px;
    }

    .alert-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .secondary-btn {
      background: #fff;
      border: 1px solid #ffd5b1;
    }

    .toast {
      margin-top: 12px;
      padding: 12px 14px;
      border-radius: 14px;
      background: #ebfff3;
      border: 1px solid #c2efd1;
      color: #0f6a3e;
      font-size: 13px;
      display: none;
    }

    .toast.show { display: block; }

    .article-chip {
      font-size: 11px;
      color: var(--bank-primary);
      background: #edf4ff;
      padding: 4px 8px;
      border-radius: 999px;
      font-weight: 700;
    }

    .footer-links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 13px;
      color: var(--muted);
    }

    .footer-links a {
      color: var(--bank-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .footer-links a:hover { text-decoration: underline; }

    .floating-controls {
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 14px;
      display: flex;
      gap: 10px;
      z-index: 4;
    }

    .nav-btn {
      flex: 1;
      border: none;
      border-radius: 14px;
      padding: 12px 14px;
      background: rgba(9, 22, 43, 0.92);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .nav-btn:disabled { opacity: 0.34; cursor: default; }

    /* ===== 설정 화면 (S13 · S14 · S15) ===== */
    .settings-section { padding: 14px 0; border-bottom: 1px solid var(--line); }
    .settings-section:last-child { border-bottom: none; }

    .range-wrap { margin-top: 10px; }
    .range-input {
      width: 100%; accent-color: var(--bank-primary);
      height: 4px; cursor: pointer;
    }

    .pill-toggle {
      flex-shrink: 0;
      width: 44px; height: 26px; border-radius: 999px;
      border: none; cursor: pointer; position: relative;
      background: #d1d5db; transition: background 0.22s;
    }
    .pill-toggle.on { background: var(--bank-primary); }
    .pill-toggle::after {
      content: ''; position: absolute;
      top: 3px; left: 3px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #fff; transition: transform 0.22s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.18);
    }
    .pill-toggle.on::after { transform: translateX(18px); }

    .toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }

    .m2m-addr {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; background: #f1f5f9; color: #334155;
      padding: 10px 12px; border-radius: 10px;
      word-break: break-all; margin-top: 8px; line-height: 1.6;
    }

    .agent-chip {
      display: flex; justify-content: space-between; align-items: center;
      padding: 11px 13px; border-radius: 12px;
      border: 1px solid var(--line); background: var(--surface-strong);
    }
    .agent-chip + .agent-chip { margin-top: 8px; }

    .badge-x402 {
      background: #d8e8ff; color: var(--bank-primary);
      font-size: 10px; font-weight: 700;
      border-radius: 6px; padding: 3px 8px;
    }

    .nav-link-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--line);
      cursor: pointer;
    }
    .nav-link-row:last-child { border-bottom: none; }
    .nav-link-row:active { background: #f8fafc; border-radius: 8px; }

    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .phone-shell { position: static; }
    }

    @media (max-width: 700px) {
      body { padding: 14px; }
      .headline h1 { font-size: 28px; }
      .stat-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <section class="phone-shell">
      <div class="phone">
        <div class="phone-inner">
          <section class="screen bank-full active" data-screen="S0">
            <div class="screen-wrap hero-center">
              <div class="brand-mark">AI</div>
              <div class="eyebrow">x402 PoC | Product Demo</div>
              <div class="hero-title">AI에게 지갑을 맡기는 시대,<br/>그 지갑을 책임지는 건 은행이다.</div>
              <div class="hero-sub">AI 에이전트 전용 계좌를 기존 은행 앱 안에서 설명하는 데모 흐름입니다.</div>
              <button class="ghost" data-goto="S1">데모 시작</button>
            </div>
          </section>

          <section class="screen" data-screen="S1">
            <div class="topbar"><div><strong>안녕하세요, 김OO 고객님</strong><div class="small">오늘의 주요 상품</div></div><div>09:41</div></div>
            <div class="stack">
              <div class="card balance-card">
                <div class="balance-label">입출금 통장</div>
                <div class="balance-amount">₩4,820,000</div>
                <div class="meta-text">기존 계좌와 연결된 서브 계좌 형태로 운용</div>
              </div>
              <div class="quick-grid">
                <div class="quick-item">송금</div>
                <div class="quick-item">결제</div>
                <div class="quick-item">환전</div>
                <div class="quick-item">상품</div>
              </div>
              <div class="card promo">
                <div class="tiny">신상품</div>
                <h3>AI 에이전트 전용 계좌</h3>
                <p>AI에게 결제를 맡기되, 한도와 카테고리 통제는 은행과 사용자가 함께 유지합니다.</p>
                <button class="ghost" data-goto="S2">자세히 보기</button>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">최근 거래</div>
                <p class="list-note">급여 입금 ₩3,200,000 · 카드대금 출금 ₩742,000 · 공과금 자동이체 ₩118,000</p>
              </div>
            </div>
          </section>

          <section class="screen" data-screen="S2">
            <div class="topbar"><div><strong>상품 소개</strong></div><div>S2</div></div>
            <div class="screen-title">AI 에이전트 전용 계좌</div>
            <p class="screen-subtitle">AI에게 결제를 맡기되, 통제는 당신과 은행에게.</p>
            <div class="stack">
              <div class="card value-card">
                <h3>한도와 카테고리를 직접 설정</h3>
                <p>AI가 쓸 수 있는 범위를 계좌 차원에서 제한합니다.</p>
              </div>
              <div class="card value-card">
                <h3>이상거래는 은행이 자동 차단</h3>
                <p>평소와 다른 결제는 즉시 보류하고 사용자 승인 여부를 묻습니다.</p>
              </div>
              <div class="card value-card">
                <h3>모든 거래를 AI 단위로 추적</h3>
                <p>어떤 AI가 무엇에 썼는지 한눈에 감사 가능한 구조입니다.</p>
              </div>
              <div class="card">
                <p class="list-note">기존 입출금 통장과 연결되어 운용됩니다.</p>
              </div>
              <button class="cta" data-goto="S3">계좌 개설하기</button>
            </div>
          </section>

          <section class="screen" data-screen="S3">
            <div class="topbar"><div><strong>가입 설정</strong></div><div>S3</div></div>
            <div class="step-row">
              <div class="step active">1. 한도</div>
              <div class="step active">2. 카테고리</div>
              <div class="step active">3. 만료</div>
            </div>
            <p class="screen-subtitle">은행이 모든 거래를 이 룰에 따라 검증합니다.</p>
            <div class="stack">
              <div class="card">
                <div class="setting-row"><strong>월 한도</strong><span class="setting-chip">₩1,000,000</span></div>
                <div class="bar" style="margin-top:12px"><div class="fill" style="width:42%"></div></div>
                <p class="list-note" style="margin-top:10px">일 한도 ₩300,000 · 발표용 기본값 적용</p>
              </div>
              <div class="card">
                <div class="setting-row"><span>교통</span><span class="toggle-on">허용 · ₩300,000</span></div>
                <div class="setting-row"><span>숙박</span><span class="toggle-on">허용 · ₩500,000</span></div>
                <div class="setting-row"><span>식음료</span><span class="toggle-on">허용 · ₩200,000</span></div>
                <div class="setting-row"><span>콘텐츠</span><span class="toggle-on">허용 · ₩50,000</span></div>
                <div class="setting-row"><span>일반 쇼핑</span><span class="muted">미허용</span></div>
                <div class="setting-row"><span>해외 결제</span><span class="muted">미허용</span></div>
              </div>
              <div class="card">
                <div class="setting-row"><strong>만료</strong><span class="setting-chip">3개월</span></div>
                <p class="list-note" style="margin-top:10px">자동 갱신 전 사용자 재확인</p>
              </div>
              <button class="cta" data-goto="S4">다음</button>
            </div>
          </section>

          <section class="screen" data-screen="S4">
            <div class="topbar"><div><strong>AI 등록</strong></div><div>S4</div></div>
            <div class="screen-title">권한을 위임할 AI 선택</div>
            <p class="screen-subtitle">은행이 검증한 AI 제공사 목록입니다.</p>
            <div class="stack">
              <div class="ai-badge">
                <div class="ai-row"><strong>ClaudeAssist</strong><span class="setting-chip">신뢰 A</span></div>
                <p class="list-note" style="margin-top:8px">Anthropic 제휴 · 자동 결제 활성</p>
              </div>
              <div class="ai-badge">
                <div class="ai-row"><strong>GPT Travel</strong><span class="setting-chip">신뢰 A</span></div>
                <p class="list-note" style="margin-top:8px">OpenAI 제휴 · 승인형 권한</p>
              </div>
              <div class="ai-badge">
                <div class="ai-row"><strong>NaverCue</strong><span class="setting-chip">신뢰 A</span></div>
                <p class="list-note" style="margin-top:8px">네이버 제휴 · 국내 서비스 중심</p>
              </div>
              <button class="cta" data-goto="S5">약관 동의 후 개설</button>
            </div>
          </section>

          <section class="screen" data-screen="S5">
            <div class="hero-center" style="min-height:auto;padding-top:70px">
              <div class="brand-mark" style="background:#dff8ea;color:var(--success);border:none">✓</div>
              <div class="screen-title">AI 에이전트 계좌가 개설되었습니다</div>
              <div class="card" style="width:100%;text-align:left">
                <div class="transaction-row"><span class="muted">계좌번호</span><strong>1002-19-402-0001</strong></div>
                <div class="transaction-row"><span class="muted">월 한도</span><strong>₩1,000,000</strong></div>
                <div class="transaction-row"><span class="muted">위임 AI</span><strong>ClaudeAssist 1개</strong></div>
                <div class="transaction-row"><span class="muted">만료</span><strong>3개월</strong></div>
              </div>
              <p class="screen-subtitle">기존 통장에서 ₩1,000,000 자동 충전됨</p>
              <button class="cta" data-goto="S6">계좌 둘러보기</button>
            </div>
          </section>

          <section class="screen" data-screen="S6">
            <div class="topbar"><div><strong>AI 계좌 대시보드</strong></div><div>S6</div></div>
            <div class="stack">
              <div class="card balance-card">
                <div class="balance-label">AI 에이전트 계좌</div>
                <div class="balance-amount" id="demo-balance">₩1,000,000</div>
                <div class="meta-text" id="demo-usage">월 한도 ₩1,000,000 / 사용 ₩0 (0%)</div>
                <div class="pill-row" style="margin-top:14px">
                  <div class="mini-pill">충전</div>
                  <div class="mini-pill">한도 변경</div>
                  <div class="mini-pill">정지</div>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">카테고리 사용량</div>
                <div class="gauge-block">
                  <div class="gauge-header"><span>교통</span><span id="gauge-transport-label">0 / 300,000</span></div>
                  <div class="bar"><div class="fill" id="gauge-transport"></div></div>
                </div>
                <div class="gauge-block">
                  <div class="gauge-header"><span>숙박</span><span id="gauge-stay-label">0 / 500,000</span></div>
                  <div class="bar"><div class="fill green" id="gauge-stay"></div></div>
                </div>
                <div class="gauge-block">
                  <div class="gauge-header"><span>식음료</span><span id="gauge-food-label">0 / 200,000</span></div>
                  <div class="bar"><div class="fill orange" id="gauge-food"></div></div>
                </div>
                <div class="gauge-block">
                  <div class="gauge-header"><span>콘텐츠</span><span id="gauge-content-label">0 / 50,000</span></div>
                  <div class="bar"><div class="fill" id="gauge-content"></div></div>
                </div>
              </div>
              <div class="ai-badge">
                <div class="ai-row"><strong>ClaudeAssist</strong><span class="setting-chip">자동 결제</span></div>
                <p class="list-note" style="margin-top:8px">신뢰등급 A · 만료 D-90 · 출장 예약 워크플로우 사용 중</p>
              </div>
              <div class="notif" data-goto="S7" style="cursor:pointer">
                <div>🔔</div>
                <div>ClaudeAssist가 결제를 요청했습니다.<br/><span class="tiny">탭해서 결제 요청 화면 보기</span></div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">최근 거래</div>
                <div id="recent-transactions" class="list-note">아직 거래가 없습니다.</div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px;margin-bottom:4px">추가 설정</div>
                <div class="nav-link-row" data-goto="S13">
                  <div><div style="font-size:13px;font-weight:600">카테고리 예산 관리</div><div class="tiny muted">한도 · 알림 기준 설정</div></div>
                  <span class="setting-chip">→</span>
                </div>
                <div class="nav-link-row" data-goto="S14">
                  <div><div style="font-size:13px;font-weight:600">자동 출전 한도</div><div class="tiny muted">자동 승인 · 확인 기준</div></div>
                  <span class="setting-chip">→</span>
                </div>
                <div class="nav-link-row" data-goto="S15">
                  <div><div style="font-size:13px;font-weight:600">M2M 지갑 설정</div><div class="tiny muted">x402 에이전트 결제 구성</div></div>
                  <span class="setting-chip">→</span>
                </div>
              </div>
            </div>
          </section>

          <section class="screen" data-screen="S7">
            <div class="topbar"><div><strong>외부 AI 비서</strong></div><div>S7</div></div>
            <div class="stack">
              <div class="card">
                <div class="tiny muted">외부 AI 비서 화면</div>
                <div class="screen-title" style="font-size:22px;margin-top:6px">ClaudeAssist</div>
                <p class="list-note" style="margin-top:12px">"다음 주 화요일 대구 당일 출장 잡아줘. 한도 60만 원."</p>
              </div>
              <div class="card">
                <strong>결제 요청 4건 전송 완료</strong>
                <div class="request-list" style="margin-top:12px">
                  <div class="request-card pending">🚄 KTX 왕복 <strong>₩88,000</strong></div>
                  <div class="request-card pending">🏨 호텔 데이유즈 <strong>₩120,000</strong></div>
                  <div class="request-card pending">🍱 점심 예약 <strong>₩45,000</strong></div>
                  <div class="request-card pending">💼 미팅룸 1시간 <strong>₩30,000</strong></div>
                </div>
              </div>
              <button class="cta" data-goto="S8">은행 앱으로 돌아가기</button>
            </div>
          </section>

          <section class="screen" data-screen="S8">
            <div class="topbar"><div><strong>검증 · 승인 · 결제</strong></div><div>S8</div></div>
            <div class="stack">
              <div class="card">
                <div class="transaction-row"><strong>실행 카운터</strong><span id="payment-timer">0.0s</span></div>
                <p class="receipt-note">각 단계는 실제 x402 유료 엔드포인트를 호출한 뒤 데모 상태에 반영됩니다. 계좌 숫자는 UX 설명용 상태입니다.</p>
              </div>
              <div class="request-list" id="payment-requests">
                <div class="request-card" data-request="0">🚄 RailGo · ₩88,000</div>
                <div class="request-card" data-request="1">🏨 StayMate · ₩120,000</div>
                <div class="request-card" data-request="2">🍱 TableNow · ₩45,000</div>
                <div class="request-card" data-request="3">💼 RoomFlex · ₩30,000</div>
              </div>
              <div class="verify-gate" id="verify-gate">
                <div class="tiny" style="color:rgba(255,255,255,0.72);margin-bottom:10px">은행이 보장합니다</div>
                <div class="section-title" style="color:#fff;font-size:18px;margin-bottom:8px">은행 검증 게이트</div>
                <div class="verify-item" data-verify="0"><span>한도 검증</span><span>대기</span></div>
                <div class="verify-item" data-verify="1"><span>카테고리 검증</span><span>대기</span></div>
                <div class="verify-item" data-verify="2"><span>이상거래 검증</span><span>대기</span></div>
              </div>
              <div class="merchant-list">
                <div class="merchant-node" data-merchant="0">RailGo 결제 대기</div>
                <div class="merchant-node" data-merchant="1">StayMate 결제 대기</div>
                <div class="merchant-node" data-merchant="2">TableNow 결제 대기</div>
                <div class="merchant-node" data-merchant="3">RoomFlex 결제 대기</div>
              </div>
              <button class="cta" id="simulate-payment-btn">실제 결제와 함께 실행</button>
              <button class="secondary-btn" data-goto="S9">영수증 화면 보기</button>
            </div>
          </section>

          <section class="screen" data-screen="S9">
            <div class="topbar"><div><strong>결제 영수증</strong></div><div>S9</div></div>
            <div class="stack">
              <div class="card balance-card">
                <div class="balance-label">AI 에이전트 계좌</div>
                <div class="balance-amount" id="receipt-balance">₩717,000</div>
                <div class="meta-text">ClaudeAssist가 4건 결제 · 총 ₩283,000</div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">최근 거래</div>
                <div id="receipt-transactions">
                  <div class="transaction-row"><span>RailGo</span><strong>₩88,000</strong></div>
                  <div class="transaction-row"><span>StayMate</span><strong>₩120,000</strong></div>
                  <div class="transaction-row"><span>TableNow</span><strong>₩45,000</strong></div>
                  <div class="transaction-row"><span>RoomFlex</span><strong>₩30,000</strong></div>
                </div>
              </div>
              <p class="receipt-note">이 영역은 서버의 데모 상태를 읽어 동기화됩니다.</p>
              <button class="cta" data-goto="S10">이상거래 차단 화면 보기</button>
            </div>
          </section>

          <section class="screen" data-screen="S10">
            <div class="topbar"><div><strong>이상거래 감지</strong></div><div>S10</div></div>
            <div class="alert-modal">
              <div class="danger-title">이상거래 감지</div>
              <div class="timeline-copy">ClaudeAssist가 해외 IP에서 ₩980,000 결제를 시도했습니다.</div>
              <div class="alert-reasons">
                <div>평소 패턴과 다른 시간</div>
                <div>등록되지 않은 가맹점</div>
                <div>'해외 결제' 카테고리 미허용</div>
              </div>
              <div class="alert-actions">
                <button class="danger-btn" id="reject-btn">거부하기</button>
                <button class="secondary-btn">1회 승인</button>
              </div>
              <div class="toast" id="reject-toast">차단 완료. 결제는 자동으로 거부된 상태입니다.</div>
            </div>
            <div class="stack" style="margin-top:14px">
              <button class="cta" data-goto="S11">마이크로결제 사례 보기</button>
            </div>
          </section>

          <section class="screen" data-screen="S11">
            <div class="topbar"><div><strong>콘텐츠 마이크로결제</strong></div><div>S11</div></div>
            <div class="stack">
              <div class="card">
                <div class="transaction-row"><strong>🚄 KTX 광명→대구 이동 중</strong><span class="article-chip">출장 중</span></div>
                <p class="list-note" style="margin-top:8px">기사 5건 결제 요청을 은행에 보냈습니다.</p>
              </div>
              <div class="article-list">
                <div class="request-card micro-row"><span>AI 금융 인프라의 재편</span><span class="article-chip">₩150</span></div>
                <div class="request-card micro-row"><span>에이전트 결제 UX 트렌드</span><span class="article-chip">₩150</span></div>
                <div class="request-card micro-row"><span>x402와 은행 계좌 구조</span><span class="article-chip">₩150</span></div>
                <div class="request-card micro-row"><span>출장 데이터 자동화</span><span class="article-chip">₩150</span></div>
                <div class="request-card micro-row"><span>마이크로결제 수익성</span><span class="article-chip">₩150</span></div>
              </div>
              <div class="card">
                <div class="transaction-row"><strong>누적 결제</strong><span>₩750</span></div>
                <p class="receipt-note">기사 5건은 각각 별도 x402 유료 엔드포인트를 호출하도록 연결됩니다.</p>
              </div>
              <button class="cta" id="run-micro-btn">실제 마이크로결제 실행</button>
              <button class="cta" data-goto="S12">월간 리포트 보기</button>
            </div>
          </section>

          <section class="screen" data-screen="S12">
            <div class="topbar"><div><strong>월간 리포트</strong></div><div>S12</div></div>
            <div class="stack">
              <div class="card">
                <div class="section-title" style="font-size:17px">2026년 4월 · AI 에이전트 계좌 리포트</div>
                <div class="report-row" style="margin-top:14px"><span class="muted">총 결제</span><strong id="report-total">0건 / ₩0</strong></div>
                <div class="report-row"><span class="muted">가맹점</span><strong id="report-merchants">0곳</strong></div>
                <div class="report-row"><span class="muted">차단 성과</span><strong id="report-protection">₩0 손실 방지</strong></div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">카테고리 인사이트</div>
                <div class="pill-row" style="margin-top:12px" id="report-mix">
                  <div class="report-chip">교통 0%</div>
                  <div class="report-chip">숙박 0%</div>
                  <div class="report-chip">식음료 0%</div>
                  <div class="report-chip">콘텐츠 0%</div>
                </div>
              </div>
              <div class="card" id="report-insights">
                <div class="report-row"><span>리포트 생성 전</span><span>결제 실행 필요</span></div>
              </div>
              <button class="cta" data-goto="S16">엔딩 보기</button>
            </div>
          </section>

          <!-- ====== S13: 카테고리 예산 관리 ====== -->
          <section class="screen" data-screen="S13">
            <div class="topbar">
              <div data-goto="S6" style="cursor:pointer"><strong>← 카테고리 예산 관리</strong></div>
              <div>S13</div>
            </div>
            <div class="stack">
              <div class="card balance-card">
                <div class="balance-label">월 총 예산</div>
                <div class="balance-amount" id="s14-total">₩1,000,000</div>
                <div class="meta-text" id="s14-used-text">사용 ₩0 · 잔여 ₩1,000,000</div>
                <div class="pill-row" style="margin-top:12px">
                  <div class="mini-pill" id="s14-renew-badge">자동 갱신 ON</div>
                  <div class="mini-pill">만료 D-90</div>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">카테고리별 한도</div>
                <div class="gauge-block" style="margin-top:14px">
                  <div class="gauge-header"><span>🚄 교통</span><span id="s14-transport-val">0 / 300,000</span></div>
                  <div class="bar"><div class="fill" id="s14-transport-fill"></div></div>
                  <div class="setting-row" style="margin-top:6px;font-size:12px">
                    <span class="muted">80% 초과시 알림</span><span class="toggle-on tiny">설정됨</span>
                  </div>
                </div>
                <div class="gauge-block">
                  <div class="gauge-header"><span>🏨 숙박</span><span id="s14-stay-val">0 / 500,000</span></div>
                  <div class="bar"><div class="fill green" id="s14-stay-fill"></div></div>
                  <div class="setting-row" style="margin-top:6px;font-size:12px">
                    <span class="muted">80% 초과시 알림</span><span class="toggle-on tiny">설정됨</span>
                  </div>
                </div>
                <div class="gauge-block">
                  <div class="gauge-header"><span>🍱 식음료</span><span id="s14-food-val">0 / 200,000</span></div>
                  <div class="bar"><div class="fill orange" id="s14-food-fill"></div></div>
                  <div class="setting-row" style="margin-top:6px;font-size:12px">
                    <span class="muted">80% 초과시 알림</span><span class="toggle-on tiny">설정됨</span>
                  </div>
                </div>
                <div class="gauge-block">
                  <div class="gauge-header"><span>📰 콘텐츠</span><span id="s14-content-val">0 / 50,000</span></div>
                  <div class="bar"><div class="fill" id="s14-content-fill"></div></div>
                  <div class="setting-row" style="margin-top:6px;font-size:12px">
                    <span class="muted">80% 초과시 알림</span><span class="toggle-on tiny">설정됨</span>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="toggle-row">
                  <div>
                    <div style="font-size:14px;font-weight:600">자동 갱신</div>
                    <div class="small muted">만료 7일 전 사용자 확인 후 연장</div>
                  </div>
                  <button class="pill-toggle on" id="s14-autorenew-toggle"></button>
                </div>
              </div>
              <button class="cta" id="s14-save-btn">저장</button>
              <button class="secondary-btn" data-goto="S6">대시보드로 돌아가기</button>
            </div>
          </section>

          <!-- ====== S14: 자동 출전 한도 ====== -->
          <section class="screen" data-screen="S14">
            <div class="topbar">
              <div data-goto="S6" style="cursor:pointer"><strong>← 자동 출전 한도</strong></div>
              <div>S14</div>
            </div>
            <div class="stack">
              <div class="card">
                <div class="toggle-row">
                  <div>
                    <div style="font-size:14px;font-weight:600">자동 결제 활성화</div>
                    <div class="small muted">AI 에이전트 자동 결제 허용 여부</div>
                  </div>
                  <button class="pill-toggle on" id="s15-enabled-toggle"></button>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">자동 승인 기준</div>
                <div class="settings-section">
                  <div class="setting-row">
                    <div>
                      <div style="font-weight:600;font-size:13px">이하 자동 승인</div>
                      <div class="tiny muted">이 금액 미만은 사용자 확인 없이 처리</div>
                    </div>
                    <span class="setting-chip" id="s15-auto-label">₩50,000</span>
                  </div>
                  <div class="range-wrap">
                    <input type="range" class="range-input" min="0" max="200000" step="10000" value="50000" id="s15-auto-slider"/>
                  </div>
                </div>
                <div class="settings-section">
                  <div class="setting-row">
                    <div>
                      <div style="font-weight:600;font-size:13px">이상 확인 필요</div>
                      <div class="tiny muted">이 금액 초과 시 생체인증 요구</div>
                    </div>
                    <span class="setting-chip" id="s15-confirm-label">₩500,000</span>
                  </div>
                  <div class="range-wrap">
                    <input type="range" class="range-input" min="100000" max="1000000" step="50000" value="500000" id="s15-confirm-slider"/>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">일 한도 캡</div>
                <div class="settings-section">
                  <div class="setting-row">
                    <div>
                      <div style="font-weight:600;font-size:13px">일 자동 처리 한도</div>
                      <div class="tiny muted">하루 동안 자동 처리 가능한 최대 금액</div>
                    </div>
                    <span class="setting-chip" id="s15-daily-label">₩300,000</span>
                  </div>
                  <div class="range-wrap">
                    <input type="range" class="range-input" min="0" max="1000000" step="50000" value="300000" id="s15-daily-slider"/>
                  </div>
                </div>
                <div class="settings-section">
                  <div class="gauge-header"><span class="muted small">오늘 자동 처리 누적</span><span id="s15-today-val">₩0</span></div>
                  <div class="bar" style="margin-top:6px"><div class="fill orange" id="s15-today-fill" style="width:0%"></div></div>
                </div>
              </div>
              <button class="cta" id="s15-save-btn">저장</button>
              <button class="secondary-btn" data-goto="S6">대시보드로 돌아가기</button>
            </div>
          </section>

          <!-- ====== S15: M2M 지갑 설정 ====== -->
          <section class="screen" data-screen="S15">
            <div class="topbar">
              <div data-goto="S6" style="cursor:pointer"><strong>← M2M 지갑 설정</strong></div>
              <div>S15</div>
            </div>
            <div class="stack">
              <div class="card">
                <div class="toggle-row">
                  <div>
                    <div style="font-size:14px;font-weight:600">M2M 결제 활성화</div>
                    <div class="small muted">머신 간 x402 자동 결제 허용</div>
                  </div>
                  <button class="pill-toggle on" id="s16-enabled-toggle"></button>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">지갑 정보</div>
                <div class="settings-section">
                  <div class="setting-row"><span class="small muted">네트워크</span><span class="setting-chip">Base Sepolia</span></div>
                  <div class="m2m-addr" id="s16-wallet-addr">0x1002190240010001x402DemoWallet</div>
                </div>
                <div class="settings-section">
                  <div class="setting-row"><span class="small muted">퍼실리테이터</span></div>
                  <div class="m2m-addr">https://x402.org/facilitator</div>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">결제 한도</div>
                <div class="settings-section">
                  <div class="setting-row">
                    <div>
                      <div style="font-weight:600;font-size:13px">요청 당 최대</div>
                      <div class="tiny muted">단일 M2M 요청에 허용되는 최대 금액</div>
                    </div>
                    <span class="setting-chip" id="s16-per-req">0.05 USDC</span>
                  </div>
                </div>
                <div class="settings-section">
                  <div class="setting-row">
                    <div>
                      <div style="font-weight:600;font-size:13px">세션 한도</div>
                      <div class="tiny muted">한 세션(연결) 동안의 최대 누적 금액</div>
                    </div>
                    <span class="setting-chip" id="s16-session">1.00 USDC</span>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">허용된 AI 에이전트</div>
                <div style="margin-top:12px" id="s16-agents">
                  <div class="agent-chip">
                    <div>
                      <div style="font-weight:600;font-size:13px">ClaudeAssist</div>
                      <div class="tiny muted">0xAI01...c821 · Anthropic 제휴</div>
                    </div>
                    <span class="badge-x402">신뢰 A</span>
                  </div>
                  <div class="agent-chip">
                    <div>
                      <div style="font-weight:600;font-size:13px">GPT Travel</div>
                      <div class="tiny muted">0xAI02...f103 · OpenAI 제휴</div>
                    </div>
                    <span class="badge-x402">신뢰 A</span>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="section-title" style="font-size:15px">API 인증</div>
                <div class="settings-section">
                  <div class="setting-row">
                    <div>
                      <div style="font-weight:600;font-size:13px">x402 API 키</div>
                      <div class="tiny muted">서버 사이드 M2M 결제 서명에 사용</div>
                    </div>
                    <span class="setting-chip" id="s16-apikey">••••••••3f92</span>
                  </div>
                </div>
                <button class="secondary-btn" style="margin-top:12px" id="s16-newkey-btn">새 API 키 발급</button>
              </div>
              <button class="cta" id="s16-save-btn">저장</button>
              <button class="secondary-btn" data-goto="S6">대시보드로 돌아가기</button>
            </div>
          </section>

          <!-- ====== S16: 엔딩 ====== -->
          <section class="screen bank-full" data-screen="S16">
            <div class="screen-wrap hero-center">
              <div class="brand-mark">AI</div>
              <div class="hero-title">AI에게 지갑을 맡기는 시대,<br/>그 지갑을 책임지는 건 은행이다.</div>
              <div class="hero-sub">AI 에이전트 전용 계좌 · Powered by x402</div>
              <button class="ghost" data-goto="S1">처음부터 다시 보기</button>
            </div>
          </section>

          <div class="floating-controls">
            <button class="nav-btn" id="prev-screen-btn">이전</button>
            <button class="nav-btn" id="next-screen-btn">다음</button>
          </div>
        </div>
      </div>
    </section>

    <aside class="right-panel">
      <div class="headline">
        <div class="pill-row">
          <div class="mini-pill">모바일 360 × 780</div>
          <div class="mini-pill">은행 신상품 데모</div>
          <div class="mini-pill">실제 x402 시나리오 연동</div>
        </div>
        <h1 id="screen-headline-title">S0. 인트로</h1>
        <p id="screen-headline-copy">AI에게 지갑을 맡기는 시대에 왜 은행이 필요한지 한 문장으로 못박는 시작 화면입니다. 발표의 톤을 정하고, 이 데모가 단순 결제가 아니라 새로운 금융 제어면을 보여준다는 점을 먼저 전달합니다.</p>
      </div>

      <div class="copy-card">
        <div class="section-title" style="font-size:18px">핵심 컷</div>
        <div class="screen-nav" style="margin-top:12px">
          <button class="small-action" data-goto="S6">S6 대시보드</button>
          <button class="small-action" data-goto="S8">S8 결제 시각화</button>
          <button class="small-action" data-goto="S10">S10 이상거래 차단</button>
          <button class="small-action" data-goto="S12">S12 월간 리포트</button>
          <button class="small-action" data-goto="S13">S13 예산 관리</button>
          <button class="small-action" data-goto="S14">S14 자동 한도</button>
          <button class="small-action" data-goto="S15">S15 M2M 지갑</button>
          <button class="small-action" data-goto="S16">S16 엔딩</button>
        </div>
      </div>

      <div class="runtime-note">
        <div class="section-title" style="font-size:18px">실행 상태</div>
        <div class="stat-grid" style="margin-top:14px">
          <div class="stat">
            <div class="stat-label">현재 화면</div>
            <div class="stat-value" id="current-screen">S0</div>
            <div class="stat-sub">기획서 단계 기준</div>
          </div>
          <div class="stat">
            <div class="stat-label">Agent 설정</div>
            <div class="stat-value" id="agent-state">확인 중</div>
            <div class="stat-sub"><code>/api/settings</code> 연동</div>
          </div>
          <div class="stat">
            <div class="stat-label">지갑 모니터</div>
            <div class="stat-value" id="wallet-state">확인 중</div>
            <div class="stat-sub"><code>/api/free/balances</code> 연동</div>
          </div>
        </div>
      </div>

      <div class="status-card">
        <div class="section-title" style="font-size:18px">현재 연결된 기능</div>
        <div class="status-line"><span><span class="dot on"></span>설정 상태 조회</span><span id="settings-summary">조회 중</span></div>
        <div class="status-line"><span><span class="dot on"></span>온체인 잔고 조회</span><span id="wallet-summary">조회 중</span></div>
        <div class="status-line"><span><span class="dot on"></span>x402 결제 트리거</span><span><code>/api/demo/trigger</code></span></div>
        <div class="status-line"><span><span class="dot on"></span>은행 데모 상태 저장</span><span><code>/api/demo/account</code></span></div>
        <div class="status-line"><span><span class="dot on"></span>이상거래 차단 액션</span><span><code>/api/demo/fraud/reject</code></span></div>
      </div>

      <div class="action-card">
        <div class="section-title" style="font-size:18px">실행 컨트롤</div>
        <p class="screen-subtitle" style="margin-top:6px">아래 버튼은 실제 x402 결제와 데모 상태 반영을 같이 수행합니다. 발표 전에 상태를 초기화할 수도 있습니다.</p>
        <div class="action-row">
          <button class="action-btn" id="trip-proof-btn">출장 결제 실행</button>
          <button class="action-btn alt" id="micro-proof-btn">기사 5건 결제 실행</button>
        </div>
        <div class="action-row" style="margin-top:10px">
          <button class="action-btn alt" id="reset-demo-btn">데모 상태 초기화</button>
        </div>
        <div class="runtime-log" id="runtime-log">대기 중...
실행 결과와 데모 상태 반영 로그가 여기에 표시됩니다.</div>
      </div>

      <div class="action-card">
        <div class="section-title" style="font-size:18px">참고 링크</div>
        <div class="footer-links">
          <a href="/">서버 대시보드</a>
          <a href="/mockups">기존 목업</a>
          <a href="/settings">설정 페이지</a>
          <a href="/api/free/price-list">가격 목록 API</a>
        </div>
      </div>
    </aside>
  </div>

  <script>
    const screens = Array.from(document.querySelectorAll('[data-screen]'));
    const screenIds = screens.map(function (el) { return el.getAttribute('data-screen'); });
    let currentIndex = 0;
    let latestAccount = null;
    let latestReport = null;
    const screenMeta = {
      S0: {
        title: 'S0. 인트로',
        copy: 'AI에게 지갑을 맡기는 시대에 왜 은행이 필요한지 한 문장으로 못박는 시작 화면입니다. 발표의 톤을 정하고, 이 데모가 단순 결제가 아니라 새로운 금융 제어면을 보여준다는 점을 먼저 전달합니다.'
      },
      S1: {
        title: 'S1. 은행 앱 홈',
        copy: '새 앱이 아니라 기존 은행 앱 안에서 신상품이 자연스럽게 노출되는 장면입니다. 경영진에게는 채널 확장보다 상품 확장 관점이 더 중요하다는 메시지를 줍니다.'
      },
      S2: {
        title: 'S2. 상품 소개',
        copy: '위임, 통제, 감사라는 세 가지 핵심 가치를 한 화면에 압축해 보여줍니다. 사용자가 왜 이 상품을 써야 하는지 가장 짧게 설득하는 구간입니다.'
      },
      S3: {
        title: 'S3. 한도와 카테고리 설정',
        copy: 'AI에게 권한을 줘도 통제를 잃지 않는다는 점을 설명하는 핵심 설정 화면입니다. 은행이 기존 FDS와 계좌 제어 역량을 AI 결제 경험 안으로 가져오는 그림을 보여줍니다.'
      },
      S4: {
        title: 'S4. AI 등록',
        copy: '어떤 AI에게 권한을 위임하는지 명시하고, 은행이 검증한 화이트리스트 개념을 보여줍니다. 단순 API 연결이 아니라 제휴와 신뢰사업으로 확장될 수 있는 지점을 드러냅니다.'
      },
      S5: {
        title: 'S5. 개설 완료',
        copy: '가입이 복잡한 금융 상품이 아니라 모바일에서 빠르게 열리는 가벼운 상품이라는 인상을 주는 마무리 화면입니다. 바로 운영 대시보드로 넘어가며 다음 컷을 준비합니다.'
      },
      S6: {
        title: 'S6. AI 계좌 대시보드',
        copy: '한도, 카테고리, 위임 AI, 거래 내역이라는 운영 4축이 한 화면에 모이는 첫 번째 와우 포인트입니다. 상품 운영 관점에서 은행이 어디를 통제하는지 한눈에 보여줍니다.'
      },
      S7: {
        title: 'S7. 외부 AI 요청',
        copy: '외부 AI는 단지 결제 트리거를 보내는 역할이라는 점을 보여줍니다. 결제의 실제 심사와 승인 주체는 계속 은행 앱이라는 구도를 유지합니다.'
      },
      S8: {
        title: 'S8. 검증 · 승인 · 결제',
        copy: '출장 결제 4건이 은행 검증 게이트를 통과하고, 실제 x402 결제가 순차적으로 실행되는 핵심 장면입니다. 사용자 편의는 자동화에서 오고, 신뢰는 은행의 승인 게이트에서 온다는 메시지를 담습니다.'
      },
      S9: {
        title: 'S9. 결제 영수증',
        copy: '자동 결제가 끝난 뒤 결과가 어떻게 정리되고 추적되는지 보여주는 화면입니다. 누가 무엇에 얼마를 썼는지 AI 단위로 태깅되는 감사 가능성이 포인트입니다.'
      },
      S10: {
        title: 'S10. 이상거래 차단',
        copy: 'AI가 잘못된 결제를 시도해도 은행이 마지막 제어권을 가진다는 클라이맥스입니다. 사용자는 자동화의 편의를 누리되, 금융 안전장치는 그대로 유지된다는 점을 가장 강하게 설명합니다.'
      },
      S11: {
        title: 'S11. 콘텐츠 마이크로결제',
        copy: '카드 결제망으로는 비효율적인 초소액 결제를 x402 기반 지갑 결제로 풀어내는 사례입니다. 이 PoC가 단순 결제 자동화가 아니라 새로운 사용자 편의를 보여준다는 점을 증명합니다.'
      },
      S12: {
        title: 'S12. 월간 리포트',
        copy: '결제 데이터가 단순 기록을 넘어 인사이트와 운영 시그널로 바뀌는 장면입니다. 실제 결제 흐름이 쌓이면 어떤 고객 이해와 상품 제안이 가능한지 정리해 보여줍니다.'
      },
      S13: {
        title: 'S13. 카테고리 예산 관리',
        copy: '카테고리별 지출 한도와 알림 임계값을 설정합니다. AI가 교통·숙박·식음료·콘텐츠 각 영역에서 사용 가능한 금액을 은행이 직접 규율합니다. 자동 갱신 옵션으로 월별 예산 관리를 자동화할 수 있습니다.'
      },
      S14: {
        title: 'S14. 자동 출전 한도',
        copy: '소액은 자동 승인하고 고액은 생체인증을 요구하는 이중 구조를 설정합니다. 일 한도 캡으로 하루 동안 AI가 자동 처리할 수 있는 최대 금액을 제어합니다. 편의성과 통제권을 동시에 확보하는 설정 화면입니다.'
      },
      S15: {
        title: 'S15. M2M 지갑 설정',
        copy: '머신 간(M2M) 결제를 위한 x402 프로토콜 지갑을 구성합니다. 허용된 AI 에이전트 화이트리스트, 요청당 USDC 한도, 세션 한도, API 인증 키를 관리합니다. 은행이 B2B 자동 정산 인프라의 신뢰 레이어가 되는 화면입니다.'
      },
      S16: {
        title: 'S16. 엔딩',
        copy: '처음의 메시지를 다시 한 번 반복해 청중 기억에 남기기 위한 마무리 컷입니다. 기술 PoC를 넘어 은행이 가져갈 수 있는 새로운 역할을 슬로건으로 회수합니다.'
      }
    };

    const tripPayments = [
      { merchant: 'RailGo', amount: 88000 },
      { merchant: 'StayMate', amount: 120000 },
      { merchant: 'TableNow', amount: 45000 },
      { merchant: 'RoomFlex', amount: 30000 }
    ];

    function renderScreenMeta(id) {
      const meta = screenMeta[id];
      if (!meta) return;
      document.getElementById('screen-headline-title').textContent = meta.title;
      document.getElementById('screen-headline-copy').textContent = meta.copy;
    }

    function showScreen(id) {
      const nextIndex = screenIds.indexOf(id);
      if (nextIndex < 0) return;
      currentIndex = nextIndex;
      screens.forEach(function (screen) {
        screen.classList.toggle('active', screen.getAttribute('data-screen') === id);
      });
      document.getElementById('current-screen').textContent = id;
      renderScreenMeta(id);
      document.getElementById('prev-screen-btn').disabled = currentIndex === 0;
      document.getElementById('next-screen-btn').disabled = currentIndex === screenIds.length - 1;
      if (id === 'S13') syncBudget().catch(function() {});
      if (id === 'S14') syncAutoCharge().catch(function() {});
      if (id === 'S15') syncM2M().catch(function() {});
    }

    function formatWon(value) {
      return '₩' + value.toLocaleString('ko-KR');
    }

    function updateGauge(category, used, limit) {
      const fill = document.getElementById('gauge-' + category);
      const label = document.getElementById('gauge-' + category + '-label');
      if (!fill || !label) return;
      fill.style.width = Math.min(100, used / limit * 100) + '%';
      label.textContent = used.toLocaleString('ko-KR') + ' / ' + limit.toLocaleString('ko-KR');
    }

    function renderTransactions(targetId, transactions) {
      const target = document.getElementById(targetId);
      if (!target) return;
      if (!transactions.length) {
        target.innerHTML = '아직 거래가 없습니다.';
        return;
      }
      target.innerHTML = transactions.map(function (tx) {
        const status = tx.status === 'blocked' ? '차단' : tx.ai;
        return '<div class="transaction-row"><span>' + tx.merchant + ' · ' + status + '</span><strong>' + formatWon(tx.amountKrw) + '</strong></div>';
      }).join('');
    }

    function renderAccount(account) {
      latestAccount = account;
      document.getElementById('demo-balance').textContent = formatWon(account.balanceKrw);
      document.getElementById('receipt-balance').textContent = formatWon(account.balanceKrw);
      document.getElementById('demo-usage').textContent =
        '월 한도 ' + formatWon(account.monthlyLimitKrw) +
        ' / 사용 ' + formatWon(account.usedKrw) +
        ' (' + ((account.usedKrw / account.monthlyLimitKrw) * 100).toFixed(1) + '%)';
      updateGauge('transport', account.categoryUsage.transport, account.categoryLimits.transport);
      updateGauge('stay', account.categoryUsage.stay, account.categoryLimits.stay);
      updateGauge('food', account.categoryUsage.food, account.categoryLimits.food);
      updateGauge('content', account.categoryUsage.content, account.categoryLimits.content);
      renderTransactions('recent-transactions', account.transactions.slice(0, 6));
      renderTransactions('receipt-transactions', account.transactions.filter(function (tx) {
        return tx.status === 'approved';
      }).slice(0, 6));
    }

    function renderReport(report) {
      latestReport = report;
      document.getElementById('report-total').textContent =
        report.totalTransactions + '건 / ' + formatWon(report.totalAmountKrw);
      document.getElementById('report-merchants').textContent = report.merchantCount + '곳';
      document.getElementById('report-protection').textContent =
        formatWon(report.preventedLossKrw) + ' 손실 방지';
      document.getElementById('report-mix').innerHTML = report.categoryMix.map(function (item) {
        return '<div class="report-chip">' + item.category + ' ' + item.percentage + '%</div>';
      }).join('');
      document.getElementById('report-insights').innerHTML = report.insights.map(function (text, index) {
        return '<div class="report-row"><span>' + text + '</span><span>' + (index === 0 ? '인사이트' : '신호') + '</span></div>';
      }).join('');
    }

    async function syncDemoState() {
      const accountRes = await fetch('/api/demo/account');
      const account = await accountRes.json();
      renderAccount(account);

      const reportRes = await fetch('/api/demo/report');
      const report = await reportRes.json();
      renderReport(report);
    }

    async function loadRuntime() {
      try {
        const settingsRes = await fetch('/api/settings');
        const settings = await settingsRes.json();
        const agentOk = settings.agentPrivateKey && settings.agentPrivateKey.isSet;
        document.getElementById('agent-state').textContent = agentOk ? '준비됨' : '미설정';
        document.getElementById('settings-summary').textContent = agentOk ? 'Agent 키 설정됨' : 'Agent 키 필요';
      } catch (_err) {
        document.getElementById('agent-state').textContent = '오류';
        document.getElementById('settings-summary').textContent = '조회 실패';
      }

      try {
        const walletRes = await fetch('/api/free/balances');
        const walletData = await walletRes.json();
        if (walletRes.ok && walletData.wallets) {
          document.getElementById('wallet-state').textContent = walletData.wallets.length + '개';
          document.getElementById('wallet-summary').textContent = walletData.wallets.length ? '잔고 조회 가능' : '지갑 미설정';
        } else {
          document.getElementById('wallet-state').textContent = '오류';
          document.getElementById('wallet-summary').textContent = walletData.error || '조회 실패';
        }
      } catch (_err) {
        document.getElementById('wallet-state').textContent = '오류';
        document.getElementById('wallet-summary').textContent = '조회 실패';
      }

      try {
        await syncDemoState();
      } catch (_err) {
        document.getElementById('runtime-log').textContent = '데모 상태 조회 실패';
      }
    }

    async function runProof(url, label) {
      const log = document.getElementById('runtime-log');
      const buttons = [
        document.getElementById('trip-proof-btn'),
        document.getElementById('micro-proof-btn'),
        document.getElementById('simulate-payment-btn'),
        document.getElementById('run-micro-btn'),
        document.getElementById('reset-demo-btn')
      ];
      buttons.forEach(function (btn) { btn.disabled = true; });
      log.textContent = '[' + label + '] 호출 중...';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok) {
          log.textContent = '[' + label + '] 실패\\n' + JSON.stringify(data, null, 2);
          return;
        }
        if (data.account) {
          renderAccount(data.account);
        } else {
          await syncDemoState();
        }
        if (data.report) {
          renderReport(data.report);
        } else {
          const reportRes = await fetch('/api/demo/report');
          renderReport(await reportRes.json());
        }
        const summary = data.steps
          ? data.steps.map(function (step) {
              return '- ' + step.merchant + ' · ' + step.usdcPrice + ' USDC · ' + step.elapsedMs + 'ms';
            }).join('\\n')
          : JSON.stringify(data, null, 2);
        log.textContent = '[' + label + '] 성공\\n' + summary;
      } catch (err) {
        log.textContent = '[' + label + '] 오류\\n' + err.message;
      } finally {
        buttons.forEach(function (btn) { btn.disabled = false; });
      }
    }

    function resetPaymentScene() {
      Array.from(document.querySelectorAll('[data-request]')).forEach(function (el) {
        el.className = 'request-card';
      });
      Array.from(document.querySelectorAll('[data-merchant]')).forEach(function (el) {
        el.className = 'merchant-node';
        el.textContent = el.textContent.replace('결제 완료', '결제 대기');
      });
      Array.from(document.querySelectorAll('[data-verify]')).forEach(function (el) {
        el.className = 'verify-item';
        el.querySelector('span:last-child').textContent = '대기';
      });
      document.getElementById('verify-gate').classList.remove('pulse');
      document.getElementById('payment-timer').textContent = '0.0s';
    }

    async function simulatePayments() {
      resetPaymentScene();
      let ms = 0;
      const timerEl = document.getElementById('payment-timer');
      const timer = setInterval(function () {
        ms += 100;
        timerEl.textContent = (ms / 1000).toFixed(1) + 's';
      }, 100);

      Array.from(document.querySelectorAll('[data-request]')).forEach(function (el) {
        el.classList.add('pending');
      });

      [0, 1, 2].forEach(function (idx) {
        setTimeout(function () {
          const row = document.querySelector('[data-verify="' + idx + '"]');
          row.classList.add('pass');
          row.querySelector('span:last-child').textContent = '통과';
        }, 300 + idx * 180);
      });

      setTimeout(function () {
        document.getElementById('verify-gate').classList.add('pulse');
      }, 920);

      tripPayments.forEach(function (payment, idx) {
        setTimeout(function () {
          const req = document.querySelector('[data-request="' + idx + '"]');
          const merchant = document.querySelector('[data-merchant="' + idx + '"]');
          req.classList.add('done');
          merchant.classList.add('done');
          merchant.textContent = payment.merchant + ' 결제 완료';
        }, 1300 + idx * 320);
      });

      try {
        const res = await fetch('/api/demo/trip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || '결제 실패');
        }
        renderAccount(data.account);
        const reportRes = await fetch('/api/demo/report');
        renderReport(await reportRes.json());
        document.getElementById('runtime-log').textContent =
          '[출장 결제 실행] 성공\\n' +
          data.steps.map(function (step) {
            return '- ' + step.merchant + ' · ' + step.usdcPrice + ' USDC · ' + step.elapsedMs + 'ms';
          }).join('\\n');
      } catch (err) {
        clearInterval(timer);
        document.getElementById('runtime-log').textContent = '[출장 결제 실행] 오류\\n' + err.message;
        return;
      }

      setTimeout(function () {
        clearInterval(timer);
        timerEl.textContent = '2.8s';
        if (latestAccount) {
          renderAccount(latestAccount);
        }
      }, 2800);
    }

    // ── S13: 카테고리 예산 sync ──────────────────────────────
    async function syncBudget() {
      const [budgetRes, accountRes] = await Promise.all([
        fetch('/api/demo/budget'),
        fetch('/api/demo/account')
      ]);
      const budget = await budgetRes.json();
      const account = await accountRes.json();
      document.getElementById('s14-total').textContent = formatWon(budget.monthlyTotal);
      const used = account.usedKrw;
      document.getElementById('s14-used-text').textContent =
        '사용 ' + formatWon(used) + ' · 잔여 ' + formatWon(Math.max(0, budget.monthlyTotal - used));
      var catMap = { transport: 'transport', stay: 'stay', food: 'food', content: 'content' };
      Object.keys(catMap).forEach(function (key) {
        var limit = account.categoryLimits[key] || 0;
        var usage = account.categoryUsage[key] || 0;
        var fill  = document.getElementById('s14-' + key + '-fill');
        var val   = document.getElementById('s14-' + key + '-val');
        if (fill) fill.style.width = (limit ? Math.min(100, (usage / limit) * 100) : 0) + '%';
        if (val)  val.textContent  = usage.toLocaleString('ko-KR') + ' / ' + limit.toLocaleString('ko-KR');
      });
    }

    // ── S14: 자동 출전 한도 sync ─────────────────────────────
    async function syncAutoCharge() {
      const [acRes, accountRes] = await Promise.all([
        fetch('/api/demo/autocharge'),
        fetch('/api/demo/account')
      ]);
      const ac = await acRes.json();
      const account = await accountRes.json();
      document.getElementById('s15-auto-slider').value    = ac.autoApproveUnder;
      document.getElementById('s15-confirm-slider').value = ac.confirmRequiredOver;
      document.getElementById('s15-daily-slider').value   = ac.dailyCap;
      document.getElementById('s15-auto-label').textContent    = formatWon(ac.autoApproveUnder);
      document.getElementById('s15-confirm-label').textContent = formatWon(ac.confirmRequiredOver);
      document.getElementById('s15-daily-label').textContent   = formatWon(ac.dailyCap);
      var today = account.usedKrw;
      document.getElementById('s15-today-val').textContent = formatWon(today);
      var todayFill = document.getElementById('s15-today-fill');
      if (todayFill) todayFill.style.width = (ac.dailyCap ? Math.min(100, (today / ac.dailyCap) * 100) : 0) + '%';
    }

    // ── S15: M2M 지갑 sync ───────────────────────────────────
    async function syncM2M() {
      const res = await fetch('/api/demo/m2m');
      const cfg = await res.json();
      var addr = document.getElementById('s16-wallet-addr');
      if (addr) addr.textContent = cfg.walletAddress;
      var perReq = document.getElementById('s16-per-req');
      if (perReq) perReq.textContent = cfg.perRequestLimitUsdc + ' USDC';
      var session = document.getElementById('s16-session');
      if (session) session.textContent = cfg.sessionLimitUsdc.toFixed(2) + ' USDC';
      var agentsEl = document.getElementById('s16-agents');
      if (agentsEl && cfg.whitelistedAgents) {
        agentsEl.innerHTML = cfg.whitelistedAgents.map(function (a) {
          return '<div class="agent-chip"><div><div style="font-weight:600;font-size:13px">' + a.name +
                 '</div><div class="tiny muted">' + a.address + '</div></div>' +
                 '<span class="badge-x402">신뢰 ' + a.trustGrade + '</span></div>';
        }).join('');
      }
      var toggle = document.getElementById('s16-enabled-toggle');
      if (toggle) toggle.classList.toggle('on', cfg.enabled);
    }

    document.querySelectorAll('[data-goto]').forEach(function (button) {
      button.addEventListener('click', function () {
        const target = button.getAttribute('data-goto');
        if (target) showScreen(target);
      });
    });

    document.getElementById('prev-screen-btn').addEventListener('click', function () {
      if (currentIndex > 0) showScreen(screenIds[currentIndex - 1]);
    });

    document.getElementById('next-screen-btn').addEventListener('click', function () {
      if (currentIndex < screenIds.length - 1) showScreen(screenIds[currentIndex + 1]);
    });

    document.getElementById('simulate-payment-btn').addEventListener('click', simulatePayments);
    document.getElementById('reject-btn').addEventListener('click', async function () {
      const res = await fetch('/api/demo/fraud/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        renderAccount(data.account);
        renderReport(data.report);
        document.getElementById('reject-toast').classList.add('show');
        document.getElementById('runtime-log').textContent =
          '[이상거래 차단] 성공\\n- Offshore Merchant · 차단 · ' + formatWon(data.transaction.amountKrw);
      }
    });
    document.getElementById('trip-proof-btn').addEventListener('click', function () {
      runProof('/api/demo/trip', '출장 결제 실행');
    });
    document.getElementById('micro-proof-btn').addEventListener('click', function () {
      runProof('/api/demo/micropayment', '기사 5건 결제 실행');
    });
    document.getElementById('run-micro-btn').addEventListener('click', function () {
      runProof('/api/demo/micropayment', '기사 5건 결제 실행');
    });
    document.getElementById('reset-demo-btn').addEventListener('click', async function () {
      const res = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        renderAccount(data.state);
        const reportRes = await fetch('/api/demo/report');
        renderReport(await reportRes.json());
        resetPaymentScene();
        document.getElementById('runtime-log').textContent = '[데모 초기화] 완료';
      }
    });

    // ── S13 이벤트 ───────────────────────────────────────────
    document.getElementById('s14-autorenew-toggle').addEventListener('click', function () {
      this.classList.toggle('on');
      var badge = document.getElementById('s14-renew-badge');
      if (badge) badge.textContent = this.classList.contains('on') ? '자동 갱신 ON' : '자동 갱신 OFF';
    });
    document.getElementById('s14-save-btn').addEventListener('click', async function () {
      var autoRenew = document.getElementById('s14-autorenew-toggle').classList.contains('on');
      await fetch('/api/demo/budget', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoRenew: autoRenew })
      });
      showScreen('S6');
    });

    // ── S14 이벤트 ───────────────────────────────────────────
    function wireSlider(sliderId, labelId) {
      var slider = document.getElementById(sliderId);
      var label  = document.getElementById(labelId);
      if (!slider || !label) return;
      slider.addEventListener('input', function () {
        label.textContent = formatWon(Number(slider.value));
      });
    }
    wireSlider('s15-auto-slider',    's15-auto-label');
    wireSlider('s15-confirm-slider', 's15-confirm-label');
    wireSlider('s15-daily-slider',   's15-daily-label');

    document.getElementById('s15-enabled-toggle').addEventListener('click', function () {
      this.classList.toggle('on');
    });
    document.getElementById('s15-save-btn').addEventListener('click', async function () {
      var body = {
        enabled:             document.getElementById('s15-enabled-toggle').classList.contains('on'),
        autoApproveUnder:    Number(document.getElementById('s15-auto-slider').value),
        confirmRequiredOver: Number(document.getElementById('s15-confirm-slider').value),
        dailyCap:            Number(document.getElementById('s15-daily-slider').value)
      };
      await fetch('/api/demo/autocharge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      showScreen('S6');
    });

    // ── S15 이벤트 ───────────────────────────────────────────
    document.getElementById('s16-enabled-toggle').addEventListener('click', function () {
      this.classList.toggle('on');
    });
    document.getElementById('s16-newkey-btn').addEventListener('click', function () {
      var suffix = Math.random().toString(36).slice(2, 6);
      var el = document.getElementById('s16-apikey');
      if (el) el.textContent = '••••••••' + suffix;
    });
    document.getElementById('s16-save-btn').addEventListener('click', async function () {
      var enabled = document.getElementById('s16-enabled-toggle').classList.contains('on');
      await fetch('/api/demo/m2m', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: enabled })
      });
      showScreen('S6');
    });

    setTimeout(function () {
      if (currentIndex === 0) showScreen('S1');
    }, 1500);

    loadRuntime();
    showScreen('S0');
  </script>
</body>
</html>`;
}
