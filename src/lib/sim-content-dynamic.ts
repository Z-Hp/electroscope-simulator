// Dynamic Question Generator Engine — v2
// Fixed: no duplicate correct answers, no ambiguous options, clearer questions,
// multi-select support, visual animation data.

import { computeElectroscope, SimSnapshot } from "./sim-physics";

// ===== Types =====

export type ChargeLevel = "positive" | "negative" | "neutral";
export type ExperimentType = "approach" | "contact";
export type DistanceLevel = "far" | "medium" | "near" | "touch";
export type ChargeMagnitude = "low" | "medium" | "high";

export interface ExperimentScenario {
  electroscopeCharge: ChargeLevel;
  rodCharge: ChargeLevel;
  rodMagnitude: ChargeMagnitude;
  experimentType: ExperimentType;
  finalDistance: DistanceLevel;
}

export type LeafAction =
  | "open-more"
  | "open-less"
  | "close-fully"
  | "no-change"
  | "stay-open";

export interface PhysicsResult {
  leafAction: string; // human-readable
  leafActionKey: LeafAction;
  finalAngle: number;
  initialAngle: number;
  explanation: string;
}

export type QuestionType =
  | "predict-result"
  | "identify-rod-charge"
  | "identify-electroscope-charge"
  | "identify-experiment-type"
  | "analyze-cause"
  | "predict-continuation"
  | "find-error";

export interface GeneratedQuestion {
  type: QuestionType;
  scenario: ExperimentScenario;
  result: PhysicsResult;
  questionText: string;
  options: { value: string; label: string }[];
  correctAnswer: string;
  correctAnswers?: string[];
  isMultiSelect?: boolean;
  explanation: string;
  wrongExplanations?: Record<string, string>; // why each wrong option is wrong
  isErrorScenario?: boolean;
  errorDescription?: string;
}

// ===== Random helpers =====

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ===== Scenario Generator =====

export function generateScenario(): ExperimentScenario {
  const electroscopeCharge = randomChoice<ChargeLevel>(["positive", "negative", "neutral"]);
  const rodCharge: ChargeLevel =
    electroscopeCharge === "neutral"
      ? randomChoice<ChargeLevel>(["positive", "negative"])
      : randomChoice<ChargeLevel>(["positive", "negative"]);
  const rodMagnitude = randomChoice<ChargeMagnitude>(["low", "medium", "high"]);
  const experimentType = randomChoice<ExperimentType>(["approach", "contact"]);
  const finalDistance: DistanceLevel =
    experimentType === "contact" ? "touch" : randomChoice<DistanceLevel>(["far", "medium", "near"]);

  return { electroscopeCharge, rodCharge, rodMagnitude, experimentType, finalDistance };
}

// ===== Physics Runner =====

const MAGNITUDE_MAP: Record<ChargeMagnitude, number> = {
  low: 0.3,
  medium: 0.6,
  high: 1.0,
};

const DISTANCE_MAP: Record<DistanceLevel, number> = {
  far: 0.85,
  medium: 0.5,
  near: 0.2,
  touch: 0.0,
};

function chargeToValue(level: ChargeLevel, magnitude: ChargeMagnitude): number {
  if (level === "neutral") return 0;
  const mag = MAGNITUDE_MAP[magnitude];
  return level === "positive" ? mag : -mag;
}

