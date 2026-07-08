// Electrostatic physics engine for the electroscope simulator.
// Educational simplifications are documented inline.

export type RodMaterial = "glass" | "acrylic" | "plastic" | "ebonite" | "metal";
export type ClothMaterial = "silk" | "wool" | "fur" | "cotton" | "nylon";

export interface MaterialInfo {
  id: string;
  name: string; // Persian name
  emoji: string;
  affinity: number; // triboelectric affinity (higher = tends to lose electrons -> positive)
  conductor?: boolean; // true for metal rod (charges leak through hand)
  color: string; // tailwind/hex base color for rendering
  description: string;
}

// Triboelectric series based on the 11th-grade physics textbook table.
// Higher affinity -> loses electrons when rubbed with lower-affinity material -> becomes POSITIVE.
// Series order (textbook): شیشه > مو > نایلون > پشم > کاغذ > پنبه > چوب > فلز > ابریشم > لاستیک > پلاستیک > ابونیت
// (Glass is the most positive, ebonite is the most negative)
export const RODS: Record<RodMaterial, MaterialInfo> = {
  glass: {
    id: "glass",
    name: "شیشه",
    emoji: "🧪",
    affinity: 6,
    color: "#a7d8f0",
    description: "بالاترین در سری مالشی. با مالش ابریشم بار مثبت می‌گیرد.",
  },
  acrylic: {
    id: "acrylic",
    name: "اکریلیک",
    emoji: "🔷",
    affinity: 3,
    color: "#c9b6f5",
    description: "نیمه‌مثبت. رفتار نزدیک به شیشه دارد.",
  },
  plastic: {
    id: "plastic",
    name: "پلاستیک (PVC)",
    emoji: "🟦",
    affinity: -4,
    color: "#7fd1b9",
    description: "در سری مالشی منفی است. بار منفی قوی می‌گیرد.",
  },
  ebonite: {
    id: "ebonite",
    name: "ابونیت",
    emoji: "🟫",
    affinity: -5,
    color: "#6b6157",
    description: "پایین‌ترین در سری مالشی. با مالش پشم بار منفی قوی می‌گیرد.",
  },
  metal: {
    id: "metal",
    name: "فلز (روی دستگیره عایق‌نشده)",
    emoji: "⚙️",
    affinity: 0,
    conductor: true,
    color: "#b8c0c8",
    description: "رسانا! بار از طریق دست شما خنثی می‌شود.",
  },
};

export const CLOTHS: Record<ClothMaterial, MaterialInfo> = {
  silk: {
    id: "silk",
    name: "ابریشم",
    emoji: "🎀",
    affinity: 2,
    color: "#f0c8d0",
    description: "در سری مالشی منفی‌تر از شیشه. با شیشه مالش -> شیشه مثبت، ابریشم منفی.",
  },
  fur: {
    id: "fur",
    name: "خز (موی حیوان)",
    emoji: "🧥",
    affinity: 5,
    color: "#c98b5a",
    description: "مثبت در سری. با پلاستیک مالش -> پلاستیک منفی، خز مثبت.",
  },
  wool: {
    id: "wool",
    name: "پشم",
    emoji: "🧶",
    affinity: 4,
    color: "#e0c9a6",
    description: "مثبت در سری. با ابونیت مالش -> ابونیت منفی، پشم مثبت.",
  },
  cotton: {
    id: "cotton",
    name: "پنبه (کتان)",
    emoji: "☁️",
    affinity: 1,
    color: "#f4f1ea",
    description: "میانه در سری. نزدیک به خنثی.",
  },
  nylon: {
    id: "nylon",
    name: "نایلون",
    emoji: "🧵",
    affinity: 4.5,
    color: "#d8d8e0",
    description: "مثبت در سری. با پلاستیک مالش -> پلاستیک منفی، نایلون مثبت.",
  },
};

// ---- Charging by rubbing ----

export interface RubResult {
  rodCharge: number; // -1 .. 1 (sign) , 0 = neutral
  clothCharge: number;
  rodIsConductor: boolean;
  electronsFrom: "rod" | "cloth"; // direction electrons moved
  magnitude: number; // 0..1
}

