# Worklog — Electrostatic Electroscope Simulator

Project: Interactive electrostatic electroscope learning simulator (Persian/RTL).
Built as a single-page Next.js 16 app with three integrated views: Triboelectric Lab, Electroscope Simulator, and Learning Dashboard.

---
Task ID: 1
Agent: main (orchestrator)
Task: Build physics engine & triboelectric series (src/lib/sim-physics.ts)

Work Log:
- Designed triboelectric series with numeric affinity values for rods (glass, acrylic, plastic/PVC, ebonite, metal) and cloths (silk, wool, fur, cotton, nylon).
- Implemented charge-by-rubbing logic: rod charge sign = sign(rodAffinity - clothAffinity), magnitude proportional to difference.
- Implemented electroscope state machine: neutral / induced / contact-charged / induction-charged / grounded.
- Implemented induction + grounding reverse-polarity logic (charged-by-induction yields opposite charge to the external rod).
- Leaf angle model: angle ∝ net effective charge magnitude (capped at ~70°), with induction-only divergence based on local leaf charge even when net is zero.
- Metal rod (no insulator) triggers "conductor" warning — charge leaks through hand.

Stage Summary:
- Produced src/lib/sim-physics.ts with pure physics functions and TypeScript types for materials, charges, and electroscope states.

---
Task ID: 2-13
Agent: main (orchestrator)
Task: Build all UI components, assemble page, add LXD add-ons, verify with Agent Browser

Work Log:
- Built Electroscope.tsx: cartoon SVG (metal cap, central rod, glass jar with shine, fixed + movable leaves, protractor angle markings 0-70°, charge symbols +/-, external rod, grounding wire with earth symbol & flowing charges, electric field lines).
- Built TriboelectricLab.tsx: material selectors (5 rods, 5 cloths), pointer-drag rubbing stage with sparks, energy bar, rod/cloth charge status, electron-direction explainer.
- Built ElectroscopeSimulator.tsx: distance slider, ground/hand toggle, display toggles (charges/field/slow-motion), mystery mode, live status grid, scenario guide.
- Built LearningDashboard.tsx: objectives progress, predictions Q&A, triboelectric series strip, Socratic feedback feed.
- Built IntroReport.tsx: 4-slide intro carousel + final learning report modal.
- Assembled page.tsx: sticky header (tabs + toggles + report/reset), responsive main (xl: 3-col persistent dashboard; mobile: inline collapsible dashboard), sticky footer with color legend.
- Fixed infinite-loop bug: replaced store.getPhysics() selectors with useElectroscopePhysics() useMemo hook.
- Fixed rub handler: moved drag tracking to refs (dragStartRef, lastDirRef) for reliable pointer event handling.
- Fixed induction-charging state machine: computeElectroscope now handles rod-near + net-charge-present transient; takeRodBack no longer resets groundedDuringInduction prematurely.
- Fixed contact charge transfer: setDistance now transfers netCharge on first touch transition.
- Refactored mobile dashboard from blocking overlay drawer to non-blocking inline collapsible section.

Verification (Agent Browser):
- Rubbing glass+silk -> rod positive (verified).
- Induction (rod near) -> state "القا شده", leaves diverge, net neutral (verified).
- Contact -> charge transfers, electroscope matches rod, state "در حال انتقال بار" (verified).
- Remove rod after contact -> leaves stay open, state "باردار (تماس)" (verified).
- Grounding charged electroscope -> leaves close, state "زمین شده" (verified).
- Reverse induction experiment (ground while inducing -> disconnect -> remove rod) -> electroscope ends OPPOSITE charge to rod, state "باردار (القا)" (verified).
- Socratic feedback ("سحر القا!", "تیغه باز ماند") fires correctly.
- Report modal opens with objective progress.
- Mystery mode, field lines, slow-motion toggles all active.
- Sticky footer at viewport bottom on short content (860=860), pushed down on long content.
- Lint clean, no console/runtime errors on fresh load.

Stage Summary:
- Complete interactive electrostatic electroscope simulator delivered as a Persian RTL single-page app.
- All 5 electroscope states, 6-step learning scenario, Socratic feedback, 10 learning objectives, prediction Q&A, triboelectric series, and LXD add-ons (mystery mode, field lines, slow motion, energy bar, distance slider) implemented and browser-verified.
- Files: src/lib/sim-physics.ts, src/lib/sim-store.ts, src/lib/sim-content.ts, src/lib/use-electroscope-physics.ts, src/components/sim/{Electroscope,TriboelectricLab,ElectroscopeSimulator,LearningDashboard,IntroReport}.tsx, src/app/{page,layout}.tsx, src/app/globals.css.

---
Task ID: 14
Agent: main (orchestrator)
Task: Apply user feedback — fix electroscope appearance (use textbook reference), blue/white theme, Sahel font, remove charge animations, green/red toggle pills, gradual angle

