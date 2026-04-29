import { Router } from "express";
import type {
  PaidRoute,
  HealthResponse,
  PriceListResponse,
  DemoScenarioStep,
} from "../types/index.js";
import { config, getAgentPrivateKey, getServerWalletAddress } from "../config/index.js";
import { settingsStore } from "../config/settings.js";
import { getBankDemoHtml } from "./bankDemo.js";
import { demoStateStore, budgetStore, autoChargeStore, m2mWalletStore } from "./demoState.js";

const router = Router();

// ============================================================
// 유료 API 라우트 정의
// ============================================================

export const PAID_ROUTES: PaidRoute[] = [
  {
    path: "/api/premium/summary",
    price: "0.01",
    description: "AI 생성 텍스트 요약",
  },
  {
    path: "/api/premium/analysis",
    price: "0.05",
    description: "심층 데이터 분석",
  },
  {
    path: "/api/premium/report",
    price: "0.10",
    description: "종합 보고서 생성",
  },
  {
    path: "/api/premium/trip/railgo",
    price: "0.01",
    description: "출장 교통 결제 - RailGo",
  },
  {
    path: "/api/premium/trip/staymate",
    price: "0.01",
    description: "출장 숙박 결제 - StayMate",
  },
  {
    path: "/api/premium/trip/tablenow",
    price: "0.01",
    description: "출장 식음료 결제 - TableNow",
  },
  {
    path: "/api/premium/trip/roomflex",
    price: "0.01",
    description: "출장 미팅룸 결제 - RoomFlex",
  },
  {
    path: "/api/premium/content/brief-1",
    price: "0.005",
    description: "콘텐츠 마이크로결제 - Brief 1",
  },
  {
    path: "/api/premium/content/brief-2",
    price: "0.005",
    description: "콘텐츠 마이크로결제 - Brief 2",
  },
  {
    path: "/api/premium/content/brief-3",
    price: "0.005",
    description: "콘텐츠 마이크로결제 - Brief 3",
  },
  {
    path: "/api/premium/content/brief-4",
    price: "0.005",
    description: "콘텐츠 마이크로결제 - Brief 4",
  },
  {
    path: "/api/premium/content/brief-5",
    price: "0.005",
    description: "콘텐츠 마이크로결제 - Brief 5",
  },
];

// ============================================================
// 대시보드 (루트)
// ============================================================

