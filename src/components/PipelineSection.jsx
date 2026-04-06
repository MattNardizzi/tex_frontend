import React, { useMemo, useState } from "react";
import ExpandableLayerCard from "./ExpandableLayerCard";
import {
  PIPELINE_LAYERS,
  SEVERITY_META,
} from "../lib/constants";
import {
  formatPercent,
  formatScore,
  safeArray,
  safeObject,
  titleCaseFromSnake,
  truncateMiddle,
  uppercaseLabel,
} from "../lib/formatters";

function SeverityPill({ severity }) {
  const meta =
    SEVERITY_META[(severity || "INFO").toUpperCase()] || SEVERITY_META.INFO;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1",
        "font-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
        meta.className,
      ].join(" ")}
    >
      {meta.label}
    </span>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-xs leading-6 text-zinc-200">{value}</p>
    </div>
  );
}

function FindingCard({ finding }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/75">
            {uppercaseLabel(finding.source || "deterministic")}
          </p>
          <h4 className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">
            {titleCaseFromSnake(finding.rule_name || "unknown_rule")}
          </h4>
        </div>

        <SeverityPill severity={finding.severity} />
      </div>

      <p className="mt-3 font-mono text-xs leading-6 text-zinc-300">
        {finding.message || "No finding message provided."}
      </p>

      <div className="mt-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Matched Text
        </p>
        <p className="mt-1 break-words font-mono text-xs leading-6 text-zinc-200">
          {finding.matched_text || "—"}
        </p>
      </div>
    </div>
  );
}

function ClauseCard({ clause }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/75">
            {clause.clause_id || "policy_clause"}
          </p>
          <h4 className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">
            {clause.title || "Matched Policy Clause"}
          </h4>
        </div>

        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
          {formatScore(clause.relevance_score)}
        </div>
      </div>

      <p className="mt-3 font-mono text-xs leading-6 text-zinc-300">
        {clause.text || "No clause text provided."}
      </p>
    </div>
  );
}

