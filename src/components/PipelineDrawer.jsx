import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import {
  PIPELINE_LAYERS,
  SEVERITY_META,
  VERDICT_META,
  SURFACE_CLASSES,
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

/* ── Shared sub-components ── */

function SeverityPill({ severity }) {
  const meta =
    SEVERITY_META[(severity || "INFO").toUpperCase()] || SEVERITY_META.INFO;
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5",
        "font-mono text-[9px] font-semibold uppercase tracking-[0.14em]",
        meta.className,
      ].join(" ")}
    >
      {meta.label}
    </span>
  );
}

function KV({ label, value }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-xs leading-5 text-zinc-200">{value}</p>
    </div>
  );
}

/* ── Layer renderers ── */

function renderDeterministic(data) {
  const findings = safeArray(data.findings);
  return (
    <div className="space-y-3">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        <KV label="Blocked" value={data.blocked ? "Yes" : "No"} />
        <KV label="Score" value={formatScore(data.score)} />
        <KV label="Confidence" value={formatPercent(data.confidence, 0)} />
        <KV label="Findings" value={String(findings.length)} />
      </div>
      {findings.length > 0 ? (
        <div className="space-y-2">
          {findings.map((f, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-mono text-xs font-semibold text-white">
                  {titleCaseFromSnake(f.rule_name || "unknown")}
                </p>
                <SeverityPill severity={f.severity} />
              </div>
              <p className="mt-1.5 font-mono text-[11px] leading-5 text-zinc-300">
                {f.message}
              </p>
              {f.matched_text ? (
                <p className="mt-1.5 rounded-lg bg-black/25 px-2.5 py-1 font-mono text-[11px] text-zinc-400 break-words">
                  {f.matched_text}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-xs text-zinc-500">
          No patterns detected.
        </p>
      )}
    </div>
  );
}

function renderRetrieval(data) {
  const clauses = safeArray(data.clauses);
  const entities = safeArray(data.entities);
  const warnings = safeArray(data.warnings);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        <KV label="Empty" value={data.is_empty ? "Yes" : "No"} />
        <KV label="Clauses" value={String(clauses.length)} />
        <KV label="Entities" value={String(entities.length)} />
        <KV label="Warnings" value={String(warnings.length)} />
      </div>
      {clauses.length > 0 ? (
        <div className="space-y-2">
          {clauses.map((c, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs font-semibold text-white">{c.title}</p>
                <span className="font-mono text-[10px] text-zinc-400">{formatScore(c.relevance_score)}</span>
              </div>
              <p className="mt-1 font-mono text-[11px] leading-5 text-zinc-300">{c.text}</p>
            </div>
          ))}
        </div>
      ) : null}
      {entities.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {entities.map((e) => (
            <span key={e} className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2.5 py-0.5 font-mono text-[10px] text-cyan-200">
              {e}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function renderSpecialists(data) {
  const specialists = safeArray(data.specialists);
  if (!specialists.length) {
    return <p className="font-mono text-xs text-zinc-500">No specialist output.</p>;
  }
  return (
    <div className="space-y-2">
      {specialists.map((s, i) => {
        const evidence = safeArray(s.evidence);
        return (
          <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-mono text-xs font-semibold text-white">
                {titleCaseFromSnake(s.specialist_name)}
              </p>
              <div className="flex gap-2">
                <span className="font-mono text-[10px] text-zinc-400">Risk: {formatScore(s.risk_score)}</span>
                <span className="font-mono text-[10px] text-zinc-400">Conf: {formatPercent(s.confidence, 0)}</span>
              </div>
            </div>
            <p className="mt-1 font-mono text-[11px] leading-5 text-zinc-300">{s.summary}</p>
            {evidence.length > 0 ? (
              <div className="mt-2 space-y-1">
                {evidence.map((e, j) => (
                  <p key={j} className="rounded-lg bg-black/25 px-2.5 py-1 font-mono text-[11px] text-zinc-400">
                    <span className="text-cyan-200">{e.keyword || "signal"}:</span> {e.explanation || e.text}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function renderSemantic(data) {
  const dims = safeObject(data.dimensions);
  const entries = Object.entries(dims);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 grid-cols-3">
        <KV label="Verdict" value={data.recommended_verdict || "—"} />
        <KV label="Confidence" value={formatPercent(data.overall_confidence, 0)} />
        <KV label="Dimensions" value={String(entries.length)} />
      </div>
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map(([name, v]) => (
            <div key={name} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-mono text-xs font-semibold text-white">
                  {titleCaseFromSnake(name)}
                </p>
                <div className="flex gap-2">
                  <span className="font-mono text-[10px] text-zinc-400">Score: {formatScore(v.score)}</span>
                  <span className="font-mono text-[10px] text-zinc-400">Conf: {formatPercent(v.confidence, 0)}</span>
                </div>
              </div>
              {safeArray(v.evidence_spans).length > 0 ? (
                <div className="mt-1.5 space-y-1">
                  {safeArray(v.evidence_spans).map((span, j) => (
                    <p key={j} className="rounded-lg bg-black/25 px-2.5 py-1 font-mono text-[11px] text-zinc-400 break-words">
                      {span.text || span.matched_text || "evidence"}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function renderRouter(data) {
  const layerScores = safeObject(data.layer_scores);
  const reasons = safeArray(data.reasons);
  const flags = safeArray(data.uncertainty_flags);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        <KV label="Final Score" value={formatScore(data.final_score)} />
        <KV label="Confidence" value={formatPercent(data.confidence, 0)} />
        <KV label="Verdict" value={data.verdict || "—"} />
        <KV label="Evidence" value={formatScore(data.evidence_sufficiency)} />
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        <KV label="Pattern Scan" value={formatScore(layerScores.deterministic)} />
        <KV label="Risk Judges" value={formatScore(layerScores.specialists)} />
        <KV label="Content Intel" value={formatScore(layerScores.semantic)} />
        <KV label="Criticality" value={formatScore(layerScores.criticality)} />
      </div>
      {reasons.length > 0 ? (
        <div className="space-y-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Reasons</p>
          {reasons.map((r, i) => (
            <p key={i} className="rounded-lg bg-black/20 px-2.5 py-1.5 font-mono text-[11px] leading-5 text-zinc-300">
              {r}
            </p>
          ))}
        </div>
      ) : null}
      {flags.length > 0 ? (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">Flags</p>
          <div className="flex flex-wrap gap-1.5">
            {flags.map((f) => (
              <span key={f} className="rounded-full border border-amber-400/20 bg-amber-400/8 px-2.5 py-0.5 font-mono text-[10px] text-amber-200">
                {f}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderEvidence(data) {
  return (
    <div className="grid gap-2 grid-cols-3">
      <KV label="Chain Valid" value={data.chain_valid ? "Yes" : "No"} />
      <KV label="Records" value={String(data.record_count ?? 0)} />
      <KV label="Hash" value={truncateMiddle(data.evidence_hash || "—", 10, 8)} />
    </div>
  );
}

/* ── Layer accordion ── */

function LayerAccordion({ index, title, description, isOpen, onToggle, verdict, children }) {
  const accentBorder =
    verdict === "FORBID"
      ? "border-rose-400/15"
      : verdict === "ABSTAIN"
      ? "border-amber-400/15"
      : verdict === "PERMIT"
      ? "border-emerald-400/15"
      : "border-cyan-400/15";

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border bg-white/[0.02] backdrop-blur-md transition-all duration-200",
        accentBorder,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 font-mono text-[10px] text-zinc-300">
            {index}
          </div>
          <div className="min-w-0">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">
              {title}
            </h3>
            {!isOpen && description ? (
              <p className="mt-0.5 font-mono text-[10px] leading-4 text-zinc-500 truncate max-w-md">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-zinc-400">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </div>
      </button>
      {isOpen ? (
        <div className="border-t border-white/8 px-4 py-4">{children}</div>
      ) : null}
    </div>
  );
}

/* ── Main drawer ── */

export default function PipelineDrawer({ decision, onClose }) {
  const [openLayers, setOpenLayers] = useState({
    deterministic: false,
    retrieval: false,
    specialists: false,
    semantic: false,
    router: false,
    evidence: false,
  });

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

  function toggle(key) {
    setOpenLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderContent(key) {
    if (key === "deterministic") return renderDeterministic(layerData.deterministic);
    if (key === "retrieval") return renderRetrieval(layerData.retrieval);
    if (key === "specialists") return renderSpecialists(layerData.specialists);
    if (key === "semantic") return renderSemantic(layerData.semantic);
    if (key === "router") return renderRouter(layerData.router);
    if (key === "evidence") return renderEvidence(layerData.evidence);
    return null;
  }

  return (
    <section className="mt-5 rounded-3xl border border-cyan-400/12 bg-white/[0.02] p-4 sm:p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className={SURFACE_CLASSES.label}>Full Analysis</p>
          <h2 className="mt-1 font-mono text-base font-semibold uppercase tracking-[0.12em] text-white">
            Six-Layer Pipeline
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-400 transition hover:text-white hover:border-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {PIPELINE_LAYERS.map((layer, index) => (
          <LayerAccordion
            key={layer.key}
            index={index + 1}
            title={layer.title}
            description={layer.description}
            isOpen={Boolean(openLayers[layer.key])}
            onToggle={() => toggle(layer.key)}
            verdict={decision?.verdict}
          >
            {renderContent(layer.key)}
          </LayerAccordion>
        ))}
      </div>
    </section>
  );
}
