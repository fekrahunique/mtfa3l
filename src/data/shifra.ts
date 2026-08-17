/**
 * بيانات لعبة «الشفرة» — منفصلة عن المحرّك ليُضاف إليها لاحقًا بلا تعديل المنطق.
 * النموذج A (بروجكتر + بطاقات مطبوعة): الرائد هو المشغّل، والمعلومات السرّية تُوزَّع ورقًا.
 * التحديات يُحكِّمها الرائد (نجاح/فشل) لأن التنفيذ أمام الطلاب.
 */

export type ShifraDifficultyId = "beginner" | "medium" | "advanced";

export const DIFFICULTIES: { id: ShifraDifficultyId; label: string; emoji: string; len: number; attempts: number }[] = [
  { id: "beginner", label: "مبتدئ", emoji: "🟢", len: 3, attempts: 3 },
  { id: "medium", label: "متوسط", emoji: "🟡", len: 4, attempts: 3 },
  { id: "advanced", label: "متقدّم", emoji: "🔴", len: 5, attempts: 2 },
];

export const AGE_GROUPS = [
  "أول ابتدائي", "ثاني ابتدائي", "ثالث ابتدائي", "رابع ابتدائي",
  "خامس ابتدائي", "سادس ابتدائي", "أول متوسط", "ثاني متوسط", "ثالث متوسط",
];

export const DURATIONS = [15, 25, 30, 45, 60] as const;
export const START_BALANCES = [500, 800, 1200] as const;

/** سعر المعلومة في السوق، وربح التحدّي — بحسب الصعوبة. */
export const MARKET_PRICE: Record<ShifraDifficultyId, number> = { beginner: 150, medium: 250, advanced: 300 };
export const CHALLENGE_REWARD = 200;

export const TEAM_PRESETS = [
  { emoji: "🦅", name: "الصقور", color: "#5b93ff" },
  { emoji: "🐯", name: "النمور", color: "#46e0a0" },
  { emoji: "⚡", name: "البرق", color: "#ff9d3d" },
  { emoji: "🦁", name: "الأسود", color: "#b58cff" },
  { emoji: "🦈", name: "القروش", color: "#4bd6ef" },
  { emoji: "🐝", name: "النحل", color: "#f5d24b" },
  { emoji: "🐺", name: "الذئاب", color: "#94a3b8" },
  { emoji: "🐉", name: "التنانين", color: "#ff5470" },
];

/* ═══════════ المعلومات (الأدلّة) ═══════════ */

export type ClueType = "number" | "negation" | "relation" | "order" | "parity";

export interface Clue {
  id: string;
  type: ClueType;
  text: string;
}

export const CLUE_META: Record<ClueType, { emoji: string; label: string }> = {
  number: { emoji: "🔢", label: "رقم" },
  negation: { emoji: "🚫", label: "نفي" },
  relation: { emoji: "🔗", label: "علاقة" },
  order: { emoji: "📍", label: "موقع" },
  parity: { emoji: "🧩", label: "نمط" },
};

const ORD = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"];
export function ordinal(i: number): string {
  return ORD[i] ?? `الرقم ${i + 1}`;
}

/** شفرة من أرقام مختلفة (١..٩) بطول محدّد. */
export function generateCode(len: number): number[] {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, len);
}

/**
 * يبني أدلّة الشفرة: أدلّة «رقم» مباشرة (تحدّد كل خانة) + أدلّة غير مباشرة (نفي/علاقة/موقع/نمط).
 * كلها صحيحة. توزيعها بحيث لا يحلّها فريق وحده مسؤولية المحرّك.
 */
export function buildClues(code: number[]): { core: Clue[]; extras: Clue[] } {
  const L = code.length;
  const core: Clue[] = code.map((v, i) => ({ id: `n${i}`, type: "number", text: `الرقم ${ordinal(i)} = ${v}` }));
  const extras: Clue[] = [];

  // نفي: خانتان، برقم خاطئ
  const negPositions = L >= 4 ? [0, L - 1] : [L - 1];
  negPositions.forEach((p, k) => {
    let w = code[p];
    let guard = 0;
    while (w === code[p] && guard++ < 20) w = 1 + Math.floor(Math.random() * 9);
    extras.push({ id: `neg${k}`, type: "negation", text: `الرقم ${ordinal(p)} ليس ${w}` });
  });

  // علاقة: أول زوج a>b
  outer: for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      if (code[a] > code[b]) {
        extras.push({ id: "rel", type: "relation", text: `الرقم ${ordinal(a)} أكبر من الرقم ${ordinal(b)}` });
        break outer;
      }
    }
  }

  // موقع: قيمة قبل قيمة
  extras.push({ id: "ord", type: "order", text: `الرقم ${code[0]} يقع قبل الرقم ${code[L - 1]}` });

  // نمط: زوجية خانة وسطى
  const pp = Math.floor(L / 2);
  extras.push({ id: "par", type: "parity", text: `الرقم ${ordinal(pp)} ${code[pp] % 2 === 0 ? "زوجي" : "فردي"}` });

  return { core, extras };
}