export function runPhysics(scenario: ExperimentScenario): PhysicsResult {
  const netCharge = chargeToValue(scenario.electroscopeCharge, scenario.rodMagnitude);
  const rodChargeValue = chargeToValue(scenario.rodCharge, scenario.rodMagnitude);
  const distance = DISTANCE_MAP[scenario.finalDistance];
  const isContact = scenario.experimentType === "contact" || distance <= 0.03;

  // Initial state (rod far away)
  const initialSnapshot: SimSnapshot = {
    externalRodCharge: 0, externalRodPresent: false, externalRodDistance: 1,
    netCharge, isGrounded: false, isContact: false,
    groundedDuringInduction: false, inductionRodSign: 0,
  };
  const initialAngle = computeElectroscope(initialSnapshot).leafAngleDeg;

  // Final state
  let finalNetCharge = netCharge;
  if (isContact) finalNetCharge = rodChargeValue;

  const finalSnapshot: SimSnapshot = {
    externalRodCharge: isContact ? 0 : rodChargeValue,
    externalRodPresent: !isContact,
    externalRodDistance: isContact ? 1 : distance,
    netCharge: finalNetCharge,
    isGrounded: false,
    isContact: finalIsContact(scenario),
    groundedDuringInduction: false,
    inductionRodSign: Math.sign(rodChargeValue),
  };
  const finalAngle = computeElectroscope(finalSnapshot).leafAngleDeg;

  // Determine leaf action
  let leafAction: LeafAction;
  let leafActionStr: string;

  if (scenario.experimentType === "contact") {
    if (scenario.rodCharge === "neutral") {
      leafAction = "no-change";
      leafActionStr = "تیغه‌ها هیچ تغییری نمی‌کنند";
    } else if (scenario.electroscopeCharge === "neutral") {
      leafAction = "stay-open";
      leafActionStr = "تیغه‌ها باز می‌شوند و باز می‌مانند";
    } else if (scenario.rodCharge === scenario.electroscopeCharge) {
      leafAction = "open-more";
      leafActionStr = "تیغه‌ها بیشتر باز می‌شوند";
    } else {
      if (finalAngle < 5) {
        leafAction = "close-fully";
        leafActionStr = "تیغه‌ها کاملاً بسته می‌شوند";
      } else {
        leafAction = "open-less";
        leafActionStr = "تیغه‌ها کمتر باز می‌شوند";
      }
    }
  } else {
    // Approach
    if (scenario.rodCharge === "neutral") {
      leafAction = "no-change";
      leafActionStr = "تیغه‌ها هیچ تغییری نمی‌کنند";
    } else if (scenario.electroscopeCharge === "neutral") {
      if (scenario.finalDistance === "far") {
        leafAction = "no-change";
        leafActionStr = "تیغه‌ها هیچ تغییری نمی‌کنند";
      } else {
        leafAction = "stay-open";
        leafActionStr = "تیغه‌ها باز می‌شوند (القا)";
      }
    } else {
      const sameSign =
        (scenario.rodCharge === "positive" && scenario.electroscopeCharge === "positive") ||
        (scenario.rodCharge === "negative" && scenario.electroscopeCharge === "negative");

      if (scenario.finalDistance === "far") {
        leafAction = "no-change";
        leafActionStr = "تغییر بسیار کم — عملاً هیچ تغییری نمی‌کنند";
      } else if (sameSign) {
        leafAction = "open-more";
        leafActionStr = "تیغه‌ها بیشتر باز می‌شوند";
      } else {
        if (finalAngle < initialAngle * 0.3) {
          leafAction = "close-fully";
          leafActionStr = "تیغه‌ها کاملاً بسته می‌شوند";
        } else {
          leafAction = "open-less";
          leafActionStr = "تیغه‌ها کمتر باز می‌شوند";
        }
      }
    }
  }

  const explanation = generateExplanation(scenario, leafAction);

  return { leafAction: leafActionStr, leafActionKey: leafAction, finalAngle, initialAngle, explanation };
}

function finalIsContact(scenario: ExperimentScenario): boolean {
  return scenario.experimentType === "contact";
}

// ===== Explanation =====

