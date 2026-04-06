import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  Sparkles,
  Mail,
  MessageSquare,
  Server,
  Database,
  Code2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { DEMO_SCENARIOS, VERDICT_META } from "../lib/constants";

function getScenarioVerdictIcon(expectedVerdict) {
  if (expectedVerdict === "PERMIT") return ShieldCheck;
  if (expectedVerdict === "FORBID") return ShieldAlert;
  return Eye;
}

function getActionTypeIcon(actionType) {
  switch (actionType) {
    case "outbound_email":
      return Mail;
    case "api_call":
      return Server;
    case "slack_message":
      return MessageSquare;
    case "database_query":
      return Database;
    case "code_deployment":
      return Code2;
    default:
      return Sparkles;
  }
}

function getScenarioCategoryTitle(scenario) {
  if (scenario.id === "clean-internal-message") {
    return "Internal Slack Coordination";
  }
  if (scenario.id === "data-exfiltration") {
    return "External Data Exfiltration";
  }
  if (scenario.id === "risky-commitment") {
    return "Unverified Customer Commitment";
  }
  if (scenario.id === "destructive-query") {
    return "Production Data Deletion";
  }

  return scenario.title;
}

function getScenarioStatusLabel(expectedVerdict) {
  if (expectedVerdict === "PERMIT") return "SAFE";
  if (expectedVerdict === "FORBID") return "BLOCKED";
  return "REVIEW";
}

export default function ScenarioCards({
  scenarios = DEMO_SCENARIOS,
  onSelect,
  activeScenarioId = null,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">
            Demo Scenarios
          </p>
          <h3 className="mt-2 font-mono text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Instant Action Tests
          </h3>
          <p className="mt-2 max-w-2xl font-mono text-[11px] leading-6 text-zinc-400">
            Click a scenario to inject a realistic action into the console and
            watch Tex adjudicate it.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-200/80">
          <Sparkles className="h-3.5 w-3.5" />
          One Click Load
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {scenarios.map((scenario) => {
          const VerdictIcon = getScenarioVerdictIcon(scenario.expectedVerdict);
          const ActionIcon = getActionTypeIcon(scenario.action_type);
          const verdictMeta = VERDICT_META[scenario.expectedVerdict];
          const categoryTitle = getScenarioCategoryTitle(scenario);
          const statusLabel = getScenarioStatusLabel(scenario.expectedVerdict);
          const isActive = activeScenarioId === scenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect?.(scenario)}
              aria-pressed={isActive}
              className={[
                "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-cyan-400/30",
                isActive
                  ? "border-cyan-400/40 bg-cyan-400/[0.10] shadow-[0_0_42px_rgba(0,212,170,0.14)]"
                  : "border-white/10 bg-white/[0.03] hover:border-cyan-400/25 hover:bg-white/[0.05] hover:shadow-[0_0_36px_rgba(0,212,170,0.08)]",
              ].join(" ")}
            >
              <div
                className={[
                  "pointer-events-none absolute inset-0 transition-opacity duration-300",
                  isActive
                    ? "bg-[radial-gradient(circle_at_top_right,rgba(0,212,170,0.16),transparent_42%)] opacity-100"
                    : "bg-[radial-gradient(circle_at_top_right,rgba(0,212,170,0.10),transparent_42%)] opacity-0 group-hover:opacity-100",
                ].join(" ")}
              />

              {isActive ? (
                <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/12 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Loaded
                </div>
              ) : null}

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-cyan-200 transition-all duration-300",
                        isActive
                          ? "border-cyan-400/25 bg-cyan-400/10"
                          : "border-white/10 bg-black/30",
                      ].join(" ")}
                    >
                      <ActionIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 pr-2">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/75">
                        {scenario.action_type.replaceAll("_", " ")}
                      </p>
                      <h4 className="mt-1 font-mono text-sm font-semibold uppercase tracking-[0.06em] text-white">
                        {categoryTitle}
                      </h4>
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1",
                    "font-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
                    verdictMeta?.badgeClass ||
                      "border border-white/10 bg-white/[0.05] text-zinc-200",
                  ].join(" ")}
                >
                  <VerdictIcon className="h-3.5 w-3.5" />
                  {statusLabel}
                </div>
              </div>

              <p className="relative mt-4 line-clamp-3 font-mono text-xs leading-6 text-zinc-300">
                {scenario.description}
              </p>

              <div className="relative mt-4 grid grid-cols-2 gap-2">
                <div
                  className={[
                    "rounded-xl border px-3 py-2 transition-all duration-300",
                    isActive
                      ? "border-cyan-400/15 bg-cyan-400/[0.05]"
                      : "border-white/8 bg-black/20",
                  ].join(" ")}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Channel
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-200">
                    {scenario.channel}
                  </p>
                </div>

                <div
                  className={[
                    "rounded-xl border px-3 py-2 transition-all duration-300",
                    isActive
                      ? "border-cyan-400/15 bg-cyan-400/[0.05]"
                      : "border-white/8 bg-black/20",
                  ].join(" ")}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Environment
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-200">
                    {scenario.environment}
                  </p>
                </div>
              </div>

              <div
                className={[
                  "relative mt-4 rounded-xl border px-3 py-2 transition-all duration-300",
                  isActive
                    ? "border-cyan-400/15 bg-cyan-400/[0.05]"
                    : "border-white/8 bg-black/20",
                ].join(" ")}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Payload Preview
                </p>
                <p className="mt-1 line-clamp-2 font-mono text-xs leading-6 text-zinc-300">
                  {scenario.content}
                </p>
              </div>

              <div className="relative mt-4 flex items-center justify-between border-t border-white/8 pt-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {isActive ? "Currently loaded into input" : "Inject into action input"}
                </p>

                <span
                  className={[
                    "inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-transform duration-300",
                    isActive
                      ? "text-cyan-100"
                      : "text-cyan-200 group-hover:translate-x-1",
                  ].join(" ")}
                >
                  {isActive ? "Loaded" : "Load"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}