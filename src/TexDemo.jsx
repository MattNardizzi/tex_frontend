import React, { useMemo, useRef, useState } from "react";
import ScenarioBar from "./components/ScenarioBar";
import InputPanel from "./components/InputPanel";
import VerdictPanel from "./components/VerdictPanel";
import PipelineDrawer from "./components/PipelineDrawer";
import { evaluateViaApi } from "./lib/apiClient";
import {
  APP_NAME,
  APP_TAGLINE,
  APP_SUBLABEL,
  DEFAULT_FORM_STATE,
  DEMO_SCENARIOS,
  EMPTY_DECISION_STATE,
  FONT_IMPORT_CSS,
  MODES,
  SURFACE_CLASSES,
} from "./lib/constants";
import { Shield, Zap, Eye, Lock } from "lucide-react";

export default function TexDemo() {
  const mode = MODES.API;
  const [form, setForm] = useState({ ...DEFAULT_FORM_STATE });
  const [decision, setDecision] = useState({
    ...EMPTY_DECISION_STATE,
    mode: MODES.API,
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPipeline, setShowPipeline] = useState(false);
  const activeRunRef = useRef(0);
  const verdictRef = useRef(null);

  function buildEmptyDecision() {
    return { ...EMPTY_DECISION_STATE, mode: MODES.API };
  }

  function resetDecision() {
    setDecision(buildEmptyDecision());
  }

  function handleFormChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  }

  function handleScenarioSelect(scenario) {
    setForm({
      action_type: scenario.action_type,
      channel: scenario.channel,
      environment: scenario.environment,
      recipient: scenario.recipient ?? "",
      content: scenario.content,
    });
    resetDecision();
    setShowPipeline(false);
    setErrorMessage("");
  }

  async function handleEvaluate() {
    if (!form.content.trim() || isEvaluating) return;

    const runId = Date.now();
    activeRunRef.current = runId;
    setIsEvaluating(true);
    setErrorMessage("");

    try {
      const result = await evaluateViaApi(form);
      if (activeRunRef.current !== runId) return;
      setDecision({ ...result, mode });

      // On mobile, scroll to verdict
      if (window.innerWidth < 1024 && verdictRef.current) {
        setTimeout(() => {
          verdictRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    } catch (error) {
      if (activeRunRef.current !== runId) return;
      resetDecision();
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Evaluation failed for an unknown reason."
      );
    } finally {
      if (activeRunRef.current === runId) {
        setIsEvaluating(false);
      }
    }
  }

  const hasDecision =
    decision?.verdict === "PERMIT" ||
    decision?.verdict === "ABSTAIN" ||
    decision?.verdict === "FORBID";

  return (
    <div className={SURFACE_CLASSES.page}>
      <style>{FONT_IMPORT_CSS}</style>

      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,170,0.11),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.09),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

        <main className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">

          {/* ── HERO HEADER ── */}
          <header className="mb-5 border-b border-white/8 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-300/70">
                    {APP_SUBLABEL}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <h1 className="font-mono text-3xl font-extrabold uppercase tracking-[0.38em] text-white sm:text-4xl">
                    {APP_NAME}
                  </h1>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200">
                    AI Action Gate
                  </div>
                </div>
                <p className="mt-3 max-w-xl font-mono text-lg font-semibold leading-8 text-white/90 sm:text-xl">
                  {APP_TAGLINE}
                </p>
                <p className="mt-2 max-w-2xl font-mono text-xs leading-6 text-zinc-400">
                  Every AI action — emails, API calls, Slack messages, database
                  queries, deployments — is evaluated in real time before it
                  executes. Tex permits, blocks, or escalates.
                </p>
              </div>

              {/* Capability badges + live status */}
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { icon: Zap, text: "Real-time" },
                    { icon: Eye, text: "Content-aware" },
                    { icon: Lock, text: "Auditable" },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5"
                    >
                      <item.icon className="h-3.5 w-3.5 text-cyan-300/70" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                    System Active
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ── SCENARIO BAR ── */}
          <ScenarioBar
            scenarios={DEMO_SCENARIOS}
            onSelect={handleScenarioSelect}
          />

          {/* ── ERROR ── */}
          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/8 px-4 py-3">
              <p className="font-mono text-xs leading-6 text-rose-100">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {/* ── MAIN GRID: Input + Verdict ── */}
          <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <InputPanel
              form={form}
              onChange={handleFormChange}
              onEvaluate={handleEvaluate}
              isEvaluating={isEvaluating}
            />

            <div ref={verdictRef}>
              <VerdictPanel
                decision={decision}
                hasDecision={hasDecision}
                showPipeline={showPipeline}
                onTogglePipeline={() => setShowPipeline((p) => !p)}
              />
            </div>
          </section>

          {/* ── PIPELINE DRAWER ── */}
          {hasDecision && showPipeline ? (
            <PipelineDrawer
              decision={decision}
              onClose={() => setShowPipeline(false)}
            />
          ) : null}

          {/* ── FOOTER ── */}
          <footer className="mt-8 border-t border-white/8 pt-4 pb-6">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                VortexBlack &middot; Action Intelligence
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  Live API
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