function generateExplanation(scenario: ExperimentScenario, action: LeafAction): string {
  const e = chargeLabel(scenario.electroscopeCharge);
  const r = chargeLabel(scenario.rodCharge);

  if (scenario.experimentType === "contact") {
    if (scenario.rodCharge === "neutral")
      return `چون میله خنثی است، با تماس بار منتقل نمی‌شود. الکتروسکوپ ${e} باقی می‌ماند و تیغه‌ها تغییری نمی‌کنند.`;
    if (scenario.electroscopeCharge === "neutral")
      return `با تماس میله ${r} با الکتروسکوپ خنثی، بار از میله به الکتروسکوپ منتقل شد. الکتروسکوپ ${r} شد و تیغه‌ها باز شدند.`;
    if (scenario.rodCharge === scenario.electroscopeCharge)
      return `با تماس میله ${r} با الکتروسکوپ ${e} (هم‌نام)، بار هم‌نام اضافه شد. بار الکتروسکوپ بیشتر شد و تیغه‌ها بیشتر باز شدند.`;
    return `با تماس میله ${r} با الکتروسکوپ ${e} (ناهم‌نام)، بار مخالف وارد شد. بار الکتروسکوپ خنثی یا کاهش یافت و تیغه‌ها بستند.`;
  }

  // Approach
  if (scenario.rodCharge === "neutral")
    return `چون میله خنثی است، نزدیک کردن آن هیچ اثری بر الکتروسکوپ ندارد.`;
  if (scenario.electroscopeCharge === "neutral")
    return `نزدیک کردن میله ${r} به الکتروسکوپ خنثی باعث القا می‌شود. بارهای ناهمنام با میله به کلاهک کشیده می‌شوند (جذب) و بارهای هم‌نام با میله به تیغه‌ها رانده می‌شوند (دفع). تیغه‌ها باز می‌شوند ولی مجموع بار الکتروسکوپ صفر می‌ماند (القا موقتی است).`;

  const sameSign =
    (scenario.rodCharge === "positive" && scenario.electroscopeCharge === "positive") ||
    (scenario.rodCharge === "negative" && scenario.electroscopeCharge === "negative");

  if (sameSign)
    return `نزدیک کردن میله ${r} به الکتروسکوپ ${e} (هم‌نام) باعث القا می‌شود. بارهای ناهمنام میله به کلاهک کشیده می‌شوند (جذب) و بارهای هم‌نام با میله به تیغه‌ها رانده می‌شوند (دفع). چون بار الکتروسکوپ هم‌نام میله است، بار هم‌نام به تیغه‌ها اضافه می‌شود و دفع بیشتر می‌شود. تیغه‌ها بیشتر باز می‌شوند.`;
  return `نزدیک کردن میله ${r} به الکتروسکوپ ${e} (ناهم‌نام) باعث القا می‌شود. بارهای ناهمنام با میله به کلاهک کشیده می‌شوند (جذب) و بارهای هم‌نام با میله به تیغه‌ها رانده می‌شوند (دفع). چون بار الکتروسکوپ ناهمنام میله است، بارهای هم‌نام میله علامت مخالف بار اولیه الکتروسکوپ دارند و با آن خنثی می‌شوند. در نتیجه بار خالص تیغه‌ها کاهش می‌یابد. تیغه‌ها کمتر باز می‌شوند یا می‌بندند.`;
}

// ===== Main Question Generator =====

export function generateQuestion(): GeneratedQuestion {
  // Keep generating until we get a non-ambiguous scenario
  let scenario: ExperimentScenario;
  let result: PhysicsResult;
  let attempts = 0;

  do {
    scenario = generateScenario();
    result = runPhysics(scenario);
    attempts++;
  } while (isAmbiguous(scenario, result) && attempts < 10);

  // Choose question type — filter out types that don't work for this scenario
  const validTypes = getValidQuestionTypes(scenario, result);

  let questionType: QuestionType;
  if (Math.random() < 0.12) {
    questionType = "find-error";
  } else {
    questionType = randomChoice(validTypes.filter((t) => t !== "find-error"));
  }

  return buildQuestion(questionType, scenario, result);
}

function isAmbiguous(scenario: ExperimentScenario, result: PhysicsResult): boolean {
  // Don't generate scenarios where the result is ambiguous:
  // 1. Neutral rod + charged electroscope + approach → "no-change" (trivial/boring)
  // 2. Far distance → "no-change" (trivial)
  // 3. Neutral electroscope + charged rod + contact → can't distinguish rod sign from behavior
  if (scenario.rodCharge === "neutral" && scenario.electroscopeCharge !== "neutral" && scenario.experimentType === "approach")
    return true;
  if (scenario.finalDistance === "far" && scenario.experimentType === "approach")
    return true;
  return false;
}

