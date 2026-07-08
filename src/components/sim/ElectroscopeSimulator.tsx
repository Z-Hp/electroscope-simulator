"use client";

import { useSimStore } from "@/lib/sim-store";
import { useElectroscopePhysics } from "@/lib/use-electroscope-physics";
import { chargeLabel, distanceLabel } from "@/lib/sim-physics";
import { Electroscope } from "./Electroscope";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  RotateCcw,
  Zap,
  Cable,
  Gauge,
  Wand2,
  ArrowRight,
  Hand,
  Info,
} from "lucide-react";

export function ElectroscopeSimulator() {
  const externalRodPresent = useSimStore((s) => s.externalRodPresent);
  const externalRodDistance = useSimStore((s) => s.externalRodDistance);
  const setDistance = useSimStore((s) => s.setDistance);
  const isGrounded = useSimStore((s) => s.isGrounded);
  const toggleGround = useSimStore((s) => s.toggleGround);
  const resetElectroscope = useSimStore((s) => s.resetElectroscope);
  const takeRodBack = useSimStore((s) => s.takeRodBack);

  const showCharges = useSimStore((s) => s.showCharges);
  const toggleShowCharges = useSimStore((s) => s.toggleShowCharges);
  const showDegreeMarks = useSimStore((s) => s.showDegreeMarks);
  const toggleShowDegreeMarks = useSimStore((s) => s.toggleShowDegreeMarks);

  const rodCharge = useSimStore((s) => s.rodCharge);
  const netCharge = useSimStore((s) => s.netCharge);
  const physics = useElectroscopePhysics();
  const setView = useSimStore((s) => s.setView);

  const rodInfo = chargeLabel(rodCharge);
  const netInfo = chargeLabel(netCharge);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_240px] gap-4 h-full">
      {/* Left tools */}
      <Card className="p-3 flex flex-col gap-3 sim-scroll overflow-y-auto" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}>
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          <span className="w-1.5 h-4 rounded-full" style={{ background: "var(--sim-accent)" }} />
          ابزارها
        </h3>

        {/* Distance control */}
        <div className="rounded-xl p-3" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> حرکت میله (بالا/پایین)</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#dbeaf9", color: "#1d6fd6" }}>
              {distanceLabel(externalRodDistance)}
            </span>
          </div>
          <Slider
            value={[Math.round((1 - externalRodDistance) * 100)]}
            onValueChange={(v) => setDistance(1 - v[0] / 100)}
            min={0}
            max={100}
            step={1}
            disabled={!externalRodPresent}
            className="sim-range"
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--sim-muted)" }}>
            <span>▲ بالا (دور)</span>
            <span>تماس (پایین) ▼</span>
          </div>
        </div>

        {/* Grounding */}
        <button
          onClick={toggleGround}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border w-full"
          style={{
            background: isGrounded ? "#d6e8f5" : "#ffffff",
            borderColor: isGrounded ? "#38bdf8" : "var(--sim-border)",
            color: isGrounded ? "#075985" : "var(--sim-fg)",
          }}
        >
          <Cable className="w-4 h-4" />
          {isGrounded ? "قطع سیم زمین" : "وصل سیم زمین"}
        </button>

        {/* Hand (touch cap) - alternative to ground */}
        <button
          onClick={toggleGround}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border w-full"
          style={{
            background: isGrounded ? "#d6e8f5" : "#ffffff",
            borderColor: isGrounded ? "#38bdf8" : "var(--sim-border)",
            color: isGrounded ? "#075985" : "var(--sim-fg)",
          }}
        >
          <Hand className="w-4 h-4" />
          {isGrounded ? "دست را بردار" : "لمس کلاهک با دست"}
        </button>

        <Button variant="outline" size="sm" onClick={resetElectroscope} className="w-full" style={{ borderColor: "var(--sim-border)" }}>
          <RotateCcw className="w-3.5 h-3.5 ml-1" />
          ریست الکتروسکوپ
        </Button>

        <div className="border-t pt-2 mt-1" style={{ borderColor: "var(--sim-border)" }}>
          <h4 className="text-xs font-bold mb-2" style={{ color: "var(--sim-muted)" }}>نمایش</h4>
          <div className="flex flex-col gap-1.5">
            <TogglePillLite checked={showCharges} onChange={toggleShowCharges} label="نمایش بارها (+/−)" />
            <TogglePillLite checked={showDegreeMarks} onChange={toggleShowDegreeMarks} label="نمایش درجه‌بندی" />
          </div>
        </div>
      </Card>

      {/* Center stage */}
      <Card className="p-4 flex flex-col items-center relative" style={{ background: "linear-gradient(180deg,#ffffff,#eaf4fc)", borderColor: "var(--sim-border)" }}>
        <div className="w-full flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--sim-fg)" }}>سالن الکتروسکوپ</h2>
            <p className="text-[11px]" style={{ color: "var(--sim-muted)" }}>{physics.explanation}</p>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("lab")}
              style={{ borderColor: "var(--sim-border)" }}
            >
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
              کارگاه مالش
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center w-full">
          <Electroscope width={380} height={400} />
        </div>

        <div className="w-full mt-2 flex items-center justify-center gap-2 flex-wrap">
          {!externalRodPresent ? (
            <Button
              onClick={() => setView("lab")}
              className="gap-1.5"
              style={{ background: "var(--sim-accent)", color: "#fff" }}
            >
              <Zap className="w-4 h-4" />
              آوردن میله باردار
            </Button>
          ) : (
            <>
              <Badge label="بار میله" value={rodInfo.text} color={rodInfo.color} />
              <Badge label="بار الکتروسکوپ" value={netInfo.text} color={netInfo.color} />
              <Button variant="outline" size="sm" onClick={takeRodBack} style={{ borderColor: "var(--sim-border)" }}>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                دور کردن میله
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Right: status & guide */}
      <Card className="p-3 flex flex-col gap-3 sim-scroll overflow-y-auto" style={{ background: "var(--sim-card)", borderColor: "var(--sim-border)" }}>
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          <span className="w-1.5 h-4 rounded-full" style={{ background: "#10b981" }} />
          وضعیت لحظه‌ای
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="زاویه تیغه" value={`${Math.round(physics.leafAngleDeg)}°`} color="var(--sim-accent)" />
          <Stat label="بار کلاهک" value={chargeLabel(physics.topCharge).text} color={chargeLabel(physics.topCharge).color} />
          <Stat label="بار تیغه" value={chargeLabel(physics.leafCharge).text} color={chargeLabel(physics.leafCharge).color} />
          <Stat label="بار خالص" value={netInfo.text} color={netInfo.color} />
        </div>

        <div className="rounded-xl p-3 text-xs" style={{ background: stateBg(physics.state), border: `1px solid ${stateBd(physics.state)}`, color: stateTx(physics.state) }}>
          <div className="font-bold mb-1 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> {stateName(physics.state)}</div>
          <div className="leading-5">{physics.explanation}</div>
        </div>

        <div className="rounded-xl p-3" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
          <h4 className="text-xs font-bold mb-2 flex items-center gap-1"><Wand2 className="w-3.5 h-3.5" /> سناریوهای پیشنهادی</h4>
          <ol className="text-[11px] space-y-1.5 leading-5" style={{ color: "var(--sim-muted)" }}>
            <li><b style={{ color: "var(--sim-fg)" }}>۱.</b> میله را بدون تماس نزدیک کن → تیغه باز می‌شود (القا).</li>
            <li><b style={{ color: "var(--sim-fg)" }}>۲.</b> میله را دور کن → تیغه می‌بندد (خنثی موقت).</li>
            <li><b style={{ color: "var(--sim-fg)" }}>۳.</b> میله را تا کلاهک ببر (تماس) → بار منتقل می‌شود.</li>
            <li><b style={{ color: "var(--sim-fg)" }}>۴.</b> الکتروسکوپ باردار را زمین کن → تیغه می‌بندد.</li>
            <li><b style={{ color: "var(--sim-fg)" }}>۵.</b> میله نزدیک + زمین + قطع زمین + دور میله → بار مخالف!</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}