function SpecialistCard({ specialist }) {
  const evidence = safeArray(specialist.evidence);

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/75">
            Specialist
          </p>
          <h4 className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">
            {specialist.specialist_name || "unknown_specialist"}
          </h4>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Risk
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              {formatScore(specialist.risk_score)}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Confidence
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              {formatPercent(specialist.confidence, 0)}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 font-mono text-xs leading-6 text-zinc-300">
        {specialist.summary || "No summary provided."}
      </p>

      <div className="mt-4 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Evidence
        </p>

        {evidence.length ? (
          <div className="space-y-2">
            {evidence.map((item, index) => (
              <div
                key={`${specialist.specialist_name}-${index}`}
                className="rounded-xl border border-white/8 bg-black/20 px-3 py-2"
              >
                <p className="font-mono text-xs leading-6 text-zinc-200">
                  <span className="text-cyan-200">
                    {item.keyword || item.text || "signal"}:
                  </span>{" "}
                  {item.explanation || item.message || "Matched specialist signal."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-xs text-zinc-500">
            No evidence items.
          </div>
        )}
      </div>
    </div>
  );
}

function SemanticDimensionCard({ name, value }) {
  const evidenceSpans = safeArray(value.evidence_spans);

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/75">
            Dimension
          </p>
          <h4 className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">
            {titleCaseFromSnake(name)}
          </h4>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Score
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              {formatScore(value.score)}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Confidence
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              {formatPercent(value.confidence, 0)}
            </p>
          </div>
        </div>
      </div>

      {evidenceSpans.length ? (
        <div className="mt-4 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Evidence Spans
          </p>
          {evidenceSpans.map((span, index) => (
            <div
              key={`${name}-${index}`}
              className="rounded-xl border border-white/8 bg-black/20 px-3 py-2"
            >
              <p className="break-words font-mono text-xs leading-6 text-zinc-200">
                {span.text || span.matched_text || "Evidence span"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReasonsList({ reasons }) {
  const items = safeArray(reasons);

  if (!items.length) {
    return (
      <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-xs text-zinc-500">
        No routing reasons available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((reason, index) => (
        <div
          key={`reason-${index}`}
          className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-xs leading-6 text-zinc-200"
        >
          {reason}
        </div>
      ))}
    </div>
  );
}

function FlagsList({ flags }) {
  const items = safeArray(flags);

  if (!items.length) {
    return (
      <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-xs text-zinc-500">
        No uncertainty flags.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((flag) => (
        <span
          key={flag}
          className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200"
        >
          {flag}
        </span>
      ))}
    </div>
  );
}

function renderDeterministic(layer) {
  const findings = safeArray(layer.findings);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <KeyValue label="Blocked" value={layer.blocked ? "true" : "false"} />
        <KeyValue label="Score" value={formatScore(layer.score)} />
        <KeyValue label="Confidence" value={formatPercent(layer.confidence, 0)} />
        <KeyValue label="Finding Count" value={String(findings.length)} />
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Findings
        </p>
        {findings.length ? (
          findings.map((finding, index) => (
            <FindingCard key={`finding-${index}`} finding={finding} />
          ))
        ) : (
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 font-mono text-xs text-zinc-500">
            No recognizers fired.
          </div>
        )}
      </div>
    </div>
  );
}

function renderRetrieval(layer) {
  const clauses = safeArray(layer.clauses);
  const entities = safeArray(layer.entities);
  const warnings = safeArray(layer.warnings);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <KeyValue label="Empty" value={layer.is_empty ? "true" : "false"} />
        <KeyValue label="Clause Count" value={String(clauses.length)} />
        <KeyValue label="Entity Count" value={String(entities.length)} />
        <KeyValue label="Warning Count" value={String(warnings.length)} />
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Matched Clauses
        </p>
        {clauses.length ? (
          clauses.map((clause, index) => (
            <ClauseCard key={`clause-${index}`} clause={clause} />
          ))
        ) : (
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 font-mono text-xs text-zinc-500">
            No policy clauses matched.
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Entities Found
          </p>
          {entities.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {entities.map((entity) => (
                <span
                  key={entity}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200"
                >
                  {entity}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 font-mono text-xs text-zinc-500">
              No sensitive entities found.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Retrieval Warnings
          </p>
          {warnings.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {warnings.map((warning) => (
                <span
                  key={warning}
                  className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200"
                >
                  {warning}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 font-mono text-xs text-zinc-500">
              No retrieval warnings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function renderSpecialists(layer) {
  const specialists = safeArray(layer.specialists);

  return specialists.length ? (
    <div className="space-y-3">
      {specialists.map((specialist, index) => (
        <SpecialistCard key={`specialist-${index}`} specialist={specialist} />
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 font-mono text-xs text-zinc-500">
      No specialist output available.
    </div>
  );
}

function renderSemantic(layer) {
  const dimensions = safeObject(layer.dimensions);
  const entries = Object.entries(dimensions);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <KeyValue
          label="Recommended Verdict"
          value={layer.recommended_verdict || "—"}
        />
        <KeyValue
          label="Overall Confidence"
          value={formatPercent(layer.overall_confidence, 0)}
        />
        <KeyValue label="Dimension Count" value={String(entries.length)} />
      </div>

      {entries.length ? (
        <div className="space-y-3">
          {entries.map(([name, value]) => (
            <SemanticDimensionCard key={name} name={name} value={value} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 font-mono text-xs text-zinc-500">
          No semantic dimensions available.
        </div>
      )}
    </div>
  );
}

function renderRouter(layer) {
  const layerScores = safeObject(layer.layer_scores);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <KeyValue label="Final Score" value={formatScore(layer.final_score)} />
        <KeyValue label="Confidence" value={formatPercent(layer.confidence, 0)} />
        <KeyValue label="Verdict" value={layer.verdict || "—"} />
        <KeyValue
          label="Evidence Sufficiency"
          value={formatScore(layer.evidence_sufficiency)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KeyValue
          label="Deterministic"
          value={formatScore(layerScores.deterministic)}
        />
        <KeyValue
          label="Specialists"
          value={formatScore(layerScores.specialists)}
        />
        <KeyValue label="Semantic" value={formatScore(layerScores.semantic)} />
        <KeyValue
          label="Criticality"
          value={formatScore(layerScores.criticality)}
        />
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Reasons
        </p>
        <ReasonsList reasons={layer.reasons} />
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Uncertainty Flags
        </p>
        <FlagsList flags={layer.uncertainty_flags} />
      </div>
    </div>
  );
}

function renderEvidence(layer) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <KeyValue label="Chain Valid" value={layer.chain_valid ? "true" : "false"} />
      <KeyValue
        label="Record Count"
        value={String(layer.record_count ?? 0)}
      />
      <KeyValue
        label="Evidence Hash"
        value={truncateMiddle(layer.evidence_hash || "—", 16, 12)}
      />
    </div>
  );
}

function getAccent(layerKey, verdict) {
  if (layerKey === "evidence") return "cyan";
  if (verdict === "FORBID") return "red";
  if (verdict === "ABSTAIN") return "amber";
  if (verdict === "PERMIT") return "green";
  return "cyan";
}

export default function PipelineSection({ decision }) {
  const [openLayers, setOpenLayers] = useState(() => ({
    deterministic: true,
    retrieval: true,
    specialists: true,
    semantic: true,
    router: true,
    evidence: true,
  }));

  const layerData = useMemo(
    () => ({
      deterministic: safeObject(decision?.deterministic),
      retrieval: safeObject(decision?.retrieval),
      specialists: safeObject(decision?.specialists),
      semantic: safeObject(decision?.semantic),
      router: safeObject(decision?.router),
      evidence: safeObject(decision?.evidence),
    }),
    [decision]
  );

  function toggleLayer(layerKey) {
    setOpenLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  }

  function renderLayerContent(layerKey) {
    if (layerKey === "deterministic") return renderDeterministic(layerData.deterministic);
    if (layerKey === "retrieval") return renderRetrieval(layerData.retrieval);
    if (layerKey === "specialists") return renderSpecialists(layerData.specialists);
    if (layerKey === "semantic") return renderSemantic(layerData.semantic);
    if (layerKey === "router") return renderRouter(layerData.router);
    if (layerKey === "evidence") return renderEvidence(layerData.evidence);

    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 font-mono text-xs text-zinc-500">
        No layer renderer found.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {PIPELINE_LAYERS.map((layer, index) => (
        <ExpandableLayerCard
          key={layer.key}
          index={index + 1}
          title={layer.title}
          shortTitle={layer.shortTitle}
          description={layer.description}
          isOpen={Boolean(openLayers[layer.key])}
          onToggle={() => toggleLayer(layer.key)}
          accent={getAccent(layer.key, decision?.verdict)}
        >
          {renderLayerContent(layer.key)}
        </ExpandableLayerCard>
      ))}
    </section>
  );
}