function getValidQuestionTypes(scenario: ExperimentScenario, result: PhysicsResult): QuestionType[] {
  const types: QuestionType[] = [
    "predict-result",
    "analyze-cause",
  ];

  // identify-experiment-type: only if the behavior DIFFERS between approach and contact.
  // For neutral electroscope: both approach and contact → leaves open → AMBIGUOUS
  // For charged electroscope: approach and contact give DIFFERENT results → clear
  if (scenario.electroscopeCharge !== "neutral" && scenario.rodCharge !== "neutral") {
    types.push("identify-experiment-type");
  }

  // identify-rod-charge: only if the behavior UNAMBIGUOUSLY identifies the rod charge.
  // "open-more" → same sign (clear), "close-fully" → opposite sign with enough charge (clear)
  // "open-less" → AMBIGUOUS: could be opposite sign OR neutral conductor sharing charge
  // "stay-open" → AMBIGUOUS on neutral electroscope (either sign gives same result)
  // "no-change" → AMBIGUOUS (could be neutral or charged with insufficient magnitude)
  if (scenario.rodCharge !== "neutral" && scenario.electroscopeCharge !== "neutral" &&
      (result.leafActionKey === "open-more" || result.leafActionKey === "close-fully")) {
    types.push("identify-rod-charge");
  }

  // identify-electroscope-charge: only if behavior uniquely identifies it
  // Same logic: only when the result is unambiguous
  if (scenario.electroscopeCharge !== "neutral" && scenario.rodCharge !== "neutral" &&
      (result.leafActionKey === "open-more" || result.leafActionKey === "close-fully")) {
    types.push("identify-electroscope-charge");
  }

  // predict-continuation: only for approach (not contact), not at "near" already
  if (scenario.experimentType === "approach" && scenario.finalDistance !== "near") {
    types.push("predict-continuation");
  }

  return types;
}

function buildQuestion(
  type: QuestionType,
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  switch (type) {
    case "predict-result": return buildPredictResult(scenario, result);
    case "identify-rod-charge": return buildIdentifyRodCharge(scenario, result);
    case "identify-electroscope-charge": return buildIdentifyElectroscopeCharge(scenario, result);
    case "identify-experiment-type": return buildIdentifyExperimentType(scenario, result);
    case "analyze-cause": return buildAnalyzeCause(scenario, result);
    case "predict-continuation": return buildPredictContinuation(scenario, result);
    case "find-error": return buildFindError(scenario, result);
  }
}

// ===== Question Builders (improved) =====

function buildPredictResult(
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  const e = chargeLabel(scenario.electroscopeCharge);
  const r = chargeLabel(scenario.rodCharge);
  const exp = scenario.experimentType === "contact" ? "تماس می‌دهیم" : "نزدیک می‌کنیم (بدون تماس)";
  const mag = magnitudeLabel(scenario.rodMagnitude);

  const questionText = `الکتروسکوپی داریم که بار اولیه‌اش ${e} است. یک میله با بار ${r} (با شدت ${mag}) می‌گیریم و آن را به کلاهک الکتروسکوپ ${exp}. پس از این کار، وضعیت تیغه‌های الکتروسکوپ چه تغییری می‌کند؟`;

  // Only include options that are physically distinct for this scenario
  const allOptions = [
    { value: "open-more", label: "تیغه‌ها بیشتر از قبل باز می‌شوند" },
    { value: "open-less", label: "تیغه‌ها کمتر از قبل باز می‌شوند (نیمه‌باز)" },
    { value: "close-fully", label: "تیغه‌ها کاملاً بسته می‌شوند" },
    { value: "no-change", label: "تیغه‌ها هیچ تغییری نمی‌کنند" },
    { value: "stay-open", label: "تیغه‌ها باز می‌شوند و باز می‌مانند" },
  ];

  // Filter to 4 most relevant options (always include correct + 3 distractors)
  const correctOpt = allOptions.find((o) => o.value === result.leafActionKey)!;
  const distractors = shuffle(allOptions.filter((o) => o.value !== result.leafActionKey)).slice(0, 3);
  const options = shuffle([correctOpt, ...distractors]);

  // Generate wrong explanations
  const wrongExplanations: Record<string, string> = {};
  if (result.leafActionKey !== "open-more") wrongExplanations["open-more"] = "تیغه‌ها بیشتر باز نمی‌شوند، چون بار هم‌نام به تیغه‌ها اضافه نشده است.";
  if (result.leafActionKey !== "open-less") wrongExplanations["open-less"] = "تیغه‌ها کمتر باز نمی‌شوند، چون بار تیغه‌ها کاهش نیافته است.";
  if (result.leafActionKey !== "close-fully") wrongExplanations["close-fully"] = "تیغه‌ها کاملاً بسته نمی‌شوند، چون بار الکتروسکوپ کاملاً خنثی نشده است.";
  if (result.leafActionKey !== "no-change") wrongExplanations["no-change"] = "تیغه‌ها تغییر می‌کنند، چون میله باردار است و بر الکتروسکوپ اثر می‌گذارد.";
  if (result.leafActionKey !== "stay-open") wrongExplanations["stay-open"] = "این رفتار فقط زمانی رخ می‌دهد که الکتروسکوپ خنثی باشد و با تماس بار بگیرد، که در این سناریو صدق نمی‌کند.";

  return {
    type: "predict-result", scenario, result, questionText, options,
    correctAnswer: result.leafActionKey,
    explanation: result.explanation,
    wrongExplanations,
  };
}

