"use client";

import { create } from "zustand";
import {
  RodMaterial,
  ClothMaterial,
  rubMaterials,
  SimSnapshot,
  computeElectroscope,
  ElectroscopePhysics,
} from "./sim-physics";
import {
  MissionObject,
  MissionPhase,
  genMissionObjects,
  getCorrectAnswer,
} from "./sim-content";
import {
  GeneratedQuestion,
  generateQuestion,
} from "./sim-content-dynamic";

export type View = "lab" | "sim" | "missions" | "questions";

export interface MissionState {
  active: boolean;
  missionId: 1 | 2 | 3 | null;
  phase: MissionPhase;
  objects: MissionObject[];
  currentIndex: number;
  prediction: string | null;
  tested: Record<string, { prediction: string; correct: boolean }>;
  experimentReady: boolean; // user has interacted enough to observe
  observed: boolean;
}


export interface PredictionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FeedbackEntry {
  id: string;
  kind: "info" | "question" | "success" | "warning";
  title: string;
  body: string;
  ts: number;
}

export interface ObjectiveProgress {
  id: string;
  title: string;
  done: boolean;
}

interface SimState {
  // navigation
  view: View;
  setView: (v: View) => void;
  showDashboard: boolean;
  toggleDashboard: () => void;

  // lab
  selectedRod: RodMaterial | null;
  selectedCloth: ClothMaterial | null;
  rubProgress: number; // 0..100
  rodCharge: number; // charged rod available to use (-1..1)
  rodIsConductor: boolean;
  clothCharge: number;
  electronsFrom: "rod" | "cloth" | null;
  rubMagnitude: number;
  rubWarning: string | null;

  selectRod: (r: RodMaterial) => void;
  selectCloth: (c: ClothMaterial) => void;
  doRub: (delta: number) => void;
  resetLab: () => void;

  // simulator
  externalRodPresent: boolean; // rod has been moved into the hall
  externalRodDistance: number; // 0 touch .. 1 far
  isContact: boolean;
  isGrounded: boolean;
  netCharge: number; // electroscope net charge
  groundedDuringInduction: boolean;
  inductionRodSign: number;

  bringRodToHall: () => void;
  takeRodBack: () => void;
  setDistance: (d: number) => void;
  setContact: (c: boolean) => void;
  toggleGround: () => void;
  resetElectroscope: () => void;
  fullReset: () => void;

  // display options
  showCharges: boolean; // educational mode (show +/- on rods/electroscope)
  showDegreeMarks: boolean; // show/hide degree numbers on scale
  slowMotion: boolean;
  showEnergyBar: boolean;

  toggleShowCharges: () => void;
  toggleShowDegreeMarks: () => void;
  toggleSlowMotion: () => void;
  toggleEnergyBar: () => void;

  // missions
  mission: MissionState;
  startMission: (id: 1 | 2 | 3) => void;
  exitMission: () => void;
  missionSelectObject: (objectId: string) => void;
  missionSetPrediction: (prediction: string) => void;
  missionObserveResult: () => void;
  missionNextObject: () => void;
  missionResetExperiment: () => void;

  // dynamic questions
  currentQuestion: GeneratedQuestion | null;
  questionAnswered: boolean;
  questionSelectedAnswer: string | null;
  questionCorrectCount: number;
  questionWrongCount: number;
  questionTotalCount: number;
  questionHistory: { question: GeneratedQuestion; selectedAnswer: string; correct: boolean }[];
  questionHistoryIndex: number;
  questionPracticeEnded: boolean;
  generateNewQuestion: () => void;
  answerQuestion: (answer: string) => void;
  goToPreviousQuestion: () => void;
  goToNextQuestion: () => void;
  endQuestionPractice: () => void;
  resetQuestionPractice: () => void;

  // learning
  feedback: FeedbackEntry[];
  pushFeedback: (f: Omit<FeedbackEntry, "id" | "ts">) => void;
  clearFeedback: () => void;
  predictionsAnswered: Record<string, number | null>;
  answerPrediction: (id: string, idx: number) => void;
  objectives: ObjectiveProgress[];
  markObjective: (id: string) => void;
  objectiveQuizAnswered: Record<string, number | null>;
  answerObjectiveQuiz: (id: string, idx: number, correctIdx: number) => void;

