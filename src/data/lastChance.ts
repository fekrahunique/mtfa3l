/**
 * بيانات لعبة «آخر فرصة» — القيم تُمارَس لا تُلقَّن، والفوز منفصل عن القيم.
 * كل قرار/تحدٍّ يحمل «وسوم قيم» (values) تُحصى حين يمارسها الفريق، بلا تقييم نفسي مصطنع.
 * التحديات يحكّمها الرائد. المحتوى منفصل عن المحرّك ليُضاف إليه بلا تعديل المنطق.
 */

export type LCDifficultyId = "easy" | "medium" | "hard";

export const DIFFICULTIES: { id: LCDifficultyId; label: string; emoji: string; hearts: number }[] = [
  { id: "easy", label: "مبتدئ", emoji: "🟢", hearts: 3 },
  { id: "medium", label: "متوسط", emoji: "🟡", hearts: 3 },
  { id: "hard", label: "متقدّم", emoji: "🔴", hearts: 2 },
];

export const AGE_GROUPS = [
  "أول ابتدائي", "ثاني ابتدائي", "ثالث ابتدائي", "رابع ابتدائي",
  "خامس ابتدائي", "سادس ابتدائي", "أول متوسط", "ثاني متوسط", "ثالث متوسط",
];

export const DURATIONS = [15, 20, 30, 45] as const;
export const START_BALANCE = 1000;
export const START_ENERGY = 3;

/* ═══════════ القيم ═══════════ */

export interface LCValue { key: string; emoji: string; label: string }

export const VALUES: LCValue[] = [
  { key: "decision", emoji: "🎯", label: "اتخاذ القرار" },
  { key: "think", emoji: "🧠", label: "التفكير قبل القرار" },
  { key: "time", emoji: "⏳", label: "إدارة الوقت" },
  { key: "risk", emoji: "🔥", label: "إدارة المخاطرة" },
  { key: "cooperate", emoji: "🤝", label: "التعاون" },
  { key: "persevere", emoji: "💪", label: "المثابرة" },
  { key: "initiative", emoji: "🌱", label: "المبادرة" },
  { key: "honest", emoji: "⚖️", label: "الأمانة" },
];

export const valueLabel = (key: string) => VALUES.find((v) => v.key === key)?.label ?? key;
export const valueEmoji = (key: string) => VALUES.find((v) => v.key === key)?.emoji ?? "•";

/** أسباب القرار — تُسأل بعد كل قرار: «ما الذي اعتمدتم عليه؟» (تدخل التقرير كأسلوب لا كحكم). */
export const DECISION_REASONS = [
  "فكّرنا مليًّا قبل القرار",
  "اعتمدنا على سرعتنا",
  "انتهزنا الفرصة رغم المخاطرة",
  "ما كان عندنا وقت كافٍ",
  "قرّرنا نتعاون",
  "سبب آخر",
];

/* ═══════════ القرارات (قلب اللعبة) ═══════════ */

export interface LCOption {
  label: string;
  sub?: string;
  points: number;
  hearts?: number;   // تغيّر الأرواح (+/-)
  energy?: number;   // تغيّر الطاقة (+/-)
  risk?: boolean;    // خيار مخاطرة (يُحسب في «كم مرة خاطرتم»)
  help?: boolean;    // خيار مساعدة/عطاء (يُحسب في «كم مرة تعاونتم»)
  note?: string;     // نتيجة تظهر بعد الاختيار (لا حكم أخلاقي)
}

export interface LCDecision {
  id: string;
  title: string;
  scenario: string;
  values: string[];        // القيم التي يمارسها الفريق بمجرّد مواجهة القرار
  discussSeconds?: number;  // مهلة نقاش قبل الاختيار
  options: LCOption[];
}