function buildIdentifyRodCharge(
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  const e = chargeLabel(scenario.electroscopeCharge);
  const exp = scenario.experimentType === "contact" ? "تماس داده" : "نزدیک کرده";
  const action = result.leafAction;

  const questionText = `الکتروسکوپی با بار اولیه ${e} داریم. میله‌ای را به آن ${exp}‌ایم و مشاهده کردیم که ${action}. با توجه به این رفتار، بار میله چه بوده است؟`;

  // For a charged electroscope + charged rod, the behavior uniquely identifies same/opposite sign
  // The correct answer is the rod's actual charge
  const correct = scenario.rodCharge;
  const options = shuffle([
    { value: "positive", label: "مثبت (+)" },
    { value: "negative", label: "منفی (−)" },
    { value: "neutral", label: "خنثی" },
  ]);

  // Wrong explanations
  const otherCharges = ["positive", "negative", "neutral"].filter((c) => c !== correct);
  const wrongExplanations: Record<string, string> = {};
  otherCharges.forEach((c) => {
    if (c === "neutral") wrongExplanations[c] = "اگر میله خنثی بود، با تماس بار منتقل نمی‌شد و تیغه‌ها تغییری نمی‌کردند، یا در نزدیک کردن هیچ القایی رخ نمی‌داد.";
    else if (c === scenario.electroscopeCharge) wrongExplanations[c] = `اگر میله ${chargeLabel(c)} (هم‌نام) بود، بار هم‌نام به تیغه‌ها اضافه می‌شد و تیغه‌ها بیشتر باز می‌شدند، نه ${action}.`;
    else wrongExplanations[c] = `اگر میله ${chargeLabel(c)} (ناهم‌نام) بود، رفتار متفاوتی مشاهده می‌کردیم.`;
  });

  return {
    type: "identify-rod-charge", scenario, result, questionText, options,
    correctAnswer: correct,
    explanation: `${result.explanation} بار میله ${chargeLabel(scenario.rodCharge)} بود.`,
    wrongExplanations,
  };
}

function buildIdentifyElectroscopeCharge(
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  const r = chargeLabel(scenario.rodCharge);
  const exp = scenario.experimentType === "contact" ? "تماس داده" : "نزدیک کرده";
  const action = result.leafAction;

  const questionText = `میله‌ای با بار ${r} را به الکتروسکوپی ${exp}‌ایم و مشاهده کردیم که ${action}. با توجه به این رفتار، بار اولیه الکتروسکوپ چه بوده است؟`;

  const options = shuffle([
    { value: "positive", label: "مثبت (+)" },
    { value: "negative", label: "منفی (−)" },
    { value: "neutral", label: "خنثی" },
  ]);

  // Wrong explanations
  const correctCharge = scenario.electroscopeCharge;
  const wrongExplanations: Record<string, string> = {};
  ["positive", "negative", "neutral"].filter((c) => c !== correctCharge).forEach((c) => {
    if (c === "neutral") wrongExplanations[c] = "اگر الکتروسکوپ خنثی بود، با نزدیک کردن میله باردار فقط القا رخ می‌داد و با دور کردن میله تیغه‌ها می‌بستند، یا با تماس بار همان میله را می‌گرفت — رفتار متفاوتی مشاهده می‌کردیم.";
    else if (c === scenario.rodCharge) wrongExplanations[c] = `اگر الکتروسکوپ ${chargeLabel(c)} (هم‌نام میله) بود، تیغه‌ها بیشتر باز می‌شدند، نه ${action}.`;
    else wrongExplanations[c] = `اگر الکتروسکوپ ${chargeLabel(c)} (ناهم‌نام میله) بود، رفتار متفاوتی مشاهده می‌کردیم.`;
  });

  return {
    type: "identify-electroscope-charge", scenario, result, questionText, options,
    correctAnswer: scenario.electroscopeCharge,
    explanation: `${result.explanation} بار اولیه الکتروسکوپ ${chargeLabel(scenario.electroscopeCharge)} بود.`,
    wrongExplanations,
  };
}

