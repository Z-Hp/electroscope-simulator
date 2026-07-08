"use client";

import { useState } from "react";
import { useSimStore } from "@/lib/sim-store";
import { TriboelectricLab } from "@/components/sim/TriboelectricLab";
import { ElectroscopeSimulator } from "@/components/sim/ElectroscopeSimulator";
import { LearningDashboard } from "@/components/sim/LearningDashboard";
import { IntroOverlay, FinalReport } from "@/components/sim/IntroReport";
import { Missions } from "@/components/sim/Missions";
import { DynamicQuestions } from "@/components/sim/DynamicQuestions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  FlaskConical,
  PanelRightOpen,
  PanelRightClose,
  Trophy,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Brain,
  Download,
} from "lucide-react";

export default function Home() {
  const view = useSimStore((s) => s.view);
  const setView = useSimStore((s) => s.setView);
  const introSeen = useSimStore((s) => s.introSeen);

  const fullReset = useSimStore((s) => s.fullReset);

  const [dashOpen, setDashOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--sim-bg)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-3 py-2.5 border-b"
        style={{
          background: "rgba(240,246,252,0.92)",
          backdropFilter: "blur(8px)",
          borderColor: "var(--sim-border)",
        }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center gap-2 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--sim-accent)", color: "#fff" }}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div
                className="font-extrabold text-sm"
                style={{ color: "var(--sim-fg)" }}
              >
                شبیه‌ساز الکتروسکوپ
              </div>
              <div
                className="text-[10px]"
                style={{ color: "var(--sim-muted)" }}
              >
                فیزیک یازدهم — الکتروستاتیک
              </div>
            </div>
          </div>

          {/* View tabs */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl mx-1"
            style={{ background: "var(--sim-accent-soft)" }}
          >
            <TabButton
              active={view === "lab"}
              onClick={() => setView("lab")}
              icon={<FlaskConical className="w-3.5 h-3.5" />}
            >
              کارگاه مالش
            </TabButton>
            <TabButton
              active={view === "sim"}
              onClick={() => setView("sim")}
              icon={<Zap className="w-3.5 h-3.5" />}
            >
              سالن الکتروسکوپ
            </TabButton>
            <TabButton
              active={view === "missions"}
              onClick={() => setView("missions")}
              icon={<Gamepad2 className="w-3.5 h-3.5" />}
            >
              ماموریت‌ها
            </TabButton>
            <TabButton
              active={view === "questions"}
              onClick={() => setView("questions")}
              icon={<Brain className="w-3.5 h-3.5" />}
            >
              سؤالات پویا
            </TabButton>
          </div>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setReportOpen(true)}
            className="gap-1.5"
            style={{ borderColor: "var(--sim-border)" }}
          >
            <Trophy className="w-3.5 h-3.5" />
            گزارش
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fullReset}
            className="gap-1.5"
            style={{ borderColor: "var(--sim-border)" }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ریست
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDashOpen((o) => !o)}
            className="gap-1.5 xl:hidden"
            style={{ borderColor: "var(--sim-border)" }}
          >
            {dashOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
            داشبورد
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full">
        <div className="max-w-[1400px] mx-auto p-3">
          {/* Missions view — full width, no side dashboard */}
          {view === "missions" ? (
            <Missions />
          ) : view === "questions" ? (
            <DynamicQuestions />
          ) : (
            <>
              {/* Responsive: dashboard as right column on xl, inline collapsible below on smaller */}
              <div className="grid xl:grid-cols-[1fr_340px] gap-3">
                <div className="min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      {view === "lab" ? (
                        <TriboelectricLab />
                      ) : (
                        <ElectroscopeSimulator />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Inline dashboard for smaller screens (non-blocking, pushes footer down) */}
                  <AnimatePresence>
                    {dashOpen && (
                      <motion.div
                        className="xl:hidden mt-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <LearningDashboard />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dashboard - persistent on xl */}
                <div className="hidden xl:block h-[calc(100vh-140px)] sticky top-[72px]">
                  <LearningDashboard />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-auto border-t"
        style={{
          background: "var(--sim-bg-2)",
          borderColor: "var(--sim-border)",
        }}
      >
        <div
          className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap text-[11px]"
          style={{ color: "var(--sim-muted)" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="flex items-center gap-1.5 font-semibold"
              style={{ color: "var(--sim-fg)" }}
            >
              <Sparkles
                className="w-3.5 h-3.5"
                style={{ color: "var(--sim-accent)" }}
              />
              راهنمای رنگ‌ها:
            </span>
            <Legend color="var(--pos)" label="بار مثبت (+)" />
            <Legend color="var(--neg)" label="بار منفی (−)" />
            <Legend color="#94a3b8" label="خنثی" />
          </div>
          <div className="flex items-center gap-2">
            <span>
              کلیه حقوق این شبیه ساز متعلق به آموزشگاه فَـــر دا می باشد.
            </span>
            <span style={{ color: "var(--sim-accent)" }}>•</span>
            <span>پایه یازدهم</span>
          </div>
        </div>
      </footer>

      {/* Intro overlay */}
      <AnimatePresence>{!introSeen && <IntroOverlay />}</AnimatePresence>

      {/* Final report */}
      <AnimatePresence>
        {reportOpen && <FinalReport onClose={() => setReportOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
      style={{
        background: active ? "#fffdf8" : "transparent",
        color: active ? "var(--sim-accent)" : "var(--sim-muted)",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
