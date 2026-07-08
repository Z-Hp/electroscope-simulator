import { PredictionQuestion } from "./sim-store";

export const PREDICTIONS: PredictionQuestion[] = [
  {
    id: "pred-rub-direction",
    question:
      "وقتی شیشه را با ابریشم مالش می‌دهیم، الکترون‌ها به کدام سمت حرکت می‌کنند؟",
    options: [
      "از شیشه به ابریشم (شیشه مثبت می‌شود)",
      "از ابریشم به شیشه (شیشه منفی می‌شود)",
      "جابجایی نمی‌شوند",
    ],
    correctIndex: 0,
    explanation:
      "شیشه در سری مالشی بالاتر (مثبت‌تر) از ابریشم است؛ پس الکترون را از دست می‌دهد و مثبت می‌شود.",
  },
  {
    id: "pred-induction-leaf",
    question:
      "اگر میله باردار را بدون تماس به کلاهک نزدیک کنیم، تیغه چه می‌کند؟",
    options: ["باز می‌شود", "بسته می‌ماند", "اول باز سپس بسته می‌شود"],
    correctIndex: 0,
    explanation:
      "القا باعث می‌شود بارهای هم‌نام میله به تیغه‌ها رانده شوند و یکدیگر را دفع کنند؛ پس تیغه باز می‌شود.",
  },
  {
    id: "pred-remove-no-contact",
    question: "پس از القا، اگر میله را دور کنیم (بدون تماس قبلی)، تیغه چه می‌کند؟",
    options: ["باز می‌ماند", "بسته می‌شود", "نوسان می‌کند"],
    correctIndex: 1,
    explanation:
      "چون تماسی نداشتیم، مجموع بار الکتروسکوپ صفر ماند؛ با دور شدن میله، توزیع بار خنثی می‌شود و تیغه می‌بندد.",
  },
  {
    id: "pred-contact-stays",
    question: "اگر میله را به کلاهک بزنیم (تماس) و بعد دور کنیم، تیغه چه می‌کند؟",
    options: ["بسته می‌شود", "باز می‌ماند", "می‌شکند"],
    correctIndex: 1,
    explanation:
      "بار با تماس به الکتروسکوپ منتقل می‌شود و پس از دور کردن میله روی آن می‌ماند؛ تیغه باز می‌ماند.",
  },
  {
    id: "pred-ground",
    question: "الکتروسکوپ باردار را زمین کنیم، چه اتفاقی می‌افتد؟",
    options: [
      "بار به زمین می‌رود و تیغه می‌بندد",
      "بار بیشتر می‌شود",
      "هیچ تغییری نمی‌کند",
    ],
    correctIndex: 0,
    explanation:
      "زمین مسیر فرار بارهای اضافی است؛ بار به زمین می‌رود و تیغه می‌بندد.",
  },
  {
    id: "pred-induction-charge",
    question:
      "اگر هنگام القا زمین کنیم، سیم را قطع کنیم، سپس میله را دور کنیم، بار نهایی الکتروسکوپ چیست؟",
    options: ["هم‌نام میله اولیه", "مخالف میله اولیه", "خنثی"],
    correctIndex: 1,
    explanation:
      "در این روش (باردار کردن با القا)، بار نهایی الکتروسکوپ همواره مخالف بار میله اولیه است.",
  },
];