  // derived
  getPhysics: () => ElectroscopePhysics;
  getSnapshot: () => SimSnapshot;

  // intro
  introSeen: boolean;
  skipIntro: () => void;
}

const initialObjectives: ObjectiveProgress[] = [
  { id: "obj-rub", title: "باردار کردن میله با مالش", done: false },
  { id: "obj-direction", title: "درک جهت حرکت الکترون‌ها", done: false },
  { id: "obj-induction", title: "پدیده القا بدون تماس", done: false },
  { id: "obj-distance", title: "اثر فاصله بر شدت القا", done: false },
  { id: "obj-contact", title: "انتقال بار با تماس", done: false },
  { id: "obj-remove", title: "باز ماندن تیغه پس از دور کردن میله", done: false },
  { id: "obj-ground", title: "زمین کردن الکتروسکوپ باردار", done: false },
  { id: "obj-induction-charge", title: "باردار کردن با القا (بار مخالف)", done: false },
  { id: "obj-conductor", title: "شناخت رسانای فلزی", done: false },
];

export const useSimStore = create<SimState>((set, get) => ({
  view: "lab",
  setView: (v) => set({ view: v }),
  showDashboard: true,
  toggleDashboard: () => set((s) => ({ showDashboard: !s.showDashboard })),

  // lab
  selectedRod: null,
  selectedCloth: null,
  rubProgress: 0,
  rodCharge: 0,
  rodIsConductor: false,
  clothCharge: 0,
  electronsFrom: null,
  rubMagnitude: 0,
  rubWarning: null,

  selectRod: (r) =>
    set({ selectedRod: r, rubProgress: 0, rodCharge: 0, clothCharge: 0, rubWarning: null }),
  selectCloth: (c) =>
    set({ selectedCloth: c, rubProgress: 0, rodCharge: 0, clothCharge: 0, rubWarning: null }),

  doRub: (delta) => {
    const { selectedRod, selectedCloth, rubProgress, rubMagnitude } = get();
    if (!selectedRod || !selectedCloth) return;
    const np = Math.min(100, rubProgress + delta);
    const result = rubMaterials(selectedRod, selectedCloth);
    const newWarning = result.rodIsConductor
      ? "فلز رساناست! بار از طریق دست شما خنثی می‌شود. از میله عایق استفاده کنید."
      : null;
    set({
      rubProgress: np,
      rodCharge: result.rodCharge * (np / 100),
      clothCharge: result.clothCharge * (np / 100),
      electronsFrom: result.electronsFrom,
      rubMagnitude: result.magnitude * (np / 100),
      rodIsConductor: result.rodIsConductor,
      rubWarning: newWarning,
    });
    // objective: charged a rod
    if (np > 60 && !result.rodIsConductor) {
      get().markObjective("obj-rub");
      if (result.electronsFrom) get().markObjective("obj-direction");
    }
    if (result.rodIsConductor) get().markObjective("obj-conductor");
    // Socratic nudge when first charged
    if (rubProgress < 30 && np >= 50) {
      get().pushFeedback({
        kind: "success",
        title: "میله باردار شد!",
        body:
          result.rodCharge > 0
            ? "میله بار مثبت گرفت (الکترون از آن به پارچه رفت). حالا آن را به سالن الکتروسکوپ ببر."
            : "میله بار منفی گرفت (الکترون از پارچه به آن رفت). حالا آن را به سالن الکتروسکوپ ببر.",
      });
    }
  },

  resetLab: () =>
    set({
      rubProgress: 0,
      rodCharge: 0,
      clothCharge: 0,
      electronsFrom: null,
      rubMagnitude: 0,
      rubWarning: null,
    }),

  // simulator
  externalRodPresent: false,
  externalRodDistance: 0.6,
  isContact: false,
  isGrounded: false,
  netCharge: 0,
  groundedDuringInduction: false,
  inductionRodSign: 0,

  bringRodToHall: () => {
    const { rodCharge, rodIsConductor } = get();
    if (rodIsConductor) {
      get().pushFeedback({
        kind: "warning",
        title: "میله فلزی نمی‌تواند باردار بماند",
        body: "چون فلز رساناست، بار از دست شما خنثی شده. یک میله نارسانا (شیشه/ابونیت/پلاستیک/اکریلیک) را مالش بده.",
      });
      return;
    }
    if (Math.abs(rodCharge) < 0.02) {
      get().pushFeedback({
        kind: "warning",
        title: "میله خنثی است",
        body: "ابتدا میله را در کارگاه مالش بده تا باردار شود.",
      });
      return;
    }
    set({
      externalRodPresent: true,
      externalRodDistance: 0.6,
      isContact: false,
      inductionRodSign: Math.sign(rodCharge),
    });
    // rod is now near and inducing (distance 0.6 => induction active)
    get().markObjective("obj-induction");
    get().pushFeedback({
      kind: "question",
      title: "پیش‌بینی کنید",
      body:
        rodCharge > 0
          ? "اگر میله مثبت را به کلاهک نزدیک کنیم (بدون تماس)، تیغه چه می‌کند؟ چرا؟"
          : "اگر میله منفی را به کلاهک نزدیک کنیم (بدون تماس)، تیغه چه می‌کند؟ چرا؟",
    });
  },

  takeRodBack: () => {
    const s = get();
    const phys = s.getPhysics();
    // when removing the rod:
    // - if was inducing (net 0): returns to neutral, leaves close
    // - if contact-charged: leaves stay open
    // - if induction-charged (grounded during induction): leaves reopen
    set({
      externalRodPresent: false,
      isContact: false,
      inductionRodSign: 0,
    });
    if (phys.state === "induced") {
      get().pushFeedback({
        kind: "info",
        title: "میله دور شد",
        body: "چون تماس نداشتیم، الکتروسکوپ خنثی ماند و تیغه بسته شد. القا موقتی است.",
      });
    } else if (s.netCharge !== 0 && s.groundedDuringInduction) {
      get().pushFeedback({
        kind: "success",
        title: "سحر القا!",
        body:
          "تیغه دوباره باز شد، اما بار الکتروسکوپ این بار مخالف میله اولیه است. این باردار کردن با القا بود.",
      });
      get().markObjective("obj-induction-charge");
    } else if (s.netCharge !== 0) {
      get().pushFeedback({
        kind: "question",
        title: "چرا تیغه باز ماند؟",
        body: "میله را دور کردی ولی تیغه باز است. بار با تماس منتقل شده و روی الکتروسکوپ ماند.",
      });
      get().markObjective("obj-remove");
    }
  },

  setDistance: (d) => {
    const clamped = Math.max(0, Math.min(1, d));
    const prev = get().externalRodDistance;
    const wasContact = get().isContact;
    const nowContact = clamped <= 0.03;
    const s = get();
    set({ externalRodDistance: clamped, isContact: nowContact });
    // charge transfer on first touch
    if (nowContact && !wasContact) {
      // Mission 3 special: conductor discharges electroscope, insulator doesn't
      if (s.mission.active && s.mission.missionId === 3) {
        if (s.rodIsConductor) {
          // Conductor: charge flows through to the object/ground → electroscope discharges
          set({ netCharge: 0 });
        }
        // Insulator: no charge transfer, leaf stays open (netCharge unchanged)
      } else if (s.mission.active && s.mission.missionId === 2) {
        // Mission 2: induction only — NO contact charge transfer
        // (the rod approaches but should not transfer charge on contact)
      } else {
        // Normal mode or mission 1: transfer rod charge to electroscope
        set({ netCharge: get().rodCharge });
        get().markObjective("obj-contact");
        get().pushFeedback({
          kind: "success",
          title: "تماس!",
          body: "بار از میله به الکتروسکوپ منتقل شد. حالا میله را دور کن و ببین تیغه باز می‌ماند.",
        });
      }
    }
    const phys = get().getPhysics();
    if (phys.inductionActive) {
      get().markObjective("obj-induction");
      // distance effect objective
      if (Math.abs(prev - clamped) > 0.15) get().markObjective("obj-distance");
    }
  },

  setContact: (c) => {
    set({ isContact: c });
    if (c) {
      set({ netCharge: get().rodCharge });
      get().markObjective("obj-contact");
    }
  },

  toggleGround: () => {
    const s = get();
    const willGround = !s.isGrounded;
    const phys = s.getPhysics();
    if (willGround) {
      // if inducing (rod near, net 0), set flag for induction charging
      if (phys.state === "induced") {
        set({
          isGrounded: true,
          groundedDuringInduction: true,
          // during grounding while inducing, charges of same sign as rod drain
          // net charge becomes opposite of rod sign
          netCharge: -s.inductionRodSign * Math.min(1, Math.abs(s.rodCharge)),
        });
        get().pushFeedback({
          kind: "info",
          title: "زمین شد (در حال القا)",
          body: "بارهای هم‌نام با میله به زمین رفتند. تیغه بسته شد. حالا سیم زمین را قطع کن و بعد میله را دور کن.",
        });
      } else {
        // grounding a charged electroscope (contact or induction charged) -> neutralizes
        set({ isGrounded: true, netCharge: 0, groundedDuringInduction: false });
        if (Math.abs(s.netCharge) > 0.01) {
          get().pushFeedback({
            kind: "success",
            title: "الکتروسکوپ زمین شد",
            body: "بار اضافی به زمین رفت و تیغه بسته شد.",
          });
          get().markObjective("obj-ground");
        }
      }
    } else {
      // removing ground
      set({ isGrounded: false });
    }
  },

  resetElectroscope: () =>
    set({
      netCharge: 0,
      isGrounded: false,
      isContact: false,
      groundedDuringInduction: false,
      inductionRodSign: 0,
      externalRodDistance: 0.6,
    }),

  fullReset: () =>
    set({
      view: "lab",
      selectedRod: null,
      selectedCloth: null,
      rubProgress: 0,
      rodCharge: 0,
      clothCharge: 0,
      electronsFrom: null,
      rubMagnitude: 0,
      rubWarning: null,
      rodIsConductor: false,
      externalRodPresent: false,
      externalRodDistance: 0.6,
      isContact: false,
      isGrounded: false,
      netCharge: 0,
      groundedDuringInduction: false,
      inductionRodSign: 0,
      feedback: [],
      predictionsAnswered: {},
      objectiveQuizAnswered: {},
      objectives: initialObjectives.map((o) => ({ ...o, done: false })),
    }),

  // display
  showCharges: true,
  showDegreeMarks: true,
  slowMotion: false,
  showEnergyBar: true,

  toggleShowCharges: () => set((s) => ({ showCharges: !s.showCharges })),
  toggleShowDegreeMarks: () => set((s) => ({ showDegreeMarks: !s.showDegreeMarks })),
  toggleSlowMotion: () => set((s) => ({ slowMotion: !s.slowMotion })),
  toggleEnergyBar: () => set((s) => ({ showEnergyBar: !s.showEnergyBar })),

  // missions
  mission: {
    active: false,
    missionId: null,
    phase: "selection",
    objects: [],
    currentIndex: 0,
    prediction: null,
    tested: {},
    experimentReady: false,
    observed: false,
  },

  startMission: (id) => {
    const objects = genMissionObjects(id);
    // Set up electroscope based on mission type
    if (id === 1) {
      // Mission 1: electroscope starts neutral, user will touch objects
      set({
        view: "missions",
        showCharges: false, // hide charges during mission
        mission: {
          active: true,
          missionId: id,
          phase: "intro",
          objects,
          currentIndex: 0,
          prediction: null,
          tested: {},
          experimentReady: false,
          observed: false,
        },
        // reset electroscope
        netCharge: 0,
        isGrounded: false,
        isContact: false,
        groundedDuringInduction: false,
        inductionRodSign: 0,
        externalRodPresent: false,
        externalRodDistance: 0.6,
      });
    } else if (id === 2) {
      // Mission 2: electroscope pre-charged (randomly + or -)
      // Generate 4 objects: 2 with same-sign charge as electroscope, 2 with opposite.
      // This creates 4 distinct scenarios across a session.
      const eSign = Math.random() > 0.5 ? 1 : -1;
      const preCharge = eSign * 0.7; // moderate charge so induction changes are visible
      // Generate 4 rods: 2 positive, 2 negative (shuffled)
      const rodCharges = eSign > 0
        ? [1, -1, 1, -1] // mix of same and opposite
        : [-1, 1, -1, 1];
      const m2Objects = genMissionObjects(2);
      // Override: create 4 objects with mixed charges
      const m2Names = ["میله A", "میله B", "میله C", "میله D"];
      const m2Emojis = ["❓", "❓", "❓", "❓"];
      const m2RodObjects: MissionObject[] = rodCharges.map((c, i) => ({
        id: `m2-rod-${i}`,
        name: m2Names[i],
        emoji: m2Emojis[i],
        color: "#9ca3af",
        charge: c,
        isConductor: false,
      }));
      // Shuffle the order
      for (let i = m2RodObjects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [m2RodObjects[i], m2RodObjects[j]] = [m2RodObjects[j], m2RodObjects[i]];
      }
      const firstRodCharge = m2RodObjects[0].charge * 1.0;
      set({
        view: "missions",
        showCharges: false, // hide charges during mission
        selectedRod: null,
        rodCharge: firstRodCharge,
        rodIsConductor: false,
        mission: {
          active: true,
          missionId: id,
          phase: "intro",
          objects: m2RodObjects,
          currentIndex: 0,
          prediction: null,
          tested: {},
          experimentReady: false,
          observed: false,
        },
        netCharge: preCharge,
        isGrounded: false,
        isContact: false,
        groundedDuringInduction: false,
        inductionRodSign: 0,
        externalRodPresent: false, // rod appears when user selects one
        externalRodDistance: 0.8,
      });
    } else {
      // Mission 3: electroscope pre-charged (always positive for consistency)
      // The test object will be set when user selects one
      set({
        view: "missions",
        showCharges: false, // hide charges during mission
        mission: {
          active: true,
          missionId: id,
          phase: "intro",
          objects,
          currentIndex: 0,
          prediction: null,
          tested: {},
          experimentReady: false,
          observed: false,
        },
        netCharge: 1.0,
        isGrounded: false,
        isContact: false,
        groundedDuringInduction: false,
        inductionRodSign: 0,
        externalRodPresent: false,
        externalRodDistance: 0.6,
      });
    }
  },

  exitMission: () =>
    set({
      view: "missions",
      showCharges: true, // restore charge visibility
      mission: {
        active: false,
        missionId: null,
        phase: "selection",
        objects: [],
        currentIndex: 0,
        prediction: null,
        tested: {},
        experimentReady: false,
        observed: false,
      },
      // reset electroscope
      netCharge: 0,
      isGrounded: false,
      isContact: false,
      groundedDuringInduction: false,
      inductionRodSign: 0,
      externalRodPresent: false,
      externalRodDistance: 0.6,
    }),

  missionSelectObject: (objectId) => {
    const s = get();
    if (!s.mission.active || !s.mission.missionId) return;
    const obj = s.mission.objects.find((o) => o.id === objectId);
    if (!obj) return;
    const idx = s.mission.objects.findIndex((o) => o.id === objectId);

    if (s.mission.missionId === 1) {
      // Mission 1: set the object as the external rod, start far
      set({
        selectedRod: null,
        rodCharge: obj.charge * 1.0,
        rodIsConductor: false,
        externalRodPresent: true,
        externalRodDistance: 0.5,
        isContact: false,
        mission: {
          ...s.mission,
          currentIndex: idx,
          phase: "prediction",
          prediction: null,
          experimentReady: false,
          observed: false,
        },
      });
    } else if (s.mission.missionId === 2) {
      // Mission 2: set the selected rod as the external rod
      const rodCharge = obj.charge * 1.0;
      set({
        selectedRod: null,
        rodCharge,
        rodIsConductor: false,
        externalRodPresent: true,
        externalRodDistance: 0.8, // start far (induction, no contact)
        isContact: false,
        inductionRodSign: Math.sign(rodCharge),
        mission: {
          ...s.mission,
          currentIndex: idx,
          phase: "prediction",
          prediction: null,
          experimentReady: false,
          observed: false,
        },
      });
    } else {
      // Mission 3: set the object as the external rod for touching
      set({
        selectedRod: null,
        rodCharge: 0, // object itself is neutral
        rodIsConductor: obj.isConductor,
        externalRodPresent: true,
        externalRodDistance: 0.5,
        isContact: false,
        mission: {
          ...s.mission,
          currentIndex: idx,
          phase: "prediction",
          prediction: null,
          experimentReady: false,
          observed: false,
        },
      });
    }
  },

  missionSetPrediction: (prediction) => {
    const s = get();
    if (!s.mission.active) return;
    set({
      mission: { ...s.mission, phase: "experiment", prediction },
    });
    // Push a feedback hint
    get().pushFeedback({
      kind: "info",
      title: "آزمایش را انجام بده",
      body: s.mission.missionId === 1
        ? "جسم را با کشیدن نزدیک کن و تماس بده تا نتیجه را ببینی."
        : s.mission.missionId === 2
          ? "میله را با کشیدن بالا/پایین نزدیک کن (بدون تماس) و رفتار تیغه را ببین."
          : "جسم را با کشیدن نزدیک کن و تماس بده تا ببینی تیغه چه می‌کند.",
    });
  },

  missionObserveResult: () => {
    const s = get();
    if (!s.mission.active || !s.mission.missionId) return;
    const obj = s.mission.objects[s.mission.currentIndex];
    if (!obj || !s.mission.prediction) return;
    const correctAnswer = getCorrectAnswer(s.mission.missionId, obj);
    const correct = s.mission.prediction === correctAnswer;
    set({
      mission: {
        ...s.mission,
        phase: "result",
        observed: true,
        tested: {
          ...s.mission.tested,
          [obj.id]: { prediction: s.mission.prediction, correct },
        },
      },
    });
  },

  missionNextObject: () => {
    const s = get();
    if (!s.mission.active || !s.mission.missionId) return;
    // Check if all objects have been tested
    const allTested = s.mission.objects.every((o) => s.mission.tested[o.id]);
    if (allTested) {
      // All done
      set({ mission: { ...s.mission, phase: "complete" } });
      set({
        externalRodPresent: false,
        isContact: false,
        netCharge: 0,
      });
    } else {
      // Go back to selection for next object
      set({
        mission: {
          ...s.mission,
          phase: "selection",
          prediction: null,
          experimentReady: false,
          observed: false,
        },
        externalRodPresent: false,
        isContact: false,
        // For mission 3, reset electroscope charge for next test
        netCharge: s.mission.missionId === 3 ? 1.0 : (s.mission.missionId === 2 ? s.netCharge : 0),
      });
    }
  },

  missionResetExperiment: () => {
    const s = get();
    if (!s.mission.active) return;
    set({
      externalRodDistance: 0.5,
      isContact: false,
      // For mission 3, reset electroscope charge
      netCharge: s.mission.missionId === 3 ? 0.7 : s.netCharge,
      mission: { ...s.mission, experimentReady: false },
    });
  },

  // dynamic questions
  currentQuestion: null,
  questionAnswered: false,
  questionSelectedAnswer: null,
  questionCorrectCount: 0,
  questionWrongCount: 0,
  questionTotalCount: 0,
  questionHistory: [],
  questionHistoryIndex: -1,
  questionPracticeEnded: false,

  generateNewQuestion: () => {
    const q = generateQuestion();
    const s = get();
    // If we're not at the end of history (user went back), truncate
    const newHistory = s.questionHistoryIndex < s.questionHistory.length - 1
      ? s.questionHistory.slice(0, s.questionHistoryIndex + 1)
      : s.questionHistory;
    set({
      currentQuestion: q,
      questionAnswered: false,
      questionSelectedAnswer: null,
      questionHistory: newHistory,
      questionHistoryIndex: newHistory.length, // will be the new question's index
      questionPracticeEnded: false,
    });
  },

  answerQuestion: (answer) => {
    const s = get();
    if (!s.currentQuestion || s.questionAnswered) return;
    const correct = answer === s.currentQuestion.correctAnswer;
    const historyEntry = {
      question: s.currentQuestion,
      selectedAnswer: answer,
      correct,
    };
    set({
      questionAnswered: true,
      questionSelectedAnswer: answer,
      questionTotalCount: s.questionTotalCount + 1,
      questionCorrectCount: s.questionCorrectCount + (correct ? 1 : 0),
      questionWrongCount: s.questionWrongCount + (correct ? 0 : 1),
      questionHistory: [...s.questionHistory, historyEntry],
    });
  },

  goToPreviousQuestion: () => {
    const s = get();
    if (s.questionHistoryIndex <= 0) return;
    const prevIdx = s.questionHistoryIndex - 1;
    const prevEntry = s.questionHistory[prevIdx];
    if (prevEntry) {
      set({
        currentQuestion: prevEntry.question,
        questionAnswered: true,
        questionSelectedAnswer: prevEntry.selectedAnswer,
        questionHistoryIndex: prevIdx,
      });
    }
  },

  goToNextQuestion: () => {
    const s = get();
    const nextIdx = s.questionHistoryIndex + 1;
    const nextEntry = s.questionHistory[nextIdx];
    if (nextEntry) {
      set({
        currentQuestion: nextEntry.question,
        questionAnswered: true,
        questionSelectedAnswer: nextEntry.selectedAnswer,
        questionHistoryIndex: nextIdx,
      });
    }
  },

  endQuestionPractice: () => {
    set({ questionPracticeEnded: true });
  },

  resetQuestionPractice: () => {
    set({
      currentQuestion: null,
      questionAnswered: false,
      questionSelectedAnswer: null,
      questionCorrectCount: 0,
      questionWrongCount: 0,
      questionTotalCount: 0,
      questionHistory: [],
      questionHistoryIndex: -1,
      questionPracticeEnded: false,
    });
  },

  // learning
  feedback: [],
  pushFeedback: (f) =>
    set((s) => ({
      feedback: [
        { ...f, id: Math.random().toString(36).slice(2), ts: Date.now() },
        ...s.feedback,
      ].slice(0, 30),
    })),
  clearFeedback: () => set({ feedback: [] }),
  predictionsAnswered: {},
  answerPrediction: (id, idx) =>
    set((s) => ({ predictionsAnswered: { ...s.predictionsAnswered, [id]: idx } })),
  objectives: initialObjectives,
  objectiveQuizAnswered: {},

  markObjective: (id) =>
    set((s) => ({
      objectives: s.objectives.map((o) =>
        o.id === id && !o.done ? { ...o, done: true } : o
      ),
    })),

  answerObjectiveQuiz: (id, idx, correctIdx) => {
    set((s) => ({ objectiveQuizAnswered: { ...s.objectiveQuizAnswered, [id]: idx } }));
    // Mark objective done when quiz answered correctly
    if (idx === correctIdx) {
      get().markObjective(id);
    }
  },

  getSnapshot: (): SimSnapshot => {
    const s = get();
    return {
      externalRodCharge: s.externalRodPresent ? s.rodCharge : 0,
      externalRodPresent: s.externalRodPresent,
      externalRodDistance: s.externalRodDistance,
      netCharge: s.netCharge,
      isGrounded: s.isGrounded,
      isContact: s.isContact,
      groundedDuringInduction: s.groundedDuringInduction,
      inductionRodSign: s.inductionRodSign,
    };
  },

  getPhysics: () => computeElectroscope(get().getSnapshot()),

  introSeen: false,
  skipIntro: () => set({ introSeen: true, view: "lab" }),
}));
