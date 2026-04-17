import { Router } from "express";
import type { PaidRoute, HealthResponse, PriceListResponse } from "../types/index.js";
import { config } from "../config/index.js";

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
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
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

export default router;