Work Log:
- Analyzed reference image (الکتروسکوپ2.png) via VLM: rectangular glass jar with black frame, flat disc cap, one FIXED + one MOVABLE leaf, semi-circular 0–6 scale labeled "ELEKTROSKOP".
- Downloaded Sahel font (open-source Persian font, similar to B Nazanin style) from GitHub releases into /public/fonts/ (Sahel.woff2, Sahel-Bold.woff2, Sahel-Black.woff2).
- Updated layout.tsx: removed Google Vazirmatn import; body now uses locally-served Sahel font via @font-face in globals.css.
- Rewrote globals.css: blue/white theme (--sim-bg #f0f6fc, --sim-accent #1d6fd6, --pos #e0461c red-orange, --neg #1d6fd6 blue), removed chargePulse + groundFlow + leafWobble animations, kept sparkDrift (only fires during active rubbing), added @layer components block for .toggle-pill (green+✓ ON / red+✕ OFF).
- Completely rewrote Electroscope.tsx SVG: rectangular glass jar with black frame, brass flat disc cap, thin central metal rod, insulator bushing, FIXED leaf (left) + MOVABLE leaf (right) with pivot, semi-circular 0–6 scale with red pointer, "ELEKTROSKOP" label on base, static charge symbols (no animation), grounding wire with static charge markers, field lines.
- Updated page.tsx: replaced IconToggle with TogglePill component (green background + ✓ badge when ON, red background + ✕ badge when OFF).
- Updated ElectroscopeSimulator.tsx: replaced Switch-based ToggleRow with TogglePillLite (same green/red pill style); switched all #fffdf8/#f1ead9 warm backgrounds to #ffffff/#dbeaf9 blue.
- Updated TriboelectricLab.tsx: blue theme backgrounds, red warning (instead of amber), removed charge-pulse class from ChargeBadge.
- Updated LearningDashboard.tsx + IntroReport.tsx: blue gradient progress bars, white cards, blue accents.
- Verified gradual angle change: 12° (medium) → 13° → 17° (closer) → 12° (farther) via keyboard slider — smooth proportional response to distance.
- Browser-verified: toggle pills render green+✓ / red+✕ correctly (computed styles confirmed), electroscope SVG shows ELEKTROSKOP label + 0–6 scale + fixed/movable leaves, Sahel font loads (HTTP 200), no console/runtime errors, lint clean.

Stage Summary:
- Electroscope now matches textbook reference (rectangular jar, disc cap, fixed+movable leaves, 0–6 scale).
- Charge symbols are static (no distracting back-and-forth animation).
- Entire site theme is blue & white.
- Persian Sahel font (clean, readable, B-Nazanin-like) replaces Vazirmatn.
- Toggle buttons: green+✓ when ON, red+✕ when OFF (consistent across header and tools panel).
- Angle increases gradually as the charged rod approaches (verified 12°→17°→back).

---
Task ID: 15
Agent: main (orchestrator)
Task: Fix movable leaf mechanics — pivot at center, rotation-only, one-piece rod-leaves connection, degree scale

Work Log:
- Redesigned Electroscope.tsx leaf mechanism:
  - FIXED LEAF: hangs straight down on the LEFT of center (right edge at cx=190), from junction (190, 310) downward. No rotation.
  - MOVABLE LEAF: hangs on the RIGHT of center (left edge at cx=190), pivots at the junction (190, 310). Uses SVG transform attribute: rotate(angle, 190, 310) — pure rotation around the center, NO translation.
  - JUNCTION SCREW: a small circle (screw head with slot) at (190, 310) where rod + both leaves connect — one continuous piece, no gap.
  - ROD: continuous from cap (y=64) to junction (y=310), no gap. Verified: rod bottom = 310 = pivotY.
- Replaced Framer Motion animation with requestAnimationFrame-based smooth interpolation (displayAngle eases toward target leafAngle). This avoids the CSS transform vs SVG transform attribute conflict that caused incorrect rotation origins.
- Changed scale from 0-6 to DEGREES: major ticks at 0°, 20°, 40°, 60° (labels), minor ticks at 10°, 30°, 50°, 70°. Red pointer shows current angle.
- Scale arc is on the RIGHT side (where movable leaf swings), centered at the junction pivot, measuring the angle between fixed and movable leaves.
- Browser-verified:
  - Transform attribute: rotate(12 190 310) at medium distance, rotate(30 190 310) at contact — always around center (190, 310).
  - Gradual angle change: 12° → 13.5° → 16.5° → 12° (pure induction, no contact).
  - No translation — the leaf's top stays at the junction, only the bottom swings right.
  - Rod bottom = 310 = junction = leaf top — no gap, one piece.
  - Junction screw at (190, 310) — center of electroscope.
  - Scale labels: 0°, 20°, 40°, 60° in degrees.
  - No console/runtime errors, lint clean.

Stage Summary:
- Movable leaf now correctly pivots at the center (junction screw), rotates only (no translation), and swings to the right where the degree scale measures the angle.
- Rod → junction screw → leaves are one continuous connected piece (no physical gap).
- Scale is in degrees (0°-70°), measuring the angle between the fixed and movable leaves.

---
Task ID: 16
Agent: main (orchestrator)
Task: Fix leaf direction (counter-clockwise), scale at leaf tip in degrees, visible contact, wider/shorter proportions, fix bottom boxes, add per-objective instructions + quizzes

Work Log:
- Fixed movable leaf rotation: changed from rotate(positive) to rotate(NEGATIVE angle) — counter-clockwise. The movable leaf (right side) now swings RIGHT when charged, away from the fixed leaf (left side). Verified: tip moves from x=256 (12°) to x=263 (16.5°) — rightward. No collision with fixed leaf.
- Redesigned scale: radius = leafLen (95px) so the movable leaf's bottom tip lands exactly on the scale arc. Added a red tip marker (dot) on the movable leaf for easy reading. Degree labels 0°-70° every 10°, larger 11px font, blue tick marks, white wedge background for readability.
- Fixed contact visual: rod tip X at distance=0 = cap left edge (cx - capR = 206). Gap = 0 — rod visibly touches cap. Added a yellow/white spark glow at the contact point when distance <= 0.05.
- Resized electroscope: viewBox changed from 380x520 (tall) to 460x400 (wider, shorter). All geometry repositioned: cx=230, pivotY=210, jar 135-325 x 110-330.
- Fixed bottom boxes: foreignObjects at y=366, height=26, bottom=392 — fully within viewBox height 400. State badge (x=30, w=190) and distance label (x=240, w=190) both fit without cut-off.
- Added per-objective learning system:
  - OBJECTIVE_DETAILS in sim-content.ts: each of 10 objectives has steps (instructions) + a quiz (question, options, correctIndex, explanation).
  - Store: added objectiveQuizAnswered state + answerObjectiveQuiz action. Answering correctly marks the objective done.
  - LearningDashboard: redesigned with 3 tabs (اهداف و آموزش / پیش‌بینی / بازخورد). Objectives tab shows expandable cards with numbered steps + quiz. Correct answer shows green feedback + checks objective. Wrong answer shows red feedback, objective stays unchecked.
- Browser-verified:
  - Leaf transform: rotate(-12 230 210) — negative = counter-clockwise = swings right.
  - Tip position: x=256 (12°) → x=263 (16.5°) — moves RIGHT (away from fixed leaf).
  - Contact: rod tip at x=206 = cap left edge, gap=0.
  - Bottom boxes: y=366, bottom=392 < viewBox 400 — no cut-off.
  - Degree labels: 0°,10°,20°,30°,40°,50°,60°,70° all present.
  - Objective quiz: correct answer → "درست!" + ✓ checked. Wrong answer → "دقت کن" + unchecked.
  - No console/runtime errors, lint clean.

Stage Summary:
- Movable leaf now correctly swings RIGHT (counter-clockwise, away from fixed leaf).
- Scale in degrees (0°-70°) at the leaf tip radius for easy reading.
- Rod visibly touches cap at contact (gap=0 + spark glow).
- Electroscope is wider (460) and shorter (400) — better proportions.
- Bottom state/distance boxes fully visible (no cut-off).
- Each of 10 objectives has step-by-step instructions + a quiz; answering correctly checks the objective.

---
Task ID: 17
Agent: main (orchestrator)
Task: Fix scale arc concavity, cap-rod contact, remove slow motion, dynamic field lines, footer position

Work Log:
- Fixed scale arc concavity: changed SVG sweep flag from 1 to 0 in both ScaleWedge and ScaleArc. With sweep=1, the arc was taking the major path (290°) making concavity face DOWN. With sweep=0, it takes the minor path (70°) — concavity faces UP toward the pivot. Verified: arc path "M 230 305 A 95 95 0 0 0 319 242" (sweep=0).
- Reordered scale rendering: wedge (background) → ticks → arc (drawn LAST, on top of ticks). The blue arc now passes over the degree markings as requested.
- Fixed cap-rod contact: changed rodTop from 52 to 47, so the rod overlaps the cap's side rect (y=41, height=8, bottom=49) by 2px. No visible gap between cap and rod.
- Removed slow motion feature: removed the toggle from the header (page.tsx) and from the tools panel (ElectroscopeSimulator.tsx). Removed `slow` dependency from the rAF animation in Electroscope.tsx. The store still has the state but it's no longer used in UI.
- Made field lines dynamic (scientifically accurate): electric field strength E ∝ 1/r² increases as the rod gets closer. Field line count now scales with closeness and charge magnitude: base 2 + (1-distance)*5 + chargeMag*3. Verified: 3 lines (far) → 5 (medium) → 6 (close) → 8 (touching). More lines = stronger field.
- Fixed footer position: removed the `max-h-[70vh]` constraint from the inline dashboard wrapper (which was creating a scroll container that didn't push the footer). Changed LearningDashboard from `h-full` to `maxHeight: calc(100vh - 140px)` with overflow-y-auto. Now when the dashboard opens on mobile, the page grows naturally and the footer is pushed to the bottom. Verified: footer moved from 1651 to 2295 when dashboard opened (page height grew), footer at page bottom.
- Also fixed header background from warm cream (rgba(251,247,239)) to blue (rgba(240,246,252)) to match the blue/white theme.
- Browser-verified all fixes: no console/runtime errors, lint clean.

Stage Summary:
- Scale arc concavity now faces UP (toward pivot), arc drawn on top of ticks.
- Cap and rod are in visual contact (no gap).
- Slow motion button removed (was non-functional).
- Field lines dynamically increase (3→8) as the rod gets closer, representing stronger electric field.
- Footer correctly pushes to page bottom when dashboard opens on mobile.

---
Task ID: 18
Agent: main (orchestrator)
Task: Change rod movement from horizontal to vertical (top→bottom approach), add vertical drag

Work Log:
- Completely redesigned the external rod to be VERTICAL, approaching the cap from ABOVE:
  - Rod body: vertical rectangle (14px wide, 55px tall), centered on cx
  - Handle: insulating grip at the TOP of the rod (28px wide, 18px tall, brown with grip lines)
  - Rod tip: bottom of the rod (ellipse indicator at the bottom)
  - When far (distance=1): rod bottom at y=8 (near top of viewBox), rod extends upward off-screen
  - When touching (distance=0): rod bottom at y=72 (cap top), full rod + handle visible
  - The rod descends from above — like lowering a real lab tool
- Adjusted viewBox from "0 0 460 400" to "0 0 460 440" to accommodate vertical rod space above cap
- Shifted electroscope geometry down by ~40px: capY 44→84, pivotY 210→250, jarTop 110→150, jarBottom 330→370
- Added vertical DRAG on the rod:
  - Pointer events (onPointerDown/Move/Up) on the rod group
  - Uses SVG createSVGPoint + getScreenCTM for accurate coordinate conversion
  - Maintains grab offset so the rod doesn't jump when grabbed
  - Cursor changes to "ns-resize" (up-down arrows) when hovering on the rod
  - Invisible hit area for easier dragging
  - Drag hint "↕" above the handle
- Rewrote FieldLines for vertical orientation:
  - Lines go from rod bottom DOWN to cap top (vertical, with slight horizontal spread)
  - Arrows point DOWN (toward cap) for positive rod, UP (toward rod) for negative rod
  - Still dynamic: more lines when closer (3 at far → 8 at touch)
- Updated slider labels: "▲ بالا (دور)" and "تماس (پایین) ▼" to indicate vertical movement
- Changed slider title from "فاصله میله" to "حرکت میله (بالا/پایین)"
- Updated grounding wire endpoint from y=355 to y=395 to match new layout
- Browser-verified:
  - Rod is vertical: rect w=14, h=55, centered at cx=230
  - Rod moves vertically: y=-21 (far, slider=40) → y=17 (touch, slider=100)
  - Vertical drag works: drag down 40px → slider 40→100 (touch); drag up 60px → slider 100→2 (far)
  - Contact: rod bottom at y=72 = capTopY, state "تماس"
  - Field lines: 5 at medium distance, 8 at touch, vertical orientation
  - No console/runtime errors, lint clean

Stage Summary:
- The external rod now enters from above and moves DOWN toward the cap — natural lab-like behavior
- Rod is vertical (not horizontal), with insulating handle at the top
- Users can DRAG the rod up/down directly (cursor: ns-resize) OR use the slider
- Field lines are vertical (rod bottom → cap top) with correct arrow direction
- Slider labels indicate up=far, down=touch
- All movements are in the vertical axis only — no horizontal translation

---
Task ID: 19
Agent: main (orchestrator)
Task: Make rod body HORIZONTAL (lying flat) while keeping VERTICAL movement

Work Log:
- Redesigned ExternalRod: rod body is now HORIZONTAL (w=130, h=16 — lying flat, خوابیده)
  while movement remains VERTICAL (up/down from above).
- Rod structure (top to bottom):
  1. Drag hint "↕" above the charge badge
  2. Charge badge (e.g., "مثبت (کم)")
  3. Vertical insulating handle (w=14, h=22, brown with grip ridges) — user holds this
  4. Handle-to-rod connector (small junction piece)
  5. Horizontal rod body (w=130, h=16, colored by material, lying flat)
  6. Rod underside (subtle darker line at bottom edge)
- Geometry adjusted: rodFarY=44 so the full rod+handle assembly is visible even at the
  farthest position (handle top at y=6, within viewBox).
- Vertical drag still works: pointer events convert clientY → SVG Y, rod moves up/down.
  Cursor: ns-resize. Verified: drag down → slider 40→100 (touch), rod y 39→56.
- Contact: rod bottom (underside) at y=72 = capTopY. Spark glow at contact point.
- Field lines still vertical (rod bottom → cap top), dynamic count (5 far → 8 touch).
- Charge symbols on rod are now horizontal (along the rod's length).
- Browser-verified:
  - Rod body: x=165, y=39, w=130, h=16 — HORIZONTAL (w >> h)
  - Handle: x=223, y=17, w=14, h=22 — vertical, above rod
  - Both centered at cx=230
  - Vertical drag: y=39 (far) → y=56 (touch, bottom=72=capTopY)
  - State: "تماس" at touch, "القا شده" at medium distance
  - Field lines: 5 (medium) → 8 (touch)
  - No errors, lint clean

Stage Summary:
- The rod is now HORIZONTAL (lying flat, خوابیده) — like a real charged rod held parallel to the cap.
- Movement is VERTICAL — the rod descends from above toward the cap (lowering motion).
- A vertical insulating handle on top lets the user "hold" and lower the rod naturally.
- All drag, field lines, contact, and charge display work correctly with the horizontal rod.

---
Task ID: 20
Agent: main (orchestrator)
Task: Increase rod's farthest distance from cap by 2.5x

Work Log:
- Increased rod travel from 28px to 70px (2.5x):
  - rodFarY changed from 44 to 2 (rod bottom at far now at y=2 instead of y=44)
  - rodTouchY stays at capTopY=72
  - New travel = 72 - 2 = 70px (was 72 - 44 = 28px)
- Extended viewBox upward to accommodate the handle at far position:
  - viewBox changed from "0 0 460 440" to "0 -40 460 480"
  - At far, handle top = 2 - 16 - 22 = -36 (visible, viewBox starts at -40, 4px margin)
  - All existing electroscope elements unchanged (cap, rod, leaves, jar, base all stay at same positions)
- Updated display height in ElectroscopeSimulator from 421 to 459 to maintain aspect ratio
  with the new viewBox (460×480, aspect 0.958 → height = 440 × 480/460 = 459)
- Browser-verified:
  - Far (slider=0): rod bottom=2, gap=70px (was 28px → exactly 2.5x) ✓
  - Touch (slider=100): rod bottom=72, gap=0, state="تماس" ✓
  - Handle visible at far (top=-36, viewBox starts at -40) ✓
  - No errors, lint clean

Stage Summary:
- The rod's farthest distance from the cap is now 2.5x larger (70px vs 28px).
- The viewBox was extended upward by 40px to keep the handle visible at the far position.
- All other elements and behavior unchanged.

---
Task ID: 21
Agent: main (orchestrator)
Task: Remove mystery mode + field lines, replace showCharges with showDegreeMarks, build 3-mission interactive educational system

Work Log:
- Removed mystery mode entirely: deleted showFieldLines, mysteryMode, mysterySign, mysteryRevealed, mysteryFeedback, toggleMystery, revealMystery, guessMystery from store. Removed obj-mystery from objectives. Removed all mystery UI from ElectroscopeSimulator and page.tsx header.
- Removed field lines: deleted FieldLines component from Electroscope.tsx, removed showFieldLines usage.
- Removed header display toggles: deleted all TogglePill buttons from header (نمایش بارها, خطوط میدان, حالت معما). Only the "نمایش درجه‌بندی" toggle remains in the right-side tools panel.
- Replaced showCharges with showDegreeMarks: charges are now ALWAYS visible (educational mode). The toggle controls whether degree number labels (0°, 10°, ..., 70°) are shown on the scale. Added showLabel prop to ScaleTick component.
- Added "ماموریت‌ها" tab to header with Gamepad2 icon. View type updated to include "missions".
- Created mission content (sim-content.ts):
  - MISSIONS: 3 mission definitions with title, emoji, story, objective, prediction options
  - Mission 1: شکار بار الکتریکی (Charge Hunter) — detect charged vs neutral objects
  - Mission 2: کشف راز بارها (Secret of Charges) — detect positive vs negative using induction
  - Mission 3: آزمون رسانایی (Conductivity Test) — detect conductor vs insulator
  - Randomized object generators (genM1Objects, genM2Object, genM3Objects) with shuffle
  - getCorrectAnswer, getExplanation (dynamic for mission 2 based on electroscope pre-charge), getCompletionMessage
- Added mission state to sim-store:
  - MissionState: active, missionId, phase, objects, currentIndex, prediction, tested, experimentReady, observed
  - Actions: startMission, exitMission, missionSelectObject, missionSetPrediction, missionObserveResult, missionNextObject, missionResetExperiment
  - Each mission sets up electroscope appropriately (m1: neutral start, m2: pre-charged + external rod, m3: pre-charged)
- Built Missions.tsx component:
  - Selection screen: 3 mission cards with emoji, title, story, objective, start button
  - Active mission: shows electroscope simulator + right-side mission control panel
  - Phases: intro → selection → prediction → experiment → result → complete
  - Each phase has appropriate UI with animations
  - Result panel: correct/incorrect feedback, scientific explanation, hint on wrong answer
  - Completion screen: score, encouraging message, retry/exit buttons
- Browser-verified:
  - All 3 missions work: selection → prediction → experiment → result → next/complete
  - Randomized objects each time
  - Degree marks toggle: ON shows 8 labels, OFF shows 0 labels
  - No mystery, field lines, or header toggles remain
  - No console/runtime errors, lint clean

Stage Summary:
- Mystery mode and field lines removed.
- Header display toggles removed; "نمایش درجه‌بندی" toggle in right panel controls degree number visibility.
- 3 interactive educational missions built with randomized scenarios, prediction → experiment → result flow, scientific explanations, and encouraging feedback.

---
Task ID: 22
Agent: main (orchestrator)
Task: Fix mission bugs — conductor/insulator detection, hide charges, 4-scenario mission 2, restore showCharges toggle

Work Log:
- Restored showCharges state + toggleShowCharges action to store. Charges are now controllable again.
- Updated Electroscope.tsx: all charge displays (cap, rod, leaves, external rod, ground wire) now respect showCharges flag.
- Restored "نمایش بارها (+/−)" toggle in ElectroscopeSimulator tools panel (alongside "نمایش درجه‌بندی").
- Fixed Mission 3 (conductivity): setDistance contact logic now checks rodIsConductor for mission 3:
  - Conductor touching cap → netCharge = 0 (discharge, leaf closes)
  - Insulator touching cap → netCharge unchanged (leaf stays open)
  - Verified: metal (conductor) → leaf 49°→0°, wood (insulator) → leaf stays 49°
- Fixed Mission 1 & 2 charge visibility: startMission now sets showCharges=false for ALL missions. exitMission restores showCharges=true. Charges are hidden during missions so the rod's charge is "unknown".
- Fixed Mission 2 to have 4 scenarios (not 1):
  - Generates 4 rods: 2 positive + 2 negative (shuffled), with random electroscope pre-charge
  - Creates 4 distinct combinations: +/+, +/-, -/+, -/-
  - User selects each rod from the selection screen (like missions 1 & 3)
  - missionNextObject now checks if ALL objects are tested (not just currentIndex+1)
- Increased charge magnitudes for clearer leaf movement:
  - Mission 2: preCharge and rodCharge both 1.0 (was 0.8)
  - Mission 3: preCharge 1.0 (was 0.7)
  - Mission 1: rodCharge 1.0 (was 0.7)
- Browser-verified:
  - Mission 3: conductor closes leaf (49°→0°), insulator keeps leaf open (49°→49°) ✓
  - Mission 2: 4 unknown rods (A,B,C,D) with hidden charges ✓
  - Mission 1 & 2: charges hidden during mission (0 charge circles) ✓
  - "نمایش بارها" toggle: ON=7 circles, OFF=0 circles ✓
  - No errors, lint clean

Stage Summary:
- Mission 3 conductor/insulator detection fixed (conductors discharge, insulators don't).
- Charges hidden during all missions (unknown charge concept).
- Mission 2 now has 4 randomized scenarios (+/− × +/−).
- "نمایش بارها" toggle restored in the tools panel.
- Charge magnitudes increased for clearer leaf divergence.

---
Task ID: 23
Agent: main (orchestrator)
Task: Fix mission charge visibility + Mission 2 physics (induction must match explanation)

Work Log:
- Fixed charge label badge on rod: the text label (e.g. "خنثی", "مثبت") that appeared above the rod was always visible. Now it's hidden when showCharges is false (during missions). Wrapped the foreignObject charge badge in {showCharges && (...)} in ExternalRod component.
- Fixed Mission 2 physics — induction was not changing leaf angle:
  - Root cause 1: computeElectroscope used inductionBoost that was always positive and capped at 70°. When electroscope was at max charge (1.0), the base angle was already 70°, so no change was visible regardless of rod sign.
  - Root cause 2: Contact during Mission 2 transferred charge (netCharge = rodCharge), corrupting the electroscope's pre-charge for subsequent rods.
  - Fix 1: Rewrote the induction modulation in computeElectroscope. Now:
    - Same-sign rod near → leaf diverges MORE (angle increases)
    - Opposite-sign rod near → leaf diverges LESS (angle decreases)
    - The effect is sign-aware: ang = sameSign ? min(70, base+effect) : max(0, base-effect)
  - Fix 2: setDistance now skips charge transfer for Mission 2 (induction only, no contact transfer).
  - Fix 3: Reduced preCharge from 1.0 to 0.7 so base angle is ~49°, giving room for both increase (to 70°) and decrease (to ~14°).
- Fixed Mission 2 button text: was always "پایان ماموریت" for mission 2, now correctly shows "آزمایش بعدی" until all objects tested.
- Show progress bar for Mission 2 (was hidden).
- Show selected object info in prediction phase for Mission 2 (was hidden).
- Browser-verified:
  - Mission 2 opposite-sign rod: leaf 42° (far) → 15.9° (near) — leaf CLOSES when rod approaches ✓
  - Mission 2 same-sign rod: leaf 42° (far) → 70° (near) — leaf opens MORE when rod approaches ✓
  - Explanation matches behavior: "تیغه‌ها بسته‌تر شوند" for opposite, "بیشتر باز شوند" for same ✓
  - Charge labels fully hidden during missions (0 text labels, 0 charge circles) ✓
  - No errors, lint clean

Stage Summary:
- Charge labels and symbols fully hidden during all missions (unknown charge concept).
- Mission 2 physics fixed: induction now correctly changes leaf angle (same-sign opens more, opposite-sign closes).
- Explanation text matches observed behavior.
- Mission 2 has 4 rods with progress bar and correct "next experiment" button.

---
Task ID: 24
Agent: main (orchestrator)
Task: Update rod and cloth materials to match the 11th-grade textbook triboelectric series

Work Log:
- Analyzed the uploaded textbook screenshot using VLM to understand the triboelectric series table.
- Updated RODS in sim-physics.ts with textbook-accurate affinity values and descriptions:
  - شیشه (glass): affinity=6 (most positive, "بالاترین در سری مالشی")
  - اکریلیک (acrylic): affinity=3 (semi-positive)
  - فلز (metal): affinity=0 (conductor)
  - پلاستیک (plastic): affinity=-4 (negative)
  - ابونیت (ebonite): affinity=-5 (most negative)
- Updated CLOTHS in sim-physics.ts with textbook-accurate values:
  - خز/موی حیوان (fur): affinity=5 (positive)
  - نایلون (nylon): affinity=4.5 (positive)
  - پشم (wool): affinity=4 (positive)
  - ابریشم (silk): affinity=2 (less positive than glass — glass+silk → glass positive, silk negative)
  - پنبه/کتان (cotton): affinity=1 (near neutral)
- Updated description text to reference "سری مالشی" (triboelectric series) and show correct charge relationships.
- Renamed "خز" to "خز (موی حیوان)" and "پنبه" to "پنبه (کتان)" for textbook accuracy.
- Updated normalization in rubMaterials: denominator changed from 7 to 11 (max diff = 6-(-5)=11).
- Verified physics correctness via Agent Browser:
  - Glass + Silk → rod positive, cloth negative ✓ (textbook correct)
  - Ebonite + Wool → rod negative, cloth positive ✓ (textbook correct)
  - Plastic + Nylon → rod negative, cloth positive ✓ (textbook correct)
- The triboelectric series reference in LearningDashboard auto-sorts by affinity, showing:
  شیشه > خز > نایلون > پشم > اکریلیک > ابریشم > پنبه > پلاستیک > ابونیت
- No errors, lint clean.

Stage Summary:
- Rod and cloth materials now match the 11th-grade physics textbook triboelectric series.
- Affinity values ensure correct charge signs when rubbing any combination.
- Descriptions reference the textbook series and show correct charge relationships.
- The dashboard reference table displays materials in correct order from positive to negative.

---
Task ID: 25
Agent: main (orchestrator)
Task: Build Dynamic Question Generator system with 7 question types

Work Log:
- Created sim-content-dynamic.ts — the question generator engine:
  - generateScenario(): randomly generates experiment parameters (electroscope charge, rod charge, magnitude, experiment type, distance) with physically valid combinations only
  - runPhysics(): uses the actual computeElectroscope engine to determine leaf behavior (open-more, open-less, close-fully, no-change, stay-open)
  - generateQuestion(): combines scenario + physics result + random question type to produce a complete question
  - 7 question types implemented:
    1. predict-result: "What happens to the leaves?"
    2. identify-rod-charge: "What is the rod's charge?"
    3. identify-electroscope-charge: "What was the initial charge?"
    4. identify-experiment-type: "Was it approach or contact?"
    5. analyze-cause: "Why did this happen?"
    6. predict-continuation: "If we bring closer, what happens?"
    7. find-error: "Which part is physically wrong?" (15% chance, intentionally wrong result)
  - Options are shuffled each time
  - Explanations are generated dynamically based on the scenario
  - Each question includes the full scenario info for transparency
- Added question state to sim-store:
  - currentQuestion, questionAnswered, questionSelectedAnswer
  - questionCorrectCount, questionTotalCount (score tracking)
  - generateNewQuestion() and answerQuestion() actions
- Built DynamicQuestions.tsx component:
  - Auto-generates first question on mount
  - Shows question type badge, question text, shuffled options
  - After answering: shows correct/incorrect feedback + scientific explanation + scenario details
  - "سؤال جدید" button generates a fresh question
  - Score counter (correct/total) in header
  - Animations with framer-motion
- Added "سؤالات پویا" tab to header with Brain icon
- Added "questions" view routing in page.tsx
- Browser-verified:
  - Questions generate dynamically with different types (tested: تشخیص بار میله, نوع آزمایش, تحلیل علت, پیش‌بینی ادامه)
  - Options are shuffled
  - Explanations match the scenario
  - Score tracking works
  - No errors, lint clean
- Updated download zip with all new files

Stage Summary:
- Dynamic question generator produces hundreds/thousands of unique questions
- All questions are generated from the physics engine, not from a fixed bank
- 7 question types with randomized scenarios and shuffled options
- Scientific explanations provided for every answer
- Score tracking and "new question" button for continuous practice

---
Task ID: 26
Agent: main (orchestrator)
Task: Fix dynamic questions — correct answer visibility, previous question, end-practice report, numeric labels, report modal score

Work Log:
- Fixed correct answer visibility: when user answers wrong, the correct answer is now shown in a prominent green box (2px solid green border, green background, bold text) with a checkmark icon. Previously it was a faint text line.
- Added "سؤال قبلی" (previous question) button: users can navigate back through answered questions. History is tracked in questionHistory array with questionHistoryIndex. When going back, the question and the user's selected answer are restored.
- Added "پایان تمرین" (end practice) button: ends the practice session and shows a full analytical report card.
- Built PracticeReport component (کارنامه تحلیلی):
  - Score summary: correct count, wrong count, percentage
  - Grade: عالی/خوب/متوسط/نیاز به تمرین (with emoji)
  - Score with negative marking: each correct = +3, each wrong = -1
  - Strengths: question types with ≥70% correct rate
  - Weaknesses: question types with <70% correct rate
  - Study suggestions: tailored to weak areas (e.g., "جدول الکتریسیته مالشی را مرور کن")
  - Reset and exit buttons
- Changed option labels from Persian letters (ا، ب، ه، ت) to numbers (1, 2, 3, 4).
- Added dynamic questions score to the report modal (FinalReport):
  - Shows correct/wrong/total counts with colored boxes
  - Shows percentage
  - Only appears if user has answered at least 1 question
- Added to store: questionWrongCount, questionHistory, questionHistoryIndex, questionPracticeEnded, goToPreviousQuestion, goToNextQuestion, endQuestionPractice, resetQuestionPractice
- Browser-verified:
  - Wrong answer → correct answer shown in prominent green box ✓
  - Previous question button works ✓
  - End practice → full report card with score, strengths, weaknesses, suggestions ✓
  - Numeric option labels (1,2,3,4) ✓
  - Report modal shows question score ✓
  - No errors, lint clean

Stage Summary:
- Correct answers are now clearly visible when user answers wrong.
- Users can go back to previous questions.
- End-practice report card provides analytical feedback with negative marking, strengths/weaknesses, and study suggestions.
- Options use numbers instead of Persian letters.
- Report modal includes dynamic questions score.

---
Task ID: 27
Agent: main (orchestrator)
Task: Fix question navigation — move prev/next buttons to header, fix stale closure issue

Work Log:
- Moved "سؤال قبلی" (previous) and "سؤال بعدی" (next) navigation buttons to the header, next to the score counter and "بازگشت" button.
- Buttons use arrow icons: ArrowRight for previous (→), ArrowLeft for next (←).
- Previous button: disabled when on first question.
- Next button: when at end of history (no more questions ahead) and current question is answered, generates a new question. When not at end, navigates to next question.
- Fixed stale closure issue: the onClick handlers now read the current state via useSimStore.getState() instead of relying on closure variables (isAtEnd, questionAnswered) which could be stale after navigation.
- The fix checks if questionHistory[nextIdx] exists to determine if there's a next question to navigate to, or if a new question should be generated.
- Removed duplicate prev/next buttons from the bottom of the question card. Bottom now only has "سؤال بعدی/سؤال جدید" (main action) and "پایان تمرین".
- Browser-verified full flow: Q1 → answer → Q2 → answer → back to Q1 → forward to Q2 ✓
- No errors, lint clean.

Stage Summary:
- Navigation buttons (prev/next with arrows) are in the header next to the score counter.
- Users can go back and forward between questions freely.
- At the end of history, the next button generates a new question.
- Stale closure issue fixed by reading state directly from the store.

---
Task ID: 28
Agent: main (orchestrator)
Task: Fix question clarity, remove duplicate answers, add visual animation, improve options

Work Log:
- Completely rewrote sim-content-dynamic.ts (v2):
  - Added isAmbiguous() filter: removes trivial scenarios (neutral rod + charged electroscope + approach, far distance + approach) that produce boring "no-change" results
  - Added getValidQuestionTypes(): filters question types that can't be answered from the given scenario (e.g., can't identify rod charge when electroscope is neutral — both signs give same result)
  - Rewrote all question builders with clearer, more specific Persian text:
    - Questions now include full context: "بار اولیه‌اش X است", "با شدت Y", "تماس می‌دهیم" vs "نزدیک می‌کنیم (بدون تماس)"
    - Options are more descriptive: "بیشتر از قبل باز می‌شوند" instead of just "بیشتر باز می‌شوند"
    - Added "(نیمه‌باز)" to distinguish "open-less" from "close-fully"
    - Removed ambiguous "stay-open" from predict-result when not relevant
  - predict-result now shows 4 options (correct + 3 random distractors from 5 total) instead of always all 4
  - identify-experiment-type: fixed question text to not pre-state the action type
  - analyze-cause: wrong options are more distinctly wrong and specific
  - predict-continuation: clearer correct/wrong labels
  - find-error: clearer phrasing ("دانش‌آموزی گفته...")
- Created MiniExperimentAnimation.tsx:
  - Compact animated SVG (320×200) that visually shows the experiment
  - Three phases: initial → experiment → result (auto-loops)
  - Shows: electroscope with charge, rod approaching/touching, leaf angle changing, charge symbols, contact spark
  - Phase indicator dots and labels
  - Student can SEE what happens instead of going back to the simulator
- Updated DynamicQuestions.tsx to show the animation after answering
- Browser-verified:
  - Questions are clearer (tested 5 different questions — all unambiguous)
  - Options are distinct and well-labeled
  - Animation shows after answering with 3 phases
  - No duplicate correct answers
  - No errors, lint clean

Stage Summary:
- Questions are clear and unambiguous for 11th-grade students.
- Options are distinct, descriptive, and only one is correct.
- Visual animation shows the experiment result (no need to go back to simulator).
- Ambiguous scenarios are filtered out before question generation.

---
Task ID: 29
Agent: main (orchestrator)
Task: Fix ambiguous identify-charge questions + fix leaf animation visibility

Work Log:
- Fixed ambiguous "identify-rod-charge" and "identify-electroscope-charge" questions:
  - User correctly identified that "leaves close somewhat" (open-less) is ambiguous: 
    could be caused by opposite-sign rod OR a neutral conductor sharing charge
  - Added filter in getValidQuestionTypes(): these question types are now ONLY generated
    when result is "open-more" (unambiguously same-sign) or "close-fully" (unambiguously
    opposite-sign with enough charge). "open-less", "no-change", and "stay-open" are
    excluded because they're ambiguous.
  - Verified: generated 10+ questions, all "identify-charge" types now have unambiguous answers
- Fixed leaf animation in MiniExperimentAnimation:
  - Problem: SVG `transform` attribute doesn't animate with CSS transitions
  - Fix: Changed from `transform="rotate(...)"` attribute to `style={{ transform: rotate(...deg), transformOrigin, transformBox: 'view-box', transition: 'transform 0.8s ease-in-out' }}`
  - Also amplified angle by 1.2x (capped at 55°) for better visibility in compact SVG
  - Verified: leaf shows `matrix(0.905, -0.426, ...)` = ~25° rotation with CSS transition
- Browser-verified:
  - No ambiguous identify-charge questions generated ✓
  - Leaf animation visibly rotates with smooth transition ✓
  - No errors, lint clean

Stage Summary:
- Questions that ask "what is the charge" now only appear when the answer is unambiguous.
- The physics issue (neutral conductor sharing charge = ambiguous with opposite-sign rod) is resolved.
- Leaf animation now smoothly animates between phases using CSS transform transition.

---
Task ID: 30
Agent: main (orchestrator)
Task: Fix ambiguous identify-experiment-type for neutral electroscope + fix animation scenario matching + add wrong option explanations

Work Log:
- Fixed identify-experiment-type: no longer generated for neutral electroscope.
  When electroscope is neutral, both approach (induction) and contact (charge transfer) cause leaves to open — making the question ambiguous.
  Now only generated when electroscope is charged AND rod is charged (behavior differs between approach and contact).
- Added wrongExplanations to GeneratedQuestion interface and all 7 question builders:
  - predict-result: explains why each wrong leaf action doesn't apply
  - identify-rod-charge: explains what would happen if the rod had each wrong charge
  - identify-electroscope-charge: explains what would happen with each wrong initial charge
  - identify-experiment-type: explains why approach vs contact would give different results
  - analyze-cause: explains why each wrong cause is incorrect
  - predict-continuation: explains why "reverse" and "no-change" are wrong
  - find-error: explains why the non-error parts are actually correct
- Updated DynamicQuestions.tsx to show wrong explanations:
  1. "چرا پاسخ شما نادرست است؟" — explains why the user's selected answer is wrong
  2. "بررسی سایر گزینه‌ها" — explains why each other wrong option is wrong
- Completely rewrote MiniExperimentAnimation:
  - Now shows ACTUAL scenario charges (not generic): correct +/− on cap, leaves, and rod
  - Rod color reflects actual charge (orange for +, blue for −)
  - Leaf charges update based on experiment type (after contact, leaves show rod's charge)
  - Rod position animates correctly: far → near → touch (for contact) or near (for approach)
  - Contact spark only shows for contact experiments with charged rod
  - Labels show actual scenario: "الکتروسکوپ: منفی — میله: مثبت"
- Browser-verified:
  - Wrong explanations shown for all wrong options ✓
  - Animation charges match scenario (− on electroscope, + on rod) ✓
  - No ambiguous identify-experiment-type for neutral electroscope ✓
  - No errors, lint clean

Stage Summary:
- identify-experiment-type no longer generated for ambiguous neutral electroscope scenarios.
- Every wrong option now has a scientific explanation of why it's wrong.
- Animation shows the actual scenario: real charges, real experiment type, real leaf behavior.

---
Task ID: 31
Agent: main (orchestrator)
Task: Fix scientific error in explanations + fix animation leaf visibility

Work Log:
- Fixed scientific error in generateExplanation() (sim-content-dynamic.ts):
  - WRONG: "بارهای هم‌نام میله به کلاهک کشیده شده" (like charges attracted to cap — incorrect!)
  - CORRECT: "بارهای ناهمنام با میله به کلاهک کشیده می‌شوند (جذب) و بارهای هم‌نام با میله به تیغه‌ها رانده می‌شوند (دفع)"
  - Physics: opposite charges attract (to cap), like charges repel (to leaves). The previous text had it backwards.
  - Fixed all 3 cases: same-sign, opposite-sign, and neutral electroscope
  - Also fixed getCauseLabel() with same correction
  - Verified sim-physics.ts original explanations were already correct
- Fixed animation leaf visibility (MiniExperimentAnimation.tsx):
  - Problem: angles were too similar (e.g., initialAngle=49°, finalAngle=70° → only 21° difference, hard to see)
  - For neutral electroscope: initialAngle=0°, finalAngle might be small → barely visible
  - Solution: use exaggerated animation-specific angles based on the ACTION, not the raw physics values:
    - "open-more": start at 20-35°, end at 50° (clearly more open)
    - "open-less": start at 45°, end at 10-25° (clearly less open)
    - "close-fully": start at 45°, end at 0° (clearly closed)
    - "stay-open": start at 0°, end at 45° (clearly opened)
    - "no-change": stays at same angle
  - This ensures at least 20° visible difference between initial and final phases
- Browser-verified:
  - Explanation now says "بارهای ناهمنام با میله به کلاهک کشیده می‌شوند (جذب) و بارهای هم‌نام با میله به تیغه‌ها رانده می‌شوند (دفع)" ✓
  - Animation leaf shows visible rotation (~46° in result phase) ✓
  - identify-experiment-type not generated for neutral electroscope ✓
  - No errors, lint clean

Stage Summary:
- All scientific explanations corrected: opposite charges attract to cap, like charges repel to leaves.
- Animation now uses action-based exaggerated angles so leaf movement is always clearly visible.

---
Task ID: 32
Agent: main (orchestrator)
Task: Fix touch rubbing, add quick rub button, remove animation, add question report

Work Log:
- Fixed touch rubbing for tablets/mobile:
  - Added `e.preventDefault()` in pointer down/move handlers to prevent default touch scrolling
  - Added `touchAction: "none"` inline style to the stage div (in addition to touch-none class)
  - Added `releasePointerCapture` in pointer up handler
  - Reduced stroke threshold from 16px to 12px for easier touch dragging
- Added "مالش سریع" (Quick Rub) button:
  - Shows below the rubbing stage
  - Each click adds 15% to rub progress
  - Shows projected percentage: "مالش سریع (+30%)"
  - Works as alternative for devices where touch dragging doesn't work
  - Updated instruction text: "پارچه را با انگشت یا ماوس به چپ و راست بکش — یا دکمه «مالش سریع» را بزن"
- Removed MiniExperimentAnimation from dynamic questions:
  - Removed import and component usage
  - Animation was not matching scenarios correctly despite multiple fixes
  - Students can still use the simulator to see what happens
- Added "گزارش سؤال" (Report Question) button:
  - Orange button next to "پایان تمرین"
  - Opens a modal showing the question text, correct answer, and a text field for notes
  - On submit, sends data to /api/report-question API endpoint
  - API stores reports in data/question-reports.json
  - Shows success/error feedback
  - Auto-closes after 2 seconds on success
- Created /api/report-question API route:
  - POST endpoint that receives question data + user note
  - Stores in data/question-reports.json
  - Returns success/error JSON response
- Browser-verified:
  - Quick rub button works: 0% → 15% → 30% ✓
  - Report modal opens, sends data, stores in JSON file ✓
  - Animation removed from questions ✓
  - No errors, lint clean

Stage Summary:
- Touch rubbing fixed with preventDefault + touchAction:none.
- Quick rub button provides alternative for touch devices.
- MiniExperimentAnimation removed from dynamic questions.
- Question report system: button → modal → API → JSON storage.
- Reports stored in data/question-reports.json for teacher review.