function buildIdentifyExperimentType(
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  const e = chargeLabel(scenario.electroscopeCharge);
  const r = chargeLabel(scenario.rodCharge);
  const action = result.leafAction;

  const questionText = `الکتروسکوپی با بار ${e} داریم. میله‌ای با بار ${r} را به کلاهک آن نزدیک کردیم و مشاهده کردیم: ${action}. با توجه به این نتیجه، آیا میله با کلاهک تماس پیدا کرده بود یا فقط نزدیک شده بود؟`;

  const options = shuffle([
    { value: "approach", label: "فقط نزدیک شده بود (القا، بدون تماس فیزیکی)" },
    { value: "contact", label: "تماس فیزیکی پیدا کرده بود (انتقال بار)" },
  ]);

  // Wrong explanations
  const wrongExplanations: Record<string, string> = {};
  if (scenario.experimentType === "contact") {
    wrongExplanations["approach"] = "اگر فقط نزدیک شده بود (القا بدون تماس)، بار الکتروسکوپ تغییر نمی‌کرد و با دور کردن میله تیغه‌ها به حالت اول برمی‌گشتند. اما در این آزمایش بار الکتروسکوپ تغییر کرده است، پس حتماً تماس رخ داده.";
  } else {
    wrongExplanations["contact"] = "اگر تماس فیزیکی رخ داده بود، بار از میله به الکتروسکوپ منتقل می‌شد و با دور کردن میله تیغه‌ها باز می‌ماندند. اما در این آزمایش بار الکتروسکوپ تغییر نکرده (القا موقتی است)، پس تماسی وجود نداشته.";
  }

  return {
    type: "identify-experiment-type", scenario, result, questionText, options,
    correctAnswer: scenario.experimentType,
    explanation: `${result.explanation} نوع آزمایش ${scenario.experimentType === "contact" ? "تماس فیزیکی" : "نزدیک کردن بدون تماس"} بود.`,
    wrongExplanations,
  };
}

function buildAnalyzeCause(
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  const e = chargeLabel(scenario.electroscopeCharge);
  const r = chargeLabel(scenario.rodCharge);
  const exp = scenario.experimentType === "contact" ? "تماس داده" : "نزدیک کرده";
  const action = result.leafAction;

  const questionText = `الکتروسکوپی با بار ${e} داریم. میله ${r} را به آن ${exp}‌ایم و ${action}. دلیل علمی این رفتار چیست؟`;

  const correctLabel = getCauseLabel(scenario);
  const wrongs = getWrongCauses(scenario);

  const options = shuffle([
    { value: "correct", label: correctLabel },
    ...wrongs,
  ]);

  // Wrong explanations for analyze-cause
  const wrongExplanations: Record<string, string> = {};
  wrongs.forEach((w) => {
    wrongExplanations[w.value] = `«${w.label}» درست نیست. ${result.explanation}`;
  });

  return {
    type: "analyze-cause", scenario, result, questionText, options,
    correctAnswer: "correct",
    explanation: result.explanation,
    wrongExplanations,
  };
}