export const DECISIONS: LCDecision[] = [
  {
    id: "d-rush", title: "لا تتسرّعوا", values: ["decision", "think"], discussSeconds: 20,
    scenario: "أمامكم طريقان، ولا تعرفون تمامًا ما ينتظركم في الصعب، فكّروا قبل أن تختاروا",
    options: [
      { label: "المهمة السهلة", sub: "مضمونة", points: 300 },
      { label: "المهمة الصعبة", sub: "احتمال النجاح مجهول", points: 1000, risk: true, note: "خيار جريء، النتيجة بيد التحدّي القادم" },
    ],
  },
  {
    id: "d-time", title: "الوقت", values: ["time", "decision"], discussSeconds: 20,
    scenario: "ثلاث مهام أمامكم، ولا تستطيعون تنفيذ إلا واحدة، ليس الهدف دائمًا أعلى مكافأة",
    options: [
      { label: "سهلة · ٦٠ ثانية", points: 300 },
      { label: "متوسطة · ٤٥ ثانية", points: 600 },
      { label: "صعبة · ٣٠ ثانية", points: 1200, risk: true },
    ],
  },
  {
    id: "d-resource", title: "المورد الأخير", values: ["decision", "risk"],
    scenario: "معكم طاقة محدودة، أين تصرفونها؟ ما يُنفَق لا يعود بسهولة",
    options: [
      { label: "طاقة واحدة", sub: "وقت إضافي في التحدّي القادم", points: 0, energy: -1, note: "وفّرتم الباقي لموقف أصعب" },
      { label: "طاقتان", sub: "إعادة محاولة", points: 0, energy: -2, note: "راهنتم على فرصة ثانية" },
      { label: "لا شيء الآن", sub: "احتفظوا بطاقتكم", points: 0, note: "الصبر مورد أيضًا" },
    ],
  },
  {
    id: "d-together", title: "لن تفوزوا وحدكم", values: ["cooperate", "initiative"],
    scenario: "لن تُكملوا هذه المهمة بمعلوماتكم وحدها، والمساعدة لها ثمن",
    options: [
      { label: "اطلبوا المساعدة بثمن", sub: "ادفعوا ٣٠٠ لفريق آخر", points: -300, note: "دفعتم لتكملوا" },
      { label: "ساعِدوا فريقًا مجانًا", sub: "بلا مقابل مباشر", points: 0, help: true, note: "العطاء بلا مقابل قرار بحدّ ذاته" },
      { label: "ابحثوا عن حلٍّ آخر", sub: "بأنفسكم", points: 100, note: "الاعتماد على النفس مسارٌ أيضًا" },
    ],
  },
  {
    id: "d-shortcut", title: "الطريق المختصر", values: ["decision", "risk"],
    scenario: "فرصة استثنائية لتخطّي المرحلة، لكن لكل اختصار ثمن",
    options: [
      { label: "اختصِروا الطريق", sub: "تخسرون حياة", points: 500, hearts: -1, risk: true, note: "هل كان يستحق؟ سؤال لكم لاحقًا" },
      { label: "أكمِلوا طبيعيًا", sub: "بلا خسارة", points: 200, note: "الطريق الأطول أحيانًا أأمن" },
    ],
  },
  {
    id: "d-honest", title: "الأمانة", values: ["honest", "decision"],
    scenario: "اكتشفتم أن النظام أعطاكم معلومة إضافية بالخطأ، تساعدكم على الفوز",
    options: [
      { label: "استخدِموا المعلومة", sub: "قد تفوزون بها", points: 500, note: "مسارٌ سريع، تذكّروه في النقاش" },
      { label: "أبلِغوا عن الخطأ", sub: "بلا نقاط مباشرة", points: 0, energy: 1, note: "كسبتم ثقةً وطاقة، لا صفقة نقاط" },
    ],
  },
];

/* ═══════════ التحديات (يحكّمها الرائد) ═══════════ */

export interface LCChallenge {
  id: string;
  type: "memory" | "speed" | "puzzle" | "team" | "physical" | "creative";
  title: string;
  instruction: string;
  values: string[];
}

