import React, { useMemo, useRef, useState } from "react";
import ScenarioCards from "./components/ScenarioCards";
import ActionInputPanel from "./components/ActionInputPanel";
import DecisionPanel from "./components/DecisionPanel";
import { evaluateViaApi } from "./lib/apiClient";
import {
  APP_NAME,
  APP_SUBLABEL,
  DEFAULT_FORM_STATE,
  DEMO_SCENARIOS,
  EMPTY_DECISION_STATE,
  FONT_IMPORT_CSS,
  MODES,
  SURFACE_CLASSES,
} from "./lib/constants";

export default function TexDemo() {
  const mode = MODES.API;
  const [form, setForm] = useState({ ...DEFAULT_FORM_STATE });
  const [decision, setDecision] = useState({
    ...EMPTY_DECISION_STATE,
    mode: MODES.API,
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const activeRunRef = useRef(0);

  function buildEmptyDecision() {
    return {
      ...EMPTY_DECISION_STATE,
      mode: MODES.API,
    };
  }

  function resetDecision() {
    setDecision(buildEmptyDecision());
  }

  function handleFormChange(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      setDecision({
        ...result,
        mode,
      });
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

  const activeScenario = useMemo(() => {
    return DEMO_SCENARIOS.find(
      (scenario) =>
        scenario.action_type === form.action_type &&
        scenario.channel === form.channel &&
        scenario.environment === form.environment &&
        (scenario.recipient ?? "") === (form.recipient ?? "") &&
        scenario.content === form.content
    );
  }, [form]);

  return (
    <div className={SURFACE_CLASSES.page}>
      <style>{FONT_IMPORT_CSS}</style>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,170,0.11),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.09),transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

        <main className="relative mx-auto max-w-[1600px] px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-6 flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-300/80">
                {APP_SUBLABEL}
              </p>

              <div className="mt-3 flex flex-wrap items-end gap-4">
                <h1 className="font-mono text-4xl font-extrabold uppercase tracking-[0.38em] text-white sm:text-5xl">
                  {APP_NAME}
                </h1>

                <div className="mb-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200">
                  AI Action Gate
                </div>
              </div>

              <p className="mt-5 max-w-3xl font-mono text-sm leading-7 text-zinc-300">
                Tex sits between AI agents and the real world. Every action —
                message, API call, query, or deployment — is evaluated at the
                moment of execution. Not who the agent is. Not what tools it can
                access. What it is actually about to do.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    Position
                  </p>
                  <p className="mt-2 font-mono text-xs leading-6 text-zinc-200">
                    Last-mile action intelligence
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    Decision
                  </p>
                  <p className="mt-2 font-mono text-xs leading-6 text-zinc-200">
                    PERMIT / ABSTAIN / FORBID
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    Focus
                  </p>
                  <p className="mt-2 font-mono text-xs leading-6 text-zinc-200">
                    What the agent is actually doing
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/15 bg-white/[0.04] px-4 py-2 shadow-[0_0_30px_rgba(0,212,170,0.06)] backdrop-blur-md">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Live API
                </span>
              </div>
            </div>
          </header>

          {activeScenario ? (
            <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/80">
                Active Scenario
              </p>
              <p className="mt-2 font-mono text-sm leading-6 text-cyan-100">
                {activeScenario.title} loaded. Expected outcome:{" "}
                <span className="font-semibold">
                  {activeScenario.expectedVerdict}
                </span>
              </p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/8 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-rose-300/80">
                Evaluation Error
              </p>
              <p className="mt-2 font-mono text-sm leading-6 text-rose-100">
                {errorMessage}
              </p>
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-6">
              <ActionInputPanel
                form={form}
                onChange={handleFormChange}
                onEvaluate={handleEvaluate}
                scenarioCards={
                  <ScenarioCards
                    scenarios={DEMO_SCENARIOS}
                    onSelect={handleScenarioSelect}
                  />
                }
                isEvaluating={isEvaluating}
              />
            </div>

            <div>
              <DecisionPanel decision={decision} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}