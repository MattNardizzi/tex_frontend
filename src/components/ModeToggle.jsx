import React from "react";
import { Cpu, PlugZap } from "lucide-react";
import { MODES } from "../lib/constants";

export default function ModeToggle({ mode, onChange }) {
  const isStandalone = mode === MODES.STANDALONE;
  const isApi = mode === MODES.API;

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/15 bg-white/[0.04] p-1 shadow-[0_0_30px_rgba(0,212,170,0.06)] backdrop-blur-md">
      <button
        type="button"
        onClick={() => onChange(MODES.STANDALONE)}
        className={[
          "group inline-flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200",
          "font-mono text-[11px] font-semibold uppercase tracking-[0.18em]",
          isStandalone
            ? "border border-cyan-400/30 bg-cyan-400/12 text-cyan-200 shadow-[0_0_18px_rgba(0,212,170,0.12)]"
            : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-200",
        ].join(" ")}
        aria-pressed={isStandalone}
      >
        <Cpu className="h-4 w-4" />
        Standalone
      </button>

      <button
        type="button"
        onClick={() => onChange(MODES.API)}
        className={[
          "group inline-flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200",
          "font-mono text-[11px] font-semibold uppercase tracking-[0.18em]",
          isApi
            ? "border border-cyan-400/30 bg-cyan-400/12 text-cyan-200 shadow-[0_0_18px_rgba(0,212,170,0.12)]"
            : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-200",
        ].join(" ")}
        aria-pressed={isApi}
      >
        <PlugZap className="h-4 w-4" />
        API
      </button>
    </div>
  );
}