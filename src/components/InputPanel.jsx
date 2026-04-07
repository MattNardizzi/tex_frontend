import React from "react";
import {
  Mail,
  Database,
  MessageSquare,
  Server,
  Code2,
  Send,
} from "lucide-react";
import { SURFACE_CLASSES } from "../lib/constants";

const ACTION_TYPES = [
  { label: "Email", value: "outbound_email", icon: Mail, desc: "Outbound message" },
  { label: "API Call", value: "api_call", icon: Server, desc: "External request" },
  { label: "Slack", value: "slack_message", icon: MessageSquare, desc: "Channel message" },
  { label: "Database", value: "database_query", icon: Database, desc: "Query or mutation" },
  { label: "Deploy", value: "code_deployment", icon: Code2, desc: "Code release" },
];

export default function InputPanel({
  form,
  onChange,
  onEvaluate,
  isEvaluating = false,
}) {
  function handleField(e) {
    onChange?.(e.target.name, e.target.value);
  }

  return (
    <section className={`${SURFACE_CLASSES.panelStrong} p-5 sm:p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={SURFACE_CLASSES.label}>Intercept Point</p>
          <h2 className="mt-1.5 font-mono text-base font-semibold uppercase tracking-[0.12em] text-white sm:text-lg">
            What is your AI agent about to send?
          </h2>
        </div>
      </div>

      {/* Content textarea — THE MAIN INPUT */}
      <div className="mt-4">
        <textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleField}
          placeholder="Paste the message, query, or command your AI agent is about to send..."
          rows={6}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 font-mono text-sm leading-7 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35 focus:bg-black/45"
        />
      </div>

      {/* Action type selector — visible card grid */}
      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70 mb-2.5">
          What type of action is this?
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {ACTION_TYPES.map((item) => {
            const Icon = item.icon;
            const isActive = form.action_type === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange?.("action_type", item.value)}
                className={[
                  "group flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-cyan-400/30",
                  isActive
                    ? "border-cyan-400/40 bg-cyan-400/14 text-cyan-100 shadow-[0_0_28px_rgba(0,212,170,0.12)]"
                    : "border-white/10 bg-black/30 text-zinc-400 hover:border-cyan-400/20 hover:bg-black/40 hover:text-zinc-200",
                ].join(" ")}
                aria-pressed={isActive}
              >
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
                    isActive
                      ? "border-cyan-400/30 bg-cyan-400/12 text-cyan-100"
                      : "border-white/10 bg-black/20 text-zinc-400 group-hover:text-cyan-200",
                  ].join(" ")}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em]">
                  {item.label}
                </p>
                <p className="font-mono text-[9px] leading-tight text-zinc-500 group-hover:text-zinc-400">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Channel / Environment / Recipient — compact grid */}
      <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3">
        <div>
          <label
            htmlFor="channel"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70"
          >
            Channel
          </label>
          <input
            id="channel"
            name="channel"
            type="text"
            value={form.channel}
            onChange={handleField}
            placeholder="email"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35"
          />
        </div>

        <div>
          <label
            htmlFor="environment"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70"
          >
            Environment
          </label>
          <input
            id="environment"
            name="environment"
            type="text"
            value={form.environment}
            onChange={handleField}
            placeholder="production"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label
            htmlFor="recipient"
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70"
          >
            Recipient
          </label>
          <input
            id="recipient"
            name="recipient"
            type="text"
            value={form.recipient}
            onChange={handleField}
            placeholder="optional"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/35"
          />
        </div>
      </div>

      {/* Evaluate button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onEvaluate}
          disabled={isEvaluating || !form.content.trim()}
          className={[
            "inline-flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 sm:w-auto",
            "font-mono text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-200",
            isEvaluating || !form.content.trim()
              ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-zinc-500"
              : "border border-cyan-400/30 bg-cyan-400/12 text-cyan-100 shadow-[0_0_32px_rgba(0,212,170,0.12)] hover:border-cyan-300/45 hover:bg-cyan-400/18 hover:shadow-[0_0_42px_rgba(0,212,170,0.16)] active:scale-[0.98]",
          ].join(" ")}
        >
          <Send className="h-4 w-4" />
          {isEvaluating ? "Evaluating..." : "Evaluate Action"}
        </button>
      </div>
    </section>
  );
}
