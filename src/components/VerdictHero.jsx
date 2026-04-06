import React from "react";
import { CheckCircle2, AlertTriangle, ShieldX } from "lucide-react";
import { POLICY_VERSION, VERDICT_META } from "../lib/constants";
import { formatPercent, formatScore } from "../lib/formatters";

function getVerdictIcon(verdict) {
  if (verdict === "PERMIT") return CheckCircle2;
  if (verdict === "FORBID") return ShieldX;
  return AlertTriangle;
}

export default function VerdictHero({
  verdict,
  confidence,
  finalScore,
  policyVersion = POLICY_VERSION,
}) {
  const meta =
    VERDICT_META[verdict] ||
    VERDICT_META.ABSTAIN;

  const Icon = getVerdictIcon(verdict);

  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl border p-6 md:p-7",
        "bg-white/[0.04] backdrop-blur-xl",
        meta.accentClass,
        meta.glowClass,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_30%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/65">
            Tex Decision
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-black/20">
              <Icon className="h-8 w-8" />
            </div>

            <div>
              <div className="font-mono text-4xl font-extrabold uppercase tracking-[0.28em] text-white sm:text-5xl">
                {verdict}
              </div>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/65">
                Outbound action adjudication result
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-2xl font-mono text-sm leading-7 text-white/78">
            Tex is evaluating the actual content about to cross into the real
            world and issuing a last-mile release verdict before execution.
          </p>
        </div>

        <div className="grid w-full max-w-sm gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
              Confidence
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-white">
              {formatPercent(confidence, 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
              Final Risk Score
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-white">
              {formatScore(finalScore)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
              Policy Version
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-white">
              {policyVersion || POLICY_VERSION}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}