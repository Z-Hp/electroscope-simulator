"use client";

import { useSimStore } from "@/lib/sim-store";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, SkipForward, Sparkles, Zap, Cable, Magnet } from "lucide-react";
import { useState } from "react";

const SLIDES = [
  {
    icon: "🔬",
    title: "به شبیه‌ساز الکتروسکوپ خوش آمدی",
    body: "اینجا فیزیک الکتروستاتیک را با کار کردن و دیدن یاد می‌گیری؛ نه با حفظ کردن. میله را مالش بده، نزدیک کن، تماس بده و زمین کن.",
    color: "var(--sim-accent)",
  },
  {
    icon: "🧲",
    title: "سه اصل کلیدی",
    body: "۱) مالش بار ایجاد می‌کند. ۲) نزدیک‌کردن (بدون تماس) القا می‌سازد. ۳) تماس بار را منتقل می‌کند. زمین کردن بار را خنثی می‌کند.",
    color: "#0ea5e9",
  },
  {
    icon: "🎨",
    title: "راهنمای رنگ‌ها",
    body: "بار مثبت نارنجی (+) و بار منفی آبی (−) نشان داده می‌شود. در «حالت آموزشی» بارها را می‌بینی؛ در «حالت واقعی» پنهان می‌شوند.",
    color: "#10b981",
  },
  {
    icon: "🧠",
    title: "آزمون کن، پیش‌بینی کن",
    body: "در هر مرحله سؤالی برای پیش‌بینی پاسخ می‌دهی و بازخورد می‌گیری. در پایان گزارش اهداف آموزشی‌ات را می‌بینی.",
    color: "#d97706",
  },
];

