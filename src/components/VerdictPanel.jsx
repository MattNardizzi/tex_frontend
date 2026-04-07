import React, { useEffect, useMemo, useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  Layers3,
  Activity,
  Gauge,
  Lock,
} from "lucide-react";
import {
  VERDICT_META,
  POLICY_VERSION,
  SURFACE_CLASSES,
} from "../lib/constants";
import {
  formatPercent,
  formatScore,
  formatConfidenceBand,
  safeArray,
  safeObject,
} from "../lib/formatters";

function getVerdictIcon(v) {
  if (v === "PERMIT") return CheckCircle2;
  if (v === "FORBID") return XCircle;
  return AlertTriangle;
}

function getVerdictDescription(v) {
  if (v === "PERMIT")
    return "This action has been evaluated and cleared. Safe to execute.";
  if (v === "FORBID")
    return "This action has been blocked. It contains content that violates policy.";
  return "This action requires human review before it can be sent.";
}

// Quick-summary of what was found
function buildSummaryItems(decision) {
  const items = [];
  const det = safeObject(decision?.deterministic);
  const findings = safeArray(det.findings);
  const specialists = safeArray(safeObject(decision?.specialists).specialists);
  const semantic = safeObject(decision?.semantic);
  const dims = safeObject(semantic.dimensions);
  const router = safeObject(decision?.router);
  const reasons = safeArray(router.reasons);
  const flags = safeArray(router.uncertainty_flags);

  if (findings.length > 0) {
    const critical = findings.filter((f) => f.severity === "CRITICAL").length;
    if (critical > 0) {
      items.push({
        icon: ShieldX,
        text: `${critical} critical pattern${critical > 1 ? "s" : ""} detected`,
        color: "text-rose-300",
      });
    }
    const warnings = findings.filter((f) => f.severity === "WARNING").length;
    if (warnings > 0) {
      items.push({
        icon: AlertTriangle,
        text: `${warnings} warning${warnings > 1 ? "s" : ""} flagged`,
        color: "text-amber-300",
      });
    }
  }

  // Top risky specialist
  const riskySpecialist = specialists
    .filter((s) => s.risk_score > 0.2)
    .sort((a, b) => b.risk_score - a.risk_score)[0];
  if (riskySpecialist) {
    const name = (riskySpecialist.specialist_name || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({
      icon: Eye,
      text: `${name} risk: ${formatScore(riskySpecialist.risk_score)}`,
      color: riskySpecialist.risk_score > 0.5 ? "text-rose-300" : "text-amber-300",
    });
  }

  // Semantic top dimension
  const dimEntries = Object.entries(dims);
  const topDim = dimEntries.sort((a, b) => b[1].score - a[1].score)[0];
  if (topDim && topDim[1].score > 0.1) {
    const name = topDim[0].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({
      icon: Activity,
      text: `${name}: ${formatScore(topDim[1].score)}`,
      color: topDim[1].score > 0.5 ? "text-rose-300" : "text-cyan-300",
    });
  }

  if (items.length === 0) {
    items.push({
      icon: ShieldCheck,
      text: "No significant risks detected",
      color: "text-emerald-300",
    });
  }

  return items.slice(0, 4);
}

export default function VerdictPanel({
  decision,
  hasDecision,
  showPipeline,
  onTogglePipeline,
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!hasDecision) {
      setRevealed(false);
      return;
    }
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, [hasDecision, decision?.request_id]);

  const summaryItems = useMemo(
    () => (hasDecision ? buildSummaryItems(decision) : []),
    [hasDecision, decision]
  );

  // ── Empty state ──
  if (!hasDecision) {
    return (
      <section className={`${SURFACE_CLASSES.panel} p-5 sm:p-6 h-full flex flex-col`}>
        <div>
          <p className={SURFACE_CLASSES.label}>Tex Verdict</p>
          <h2 className="mt-1.5 font-mono text-base font-semibold uppercase tracking-[0.12em] text-white sm:text-lg">
            Awaiting Evaluation
          </h2>
        </div>

        <div className="mt-5 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-cyan-200/50">
              <Shield className="h-10 w-10" />
            </div>
            <p className="mt-5 max-w-xs font-mono text-sm leading-7 text-zinc-400">
              Load an example or paste agent output, then hit{" "}
              <span className="text-cyan-200">Evaluate</span> to see the
              real-time verdict.
            </p>

            <div className="mt-6 grid w-full max-w-sm gap-2 grid-cols-3">
              {[
                { label: "Permit", desc: "Safe", color: "text-emerald-300 border-emerald-400/20" },
                { label: "Review", desc: "Flag", color: "text-amber-300 border-amber-400/20" },
                { label: "Block", desc: "Stop", color: "text-rose-300 border-rose-400/20" },
              ].map((v) => (
                <div
                  key={v.label}
                  className={`rounded-xl border bg-black/20 p-3 text-center ${v.color}`}
                >
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em]">
                    {v.label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Active verdict ──
  const meta = VERDICT_META[decision.verdict] || VERDICT_META.ABSTAIN;
  const Icon = getVerdictIcon(decision.verdict);

  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl border p-5 sm:p-6 backdrop-blur-xl transition-all duration-500",
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        meta.accentClass,
        meta.glowClass,
      ].join(" ")}
    >
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%)]" />

      <div className="relative min-w-0">
        {/* Verdict headline */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/20 sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
                Tex Verdict
              </p>
              <div className="font-mono text-2xl font-extrabold uppercase tracking-[0.18em] text-white sm:text-3xl lg:text-4xl">
                {meta.label}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 font-mono text-sm leading-7 text-white/70">
          {getVerdictDescription(decision.verdict)}
        </p>

        {/* Key metrics row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
              Confidence
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-white">
              {formatPercent(decision.confidence, 0)}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">
              {formatConfidenceBand(decision.confidence)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
              Risk Score
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-white">
              {formatScore(decision.final_score)}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">
              Fused
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
              Policy
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-white truncate">
              {decision.policy_version || POLICY_VERSION}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">
              Active
            </p>
          </div>
        </div>

        {/* Summary findings */}
        <div className="mt-4 space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
            Key Findings
          </p>
          {summaryItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-black/20 px-3 py-2"
            >
              <item.icon className={`h-3.5 w-3.5 shrink-0 ${item.color}`} />
              <p className="font-mono text-xs leading-5 text-zinc-200">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Full analysis toggle */}
        <button
          type="button"
          onClick={onTogglePipeline}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200 transition-all hover:border-cyan-400/25 hover:bg-white/[0.06] active:scale-[0.98]"
        >
          <Layers3 className="h-4 w-4" />
          {showPipeline ? "Hide Full Analysis" : "View Full Analysis"}
          <ChevronDown
            className={[
              "h-4 w-4 transition-transform duration-300",
              showPipeline ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>
    </section>
  );
}
