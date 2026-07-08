"use client";

import { useSimStore } from "@/lib/sim-store";
import { MISSIONS, getCorrectAnswer, getExplanation, getCompletionMessage } from "@/lib/sim-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Trophy,
  FlaskRound,
  Lightbulb,
  ChevronLeft,
} from "lucide-react";

export function Missions() {
  const mission = useSimStore((s) => s.mission);
  const startMission = useSimStore((s) => s.startMission);
  const exitMission = useSimStore((s) => s.exitMission);
  const setView = useSimStore((s) => s.setView);

  // Not in a mission — show selection screen
  if (!mission.active) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--sim-accent)", color: "#fff" }}>
              <Gamepad2 className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--sim-fg)" }}>ماموریت‌های آموزشی</h1>
          <p className="text-sm" style={{ color: "var(--sim-muted)" }}>
            سه چالش علمی برای کشف رازهای الکتروستاتیک. هر بار داده‌ها تغییر می‌کنند!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {([1, 2, 3] as const).map((id) => {
            const m = MISSIONS[id];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: id * 0.1 }}
              >
                <Card
                  className="p-5 flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-all h-full"
                  style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}
                  onClick={() => startMission(id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{m.emoji}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: "var(--sim-accent-soft)", color: "var(--sim-accent)" }}
                    >
                      ماموریت {id}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold" style={{ color: "var(--sim-fg)" }}>{m.title}</h3>
                  <p className="text-xs leading-5 flex-1" style={{ color: "var(--sim-muted)" }}>{m.story}</p>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold pt-2 border-t" style={{ borderColor: "var(--sim-border)", color: "var(--sim-accent)" }}>
                    <Target className="w-3.5 h-3.5" />
                    {m.objective}
                  </div>
                  <Button className="w-full gap-1.5 mt-1" style={{ background: "var(--sim-accent)", color: "#fff" }}>
                    <Sparkles className="w-4 h-4" />
                    شروع ماموریت
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Mission is active — delegate to active mission component
  return <ActiveMission />;
}

