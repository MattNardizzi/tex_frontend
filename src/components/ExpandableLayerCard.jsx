import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ExpandableLayerCard({
  index,
  title,
  shortTitle,
  description,
  isOpen,
  onToggle,
  children,
  accent = "cyan",
}) {
  const accentClasses =
    accent === "red"
      ? "border-rose-400/18 bg-rose-400/[0.04]"
      : accent === "amber"
      ? "border-amber-400/18 bg-amber-400/[0.04]"
      : accent === "green"
      ? "border-emerald-400/18 bg-emerald-400/[0.04]"
      : "border-cyan-400/18 bg-cyan-400/[0.04]";

  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border bg-white/[0.03] backdrop-blur-md transition-all duration-300",
        accentClasses,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 font-mono text-[11px] text-zinc-300">
              {index}
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-cyan-300/75">
                {shortTitle}
              </p>
              <h3 className="mt-1 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">
                {title}
              </h3>
            </div>
          </div>

          {description ? (
            <p className="mt-3 max-w-4xl font-mono text-xs leading-6 text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-300">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-white/8 px-5 py-5">{children}</div>
      ) : null}
    </section>
  );
}