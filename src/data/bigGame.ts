/**
 * بيانات «بطولة نشاط» — المحتوى منفصل عن محرّك اللعبة كي يُضاف إليه لاحقًا بلا تعديل الكود.
 * كل تحدٍّ يُحكَّم من الرائد (نجاح/فشل) لأن التنفيذ بدني/شفهي أمام الطلاب.
 */

export type BigChallengeType =
  | "memory" | "speed" | "team" | "puzzle" | "creative"
  | "presentation" | "physical" | "decision" | "observation";

export const TYPE_META: Record<BigChallengeType, { emoji: string; label: string }> = {
  memory: { emoji: "🧠", label: "ذاكرة" },
  speed: { emoji: "⚡", label: "سرعة" },
  team: { emoji: "🤝", label: "فريق" },
  puzzle: { emoji: "🧩", label: "لغز" },
  creative: { emoji: "🎨", label: "إبداع" },
  presentation: { emoji: "🎤", label: "عرض" },
  physical: { emoji: "🏃", label: "حركة" },
  decision: { emoji: "🎯", label: "قرار" },
  observation: { emoji: "🔎", label: "ملاحظة" },
};

export interface BigChallenge {
  id: string;
  type: BigChallengeType;
  title: string;
  instruction: string;
  difficulty: 1 | 2 | 3;
}

export const CHALLENGES: BigChallenge[] = [
  { id: "c-mem-1", type: "memory", title: "سلسلة الأرقام", instruction: "يقرأ الرائد ٥ أرقام مرّة واحدة، ويعيدها الفريق بالترتيب نفسه", difficulty: 1 },
  { id: "c-mem-2", type: "memory", title: "ماذا تغيّر؟", instruction: "يعرض الرائد ٦ أشياء ١٠ ثوانٍ، يخفي واحدًا، ويخمّن الفريق المفقود", difficulty: 2 },
  { id: "c-mem-3", type: "memory", title: "خريطة الذاكرة", instruction: "احفظوا ترتيب ٨ كلمات في ١٥ ثانية، ثم رتّبوها من الذاكرة", difficulty: 3 },
  { id: "c-spd-1", type: "speed", title: "أسرع من يقف", instruction: "يذكر الرائد صفة، وأول فريق يجد بينه مَن تنطبق عليه ويقف يكسب", difficulty: 1 },
  { id: "c-spd-2", type: "speed", title: "عدّ تنازلي بالمقلوب", instruction: "عدّوا من ٣٠ إلى ٠ نزولًا بالأرقام الزوجية فقط، بأسرع وقت وبلا خطأ", difficulty: 2 },
  { id: "c-team-1", type: "team", title: "الجسر البشري", instruction: "يصطفّ الفريق ويوصل رسالة بالإشارة فقط من أوّله لآخره دون كلام", difficulty: 2 },
  { id: "c-team-2", type: "team", title: "برج الأيدي", instruction: "يبني الفريق أطول تسلسل أيدٍ متشابكة يقف ثابتًا ١٠ ثوانٍ", difficulty: 1 },
  { id: "c-puz-1", type: "puzzle", title: "لغز المنطق", instruction: "ثلاثة في صفّ: أحمد ليس الأول وسالم خلف أحمد، من الأول؟ الجواب: فهد", difficulty: 2 },
  { id: "c-puz-2", type: "puzzle", title: "الكلمة المخفيّة", instruction: "رتّبوا حروف «ط ا ش ن» لتكوين كلمة، الجواب: نشاط", difficulty: 1 },
  { id: "c-puz-3", type: "puzzle", title: "المتتالية", instruction: "أكملوا: ٢، ٤، ٨، ١٦، ؟ — الجواب: ٣٢، واشرحوا القاعدة", difficulty: 3 },
  { id: "c-cre-1", type: "creative", title: "الاختراع المدمج", instruction: "ادمجوا «مظلّة + حقيبة» في اختراع واحد، سمّوه واذكروا فائدته في ٢٠ ثانية", difficulty: 2 },
  { id: "c-cre-2", type: "creative", title: "شعار الفريق", instruction: "ابتكروا هتافًا قصيرًا لفريقكم وأدّوه بحماس", difficulty: 1 },
  { id: "c-pre-1", type: "presentation", title: "ثلاثون ثانية", instruction: "أقنعوا الجميع بفكرة «لماذا فريقنا يستحقّ الفوز» في ٣٠ ثانية", difficulty: 2 },
  { id: "c-phy-1", type: "physical", title: "تحدّي التماثيل", instruction: "عند «قف» يتجمّد الجميع، من يتحرّك يخسر، آخر الثابتين يكسب لفريقه", difficulty: 1 },
  { id: "c-phy-2", type: "physical", title: "المرآة", instruction: "قائد يؤدّي حركات والفريق يقلّدها كالمرآة دون تأخير", difficulty: 2 },
  { id: "c-dec-1", type: "decision", title: "الميزانية الذكية", instruction: "لديكم ٥٠٠ لرحلة: باص ٢٠٠، وجبات ١٥٠، ألعاب ١٠٠، تذكارات ١٠٠، ماذا تُلغون ولماذا؟", difficulty: 2 },
  { id: "c-obs-1", type: "observation", title: "عين الصقر", instruction: "كم نافذة في هذه القاعة؟ يتّفق الفريق على رقم واحد ثم نعدّ معًا", difficulty: 1 },
  { id: "c-obs-2", type: "observation", title: "الفرق الدقيق", instruction: "يصف الرائد مشهدين متشابهين، ويكتشف الفريق الفرق الوحيد بينهما", difficulty: 2 },
];

