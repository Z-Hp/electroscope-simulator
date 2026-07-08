"use client";

import { useState } from "react";
import { useSimStore } from "@/lib/sim-store";
import { PREDICTIONS, OBJECTIVE_DETAILS } from "@/lib/sim-content";
import { RODS, CLOTHS } from "@/lib/sim-physics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Info,
  Lightbulb,
  AlertTriangle,
  Trophy,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ListChecks,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LearningDashboard() {
  const feedback = useSimStore((s) => s.feedback);
  const objectives = useSimStore((s) => s.objectives);
  const clearFeedback = useSimStore((s) => s.clearFeedback);
  const [tab, setTab] = useState<"objectives" | "predictions" | "feedback">("objectives");

  const doneCount = objectives.filter((o) => o.done).length;
  const total = objectives.length;

  return (
    <Card className="p-3 flex flex-col gap-3 sim-scroll overflow-y-auto" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)", maxHeight: "calc(100vh - 140px)" }}>
      {/* Progress */}
      <div className="rounded-xl p-3" style={{ background: "linear-gradient(135deg,#dbeaf9,#ffffff)", border: "1px solid var(--sim-accent-soft)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#1d6fd6" }}>
            <Trophy className="w-4 h-4" /> اهداف آموزشی
          </span>
          <span className="text-xs font-extrabold" style={{ color: "var(--sim-accent)" }}>{doneCount} / {total}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#fff" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--sim-accent)" }}
            animate={{ width: `${(doneCount / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#eaf4fc" }}>
        <TabBtn active={tab === "objectives"} onClick={() => setTab("objectives")} icon={<ListChecks className="w-3.5 h-3.5" />}>
          اهداف و آموزش
        </TabBtn>
        <TabBtn active={tab === "predictions"} onClick={() => setTab("predictions")} icon={<HelpCircle className="w-3.5 h-3.5" />}>
          پیش‌بینی
        </TabBtn>
        <TabBtn active={tab === "feedback"} onClick={() => setTab("feedback")} icon={<Lightbulb className="w-3.5 h-3.5" />}>
          بازخورد
        </TabBtn>
      </div>

      {/* Tab content */}
      {tab === "objectives" && <ObjectivesTab />}
      {tab === "predictions" && <PredictionsTab />}
      {tab === "feedback" && <FeedbackTab feedback={feedback} clearFeedback={clearFeedback} />}
    </Card>
  );
}

function ObjectivesTab() {
  const objectives = useSimStore((s) => s.objectives);
  const objectiveQuizAnswered = useSimStore((s) => s.objectiveQuizAnswered);
  const answerObjectiveQuiz = useSimStore((s) => s.answerObjectiveQuiz);
  const [openId, setOpenId] = useState<string | null>(null);

  const doneCount = objectives.filter((o) => o.done).length;
  const total = objectives.length;

  return (
    <div className="flex flex-col gap-2">
      {doneCount === total && (
        <div className="text-center text-xs font-bold p-2 rounded-lg" style={{ background: "#d9f0e4", color: "#065f46" }}>
          🎉 آفرین! همه اهداف را کشف کردی.
        </div>
      )}
      {OBJECTIVE_DETAILS.map((obj, i) => {
        const prog = objectives.find((o) => o.id === obj.id);
        const done = prog?.done;
        const answered = objectiveQuizAnswered[obj.id] !== undefined;
        const chosen = objectiveQuizAnswered[obj.id];
        const correct = answered && chosen === obj.quiz.correctIndex;
        const open = openId === obj.id;
        return (
          <div key={obj.id} className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: `1px solid ${done ? "#a7e8c8" : "var(--sim-border)"}` }}>
            {/* Header row */}
            <button
              onClick={() => setOpenId(open ? null : obj.id)}
              className="w-full flex items-center gap-2 p-2.5 text-right"
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${done ? "text-white" : ""}`} style={{ background: done ? "#16a34a" : "#eaf4fc", color: done ? "#fff" : "#5b7187" }}>
                {done ? "✓" : i + 1}
              </span>
              <span className="text-xs font-bold flex-1" style={{ color: "var(--sim-fg)" }}>{obj.title}</span>
              {open ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--sim-muted)" }} /> : <ChevronLeft className="w-4 h-4 flex-shrink-0" style={{ color: "var(--sim-muted)" }} />}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3">
                    {/* Steps */}
                    <div className="mb-3">
                      <div className="text-[10px] font-bold mb-1.5 flex items-center gap-1" style={{ color: "#1d6fd6" }}>
                        <ListChecks className="w-3 h-3" /> مراحل انجام:
                      </div>
                      <ol className="space-y-1">
                        {obj.steps.map((step, si) => (
                          <li key={si} className="text-[11px] leading-5 flex gap-1.5" style={{ color: "var(--sim-fg)" }}>
                            <span className="font-bold flex-shrink-0" style={{ color: "var(--sim-accent)" }}>{si + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Quiz */}
                    <div className="rounded-lg p-2.5" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
                      <div className="text-[11px] font-semibold mb-2 leading-5 flex items-start gap-1" style={{ color: "var(--sim-fg)" }}>
                        <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--sim-accent)" }} />
                        <span>{obj.quiz.question}</span>
                      </div>
                      <div className="space-y-1">
                        {obj.quiz.options.map((opt, oi) => {
                          const isChosen = chosen === oi;
                          const isCorrect = oi === obj.quiz.correctIndex;
                          return (
                            <button
                              key={oi}
                              disabled={answered}
                              onClick={() => answerObjectiveQuiz(obj.id, oi, obj.quiz.correctIndex)}
                              className="w-full text-right text-[11px] px-2.5 py-1.5 rounded-lg border transition-all"
                              style={{
                                background: answered
                                  ? isCorrect
                                    ? "#d9f0e4"
                                    : isChosen
                                      ? "#fee2e2"
                                      : "#ffffff"
                                  : isChosen
                                    ? "var(--sim-accent-soft)"
                                    : "#ffffff",
                                borderColor: answered
                                  ? isCorrect
                                    ? "#a7e8c8"
                                    : isChosen
                                      ? "#fca5a5"
                                      : "var(--sim-border)"
                                  : "var(--sim-border)",
                                color: "var(--sim-fg)",
                                cursor: answered ? "default" : "pointer",
                              }}
                            >
                              {answered && isCorrect && "✓ "}
                              {answered && isChosen && !isCorrect && "✗ "}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {answered && (
                        <div className="mt-2 text-[10px] p-2 rounded-lg leading-4" style={{ background: correct ? "#ecfdf5" : "#fef2f2", color: correct ? "#065f46" : "#991b1b" }}>
                          {correct ? "درست! " : "دقت کن. "}{obj.quiz.explanation}
                        </div>
                      )}
                      {!answered && (
                        <div className="mt-1.5 text-[10px] flex items-center gap-1" style={{ color: "var(--sim-muted)" }}>
                          <Info className="w-3 h-3" />
                          پس از پاسخ درست به سؤال، این هدف تیک می‌خورد.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function PredictionsTab() {
  const predictionsAnswered = useSimStore((s) => s.predictionsAnswered);
  const answerPrediction = useSimStore((s) => s.answerPrediction);

  return (
    <div className="space-y-2">
      {PREDICTIONS.map((q) => {
        const ans = predictionsAnswered[q.id];
        const answered = ans !== undefined;
        const correct = answered && ans === q.correctIndex;
        return (
          <div key={q.id} className="rounded-xl p-2.5" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
            <div className="text-[11px] font-semibold mb-1.5 leading-5" style={{ color: "var(--sim-fg)" }}>
              {q.question}
            </div>
            <div className="space-y-1">
              {q.options.map((opt, i) => {
                const chosen = ans === i;
                const isCorrect = i === q.correctIndex;
                return (
                  <button
                    key={i}
                    disabled={answered}
                    onClick={() => answerPrediction(q.id, i)}
                    className="w-full text-right text-[11px] px-2 py-1.5 rounded-lg border transition-all"
                    style={{
                      background: answered
                        ? isCorrect
                          ? "#d9f0e4"
                          : chosen
                            ? "#fee2e2"
                            : "#ffffff"
                        : chosen
                          ? "var(--sim-accent-soft)"
                          : "#ffffff",
                      borderColor: answered
                        ? isCorrect
                          ? "#a7e8c8"
                          : chosen
                            ? "#fca5a5"
                            : "var(--sim-border)"
                        : "var(--sim-border)",
                      color: "var(--sim-fg)",
                      cursor: answered ? "default" : "pointer",
                    }}
                  >
                    {answered && isCorrect && "✓ "}
                    {answered && chosen && !isCorrect && "✗ "}
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="mt-1.5 text-[10px] p-1.5 rounded-lg leading-4" style={{ background: correct ? "#ecfdf5" : "#fef2f2", color: correct ? "#065f46" : "#991b1b" }}>
                {correct ? "درست! " : "دقت کن. "}{q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FeedbackTab({ feedback, clearFeedback }: { feedback: any[]; clearFeedback: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-xs font-bold flex items-center gap-1" style={{ color: "var(--sim-fg)" }}>
          <Lightbulb className="w-3.5 h-3.5" /> بازخوردهای زنده
        </h3>
        {feedback.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={clearFeedback}>
            پاک کردن
          </Button>
        )}
      </div>
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {feedback.length === 0 ? (
            <div className="text-[11px] text-center py-4" style={{ color: "var(--sim-muted)" }}>
              با آزمایش کردن، بازخورد اینجا ظاهر می‌شود...
            </div>
          ) : (
            feedback.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg p-2 text-[11px]"
                style={{
                  background: feedbackBg(f.kind),
                  border: `1px solid ${feedbackBd(f.kind)}`,
                  color: feedbackTx(f.kind),
                }}
              >
                <div className="font-bold mb-0.5 flex items-center gap-1">
                  {feedbackIcon(f.kind)} {f.title}
                </div>
                <div className="leading-4 opacity-90">{f.body}</div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Triboelectric series reference */}
      <div className="mt-3">
        <h3 className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: "var(--sim-fg)" }}>
          <BookOpen className="w-3.5 h-3.5" /> سری الکتروسیته مالشی
        </h3>
        <div className="rounded-xl p-2" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
          <TriboSeries />
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all"
      style={{
        background: active ? "#ffffff" : "transparent",
        color: active ? "var(--sim-accent)" : "var(--sim-muted)",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function TriboSeries() {
  const items = [
    ...Object.values(RODS).filter((r) => !r.conductor),
    ...Object.values(CLOTHS),
  ].sort((a, b) => b.affinity - a.affinity);
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold mb-1" style={{ color: "var(--sim-muted)" }}>
        <span style={{ color: "var(--pos)" }}>+ مثبت (الکترون می‌دهد)</span>
        <span style={{ color: "var(--neg)" }}>منفی (الکترون می‌گیرد) −</span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto sim-scroll pb-1" dir="ltr">
        {items.map((it, i) => (
          <div key={it.id} className="flex flex-col items-center min-w-[44px]">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
              style={{ background: it.color, border: "1px solid #5a6672" }}
              title={it.name}
            >
              {it.emoji}
            </div>
            <div className="text-[8px] mt-0.5 font-semibold" style={{ color: "var(--sim-muted)" }}>{it.name}</div>
            {i < items.length - 1 && <div className="text-[8px]" style={{ color: "#9cc0e0" }}>›</div>}
          </div>
        ))}
      </div>
      <div className="text-[10px] mt-1.5 leading-4" style={{ color: "var(--sim-muted)" }}>
        ماده بالاتر در سری، با مالش با ماده پایین‌تر، الکترون از دست می‌دهد و مثبت می‌شود.
      </div>
    </div>
  );
}

function feedbackBg(k: string): string {
  switch (k) {
    case "success": return "#ecfdf5";
    case "warning": return "#fee2e2";
    case "question": return "#fef9e7";
    default: return "#f1f5f9";
  }
}
function feedbackBd(k: string): string {
  switch (k) {
    case "success": return "#a7e8c8";
    case "warning": return "#fca5a5";
    case "question": return "#fde9c8";
    default: return "#e2e8f0";
  }
}
function feedbackTx(k: string): string {
  switch (k) {
    case "success": return "#065f46";
    case "warning": return "#991b1b";
    case "question": return "#854d0e";
    default: return "#475569";
  }
}
function feedbackIcon(k: string) {
  switch (k) {
    case "success": return <CheckCircle2 className="w-3.5 h-3.5" />;
    case "warning": return <AlertTriangle className="w-3.5 h-3.5" />;
    case "question": return <HelpCircle className="w-3.5 h-3.5" />;
    default: return <Info className="w-3.5 h-3.5" />;
  }
}
