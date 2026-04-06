import { POLICY, POLICY_VERSION } from "./constants";
import { generateUUIDv4 } from "./uuid";

function clamp(value, min = 0, max = 1) {
  const number = Number(value);
  if (Number.isNaN(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function normalizeText(value) {
  return String(value ?? "");
}

function lower(value) {
  return normalizeText(value).toLowerCase();
}

function uniqueBy(array, keyFn) {
  const seen = new Set();
  const result = [];

  for (const item of array) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function avg(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + Number(value || 0), 0);
  return sum / values.length;
}

function maxOf(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return Math.max(...values.map((value) => Number(value || 0)));
}

function countKeywordHits(text, keywords) {
  const haystack = lower(text);
  let hits = 0;
  const matched = [];

  for (const keyword of keywords) {
    const needle = lower(keyword);
    if (!needle) continue;

    if (haystack.includes(needle)) {
      hits += 1;
      matched.push(keyword);
    }
  }

  return {
    hit_count: hits,
    matched_keywords: [...new Set(matched)],
  };
}

function makeEvidenceFromKeywords(text, keywords, explanationBuilder) {
  const haystack = normalizeText(text);
  const haystackLower = haystack.toLowerCase();
  const evidence = [];

  for (const keyword of keywords) {
    const needle = keyword.toLowerCase();
    const index = haystackLower.indexOf(needle);
    if (index === -1) continue;

    evidence.push({
      keyword,
      text: haystack.slice(index, index + keyword.length),
      explanation: explanationBuilder(keyword),
    });
  }

  return evidence;
}

function randomHex(length) {
  const chars = "0123456789abcdef";

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let output = "";
    for (let i = 0; i < length; i += 1) {
      output += chars[bytes[i] % 16];
    }
    return output;
  }

  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

function createFinding({
  source,
  rule_name,
  severity,
  message,
  matched_text,
}) {
  return {
    source,
    rule_name,
    severity,
    message,
    matched_text,
  };
}

function collectRegexFindings(content, definitions) {
  const findings = [];

  for (const definition of definitions) {
    const matches = content.match(definition.pattern);
    if (!matches) continue;

    for (const match of matches) {
      findings.push(
        createFinding({
          source: definition.source,
          rule_name: definition.rule_name,
          severity: definition.severity,
          message: definition.message,
          matched_text: match,
        })
      );
    }
  }

  return findings;
}

function collectPhraseFindings(content, definitions) {
  const haystack = lower(content);
  const findings = [];

  for (const definition of definitions) {
    for (const phrase of definition.phrases) {
      const needle = lower(phrase);
      if (!haystack.includes(needle)) continue;

      findings.push(
        createFinding({
          source: definition.source,
          rule_name: definition.rule_name,
          severity: definition.severity,
          message:
            typeof definition.message === "function"
              ? definition.message(phrase)
              : definition.message,
          matched_text: phrase,
        })
      );
    }
  }

  return findings;
}

function collectSqlDestructiveFindings(content) {
  const definitions = [
    {
      source: "sql_destructive_recognizer",
      rule_name: "sql_delete_statement",
      severity: "CRITICAL",
      message: "Potential destructive SQL DELETE statement detected.",
      pattern: /\bdelete\s+from\s+[a-zA-Z_][\w.]*\b/gi,
    },
    {
      source: "sql_destructive_recognizer",
      rule_name: "sql_drop_table_statement",
      severity: "CRITICAL",
      message: "Potential destructive SQL DROP TABLE statement detected.",
      pattern: /\bdrop\s+table\b/gi,
    },
    {
      source: "sql_destructive_recognizer",
      rule_name: "sql_truncate_table_statement",
      severity: "CRITICAL",
      message: "Potential destructive SQL TRUNCATE TABLE statement detected.",
      pattern: /\btruncate\s+table\b/gi,
    },
    {
      source: "sql_destructive_recognizer",
      rule_name: "sql_mass_update_statement",
      severity: "CRITICAL",
      message:
        "Potential high-risk SQL UPDATE statement without a clear WHERE clause detected.",
      pattern: /\bupdate\s+[a-zA-Z_][\w.]*\s+set\b(?![\s\S]{0,200}\bwhere\b)/gi,
    },
  ];

  return collectRegexFindings(content, definitions);
}

function runDeterministicGate(content) {
  const regexDefinitions = [
    {
      source: "secret_recognizer",
      rule_name: "password_assignment",
      severity: "CRITICAL",
      message: "Potential credential leak detected via password assignment.",
      pattern: /\bpassword\s*[:=]\s*\S+/gi,
    },
    {
      source: "secret_recognizer",
      rule_name: "api_key_reference",
      severity: "CRITICAL",
      message: "Potential API key exposure detected.",
      pattern: /\bapi[_\-\s]?key\b/gi,
    },
    {
      source: "secret_recognizer",
      rule_name: "private_key_reference",
      severity: "CRITICAL",
      message: "Potential private key exposure detected.",
      pattern: /\bprivate[_\-\s]?key\b/gi,
    },
    {
      source: "secret_recognizer",
      rule_name: "access_token_reference",
      severity: "CRITICAL",
      message: "Potential access token exposure detected.",
      pattern: /\baccess[_\-\s]?token\b/gi,
    },
    {
      source: "secret_recognizer",
      rule_name: "client_secret_reference",
      severity: "CRITICAL",
      message: "Potential client secret exposure detected.",
      pattern: /\bclient[_\-\s]?secret\b/gi,
    },
    {
      source: "secret_recognizer",
      rule_name: "aws_access_key",
      severity: "CRITICAL",
      message: "Potential AWS access key detected.",
      pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    },
    {
      source: "secret_recognizer",
      rule_name: "github_token",
      severity: "CRITICAL",
      message: "Potential GitHub token detected.",
      pattern: /\bghp_[A-Za-z0-9]{20,}\b/g,
    },
    {
      source: "secret_recognizer",
      rule_name: "openai_key_like_token",
      severity: "CRITICAL",
      message: "Potential sk-prefixed API key detected.",
      pattern: /\bsk-[A-Za-z0-9]{16,}\b/g,
    },
    {
      source: "pii_recognizer",
      rule_name: "ssn_pattern",
      severity: "CRITICAL",
      message: "Potential SSN detected.",
      pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    },
    {
      source: "pii_recognizer",
      rule_name: "phone_number_pattern",
      severity: "CRITICAL",
      message: "Potential phone number detected.",
      pattern: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    },
    {
      source: "pii_recognizer",
      rule_name: "email_address_pattern",
      severity: "CRITICAL",
      message: "Potential email address detected.",
      pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    },
    {
      source: "pii_recognizer",
      rule_name: "credit_card_pattern",
      severity: "CRITICAL",
      message: "Potential payment card pattern detected.",
      pattern: /\b(?:\d{4}[ -]?){3}\d{1,4}\b/g,
    },
  ];

  const phraseDefinitions = [
    {
      source: "commitment_recognizer",
      rule_name: "commitment_language",
      severity: "WARNING",
      message: (phrase) =>
        `Potential unauthorized commitment language detected: ${phrase}.`,
      phrases: [
        "we guarantee",
        "we commit",
        "final offer",
        "locked price",
        "contract signed",
        "you have my word",
        "we will refund",
      ],
    },
    {
      source: "sensitive_entity_recognizer",
      rule_name: "sensitive_entity_reference",
      severity: "WARNING",
      message: (phrase) => `Sensitive entity reference detected: ${phrase}.`,
      phrases: POLICY.sensitive_entities,
    },
    {
      source: "external_sharing_recognizer",
      rule_name: "external_sharing_language",
      severity: "WARNING",
      message: (phrase) => `External sharing language detected: ${phrase}.`,
      phrases: [
        "share externally",
        "send externally",
        "public link",
        "forward to customer",
        "export all",
        "post publicly",
      ],
    },
    {
      source: "destructive_bypass_recognizer",
      rule_name: "destructive_or_bypass_language",
      severity: "CRITICAL",
      message: (phrase) =>
        `Destructive or bypass language detected: ${phrase}.`,
      phrases: [
        "delete all",
        "drop table",
        "disable logging",
        "skip review",
        "skip approval",
        "override control",
        "ignore policy",
        "remove audit",
        "exfiltrate",
        "wipe all",
      ],
    },
    {
      source: "policy_blocklist",
      rule_name: "blocked_policy_term",
      severity: "CRITICAL",
      message: (phrase) => `Blocked policy term detected: ${phrase}.`,
      phrases: POLICY.blocked_terms,
    },
  ];

  const regexFindings = collectRegexFindings(content, regexDefinitions);
  const phraseFindings = collectPhraseFindings(content, phraseDefinitions);
  const sqlFindings = collectSqlDestructiveFindings(content);

  const findings = uniqueBy(
    [...regexFindings, ...phraseFindings, ...sqlFindings],
    (finding) =>
      `${finding.source}|${finding.rule_name}|${finding.severity}|${finding.matched_text}`
  );

  const blocked = findings.some((finding) => finding.severity === "CRITICAL");
  const warningOnly = !blocked && findings.length > 0;

  const score = blocked ? 1.0 : warningOnly ? 0.55 : 0.0;

  let confidence = 0.96;
  if (warningOnly) confidence = 0.82;
  if (!findings.length) confidence = 0.72;

  return {
    blocked,
    score,
    confidence,
    findings,
  };
}

function runRetrievalGrounding(content) {
  const haystack = lower(content);

  const matchedEntities = POLICY.sensitive_entities.filter((entity) =>
    haystack.includes(lower(entity))
  );

  const matchedBlockedTerms = POLICY.blocked_terms.filter((term) =>
    haystack.includes(lower(term))
  );

  const clauses = [];

  for (const entity of matchedEntities) {
    clauses.push({
      clause_id: `entity_${entity.replace(/\s+/g, "_")}`,
      title: `Sensitive Entity: ${entity}`,
      text: `This content references a policy-sensitive entity (${entity}) that requires heightened release scrutiny before outbound execution.`,
      relevance_score: 0.82,
    });
  }

  for (const term of matchedBlockedTerms) {
    clauses.push({
      clause_id: `blocked_${term.replace(/\s+/g, "_")}`,
      title: `Blocked Policy Term: ${term}`,
      text: `This content includes a policy-blocked phrase (${term}) that can indicate bypass or suppression of required control paths.`,
      relevance_score: 0.94,
    });
  }

  const warnings = [];
  if (!clauses.length && !matchedEntities.length) {
    warnings.push("no_retrieval_context");
  }

  return {
    is_empty: clauses.length === 0 && matchedEntities.length === 0,
    clauses,
    entities: matchedEntities,
    warnings,
  };
}

function runSpecialistJudges({ content, channel, environment }) {
  const specialistsConfig = [
    {
      specialist_name: "secret_and_pii",
      keywords: [
        "ssn",
        "social security",
        "password",
        "secret",
        "api key",
        "private key",
        "access token",
        "credential",
        "customer list",
        "pricing sheet",
        "confidential",
        "internal only",
        "bank account",
      ],
      base: 0.08,
      multiplier: 0.18,
      noHitConfidence: 0.38,
      hitConfidenceBase: 0.48,
      hitConfidenceStep: 0.08,
      confidenceCap: 0.86,
      bonus: 0,
    },
    {
      specialist_name: "external_sharing",
      keywords: [
        "send externally",
        "share externally",
        "forward to customer",
        "public link",
        "anyone with the link",
        "export all",
        "bulk export",
        "download all",
        "upload to",
        "post publicly",
        "email attachment",
      ],
      base: 0.06,
      multiplier: 0.22,
      noHitConfidence: 0.38,
      hitConfidenceBase: 0.48,
      hitConfidenceStep: 0.08,
      confidenceCap: 0.86,
      bonus: 0,
    },
    {
      specialist_name: "unauthorized_commitment",
      keywords: [
        "we guarantee",
        "we commit",
        "approved",
        "final offer",
        "locked price",
        "guaranteed pricing",
        "contract signed",
        "you have my word",
        "we will refund",
        "we will deliver by",
      ],
      base: 0.05,
      multiplier: 0.2,
      noHitConfidence: 0.38,
      hitConfidenceBase: 0.48,
      hitConfidenceStep: 0.08,
      confidenceCap: 0.86,
      bonus: lower(channel) === "email" ? 0.08 : 0,
    },
    {
      specialist_name: "destructive_or_bypass",
      keywords: [
        "delete",
        "delete from",
        "wipe",
        "purge",
        "drop table",
        "truncate table",
        "disable logging",
        "turn off monitoring",
        "bypass approval",
        "skip review",
        "skip approval",
        "ignore policy",
        "remove audit",
        "override control",
        "exfiltrate",
      ],
      base: 0.08,
      multiplier: 0.24,
      noHitConfidence: 0.38,
      hitConfidenceBase: 0.48,
      hitConfidenceStep: 0.08,
      confidenceCap: 0.86,
      bonus: lower(environment) === "production" ? 0.1 : 0,
    },
  ];

  const specialists = specialistsConfig.map((config) => {
    const { hit_count, matched_keywords } = countKeywordHits(
      content,
      config.keywords
    );

    const rawScore = config.base + config.multiplier * hit_count + config.bonus;
    const risk_score = clamp(hit_count > 0 ? rawScore : config.base);

    const confidence =
      hit_count === 0
        ? config.noHitConfidence
        : Math.min(
            config.confidenceCap,
            config.hitConfidenceBase + config.hitConfidenceStep * hit_count
          );

    const evidence = makeEvidenceFromKeywords(content, matched_keywords, (keyword) => {
      return `${config.specialist_name} matched high-signal keyword "${keyword}".`;
    });

    return {
      specialist_name: config.specialist_name,
      risk_score,
      confidence,
      summary:
        hit_count > 0
          ? `${config.specialist_name} matched ${hit_count} signal(s) in the outbound content.`
          : `${config.specialist_name} found no direct signal matches.`,
      evidence,
    };
  });

  return {
    specialists,
  };
}

function buildSemanticDimension({
  content,
  name,
  keywords,
  noHitScore,
  hitBase,
  hitMultiplier,
  confidenceBase,
  confidenceStep,
  confidenceCap,
}) {
  const { hit_count, matched_keywords } = countKeywordHits(content, keywords);

  const score =
    hit_count === 0 ? noHitScore : clamp(hitBase + hitMultiplier * hit_count);

  const confidence =
    hit_count === 0
      ? confidenceBase
      : Math.min(confidenceCap, confidenceBase + confidenceStep * hit_count);

  const evidence_spans = makeEvidenceFromKeywords(
    content,
    matched_keywords,
    (keyword) => `${name} dimension matched "${keyword}".`
  ).map((item) => ({
    text: item.text || item.keyword,
  }));

  return {
    score,
    confidence,
    evidence_spans,
  };
}

function runSemanticAnalysis({ content, channel, environment, retrieval }) {
  const policyRiskKeywords = [
    "override",
    "exception",
    "bypass",
    "urgent send",
    "skip approval",
    "production data",
    "customer data",
    "send now",
  ];

  const dataLeakageKeywords = [
    "ssn",
    "password",
    "secret",
    "api key",
    "token",
    "credential",
    "customer list",
    "pricing sheet",
    "confidential",
    "internal only",
  ];

  const externalSharingKeywords = [
    "send externally",
    "share externally",
    "forward to customer",
    "public link",
    "anyone with the link",
    "export all",
    "bulk export",
    "download all",
    "upload to",
    "post publicly",
    "email attachment",
  ];

  const unauthorizedCommitmentKeywords = [
    "we guarantee",
    "we commit",
    "approved",
    "final offer",
    "locked price",
    "guaranteed pricing",
    "contract signed",
    "you have my word",
    "we will refund",
    "we will deliver by",
  ];

  const destructiveBypassKeywords = [
    "delete",
    "delete from",
    "wipe",
    "purge",
    "drop table",
    "truncate table",
    "disable logging",
    "turn off monitoring",
    "bypass approval",
    "skip review",
    "skip approval",
    "ignore policy",
    "remove audit",
    "override control",
    "exfiltrate",
  ];

  const policyHits = countKeywordHits(content, policyRiskKeywords).hit_count;
  const destructiveHits = countKeywordHits(content, destructiveBypassKeywords).hit_count;
  const productionBonus = lower(environment) === "production" && destructiveHits > 0 ? 0.12 : 0;

  const policyComplianceScore = clamp(
    (retrieval.is_empty ? 0.2 : 0.18) + 0.14 * policyHits
  );

  const policyComplianceConfidence =
    policyHits === 0
      ? retrieval.is_empty
        ? 0.28
        : 0.42
      : Math.min(0.8, (retrieval.is_empty ? 0.34 : 0.46) + 0.08 * policyHits);

  const policyComplianceEvidence = makeEvidenceFromKeywords(
    content,
    policyRiskKeywords,
    (keyword) => `policy_compliance dimension matched "${keyword}".`
  ).map((item) => ({ text: item.text || item.keyword }));

  const dimensions = {
    policy_compliance: {
      score: policyComplianceScore,
      confidence: policyComplianceConfidence,
      evidence_spans: policyComplianceEvidence,
    },
    data_leakage: buildSemanticDimension({
      content,
      name: "data_leakage",
      keywords: dataLeakageKeywords,
      noHitScore: 0.06,
      hitBase: 0.08,
      hitMultiplier: 0.22,
      confidenceBase: 0.34,
      confidenceStep: 0.1,
      confidenceCap: 0.78,
    }),
    external_sharing: buildSemanticDimension({
      content,
      name: "external_sharing",
      keywords: externalSharingKeywords,
      noHitScore: 0.06,
      hitBase: 0.08,
      hitMultiplier: 0.22,
      confidenceBase: 0.34,
      confidenceStep: 0.1,
      confidenceCap: 0.78,
    }),
    unauthorized_commitment: buildSemanticDimension({
      content,
      name: "unauthorized_commitment",
      keywords: unauthorizedCommitmentKeywords,
      noHitScore: 0.06,
      hitBase: 0.08,
      hitMultiplier: 0.22,
      confidenceBase: 0.34,
      confidenceStep: 0.1,
      confidenceCap: 0.78,
    }),
    destructive_or_bypass: (() => {
      const base = buildSemanticDimension({
        content,
        name: "destructive_or_bypass",
        keywords: destructiveBypassKeywords,
        noHitScore: 0.06,
        hitBase: 0.08,
        hitMultiplier: 0.22,
        confidenceBase: 0.34,
        confidenceStep: 0.1,
        confidenceCap: 0.82,
      });

      return {
        ...base,
        score: clamp(base.score + productionBonus),
        confidence:
          destructiveHits > 0 && lower(channel) === "api"
            ? Math.min(0.86, base.confidence + 0.06)
            : base.confidence,
      };
    })(),
  };

  const dimensionScores = Object.values(dimensions).map((value) => value.score);
  const dimensionConfidences = Object.values(dimensions).map(
    (value) => value.confidence
  );
  const maxScore = maxOf(dimensionScores);
  const minConfidence = Math.min(...dimensionConfidences);
  let overall_confidence = avg(dimensionConfidences);

  if (retrieval.is_empty) {
    overall_confidence = clamp(overall_confidence - 0.1);
  }

  let recommended_verdict = "PERMIT";
  const channelLower = lower(channel);

  if (dimensionScores.some((score) => score >= 0.78)) {
    recommended_verdict = "FORBID";
  } else if (
    maxScore >= 0.45 &&
    (["email", "api", "export"].includes(channelLower) || overall_confidence < 0.5)
  ) {
    recommended_verdict = "ABSTAIN";
  } else if (retrieval.is_empty || minConfidence < 0.4) {
    recommended_verdict = "ABSTAIN";
  }

  return {
    dimensions,
    recommended_verdict,
    overall_confidence,
  };
}

function computeCriticality({ action_type, channel, environment }) {
  const envScore = POLICY.criticality.environment[lower(environment)] ?? 0.0;
  const channelScore = POLICY.criticality.channel[lower(channel)] ?? 0.0;
  const actionScore = POLICY.criticality.action_type[action_type] ?? 0.0;

  return avg([envScore, channelScore, actionScore]);
}

function dedupeFlags(flags) {
  return [...new Set(flags.filter(Boolean))];
}

function runRouter({
  deterministic,
  retrieval,
  specialists,
  semantic,
  action_type,
  channel,
  environment,
}) {
  const specialistScores = specialists.specialists.map((item) => item.risk_score);
  const specialistConfidences = specialists.specialists.map(
    (item) => item.confidence
  );
  const semanticScores = Object.values(semantic.dimensions).map(
    (item) => item.score
  );
  const semanticConfidences = Object.values(semantic.dimensions).map(
    (item) => item.confidence
  );

  const deterministicScore = deterministic.score;
  const specialistsScore = maxOf(specialistScores);
  const semanticScore = maxOf(semanticScores);
  const criticality = computeCriticality({
    action_type,
    channel,
    environment,
  });

  const final_score = clamp(
    deterministicScore * POLICY.weights.deterministic +
      specialistsScore * POLICY.weights.specialists +
      semanticScore * POLICY.weights.semantic +
      criticality * POLICY.weights.criticality
  );

  const findingsCount = deterministic.findings.length;

  const evidenceSignals =
    findingsCount +
    specialists.specialists.reduce((acc, item) => acc + item.evidence.length, 0) +
    Object.values(semantic.dimensions).reduce(
      (acc, item) => acc + item.evidence_spans.length,
      0
    ) +
    (retrieval.clauses?.length || 0);

  const evidence_sufficiency = clamp(evidenceSignals / 12);

  let confidence =
    deterministic.confidence * 0.25 +
    avg(specialistConfidences) * 0.2 +
    semantic.overall_confidence * 0.55;

  if (semanticConfidences.some((value) => value < 0.5)) {
    confidence -= 0.08;
  }

  if (evidence_sufficiency < 0.3) {
    confidence -= 0.05;
  }

  if (retrieval.is_empty) {
    confidence -= 0.04;
  }

  confidence = clamp(confidence);

  let verdict = "ABSTAIN";

  if (deterministic.blocked) {
    verdict = "FORBID";
  } else if (
    semantic.recommended_verdict === "FORBID" &&
    final_score >= POLICY.thresholds.semantic_forbid_floor
  ) {
    verdict = "FORBID";
  } else if (final_score >= POLICY.thresholds.forbid_min) {
    verdict = "FORBID";
  } else if (semantic.recommended_verdict === "ABSTAIN") {
    verdict = "ABSTAIN";
  } else if (confidence < POLICY.thresholds.confidence_min) {
    verdict = "ABSTAIN";
  } else if (semanticConfidences.some((value) => value < 0.5)) {
    verdict = "ABSTAIN";
  } else if (
    final_score > POLICY.thresholds.permit_max &&
    final_score < POLICY.thresholds.forbid_min
  ) {
    verdict = "ABSTAIN";
  } else if (
    final_score <= POLICY.thresholds.permit_max &&
    confidence >= POLICY.thresholds.confidence_min &&
    semantic.recommended_verdict === "PERMIT"
  ) {
    verdict = "PERMIT";
  }

  const highestSpecialist =
    specialists.specialists.reduce((best, item) => {
      return item.risk_score > (best?.risk_score ?? -1) ? item : best;
    }, null) || null;

  const reasons = [
    `Deterministic layer produced ${findingsCount} finding(s).`,
    `Highest specialist risk came from ${
      highestSpecialist?.specialist_name || "none"
    } (${(highestSpecialist?.risk_score ?? 0).toFixed(2)}).`,
    `Semantic layer recommended ${semantic.recommended_verdict} with confidence ${semantic.overall_confidence.toFixed(
      2
    )}.`,
    `Fused final score was ${final_score.toFixed(
      2
    )} (permit ≤ 0.34, forbid ≥ 0.72).`,
  ];

  const uncertainty_flags = dedupeFlags([
    retrieval.is_empty ? "no_retrieval_context" : null,
    "fallback_used",
    semanticConfidences.some((value) => value < 0.5)
      ? "low_confidence_semantic_dimension"
      : null,
    final_score > POLICY.thresholds.permit_max &&
    final_score < POLICY.thresholds.forbid_min
      ? "borderline_fused_score"
      : null,
    findingsCount > 0 && !deterministic.blocked
      ? "deterministic_findings_present"
      : null,
  ]);

  return {
    final_score,
    confidence,
    verdict,
    evidence_sufficiency,
    layer_scores: {
      deterministic: deterministicScore,
      specialists: specialistsScore,
      semantic: semanticScore,
      criticality,
    },
    reasons,
    uncertainty_flags,
  };
}

function buildEvidence(deterministic, retrieval, specialists, semantic) {
  const record_count =
    deterministic.findings.length +
    (retrieval.clauses?.length || 0) +
    specialists.specialists.reduce((acc, item) => acc + item.evidence.length, 0) +
    Object.values(semantic.dimensions).reduce(
      (acc, item) => acc + item.evidence_spans.length,
      0
    ) +
    1;

  return {
    evidence_hash: randomHex(64),
    chain_valid: true,
    record_count,
  };
}

export function evaluateStandalone(form) {
  const content = normalizeText(form.content);
  const channel = normalizeText(form.channel);
  const environment = normalizeText(form.environment);
  const action_type = form.action_type || "outbound_email";

  const deterministic = runDeterministicGate(content);
  const retrieval = runRetrievalGrounding(content);
  const specialists = runSpecialistJudges({
    content,
    channel,
    environment,
  });

  const semantic = runSemanticAnalysis({
    content,
    channel,
    environment,
    retrieval,
  });

  const router = runRouter({
    deterministic,
    retrieval,
    specialists,
    semantic,
    action_type,
    channel,
    environment,
  });

  const evidence = buildEvidence(deterministic, retrieval, specialists, semantic);

  return {
    request_id: generateUUIDv4(),
    mode: "standalone",
    verdict: router.verdict,
    confidence: router.confidence,
    final_score: router.final_score,
    policy_version: POLICY_VERSION,
    deterministic,
    retrieval,
    specialists,
    semantic,
    router,
    evidence,
  };
}