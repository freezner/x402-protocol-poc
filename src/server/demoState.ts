import { kvGet, kvSet } from "./db.js";

export interface DemoTransaction {
  id: string;
  kind: "trip" | "content" | "blocked";
  merchant: string;
  category: "transport" | "stay" | "food" | "content" | "risk";
  amountKrw: number;
  amountUsdc?: string;   // 실제 온체인 결제 금액 (e.g. "0.005")
  endpoint?: string;
  ai: string;
  status: "approved" | "blocked";
  detail: string;
  createdAt: string;
}

export interface DemoAccountState {
  balanceKrw: number;
  monthlyLimitKrw: number;
  usedKrw: number;
  categoryLimits: Record<"transport" | "stay" | "food" | "content", number>;
  categoryLimitsUsdc: Record<"transport" | "stay" | "food" | "content", number>;
  categoryUsage: Record<"transport" | "stay" | "food" | "content", number>;
  delegatedAi: {
    name: string;
    trustGrade: string;
    autoPayment: boolean;
    expiresInDays: number;
  };
  transactions: DemoTransaction[];
  blockedCount: number;
  preventedLossKrw: number;
  fraudAttemptPending: boolean;
  lastUpdatedAt: string;
}

export interface DemoReportState {
  month: string;
  totalTransactions: number;
  totalAmountKrw: number;
  merchantCount: number;
  blockedCount: number;
  preventedLossKrw: number;
  categoryMix: Array<{ category: string; percentage: number }>;
  insights: string[];
}

export interface BudgetSettings {
  monthlyTotal: number;
  autoRenew: boolean;
  categories: Record<string, { limit: number; alertAt: number }>;
  categoriesUsdc: Record<string, { limit: number }>;
}

export interface AutoChargeSettings {
  enabled: boolean;
  autoApproveUnder: number;
  confirmRequiredOver: number;
  dailyCap: number;
  accumulatedToday: number;
}

export interface M2MWalletConfig {
  enabled: boolean;
  walletAddress: string;
  network: string;
  perRequestLimitUsdc: number;
  sessionLimitUsdc: number;
  whitelistedAgents: Array<{ name: string; address: string; trustGrade: string }>;
  facilitatorUrl: string;
}

const initialState = (): DemoAccountState => ({
  balanceKrw: 1_000_000,
  monthlyLimitKrw: 1_000_000,
  usedKrw: 0,
  categoryLimits: {
    transport: 300_000,
    stay: 500_000,
    food: 200_000,
    content: 50_000,
  },
  categoryLimitsUsdc: {
    transport: 0.10,
    stay:      0.10,
    food:      0.05,
    content:   0.05,
  },
  categoryUsage: {
    transport: 0,
    stay: 0,
    food: 0,
    content: 0,
  },
  delegatedAi: {
    name: "JB AI Assist",
    trustGrade: "A",
    autoPayment: true,
    expiresInDays: 90,
  },
  transactions: [],
  blockedCount: 0,
  preventedLossKrw: 0,
  fraudAttemptPending: false,
  lastUpdatedAt: new Date().toISOString(),
});

class DemoStateStore {
  private state: DemoAccountState;

  constructor() {
    this.state = kvGet<DemoAccountState>("demo_account") ?? initialState();
  }

  private save(): void {
    kvSet("demo_account", this.state);
  }

  getAccount(): DemoAccountState {
    return structuredClone(this.state);
  }

  reset(): DemoAccountState {
    this.state = initialState();
    this.save();
    return this.getAccount();
  }

  addApprovedTransaction(input: Omit<DemoTransaction, "id" | "createdAt" | "status">): DemoTransaction {
    const tx: DemoTransaction = {
      ...input,
      id: `tx_${this.state.transactions.length + 1}`,
      createdAt: new Date().toISOString(),
      status: "approved",
    };
    this.state.transactions.unshift(tx);
    this.state.balanceKrw -= tx.amountKrw;
    this.state.usedKrw += tx.amountKrw;
    if (tx.category in this.state.categoryUsage) {
      this.state.categoryUsage[tx.category as keyof DemoAccountState["categoryUsage"]] += tx.amountKrw;
    }
    this.state.fraudAttemptPending = true;
    this.state.lastUpdatedAt = new Date().toISOString();
    this.save();
    return tx;
  }

  addBlockedAttempt(amountKrw: number, detail: string): DemoTransaction {
    const tx: DemoTransaction = {
      id: `tx_${this.state.transactions.length + 1}`,
      kind: "blocked",
      merchant: "Offshore Merchant",
      category: "risk",
      amountKrw,
      ai: this.state.delegatedAi.name,
      status: "blocked",
      detail,
      createdAt: new Date().toISOString(),
    };
    this.state.transactions.unshift(tx);
    this.state.blockedCount += 1;
    this.state.preventedLossKrw += amountKrw;
    this.state.fraudAttemptPending = false;
    this.state.lastUpdatedAt = new Date().toISOString();
    this.save();
    return tx;
  }

  hasPendingFraudAttempt(): boolean {
    return this.state.fraudAttemptPending;
  }

