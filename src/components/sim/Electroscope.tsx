"use client";

import { useState, useEffect, useRef } from "react";
import { useSimStore } from "@/lib/sim-store";
import { useElectroscopePhysics } from "@/lib/use-electroscope-physics";
import { chargeLabel, distanceLabel } from "@/lib/sim-physics";

interface Props {
  width?: number;
  height?: number;
}

/**
 * Realistic electroscope SVG inspired by the textbook photo.
 *
 * Layout (viewBox 460 x 430):
 *  - External charged rod enters from ABOVE and moves DOWN toward the cap
 *  - Flat disc cap on top
 *  - Continuous metal rod → junction screw → two leaves (one piece, no gap)
 *  - FIXED leaf on the LEFT (hangs straight down)
 *  - MOVABLE leaf on the RIGHT (pivots at junction, swings RIGHT when charged)
 *  - Scale in DEGREES (0°–70°) at radius = leaf length, so the movable leaf's
 *    bottom tip lands exactly on the scale for easy reading
 *  - Rectangular glass jar with black frame
 *
 * Leaf rotation: the movable leaf rotates COUNTER-CLOCKWISE (negative angle in
 * SVG) so its bottom swings to the RIGHT — away from the fixed leaf, never
 * colliding with it.
 *
 * Rod movement: the external rod is VERTICAL and approaches the cap from above.
 * distance 0 = touching (rod tip at cap top), distance 1 = far above.
 * The rod can be dragged vertically by the user.
 */