router.get("/", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>x402 Payment Server</title>
  <style>
    body { font-family: monospace; max-width: 720px; margin: 48px auto; padding: 0 24px; color: #1a1a1a; }
    h1 { font-size: 1.4rem; border-bottom: 2px solid #000; padding-bottom: 8px; }
    h2 { font-size: 1rem; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 8px 12px; border: 1px solid #ddd; font-size: 0.9rem; }
    th { background: #f5f5f5; }
    .badge-free { color: #16a34a; font-weight: bold; }
    .badge-paid { color: #dc2626; font-weight: bold; }
    .meta { color: #555; font-size: 0.85rem; margin-top: 4px; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <h1>x402 Payment Server</h1>
  <p class="meta">
    Chain: <strong>${config.chain.name}</strong> (ID: ${config.chain.id}) &nbsp;|&nbsp;
    Facilitator: <a href="${config.facilitator.url}" target="_blank">${config.facilitator.url}</a><br/>
    Recipient: <code>${config.server.walletAddress}</code>
  </p>

  <h2>Paid Endpoints</h2>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Price</th><th>Description</th></tr></thead>
    <tbody>
      ${PAID_ROUTES.map((r) => `
      <tr>
        <td>GET</td>
        <td><a href="${r.path}">${r.path}</a></td>
        <td class="badge-paid">${r.price} USDC</td>
        <td>${r.description}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>Free Endpoints</h2>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>GET</td><td><a href="/api/free/health">/api/free/health</a></td><td class="badge-free">서버 상태 확인</td></tr>
      <tr><td>GET</td><td><a href="/api/free/price-list">/api/free/price-list</a></td><td class="badge-free">유료 API 가격 목록</td></tr>
    </tbody>
  </table>

  <h2>Use Case Mockups</h2>
  <p class="meta">x402 프로토콜 활용 시나리오 시뮬레이션 &rarr; <a href="/mockups">목업 대시보드 열기</a></p>

  <h2>Bank Demo</h2>
  <p class="meta">은행 신상품 시연용 모바일 데모 &rarr; <a href="/bank-demo">AI 에이전트 전용 계좌 데모 열기</a></p>

  <h2>Configuration</h2>
  <p class="meta">Agent 지갑 및 서버 지갑 설정 &rarr; <a href="/settings">⚙️ Settings 열기</a></p>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// ============================================================
// 목업 대시보드
// ============================================================

router.get("/mockups", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>x402 Use Case Mockups</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8f9fa; color: #1a1a1a; display: flex; min-height: 100vh; }

    /* Sidebar */
    .sidebar { width: 220px; height: 100vh; background: #111; color: #eee; padding: 24px 0 0; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; overflow-y: auto; }
    .sidebar-title { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; color: #888; padding: 0 20px 16px; text-transform: uppercase; border-bottom: 1px solid #222; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 20px; cursor: pointer; font-size: 0.83rem; color: #aaa; transition: all 0.15s; border-left: 3px solid transparent; }
    .nav-item:hover { color: #fff; background: #1a1a1a; }
    .nav-item.active { color: #fff; background: #1a1a1a; border-left-color: #6366f1; }
    .nav-item .icon { font-size: 1.1rem; width: 20px; text-align: center; }
    .nav-back { font-size: 0.75rem; color: #555; padding: 20px 20px 0; display: block; text-decoration: none; }
    .nav-back:hover { color: #888; }

    /* Main */
    .main { margin-left: 220px; flex: 1; padding: 40px 48px; max-width: 960px; }
    .page { display: none; }
    .page.active { display: block; }

    /* Scenario header */
    .scenario-header { margin-bottom: 28px; }
    .scenario-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; background: #ede9fe; color: #6d28d9; padding: 4px 10px; border-radius: 20px; margin-bottom: 10px; }
    .scenario-header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 6px; }
    .scenario-header p { color: #555; font-size: 0.9rem; line-height: 1.6; }

    /* Flow diagram */
    .flow { display: flex; align-items: center; gap: 0; margin: 24px 0; font-size: 0.78rem; }
    .flow-node { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; text-align: center; white-space: nowrap; }
    .flow-node.highlight { background: #6366f1; color: #fff; border-color: #6366f1; }
    .flow-node.money { background: #d1fae5; border-color: #6ee7b7; color: #065f46; }
    .flow-arrow { flex: 1; min-width: 20px; display: flex; align-items: center; justify-content: center; position: relative; }
    .flow-arrow::before { content: ""; position: absolute; left: 4px; right: 4px; height: 1px; background: #cbd5e1; }
    .flow-arrow::after { content: "▶"; color: #94a3b8; font-size: 0.65rem; position: relative; z-index: 1; background: #f8f9fa; padding: 0 2px; }
    .flow-label { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); white-space: nowrap; color: #6366f1; font-size: 0.68rem; font-weight: 600; }

    /* Mockup cards */
    .mockup-area { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .mockup-bar { background: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 10px 16px; display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #64748b; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-r { background: #f87171; }
    .dot-y { background: #fbbf24; }
    .dot-g { background: #34d399; }
    .mockup-url { flex: 1; background: #e2e8f0; border-radius: 4px; padding: 3px 10px; font-size: 0.72rem; font-family: monospace; margin-left: 8px; }
    .mockup-body { padding: 24px; }

    /* Article scenario */
    .article-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; line-height: 1.4; }
    .article-meta { font-size: 0.78rem; color: #888; margin-bottom: 16px; }
    .article-preview { font-size: 0.9rem; line-height: 1.7; color: #333; margin-bottom: 16px; }
    .article-blur { position: relative; overflow: hidden; }
    .article-blur .text { font-size: 0.9rem; line-height: 1.7; color: #333; filter: blur(4px); user-select: none; }
    .paywall { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.98) 40%); }
    .paywall-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 28px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .paywall-price { font-size: 1.8rem; font-weight: 800; color: #6366f1; }
    .paywall-sub { font-size: 0.8rem; color: #888; margin: 4px 0 16px; }

    /* API scenario */
    .terminal { background: #0f172a; border-radius: 8px; padding: 16px 20px; font-family: monospace; font-size: 0.82rem; color: #e2e8f0; line-height: 1.8; }
    .t-comment { color: #64748b; }
    .t-green { color: #4ade80; }
    .t-yellow { color: #fbbf24; }
    .t-red { color: #f87171; }
    .t-blue { color: #60a5fa; }
    .t-purple { color: #c084fc; }

    /* Gauge */
    .gauge-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .gauge-card { flex: 1; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .gauge-label { font-size: 0.72rem; color: #888; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .gauge-value { font-size: 1.4rem; font-weight: 700; }
    .gauge-value.green { color: #059669; }
    .gauge-value.red { color: #dc2626; }
    .gauge-value.purple { color: #7c3aed; }
    .gauge-bar { height: 4px; border-radius: 2px; background: #e2e8f0; margin-top: 8px; overflow: hidden; }
    .gauge-fill { height: 100%; border-radius: 2px; transition: width 0.8s ease; }

    /* IoT grid */
    .sensor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .sensor-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
    .sensor-card.locked { opacity: 0.5; position: relative; }
    .sensor-name { font-size: 0.72rem; color: #888; margin-bottom: 4px; }
    .sensor-val { font-size: 1.3rem; font-weight: 700; }
    .sensor-price { font-size: 0.68rem; color: #6366f1; margin-top: 4px; }
    .lock-icon { position: absolute; top: 8px; right: 8px; font-size: 0.9rem; }

    /* Email composer */
    .email-form { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .email-row { display: flex; align-items: center; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; }
    .email-label { width: 60px; color: #888; font-size: 0.78rem; }
    .email-input { flex: 1; color: #333; }
    .email-body-area { padding: 16px; font-size: 0.85rem; color: #555; line-height: 1.6; min-height: 80px; }
    .email-footer { background: #f8f9fa; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; }
    .cost-badge { background: #fef3c7; color: #92400e; border-radius: 6px; padding: 4px 10px; font-weight: 600; }

    /* Queue */
    .queue-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .queue-item { display: flex; align-items: center; gap: 12px; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 0.85rem; }
    .queue-pos { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
    .queue-pos.vip { background: #fef9c3; color: #854d0e; border: 2px solid #fde68a; }
    .queue-pos.normal { background: #f1f5f9; color: #64748b; }
    .queue-eta { margin-left: auto; font-size: 0.75rem; color: #888; }
    .queue-item.you { border-color: #6366f1; background: #eef2ff; }

    /* GPU scenario */
    .gpu-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .spec-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
    .spec-label { font-size: 0.72rem; color: #888; margin-bottom: 4px; }
    .spec-value { font-size: 0.95rem; font-weight: 600; }

    /* Buttons */
    .btn { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; padding: 10px 20px; transition: all 0.15s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-primary:disabled { background: #a5b4fc; cursor: not-allowed; }
    .btn-success { background: #059669; color: #fff; }
    .btn-outline { background: #fff; color: #6366f1; border: 1.5px solid #6366f1; }
    .btn-outline:hover { background: #eef2ff; }

    /* Status / Response */
    .status-bar { border-radius: 8px; padding: 12px 16px; font-size: 0.82rem; font-family: monospace; margin-top: 12px; display: none; }
    .status-bar.show { display: block; }
    .status-402 { background: #fef9c3; border: 1px solid #fde68a; color: #92400e; }
    .status-200 { background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; }
    .status-paying { background: #ede9fe; border: 1px solid #c4b5fd; color: #5b21b6; }

    /* Tags */
    .tag { display: inline-block; font-size: 0.68rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
    .tag-free { background: #d1fae5; color: #065f46; }
    .tag-paid { background: #fee2e2; color: #991b1b; }
    .tag-vip { background: #fef9c3; color: #854d0e; }

    /* Divider */
    .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }

    /* Payment result panel */
    .payment-result { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin-top: 14px; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
    .res-header { font-family: monospace; font-size: 0.78rem; color: #065f46; font-weight: 600; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #d1fae5; }
    .res-field { display: flex; gap: 8px; margin-bottom: 4px; font-size: 0.85rem; }
    .res-key { color: #888; min-width: 80px; font-size: 0.78rem; }
    .res-val { color: #1a1a1a; font-weight: 500; }
    .res-section { margin-bottom: 10px; }
    .res-section strong { font-size: 0.82rem; display: block; color: #333; margin-bottom: 2px; }
    .res-section p { font-size: 0.82rem; color: #555; margin: 0; }
    .res-metrics { display: flex; gap: 16px; margin-top: 8px; }
    .res-metric { font-size: 0.75rem; color: #888; }
    .res-metric span { color: #059669; font-weight: 600; }
    .payment-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; margin-top: 14px; font-size: 0.83rem; color: #991b1b; font-family: monospace; }

    /* Wallet Widget */
    .sidebar-nav { flex: 1; }
    .wallet-widget { padding: 14px 16px; border-top: 1px solid #1e1e1e; }
    .widget-title { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #444; margin-bottom: 10px; }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex-shrink: 0; animation: livepulse 2s infinite; }
    .live-dot.error { background: #ef4444; animation: none; }
    .live-dot.loading { background: #f59e0b; animation: none; }
    @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .wallet-card { background: #1a1a1a; border-radius: 6px; padding: 10px 12px; margin-bottom: 7px; }
    .wallet-role { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; margin-bottom: 2px; }
    .wallet-role.payer { color: #f87171; }
    .wallet-role.receiver { color: #34d399; }
    .wallet-addr { font-family: monospace; font-size: 0.65rem; color: #444; margin-bottom: 6px; display: block; text-decoration: none; }
    .wallet-addr:hover { color: #6b7280; }
    .wallet-usdc { font-size: 1rem; font-weight: 700; color: #e2e8f0; line-height: 1.2; }
    .wallet-usdc .unit { font-size: 0.62rem; font-weight: 400; color: #555; margin-left: 3px; }
    .wallet-eth { font-size: 0.65rem; color: #374151; margin-top: 3px; }
    .wallet-delta { font-size: 0.65rem; margin-left: 4px; font-weight: 600; }
    .wallet-delta.up { color: #4ade80; }
    .wallet-delta.down { color: #f87171; }
    .widget-updated { font-size: 0.6rem; color: #2a2a2a; text-align: right; margin-top: 2px; }
    .widget-placeholder { color: #333; font-size: 0.72rem; text-align: center; padding: 10px 0; }
    .widget-error { font-size: 0.7rem; color: #f87171; text-align: center; padding: 8px; }

    /* Responsive */
    @media (max-width: 700px) {
      .sidebar { width: 180px; }
      .main { margin-left: 180px; padding: 24px; }
      .sensor-grid { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>

<!-- Sidebar -->
<nav class="sidebar">
  <a href="/" class="nav-back">← 서버 대시보드</a>
  <div style="height:20px"></div>
  <div class="sidebar-nav">
    <div class="sidebar-title">x402 Use Cases</div>
    <div class="nav-item active" onclick="showPage('article')" id="nav-article">
      <span class="icon">📰</span> 기사 단건 결제
    </div>
    <div class="nav-item" onclick="showPage('crawler')" id="nav-crawler">
      <span class="icon">🤖</span> 크롤러 수익화
    </div>
    <div class="nav-item" onclick="showPage('antispam')" id="nav-antispam">
      <span class="icon">🛡️</span> 스팸 방지
    </div>
    <div class="nav-item" onclick="showPage('gpu')" id="nav-gpu">
      <span class="icon">⚡</span> GPU 스팟 마켓
    </div>
    <div class="nav-item" onclick="showPage('iot')" id="nav-iot">
      <span class="icon">📡</span> IoT 데이터 마켓
    </div>
    <div class="nav-item" onclick="showPage('queue')" id="nav-queue">
      <span class="icon">🎯</span> 우선순위 큐
    </div>
    <div style="height:1px;background:#1e1e1e;margin:8px 0"></div>
    <a href="/settings" style="display:flex;align-items:center;gap:10px;padding:11px 20px;font-size:0.83rem;color:#666;text-decoration:none;transition:color 0.15s" onmouseover="this.style.color='#aaa'" onmouseout="this.style.color='#666'">
      <span style="width:20px;text-align:center">⚙️</span> Settings
    </a>
  </div>

  <!-- Wallet balance widget -->
  <div class="wallet-widget">
    <div class="widget-title">
      <span class="live-dot loading" id="live-dot"></span>
      Wallet Monitor
    </div>
    <div id="wallet-cards"><div class="widget-placeholder">조회 중...</div></div>
    <div class="widget-updated" id="widget-updated"></div>
  </div>
</nav>

<!-- Main content -->
<main class="main">

  <!-- ====================================================== -->
  <!-- 1. 기사 단건 결제 -->
  <!-- ====================================================== -->
  <div class="page active" id="page-article">
    <div class="scenario-header">
      <div class="scenario-badge">📰 Scenario 1</div>
      <h1>기사 단건 결제 (Article Paywall)</h1>
      <p>구독 없이, 신용카드 등록 없이 — 읽고 싶은 기사 한 편을 지갑 서명 한 번으로 즉시 구매합니다.</p>
    </div>

    <div class="flow">
      <div class="flow-node">독자 브라우저</div>
      <div class="flow-arrow"><span class="flow-label">GET /articles/123</span></div>
      <div class="flow-node highlight">뉴스 서버</div>
      <div class="flow-arrow"><span class="flow-label">402 + price</span></div>
      <div class="flow-node">지갑 서명</div>
      <div class="flow-arrow"><span class="flow-label">X-PAYMENT 헤더</span></div>
      <div class="flow-node money">기사 전문</div>
    </div>

    <div class="mockup-area">
      <div class="mockup-bar">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="mockup-url">https://daily-news.example.com/articles/ai-future-2026</span>
      </div>
      <div class="mockup-body">
        <div class="article-meta">2026.04.23 · Technology · 5 min read</div>
        <div class="article-title">AI가 바꾸는 결제의 미래 — 계좌 없이 거래하는 세상</div>
        <div class="article-preview">
          x402 프로토콜이 등장하면서 인터넷의 결제 방식이 근본적으로 바뀌고 있다.
          기존 구독 모델의 한계를 넘어, 사용한 만큼만 지불하는 per-request 경제가
          현실화되고 있다. 특히 주목할 점은...
        </div>
        <div class="article-blur">
          <div class="text">
            이 섹션에는 기사의 핵심 내용이 담겨 있습니다. AI 에이전트와 인간 독자 모두
            동일한 결제 프로토콜을 사용해 콘텐츠에 접근합니다. 블록체인 기반 마이크로
            페이먼트가 실현되면서 기존에는 수익화가 불가능했던 초단위 콘텐츠 소비도
            가능해졌습니다. 광고 없이, 구독 없이, 읽은 만큼만 지불하는 새로운 미디어
            생태계가 형성되고 있습니다. 독자는 한 달에 500원짜리 기사 하나를 위해
            월 만 원짜리 구독을 할 필요가 없어집니다.
          </div>
          <div class="paywall">
            <div class="paywall-box">
              <div style="font-size:1.4rem;margin-bottom:6px">🔒</div>
              <div class="paywall-price">$0.02 USDC</div>
              <div class="paywall-sub">이 기사를 읽으려면 결제가 필요합니다<br/>구독 불필요 · 계정 불필요</div>
              <button class="btn btn-primary" id="article-pay-btn" onclick="triggerPayment('article')">
                지갑으로 결제하기
              </button>
              <div class="status-bar status-402" id="article-status-402">
                HTTP/1.1 402 Payment Required<br/>
                X-PAYMENT-REQUIRED: exact,USDC,$0.01,base-sepolia
              </div>
              <div class="status-bar status-paying" id="article-status-paying">
                ⏳ Agent 지갑 서명 중... X-PAYMENT 헤더 전송
              </div>
              <div class="status-bar status-200" id="article-status-200">
                ✅ HTTP/1.1 200 OK — 결제 완료, 콘텐츠 반환됨
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p style="font-size:0.8rem;color:#888">
      💡 <strong>핵심 차별점:</strong> 신용카드 등록 없이 USDC 지갑만으로 즉시 결제.
      구독 약정 없이 읽은 기사당 과금. AI 크롤러도 동일 흐름으로 자동 결제 가능.
    </p>
    <div id="article-result"></div>
  </div>

  <!-- ====================================================== -->
  <!-- 2. 크롤러 수익화 -->
  <!-- ====================================================== -->
  <div class="page" id="page-crawler">
    <div class="scenario-header">
      <div class="scenario-badge">🤖 Scenario 2</div>
      <h1>크롤러 수익화 (Crawler Monetization)</h1>
      <p>웹사이트가 봇의 접근을 막는 대신, 접근 요금을 받습니다. robots.txt 대신 x402 헤더로 가격을 명시합니다.</p>
    </div>

    <div class="flow">
      <div class="flow-node">AI 크롤러</div>
      <div class="flow-arrow"><span class="flow-label">GET /sitemap</span></div>
      <div class="flow-node highlight">콘텐츠 서버</div>
      <div class="flow-arrow"><span class="flow-label">402 per-page</span></div>
      <div class="flow-node money">자동 결제</div>
      <div class="flow-arrow"><span class="flow-label">HTML 반환</span></div>
      <div class="flow-node">학습 데이터</div>
    </div>

    <div class="mockup-area">
      <div class="mockup-bar">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="mockup-url">site-admin.example.com / 크롤러 접근 현황</span>
      </div>
      <div class="mockup-body">
        <div class="gauge-row">
          <div class="gauge-card">
            <div class="gauge-label">오늘 크롤러 요청</div>
            <div class="gauge-value purple">14,832</div>
            <div class="gauge-bar"><div class="gauge-fill" style="width:74%;background:#818cf8"></div></div>
          </div>
          <div class="gauge-card">
            <div class="gauge-label">결제 완료 (200 OK)</div>
            <div class="gauge-value green">12,401</div>
            <div class="gauge-bar"><div class="gauge-fill" style="width:84%;background:#34d399"></div></div>
          </div>
          <div class="gauge-card">
            <div class="gauge-label">오늘 수익 (USDC)</div>
            <div class="gauge-value green">$124.01</div>
            <div class="gauge-bar"><div class="gauge-fill" style="width:62%;background:#34d399"></div></div>
          </div>
        </div>
        <div class="divider"></div>
        <div style="font-size:0.82rem;color:#555;margin-bottom:12px;font-weight:600">실시간 크롤러 로그</div>
        <div class="terminal">
<span class="t-comment"># 크롤러 요청 → 402 → 자동 결제 → 200</span>
<span class="t-blue">2026-04-23T09:14:01</span> GET /articles/ml-trends <span class="t-red">402</span> <span class="t-comment">USDC $0.001/page</span>
<span class="t-blue">2026-04-23T09:14:01</span> ↳ X-PAYMENT: 0x9f3a...c821 [OpenAI-Crawler/2.0] <span class="t-green">200 OK</span>
<span class="t-blue">2026-04-23T09:14:02</span> GET /articles/ev-market  <span class="t-red">402</span>
<span class="t-blue">2026-04-23T09:14:02</span> ↳ X-PAYMENT: 0x7b1c...ff42 [Anthropic-Bot/1.0]  <span class="t-green">200 OK</span>
<span class="t-blue">2026-04-23T09:14:03</span> GET /articles/quantum     <span class="t-red">402</span>
<span class="t-blue">2026-04-23T09:14:03</span> ↳ <span class="t-yellow">No X-PAYMENT — 차단 (미등록 봇)</span>               <span class="t-red">403</span>
<span class="t-blue">2026-04-23T09:14:04</span> GET /articles/biotech     <span class="t-red">402</span>
<span class="t-blue">2026-04-23T09:14:04</span> ↳ X-PAYMENT: 0x2d8e...a119 [GoogleBot-AI/1.0]    <span class="t-green">200 OK</span>
        </div>
        <p style="font-size:0.78rem;color:#888;margin-top:12px">
          💡 지불 의사가 있는 AI 크롤러는 통과, 미등록 봇은 차단. robots.txt보다 경제적으로 강력한 접근 제어.
        </p>
        <div style="display:flex;gap:12px;align-items:center;margin-top:16px">
          <button class="btn btn-primary" id="crawler-pay-btn" onclick="triggerPayment('crawler')">
            크롤러 접근 시뮬레이션 ($0.01)
          </button>
          <span style="font-size:0.8rem;color:#888">Agent 지갑으로 실제 온체인 결제 실행</span>
        </div>
        <div class="status-bar status-402" id="crawler-status-402">HTTP/1.1 402 Payment Required — X-PAYMENT-REQUIRED: exact,USDC,$0.01,base-sepolia</div>
        <div class="status-bar status-paying" id="crawler-status-paying">⏳ 크롤러 지갑 자동 서명 중... X-PAYMENT 헤더 첨부</div>
        <div class="status-bar status-200" id="crawler-status-200">✅ HTTP/1.1 200 OK — 페이지 콘텐츠 반환됨</div>
        <div id="crawler-result"></div>
      </div>
    </div>
  </div>

  <!-- ====================================================== -->
  <!-- 3. 스팸 방지 -->
  <!-- ====================================================== -->
  <div class="page" id="page-antispam">
    <div class="scenario-header">
      <div class="scenario-badge">🛡️ Scenario 3</div>
      <h1>스팸 방지 게이트웨이 (Anti-Spam)</h1>
      <p>이메일/메시지 발송, API 호출에 소액 비용을 부과합니다. 인간에겐 무시할 수 있는 비용이지만, 대량 발송 봇에겐 치명적입니다.</p>
    </div>

    <div class="flow">
      <div class="flow-node">발신자</div>
      <div class="flow-arrow"><span class="flow-label">POST /send</span></div>
      <div class="flow-node highlight">메일 게이트웨이</div>
      <div class="flow-arrow"><span class="flow-label">402 $0.0001/건</span></div>
      <div class="flow-node money">결제 후 발송</div>
      <div class="flow-arrow"><span class="flow-label">250 OK</span></div>
      <div class="flow-node">수신함</div>
    </div>

    <div class="mockup-area">
      <div class="mockup-bar">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="mockup-url">mail.example.com / 새 메시지 작성</span>
      </div>
      <div class="mockup-body">
        <div class="email-form">
          <div class="email-row">
            <span class="email-label">받는 사람</span>
            <span class="email-input">team@startup.io</span>
          </div>
          <div class="email-row">
            <span class="email-label">제목</span>
            <span class="email-input">Q2 스프린트 회고 미팅 일정 공유</span>
          </div>
          <div class="email-body-area">
            안녕하세요, 다음 주 화요일 오후 2시에 Q2 회고 미팅을 진행하려고 합니다.
            참석 가능 여부 확인 부탁드립니다...
          </div>
          <div class="email-footer">
            <div>
              <span style="font-size:0.75rem;color:#888">발송 비용:</span>
              <span class="cost-badge">$0.0001 USDC / 건</span>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-outline" style="padding:7px 14px">임시저장</button>
              <button class="btn btn-primary" id="email-send-btn" onclick="triggerPayment('email')">
                결제 후 발송
              </button>
            </div>
          </div>
        </div>
        <div class="status-bar status-402" id="email-status-402">
          HTTP/1.1 402 Payment Required<br/>
          X-PAYMENT-REQUIRED: exact,USDC,$0.0001,base-sepolia<br/>
          <span style="color:#92400e;font-size:0.75rem">※ 스패머가 10만 건 발송 시 $10 비용 — 경제적 억제</span>
        </div>
        <div class="status-bar status-paying" id="email-status-paying">
          ⏳ 지갑 서명 중... 발송 처리 중...
        </div>
        <div class="status-bar status-200" id="email-status-200">
          ✅ 250 Message accepted — 발송 완료, USDC 차감됨
        </div>
        <div id="email-result"></div>
        <div class="divider"></div>
        <div class="gauge-row">
          <div class="gauge-card">
            <div class="gauge-label">오늘 차단된 스팸</div>
            <div class="gauge-value red">98,340건</div>
            <div class="gauge-bar"><div class="gauge-fill" style="width:90%;background:#f87171"></div></div>
          </div>
          <div class="gauge-card">
            <div class="gauge-label">정상 발송 (결제)</div>
            <div class="gauge-value green">1,247건</div>
            <div class="gauge-bar"><div class="gauge-fill" style="width:30%;background:#34d399"></div></div>
          </div>
          <div class="gauge-card">
            <div class="gauge-label">CAPTCHA 없음</div>
            <div class="gauge-value purple">0 개</div>
            <div class="gauge-bar"><div class="gauge-fill" style="width:0%;background:#818cf8"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ====================================================== -->
  <!-- 4. GPU 스팟 마켓 -->
  <!-- ====================================================== -->
  <div class="page" id="page-gpu">
    <div class="scenario-header">
      <div class="scenario-badge">⚡ Scenario 4</div>
      <h1>GPU 스팟 마켓 (Compute on Demand)</h1>
      <p>계정 없이, 신용카드 없이 — GPU 연산을 분 단위로 즉시 구매합니다. AWS Spot Instance의 마찰 없는 버전입니다.</p>
    </div>

    <div class="flow">
      <div class="flow-node">클라이언트</div>
      <div class="flow-arrow"><span class="flow-label">POST /jobs</span></div>
      <div class="flow-node highlight">컴퓨트 서버</div>
      <div class="flow-arrow"><span class="flow-label">402 $0.08/min</span></div>
      <div class="flow-node money">즉시 결제</div>
      <div class="flow-arrow"><span class="flow-label">Job ID 반환</span></div>
      <div class="flow-node">GPU 실행</div>
    </div>

    <div class="mockup-area">
      <div class="mockup-bar">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="mockup-url">compute.example.com / 새 작업 제출</span>
      </div>
      <div class="mockup-body">
        <div class="gpu-specs">
          <div class="spec-card">
            <div class="spec-label">GPU 인스턴스</div>
            <div class="spec-value">NVIDIA A100 × 1</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">예상 실행 시간</div>
            <div class="spec-value">~12분</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">단가</div>
            <div class="spec-value" style="color:#6366f1">$0.08 USDC / 분</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">예상 총 비용</div>
            <div class="spec-value" style="color:#6366f1">~$0.96 USDC</div>
          </div>
        </div>
        <div class="terminal">
<span class="t-comment"># 요청</span>
POST /jobs HTTP/1.1
Content-Type: application/json

{ "image": "pytorch/pytorch:2.2", "cmd": "python train.py", "gpu": "a100" }

<span class="t-comment"># 서버 응답</span>
HTTP/1.1 <span class="t-red">402 Payment Required</span>
X-PAYMENT-REQUIRED: exact,USDC,$0.96,base-sepolia
X-PAYMENT-DESCRIPTION: A100 GPU 12min estimated

<span class="t-comment"># 클라이언트 자동 결제 후 재요청</span>
POST /jobs HTTP/1.1
<span class="t-purple">X-PAYMENT: 0x5f9a...b3c7</span>

HTTP/1.1 <span class="t-green">201 Created</span>
{ "job_id": "job_9x2k", "status": "queued", "eta": "~12min" }
        </div>
        <div style="display:flex;gap:12px;margin-top:16px">
          <button class="btn btn-primary" id="gpu-pay-btn" onclick="triggerPayment('gpu')">
            결제 후 작업 제출
          </button>
          <span style="font-size:0.8rem;color:#888;align-self:center">계정 등록 불필요 · USDC 지갑만 있으면 즉시 사용</span>
        </div>
        <div class="status-bar status-402" id="gpu-status-402">
          HTTP/1.1 402 Payment Required — $0.96 USDC (A100 × 12분)
        </div>
        <div class="status-bar status-paying" id="gpu-status-paying">
          ⏳ 결제 처리 중... 온체인 검증...
        </div>
        <div class="status-bar status-200" id="gpu-status-200">
          ✅ 201 Created — 작업 제출 완료, USDC 결제됨
        </div>
        <div id="gpu-result"></div>
      </div>
    </div>
  </div>

  <!-- ====================================================== -->
  <!-- 5. IoT 데이터 마켓 -->
  <!-- ====================================================== -->
  <div class="page" id="page-iot">
    <div class="scenario-header">
      <div class="scenario-badge">📡 Scenario 5</div>
      <h1>IoT 센서 데이터 마켓 (M2M)</h1>
      <p>기계끼리 자율적으로 데이터를 사고 팝니다. AI나 사람의 개입 없이, 센서가 직접 402 결제 루프를 처리합니다.</p>
    </div>

    <div class="flow">
      <div class="flow-node">구매 디바이스</div>
      <div class="flow-arrow"><span class="flow-label">GET /sensors/temp</span></div>
      <div class="flow-node highlight">데이터 브로커</div>
      <div class="flow-arrow"><span class="flow-label">402 $0.0005</span></div>
      <div class="flow-node money">M2M 결제</div>
      <div class="flow-arrow"><span class="flow-label">센서값 반환</span></div>
      <div class="flow-node">자율 처리</div>
    </div>

    <div class="mockup-area">
      <div class="mockup-bar">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="mockup-url">iot-market.example.com / 센서 데이터 마켓플레이스</span>
      </div>
      <div class="mockup-body">
        <div style="font-size:0.82rem;color:#555;margin-bottom:12px">
          <span class="tag tag-free">무료</span> 메타데이터 조회 &nbsp;
          <span class="tag tag-paid">결제</span> 실시간 센서값 &nbsp;
          <span class="tag tag-paid">결제</span> 히스토리 데이터
        </div>
        <div class="sensor-grid">
          <div class="sensor-card">
            <div class="sensor-name">🌡️ 온도 (Seoul)</div>
            <div class="sensor-val">23.4°C</div>
            <div class="sensor-price">$0.0005 / 요청</div>
          </div>
          <div class="sensor-card">
            <div class="sensor-name">💧 습도 (Seoul)</div>
            <div class="sensor-val">61%</div>
            <div class="sensor-price">$0.0005 / 요청</div>
          </div>
          <div class="sensor-card locked">
            <div class="sensor-name">🌬️ 미세먼지</div>
            <div class="sensor-val">—</div>
            <div class="sensor-price">$0.001 / 요청</div>
            <div class="lock-icon">🔒</div>
          </div>
          <div class="sensor-card locked">
            <div class="sensor-name">⚡ 전력 소비</div>
            <div class="sensor-val">—</div>
            <div class="sensor-price">$0.002 / 요청</div>
            <div class="lock-icon">🔒</div>
          </div>
          <div class="sensor-card">
            <div class="sensor-name">🌧️ 강수량</div>
            <div class="sensor-val">0.0mm</div>
            <div class="sensor-price">$0.0005 / 요청</div>
          </div>
          <div class="sensor-card locked">
            <div class="sensor-name">🔊 소음 (dB)</div>
            <div class="sensor-val">—</div>
            <div class="sensor-price">$0.001 / 요청</div>
            <div class="lock-icon">🔒</div>
          </div>
        </div>
        <div class="terminal">
<span class="t-comment"># 스마트홈 컨트롤러 → 온도 센서 자동 구매</span>
GET /sensors/temperature/seoul <span class="t-red">402</span>
↳ X-PAYMENT: 0x3c7f...e091 (디바이스 지갑 자동 서명) <span class="t-green">200</span>
{ "value": 23.4, "unit": "celsius", "ts": "2026-04-23T09:14:00Z" }

<span class="t-comment"># 전기차 → 충전 가격 조회 후 자동 시작</span>
POST /charging/start <span class="t-red">402</span> $0.15 USDC/kWh
↳ X-PAYMENT: 0xab2d...1f9c (차량 지갑)              <span class="t-green">201</span>
        </div>
        <div style="display:flex;gap:12px;align-items:center;margin-top:16px">
          <button class="btn btn-primary" id="iot-pay-btn" onclick="triggerPayment('iot')">
            온도 센서 데이터 구매 ($0.01)
          </button>
          <span style="font-size:0.8rem;color:#888">디바이스 지갑으로 실제 온체인 결제 실행</span>
        </div>
        <div class="status-bar status-402" id="iot-status-402">HTTP/1.1 402 Payment Required — X-PAYMENT-REQUIRED: exact,USDC,$0.01,base-sepolia</div>
        <div class="status-bar status-paying" id="iot-status-paying">⏳ 디바이스 지갑 자동 서명 중... 온체인 검증</div>
        <div class="status-bar status-200" id="iot-status-200">✅ HTTP/1.1 200 OK — 센서 데이터 반환됨</div>
        <div id="iot-result"></div>
      </div>
    </div>
  </div>

  <!-- ====================================================== -->
  <!-- 6. 우선순위 큐 -->
  <!-- ====================================================== -->
  <div class="page" id="page-queue">
    <div class="scenario-header">
      <div class="scenario-badge">🎯 Scenario 6</div>
      <h1>우선순위 큐 (Priority Queue)</h1>
      <p>무료 티어는 큐에서 기다리고, 결제하면 즉시 처리됩니다. Rate limit을 구독이 아닌 즉시 결제로 돌파합니다.</p>
    </div>

    <div class="flow">
      <div class="flow-node">사용자</div>
      <div class="flow-arrow"><span class="flow-label">429 Too Many</span></div>
      <div class="flow-node highlight">API 서버</div>
      <div class="flow-arrow"><span class="flow-label">402 $0.01 급행</span></div>
      <div class="flow-node money">결제</div>
      <div class="flow-arrow"><span class="flow-label">즉시 처리</span></div>
      <div class="flow-node">응답</div>
    </div>

    <div class="mockup-area">
      <div class="mockup-bar">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="mockup-url">api.example.com / 처리 큐 현황</span>
      </div>
      <div class="mockup-body">
        <div class="gauge-row">
          <div class="gauge-card">
            <div class="gauge-label">현재 대기 (무료)</div>
            <div class="gauge-value red">47명</div>
            <div class="gauge-bar"><div class="gauge-fill" style="width:80%;background:#f87171"></div></div>
          </div>
          <div class="gauge-card">
            <div class="gauge-label">예상 대기 시간</div>
            <div class="gauge-value red">~23분</div>
          </div>
          <div class="gauge-card">
            <div class="gauge-label">급행 처리 (결제)</div>
            <div class="gauge-value green">즉시</div>
          </div>
        </div>
        <div class="queue-list">
          <div class="queue-item">
            <div class="queue-pos vip">★</div>
            <div><span class="tag tag-vip">VIP</span> <strong>job_a1b2</strong> — 이미지 분석 3건</div>
            <div class="queue-eta">처리 중...</div>
          </div>
          <div class="queue-item">
            <div class="queue-pos vip">★</div>
            <div><span class="tag tag-vip">VIP</span> <strong>job_c3d4</strong> — 번역 10페이지</div>
            <div class="queue-eta">처리 중...</div>
          </div>
          <div class="queue-item you">
            <div class="queue-pos normal">👤</div>
            <div><span class="tag tag-free">무료</span> <strong>내 요청</strong> — 코드 리뷰</div>
            <div class="queue-eta">⏳ ~23분 대기</div>
          </div>
          <div class="queue-item">
            <div class="queue-pos normal">48</div>
            <div><span class="tag tag-free">무료</span> job_k9l0</div>
            <div class="queue-eta">~24분</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:center">
          <button class="btn btn-primary" id="queue-pay-btn" onclick="triggerPayment('queue')">
            결제 후 즉시 처리 ($0.05)
          </button>
          <span style="font-size:0.8rem;color:#888">구독 업그레이드 없이 이번 요청만 급행 처리</span>
        </div>
        <div class="status-bar status-402" id="queue-status-402">
          HTTP/1.1 402 Payment Required<br/>
          X-PAYMENT-REQUIRED: exact,USDC,$0.01,base-sepolia<br/>
          X-QUEUE-POSITION: 47 / X-WAIT-TIME: 23min
        </div>
        <div class="status-bar status-paying" id="queue-status-paying">
          ⏳ 결제 중... 우선순위 큐로 이동 중...
        </div>
        <div class="status-bar status-200" id="queue-status-200">
          ✅ 200 OK — 큐 1번으로 이동! USDC 결제됨, 즉시 처리 시작
        </div>
        <div id="queue-result"></div>
      </div>
    </div>
    <p style="font-size:0.8rem;color:#888">
      💡 <strong>기존 방식:</strong> 월 $49 Pro 플랜 업그레이드 → <strong>x402 방식:</strong> 이번 요청만 $0.05 즉시 결제.
      사용자는 더 유연하고, 서비스는 더 세밀한 수익 모델을 가집니다.
    </p>
  </div>

</main>

<script>
// ── Wallet balance monitor ──────────────────────────────────
const prevUsdc = {};

function truncAddr(a) { return a.slice(0, 6) + '…' + a.slice(-4); }

function renderWallets(wallets) {
  if (!wallets || wallets.length === 0) {
    return '<div class="widget-placeholder">지갑 미설정<br/>.env 확인</div>';
  }
  return wallets.map(w => {
    const curr = parseFloat(w.usdc);
    const prev = prevUsdc[w.address];
    let delta = '';
    if (prev !== undefined && Math.abs(curr - prev) > 0.000001) {
      const diff = curr - prev;
      delta = \`<span class="wallet-delta \${diff > 0 ? 'up' : 'down'}">\${diff > 0 ? '+' : ''}\${diff.toFixed(4)}</span>\`;
    }
    prevUsdc[w.address] = curr;
    const basescanUrl = \`https://sepolia.basescan.org/address/\${w.address}\`;
    return \`<div class="wallet-card">
      <div class="wallet-role \${w.role}">\${w.label} · \${w.role === 'payer' ? 'Payer' : 'Receiver'}</div>
      <a class="wallet-addr" href="\${basescanUrl}" target="_blank" rel="noopener" title="\${w.address}">\${truncAddr(w.address)} ↗</a>
      <div class="wallet-usdc">\${parseFloat(w.usdc).toFixed(4)}\${delta}<span class="unit">USDC</span></div>
      <div class="wallet-eth">\${parseFloat(w.eth).toFixed(5)} ETH</div>
    </div>\`;
  }).join('');
}

async function fetchBalances() {
  const dot = document.getElementById('live-dot');
  try {
    const res = await fetch('/api/free/balances');
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'RPC 오류');
    dot.className = 'live-dot';
    document.getElementById('wallet-cards').innerHTML = renderWallets(data.wallets);
    const t = new Date(data.updatedAt);
    document.getElementById('widget-updated').textContent =
      t.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    dot.className = 'live-dot error';
    document.getElementById('wallet-cards').innerHTML =
      \`<div class="widget-error">연결 실패<br/>\${e.message.slice(0, 40)}</div>\`;
  }
}

fetchBalances();
setInterval(fetchBalances, 10000);
// ────────────────────────────────────────────────────────────

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
}

const ORIG_BTN_TEXT = {
  article: '지갑으로 결제하기',
  email:   '결제 후 발송',
  gpu:     '결제 후 작업 제출',
  crawler: '크롤러 접근 시뮬레이션 ($0.01)',
  iot:     '온도 센서 데이터 구매 ($0.01)',
  queue:   '결제 후 즉시 처리 ($0.05)',
};

function renderResult(scenario, data) {
  const d = data.data;
  const ms = data.elapsedMs;
  let body = '';

  if (d.type === 'summary') {
    body = \`
      <div class="res-field"><span class="res-key">내용</span><span class="res-val">\${d.content}</span></div>
      <div class="res-metrics">
        <div class="res-metric">모델 <span>\${d.model}</span></div>
        <div class="res-metric">단어수 <span>\${d.wordCount}</span></div>
        <div class="res-metric">생성 <span>\${new Date(d.generatedAt).toLocaleTimeString('ko-KR')}</span></div>
      </div>\`;
  } else if (d.type === 'analysis') {
    body = \`
      <div class="res-field"><span class="res-key">분석</span><span class="res-val">\${d.content}</span></div>
      <div class="res-metrics">
        <div class="res-metric">신뢰도 <span>\${(d.metrics.confidence*100).toFixed(0)}%</span></div>
        <div class="res-metric">데이터 <span>\${d.metrics.dataPoints.toLocaleString()}건</span></div>
        <div class="res-metric">처리 <span>\${d.metrics.processingTime}</span></div>
      </div>\`;
  } else if (d.type === 'report') {
    body = d.sections.map(s =>
      \`<div class="res-section"><strong>\${s.heading}</strong><p>\${s.content}</p></div>\`
    ).join('');
  }

  return \`<div class="payment-result">
    <div class="res-header">✅ 200 OK · \${data.endpoint} · \${ms}ms · Agent → Server 온체인 결제 완료</div>
    \${body}
  </div>\`;
}

async function triggerPayment(scenario) {
  const btnId = scenario === 'email' ? 'email-send-btn' : scenario + '-pay-btn';
  const btn = document.getElementById(btnId);
  const s402   = document.getElementById(scenario + '-status-402');
  const sPaying = document.getElementById(scenario + '-status-paying');
  const s200   = document.getElementById(scenario + '-status-200');
  const result = document.getElementById(scenario + '-result');

  if (!btn || btn.disabled) return;
  btn.disabled = true;
  btn.textContent = '처리 중...';
  if (result) result.innerHTML = '';

  [s402, sPaying, s200].forEach(el => { if (el) el.classList.remove('show'); });
  if (s402) s402.classList.add('show');

  const payingTimer = setTimeout(() => {
    if (s402) s402.classList.remove('show');
    if (sPaying) sPaying.classList.add('show');
  }, 700);

  try {
    const res = await fetch('/api/demo/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    clearTimeout(payingTimer);
    const data = await res.json();

    if (s402) s402.classList.remove('show');
    if (sPaying) sPaying.classList.remove('show');

    if (res.ok && data.success) {
      if (s200) s200.classList.add('show');
      if (result) result.innerHTML = renderResult(scenario, data);
      btn.textContent = '✅ 결제 완료';
      btn.style.background = '#059669';
      fetchBalances(); // 잔고 즉시 갱신
      setTimeout(() => {
        btn.disabled = false;
        btn.style.background = '';
        btn.textContent = ORIG_BTN_TEXT[scenario] || '결제하기';
      }, 5000);
    } else {
      if (result) result.innerHTML =
        \`<div class="payment-error">❌ \${data.error || '결제 실패'}\${data.detail ? '<br/>' + data.detail : ''}</div>\`;
      btn.disabled = false;
      btn.textContent = ORIG_BTN_TEXT[scenario] || '결제하기';
    }
  } catch (e) {
    clearTimeout(payingTimer);
    [s402, sPaying, s200].forEach(el => { if (el) el.classList.remove('show'); });
    if (result) result.innerHTML =
      \`<div class="payment-error">❌ 네트워크 오류: \${e.message}</div>\`;
    btn.disabled = false;
    btn.textContent = ORIG_BTN_TEXT[scenario] || '결제하기';
  }
}
</script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

router.get("/bank-demo", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(getBankDemoHtml());
});

// ============================================================
// 무료 엔드포인트
// ============================================================

router.get("/api/free/health", (_req, res) => {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    chain: config.chain.name,
    facilitator: config.facilitator.url,
  };
  res.json(response);
});

router.get("/api/free/price-list", (_req, res) => {
  const response: PriceListResponse = {
    routes: PAID_ROUTES,
  };
  res.json(response);
});

router.get("/api/free/balances", async (_req, res) => {
  try {
    const { createPublicClient, http, formatUnits } = await import("viem");
    const { baseSepolia } = await import("viem/chains");

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(config.chain.rpcUrl),
    });

    const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
    const balanceOfAbi = [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ] as const;

    type WalletEntry = { label: string; address: string; role: string };
    const wallets: WalletEntry[] = [];

    const serverAddr = getServerWalletAddress();
    if (serverAddr) {
      wallets.push({ label: "Server", address: serverAddr, role: "receiver" });
    }

    const agentKey = getAgentPrivateKey();
    if (agentKey) {
      const { privateKeyToAccount } = await import("viem/accounts");
      const account = privateKeyToAccount(agentKey as `0x${string}`);
      wallets.push({ label: "Agent", address: account.address, role: "payer" });
    }

    const results = await Promise.all(
      wallets.map(async ({ label, address, role }) => {
        const addr = address as `0x${string}`;
        const [usdc, eth] = await Promise.all([
          publicClient.readContract({
            address: USDC_ADDRESS,
            abi: balanceOfAbi,
            functionName: "balanceOf",
            args: [addr],
          }),
          publicClient.getBalance({ address: addr }),
        ]);
        return {
          label,
          role,
          address,
          usdc: formatUnits(usdc as bigint, 6),
          eth: formatUnits(eth, 18),
        };
      })
    );

    res.json({ wallets: results, updatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message, wallets: [] });
  }
});

// ============================================================
// 설정 페이지 & API
// ============================================================

router.get("/settings", (_req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Settings — x402 Server</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8f9fa; color: #1a1a1a; min-height: 100vh; display: flex; justify-content: center; padding: 48px 24px; }
    .container { width: 100%; max-width: 560px; }
    nav { margin-bottom: 28px; }
    .nav-back { color: #6366f1; text-decoration: none; font-size: 0.85rem; font-weight: 500; }
    .nav-back:hover { text-decoration: underline; }
    h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: #888; font-size: 0.85rem; margin-bottom: 28px; line-height: 1.5; }
    .section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px 24px; margin-bottom: 16px; }
    .section-title { font-size: 0.82rem; font-weight: 700; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.01em; }
    .source-badge { font-size: 0.62rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.04em; text-transform: uppercase; }
    .source-settings { background: #ede9fe; color: #6d28d9; }
    .source-env { background: #dbeafe; color: #1e40af; }
    .source-none { background: #f1f5f9; color: #94a3b8; }
    .field-group { margin-bottom: 16px; }
    .field-group:last-child { margin-bottom: 0; }
    label { display: block; font-size: 0.75rem; font-weight: 600; color: #555; margin-bottom: 6px; }
    .input-row { display: flex; gap: 8px; }
    input[type=text], input[type=password] { flex: 1; width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.83rem; font-family: monospace; transition: border-color 0.15s; background: #fff; }
    input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
    .derived-box { background: #f8f9fa; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; font-family: monospace; color: #555; min-height: 38px; word-break: break-all; }
    .hint { font-size: 0.73rem; color: #999; margin-top: 6px; }
    .warn-box { background: #fef9c3; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 0.78rem; color: #92400e; margin-top: 14px; line-height: 1.5; }
    .btn { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; padding: 10px 20px; transition: all 0.15s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-primary:disabled { background: #a5b4fc; cursor: not-allowed; }
    .btn-ghost { background: #fff; color: #dc2626; border: 1.5px solid #fecaca; }
    .btn-ghost:hover { background: #fef2f2; border-color: #f87171; }
    .btn-icon { background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; padding: 10px 13px; cursor: pointer; font-size: 0.9rem; flex-shrink: 0; }
    .btn-icon:hover { background: #e2e8f0; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 4px; flex-wrap: wrap; }
    .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
    .toast { position: fixed; bottom: 28px; right: 28px; padding: 12px 20px; border-radius: 10px; font-size: 0.85rem; font-weight: 500; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 999; }
    .toast.show { opacity: 1; pointer-events: auto; }
    .toast.success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .toast.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
    .dot-green { background: #22c55e; }
    .dot-gray { background: #94a3b8; }
  </style>
</head>
<body>
<div class="container">
  <nav>
    <a class="nav-back" href="/">← 서버 대시보드</a>
    &nbsp;/&nbsp;
    <a class="nav-back" href="/mockups">목업 대시보드</a>
  </nav>

  <h1>⚙️ Settings</h1>
  <p class="subtitle">
    .settings.json에 저장됩니다. .env보다 우선 적용되며, 서버 재시작 없이 즉시 반영됩니다.<br/>
    <span style="color:#6366f1">Agent 개인키</span>는 암호화 없이 로컬 파일에 저장됩니다 — 개발/테스트 전용.
  </p>

  <!-- Agent Wallet -->
  <div class="section">
    <div class="section-title">
      🤖 Agent 지갑 (Payer)
      <span class="source-badge source-none" id="agent-badge">미설정</span>
    </div>

    <div class="field-group">
      <label>Private Key</label>
      <div class="input-row">
        <input type="password" id="agent-key" placeholder="0x... (미설정 시 .env 사용)" autocomplete="off" oninput="onKeyInput()"/>
        <button class="btn-icon" onclick="toggleVis('agent-key', this)" title="표시/숨김">👁</button>
      </div>
      <p class="hint">저장 즉시 Agent fetch 클라이언트가 재초기화됩니다.</p>
    </div>

    <div class="field-group">
      <label>파생 주소 <span id="agent-addr-status"></span></label>
      <div class="derived-box" id="agent-addr">—</div>
    </div>
  </div>

  <!-- Server Wallet -->
  <div class="section">
    <div class="section-title">
      🏦 서버 지갑 (Receiver)
      <span class="source-badge source-none" id="server-badge">미설정</span>
    </div>

    <div class="field-group">
      <label>Wallet Address</label>
      <input type="text" id="server-addr" placeholder="0x... (미설정 시 .env 사용)"/>
    </div>

    <div class="warn-box">
      ⚠️ 서버 지갑 주소는 저장 즉시 잔고 모니터링과 신규 데모 결제에 반영되지만,<br/>
      x402 결제 미들웨어(수신 주소)는 <strong>서버 재시작 후</strong> 적용됩니다.
    </div>
  </div>

  <div class="actions">
    <button class="btn btn-primary" id="save-btn" onclick="saveSettings()">저장</button>
    <button class="btn btn-ghost" onclick="clearSettings()">설정 초기화 (.env로 복원)</button>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
let _deriveTimer = null;

async function loadSettings() {
  const res = await fetch('/api/settings');
  const d = await res.json();

  // Agent key
  const agentBadge = document.getElementById('agent-badge');
  if (d.agentPrivateKey.isSet) {
    document.getElementById('agent-key').placeholder = '설정됨 (끝 4자리: ' + d.agentPrivateKey.preview + ')';
    agentBadge.className = 'source-badge source-' + d.agentPrivateKey.source;
    agentBadge.textContent = d.agentPrivateKey.source === 'settings' ? 'settings 파일' : '.env';
  } else {
    document.getElementById('agent-key').placeholder = '미설정 — 0x로 시작하는 개인키 입력';
    agentBadge.className = 'source-badge source-none';
    agentBadge.textContent = '미설정';
  }
  document.getElementById('agent-addr').textContent = d.agentAddress ?? '—';

  // Server wallet
  const serverBadge = document.getElementById('server-badge');
  if (d.serverWalletAddress.isSet) {
    document.getElementById('server-addr').value = d.serverWalletAddress.value;
    serverBadge.className = 'source-badge source-' + d.serverWalletAddress.source;
    serverBadge.textContent = d.serverWalletAddress.source === 'settings' ? 'settings 파일' : '.env';
  } else {
    serverBadge.className = 'source-badge source-none';
    serverBadge.textContent = '미설정';
  }
}

function toggleVis(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function onKeyInput() {
  clearTimeout(_deriveTimer);
  const key = document.getElementById('agent-key').value.trim();
  if (!key) { document.getElementById('agent-addr').textContent = '—'; return; }
  _deriveTimer = setTimeout(() => deriveAddress(key), 400);
}

async function deriveAddress(key) {
  const addrEl = document.getElementById('agent-addr');
  const statusEl = document.getElementById('agent-addr-status');
  try {
    addrEl.textContent = '계산 중...';
    const res = await fetch('/api/settings/derive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privateKey: key }),
    });
    const d = await res.json();
    addrEl.textContent = d.address ?? '유효하지 않은 키';
    statusEl.innerHTML = d.address
      ? '<span class="status-dot dot-green"></span>'
      : '<span class="status-dot dot-gray"></span>';
  } catch {
    addrEl.textContent = '계산 실패';
  }
}

async function saveSettings() {
  const key = document.getElementById('agent-key').value.trim();
  const addr = document.getElementById('server-addr').value.trim();
  const patch = {};
  if (key) patch.agentPrivateKey = key;
  if (addr) patch.serverWalletAddress = addr;
  if (!Object.keys(patch).length) { toast('변경된 값이 없습니다', 'error'); return; }

  const btn = document.getElementById('save-btn');
  btn.disabled = true; btn.textContent = '저장 중...';
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const d = await res.json();
    if (res.ok) {
      document.getElementById('agent-key').value = '';
      toast('저장 완료 — 즉시 적용됨', 'success');
      await loadSettings();
    } else {
      toast(d.error || '저장 실패', 'error');
    }
  } finally {
    btn.disabled = false; btn.textContent = '저장';
  }
}

async function clearSettings() {
  if (!confirm('.settings.json의 모든 설정을 삭제하고 .env로 복원하시겠습니까?')) return;
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentPrivateKey: '', serverWalletAddress: '' }),
  });
  toast('초기화 완료 — .env 값으로 복원됨', 'success');
  document.getElementById('agent-key').value = '';
  await loadSettings();
}

function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  setTimeout(() => el.classList.remove('show'), 3000);
}

loadSettings();
</script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

router.get("/api/settings", async (_req, res) => {
  const all = settingsStore.getAll();
  const envKey = config.agent.privateKey;
  const envAddr = config.server.walletAddress;

  // Agent key: never expose full value
  const rawKey = all.agentPrivateKey ?? envKey;
  let agentAddress: string | null = null;
  if (rawKey) {
    try {
      const { privateKeyToAccount } = await import("viem/accounts");
      agentAddress = privateKeyToAccount(rawKey as `0x${string}`).address;
    } catch { /* invalid key */ }
  }

  res.json({
    agentPrivateKey: {
      isSet: !!rawKey,
      source: all.agentPrivateKey ? "settings" : (envKey ? "env" : "none"),
      preview: rawKey ? `...${rawKey.slice(-4)}` : null,
    },
    agentAddress,
    serverWalletAddress: {
      isSet: !!(all.serverWalletAddress ?? envAddr),
      source: all.serverWalletAddress ? "settings" : (envAddr ? "env" : "none"),
      value: all.serverWalletAddress ?? envAddr ?? null,
    },
  });
});

router.post("/api/settings/derive", async (req, res) => {
  const { privateKey } = req.body as { privateKey?: string };
  if (!privateKey) return res.status(400).json({ error: "privateKey 필요" });
  try {
    const { privateKeyToAccount } = await import("viem/accounts");
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    res.json({ address: account.address });
  } catch {
    res.status(400).json({ error: "유효하지 않은 개인키" });
  }
});

router.post("/api/settings", async (req, res) => {
  const { agentPrivateKey, serverWalletAddress } = req.body as {
    agentPrivateKey?: string;
    serverWalletAddress?: string;
  };
  try {
    const prevKey = settingsStore.getAgentPrivateKey() ?? config.agent.privateKey;
    settingsStore.update({ agentPrivateKey, serverWalletAddress });

    // Agent key가 바뀌면 fetch 클라이언트 재초기화
    const newKey = settingsStore.getAgentPrivateKey() ?? config.agent.privateKey;
    if (newKey !== prevKey) {
      _agentFetch = null;
      console.log("[settings] Agent 개인키 변경 — fetch 클라이언트 재초기화");
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ============================================================
// 데모 결제 트리거 (Agent 지갑으로 실제 x402 결제 실행)
// ============================================================

let _agentFetch: typeof fetch | null = null;

async function getAgentFetch(): Promise<typeof fetch> {
  if (_agentFetch) return _agentFetch;
  const key = getAgentPrivateKey();
  if (!key) throw new Error("AGENT_PRIVATE_KEY가 설정되지 않았습니다 (/settings에서 설정하세요)");
  const { wrapFetchWithPayment, x402Client } = await import("@x402/fetch");
  const { ExactEvmScheme } = await import("@x402/evm");
  const { privateKeyToAccount } = await import("viem/accounts");
  const account = privateKeyToAccount(key as `0x${string}`);
  const evmScheme = new ExactEvmScheme(account);
  const client = new x402Client().register(`eip155:${config.chain.id}`, evmScheme);
  _agentFetch = wrapFetchWithPayment(fetch, client);
  console.log("[demo] Agent fetch 초기화:", account.address);
  return _agentFetch;
}

const DEMO_ENDPOINTS: Record<string, string> = {
  article: "/api/premium/summary",
  crawler: "/api/premium/summary",
  email:   "/api/premium/summary",
  gpu:     "/api/premium/report",
  iot:     "/api/premium/summary",
  queue:   "/api/premium/analysis",
};

const TRIP_STEPS: DemoScenarioStep[] = [
  {
    merchant: "RailGo",
    amountKrw: 88_000,
    category: "transport",
    endpoint: "/api/premium/trip/railgo",
    usdcPrice: "0.01",
    detail: "KTX 왕복 예약",
  },
  {
    merchant: "StayMate",
    amountKrw: 120_000,
    category: "stay",
    endpoint: "/api/premium/trip/staymate",
    usdcPrice: "0.01",
    detail: "호텔 데이유즈 예약",
  },
  {
    merchant: "TableNow",
    amountKrw: 45_000,
    category: "food",
    endpoint: "/api/premium/trip/tablenow",
    usdcPrice: "0.01",
    detail: "점심 예약",
  },
  {
    merchant: "RoomFlex",
    amountKrw: 30_000,
    category: "food",
    endpoint: "/api/premium/trip/roomflex",
    usdcPrice: "0.01",
    detail: "미팅룸 1시간 예약",
  },
];

const CONTENT_STEPS: DemoScenarioStep[] = [
  {
    merchant: "Insight Brief 1",
    amountKrw: 150,
    category: "content",
    endpoint: "/api/premium/content/brief-1",
    usdcPrice: "0.005",
    detail: "AI 금융 인프라의 재편",
  },
  {
    merchant: "Insight Brief 2",
    amountKrw: 150,
    category: "content",
    endpoint: "/api/premium/content/brief-2",
    usdcPrice: "0.005",
    detail: "에이전트 결제 UX 트렌드",
  },
  {
    merchant: "Insight Brief 3",
    amountKrw: 150,
    category: "content",
    endpoint: "/api/premium/content/brief-3",
    usdcPrice: "0.005",
    detail: "x402와 은행 계좌 구조",
  },
  {
    merchant: "Insight Brief 4",
    amountKrw: 150,
    category: "content",
    endpoint: "/api/premium/content/brief-4",
    usdcPrice: "0.005",
    detail: "출장 데이터 자동화",
  },
  {
    merchant: "Insight Brief 5",
    amountKrw: 150,
    category: "content",
    endpoint: "/api/premium/content/brief-5",
    usdcPrice: "0.005",
    detail: "마이크로결제 수익성",
  },
];

async function callPaidEndpoint(fetchFn: typeof fetch, endpoint: string) {
  const url = `http://localhost:${config.server.port}${endpoint}`;
  const startedAt = Date.now();
  const response = await fetchFn(url);
  const elapsedMs = Date.now() - startedAt;
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status} ${endpoint} ${detail.slice(0, 120)}`);
  }
  const payload = await response.json();
  return { endpoint, elapsedMs, payload };
}

async function runPaidScenario(
  steps: DemoScenarioStep[],
  kind: "trip" | "content"
) {
  const fetchFn = await getAgentFetch();
  const results: Array<{
    merchant: string;
    endpoint: string;
    elapsedMs: number;
    amountKrw: number;
    category: string;
    usdcPrice: string;
  }> = [];

  for (const step of steps) {
    const paid = await callPaidEndpoint(fetchFn, step.endpoint);
    demoStateStore.addApprovedTransaction({
      kind,
      merchant: step.merchant,
      category: step.category,
      amountKrw: step.amountKrw,
      endpoint: step.endpoint,
      ai: "ClaudeAssist",
      detail: step.detail,
    });
    results.push({
      merchant: step.merchant,
      endpoint: paid.endpoint,
      elapsedMs: paid.elapsedMs,
      amountKrw: step.amountKrw,
      category: step.category,
      usdcPrice: step.usdcPrice,
    });
  }

  return results;
}

router.post("/api/demo/trigger", async (req, res) => {
  const { scenario } = req.body as { scenario?: string };
  if (!scenario || !DEMO_ENDPOINTS[scenario]) {
    return res.status(400).json({ error: "알 수 없는 시나리오" });
  }
  try {
    const fetchFn = await getAgentFetch();
    const endpoint = DEMO_ENDPOINTS[scenario];
    const url = `http://localhost:${config.server.port}${endpoint}`;
    const start = Date.now();
    const response = await fetchFn(url);
    const elapsed = Date.now() - start;
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({ error: `HTTP ${response.status}`, detail: text.slice(0, 200) });
    }
    const data = await response.json();
    res.json({ success: true, scenario, endpoint, elapsedMs: elapsed, data });
  } catch (err) {
    const msg = (err as Error).message;
    console.error("[demo] trigger 오류:", msg);
    res.status(500).json({ error: msg });
  }
});

router.get("/api/demo/account", (_req, res) => {
  res.json(demoStateStore.getAccount());
});

router.post("/api/demo/reset", (_req, res) => {
  const state = demoStateStore.reset();
  res.json({ ok: true, state });
});

router.get("/api/demo/report", (_req, res) => {
  res.json(demoStateStore.getReport());
});

router.post("/api/demo/trip", async (_req, res) => {
  try {
    const results = await runPaidScenario(TRIP_STEPS, "trip");
    res.json({
      ok: true,
      steps: results,
      account: demoStateStore.getAccount(),
      fraudReady: demoStateStore.hasPendingFraudAttempt(),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/api/demo/micropayment", async (_req, res) => {
  try {
    const results = await runPaidScenario(CONTENT_STEPS, "content");
    res.json({
      ok: true,
      steps: results,
      account: demoStateStore.getAccount(),
      report: demoStateStore.getReport(),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/api/demo/fraud/reject", (_req, res) => {
  if (!demoStateStore.hasPendingFraudAttempt()) {
    return res.status(409).json({ error: "차단할 이상거래 시도가 아직 없습니다." });
  }
  const transaction = demoStateStore.addBlockedAttempt(
    980_000,
    "해외 IP, 미등록 가맹점, 해외 결제 미허용"
  );
  res.json({
    ok: true,
    transaction,
    account: demoStateStore.getAccount(),
    report: demoStateStore.getReport(),
  });
});

// ============================================================
// 예산 / 자동출전 / M2M 설정 API
// ============================================================

router.get("/api/demo/budget", (_req, res) => {
  res.json(budgetStore.get());
});

router.post("/api/demo/budget", (req, res) => {
  const updated = budgetStore.update(req.body as Parameters<typeof budgetStore.update>[0]);
  res.json({ ok: true, budget: updated });
});

router.get("/api/demo/autocharge", (_req, res) => {
  res.json(autoChargeStore.get());
});

router.post("/api/demo/autocharge", (req, res) => {
  const updated = autoChargeStore.update(req.body as Parameters<typeof autoChargeStore.update>[0]);
  res.json({ ok: true, autoCharge: updated });
});

router.get("/api/demo/m2m", (_req, res) => {
  res.json(m2mWalletStore.get());
});

router.post("/api/demo/m2m", (req, res) => {
  const updated = m2mWalletStore.update(req.body as Parameters<typeof m2mWalletStore.update>[0]);
  res.json({ ok: true, m2mConfig: updated });
});

// ============================================================
// 유료 엔드포인트 (x402 미들웨어가 앞에서 결제 처리)
// ============================================================

router.get("/api/premium/summary", (_req, res) => {
  console.log("[server] [summary] 결제 완료 — 리소스 반환");
  res.json({
    type: "summary",
    content: "이것은 x402 결제를 통해 제공되는 AI 생성 프리미엄 요약입니다.",
    generatedAt: new Date().toISOString(),
    model: "gpt-4-turbo",
    wordCount: 150,
  });
});

router.get("/api/premium/analysis", (_req, res) => {
  console.log("[server] [analysis] 결제 완료 — 리소스 반환");
  res.json({
    type: "analysis",
    content: "심층 데이터 분석 결과: 시장 트렌드 상승세, 리스크 요인 3건 식별",
    metrics: {
      confidence: 0.87,
      dataPoints: 1240,
      processingTime: "2.3s",
    },
    generatedAt: new Date().toISOString(),
  });
});

router.get("/api/premium/report", (_req, res) => {
  console.log("[server] [report] 결제 완료 — 리소스 반환");
  res.json({
    type: "report",
    title: "종합 AI 분석 보고서",
    sections: [
      { heading: "개요", content: "본 보고서는 x402 결제를 통해 생성되었습니다." },
      { heading: "분석 결과", content: "데이터 분석 기반 핵심 인사이트 3건" },
      { heading: "결론", content: "AI 에이전트 자율 결제 시스템의 실현 가능성 확인" },
    ],
    generatedAt: new Date().toISOString(),
  });
});

router.get("/api/premium/trip/railgo", (_req, res) => {
  res.json({
    type: "merchant_receipt",
    merchant: "RailGo",
    item: "KTX 왕복",
    category: "transport",
    approvedAt: new Date().toISOString(),
  });
});

router.get("/api/premium/trip/staymate", (_req, res) => {
  res.json({
    type: "merchant_receipt",
    merchant: "StayMate",
    item: "호텔 데이유즈",
    category: "stay",
    approvedAt: new Date().toISOString(),
  });
});

router.get("/api/premium/trip/tablenow", (_req, res) => {
  res.json({
    type: "merchant_receipt",
    merchant: "TableNow",
    item: "점심 예약",
    category: "food",
    approvedAt: new Date().toISOString(),
  });
});

router.get("/api/premium/trip/roomflex", (_req, res) => {
  res.json({
    type: "merchant_receipt",
    merchant: "RoomFlex",
    item: "미팅룸 1시간",
    category: "food",
    approvedAt: new Date().toISOString(),
  });
});

for (const index of [1, 2, 3, 4, 5]) {
  router.get(`/api/premium/content/brief-${index}`, (_req, res) => {
    res.json({
      type: "content_unlock",
      merchant: `Insight Brief ${index}`,
      articleId: `brief-${index}`,
      unlockedAt: new Date().toISOString(),
    });
  });
}

export default router;