function TogglePillLite({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      className={`toggle-pill ${checked ? "on" : "off"} w-full justify-start`}
      aria-pressed={checked}
    >
      <span className="badge-dot">{checked ? "✓" : "✕"}</span>
      <span className="flex-1 text-right">{label}</span>
    </button>
  );
}

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
      <span style={{ color: "var(--sim-muted)" }}>{label}:</span>
      <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: color + "22", color }}>{value}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: "#ffffff", border: "1px solid var(--sim-border)" }}>
      <div className="text-[10px]" style={{ color: "var(--sim-muted)" }}>{label}</div>
      <div className="text-sm font-bold mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}

function stateName(s: string): string {
  switch (s) {
    case "neutral": return "خنثی";
    case "induced": return "القا شده";
    case "contact-charging": return "در حال انتقال بار";
    case "contact-charged": return "باردار با تماس";
    case "induction-charging": return "در حال القا";
    case "induction-charged": return "باردار با القا";
    case "grounded-neutral": return "زمین شده";
    case "grounded-while-inducing": return "زمین + القا";
    default: return s;
  }
}
function stateBg(s: string): string {
  switch (s) {
    case "neutral": return "#dbeaf9";
    case "induced": return "#fde9c8";
    case "contact-charging":
    case "contact-charged": return "#ffedd5";
    case "induction-charging":
    case "induction-charged": return "#d9f0e4";
    case "grounded-neutral":
    case "grounded-while-inducing": return "#e0f2fe";
    default: return "#dbeaf9";
  }
}
function stateBd(s: string): string {
  switch (s) {
    case "neutral": return "#e2d8c4";
    case "induced": return "#fcd9a4";
    case "contact-charging":
    case "contact-charged": return "#fed7aa";
    case "induction-charging":
    case "induction-charged": return "#a7e8c8";
    case "grounded-neutral":
    case "grounded-while-inducing": return "#bae6fd";
    default: return "#e2d8c4";
  }
}
function stateTx(s: string): string {
  switch (s) {
    case "neutral": return "#1d6fd6";
    case "induced": return "#92400e";
    case "contact-charging":
    case "contact-charged": return "#9a3412";
    case "induction-charging":
    case "induction-charged": return "#065f46";
    case "grounded-neutral":
    case "grounded-while-inducing": return "#075985";
    default: return "#1d6fd6";
  }
}