export function IntroOverlay() {
  const skipIntro = useSimStore((s) => s.skipIntro);
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const last = step === SLIDES.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(43,38,32,0.55)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          className="w-full max-w-lg rounded-3xl p-6 relative"
          style={{ background: "var(--sim-card)", border: "1px solid var(--sim-border)", boxShadow: "0 20px 60px -20px rgba(80,60,20,0.4)" }}
          initial={{ y: 20, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--sim-accent)", color: "#fff" }}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base" style={{ color: "var(--sim-fg)" }}>شبیه‌ساز الکتروسکوپ</div>
              <div className="text-[11px]" style={{ color: "var(--sim-muted)" }}>پایه یازدهم — فیزیک</div>
            </div>
            <Button variant="ghost" size="sm" className="mr-auto text-[11px]" onClick={skipIntro}>
              <SkipForward className="w-3.5 h-3.5 ml-1" />
              رد کردن
            </Button>
          </div>

          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-6xl mb-3 floaty">{slide.icon}</div>
                <h2 className="text-lg font-extrabold mb-2" style={{ color: slide.color }}>{slide.title}</h2>
                <p className="text-sm leading-7" style={{ color: "var(--sim-fg)" }}>{slide.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* progress dots */}
          <div className="flex items-center justify-center gap-1.5 my-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 22 : 8,
                  height: 8,
                  background: i === step ? "var(--sim-accent)" : "#d6cdbb",
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)} style={{ borderColor: "var(--sim-border)" }}>
                قبلی
              </Button>
            )}
            <Button
              className="flex-1 gap-1.5"
              onClick={() => (last ? skipIntro() : setStep(step + 1))}
              style={{ background: "var(--sim-accent)", color: "#fff" }}
            >
              <Play className="w-4 h-4" />
              {last ? "شروع آزمایش" : "بعدی"}
            </Button>
          </div>

          {/* feature chips */}
          <div className="flex items-center justify-center gap-3 mt-4 text-[10px]" style={{ color: "var(--sim-muted)" }}>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> مالش</span>
            <span className="flex items-center gap-1"><Magnet className="w-3 h-3" /> القا</span>
            <span className="flex items-center gap-1"><Cable className="w-3 h-3" /> زمین</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function FinalReport({ onClose }: { onClose: () => void }) {
  const objectives = useSimStore((s) => s.objectives);
  const predictionsAnswered = useSimStore((s) => s.predictionsAnswered);
  const fullReset = useSimStore((s) => s.fullReset);
  const questionCorrectCount = useSimStore((s) => s.questionCorrectCount);
  const questionWrongCount = useSimStore((s) => s.questionWrongCount);
  const questionTotalCount = useSimStore((s) => s.questionTotalCount);
  const done = objectives.filter((o) => o.done).length;
  const total = objectives.length;
  const pct = Math.round((done / total) * 100);

  const qTotal = questionTotalCount;
  const qCorrect = questionCorrectCount;
  const qWrong = questionWrongCount;
  const qPct = qTotal > 0 ? Math.round((qCorrect / qTotal) * 100) : 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ background: "rgba(43,38,32,0.6)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto sim-scroll"
        style={{ background: "var(--sim-card)", border: "1px solid var(--sim-border)" }}
        initial={{ y: 20, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{pct >= 80 ? "🏆" : pct >= 50 ? "🎉" : "📚"}</div>
          <h2 className="text-lg font-extrabold" style={{ color: "var(--sim-fg)" }}>گزارش یادگیری</h2>
          <p className="text-xs" style={{ color: "var(--sim-muted)" }}>چه مفاهیمی را کشف کردی</p>
        </div>

        <div className="rounded-2xl p-3 mb-3" style={{ background: "linear-gradient(135deg,#dbeaf9,#ffffff)", border: "1px solid var(--sim-accent-soft)" }}>
          <div className="flex items-center justify-between text-xs font-bold mb-1" style={{ color: "#1d6fd6" }}>
            <span>پیشرفت کلی اهداف</span>
            <span>{pct}٪</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#fff" }}>
            <motion.div className="h-full" style={{ background: "var(--sim-accent)" }} animate={{ width: `${pct}%` }} />
          </div>
          <div className="text-[10px] mt-1" style={{ color: "var(--sim-muted)" }}>{done} از {total} هدف آموزشی</div>
        </div>

        {/* Dynamic questions score */}
        {qTotal > 0 && (
          <div className="rounded-2xl p-3 mb-3" style={{ background: "linear-gradient(135deg,#fef9e7,#ffffff)", border: "1px solid #fde9c8" }}>
            <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: "#854d0e" }}>
              <span>نتیجه سؤالات پویا</span>
              <span>{qPct}٪</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg" style={{ background: "#d9f0e4" }}>
                <div className="text-lg font-extrabold" style={{ color: "#065f46" }}>{qCorrect}</div>
                <div className="text-[9px]" style={{ color: "#065f46" }}>درست</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: "#fee2e2" }}>
                <div className="text-lg font-extrabold" style={{ color: "#991b1b" }}>{qWrong}</div>
                <div className="text-[9px]" style={{ color: "#991b1b" }}>نادرست</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: "#eaf4fc" }}>
                <div className="text-lg font-extrabold" style={{ color: "#1d6fd6" }}>{qTotal}</div>
                <div className="text-[9px]" style={{ color: "#1d6fd6" }}>کل</div>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-40 overflow-y-auto sim-scroll space-y-1 mb-3">
          {objectives.map((o) => (
            <div key={o.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg" style={{ background: o.done ? "#ecfdf5" : "#eaf4fc" }}>
              <span>{o.done ? "✅" : "⬜"}</span>
              <span style={{ color: o.done ? "#065f46" : "var(--sim-muted)", fontWeight: o.done ? 600 : 400 }}>{o.title}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} style={{ borderColor: "var(--sim-border)" }}>
            ادامه آزمایش
          </Button>
          <Button className="flex-1" onClick={() => { fullReset(); onClose(); }} style={{ background: "var(--sim-accent)", color: "#fff" }}>
            شروع دوباره
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
