export const APP_NAME = "TEX";
export const APP_SUBLABEL = "LAST-MILE CONTENT INTELLIGENCE";
export const POLICY_VERSION = "default-v1";

export const MODES = {
  STANDALONE: "standalone",
  API: "api",
};

export const ACTION_OPTIONS = [
  "outbound_email",
  "api_call",
  "slack_message",
  "database_query",
  "code_deployment",
];

export const DEFAULT_FORM_STATE = {
  action_type: "outbound_email",
  channel: "email",
  environment: "production",
  recipient: "",
  content: "",
};

export const DEMO_SCENARIOS = [
  {
    id: "clean-internal-message",
    title: "Clean Internal Message",
    expectedVerdict: "PERMIT",
    description:
      "Low-risk internal coordination message in a non-production collaboration channel.",
    action_type: "slack_message",
    channel: "slack",
    environment: "staging",
    recipient: "#internal-planning",
    content:
      "Hi team, the Q3 planning doc is ready for internal review. Let me know if you have questions.",
  },
  {
    id: "data-exfiltration",
    title: "Data Exfiltration",
    expectedVerdict: "FORBID",
    description:
      "Sensitive business data plus a credential leak aimed at an external recipient.",
    action_type: "outbound_email",
    channel: "email",
    environment: "production",
    recipient: "external-partner@competitor.com",
    content:
      "Attached is the full customer list with pricing tiers and contract values. Password: sales2026",
  },
  {
    id: "risky-commitment",
    title: "Risky Commitment",
    expectedVerdict: "ABSTAIN",
    description:
      "Commercial commitment language mixed with customer-facing delivery risk.",
    action_type: "outbound_email",
    channel: "email",
    environment: "production",
    recipient: "customer@example.com",
    content:
      "Please send the customer our pricing sheet and confirm we can guarantee 99.99% uptime.",
  },
  {
    id: "destructive-query",
    title: "Destructive Query",
    expectedVerdict: "FORBID",
    description:
      "Production database action with destructive intent and no safe review path.",
    action_type: "database_query",
    channel: "api",
    environment: "production",
    recipient: "",
    content: "DELETE FROM customers WHERE status = 'inactive'",
  },
];

export const PIPELINE_LAYERS = [
  {
    key: "deterministic",
    title: "Deterministic Gate",
    shortTitle: "Layer 1",
    description:
      "Fast recognizers scan the outbound action for high-signal policy violations, credentials, PII, destructive intent, and blocked terms.",
  },
  {
    key: "retrieval",
    title: "Retrieval Grounding",
    shortTitle: "Layer 2",
    description:
      "Tex grounds the decision against policy-linked entities, matched clauses, and retrieval warnings before semantic judgment.",
  },
  {
    key: "specialists",
    title: "Specialist Judges",
    shortTitle: "Layer 3",
    description:
      "Domain-focused judges score secret exposure, external sharing, unauthorized commitment, and destructive or bypass behavior.",
  },
  {
    key: "semantic",
    title: "Semantic Analysis",
    shortTitle: "Layer 4",
    description:
      "Heuristic semantic scoring evaluates policy compliance, leakage risk, external release risk, commitment risk, and bypass risk.",
  },
  {
    key: "router",
    title: "Router & Fusion",
    shortTitle: "Layer 5",
    description:
      "Tex fuses deterministic, specialist, semantic, and criticality signals into one final score, confidence value, and verdict.",
  },
  {
    key: "evidence",
    title: "Evidence Chain",
    shortTitle: "Layer 6",
    description:
      "Every decision is anchored to an evidence record with a chain state and exportable audit footprint.",
  },
];

export const POLICY = {
  policy_id: null,
  policy_version: POLICY_VERSION,
  blocked_terms: [
    "ignore policy",
    "skip approval",
    "skip review",
    "disable logging",
    "remove audit",
  ],
  sensitive_entities: [
    "pricing sheet",
    "customer list",
    "internal roadmap",
    "production credentials",
    "security questionnaire",
  ],
  weights: {
    deterministic: 0.3,
    specialists: 0.25,
    semantic: 0.35,
    criticality: 0.1,
  },
  thresholds: {
    permit_max: 0.34,
    forbid_min: 0.72,
    semantic_forbid_floor: 0.45,
    confidence_min: 0.62,
  },
  criticality: {
    environment: {
      production: 0.7,
      staging: 0.0,
      development: 0.0,
      dev: 0.0,
    },
    channel: {
      email: 0.6,
      api: 0.0,
      slack: 0.0,
    },
    action_type: {
      outbound_email: 0.5,
      api_call: 0.0,
      slack_message: 0.0,
      database_query: 0.0,
      code_deployment: 0.0,
    },
  },
};

export const VERDICT_META = {
  PERMIT: {
    label: "PERMIT",
    accentClass:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.18)]",
    badgeClass:
      "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    ringClass: "ring-1 ring-emerald-400/30",
    glowClass: "shadow-[0_0_80px_rgba(16,185,129,0.12)]",
  },
  ABSTAIN: {
    label: "ABSTAIN",
    accentClass:
      "border-amber-500/40 bg-amber-500/10 text-amber-200 shadow-[0_0_35px_rgba(245,158,11,0.18)]",
    badgeClass:
      "border border-amber-400/30 bg-amber-500/10 text-amber-200",
    ringClass: "ring-1 ring-amber-400/30",
    glowClass: "shadow-[0_0_80px_rgba(245,158,11,0.12)]",
  },
  FORBID: {
    label: "FORBID",
    accentClass:
      "border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.18)]",
    badgeClass: "border border-rose-400/30 bg-rose-500/10 text-rose-300",
    ringClass: "ring-1 ring-rose-400/30",
    glowClass: "shadow-[0_0_80px_rgba(244,63,94,0.12)]",
  },
};

export const SEVERITY_META = {
  INFO: {
    label: "INFO",
    className: "border border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  },
  WARNING: {
    label: "WARNING",
    className:
      "border border-amber-400/20 bg-amber-400/10 text-amber-200",
  },
  CRITICAL: {
    label: "CRITICAL",
    className: "border border-rose-400/20 bg-rose-400/10 text-rose-200",
  },
};

export const EMPTY_DECISION_STATE = {
  request_id: null,
  mode: MODES.STANDALONE,
  verdict: null,
  confidence: null,
  final_score: null,
  policy_version: POLICY_VERSION,
  deterministic: null,
  retrieval: null,
  specialists: null,
  semantic: null,
  router: null,
  evidence: null,
};

export const FONT_IMPORT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
`;

export const SURFACE_CLASSES = {
  page:
    "min-h-screen bg-[#0a0a0f] text-zinc-100 selection:bg-cyan-400/20 selection:text-cyan-100",
  panel:
    "rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl",
  panelStrong:
    "rounded-3xl border border-cyan-400/15 bg-gradient-to-b from-white/[0.05] to-white/[0.025] backdrop-blur-xl",
  panelMuted:
    "rounded-2xl border border-white/8 bg-white/[0.025] backdrop-blur-md",
  label:
    "font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/80",
  heading:
    "font-mono text-sm font-semibold uppercase tracking-[0.24em] text-white/92",
  technical:
    "font-mono text-[12px] leading-relaxed text-zinc-300",
};

export const API_ENDPOINT = "/api/evaluate";