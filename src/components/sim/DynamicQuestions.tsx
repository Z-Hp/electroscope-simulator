"use client";

import { useEffect, useState } from "react";
import { useSimStore } from "@/lib/sim-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  Brain,
  ArrowRight,
  ArrowLeft,
  Flag,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Target,
  AlertCircle,
  Send,
} from "lucide-react";
import { QuestionType } from "@/lib/sim-content-dynamic";

const QUESTION_TYPE_LABELS: Record<QuestionType, { label: string; emoji: string }> = {
  "predict-result": { label: "پیش‌بینی نتیجه", emoji: "🔮" },
  "identify-rod-charge": { label: "تشخیص بار میله", emoji: "🔍" },
  "identify-electroscope-charge": { label: "تشخیص بار الکتروسکوپ", emoji: "🔬" },
  "identify-experiment-type": { label: "نوع آزمایش", emoji: "📋" },
  "analyze-cause": { label: "تحلیل علت", emoji: "💡" },
  "predict-continuation": { label: "پیش‌بینی ادامه", emoji: "⏭️" },
  "find-error": { label: "یافتن خطا", emoji: "⚠️" },
};

export function DynamicQuestions() {
  const currentQuestion = useSimStore((s) => s.currentQuestion);
  const generateNewQuestion = useSimStore((s) => s.generateNewQuestion);
  const setView = useSimStore((s) => s.setView);
  const questionAnswered = useSimStore((s) => s.questionAnswered);
  const questionSelectedAnswer = useSimStore((s) => s.questionSelectedAnswer);
  const questionCorrectCount = useSimStore((s) => s.questionCorrectCount);
  const questionWrongCount = useSimStore((s) => s.questionWrongCount);
  const questionTotalCount = useSimStore((s) => s.questionTotalCount);
  const answerQuestion = useSimStore((s) => s.answerQuestion);
  const goToPreviousQuestion = useSimStore((s) => s.goToPreviousQuestion);
  const questionHistoryIndex = useSimStore((s) => s.questionHistoryIndex);
  const questionHistory = useSimStore((s) => s.questionHistory);
  const questionPracticeEnded = useSimStore((s) => s.questionPracticeEnded);
  const endQuestionPractice = useSimStore((s) => s.endQuestionPractice);
  const resetQuestionPractice = useSimStore((s) => s.resetQuestionPractice);

  const [showReportModal, setShowReportModal] = useState(false);

  // Generate first question on mount
  useEffect(() => {
    if (!currentQuestion && !questionPracticeEnded) {
      generateNewQuestion();
    }
  }, [currentQuestion, generateNewQuestion, questionPracticeEnded]);

  // Show end-of-practice report
  if (questionPracticeEnded) {
    return <PracticeReport onReset={resetQuestionPractice} onExit={() => setView("lab")} />;
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 animate-pulse" style={{ color: "var(--sim-accent)" }} />
          <p className="text-sm" style={{ color: "var(--sim-muted)" }}>در حال ساخت سؤال...</p>
        </div>
      </div>
    );
  }

  const typeInfo = QUESTION_TYPE_LABELS[currentQuestion.type];
  const correct = questionAnswered && questionSelectedAnswer === currentQuestion.correctAnswer;
  const canGoPrev = questionHistoryIndex > 0;
  const isAtEnd = questionHistoryIndex >= questionHistory.length - 1;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--sim-accent)", color: "#fff" }}>
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold" style={{ color: "var(--sim-fg)" }}>سؤالات پویا</h1>
            <p className="text-[10px]" style={{ color: "var(--sim-muted)" }}>موتور تولید سؤال هوشمند</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "var(--sim-card)", border: "1px solid var(--sim-border)" }}>
            <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#16a34a" }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {questionCorrectCount}
            </span>
            <span className="text-xs font-bold flex items-center gap-1" style={{ color: "#dc2626" }}>
              <XCircle className="w-3.5 h-3.5" /> {questionWrongCount}
            </span>
            <span className="text-[10px]" style={{ color: "var(--sim-muted)" }}>از {questionTotalCount}</span>
          </div>
          {/* Previous / Next question navigation */}
          <button
            onClick={goToPreviousQuestion}
            disabled={!canGoPrev}
            title="سؤال قبلی"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border"
            style={{
              background: canGoPrev ? "#ffffff" : "#f5f5f5",
              borderColor: canGoPrev ? "var(--sim-border)" : "#e5e5e5",
              color: canGoPrev ? "var(--sim-accent)" : "#ccc",
              cursor: canGoPrev ? "pointer" : "not-allowed",
              opacity: canGoPrev ? 1 : 0.5,
            }}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              // Use a ref-like approach: read current values from the store hook
              // goToNextQuestion returns early if there's no next entry,
              // so we can safely call it. If it does nothing (at end), generate new.
              const state = useSimStore.getState();
              const nextIdx = state.questionHistoryIndex + 1;
              const hasNext = !!state.questionHistory[nextIdx];
              if (hasNext) {
                state.goToNextQuestion();
              } else if (state.questionAnswered) {
                state.generateNewQuestion();
              }
            }}
            disabled={!questionAnswered}
            title={isAtEnd && questionAnswered ? "سؤال جدید" : "سؤال بعدی"}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border"
            style={{
              background: !questionAnswered ? "#f5f5f5" : "var(--sim-accent)",
              borderColor: !questionAnswered ? "#e5e5e5" : "var(--sim-accent)",
              color: !questionAnswered ? "#ccc" : "#fff",
              cursor: !questionAnswered ? "not-allowed" : "pointer",
              opacity: !questionAnswered ? 0.5 : 1,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("lab")}
            className="gap-1.5"
            style={{ borderColor: "var(--sim-border)" }}
          >
            بازگشت
          </Button>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionHistoryIndex + "-" + (questionAnswered ? "a" : "q")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-5 mb-4" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}>
            {/* Question type badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{typeInfo.emoji}</span>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "var(--sim-accent-soft)", color: "var(--sim-accent)" }}
              >
                {typeInfo.label}
              </span>
              {currentQuestion.isErrorScenario && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  ⚠️ سناریوی خطادار
                </span>
              )}
              <span className="text-[10px] mr-auto" style={{ color: "var(--sim-muted)" }}>
                سؤال {questionHistoryIndex + 1}
              </span>
            </div>

            {/* Question text */}
            <div className="mb-5">
              <p className="text-base font-semibold leading-7" style={{ color: "var(--sim-fg)" }}>
                {currentQuestion.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = questionSelectedAnswer === opt.value;
                const isCorrect = opt.value === currentQuestion.correctAnswer;
                const showResult = questionAnswered;

                let bg = "#ffffff";
                let border = "var(--sim-border)";
                let color = "var(--sim-fg)";
                let icon = null;

                if (showResult) {
                  if (isCorrect) {
                    bg = "#d9f0e4";
                    border = "#16a34a";
                    color = "#065f46";
                    icon = <CheckCircle2 className="w-5 h-5" style={{ color: "#16a34a" }} />;
                  } else if (isSelected) {
                    bg = "#fee2e2";
                    border = "#dc2626";
                    color = "#991b1b";
                    icon = <XCircle className="w-5 h-5" style={{ color: "#dc2626" }} />;
                  }
                }

                return (
                  <button
                    key={opt.value}
                    disabled={questionAnswered}
                    onClick={() => answerQuestion(opt.value)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border-2 text-right transition-all"
                    style={{
                      background: bg,
                      borderColor: border,
                      color,
                      cursor: questionAnswered ? "default" : "pointer",
                    }}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: showResult && isCorrect ? "#16a34a" : showResult && isSelected ? "#dc2626" : "var(--sim-accent-soft)",
                        color: showResult && (isCorrect || isSelected) ? "#fff" : "var(--sim-accent)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold flex-1">{opt.label}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Result + explanation */}
            <AnimatePresence>
              {questionAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      background: correct ? "#ecfdf5" : "#fef2f2",
                      border: `2px solid ${correct ? "#16a34a" : "#dc2626"}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {correct ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: "#16a34a" }} />
                      ) : (
                        <XCircle className="w-5 h-5" style={{ color: "#dc2626" }} />
                      )}
                      <span className="text-sm font-extrabold" style={{ color: correct ? "#065f46" : "#991b1b" }}>
                        {correct ? "آفرین! درست جواب دادی" : "پاسخ نادرست"}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 mb-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--sim-accent)" }} />
                      <div>
                        <div className="text-[11px] font-bold mb-1" style={{ color: "var(--sim-accent)" }}>توضیح علمی:</div>
                        <p className="text-xs leading-5" style={{ color: "var(--sim-fg)" }}>
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                    {/* Correct answer — always shown clearly when wrong */}
                    {!correct && (
                      <div className="text-sm leading-5 mt-3 p-3 rounded-lg flex items-center gap-2" style={{ background: "#d9f0e4", border: "2px solid #16a34a" }}>
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#16a34a" }} />
                        <div>
                          <span className="font-bold" style={{ color: "#065f46" }}>پاسخ صحیح: </span>
                          <span className="font-extrabold" style={{ color: "#065f46" }}>
                            {currentQuestion.options.find((o) => o.value === currentQuestion.correctAnswer)?.label}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Why the selected wrong answer is wrong */}
                    {!correct && questionSelectedAnswer && currentQuestion.wrongExplanations && currentQuestion.wrongExplanations[questionSelectedAnswer] && (
                      <div className="text-xs leading-5 mt-2 p-3 rounded-lg" style={{ background: "#fff", border: "1px solid #fca5a5" }}>
                        <span className="font-bold" style={{ color: "#991b1b" }}>چرا پاسخ شما نادرست است؟ </span>
                        <span style={{ color: "var(--sim-fg)" }}>{currentQuestion.wrongExplanations[questionSelectedAnswer]}</span>
                      </div>
                    )}
                    {/* Why other wrong options are wrong */}
                    {!correct && currentQuestion.wrongExplanations && (
                      <div className="text-[11px] leading-5 mt-2 p-3 rounded-lg" style={{ background: "#f8fafc", border: "1px solid var(--sim-border)" }}>
                        <div className="font-bold mb-1" style={{ color: "var(--sim-muted)" }}>بررسی سایر گزینه‌ها:</div>
                        {currentQuestion.options
                          .filter((o) => o.value !== currentQuestion.correctAnswer && o.value !== questionSelectedAnswer)
                          .map((o) => {
                            const why = currentQuestion.wrongExplanations?.[o.value];
                            if (!why) return null;
                            return (
                              <div key={o.value} className="mb-1.5 flex gap-1.5">
                                <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                                <div>
                                  <span className="font-semibold" style={{ color: "var(--sim-fg)" }}>«{o.label}»:</span>{" "}
                                  <span style={{ color: "var(--sim-muted)" }}>{why}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Scenario info */}
                  <div className="mt-3 p-3 rounded-xl text-[11px]" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
                    <div className="font-bold mb-1" style={{ color: "var(--sim-accent)" }}>سناریوی آزمایش:</div>
                    <div className="grid grid-cols-2 gap-1" style={{ color: "var(--sim-fg)" }}>
                      <div>بار الکتروسکوپ: <b>{chargeLabel(currentQuestion.scenario.electroscopeCharge)}</b></div>
                      <div>بار میله: <b>{chargeLabel(currentQuestion.scenario.rodCharge)}</b></div>
                      <div>نوع آزمایش: <b>{currentQuestion.scenario.experimentType === "contact" ? "تماس" : "نزدیک کردن"}</b></div>
                      <div>مقدار بار: <b>{magnitudeLabel(currentQuestion.scenario.rodMagnitude)}</b></div>
                    </div>
                  </div>

                  {/* Bottom action buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      className="flex-1 gap-1.5"
                      style={{ background: "var(--sim-accent)", color: "#fff" }}
                      onClick={() => {
                        const state = useSimStore.getState();
                        const nextIdx = state.questionHistoryIndex + 1;
                        const hasNext = !!state.questionHistory[nextIdx];
                        if (hasNext) {
                          state.goToNextQuestion();
                        } else if (state.questionAnswered) {
                          state.generateNewQuestion();
                        }
                      }}
                    >
                      {isAtEnd && questionAnswered ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          سؤال جدید
                        </>
                      ) : (
                        <>
                          سؤال بعدی
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReportModal(true)}
                      className="gap-1.5"
                      style={{ borderColor: "#d97706", color: "#d97706" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      گزارش سؤال
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={endQuestionPractice}
                      className="gap-1.5"
                      style={{ borderColor: "#dc2626", color: "#dc2626" }}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      پایان تمرین
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Footer info */}
      <div className="text-center text-[11px] mt-4" style={{ color: "var(--sim-muted)" }}>
        <Sparkles className="w-3 h-3 inline-block ml-1" />
        هر سؤال به‌صورت تصادفی از موتور فیزیک تولید می‌شود — هر بار یک آزمایش جدید!
      </div>

      {/* Report Question Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportQuestionModal
            question={currentQuestion}
            selectedAnswer={questionSelectedAnswer}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== Practice Report Card =====

function PracticeReport({ onReset, onExit }: { onReset: () => void; onExit: () => void }) {
  const questionCorrectCount = useSimStore((s) => s.questionCorrectCount);
  const questionWrongCount = useSimStore((s) => s.questionWrongCount);
  const questionTotalCount = useSimStore((s) => s.questionTotalCount);
  const questionHistory = useSimStore((s) => s.questionHistory);

  const total = questionTotalCount;
  const correct = questionCorrectCount;
  const wrong = questionWrongCount;

  // Score with negative marking: each correct = +3, each wrong = -1
  const rawScore = correct * 3 - wrong * 1;
  const maxScore = total * 3;
  const percentage = total > 0 ? Math.max(0, Math.round((rawScore / maxScore) * 100)) : 0;

  // Analyze strengths and weaknesses by question type
  const typeStats: Record<string, { correct: number; wrong: number; total: number }> = {};
  questionHistory.forEach((h) => {
    const type = h.question.type;
    if (!typeStats[type]) typeStats[type] = { correct: 0, wrong: 0, total: 0 };
    typeStats[type].total++;
    if (h.correct) typeStats[type].correct++;
    else typeStats[type].wrong++;
  });

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  Object.entries(typeStats).forEach(([type, stats]) => {
    const label = QUESTION_TYPE_LABELS[type as QuestionType]?.label || type;
    const rate = stats.total > 0 ? stats.correct / stats.total : 0;
    if (rate >= 0.7) {
      strengths.push(`${label} (${stats.correct}/${stats.total})`);
    } else {
      weaknesses.push(`${label} (${stats.correct}/${stats.total})`);
    }
  });

  // Generate suggestions based on weaknesses
  if (weaknesses.length === 0 && total > 0) {
    suggestions.push("عملکرد عالی! در همه انواع سؤال قوی هستی. می‌توانی سطوح سخت‌تر را امتحان کنی.");
  } else {
    weaknesses.forEach((w) => {
      if (w.includes("پیش‌بینی")) {
        suggestions.push("مفهوم القا و اثر نزدیک‌کردن میله را مرور کن — به توزیع بار در الکتروسکوپ دقت کن.");
      }
      if (w.includes("تشخیص بار")) {
        suggestions.push("جدول الکتریسیته مالشی و علامت بارها را دوباره مرور کن.");
      }
      if (w.includes("نوع آزمایش")) {
        suggestions.push("تفاوت بین نزدیک‌کردن (القا) و تماس (انتقال بار) را در شبیه‌ساز امتحان کن.");
      }
      if (w.includes("تحلیل")) {
        suggestions.push("دلیل فیزیکی باز/بسته شدن تیغه‌ها را در حالت‌های مختلف مرور کن.");
      }
      if (w.includes("خطا")) {
        suggestions.push("قوانین فیزیک الکتروستاتیک را مرور کن تا بتوانی نتایج نادرست را تشخیص دهی.");
      }
    });
  }

  if (total === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}>
          <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--sim-muted)" }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--sim-fg)" }}>هنوز سؤالی پاسخ نداده‌ای</h2>
          <p className="text-sm mb-4" style={{ color: "var(--sim-muted)" }}>برای دریافت کارنامه، ابتدا چند سؤال را پاسخ بده.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onReset} style={{ background: "var(--sim-accent)", color: "#fff" }} className="gap-1.5">
              <RotateCcw className="w-4 h-4" />
              شروع تمرین
            </Button>
            <Button variant="outline" onClick={onExit} style={{ borderColor: "var(--sim-border)" }} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              بازگشت
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const grade = percentage >= 90 ? "عالی" : percentage >= 75 ? "خوب" : percentage >= 50 ? "متوسط" : "نیاز به تمرین";
  const gradeColor = percentage >= 75 ? "#16a34a" : percentage >= 50 ? "#d97706" : "#dc2626";
  const gradeEmoji = percentage >= 90 ? "🏆" : percentage >= 75 ? "🎉" : percentage >= 50 ? "📚" : "💪";

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 mb-4" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}>
          {/* Header */}
          <div className="text-center mb-5">
            <div className="text-5xl mb-2">{gradeEmoji}</div>
            <h1 className="text-xl font-extrabold mb-1" style={{ color: "var(--sim-fg)" }}>کارنامه تحلیلی</h1>
            <p className="text-xs" style={{ color: "var(--sim-muted)" }}>گزارش عملکرد شما در تمرین سؤالات پویا</p>
          </div>

          {/* Score summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 rounded-xl" style={{ background: "#d9f0e4", border: "1px solid #a7e8c8" }}>
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1" style={{ color: "#16a34a" }} />
              <div className="text-2xl font-extrabold" style={{ color: "#065f46" }}>{correct}</div>
              <div className="text-[10px]" style={{ color: "#065f46" }}>درست</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
              <XCircle className="w-6 h-6 mx-auto mb-1" style={{ color: "#dc2626" }} />
              <div className="text-2xl font-extrabold" style={{ color: "#991b1b" }}>{wrong}</div>
              <div className="text-[10px]" style={{ color: "#991b1b" }}>نادرست</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
              <Trophy className="w-6 h-6 mx-auto mb-1" style={{ color: "var(--sim-accent)" }} />
              <div className="text-2xl font-extrabold" style={{ color: "var(--sim-accent)" }}>{percentage}%</div>
              <div className="text-[10px]" style={{ color: "var(--sim-muted)" }}>درصد نهایی</div>
            </div>
          </div>

          {/* Grade + score detail */}
          <div className="rounded-xl p-4 mb-4" style={{ background: "var(--sim-accent-soft)", border: "1px solid var(--sim-border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: "var(--sim-fg)" }}>ارزیابی:</span>
              <span className="text-sm font-extrabold px-3 py-1 rounded-full" style={{ background: gradeColor, color: "#fff" }}>{grade}</span>
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--sim-muted)" }}>
              <span>نمره (با احتساب نمره منفی):</span>
              <span className="font-bold" style={{ color: "var(--sim-fg)" }}>
                {rawScore} از {maxScore} (هر درست: +۳، هر نادرست: −۱)
              </span>
            </div>
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: "#16a34a" }} />
                <span className="text-sm font-bold" style={{ color: "#065f46" }}>نقاط قوت</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((s, i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#d9f0e4", color: "#065f46" }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="w-4 h-4" style={{ color: "#dc2626" }} />
                <span className="text-sm font-bold" style={{ color: "#991b1b" }}>نقاط ضعف</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {weaknesses.map((w, i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#fee2e2", color: "#991b1b" }}>
                    ✗ {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="w-4 h-4" style={{ color: "var(--sim-accent)" }} />
                <span className="text-sm font-bold" style={{ color: "var(--sim-accent)" }}>پیشنهاد برای مطالعه</span>
              </div>
              <ul className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-xs leading-5 flex gap-1.5" style={{ color: "var(--sim-fg)" }}>
                    <span style={{ color: "var(--sim-accent)" }}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-5">
            <Button onClick={onReset} className="flex-1 gap-1.5" style={{ background: "var(--sim-accent)", color: "#fff" }}>
              <RotateCcw className="w-4 h-4" />
              تمرین مجدد
            </Button>
            <Button variant="outline" onClick={onExit} className="flex-1 gap-1.5" style={{ borderColor: "var(--sim-border)" }}>
              <ArrowLeft className="w-4 h-4" />
              بازگشت به اصلی
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function chargeLabel(charge: string): string {
  if (charge === "positive") return "مثبت";
  if (charge === "negative") return "منفی";
  return "خنثی";
}

function magnitudeLabel(mag: string): string {
  if (mag === "low") return "کم";
  if (mag === "medium") return "متوسط";
  return "زیاد";
}

// ===== Report Question Modal =====

function ReportQuestionModal({ question, selectedAnswer, onClose }: {
  question: any;
  selectedAnswer: string | null;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSend = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/report-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: question?.questionText || "",
          options: question?.options || [],
          correctAnswer: question?.correctAnswer || "",
          selectedAnswer: selectedAnswer || "",
          explanation: question?.explanation || "",
          wrongExplanations: question?.wrongExplanations || {},
          scenario: question?.scenario || {},
          reportNote: note,
          userEmail: userEmail || "",
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setTimeout(() => onClose(), 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(43,38,32,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl p-6"
        style={{ background: "var(--sim-card)", border: "1px solid var(--sim-border)" }}
        initial={{ y: 20, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7", color: "#d97706" }}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--sim-fg)" }}>گزارش سؤال</h2>
            <p className="text-[11px]" style={{ color: "var(--sim-muted)" }}>اگر این سؤال از نظر علمی نادرست است، گزارش کنید</p>
          </div>
        </div>

        {/* Question summary */}
        <div className="rounded-xl p-3 mb-3 text-[11px] max-h-40 overflow-y-auto sim-scroll" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
          <div className="font-bold mb-1" style={{ color: "var(--sim-accent)" }}>متن سؤال:</div>
          <p className="leading-5 mb-2" style={{ color: "var(--sim-fg)" }}>{question?.questionText}</p>
          <div className="font-bold mb-1" style={{ color: "var(--sim-accent)" }}>پاسخ صحیح:</div>
          <p className="leading-5" style={{ color: "var(--sim-fg)" }}>
            {question?.options?.find((o: any) => o.value === question?.correctAnswer)?.label}
          </p>
        </div>

        {/* Note input */}
        <textarea
          className="w-full p-3 rounded-xl text-sm mb-3 resize-none"
          style={{ background: "#ffffff", border: "1px solid var(--sim-border)", color: "var(--sim-fg)" }}
          rows={2}
          placeholder="توضیح: چه مشکلی در این سؤال دیدید؟ (اختیاری)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={status === "sending" || status === "sent"}
        />

        {/* Email input */}
        <input
          type="email"
          className="w-full p-3 rounded-xl text-sm mb-1"
          style={{ background: "#ffffff", border: "1px solid var(--sim-border)", color: "var(--sim-fg)" }}
          placeholder="ایمیل شما (اختیاری)"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          disabled={status === "sending" || status === "sent"}
        />
        <p className="text-[10px] mb-3" style={{ color: "var(--sim-muted)" }}>
          جهت دریافت پاسخ، ایمیل خود را وارد کنید. هر دو فیلد اختیاری است.
        </p>

        {/* Status */}
        {status === "sent" && (
          <div className="text-center text-sm font-bold mb-3 p-2 rounded-lg" style={{ background: "#d9f0e4", color: "#065f46" }}>
            ✅ گزارش شما ثبت شد. متشکریم!
          </div>
        )}
        {status === "error" && (
          <div className="text-center text-sm font-bold mb-3 p-2 rounded-lg" style={{ background: "#fee2e2", color: "#991b1b" }}>
            خطا در ثبت گزارش. دوباره تلاش کنید.
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            style={{ borderColor: "var(--sim-border)" }}
          >
            انصراف
          </Button>
          <Button
            className="flex-1 gap-1.5"
            onClick={handleSend}
            disabled={status === "sending" || status === "sent"}
            style={{ background: "#d97706", color: "#fff" }}
          >
            {status === "sending" ? "در حال ارسال..." : (
              <>
                <Send className="w-4 h-4" />
                ارسال گزارش
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
