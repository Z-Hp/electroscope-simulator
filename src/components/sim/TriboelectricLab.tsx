"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimStore } from "@/lib/sim-store";
import { RODS, CLOTHS, chargeLabel, RodMaterial, ClothMaterial } from "@/lib/sim-physics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, RotateCcw, ArrowLeft, AlertTriangle, Sparkles } from "lucide-react";

export function TriboelectricLab() {
  const selectedRod = useSimStore((s) => s.selectedRod);
  const selectedCloth = useSimStore((s) => s.selectedCloth);
  const rubProgress = useSimStore((s) => s.rubProgress);
  const rodCharge = useSimStore((s) => s.rodCharge);
  const clothCharge = useSimStore((s) => s.clothCharge);
  const electronsFrom = useSimStore((s) => s.electronsFrom);
  const rubWarning = useSimStore((s) => s.rubWarning);
  const showCharges = useSimStore((s) => s.showCharges);
  const showEnergyBar = useSimStore((s) => s.showEnergyBar);
  const doRub = useSimStore((s) => s.doRub);
  const selectRod = useSimStore((s) => s.selectRod);
  const selectCloth = useSimStore((s) => s.selectCloth);
  const resetLab = useSimStore((s) => s.resetLab);
  const bringRodToHall = useSimStore((s) => s.bringRodToHall);
  const setView = useSimStore((s) => s.setView);

  const rodInfo = selectedRod ? RODS[selectedRod] : null;
  const clothInfo = selectedCloth ? CLOTHS[selectedCloth] : null;
  const rodChargeInfo = chargeLabel(rodCharge);

  return (
    <div className="grid lg:grid-cols-[280px_1fr_280px] gap-4 h-full">
      {/* Left: materials */}
      <Card className="p-4 flex flex-col gap-3 sim-scroll overflow-y-auto" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}>
        <div>
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: "var(--sim-fg)" }}>
            <span className="w-1.5 h-4 rounded-full" style={{ background: "var(--sim-accent)" }} />
            انتخاب میله
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {(Object.keys(RODS) as RodMaterial[]).map((id) => {
              const r = RODS[id];
              const active = selectedRod === id;
              return (
                <button
                  key={id}
                  onClick={() => selectRod(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-right text-sm transition-all border ${active ? "ring-2" : "hover:bg-blue-50"}`}
                  style={{
                    background: active ? "var(--sim-accent-soft)" : "#fffdf8",
                    borderColor: active ? "var(--sim-accent)" : "var(--sim-border)",
                    boxShadow: active ? `0 0 0 2px var(--sim-accent)` : "none",
                  }}
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span className="font-semibold flex-1">{r.name}</span>
                  {r.conductor && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: "var(--sim-fg)" }}>
            <span className="w-1.5 h-4 rounded-full" style={{ background: "#0ea5e9" }} />
            انتخاب پارچه
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {(Object.keys(CLOTHS) as ClothMaterial[]).map((id) => {
              const c = CLOTHS[id];
              const active = selectedCloth === id;
              return (
                <button
                  key={id}
                  onClick={() => selectCloth(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-right text-sm transition-all border ${active ? "ring-2" : "hover:bg-sky-50"}`}
                  style={{
                    background: active ? "#e0f2fe" : "#fffdf8",
                    borderColor: active ? "#0ea5e9" : "var(--sim-border)",
                    boxShadow: active ? `0 0 0 2px #0ea5e9` : "none",
                  }}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span className="font-semibold flex-1">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-auto pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={resetLab}
            style={{ borderColor: "var(--sim-border)" }}
          >
            <RotateCcw className="w-3.5 h-3.5 ml-1" />
            ریست مالش
          </Button>
        </div>
      </Card>

      {/* Center: rubbing stage */}
      <Card className="p-4 flex flex-col items-center justify-between relative overflow-hidden" style={{ background: "linear-gradient(180deg,#ffffff,#eaf4fc)", borderColor: "var(--sim-border)" }}>
        <div className="w-full text-center mb-2">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--sim-fg)" }}>کارگاه مالش</h2>
          <p className="text-xs" style={{ color: "var(--sim-muted)" }}>
            پارچه را با انگشت یا ماوس به چپ و راست بکش — یا دکمه «مالش سریع» را بزن
          </p>
        </div>

        <RubStage
          rodId={selectedRod}
          clothId={selectedCloth}
          showCharges={showCharges}
          rodCharge={rodCharge}
          clothCharge={clothCharge}
          electronsFrom={electronsFrom}
          rubProgress={rubProgress}
          onRub={doRub}
        />

        {/* Quick rub button — alternative for touch devices */}
        <Button
          size="sm"
          className="mt-2 gap-1.5"
          style={{ background: "var(--sim-accent)", color: "#fff" }}
          onClick={() => doRub(15)}
        >
          <Zap className="w-3.5 h-3.5" />
          مالش سریع (+{Math.min(100, Math.round(rubProgress + 15))}%)
        </Button>

        {/* Energy / progress bar */}
        <div className="w-full max-w-md mt-3">
          {showEnergyBar && (
            <div className="mb-2">
              <div className="flex justify-between text-[11px] font-semibold mb-1" style={{ color: "var(--sim-muted)" }}>
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> انرژی مالش</span>
                <span>{Math.round(rubProgress)}%</span>
              </div>
              <Progress value={rubProgress} className="h-2" style={{ background: "#dbeaf9" }} />
            </div>
          )}
          {rubWarning && (
            <div className="flex items-start gap-2 text-xs p-2 rounded-lg mb-2" style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{rubWarning}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => {
              bringRodToHall();
              setView("sim");
            }}
            disabled={Math.abs(rodCharge) < 0.05}
            className="gap-1.5"
            style={{ background: "var(--sim-accent)", color: "#fff" }}
          >
            <Zap className="w-4 h-4" />
            بردن میله به سالن الکتروسکوپ
          </Button>
        </div>
      </Card>

      {/* Right: status */}
      <Card className="p-4 flex flex-col gap-3 sim-scroll overflow-y-auto" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}>
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          <span className="w-1.5 h-4 rounded-full" style={{ background: "#10b981" }} />
          وضعیت میله
        </h3>
        {!rodInfo || !clothInfo ? (
          <div className="text-xs text-center py-6" style={{ color: "var(--sim-muted)" }}>
            ابتدا یک میله و یک پارچه انتخاب کن
          </div>
        ) : (
          <>
            <div className="rounded-xl p-3" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{rodInfo.emoji}</span>
                <div>
                  <div className="font-bold text-sm">{rodInfo.name}</div>
                  <div className="text-[10px]" style={{ color: "var(--sim-muted)" }}>{rodInfo.description}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span style={{ color: "var(--sim-muted)" }}>بار میله:</span>
                <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: rodChargeInfo.color + "22", color: rodChargeInfo.color }}>
                  {rodChargeInfo.text}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-3" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{clothInfo.emoji}</span>
                <div>
                  <div className="font-bold text-sm">{clothInfo.name}</div>
                  <div className="text-[10px]" style={{ color: "var(--sim-muted)" }}>{clothInfo.description}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span style={{ color: "var(--sim-muted)" }}>بار پارچه:</span>
                <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: chargeLabel(clothCharge).color + "22", color: chargeLabel(clothCharge).color }}>
                  {chargeLabel(clothCharge).text}
                </span>
              </div>
            </div>

            {electronsFrom && (
              <div className="rounded-xl p-3 text-xs" style={{ background: "var(--neg-soft)", border: "1px solid #bae6fd", color: "#075985" }}>
                <div className="font-bold mb-1">حرکت الکترون‌ها:</div>
                {electronsFrom === "rod" ? (
                  <div>از میله ← به پارچه (الکترون از میله جدا شد، پس میله مثبت شد)</div>
                ) : (
                  <div>از پارچه ← به میله (الکترون به میله آمد، پس میله منفی شد)</div>
                )}
              </div>
            )}

            <div className="rounded-xl p-3 text-[11px]" style={{ background: "#eaf4fc", border: "1px solid var(--sim-border)", color: "#1d6fd6" }}>
              <div className="font-bold mb-1">💡 راهنما</div>
              هرچه تفاوت جایگاه دو ماده در «سری الکتروشسیته مالشی» بیشتر باشد، شدت بار بیشتر است.
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function RubStage({
  rodId,
  clothId,
  showCharges,
  rodCharge,
  clothCharge,
  electronsFrom,
  rubProgress,
  onRub,
}: {
  rodId: RodMaterial | null;
  clothId: ClothMaterial | null;
  showCharges: boolean;
  rodCharge: number;
  clothCharge: number;
  electronsFrom: "rod" | "cloth" | null;
  rubProgress: number;
  onRub: (delta: number) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);
  const lastDirRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [clothOffset, setClothOffset] = useState(0);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; dx: number; dy: number }[]>([]);
  const sparkId = useRef(0);

  if (!rodId || !clothId) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[280px]">
        <div className="text-center" style={{ color: "var(--sim-muted)" }}>
          <div className="text-5xl mb-3 floaty">🔬</div>
          <div className="text-sm">یک میله و یک پارچه انتخاب کن</div>
        </div>
      </div>
    );
  }

  const rod = RODS[rodId];
  const cloth = CLOTHS[clothId];

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    dragStartRef.current = e.clientX;
    lastDirRef.current = 0;
    setDragging(true);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartRef.current === null) return;
    e.preventDefault();
    e.stopPropagation();
    const dx = e.clientX - dragStartRef.current;
    const clamped = Math.max(-50, Math.min(50, dx));
    setClothOffset(clamped);
    if (Math.abs(clamped - lastDirRef.current) > 10) {
      onRub(8);
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect) {
        const sx = rect.width / 2 + (Math.random() - 0.5) * 60;
        const sy = rect.height / 2 + (Math.random() - 0.5) * 30;
        const id = sparkId.current++;
        const dir = Math.sign(clamped - lastDirRef.current);
        const sdx = electronsFrom === "rod" ? (dir > 0 ? 40 : -40) : dir > 0 ? -40 : 40;
        setSparks((p) => [...p, { id, x: sx, y: sy, dx: sdx, dy: -20 - Math.random() * 20 }].slice(-14));
        setTimeout(() => setSparks((p) => p.filter((s) => s.id !== id)), 900);
      }
      lastDirRef.current = clamped;
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    dragStartRef.current = null;
    lastDirRef.current = 0;
    setDragging(false);
    setClothOffset(0);
  };

  return (
    <div
      ref={stageRef}
      className="relative flex-1 w-full flex items-center justify-center min-h-[280px]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      {/* sparks layer */}
      <div className="absolute inset-0 pointer-events-none">
        {sparks.map((s) => (
          <div
            key={s.id}
            className="spark absolute"
            style={{
              left: s.x,
              top: s.y,
              ["--dx" as any]: `${s.dx}px`,
              ["--dy" as any]: `${s.dy}px`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--neg)", boxShadow: "0 0 6px var(--neg)" }} />
          </div>
        ))}
      </div>

      {/* Rod (vertical, fixed) */}
      <motion.div
        className="relative z-10"
        animate={{ x: 0 }}
      >
        <div className="flex flex-col items-center">
          {/* handle */}
          <div className="w-7 h-10 rounded-md" style={{ background: "#caa46a", border: "1px solid #9c7d4d" }} />
          {/* rod body */}
          <div
            className="w-8 rounded-full flex items-center justify-center relative"
            style={{
              height: 200,
              background: rod.color,
              border: "1px solid #6b5d44",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            {/* charge symbols on rod */}
            {showCharges && Math.abs(rodCharge) > 0.02 && (
              <div className="absolute inset-0 flex flex-col items-center justify-around py-3">
                {Array.from({ length: countFor(rodCharge) }).map((_, i) => (
                  <ChargeBadge key={i} sign={rodCharge > 0 ? "+" : "-"} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cloth (horizontal, moves) */}
      <motion.div
        className="absolute z-20"
        animate={{ x: clothOffset }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ left: "calc(50% - 70px)", top: "calc(50% - 10px)" }}
      >
        <div className="flex flex-col items-center">
          <div
            className="rounded-xl flex items-center justify-center relative"
            style={{
              width: 140,
              height: 70,
              background: cloth.color,
              border: "1px solid #6b5d44",
              boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
            }}
          >
            <span className="text-2xl">{cloth.emoji}</span>
            {showCharges && Math.abs(clothCharge) > 0.02 && (
              <div className="absolute inset-0 flex items-center justify-around px-3">
                {Array.from({ length: countFor(clothCharge) }).map((_, i) => (
                  <ChargeBadge key={i} sign={clothCharge > 0 ? "+" : "-"} small />
                ))}
              </div>
            )}
          </div>
          <div className="text-[10px] mt-1 font-semibold" style={{ color: "var(--sim-muted)" }}>
            بکش ◀ ▶
          </div>
        </div>
      </motion.div>

      {/* progress ring at corner */}
      <div className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: rubProgress > 0 ? "var(--sim-accent-soft)" : "#dbeaf9", color: "var(--sim-accent)" }}>
        {rubProgress > 0 ? `مالش: ${Math.round(rubProgress)}٪` : "آماده"}
      </div>
    </div>
  );
}

function countFor(q: number): number {
  return Math.min(5, Math.max(1, Math.round(Math.abs(q) * 5)));
}

function ChargeBadge({ sign, small }: { sign: "+" | "-"; small?: boolean }) {
  const color = sign === "+" ? "var(--pos)" : "var(--neg)";
  const size = small ? "w-5 h-5 text-[11px]" : "w-6 h-6 text-xs";
  return (
    <div className={`${size} rounded-full flex items-center justify-center font-extrabold text-white`} style={{ background: color }}>
      {sign}
    </div>
  );
}