  getReport(): DemoReportState {
    const approved = this.state.transactions.filter((tx) => tx.status === "approved");
    const totalAmountKrw = approved.reduce((sum, tx) => sum + tx.amountKrw, 0);
    const merchantCount = new Set(approved.map((tx) => tx.merchant)).size;
    const mixSource = this.state.categoryUsage;
    const mixTotal = Math.max(
      1,
      mixSource.transport + mixSource.stay + mixSource.food + mixSource.content
    );

    return {
      month: "2026-04",
      totalTransactions: approved.length,
      totalAmountKrw,
      merchantCount,
      blockedCount: this.state.blockedCount,
      preventedLossKrw: this.state.preventedLossKrw,
      categoryMix: [
        { category: "교통", percentage: Math.round((mixSource.transport / mixTotal) * 1000) / 10 },
        { category: "숙박", percentage: Math.round((mixSource.stay / mixTotal) * 1000) / 10 },
        { category: "식음료", percentage: Math.round((mixSource.food / mixTotal) * 1000) / 10 },
        { category: "콘텐츠", percentage: Math.round((mixSource.content / mixTotal) * 1000) / 10 },
      ],
      insights: [
        "출장 예약 결제가 집중되어 출장 특화 상품 추천 근거로 활용할 수 있습니다.",
        "콘텐츠 마이크로결제 발생으로 초소액 결제 UX 수요를 증명할 수 있습니다.",
        this.state.blockedCount > 0
          ? `이상거래 ${this.state.blockedCount}건 차단으로 ${this.state.preventedLossKrw.toLocaleString("ko-KR")}원의 손실을 막았습니다.`
          : "아직 이상거래 차단 이력이 없어 정상 패턴 위주로 리포트가 구성됩니다.",
      ],
    };
  }
}

export const demoStateStore = new DemoStateStore();

// ============================================================
// Extended settings stores (singleton, not reset on demo reset)
// ============================================================

class BudgetStore {
  private data: BudgetSettings;

  constructor() {
    this.data = kvGet<BudgetSettings>("budget") ?? {
      monthlyTotal: 1_000_000,
      autoRenew: true,
      categories: {
        transport: { limit: 300_000, alertAt: 80 },
        stay:      { limit: 500_000, alertAt: 80 },
        food:      { limit: 200_000, alertAt: 80 },
        content:   { limit: 50_000,  alertAt: 80 },
      },
      categoriesUsdc: {
        transport: { limit: 0.10 },
        stay:      { limit: 0.10 },
        food:      { limit: 0.05 },
        content:   { limit: 0.05 },
      },
    };
  }

  get(): BudgetSettings { return structuredClone(this.data); }

  update(patch: Partial<BudgetSettings>): BudgetSettings {
    if (patch.monthlyTotal   !== undefined) this.data.monthlyTotal   = patch.monthlyTotal;
    if (patch.autoRenew      !== undefined) this.data.autoRenew      = patch.autoRenew;
    if (patch.categories     !== undefined) Object.assign(this.data.categories, patch.categories);
    if (patch.categoriesUsdc !== undefined) Object.assign(this.data.categoriesUsdc, patch.categoriesUsdc);
    kvSet("budget", this.data);
    return this.get();
  }
}

class AutoChargeStore {
  private data: AutoChargeSettings;

  constructor() {
    this.data = kvGet<AutoChargeSettings>("auto_charge") ?? {
      enabled:             true,
      autoApproveUnder:    50_000,
      confirmRequiredOver: 500_000,
      dailyCap:            300_000,
      accumulatedToday:    0,
    };
  }

  get(): AutoChargeSettings { return structuredClone(this.data); }

  update(patch: Partial<AutoChargeSettings>): AutoChargeSettings {
    Object.assign(this.data, patch);
    kvSet("auto_charge", this.data);
    return this.get();
  }

  addAccumulated(amount: number): void {
    this.data.accumulatedToday += amount;
    kvSet("auto_charge", this.data);
  }

  resetDaily(): void {
    this.data.accumulatedToday = 0;
    kvSet("auto_charge", this.data);
  }
}

class M2MWalletStore {
  private data: M2MWalletConfig;

  constructor() {
    this.data = kvGet<M2MWalletConfig>("m2m_wallet") ?? {
      enabled:             true,
      walletAddress:       "0x1002190240010001x402DemoWallet",
      network:             "base-sepolia",
      perRequestLimitUsdc: 0.05,
      sessionLimitUsdc:    1.00,
      whitelistedAgents:   [],
      facilitatorUrl:      "https://x402.org/facilitator",
    };
  }

  get(): M2MWalletConfig { return structuredClone(this.data); }

  update(patch: Partial<M2MWalletConfig>): M2MWalletConfig {
    if (patch.enabled             !== undefined) this.data.enabled             = patch.enabled;
    if (patch.perRequestLimitUsdc !== undefined) this.data.perRequestLimitUsdc = patch.perRequestLimitUsdc;
    if (patch.sessionLimitUsdc    !== undefined) this.data.sessionLimitUsdc    = patch.sessionLimitUsdc;
    if (patch.whitelistedAgents   !== undefined) this.data.whitelistedAgents   = patch.whitelistedAgents;
    kvSet("m2m_wallet", this.data);
    return this.get();
  }
}

export const budgetStore     = new BudgetStore();
export const autoChargeStore = new AutoChargeStore();
export const m2mWalletStore  = new M2MWalletStore();