export const TYPE_META: Record<LCChallenge["type"], { emoji: string; label: string }> = {
  memory: { emoji: "🧠", label: "ذاكرة" },
  speed: { emoji: "⚡", label: "سرعة" },
  puzzle: { emoji: "🧩", label: "لغز" },
  team: { emoji: "🤝", label: "تعاون" },
  physical: { emoji: "🏃", label: "حركة" },
  creative: { emoji: "💡", label: "إبداع" },
};

export const CHALLENGES: LCChallenge[] = [
  { id: "c-mem", type: "memory", title: "سلسلة الذاكرة", instruction: "يقرأ الرائد ٥ أرقام مرّة واحدة، ويعيدها الفريق بالترتيب نفسه", values: ["think"] },
  { id: "c-spd", type: "speed", title: "أسرع من الوقت", instruction: "٣٠ ثانية لترتيب ٦ عناصر بالترتيب الصحيح", values: ["time", "decision"] },
  { id: "c-puz", type: "puzzle", title: "لغز المنطق", instruction: "ثلاثة في صفّ: سالم ليس الأول وفهد خلف سالم، من الأول؟ (الجواب: أحمد)", values: ["think", "decision"] },
  { id: "c-team", type: "team", title: "رسالة صامتة", instruction: "يوصل الفريق كلمة من أوّله لآخره بالإشارة فقط دون كلام", values: ["cooperate"] },
  { id: "c-phy", type: "physical", title: "التماثيل", instruction: "عند «قف» يتجمّد الجميع، من يتحرّك يخسر، آخر الثابتين يكسب لفريقه", values: ["persevere"] },
  { id: "c-cre", type: "creative", title: "فكرة في دقيقة", instruction: "ابتكروا حلًّا سريعًا لمشكلة يطرحها الرائد خلال دقيقة", values: ["initiative"] },
];

export const CHALLENGE_WIN = 400;

/** تحدّي العودة — أصعب، ولا يُمنح مجانًا. */
export const COMEBACK: LCChallenge = {
  id: "c-comeback", type: "puzzle", title: "فرصة العودة",
  instruction: "تحدٍّ صعب خلال ٤٥ ثانية، النجاح يعيد لكم حياة، والفشل يبقيكم في السباق بموارد أقل",
  values: ["persevere"],
};
export const COMEBACK_WIN_POINTS = 1500;

/* ═══════════ التحدّي النهائي ═══════════ */

export interface LCFinalOption { id: "safe" | "bold" | "all"; emoji: string; label: string; sub: string }
export const FINAL_OPTIONS: LCFinalOption[] = [
  { id: "safe", emoji: "🟢", label: "آمن", sub: "+٥٠٠ مضمونة تقريبًا" },
  { id: "bold", emoji: "🟡", label: "جريء", sub: "+١٥٠٠ بمخاطرة متوسطة" },
  { id: "all", emoji: "🔴", label: "كل شيء", sub: "راهنوا بنصف رصيدكم × ٢ أو خسارته" },
];

/* ═══════════ الانعكاس والتطبيق ═══════════ */

export const REFLECTION_QUESTIONS = [
  "ما القرار الذي ندمتم عليه أكثر؟ ولماذا؟",
  "متى كان التعاون أفضل من العمل الفردي؟",
  "هل كل مخاطرة تستحق التجربة؟",
  "ماذا فعلتم عندما فشلتم؟",
  "ما قرارٌ واحد ستغيّرونه لو لعبتم مرّة أخرى؟",
];

export const TAKE_HOME: { key: string; emoji: string; label: string }[] = [
  { key: "cooperate", emoji: "🤝", label: "سأساعد شخصًا هذا الأسبوع" },
  { key: "time", emoji: "⏳", label: "سأرتّب وقتي" },
  { key: "think", emoji: "🧠", label: "سأفكّر قبل قرار مهم" },
  { key: "persevere", emoji: "💪", label: "سأحاول مرّة أخرى بعد الفشل" },
  { key: "initiative", emoji: "🌱", label: "سأبادر بفكرة" },
];

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