export function Electroscope({ width = 460, height = 430 }: Props) {
  const showCharges = useSimStore((s) => s.showCharges);
  const showDegreeMarks = useSimStore((s) => s.showDegreeMarks);
  const isGrounded = useSimStore((s) => s.isGrounded);
  const physics = useElectroscopePhysics();
  const externalRodPresent = useSimStore((s) => s.externalRodPresent);
  const externalRodDistance = useSimStore((s) => s.externalRodDistance);
  const rodCharge = useSimStore((s) => s.rodCharge);
  const selectedRod = useSimStore((s) => s.selectedRod);
  const netQ = useSimStore((s) => s.netCharge);
  const setDistance = useSimStore((s) => s.setDistance);

  // SVG ref + drag state for vertical rod dragging
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);

  const leafAngle = physics.leafAngleDeg; // 0..70 degrees (target)
  const topQ = physics.topCharge;
  const leafQ = physics.leafCharge;

  // Smoothly interpolate the displayed angle toward the target using rAF.
  const [displayAngle, setDisplayAngle] = useState(leafAngle);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const animate = () => {
      setDisplayAngle((prev) => {
        const diff = leafAngle - prev;
        if (Math.abs(diff) < 0.05) return leafAngle;
        const speed = 0.18;
        return prev + diff * speed;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [leafAngle]);

  // ---- Geometry (viewBox 460 x 430) ----
  const cx = 230; // horizontal center
  const capY = 84; // disc cap vertical center (moved down to make room for rod above)
  const capR = 24; // disc radius
  const capTopY = 72; // top of the cap (where external rod touches)
  const rodTop = 87; // overlaps cap bottom for seamless contact
  const pivotY = 250; // junction point (rod bottom = leaf top)
  const leafLen = 95; // leaf length — also the scale radius so tip lands on scale
  const leafW = 12;
  // Rectangular glass jar
  const jarLeft = 135;
  const jarRight = 325;
  const jarTop = 150;
  const jarBottom = 370;
  const frameW = 8;
  // Scale radius = leaf length (tip of movable leaf traces the scale arc)
  const scaleR = leafLen;
  // base
  const baseY = jarBottom + 6;
  const baseH = 22;

  // ---- External rod (HORIZONTAL body, moves VERTICALLY from above) ----
  // The rod lies flat (horizontal) and is lowered down toward the cap.
  // A vertical insulating handle on top lets the user "hold" and lower it.
  const extRodLen = 130; // horizontal rod body length (long, lying flat)
  const extRodH = 16; // horizontal rod body height (thin)
  const handleW = 14; // vertical handle width (narrow)
  const handleH = 22; // vertical handle height (tall, extends upward)
  // Far distance increased 2.5x: travel now ~70px (was ~28px).
  // At far, rod bottom at y=2, handle top at 2-16-22=-36 (visible thanks to
  // viewBox starting at y=-40).
  const rodFarY = 2; // rod bottom Y when far (handle top at 2-16-22=-36, visible in viewBox)
  const rodTouchY = capTopY; // rod bottom Y when touching (at cap top)
  const rodTravel = rodTouchY - rodFarY; // total travel distance (~70px)
  const rodBottomY = rodTouchY - rodTravel * externalRodDistance; // current rod bottom Y (underside of horizontal rod)

  // Convert pointer clientY to SVG Y coordinate
  const clientToSvgY = (clientY: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = 0;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse()).y;
  };

  // Drag handlers for vertical rod movement
  const handleRodPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch {}
    const svgY = clientToSvgY(e.clientY);
    if (svgY !== null) {
      dragOffsetRef.current = svgY - rodBottomY;
    }
    draggingRef.current = true;
  };
  const handleRodPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const svgY = clientToSvgY(e.clientY);
    if (svgY === null) return;
    const newRodBottomY = svgY - dragOffsetRef.current;
    const newDistance = (rodTouchY - newRodBottomY) / rodTravel;
    setDistance(newDistance);
  };
  const handleRodPointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = false;
    try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 -40 460 480"
      width={width}
      height={height}
      className="select-none"
      role="img"
      aria-label="الکتروسکوپ"
      style={{ touchAction: "none" }}
    >
      <defs>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcefff" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#eaf6fc" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#dcefff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a96a2" />
          <stop offset="45%" stopColor="#eef2f6" />
          <stop offset="55%" stopColor="#eef2f6" />
          <stop offset="100%" stopColor="#8a96a2" />
        </linearGradient>
        <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a08850" />
          <stop offset="50%" stopColor="#e8d9a8" />
          <stop offset="100%" stopColor="#a08850" />
        </linearGradient>
        <linearGradient id="frameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2f36" />
          <stop offset="100%" stopColor="#1a1e24" />
        </linearGradient>
        <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4250" />
          <stop offset="100%" stopColor="#23282f" />
        </linearGradient>
        <radialGradient id="jarShine" cx="0.3" cy="0.15" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ====== BASE / STAND ====== */}
      <rect x={cx - 85} y={baseY} width={170} height={baseH} rx={4} fill="url(#baseGrad)" />
      <rect x={cx - 95} y={baseY + baseH} width={190} height={7} rx={3} fill="#1a1e24" />
      <text x={cx} y={baseY + 15} fontSize="9" fill="#9fb0c0" textAnchor="middle" fontWeight="700">
        ELEKTROSKOP
      </text>

      {/* ====== GLASS JAR (rectangular with black frame) ====== */}
      <rect
        x={jarLeft - frameW}
        y={jarTop - frameW}
        width={jarRight - jarLeft + frameW * 2}
        height={jarBottom - jarTop + frameW * 2}
        rx={6}
        fill="url(#frameGrad)"
      />
      <rect
        x={jarLeft}
        y={jarTop}
        width={jarRight - jarLeft}
        height={jarBottom - jarTop}
        fill="url(#glassGrad)"
        stroke="#7fb0d8"
        strokeWidth="1"
      />
      <rect
        x={jarLeft + 8}
        y={jarTop + 6}
        width={24}
        height={jarBottom - jarTop - 12}
        rx={4}
        fill="url(#jarShine)"
        opacity="0.6"
      />

      {/* ====== INSULATOR BUSHING ====== */}
      <rect x={cx - 14} y={jarTop - 14} width={28} height={18} rx={3} fill="#c9a45a" stroke="#8a6d35" strokeWidth="1" />

      {/* ====== CENTRAL METAL ROD (continuous from cap to junction — no gap) ====== */}
      <rect
        x={cx - 3}
        y={rodTop}
        width={6}
        height={pivotY - rodTop}
        rx={2}
        fill="url(#metalGrad)"
        stroke="#6a7682"
        strokeWidth="0.5"
      />
      {showCharges && Math.abs(topQ) > 0.02 && (
        <ChargeSymbols
          cx={cx}
          cy={(rodTop + pivotY) / 2}
          count={Math.max(1, Math.floor(countFor(topQ) * 0.6))}
          sign={topQ > 0 ? "+" : "-"}
          vertical
        />
      )}

      {/* ====== METAL DISC CAP ====== */}
      <rect x={cx - capR} y={capY - 3} width={capR * 2} height={8} rx={2} fill="url(#capGrad)" stroke="#7a6230" strokeWidth="0.8" />
      <ellipse cx={cx} cy={capY - 3} rx={capR} ry={5} fill="#e8d9a8" stroke="#7a6230" strokeWidth="0.8" />
      <ellipse cx={cx} cy={capY - 4} rx={capR - 4} ry={2.5} fill="#f5ecc8" opacity="0.7" />
      {showCharges && Math.abs(topQ) > 0.02 && (
        <ChargeSymbols cx={cx} cy={capY - 15} count={countFor(topQ)} sign={topQ > 0 ? "+" : "-"} />
      )}

      {/* ====== FIXED LEAF (LEFT of center, hangs straight down) ====== */}
      <rect
        x={cx - leafW}
        y={pivotY}
        width={leafW}
        height={leafLen}
        rx={2}
        fill="url(#metalGrad)"
        stroke="#6a7682"
        strokeWidth="0.5"
      />
      {showCharges && Math.abs(leafQ) > 0.02 && (
        <ChargeSymbols
          cx={cx - leafW / 2}
          cy={pivotY + leafLen * 0.5}
          count={countFor(leafQ)}
          sign={leafQ > 0 ? "+" : "-"}
          vertical
        />
      )}

      {/* ====== MOVABLE LEAF (RIGHT of center, pivots at junction, swings RIGHT) ======
          Uses NEGATIVE angle so the leaf rotates counter-clockwise — its bottom
          moves to the RIGHT, away from the fixed leaf. The SVG transform
          attribute rotate(-angle, cx, cy) gives exact pivot at the junction. */}
      <g
        className="movable-leaf"
        transform={`rotate(${-displayAngle} ${cx} ${pivotY})`}
      >
        <rect
          x={cx}
          y={pivotY}
          width={leafW}
          height={leafLen}
          rx={2}
          fill="url(#metalGrad)"
          stroke="#6a7682"
          strokeWidth="0.5"
        />
        {showCharges && Math.abs(leafQ) > 0.02 && (
          <ChargeSymbols
            cx={cx + leafW / 2}
            cy={pivotY + leafLen * 0.5}
            count={countFor(leafQ)}
            sign={leafQ > 0 ? "+" : "-"}
            vertical
          />
        )}
        {/* Tip marker — a small red dot at the bottom tip of the movable leaf
            so it's easy to read the angle on the scale */}
        <circle cx={cx + leafW / 2} cy={pivotY + leafLen} r="3" fill="#dc2626" stroke="#fff" strokeWidth="1" />
      </g>

      {/* ====== JUNCTION SCREW (rod + both leaves connect here — one piece) ====== */}
      <circle cx={cx} cy={pivotY} r={5} fill="#7a8893" stroke="#4a5662" strokeWidth="0.8" />
      <circle cx={cx} cy={pivotY} r={2} fill="#5a6672" />
      <line x1={cx - 3} y1={pivotY} x2={cx + 3} y2={pivotY} stroke="#3a4652" strokeWidth="1" />

      {/* ====== SCALE (protractor in degrees, on the RIGHT side) ======
          Drawn AFTER the leaves. Radius = leafLen so the movable leaf's tip
          lands exactly on the scale arc for easy reading.
          Order: wedge (bg) → ticks → arc (on top, passes over ticks) */}
      <g>
        {/* White background wedge for readability */}
        <ScaleWedge cx={cx} cy={pivotY} r={scaleR} maxDeg={70} />
        {/* Tick marks + labels every 10° */}
        {Array.from({ length: 8 }, (_, i) => i * 10).map((deg) => (
          <ScaleTick key={deg} cx={cx} cy={pivotY} r={scaleR} deg={deg} major={deg % 10 === 0} showLabel={showDegreeMarks} />
        ))}
        {/* Blue arc drawn LAST so it passes over the tick marks */}
        <ScaleArc cx={cx} cy={pivotY} r={scaleR} maxDeg={70} />
      </g>

      {/* ====== EXTERNAL CHARGED ROD (horizontal body, moves vertically from above) ====== */}
      {externalRodPresent && (
        <ExternalRod
          distance={externalRodDistance}
          charge={rodCharge}
          rodId={selectedRod}
          showCharges={showCharges}
          capCx={cx}
          rodBottomY={rodBottomY}
          rodLen={extRodLen}
          rodH={extRodH}
          handleW={handleW}
          handleH={handleH}
          onPointerDown={handleRodPointerDown}
          onPointerMove={handleRodPointerMove}
          onPointerUp={handleRodPointerUp}
        />
      )}

      {/* ====== GROUNDING WIRE ====== */}
      {isGrounded && <GroundWire capCx={cx} capCy={capY} charge={netQ} showCharges={showCharges} />}

      {/* ====== STATE + DISTANCE BOXES (below base, fully within viewBox) ====== */}
      <foreignObject x="30" y={baseY + baseH + 8} width="190" height="26">
        <div
          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full w-full"
          style={{ background: stateColor(physics.state), color: "#0f2740" }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stateDot(physics.state) }} />
          <span className="truncate">{stateName(physics.state)}</span>
        </div>
      </foreignObject>

      {externalRodPresent && (
        <foreignObject x="240" y={baseY + baseH + 8} width="190" height="26">
          <div
            className="flex items-center justify-end gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full w-full"
            style={{ background: "#dbeaf9", color: "#1d6fd6" }}
          >
            <span>فاصله: {distanceLabel(externalRodDistance)}</span>
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

/* ---- Scale helpers (angle in degrees, 0 = straight down, increases to the RIGHT) ---- */

function pointAt(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy + r * Math.cos(rad) };
}

function ScaleWedge({ cx, cy, r, maxDeg }: { cx: number; cy: number; r: number; maxDeg: number }) {
  const start = pointAt(cx, cy, r, 0);
  const end = pointAt(cx, cy, r, maxDeg);
  return (
    <path
      d={`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y} Z`}
      fill="rgba(255,255,255,0.7)"
      stroke="none"
    />
  );
}

function ScaleArc({ cx, cy, r, maxDeg }: { cx: number; cy: number; r: number; maxDeg: number }) {
  const start = pointAt(cx, cy, r, 0);
  const end = pointAt(cx, cy, r, maxDeg);
  return (
    <path
      d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y}`}
      fill="none"
      stroke="#1d6fd6"
      strokeWidth="1.5"
    />
  );
}

function ScaleTick({
  cx,
  cy,
  r,
  deg,
  major,
  showLabel,
}: {
  cx: number;
  cy: number;
  r: number;
  deg: number;
  major: boolean;
  showLabel: boolean;
}) {
  const inner = pointAt(cx, cy, r - (major ? 8 : 4), deg);
  const outer = pointAt(cx, cy, r + (major ? 4 : 2), deg);
  const labelPos = pointAt(cx, cy, r + 16, deg);
  return (
    <g>
      <line
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke="#1d6fd6"
        strokeWidth={major ? 1.6 : 0.9}
      />
      {major && showLabel && (
        <text
          x={labelPos.x}
          y={labelPos.y}
          fontSize="11"
          fill="#0f2740"
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="700"
        >
          {deg}°
        </text>
      )}
    </g>
  );
}

function countFor(q: number): number {
  return Math.min(6, Math.max(1, Math.round(Math.abs(q) * 6)));
}

function stateName(s: string): string {
  switch (s) {
    case "neutral": return "خنثی";
    case "induced": return "القا شده";
    case "contact-charging": return "در حال انتقال بار";
    case "contact-charged": return "باردار (تماس)";
    case "induction-charging": return "در حال القا";
    case "induction-charged": return "باردار (القا)";
    case "grounded-neutral": return "زمین شده";
    case "grounded-while-inducing": return "زمین + القا";
    default: return s;
  }
}
function stateColor(s: string): string {
  switch (s) {
    case "neutral": return "#dbeaf9";
    case "induced": return "#fde9c8";
    case "contact-charging":
    case "contact-charged": return "#ffd9b8";
    case "induction-charging":
    case "induction-charged": return "#d9f0e4";
    case "grounded-neutral":
    case "grounded-while-inducing": return "#d6e8f5";
    default: return "#dbeaf9";
  }
}
function stateDot(s: string): string {
  switch (s) {
    case "neutral": return "#1d6fd6";
    case "induced": return "#d97706";
    case "contact-charging":
    case "contact-charged": return "#e0461c";
    case "induction-charging":
    case "induction-charged": return "#16a34a";
    case "grounded-neutral":
    case "grounded-while-inducing": return "#0ea5e9";
    default: return "#1d6fd6";
  }
}

/* Static charge symbols (no animation) */
function ChargeSymbols({
  cx,
  cy,
  count,
  sign,
  vertical,
}: {
  cx: number;
  cy: number;
  count: number;
  sign: "+" | "-";
  vertical?: boolean;
}) {
  const color = sign === "+" ? "var(--pos)" : "var(--neg)";
  const r = 6;
  const positions = Array.from({ length: count }, (_, i) => {
    if (vertical) {
      const spacing = 14;
      return { x: cx, y: cy - ((count - 1) * spacing) / 2 + i * spacing };
    }
    const spacing = 14;
    return { x: cx - ((count - 1) * spacing) / 2 + i * spacing, y: cy };
  });
  return (
    <g>
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={r} fill={color} opacity="0.92" />
          <text
            x={p.x}
            y={p.y}
            fontSize="9"
            fontWeight="800"
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {sign}
          </text>
        </g>
      ))}
    </g>
  );
}

function ExternalRod({
  distance,
  charge,
  rodId,
  showCharges,
  capCx,
  rodBottomY,
  rodLen,
  rodH,
  handleW,
  handleH,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  distance: number;
  charge: number;
  rodId: string | null;
  showCharges: boolean;
  capCx: number;
  rodBottomY: number;
  rodLen: number;
  rodH: number;
  handleW: number;
  handleH: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}) {
  // HORIZONTAL rod: lies flat, bottom edge at rodBottomY, extends LEFT-RIGHT
  // A vertical insulating handle on top lets the user hold and lower it.
  const rodTopY = rodBottomY - rodH; // top edge of horizontal rod
  const rodLeftX = capCx - rodLen / 2;
  const rodRightX = capCx + rodLen / 2;
  const handleY = rodTopY - handleH; // handle sits above the rod
  const handleTopY = handleY;
  const info = chargeLabel(charge);
  const rodColor = rodColorFor(rodId);

  return (
    <g
      style={{ cursor: "ns-resize", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Invisible larger hit area for easier dragging */}
      <rect
        x={rodLeftX - 6}
        y={handleTopY - 6}
        width={rodLen + 12}
        height={rodBottomY - handleTopY + 12}
        fill="transparent"
      />
      {/* Contact spark/glow when touching (distance near 0) */}
      {distance <= 0.05 && (
        <g>
          <circle cx={capCx} cy={rodBottomY} r="7" fill="#fde047" opacity="0.8" />
          <circle cx={capCx} cy={rodBottomY} r="3.5" fill="#fff" opacity="0.9" />
        </g>
      )}
      {/* Vertical insulating handle (above the rod, for gripping) */}
      <rect
        x={capCx - handleW / 2}
        y={handleTopY}
        width={handleW}
        height={handleH}
        rx={4}
        fill="#c9a45a"
        stroke="#8a6d35"
        strokeWidth="1"
      />
      {/* Handle grip lines (horizontal ridges on the handle) */}
      <line x1={capCx - handleW / 2 + 2} y1={handleTopY + 5} x2={capCx + handleW / 2 - 2} y2={handleTopY + 5} stroke="#8a6d35" strokeWidth="0.8" opacity="0.5" />
      <line x1={capCx - handleW / 2 + 2} y1={handleTopY + 10} x2={capCx + handleW / 2 - 2} y2={handleTopY + 10} stroke="#8a6d35" strokeWidth="0.8" opacity="0.5" />
      <line x1={capCx - handleW / 2 + 2} y1={handleTopY + 15} x2={capCx + handleW / 2 - 2} y2={handleTopY + 15} stroke="#8a6d35" strokeWidth="0.8" opacity="0.5" />
      <line x1={capCx - handleW / 2 + 2} y1={handleTopY + 20} x2={capCx + handleW / 2 - 2} y2={handleTopY + 20} stroke="#8a6d35" strokeWidth="0.8" opacity="0.5" />
      {/* Handle-to-rod connector (small junction) */}
      <rect
        x={capCx - handleW / 2 - 2}
        y={rodTopY - 3}
        width={handleW + 4}
        height={5}
        rx={2}
        fill="#a08850"
        stroke="#8a6d35"
        strokeWidth="0.6"
      />
      {/* Horizontal rod body (lying flat) */}
      <rect
        x={rodLeftX}
        y={rodTopY}
        width={rodLen}
        height={rodH}
        rx={rodH / 2}
        fill={rodColor}
        stroke="#5a6672"
        strokeWidth="1"
      />
      {/* Rod underside indicator (subtle darker line at bottom edge) */}
      <line x1={rodLeftX + rodH / 2} y1={rodBottomY - 0.5} x2={rodRightX - rodH / 2} y2={rodBottomY - 0.5} stroke="#5a6672" strokeWidth="0.6" opacity="0.4" />
      {/* Charge symbols on rod (horizontal layout, along the rod) */}
      {showCharges && Math.abs(charge) > 0.02 && (
        <ChargeSymbols
          cx={capCx}
          cy={rodTopY + rodH / 2}
          count={countFor(charge)}
          sign={charge > 0 ? "+" : "-"}
        />
      )}
      {/* Charge badge (above the handle) — hidden when showCharges is off (e.g. during missions) */}
      {showCharges && (
      <foreignObject x={capCx - 35} y={handleTopY - 24} width={70} height={22}>
        <div className="flex justify-center">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: info.color + "22", color: info.color }}
          >
            {info.text}
          </span>
        </div>
      </foreignObject>
      )}
      {/* Drag hint (small up/down arrows above badge) */}
      <text x={capCx} y={handleTopY - 28} fontSize="11" fill="var(--sim-muted)" textAnchor="middle" fontWeight="700">
        ↕
      </text>
    </g>
  );
}

function rodColorFor(id: string | null): string {
  switch (id) {
    case "glass": return "#a7d8f0";
    case "acrylic": return "#c9b6f5";
    case "plastic": return "#7fd1b9";
    case "ebonite": return "#6b6157";
    case "metal": return "#b8c4d0";
    default: return "#cbd5e1";
  }
}

function GroundWire({
  capCx,
  capCy,
  charge,
  showCharges,
}: {
  capCx: number;
  capCy: number;
  charge: number;
  showCharges: boolean;
}) {
  const wireX = capCx + 42;
  return (
    <g>
      <path
        d={`M ${capCx + 22} ${capCy}
            C ${wireX} ${capCy - 24}, ${wireX + 6} ${capCy + 14}, ${wireX + 14} ${capCy + 46}
            L ${wireX + 14} ${395}`}
        stroke="#3a4250"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <g transform={`translate(${wireX + 14}, 395)`}>
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#3a4250" strokeWidth="3" />
        <line x1="-10" y1="5" x2="10" y2="5" stroke="#3a4250" strokeWidth="2.5" />
        <line x1="-6" y1="10" x2="6" y2="10" stroke="#3a4250" strokeWidth="2" />
      </g>
      {showCharges && Math.abs(charge) > 0.01 && (
        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={wireX + 7} cy={capCy + 12 + i * 20} r="4" fill="var(--neg)" opacity="0.85" />
          ))}
        </g>
      )}
    </g>
  );
}