function ActiveMission() {
  const mission = useSimStore((s) => s.mission);
  const exitMission = useSimStore((s) => s.exitMission);
  const setView = useSimStore((s) => s.setView);

  if (!mission.missionId) return null;
  const m = MISSIONS[mission.missionId];
  const testedCount = Object.keys(mission.tested).length;
  const correctCount = Object.values(mission.tested).filter((t) => t.correct).length;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      {/* Center: electroscope simulator (always visible during mission) */}
      <div>
        <MissionSimulator />
      </div>

      {/* Right: mission control panel */}
      <Card className="p-4 flex flex-col gap-3 sim-scroll overflow-y-auto" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)", maxHeight: "calc(100vh - 140px)" }}>
        {/* Mission header */}
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--sim-border)" }}>
          <span className="text-3xl">{m.emoji}</span>
          <div className="flex-1">
            <h3 className="font-extrabold text-sm" style={{ color: "var(--sim-fg)" }}>{m.title}</h3>
            <span className="text-[10px]" style={{ color: "var(--sim-muted)" }}>ماموریت {mission.missionId}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={exitMission} className="text-[11px] gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            خروج
          </Button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--sim-muted)" }}>
          <span>پیشرفت:</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#eaf4fc" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--sim-accent)" }}
              animate={{ width: `${(testedCount / mission.objects.length) * 100}%` }}
            />
          </div>
          <span className="font-bold">{testedCount}/{mission.objects.length}</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Phase: intro */}
          {mission.phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FlaskRound className="w-4 h-4" style={{ color: "var(--sim-accent)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--sim-accent)" }}>سناریو</span>
                </div>
                <p className="text-xs leading-6" style={{ color: "var(--sim-fg)" }}>{m.story}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#fde9c8", border: "1px solid #fcd9a4" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-4 h-4" style={{ color: "#92400e" }} />
                  <span className="text-xs font-bold" style={{ color: "#92400e" }}>هدف آموزشی</span>
                </div>
                <p className="text-xs leading-5" style={{ color: "#92400e" }}>{m.objective}</p>
              </div>
              {mission.missionId === 2 && (
                <div className="rounded-xl p-3" style={{ background: "#d9f0e4", border: "1px solid #a7e8c8" }}>
                  <div className="text-xs font-bold mb-1" style={{ color: "#065f46" }}>بار اولیه الکتروسکوپ:</div>
                  <div className="text-sm font-extrabold" style={{ color: "#065f46" }}>
                    {useSimStore.getState().netCharge > 0 ? "مثبت (+)" : "منفی (−)"}
                  </div>
                </div>
              )}
              <Button
                className="w-full gap-1.5"
                style={{ background: "var(--sim-accent)", color: "#fff" }}
                onClick={() => {
                  // Go to selection for all missions
                  useSimStore.setState({
                    mission: { ...mission, phase: "selection" },
                  });
                }}
              >
                <Sparkles className="w-4 h-4" />
                شروع آزمایش
              </Button>
            </motion.div>
          )}

          {/* Phase: selection (missions 1 & 3) */}
          {mission.phase === "selection" && (
            <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
              <div className="text-xs font-bold mb-1" style={{ color: "var(--sim-fg)" }}>
                {mission.missionId === 1 && "یک جسم را برای آزمایش انتخاب کن:"}
                {mission.missionId === 2 && "یک میله ناشناخته را برای آزمایش انتخاب کن:"}
                {mission.missionId === 3 && "یک جسم را برای تماس با کلاهک انتخاب کن:"}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {mission.objects.map((obj) => {
                  const tested = mission.tested[obj.id];
                  return (
                    <button
                      key={obj.id}
                      onClick={() => useSimStore.getState().missionSelectObject(obj.id)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border transition-all text-right"
                      style={{
                        background: tested ? (tested.correct ? "#d9f0e4" : "#fee2e2") : "#ffffff",
                        borderColor: tested ? (tested.correct ? "#a7e8c8" : "#fca5a5") : "var(--sim-border)",
                      }}
                    >
                      <span className="text-2xl">{obj.emoji}</span>
                      <span className="text-xs font-bold flex-1" style={{ color: "var(--sim-fg)" }}>{obj.name}</span>
                      {tested && (
                        tested.correct
                          ? <CheckCircle2 className="w-4 h-4" style={{ color: "#16a34a" }} />
                          : <XCircle className="w-4 h-4" style={{ color: "#dc2626" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Phase: prediction */}
          {mission.phase === "prediction" && (
            <motion.div key="prediction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "#eaf4fc" }}>
                <span className="text-2xl">{mission.objects[mission.currentIndex].emoji}</span>
                <span className="text-sm font-bold" style={{ color: "var(--sim-fg)" }}>{mission.objects[mission.currentIndex].name}</span>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#fef9e7", border: "1px solid #fde9c8" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-4 h-4" style={{ color: "#854d0e" }} />
                  <span className="text-xs font-bold" style={{ color: "#854d0e" }}>پیش‌بینی کن</span>
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--sim-fg)" }}>{m.predictionLabel}</p>
                <div className="grid grid-cols-1 gap-2">
                  {m.predictionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => useSimStore.getState().missionSetPrediction(opt.value)}
                      className="px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                      style={{ borderColor: "var(--sim-border)", background: "#ffffff", color: "var(--sim-fg)" }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase: experiment */}
          {mission.phase === "experiment" && (
            <motion.div key="experiment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: "#dbeaf9", border: "1px solid var(--sim-accent-soft)" }}>
                <div className="text-xs font-bold mb-1" style={{ color: "#1d6fd6" }}>پیش‌بینی تو:</div>
                <div className="text-sm font-extrabold" style={{ color: "#1d6fd6" }}>
                  {m.predictionOptions.find((o) => o.value === mission.prediction)?.label}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <FlaskRound className="w-4 h-4" style={{ color: "var(--sim-accent)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--sim-accent)" }}>آزمایش را انجام بده</span>
                </div>
                <p className="text-[11px] leading-5" style={{ color: "var(--sim-fg)" }}>
                  {mission.missionId === 1 && "جسم را با کشیدن به کلاهک نزدیک کن و تماس بده. اگر تیغه باز شد، جسم باردار است."}
                  {mission.missionId === 2 && "میله را با کشیدن بالا/پایین نزدیک کن (بدون تماس). اگر تیغه‌ها بیشتر باز شدند، بار هم‌نام است."}
                  {mission.missionId === 3 && "جسم را با کشیدن به کلاهک نزدیک کن و تماس بده. اگر تیغه بسته شد، جسم رساناست."}
                </p>
              </div>
              <Button
                className="w-full gap-1.5"
                style={{ background: "var(--sim-accent)", color: "#fff" }}
                onClick={() => useSimStore.getState().missionObserveResult()}
              >
                <CheckCircle2 className="w-4 h-4" />
                مشاهده نتیجه
              </Button>
            </motion.div>
          )}

          {/* Phase: result */}
          {mission.phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <ResultPanel />
              <Button
                className="w-full gap-1.5"
                style={{ background: "var(--sim-accent)", color: "#fff" }}
                onClick={() => useSimStore.getState().missionNextObject()}
              >
                {testedCount >= mission.objects.length
                  ? "پایان ماموریت"
                  : "آزمایش بعدی"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Phase: complete */}
          {mission.phase === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <div className="text-center py-4">
                <div className="text-5xl mb-2">{correctCount === mission.objects.length ? "🏆" : correctCount >= mission.objects.length / 2 ? "🎉" : "📚"}</div>
                <h3 className="text-lg font-extrabold mb-1" style={{ color: "var(--sim-fg)" }}>ماموریت تمام شد!</h3>
                <p className="text-sm" style={{ color: "var(--sim-muted)" }}>{getCompletionMessage(correctCount, mission.objects.length)}</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
                <div className="text-3xl font-extrabold" style={{ color: "var(--sim-accent)" }}>
                  {correctCount} / {mission.objects.length}
                </div>
                <div className="text-[11px]" style={{ color: "var(--sim-muted)" }}>پاسخ درست</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  style={{ borderColor: "var(--sim-border)" }}
                  onClick={() => useSimStore.getState().startMission(mission.missionId!)}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  دوباره
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  style={{ background: "var(--sim-accent)", color: "#fff" }}
                  onClick={exitMission}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  ماموریت‌ها
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

function ResultPanel() {
  const mission = useSimStore((s) => s.mission);
  if (!mission.missionId || mission.prediction === null) return null;
  const obj = mission.objects[mission.currentIndex];
  const correctAnswer = getCorrectAnswer(mission.missionId, obj);
  const correct = mission.prediction === correctAnswer;
  const m = MISSIONS[mission.missionId];

  return (
    <div className="flex flex-col gap-2">
      <div
        className="rounded-xl p-3 flex items-center gap-2"
        style={{
          background: correct ? "#d9f0e4" : "#fee2e2",
          border: `1px solid ${correct ? "#a7e8c8" : "#fca5a5"}`,
        }}
      >
        {correct ? <CheckCircle2 className="w-6 h-6" style={{ color: "#16a34a" }} /> : <XCircle className="w-6 h-6" style={{ color: "#dc2626" }} />}
        <div>
          <div className="text-sm font-extrabold" style={{ color: correct ? "#065f46" : "#991b1b" }}>
            {correct ? "درست!" : "دقت کن!"}
          </div>
          <div className="text-[11px]" style={{ color: correct ? "#065f46" : "#991b1b" }}>
            پاسخ صحیح: {m.predictionOptions.find((o) => o.value === correctAnswer)?.label}
          </div>
        </div>
      </div>
      <div className="rounded-xl p-3" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)" }}>
        <div className="flex items-center gap-1.5 mb-1">
          <Lightbulb className="w-4 h-4" style={{ color: "var(--sim-accent)" }} />
          <span className="text-xs font-bold" style={{ color: "var(--sim-accent)" }}>توضیح علمی</span>
        </div>
        <p className="text-[11px] leading-5" style={{ color: "var(--sim-fg)" }}>{getExplanation(mission.missionId, obj, useSimStore.getState().netCharge)}</p>
      </div>
      {!correct && (
        <div className="rounded-xl p-2.5 text-[11px] leading-5" style={{ background: "#fef9e7", border: "1px solid #fde9c8", color: "#854d0e" }}>
          💡 {mission.missionId === 1 && "اگر تیغه باز شد یعنی جسم باردار است، اگر تغییری نکرد یعنی خنثی است."}
          {mission.missionId === 2 && "اگر تیغه‌ها بیشتر باز شدند یعنی بار هم‌نام است، اگر بسته‌تر شدند یعنی ناهم‌نام."}
          {mission.missionId === 3 && "اگر تیغه بسته شد یعنی جسم رساناست، اگر باز ماند یعنی نارسانا."}
        </div>
      )}
    </div>
  );
}

// Wrapper that shows the electroscope simulator during missions
function MissionSimulator() {
  return (
    <Card className="p-4 flex flex-col items-center" style={{ background: "linear-gradient(180deg,#ffffff,#eaf4fc)", borderColor: "var(--sim-border)" }}>
      <div className="w-full flex items-center justify-between mb-2">
        <h2 className="text-lg font-extrabold" style={{ color: "var(--sim-fg)" }}>آزمایشگاه ماموریت</h2>
        <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: "var(--sim-accent-soft)", color: "var(--sim-accent)" }}>
          میله را بکش ↑↓
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        <MissionElectroscope />
      </div>
    </Card>
  );
}

// Import the Electroscope component lazily within the simulator
import { Electroscope } from "./Electroscope";

function MissionElectroscope() {
  // The Electroscope component reads from the store directly,
  // so it will show the mission state (pre-charged, test rod, etc.)
  return <Electroscope width={440} height={459} />;
}
