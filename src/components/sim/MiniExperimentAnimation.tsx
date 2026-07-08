"use client";

import { useState, useEffect } from "react";
import { ExperimentScenario, PhysicsResult } from "@/lib/sim-content-dynamic";

interface Props {
  scenario: ExperimentScenario;
  result: PhysicsResult;
}

/**
 * Compact animated SVG that visually demonstrates the experiment result.
 * Shows the ACTUAL scenario: real charges, real experiment type, real leaf behavior.
 * Auto-plays in a loop: initial → experiment → result.
 */
export function MiniExperimentAnimation({ scenario, result }: Props) {
  const [phase, setPhase] = useState<"initial" | "experiment" | "result">("initial");

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    const play = () => {
      setPhase("initial");
      t1 = setTimeout(() => setPhase("experiment"), 1500);
      t2 = setTimeout(() => setPhase("result"), 3500);
      t3 = setTimeout(() => play(), 7000);
    };
    play();
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [scenario, result]);

  const eCharge = scenario.electroscopeCharge;
  const rCharge = scenario.rodCharge;
  const isContact = scenario.experimentType === "contact";
  const action = result.leafActionKey;

  // Geometry (320 x 200)
  const cx = 160;
  const capY = 45;
  const capR = 16;
  const rodTopY = 48;
  const pivotY = 95;
  const leafLen = 50;
  const leafW = 8;
  const jarLeft = 110;
  const jarRight = 210;
  const jarTop = 62;
  const jarBottom = 160;

  // Rod Y position: far → near → touch
  const rodFarY = -8;
  const rodNearY = capY - capR - 6;
  const rodTouchY = capY - capR;
  const rodY = phase === "initial" ? rodFarY
    : phase === "experiment" ? rodNearY
    : (isContact ? rodTouchY : rodNearY);

  // Leaf angle — ensure visible difference between phases
  // For the animation, we use exaggerated angles so the movement is always visible.
  const rawInit = result.initialAngle || 0;
  const rawFinal = result.finalAngle || 0;

  // Map to animation angles: ensure at least 20° difference between initial and final
  let ampInit: number;
  let ampFinal: number;

  if (action === "open-more") {
    // Leaves open MORE: start moderate, end wide
    ampInit = Math.max(20, Math.min(35, rawInit * 0.7));
    ampFinal = 50;
  } else if (action === "open-less") {
    // Leaves open LESS: start wide, end moderate
    ampInit = 45;
    ampFinal = Math.max(10, Math.min(25, rawFinal * 0.7));
  } else if (action === "close-fully") {
    // Leaves close completely: start wide, end 0
    ampInit = 45;
    ampFinal = 0;
  } else if (action === "stay-open") {
    // Leaves open and stay: start 0, end wide
    ampInit = 0;
    ampFinal = 45;
  } else {
    // no-change: stay the same
    ampInit = Math.max(0, Math.min(40, rawInit * 0.8));
    ampFinal = ampInit;
  }

  const leafAngle = phase === "result" ? ampFinal
    : phase === "experiment" ? (ampInit + ampFinal) / 2
    : ampInit;

  // What charge to show on the leaves at each phase
  // Initial: electroscope's charge
  // After contact: the transferred charge (rod's charge if contact, or same if approach)
  // After approach: induced charge on leaves (same sign as rod if electroscope neutral, or modulated)
  const leafChargeToShow = phase === "initial"
    ? eCharge
    : isContact
      ? (rCharge === "neutral" ? eCharge : rCharge) // after contact, electroscope has rod's charge
      : eCharge; // during approach, the net charge doesn't change

  const capChargeToShow = phase === "initial"
    ? eCharge
    : isContact
      ? (rCharge === "neutral" ? eCharge : rCharge)
      : eCharge;

  // Rod charge is always shown
  const rodChargeToShow = rCharge;

  return (
    <div className="rounded-xl p-2" style={{ background: "#f0f6fc", border: "1px solid var(--sim-border)" }}>
      <div className="text-center text-[10px] font-bold mb-1" style={{ color: "var(--sim-accent)" }}>
        🔬 نمایش تصویری آزمایش
      </div>
      <svg viewBox="0 0 320 200" width="100%" height="170" className="select-none">
        <defs>
          <linearGradient id="ma-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dcefff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#dcefff" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="ma-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a96a2" />
            <stop offset="50%" stopColor="#eef2f6" />
            <stop offset="100%" stopColor="#8a96a2" />
          </linearGradient>
        </defs>

        {/* Glass jar */}
        <rect x={jarLeft - 4} y={jarTop - 4} width={jarRight - jarLeft + 8} height={jarBottom - jarTop + 8} rx={4} fill="#2a2f36" />
        <rect x={jarLeft} y={jarTop} width={jarRight - jarLeft} height={jarBottom - jarTop} fill="url(#ma-glass)" stroke="#7fb0d8" strokeWidth="0.8" />

        {/* Cap */}
        <ellipse cx={cx} cy={capY} rx={capR} ry={4} fill="#dfe4e8" stroke="#6f777d" strokeWidth="0.5" />
        <rect x={cx - capR} y={capY - 3} width={capR * 2} height={6} rx={2} fill="url(#ma-metal)" />

        {/* Cap charge symbols */}
        {capChargeToShow !== "neutral" && <ChargeBadge x={cx} y={capY - 12} charge={capChargeToShow} />}

        {/* Central rod */}
        <rect x={cx - 2} y={rodTopY} width={4} height={pivotY - rodTopY} rx={1} fill="url(#ma-metal)" />

        {/* Junction screw */}
        <circle cx={cx} cy={pivotY} r="3" fill="#7a8893" stroke="#4a5662" strokeWidth="0.4" />

        {/* Fixed leaf (left) */}
        <rect x={cx - leafW} y={pivotY} width={leafW} height={leafLen} rx={1.5} fill="url(#ma-metal)" stroke="#6a7682" strokeWidth="0.3" />
        {/* Charge on fixed leaf */}
        {phase !== "initial" && leafChargeToShow !== "neutral" && (
          <ChargeBadge x={cx - leafW / 2} y={pivotY + 22} charge={leafChargeToShow} small />
        )}
        {phase === "initial" && eCharge !== "neutral" && (
          <ChargeBadge x={cx - leafW / 2} y={pivotY + 22} charge={eCharge} small />
        )}

        {/* Movable leaf (right) — rotates with CSS transition */}
        <g
          style={{
            transform: `rotate(${-leafAngle}deg)`,
            transformOrigin: `${cx}px ${pivotY}px`,
            transformBox: "view-box" as const,
            transition: "transform 0.8s ease-in-out",
          }}
        >
          <rect x={cx} y={pivotY} width={leafW} height={leafLen} rx={1.5} fill="url(#ma-metal)" stroke="#6a7682" strokeWidth="0.3" />
          {/* Charge on movable leaf */}
          {phase !== "initial" && leafChargeToShow !== "neutral" && (
            <ChargeBadge x={cx + leafW / 2} y={pivotY + 22} charge={leafChargeToShow} small />
          )}
          {phase === "initial" && eCharge !== "neutral" && (
            <ChargeBadge x={cx + leafW / 2} y={pivotY + 22} charge={eCharge} small />
          )}
        </g>

        {/* External rod (horizontal, moves down) */}
        {phase !== "initial" && (
          <g style={{ transition: "transform 0.8s ease-in-out", transform: `translateY(${rodY - rodFarY}px)` }}>
            {/* Handle */}
            <rect x={cx - 8} y={rodFarY - 12} width={16} height={10} rx={2} fill="#c9a45a" />
            {/* Rod body (horizontal) */}
            <rect x={cx - 40} y={rodFarY} width={80} height={8} rx={4}
              fill={rCharge === "positive" ? "#ffd9b8" : rCharge === "negative" ? "#dbeaf9" : "#e5e5e5"}
              stroke="#5a6672" strokeWidth="0.5" />
            {/* Rod charge */}
            {rodChargeToShow !== "neutral" && (
              <ChargeBadge x={cx} y={rodFarY + 4} charge={rodChargeToShow} small />
            )}
          </g>
        )}

        {/* Contact spark */}
        {phase === "result" && isContact && rCharge !== "neutral" && (
          <g>
            <circle cx={cx} cy={capY - capR} r="5" fill="#fde047" opacity="0.8" />
            <circle cx={cx} cy={capY - capR} r="2.5" fill="#fff" opacity="0.9" />
          </g>
        )}

        {/* Labels */}
        <text x={cx} y={jarBottom + 15} fontSize="8" fill="#5b7187" textAnchor="middle" fontWeight="600">
          {phase === "initial" ? "حالت اولیه" : phase === "experiment" ? (isContact ? "در حال تماس..." : "در حال نزدیک شدن...") : "نتیجه نهایی"}
        </text>

        {/* Phase indicator dots */}
        <g>
          <circle cx={cx - 12} cy={jarBottom + 25} r="2.5" fill={phase === "initial" ? "var(--sim-accent)" : "#cfe0f0"} />
          <circle cx={cx} cy={jarBottom + 25} r="2.5" fill={phase === "experiment" ? "var(--sim-accent)" : "#cfe0f0"} />
          <circle cx={cx + 12} cy={jarBottom + 25} r="2.5" fill={phase === "result" ? "var(--sim-accent)" : "#cfe0f0"} />
        </g>
      </svg>
      <div className="text-center text-[9px] mt-1" style={{ color: "var(--sim-muted)" }}>
        {phase === "initial" && `الکتروسکوپ: ${ct(eCharge)} — میله: ${ct(rCharge)}`}
        {phase === "experiment" && (isContact ? "میله با کلاهک تماس پیدا کرد" : "میله نزدیک شد (بدون تماس)")}
        {phase === "result" && result.leafAction}
      </div>
    </div>
  );
}

function ChargeBadge({ x, y, charge, small }: { x: number; y: number; charge: string; small?: boolean }) {
  const r = small ? 4 : 5;
  const color = charge === "positive" ? "#e0461c" : "#1d6fd6";
  const sign = charge === "positive" ? "+" : "−";
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} opacity="0.9" />
      <text x={x} y={y} fontSize={small ? "6" : "7"} fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central">{sign}</text>
    </g>
  );
}

function ct(charge: string): string {
  if (charge === "positive") return "مثبت (+)";
  if (charge === "negative") return "منفی (−)";
  return "خنثی";
}
