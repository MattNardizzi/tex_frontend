import React, { useEffect, useMemo, useState } from "react";
import { Shield, Radar, Activity, Layers3 } from "lucide-react";
import { SURFACE_CLASSES } from "../lib/constants";
import VerdictHero from "./VerdictHero";
import MetricsStrip from "./MetricsStrip";
import PipelineSection from "./PipelineSection";

function PanelReveal({ show, delay = 0, children }) {
  return (
    <div
      className={[
        "transform transition-all duration-500 ease-out",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function DecisionPanel({ decision }) {
  const hasDecision =
    decision?.verdict === "PERMIT" ||
    decision?.verdict === "ABSTAIN" ||
    decision?.verdict === "FORBID";

  const semanticScore = useMemo(() => {
    return Math.max(
      decision?.semantic?.dimensions?.policy_compliance?.score ?? 0,
      decision?.semantic?.dimensions?.data_leakage?.score ?? 0,
      decision?.semantic?.dimensions?.external_sharing?.score ?? 0,
      decision?.semantic?.dimensions?.unauthorized_commitment?.score ?? 0,
      decision?.semantic?.dimensions?.destructive_or_bypass?.score ?? 0
    );
  }, [decision]);

  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!hasDecision) {
      setStage(0);
      return;
    }

    setStage(0);

    const timers = [
      window.setTimeout(() => setStage(1), 80),
      window.setTimeout(() => setStage(2), 220),
      window.setTimeout(() => setStage(3), 380),
      window.setTimeout(() => setStage(4), 540),
    ];

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [hasDecision, decision?.request_id, decision?.verdict]);

  if (!hasDecision) {
    return (
      <section className={`${SURFACE_CLASSES.panel} p-6 md:p-7`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={SURFACE_CLASSES.label}>Tex Decision</p>
            <h2 className="mt-3 font-mono text-lg font-semibold uppercase tracking-[0.14em] text-white">
              Release Adjudication Console
            </h2>
            <p className="mt-3 max-w-xl font-mono text-xs leading-6 text-zinc-400">
              Tex evaluates the actual action payload before execution. Run an
              evaluation to see the verdict, fused risk signals, confidence, and
              the full six-layer release pipeline.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_30px_rgba(0,212,170,0.08)]">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-dashed border-cyan-400/20 bg-black/20 p-8">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-cyan-200">
              <Radar className="h-8 w-8" />
            </div>

            <h3 className="mt-5 font-mono text-xl font-semibold uppercase tracking-[0.16em] text-white">
              Awaiting Evaluation
            </h3>

            <p className="mt-4 font-mono text-sm leading-7 text-zinc-400">
              The right panel becomes Tex’s live decision surface after
              analysis: verdict, confidence, fused score, policy version, and
              the full six-layer action adjudication pipeline.
            </p>

            <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
                  Verdict
                </p>
                <p className="mt-3 font-mono text-sm leading-6 text-zinc-300">
                  PERMIT / ABSTAIN / FORBID
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
                  Metrics
                </p>
                <p className="mt-3 font-mono text-sm leading-6 text-zinc-300">
                  Confidence, risk score, policy snapshot
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
                  Evidence
                </p>
                <p className="mt-3 font-mono text-sm leading-6 text-zinc-300">
                  Layer-by-layer release justification
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <PanelReveal show={stage >= 1} delay={0}>
        <VerdictHero
          verdict={decision.verdict}
          confidence={decision.confidence}
          finalScore={decision.final_score}
          policyVersion={decision.policy_version}
        />
      </PanelReveal>

      <PanelReveal show={stage >= 2} delay={0}>
        <MetricsStrip
          verdict={decision.verdict}
          confidence={decision.confidence}
          finalScore={decision.final_score}
          policyVersion={decision.policy_version}
          deterministicScore={decision?.deterministic?.score}
          semanticScore={semanticScore}
        />
      </PanelReveal>

      <PanelReveal show={stage >= 3} delay={0}>
        <section className="rounded-3xl border border-cyan-400/12 bg-cyan-400/[0.04] p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
                  Execution Trace
                </p>
                <p className="mt-1 font-mono text-xs leading-6 text-zinc-300">
                  Deterministic signals, grounded context, specialist judges,
                  semantic scoring, fused routing, and evidence anchoring are
                  now loaded.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-black/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">
              <Layers3 className="h-3.5 w-3.5" />
              Pipeline Live
            </div>
          </div>
        </section>
      </PanelReveal>

      <PanelReveal show={stage >= 4} delay={0}>
        <section className={`${SURFACE_CLASSES.panel} p-6 md:p-7`}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className={SURFACE_CLASSES.label}>Decision Pipeline</p>
              <h2 className="mt-3 font-mono text-lg font-semibold uppercase tracking-[0.14em] text-white">
                Layer-by-Layer Adjudication
              </h2>
              <p className="mt-3 max-w-3xl font-mono text-xs leading-6 text-zinc-400">
                Tex is not checking who the agent is allowed to be. Tex is
                evaluating what the agent is actually about to execute, send,
                publish, query, or deploy into the real world.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
              Six-Layer Stack
            </div>
          </div>

          <PipelineSection decision={decision} />
        </section>
      </PanelReveal>
    </section>
  );
}