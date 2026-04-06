import React from "react";
import {
  Mail,
  Database,
  MessageSquare,
  Server,
  Code2,
  Send,
  Shield,
} from "lucide-react";
import { SURFACE_CLASSES } from "../lib/constants";

const ACTION_TYPE_CARDS = [
  {
    label: "Email",
    value: "outbound_email",
    description: "Customer or external outbound message",
    icon: Mail,
  },
  {
    label: "API",
    value: "api_call",
    description: "Execution against an external or internal API",
    icon: Server,
  },
  {
    label: "Slack",
    value: "slack_message",
    description: "Workspace message or channel communication",
    icon: MessageSquare,
  },
  {
    label: "Database",
    value: "database_query",
    description: "Query or mutation against live data",
    icon: Database,
  },
  {
    label: "Deploy",
    value: "code_deployment",
    description: "Code or config release into an environment",
    icon: Code2,
  },
];

function getActionIcon(actionType) {
  const match = ACTION_TYPE_CARDS.find((item) => item.value === actionType);
  return match?.icon || Shield;
}

export default function ActionInputPanel({
  form,
  onChange,
  onEvaluate,
  scenarioCards = null,
  isEvaluating = false,
}) {
  const ActionIcon = getActionIcon(form.action_type);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    onChange?.(name, value);
  }

  return (
    <section className={`${SURFACE_CLASSES.panelStrong} p-6 md:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={SURFACE_CLASSES.label}>Action Input</p>
          <h2 className="mt-3 font-mono text-lg font-semibold uppercase tracking-[0.14em] text-white">
            Outbound Action Surface
          </h2>
          <p className="mt-3 max-w-2xl font-mono text-xs leading-6 text-zinc-400">
            Tex evaluates the actual action payload before execution. Messages,
            API calls, database actions, and deployments are judged at the
            release point — not just by identity or permissions, but by what the
            agent is actually about to do.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_30px_rgba(0,212,170,0.08)]">
          <ActionIcon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/80">
          Action Type
        </p>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ACTION_TYPE_CARDS.map((item) => {
            const Icon = item.icon;
            const isActive = form.action_type === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange?.("action_type", item.value)}
                className={[
                  "group rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-cyan-400/30",
                  isActive
                    ? "border-cyan-400/40 bg-cyan-400/14 text-cyan-100 shadow-[0_0_32px_rgba(0,212,170,0.14)]"
                    : "border-white/10 bg-black/30 text-zinc-300 hover:border-cyan-400/20 hover:bg-black/40 hover:text-white",
                ].join(" ")}
                aria-pressed={isActive}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold uppercase tracking-[0.12em]">
                      {item.label}
                    </p>
                    <p className="mt-2 font-mono text-[11px] leading-5 text-zinc-400 group-hover:text-zinc-300">
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                      isActive
                        ? "border-cyan-400/30 bg-cyan-400/12 text-cyan-100"
                        : "border-white/10 bg-black/20 text-zinc-400 group-hover:text-cyan-200",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {scenarioCards ? <div className="mt-8">{scenarioCards}</div> : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="channel"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/80"
          >
            Channel
          </label>
          <input
            id="channel"
            name="channel"
            type="text"
            value={form.channel}
            onChange={handleFieldChange}
            placeholder="email"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35 focus:bg-black/40"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="environment"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/80"
          >
            Environment
          </label>
          <input
            id="environment"
            name="environment"
            type="text"
            value={form.environment}
            onChange={handleFieldChange}
            placeholder="production"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35 focus:bg-black/40"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="recipient"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/80"
          >
            Recipient / Target
          </label>
          <input
            id="recipient"
            name="recipient"
            type="text"
            value={form.recipient}
            onChange={handleFieldChange}
            placeholder="optional target, recipient, endpoint, or destination"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35 focus:bg-black/40"
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <label
          htmlFor="content"
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/80"
        >
          Action Payload
        </label>
        <textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleFieldChange}
          placeholder="Paste the exact content the AI agent is about to send, execute, publish, query, or deploy."
          rows={12}
          className="min-h-[260px] w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-4 font-mono text-sm leading-7 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35 focus:bg-black/45"
        />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-white/8 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Scope
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              Actual action payload
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Gate Position
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              Execution-time release point
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Outcome
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              Permit / Abstain / Forbid
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEvaluate}
          disabled={isEvaluating || !form.content.trim()}
          className={[
            "inline-flex items-center justify-center gap-3 rounded-2xl px-5 py-3",
            "font-mono text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200",
            isEvaluating || !form.content.trim()
              ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-zinc-500"
              : "border border-cyan-400/30 bg-cyan-400/12 text-cyan-100 shadow-[0_0_32px_rgba(0,212,170,0.12)] hover:border-cyan-300/45 hover:bg-cyan-400/18 hover:shadow-[0_0_42px_rgba(0,212,170,0.16)]",
          ].join(" ")}
        >
          <Send className="h-4 w-4" />
          {isEvaluating ? "Evaluating" : "Evaluate"}
        </button>
      </div>
    </section>
  );
}