export interface BigEvent {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  kind: "allMinus" | "randomPlus" | "golden" | "allPlus" | "shieldAll";
  value: number;
}

export const EVENTS: BigEvent[] = [
  { id: "e-golden", emoji: "⚡", title: "الجولة الذهبية", desc: "مكافأة التحدّي القادم مضاعفة ×٢ لكل الفرق", kind: "golden", value: 2 },
  { id: "e-storm", emoji: "🌪️", title: "العاصفة", desc: "كل الفرق تخسر ٢٠٠ من رصيدها", kind: "allMinus", value: 200 },
  { id: "e-gift", emoji: "🎁", title: "هدية مجهولة", desc: "فريق عشوائي يحصل على ٥٠٠", kind: "randomPlus", value: 500 },
  { id: "e-bonus", emoji: "✨", title: "نفحة الحظّ", desc: "كل الفرق تربح ١٥٠ تشجيعًا", kind: "allPlus", value: 150 },
];

export const TEAM_PRESETS = [
  { emoji: "🦅", name: "الصقور", color: "#3b82f6" },
  { emoji: "🐯", name: "النمور", color: "#22c55e" },
  { emoji: "⚡", name: "البرق", color: "#f59e0b" },
  { emoji: "🦁", name: "الأسود", color: "#a855f7" },
  { emoji: "🦈", name: "القروش", color: "#06b6d4" },
  { emoji: "🐝", name: "النحل", color: "#eab308" },
  { emoji: "🐺", name: "الذئاب", color: "#64748b" },
  { emoji: "🐉", name: "التنانين", color: "#ef4444" },
];

export const AGE_GROUPS = [
  "أول ابتدائي", "ثاني ابتدائي", "ثالث ابتدائي", "رابع ابتدائي",
  "خامس ابتدائي", "سادس ابتدائي", "أول متوسط", "ثاني متوسط", "ثالث متوسط",
];

export const DURATIONS = [15, 20, 30, 45, 60] as const;

export const DIFFICULTIES = [
  { id: "easy", label: "سهل", max: 1, mult: 1 },
  { id: "medium", label: "متوسط", max: 2, mult: 1.4 },
  { id: "hard", label: "متقدّم", max: 3, mult: 1.8 },
] as const;

export type DifficultyId = (typeof DIFFICULTIES)[number]["id"];

/** المكافأة الأساسية حسب صعوبة التحدّي. */
export const BASE_REWARD: Record<1 | 2 | 3, number> = { 1: 300, 2: 500, 3: 800 };

/** الجوائز الجانبية تُمنح يدويًا من الرائد في النهاية. */
export const SIDE_AWARDS = [
  { emoji: "🧠", label: "أذكى استراتيجية" },
  { emoji: "⚡", label: "أسرع استجابة" },
  { emoji: "🤝", label: "أفضل تعاون" },
  { emoji: "🎯", label: "أفضل مخاطرة" },
  { emoji: "🔥", label: "أفضل عودة" },
  { emoji: "💡", label: "أكثر إبداعًا" },
];
