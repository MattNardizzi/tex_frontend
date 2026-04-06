import React from "react";
import { Activity, Gauge, ShieldCheck, Layers3 } from "lucide-react";
import {
  POLICY_VERSION,
  VERDICT_META,
} from "../lib/constants";
import {
  formatConfidenceBand,
  formatPercent,
  formatScore,
} from "../lib/formatters";

export default function MetricsStrip({
  verdict,
  confidence,
  finalScore,
  policyVersion = POLICY_VERSION,
  deterministicScore,
  semanticScore,
}) {
  const verdictMeta = VERDICT_META[verdict] || VERDICT_META.ABSTAIN;

  const items = [
    {
      key: "confidence",
      label: "Confidence",
      value: formatPercent(confidence, 0),
      subvalue: formatConfidenceBand(confidence),
      icon: Activity,
    },
    {
      key: "final_score",
      label: "Final Score",
      value: formatScore(finalScore),
      subvalue: "Fused risk",
      icon: Gauge,
    },
    {
      key: "policy_version",
      label: "Policy",
      value: policyVersion || POLICY_VERSION,
      subvalue: "Active snapshot",
      icon: ShieldCheck,
    },
    {
      key: "layer_signal",
      label: "Signal Span",
      value: `${formatScore(deterministicScore)} / ${formatScore(semanticScore)}`,
      subvalue: "Det / Sem",
      icon: Layers3,
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className={[
              "rounded-2xl border bg-white/[0.03] p-4 backdrop-blur-md",
              verdictMeta.ringClass,
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-3 font-mono text-xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                  {item.subvalue}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}