function getCauseLabel(scenario: ExperimentScenario): string {
  if (scenario.experimentType === "contact") {
    if (scenario.rodCharge === "neutral") return "میله خنثی است و بار الکتریکی منتقل نمی‌شود";
    return "بار از میله به الکتروسکوپ منتقل شده است (انتقال بار با تماس)";
  }
  if (scenario.rodCharge === "neutral") return "میله خنثی است و هیچ اثری بر الکتروسکوپ ندارد";
  if (scenario.electroscopeCharge === "neutral") return "القا: بارهای ناهمنام با میله به کلاهک کشیده شده و بارهای هم‌نام با میله به تیغه‌ها رانده شده‌اند";

  const sameSign =
    (scenario.rodCharge === "positive" && scenario.electroscopeCharge === "positive") ||
    (scenario.rodCharge === "negative" && scenario.electroscopeCharge === "negative");

  if (sameSign) return "القا: بارهای ناهمنام با میله به کلاهک کشیده شده و بارهای هم‌نام با میله به تیغه‌ها رانده شده‌اند (دفع بیشتر)";
  return "القا: بارهای ناهمنام با میله به کلاهک کشیده شده و بارهای هم‌نام با میله به تیغه‌ها رانده شده‌اند (خنثی‌سازی بار تیغه)";
}

function getWrongCauses(scenario: ExperimentScenario): { value: string; label: string }[] {
  const wrongs: { value: string; label: string }[] = [];

  if (scenario.experimentType === "contact") {
    wrongs.push({ value: "w1", label: "القا بدون تماس باعث باز شدن تیغه‌ها شد" });
    wrongs.push({ value: "w2", label: "بار از الکتروسکوپ به میله برگشت" });
    wrongs.push({ value: "w3", label: "الکتروسکوپ زمین شد و بار خنثی شد" });
  } else {
    wrongs.push({ value: "w1", label: "تماس فیزیکی باعث انتقال بار شد" });
    wrongs.push({ value: "w2", label: "میله رسانا بود و بار از دست شما خنثی شد" });
    wrongs.push({ value: "w3", label: "الکتروسکوپ با زمین وصل شد" });
  }

  return shuffle(wrongs).slice(0, 3);
}

function buildPredictContinuation(
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  const e = chargeLabel(scenario.electroscopeCharge);
  const r = chargeLabel(scenario.rodCharge);
  const dist = distanceLabel(scenario.finalDistance);
  const action = result.leafAction;

  const questionText = `الکتروسکوپی با بار ${e} داریم. میله ${r} را تا فاصله ${dist} (بدون تماس) نزدیک کرده‌ایم و مشاهده کردیم: ${action}. اگر میله را کمی نزدیک‌تر کنیم (اما هنوز تماس ندهیم)، چه اتفاقی رخ می‌دهد؟`;

  const sameSign =
    (scenario.rodCharge === "positive" && scenario.electroscopeCharge === "positive") ||
    (scenario.rodCharge === "negative" && scenario.electroscopeCharge === "negative");

  let correctAnswer: string;
  let correctLabel: string;

  if (scenario.electroscopeCharge === "neutral") {
    correctAnswer = "open-more";
    correctLabel = "تیغه‌ها بیشتر باز می‌شوند (شدت القا بیشتر می‌شود)";
  } else if (sameSign) {
    correctAnswer = "open-more";
    correctLabel = "تیغه‌ها بیشتر باز می‌شوند (دفع بار هم‌نام بیشتر می‌شود)";
  } else {
    correctAnswer = "close-fully";
    correctLabel = "تیغه‌ها کاملاً بسته می‌شوند (کاهش بار تیغه شدیدتر می‌شود)";
  }

  const options = shuffle([
    { value: correctAnswer, label: correctLabel },
    { value: "reverse", label: "تیغه‌ها کمتر باز می‌شوند (برعکس می‌شود)" },
    { value: "no-change", label: "هیچ تغییری نمی‌کنند (فاصله مهم نیست)" },
  ]);

  // Wrong explanations
  const wrongExplanations: Record<string, string> = {};
  if (correctAnswer === "open-more") {
    wrongExplanations["reverse"] = "تیغه‌ها کمتر باز نمی‌شوند — نزدیک‌تر کردن میله، شدت القا را افزایش می‌دهد، نه کاهش.";
    wrongExplanations["no-change"] = "فاصله بسیار مهم است — هرچه میله نزدیک‌تر باشد، میدان الکتریکی قوی‌تر و القا بیشتر می‌شود.";
  } else {
    wrongExplanations["reverse"] = "تیغه‌ها بیشتر باز نمی‌شوند — نزدیک‌تر کردن میله ناهم‌نام، بار تیغه‌ها را بیشتر کاهش می‌دهد.";
    wrongExplanations["no-change"] = "فاصله بسیار مهم است — هرچه میله نزدیک‌تر باشد، میدان الکتریکی قوی‌تر و اثر القا بیشتر می‌شود.";
  }

  return {
    type: "predict-continuation", scenario, result, questionText, options,
    correctAnswer,
    explanation: `نزدیک‌تر کردن میله، شدت میدان الکتریکی و در نتیجه شدت القا را افزایش می‌دهد. ${result.explanation}`,
    wrongExplanations,
  };
}

