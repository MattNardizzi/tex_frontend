import { API_ENDPOINT, POLICY_VERSION } from "./constants";
import { generateUUIDv4 } from "./uuid";

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeVerdict(value) {
  if (value === "PERMIT" || value === "ABSTAIN" || value === "FORBID") {
    return value;
  }
  return "ABSTAIN";
}

function normalizeDeterministic(raw) {
  const data = normalizeObject(raw);

  return {
    blocked: Boolean(data.blocked),
    score: typeof data.score === "number" ? data.score : 0,
    confidence: typeof data.confidence === "number" ? data.confidence : 0.7,
    findings: normalizeArray(data.findings).map((finding) => ({
      source: finding?.source || "deterministic",
      rule_name: finding?.rule_name || "unknown_rule",
      severity: finding?.severity || "INFO",
      message: finding?.message || "No finding message provided.",
      matched_text: finding?.matched_text || "",
    })),
  };
}

function normalizeRetrieval(raw) {
  const data = normalizeObject(raw);

  return {
    is_empty: Boolean(data.is_empty),
    clauses: normalizeArray(data.clauses).map((clause, index) => ({
      clause_id: clause?.clause_id || `clause_${index + 1}`,
      title: clause?.title || "Matched Policy Clause",
      text: clause?.text || "No clause text provided.",
      relevance_score:
        typeof clause?.relevance_score === "number" ? clause.relevance_score : 0,
    })),
    entities: normalizeArray(data.entities).map(String),
    warnings: normalizeArray(data.warnings).map(String),
  };
}

function normalizeSpecialists(raw) {
  const data = normalizeObject(raw);

  const specialists = normalizeArray(data.specialists).map((item, index) => ({
    specialist_name: item?.specialist_name || `specialist_${index + 1}`,
    risk_score: typeof item?.risk_score === "number" ? item.risk_score : 0,
    confidence: typeof item?.confidence === "number" ? item.confidence : 0,
    summary: item?.summary || "No specialist summary provided.",
    evidence: normalizeArray(item?.evidence).map((evidenceItem) => ({
      keyword: evidenceItem?.keyword || evidenceItem?.matched_text || "signal",
      text: evidenceItem?.text || evidenceItem?.matched_text || "",
      explanation:
        evidenceItem?.explanation ||
        evidenceItem?.message ||
        "Matched specialist signal.",
    })),
  }));

  return { specialists };
}

function normalizeSemantic(raw) {
  const data = normalizeObject(raw);
  const rawDimensions = normalizeObject(data.dimensions);

  const dimensions = Object.fromEntries(
    Object.entries(rawDimensions).map(([key, value]) => [
      key,
      {
        score: typeof value?.score === "number" ? value.score : 0,
        confidence: typeof value?.confidence === "number" ? value.confidence : 0,
        evidence_spans: normalizeArray(value?.evidence_spans).map((span) => ({
          text: span?.text || span?.matched_text || "",
        })),
      },
    ])
  );

  return {
    dimensions,
    recommended_verdict: normalizeVerdict(data.recommended_verdict),
    overall_confidence:
      typeof data.overall_confidence === "number" ? data.overall_confidence : 0,
  };
}

function normalizeRouter(raw, fallbackVerdict) {
  const data = normalizeObject(raw);
  const layerScores = normalizeObject(data.layer_scores);

  return {
    final_score: typeof data.final_score === "number" ? data.final_score : 0,
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
    verdict: normalizeVerdict(data.verdict || fallbackVerdict),
    evidence_sufficiency:
      typeof data.evidence_sufficiency === "number" ? data.evidence_sufficiency : 1,
    layer_scores: {
      deterministic:
        typeof layerScores.deterministic === "number"
          ? layerScores.deterministic
          : 0,
      specialists:
        typeof layerScores.specialists === "number" ? layerScores.specialists : 0,
      semantic: typeof layerScores.semantic === "number" ? layerScores.semantic : 0,
      criticality:
        typeof layerScores.criticality === "number" ? layerScores.criticality : 0,
    },
    reasons: normalizeArray(data.reasons).map(String),
    uncertainty_flags: normalizeArray(data.uncertainty_flags).map(String),
  };
}

function normalizeEvidence(raw, deterministic) {
  const data = normalizeObject(raw);

  return {
    evidence_hash: data.evidence_hash || "",
    chain_valid:
      typeof data.chain_valid === "boolean" ? data.chain_valid : true,
    record_count:
      typeof data.record_count === "number"
        ? data.record_count
        : normalizeArray(deterministic?.findings).length + 1,
  };
}

export function normalizeApiDecision(rawResponse, mode = "api") {
  const response = normalizeObject(rawResponse);

  const verdict = normalizeVerdict(response.verdict);
  const deterministic = normalizeDeterministic(response.deterministic);
  const retrieval = normalizeRetrieval(response.retrieval);
  const specialists = normalizeSpecialists(response.specialists);
  const semantic = normalizeSemantic(response.semantic);
  const router = normalizeRouter(response.router, verdict);
  const evidence = normalizeEvidence(response.evidence, deterministic);

  return {
    request_id: response.request_id || null,
    mode,
    verdict,
    confidence:
      typeof response.confidence === "number"
        ? response.confidence
        : router.confidence,
    final_score:
      typeof response.final_score === "number"
        ? response.final_score
        : router.final_score,
    policy_version: response.policy_version || POLICY_VERSION,
    deterministic,
    retrieval,
    specialists,
    semantic,
    router,
    evidence,
  };
}

export async function evaluateViaApi(form) {
  const payload = {
    request_id: generateUUIDv4(),
    action_type: form.action_type,
    content: form.content,
    recipient: form.recipient || null,
    channel: form.channel,
    environment: form.environment,
    metadata: {},
    policy_id: null,
  };

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `API evaluation failed (${response.status})${text ? `: ${text}` : ""}`
    );
  }

  const data = await response.json();
  return normalizeApiDecision(data, "api");
}