export interface ObjectiveDetail {
  id: string;
  title: string;
  steps: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const OBJECTIVE_DETAILS: ObjectiveDetail[] = [
  {
    id: "obj-rub",
    title: "باردار کردن میله با مالش",
    steps: [
      "به «کارگاه مالش» برو.",
      "یک میله نارسانا (مثلاً شیشه) و یک پارچه (مثلاً ابریشم) انتخاب کن.",
      "روی میله مالش بده تا درصد مالش بالای ۶۰٪ شود و میله باردار شود.",
    ],
    quiz: {
      question: "با مالش شیشه با ابریشم، میله چه باری می‌گیرد؟",
      options: ["مثبت", "منفی", "خنثی می‌ماند"],
      correctIndex: 0,
      explanation: "شیشه در سری بالاتر از ابریشم است، پس الکترون از دست داده و مثبت می‌شود.",
    },
  },
  {
    id: "obj-direction",
    title: "درک جهت حرکت الکترون‌ها",
    steps: [
      "در کارگاه مالش، به جهت جرقه‌ها دقت کن.",
      "یادت باشد: الکترون همواره از ماده بالاتر در سری به ماده پایین‌تر می‌رود.",
      "نشانگر «حرکت الکترون‌ها» در پنل وضعیت، جهت را مشخص می‌کند.",
    ],
    quiz: {
      question: "وقتی شیشه با ابریشم مالش داده می‌شود، الکترون به کدام سمت می‌رود؟",
      options: ["از شیشه به ابریشم", "از ابریشم به شیشه", "حرکت نمی‌کند"],
      correctIndex: 0,
      explanation: "شیشه بالاتر در سری است، پس الکترون از شیشه به ابریشم می‌رود و شیشه مثبت می‌شود.",
    },
  },
  {
    id: "obj-induction",
    title: "پدیده القا بدون تماس",
    steps: [
      "میله باردار را به «سالن الکتروسکوپ» ببر.",
      "بدون تماس، میله را نزدیک کلاهک کن.",
      "تیغه باز می‌شود در حالی که مجموع بار الکتروسکوپ صفر است.",
    ],
    quiz: {
      question: "نزدیک کردن میله باردار بدون تماس، چه اثری بر تیغه دارد؟",
      options: ["تیغه باز می‌شود (القا)", "تیغه بسته می‌ماند", "تیغه می‌شکند"],
      correctIndex: 0,
      explanation: "بدون تماس، بارهای هم‌نام میله به تیغه رانده شده و تیغه باز می‌شود، ولی مجموع بار صفر است.",
    },
  },
  {
    id: "obj-distance",
    title: "اثر فاصله بر شدت القا",
    steps: [
      "میله باردار را نزدیک کن (تیغه باز می‌شود).",
      "با نوار لغزان «فاصله»، میله را نزدیک‌تر یا دورتر کن.",
      "نزدیک‌تر = زاویه تیغه بیشتر، دورتر = زاویه کمتر.",
    ],
    quiz: {
      question: "هرچه میله باردار نزدیک‌تر باشد، زاویه تیغه چه می‌شود؟",
      options: ["بیشتر می‌شود", "کمتر می‌شود", "ثابت می‌ماند"],
      correctIndex: 0,
      explanation: "شدت القا با نزدیک شدن میله بیشتر می‌شود، پس زاویه تیغه افزایش می‌یابد.",
    },
  },
  {
    id: "obj-contact",
    title: "انتقال بار با تماس",
    steps: [
      "میله باردار را تا کلاهک ببر (نوار فاصله به سمت «تماس»).",
      "با برخورد، بار از میله به الکتروسکوپ منتقل می‌شود.",
      "تیغه باز می‌شود و بار الکتروسکوپ همانند میله می‌شود.",
    ],
    quiz: {
      question: "با تماس میله باردار با کلاهک، بار الکتروسکوپ چه می‌شود؟",
      options: ["همانند میله", "مخالف میله", "صفر می‌ماند"],
      correctIndex: 0,
      explanation: "در تماس، بار از میله به الکتروسکوپ منتقل می‌شود و بار الکتروسکوپ هم‌نام میله می‌شود.",
    },
  },
  {
    id: "obj-remove",
    title: "باز ماندن تیغه پس از دور کردن میله",
    steps: [
      "پس از تماس (انتقال بار)، میله را دور کن.",
      "تیغه باز می‌ماند چون بار روی الکتروسکوپ ماند.",
      "برای بستن تیغه، باید الکتروسکوپ را زمین کنی.",
    ],
    quiz: {
      question: "پس از تماس و دور کردن میله، تیغه چه می‌کند؟",
      options: ["باز می‌ماند", "بسته می‌شود", "نوسان می‌کند"],
      correctIndex: 0,
      explanation: "بار با تماس منتقل شده و روی الکتروسکوپ مانده است؛ پس تیغه باز می‌ماند.",
    },
  },
  {
    id: "obj-ground",
    title: "زمین کردن الکتروسکوپ باردار",
    steps: [
      "الکتروسکوپ باردار است (تیغه باز).",
      "دکمه «وصل سیم زمین» را بزن.",
      "بار اضافی به زمین می‌رود و تیغه می‌بندد.",
    ],
    quiz: {
      question: "زمین کردن الکتروسکوپ باردار چه می‌کند؟",
      options: ["بار را خنثی می‌کند و تیغه می‌بندد", "بار را بیشتر می‌کند", "هیچ اثری ندارد"],
      correctIndex: 0,
      explanation: "زمین مسیر فرار بار است؛ بار به زمین می‌رود و الکتروسکوپ خنثی می‌شود.",
    },
  },
  {
    id: "obj-induction-charge",
    title: "باردار کردن با القا (بار مخالف)",
    steps: [
      "میله باردار را نزدیک کن (القا، تیغه باز).",
      "در حالی که میله نزدیک است، سیم زمین را وصل کن (تیغه می‌بندد).",
      "سیم زمین را قطع کن.",
      "میله را دور کن. تیغه دوباره باز می‌شود ولی بار مخالف میله است!",
    ],
    quiz: {
      question: "در باردار کردن با القا، بار نهایی الکتروسکوپ چه نسبتی با میله دارد؟",
      options: ["مخالف میله", "هم‌نام میله", "خنثی"],
      correctIndex: 0,
      explanation: "در القا، بارهای هم‌نام میله به زمین می‌روند و بار مخالف میله باقی می‌ماند.",
    },
  },
  {
    id: "obj-conductor",
    title: "شناخت رسانای فلزی",
    steps: [
      "در کارگاه مالش، میله «فلز» را انتخاب کن.",
      "سعی کن آن را مالش بده.",
      "پیام هشدار می‌آید: فلز رساناست و بار از دست شما خنثی می‌شود.",
    ],
    quiz: {
      question: "چرا میله فلز با مالش باردار نمی‌ماند؟",
      options: [
        "چون فلز رساناست و بار از دست خارج می‌شود",
        "چون فلز مالش نمی‌شود",
        "چون فلز بار تولید نمی‌کند",
      ],
      correctIndex: 0,
      explanation: "فلز رساناست؛ بار از طریق دست شما به زمین منتقل می‌شود و میله باردار نمی‌ماند.",
    },
  },
];

// ===== Mission System =====

export type MissionPhase = "selection" | "intro" | "prediction" | "experiment" | "result" | "complete";

export interface MissionObject {
  id: string;
  name: string;
  emoji: string;
  charge: number; // -1, 0, +1 (for missions 1 & 2)
  isConductor: boolean; // for mission 3
  color: string;
}

export interface MissionDef {
  id: 1 | 2 | 3;
  title: string;
  emoji: string;
  story: string;
  objective: string;
  predictionLabel: string;
  predictionOptions: { value: string; label: string }[];
}

export const MISSIONS: Record<1 | 2 | 3, MissionDef> = {
  1: {
    id: 1,
    title: "شکار بار الکتریکی",
    emoji: "🎯",
    story:
      "روی میز آزمایش چند جسم مختلف پیدا کرده‌ای. برخی از آن‌ها باردار شده‌اند و برخی خنثی‌اند. با استفاده از الکتروسکوپ، ببین کدام جسم باردار است و کدام خنثی!",
    objective: "تشخیص وجود یا عدم وجود بار الکتریکی در اجسام",
    predictionLabel: "فکر می‌کنی این جسم چه وضعیتی دارد؟",
    predictionOptions: [
      { value: "charged", label: "باردار است" },
      { value: "neutral", label: "خنثی است" },
    ],
  },
  2: {
    id: 2,
    title: "کشف راز بارها",
    emoji: "🔮",
    story:
      "الکتروسکوپ از قبل باردار است و می‌دانی چه باری دارد. یک میله ناشناخته به آرامی به کلاهک نزدیک می‌شود (بدون تماس). با مشاهده رفتار تیغه‌ها، بفهم بار میله مثبت است یا منفی!",
    objective: "تشخیص نوع بار (مثبت/منفی) با استفاده از القا",
    predictionLabel: "فکر می‌کنی بار این میله چیست؟",
    predictionOptions: [
      { value: "positive", label: "مثبت" },
      { value: "negative", label: "منفی" },
    ],
  },
  3: {
    id: 3,
    title: "آزمون رسانایی",
    emoji: "⚡",
    story:
      "الکتروسکوپ باردار است و تیغه‌هایش باز هستند. اجسام مختلفی داری که باید با کلاهک تماس بدهی. با مشاهده تغییر تیغه، بفهم کدام جسم رساناست و کدام نارسانا!",
    objective: "تشخیص رسانا یا نارسانا بودن اجسام",
    predictionLabel: "فکر می‌کنی این جسم چه ویژگی‌ای دارد؟",
    predictionOptions: [
      { value: "conductor", label: "رسانا" },
      { value: "insulator", label: "نارسانا" },
    ],
  },
};

// Object pools for randomization
const M1_OBJECTS = [
  { name: "شیشه", emoji: "🧪", color: "#a7d8f0" },
  { name: "پلاستیک", emoji: "🟦", color: "#7fd1b9" },
  { name: "ابونیت", emoji: "🟫", color: "#6b6157" },
  { name: "چوب", emoji: "🪵", color: "#c98b5a" },
  { name: "فلز", emoji: "⚙️", color: "#b8c4d0" },
  { name: "کاغذ", emoji: "📄", color: "#f4f1ea" },
  { name: "شانه پلاستیکی", emoji: "🪮", color: "#c9b6f5" },
  { name: "قلم", emoji: "🖊️", color: "#5a6672" },
];

const M3_OBJECTS = [
  { name: "تکه فلز", emoji: "⚙️", color: "#b8c4d0", isConductor: true },
  { name: "چوب", emoji: "🪵", color: "#c98b5a", isConductor: false },
  { name: "پلاستیک", emoji: "🟦", color: "#7fd1b9", isConductor: false },
  { name: "شیشه", emoji: "🧪", color: "#a7d8f0", isConductor: false },
  { name: "سیم مسی", emoji: "🪢", color: "#d4825a", isConductor: true },
  { name: "لاستیک", emoji: "🛞", color: "#3a3a3a", isConductor: false },
  { name: "قاشق فلزی", emoji: "🥄", color: "#c0c8d0", isConductor: true },
  { name: "مداد", emoji: "✏️", color: "#e0c9a6", isConductor: false },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Generate randomized objects for mission 1 (charged vs neutral)
export function genM1Objects(): MissionObject[] {
  const pool = shuffle(M1_OBJECTS).slice(0, 5);
  return pool.map((o, i) => ({
    id: `m1-obj-${i}`,
    name: o.name,
    emoji: o.emoji,
    color: o.color,
    // ~60% charged, 40% neutral; at least 2 charged and 1 neutral
    charge: i < 2 ? (Math.random() > 0.5 ? 1 : -1) : i < 4 ? (Math.random() > 0.4 ? 1 : 0) : 0,
    isConductor: false,
  }));
}

// Generate randomized object for mission 2 (positive or negative rod)
export function genM2Object(): MissionObject[] {
  const isPositive = Math.random() > 0.5;
  return [
    {
      id: "m2-rod",
      name: "میله ناشناخته",
      emoji: "❓",
      color: "#9ca3af",
      charge: isPositive ? 1 : -1,
      isConductor: false,
    },
  ];
}

// Generate randomized objects for mission 3 (conductor vs insulator)
export function genM3Objects(): MissionObject[] {
  const pool = shuffle(M3_OBJECTS).slice(0, 5);
  return pool.map((o, i) => ({
    id: `m3-obj-${i}`,
    name: o.name,
    emoji: o.emoji,
    color: o.color,
    charge: 0,
    isConductor: o.isConductor,
  }));
}

export function genMissionObjects(missionId: 1 | 2 | 3): MissionObject[] {
  if (missionId === 1) return genM1Objects();
  if (missionId === 2) return genM2Object();
  return genM3Objects();
}

// Get the correct answer for an object in a mission
export function getCorrectAnswer(missionId: 1 | 2 | 3, obj: MissionObject): string {
  if (missionId === 1) return obj.charge !== 0 ? "charged" : "neutral";
  if (missionId === 2) return obj.charge > 0 ? "positive" : "negative";
  return obj.isConductor ? "conductor" : "insulator";
}

// Get scientific explanation for a result
export function getExplanation(missionId: 1 | 2 | 3, obj: MissionObject, electroscopeCharge?: number): string {
  if (missionId === 1) {
    if (obj.charge !== 0) {
      return `این جسم باردار است. وقتی آن را به کلاهک الکتروسکوپ تماس می‌دهی، بارش به الکتروسکوپ منتقل شده و تیغه‌ها باز می‌شوند.`;
    }
    return `این جسم خنثی است. وقتی آن را به کلاهک تماس می‌دهی، بار منتقل نمی‌شود و تیغه‌ها تغییری نمی‌کنند.`;
  }
  if (missionId === 2) {
    const eCharge = electroscopeCharge || 1;
    const eSign = eCharge > 0 ? "مثبت" : "منفی";
    if (obj.charge > 0) {
      if (eCharge > 0) {
        return `بار میله مثبت است. چون الکتروسکوپ هم مثبت بود، نزدیک شدن میله (القا) باعث می‌شود بارهای هم‌نام به تیغه‌ها رانده شوند و تیغه‌ها بیشتر باز شوند.`;
      }
      return `بار میله مثبت است. چون الکتروسکوپ منفی بود، نزدیک شدن میله مثبت باعث می‌شود بارهای منفی الکتروسکوپ به سمت کلاهک کشیده شوند و تیغه‌ها بسته‌تر شوند.`;
    }
    if (eCharge > 0) {
      return `بار میله منفی است. چون الکتروسکوپ مثبت بود، نزدیک شدن میله منفی باعث می‌شود بارهای مثبت الکتروسکوپ به سمت کلاهک کشیده شوند و تیغه‌ها بسته‌تر شوند.`;
    }
    return `بار میله منفی است. چون الکتروسکوپ هم منفی بود، نزدیک شدن میله (القا) باعث می‌شود بارهای هم‌نام به تیغه‌ها رانده شوند و تیغه‌ها بیشتر باز شوند.`;
  }
  // mission 3
  if (obj.isConductor) {
    return `این جسم رساناست. وقتی با کلاهک الکتروسکوپ باردار تماس پیدا می‌کند، بار از طریق آن منتقل شده و تیغه‌ها می‌بندند.`;
  }
  return `این جسم نارساناست. وقتی با کلاهک تماس پیدا می‌کند، بار منتقل نمی‌شود و تیغه‌ها باز می‌مانند.`;
}

// Encouraging completion messages based on score
export function getCompletionMessage(correct: number, total: number): string {
  const pct = (correct / total) * 100;
  if (pct === 100) return "عالی! همه را درست تشخیص دادی. تو یک دانشمند واقعی هستی! 🏆";
  if (pct >= 60) return `آفرین! ${correct} از ${total} مورد درست بود. کمی بیشتر تمرین کن! 👏`;
  return `${correct} از ${total} مورد درست بود. مفاهیم را مرور کن و دوباره تلاش کن! 📚`;
}