export function rubMaterials(
  rod: RodMaterial,
  cloth: ClothMaterial
): RubResult {
  const r = RODS[rod];
  const c = CLOTHS[cloth];
  const diff = r.affinity - c.affinity;
  // electrons move FROM higher affinity (more positive in series) TO lower affinity
  const electronsFrom: "rod" | "cloth" = diff >= 0 ? "rod" : "cloth";
  const magnitude = Math.min(1, Math.abs(diff) / 11); // normalize ~0..1 (max diff = 6-(-5)=11)
  // if rod is conductor, charge leaks -> effectively stays near 0 in the hand
  const rodIsConductor = !!r.conductor;
  const effectiveRodCharge = rodIsConductor ? 0 : Math.sign(diff) * magnitude;
  const effectiveClothCharge = -Math.sign(diff) * magnitude;
  return {
    rodCharge: effectiveRodCharge,
    clothCharge: effectiveClothCharge,
    rodIsConductor,
    electronsFrom,
    magnitude,
  };
}

// ---- Electroscope state machine ----

export type ElectroscopeStateKind =
  | "neutral"
  | "induced"
  | "contact-charging"
  | "contact-charged"
  | "induction-charging"
  | "induction-charged"
  | "grounded-neutral"
  | "grounded-while-inducing";

export interface SimSnapshot {
  // external charged rod near the cap
  externalRodCharge: number; // -1..1, 0 = no rod / neutral rod
  externalRodPresent: boolean;
  externalRodDistance: number; // 0 = touching cap, 1 = far away
  // electroscope
  netCharge: number; // net charge on electroscope (-1..1)
  isGrounded: boolean;
  isContact: boolean; // external rod physically touching cap
  // history flag: was grounding applied while inducing?
  groundedDuringInduction: boolean;
  // the rod that was used for induction (to determine final polarity)
  inductionRodSign: number; // -1, 0, +1
}

export interface ElectroscopePhysics {
  state: ElectroscopeStateKind;
  leafAngleDeg: number; // 0..70
  topCharge: number; // localized charge on cap/rod region (-1..1) for display
  leafCharge: number; // localized charge on leaves (-1..1) for display
  inductionActive: boolean; // rod near and not neutral
  explanation: string;
}

/**
 * Core physics step. Pure function of the current snapshot.
 * Educational simplifications:
 *  - Leaf angle proportional to local leaf charge magnitude (induction shows divergence even if net=0).
 *  - Distance modulates induction strength (closer => stronger).
 *  - Contact transfers charge (rod -> electroscope) when isContact true.
 */