function buildFindError(
  scenario: ExperimentScenario,
  result: PhysicsResult
): GeneratedQuestion {
  const wrongActions: LeafAction[] = ["open-more", "open-less", "close-fully", "no-change", "stay-open"];
  const wrongAction = randomChoice(wrongActions.filter((a) => a !== result.leafActionKey));

  const e = chargeLabel(scenario.electroscopeCharge);
  const r = chargeLabel(scenario.rodCharge);
  const exp = scenario.experimentType === "contact" ? "تماس داده" : "نزدیک کرده";
  const wrongText = leafActionText(wrongAction);

  const questionText = `دانش‌آموزی گفته: «الکتروسکوپی با بار ${e} داریم. میله ${r} را به آن ${exp}‌ام و ${wrongText}.» کدام بخش این گفته با قوانین فیزیک سازگار نیست؟`;

  const options = shuffle([
    { value: "rod-charge", label: `بار میله (${r})` },
    { value: "electroscope-charge", label: `بار الکتروسکوپ (${e})` },
    { value: "experiment-type", label: `نوع آزمایش (${scenario.experimentType === "contact" ? "تماس" : "نزدیک کردن"})` },
    { value: "result", label: `نتیجه (${wrongText})` },
  ]);

  // Wrong explanations for the non-error options
  const wrongExplanations: Record<string, string> = {};
  wrongExplanations["rod-charge"] = `بار میله (${r}) درست است — این مقدار با قوانین فیزیک سازگار است. مشکل در جای دیگری است.`;
  wrongExplanations["electroscope-charge"] = `بار الکتروسکوپ (${e}) درست است — این مقدار با قوانین فیزیک سازگار است. مشکل در جای دیگری است.`;
  wrongExplanations["experiment-type"] = `نوع آزمایش (${scenario.experimentType === "contact" ? "تماس" : "نزدیک کردن"}) درست است. مشکل در جای دیگری است.`;

  return {
    type: "find-error", scenario, result, questionText, options,
    correctAnswer: "result",
    explanation: `نتیجه «${wrongText}» نادرست است. رفتار صحیح باید این باشد: ${result.leafAction}. ${result.explanation}`,
    wrongExplanations,
    isErrorScenario: true,
    errorDescription: `نتیجه باید «${result.leafAction}» باشد، نه «${wrongText}»`,
  };
}

// ===== Helpers =====

function chargeLabel(charge: ChargeLevel): string {
  if (charge === "positive") return "مثبت";
  if (charge === "negative") return "منفی";
  return "خنثی";
}

function magnitudeLabel(mag: ChargeMagnitude): string {
  if (mag === "low") return "کم";
  if (mag === "medium") return "متوسط";
  return "زیاد";
}

function distanceLabel(dist: DistanceLevel): string {
  if (dist === "far") return "دور";
  if (dist === "medium") return "متوسط";
  if (dist === "near") return "نزدیک";
  return "تماس";
}

function leafActionText(action: LeafAction): string {
  switch (action) {
    case "open-more": return "تیغه‌ها بیشتر باز می‌شوند";
    case "open-less": return "تیغه‌ها کمتر باز می‌شوند";
    case "close-fully": return "تیغه‌ها کاملاً بسته می‌شوند";
    case "no-change": return "هیچ تغییری نمی‌کنند";
    case "stay-open": return "تیغه‌ها باز می‌شوند و باز می‌مانند";
  }
}
