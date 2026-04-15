import React from "react";
import {
  ShieldCheck,
  ShieldX,
  Eye,
  Mail,
  MessageSquare,
  Server,
  Database,
  Code2,
  Sparkles,
} from "lucide-react";
import { VERDICT_META } from "../lib/constants";

function getActionIcon(actionType) {
  const map = {
    outbound_email: Mail,
    api_call: Server,
    slack_message: MessageSquare,
    database_query: Database,
    code_deployment: Code2,
  };
  return map[actionType] || Sparkles;
}

function getVerdictIcon(v) {
  if (v === "PERMIT") return ShieldCheck;
  if (v === "FORBID") return ShieldX;
  return Eye;
}

export default function ScenarioBar({ scenarios, onSelect }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
          Try an example
        </p>
        <div className="hidden items-center gap-1.5 sm:flex">
          <Sparkles className="h-3 w-3 text-cyan-300/50" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Click to load
          </span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {scenarios.map((s) => {
          const ActionIcon = getActionIcon(s.action_type);
          const VerdictIcon = getVerdictIcon(s.expectedVerdict);
          const meta = VERDICT_META[s.expectedVerdict] || VERDICT_META.ABSTAIN;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect?.(s)}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left transition-all duration-200 hover:border-cyan-400/25 hover:bg-white/[0.06] hover:shadow-[0_0_24px_rgba(0,212,170,0.08)] active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-cyan-200 transition group-hover:border-cyan-400/20">
                <ActionIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-white truncate">
                  {s.title}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-400 truncate">
                  {s.description}
                </p>
              </div>
              <div
                className={[
                  "ml-1 flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5",
                  "font-mono text-[9px] font-semibold uppercase tracking-[0.14em]",
                  meta.badgeClass,
                ].join(" ")}
              >
                <VerdictIcon className="h-3 w-3" />
                {meta.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}