export function computeElectroscope(s: SimSnapshot): ElectroscopePhysics {
  const hasExternalRod = s.externalRodPresent && Math.abs(s.externalRodCharge) > 0.01;
  const inductionStrength =
    hasExternalRod && !s.isContact
      ? (1 - s.externalRodDistance) * Math.sign(s.externalRodCharge) * Math.min(1, Math.abs(s.externalRodCharge))
      : 0;

  let netCharge = s.netCharge;
  let state: ElectroscopeStateKind = "neutral";
  let explanation = "الکتروسکوپ خنثی است. تیغه‌ها بسته‌اند.";

  // Grounding drains net charge to earth (unless an external rod is inducing)
  if (s.isGrounded) {
    if (hasExternalRod && !s.isContact) {
      // inducing while grounded: charges of same sign as rod drain away
      // net charge becomes opposite sign of rod (after removing ground)
      state = "grounded-while-inducing";
      explanation =
        "الکتروسکوپ زمین شده است. بارهای هم‌نام با میله به زمین می‌روند. تیغه می‌بندد ولی الکتروسکوپ باردار می‌شود.";
      return {
        state,
        leafAngleDeg: 0,
        topCharge: inductionStrength, // top keeps opposite of rod locally (rod repels likes away)
        leafCharge: 0,
        inductionActive: true,
        explanation,
      };
    } else {
      state = "grounded-neutral";
      explanation = "الکتروسکوپ زمین شده. بار اضافی به زمین رفت و تیغه بسته شد.";
      return {
        state,
        leafAngleDeg: 0,
        topCharge: 0,
        leafCharge: 0,
        inductionActive: false,
        explanation,
      };
    }
  }

  // Contact charging: rod transfers charge
  if (s.isContact && hasExternalRod) {
    // transfer: net charge moves toward rod's sign (share). Educ: full transfer.
    netCharge = s.externalRodCharge;
    state = "contact-charging";
    const ang = chargeToAngle(Math.abs(netCharge));
    explanation =
      "تماس! بار از میله به الکتروسکوپ منتقل شد. تیغه باز می‌شود و بار همانند میله است.";
    return {
      state,
      leafAngleDeg: ang,
      topCharge: netCharge * 0.4,
      leafCharge: netCharge,
      inductionActive: false,
      explanation,
    };
  }

  // After contact removed but electroscope carries charge (rod may be near or far)
  if (Math.abs(netCharge) > 0.01) {
    if (s.groundedDuringInduction) {
      state = "induction-charged";
      explanation = hasExternalRod
        ? "الکتروسکوپ با القا باردار شده (بار مخالف میله). هنوز میله نزدیک است؛ وقتی دورش کنی، تیغه بیشتر باز می‌شود."
        : "الکتروسکوپ با روش القا باردار شده است. بار آن مخالف میله اولیه است. تیغه باز می‌ماند.";
    } else {
      state = "contact-charged";
      explanation = hasExternalRod
        ? "الکتروسکوپ با تماس باردار است. بار همانند میله. هنوز میله نزدیک است."
        : "الکتروسکوپ با تماس باردار شده است. بار همانند میله است. تیغه باز می‌ماند.";
    }
    // Leaf divergence based on net charge, MODULATED by induction when rod is near.
    // - Same-sign rod near: more same-sign charge pushed to leaves → leaves diverge MORE
    // - Opposite-sign rod near: same-sign charge drawn to cap → leaves diverge LESS
    const base = chargeToAngle(Math.abs(netCharge));
    let ang = base;
    if (hasExternalRod && !s.isContact) {
      // inductionStrength has sign of rod charge.
      // If rod sign == netCharge sign → same-sign → boost (more divergence)
      // If rod sign != netCharge sign → opposite → reduce (less divergence)
      const sameSign = Math.sign(inductionStrength) === Math.sign(netCharge);
      const inductionEffect = chargeToAngle(Math.abs(inductionStrength)) * 0.5;
      ang = sameSign
        ? Math.min(70, base + inductionEffect)
        : Math.max(0, base - inductionEffect);
    }
    return {
      state,
      leafAngleDeg: ang,
      // Local charge distribution: induction draws same-sign away from leaves
      topCharge: hasExternalRod && !s.isContact
        ? netCharge * 0.4 + (Math.sign(netCharge) === Math.sign(inductionStrength) ? -inductionStrength * 0.3 : inductionStrength * 0.3)
        : netCharge * 0.4,
      leafCharge: hasExternalRod && !s.isContact
        ? netCharge + (Math.sign(netCharge) === Math.sign(inductionStrength) ? inductionStrength * 0.3 : -inductionStrength * 0.3)
        : netCharge,
      inductionActive: hasExternalRod,
      explanation,
    };
  }

  // Pure induction: rod near, no contact, net charge 0
  if (hasExternalRod && !s.isContact) {
    state = "induced";
    const ang = chargeToAngle(Math.abs(inductionStrength));
    explanation =
      "القا! بارهای مخالف میله به سمت کلاهک کشیده و بارهای هم‌نام به تیغه‌ها رانده می‌شوند. تیغه باز می‌شود ولی مجموع بار صفر است.";
    return {
      state,
      leafAngleDeg: ang,
      topCharge: -inductionStrength, // opposite sign attracted to top
      leafCharge: inductionStrength, // same sign as rod pushed to leaves
      inductionActive: true,
      explanation,
    };
  }

  // Default neutral
  return {
    state: "neutral",
    leafAngleDeg: 0,
    topCharge: 0,
    leafCharge: 0,
    inductionActive: false,
    explanation,
  };
}

function chargeToAngle(q: number): number {
  // q in 0..1 -> angle 0..70 deg
  return Math.min(70, Math.max(0, q * 70));
}

// Distance label helper (0=touch,1=far)
export function distanceLabel(d: number): string {
  if (d <= 0.04) return "تماس";
  if (d < 0.25) return "بسیار نزدیک";
  if (d < 0.5) return "نزدیک";
  if (d < 0.75) return "متوسط";
  return "دور";
}

export function chargeLabel(q: number): { sign: "+" | "-" | "0"; text: string; color: string } {
  if (Math.abs(q) < 0.02) return { sign: "0", text: "خنثی", color: "#94a3b8" };
  if (q > 0) {
    const strength = q > 0.6 ? "زیاد" : q > 0.3 ? "متوسط" : "کم";
    return { sign: "+", text: `مثبت (${strength})`, color: "#f97316" };
  }
  const strength = q < -0.6 ? "زیاد" : q < -0.3 ? "متوسط" : "کم";
  return { sign: "-", text: `منفی (${strength})`, color: "#38bdf8" };
}