/* ═══════════ التحديات (يحكّمها الرائد) ═══════════ */

export interface ShifraChallenge {
  id: string;
  type: "memory" | "speed" | "puzzle" | "team" | "observation" | "physical";
  title: string;
  instruction: string;
}

export const TYPE_META: Record<ShifraChallenge["type"], { emoji: string; label: string }> = {
  memory: { emoji: "🧠", label: "ذاكرة" },
  speed: { emoji: "⚡", label: "سرعة" },
  puzzle: { emoji: "🧩", label: "لغز" },
  team: { emoji: "🤝", label: "تعاون" },
  observation: { emoji: "🔎", label: "ملاحظة" },
  physical: { emoji: "🏃", label: "حركة" },
};

export const CHALLENGES: ShifraChallenge[] = [
  { id: "s-mem-1", type: "memory", title: "سلسلة الذاكرة", instruction: "يقرأ الرائد هذه الأرقام مرّة واحدة ثم يخفيها، ويعيدها الفريق بالترتيب نفسه على ورقتهم: ٤ - ٨ - ١ - ٦ - ٣" },
  { id: "s-mem-2", type: "memory", title: "ماذا اختفى؟", instruction: "تُعرض هذه الرموز ١٠ ثوانٍ ثم يُخفى واحد ويخمّن الفريق المفقود: 🍎 🌙 ⭐ 🔑 🎈 🚗" },
  { id: "s-spd-1", type: "speed", title: "أسرع إجابة", instruction: "أول فريق يرفع يده بالإجابة الصحيحة يكسب — كم عدد أيام الأسبوع؟ (الجواب: ٧)" },
  { id: "s-spd-2", type: "speed", title: "العدّ الذكي", instruction: "عدّوا من ٢ إلى ٢٠ بالأرقام الزوجية فقط بأسرع وقت وبلا خطأ" },
  { id: "s-puz-1", type: "puzzle", title: "لغز الترتيب", instruction: "ثلاثة في صفّ: سالم ليس الأول، وفهد خلف سالم، من الأول؟ (الجواب: أحمد)" },
  { id: "s-puz-2", type: "puzzle", title: "المتتالية", instruction: "أكملوا: ٣، ٦، ١٢، ٢٤، ؟ — واشرحوا القاعدة (الجواب: ٤٨)" },
  { id: "s-puz-3", type: "puzzle", title: "الكلمة المبعثرة", instruction: "رتّبوا حروف «ف ش ر ة» لتكوين كلمة (الجواب: شفرة)" },
  { id: "s-team-1", type: "team", title: "رسالة صامتة", instruction: "يوصل الفريق كلمة «الحديقة» من أوّله لآخره بالإشارة فقط دون كلام" },
  { id: "s-team-2", type: "team", title: "الاتفاق السريع", instruction: "يتّفق الفريق خلال ١٥ ثانية على إجابة واحدة: ما أفضل مكان لرحلة مدرسية؟" },
  { id: "s-obs-1", type: "observation", title: "عين دقيقة", instruction: "كم بابًا في هذه القاعة؟ يتّفق الفريق على رقم واحد ثم نتحقّق" },
  { id: "s-obs-2", type: "observation", title: "الفرق الخفي", instruction: "يقرأ الرائد المشهدين: (١) ولدٌ يحمل مظلّة حمراء ويلبس حذاءً أزرق. (٢) ولدٌ يحمل مظلّة حمراء ويلبس حذاءً أسود. ما الفرق؟ (الجواب: لون الحذاء)" },
  { id: "s-phy-1", type: "physical", title: "التماثيل", instruction: "عند «قف» يتجمّد الجميع، من يتحرّك يخسر، آخر الثابتين يكسب لفريقه" },
];
