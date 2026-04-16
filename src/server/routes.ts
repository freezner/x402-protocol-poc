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
