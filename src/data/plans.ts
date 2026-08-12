/**
 * باقات الاشتراك — ثلاث فئات تُعرض على الصفحة الرئيسية بروح رحلة النشاط.
 * كل ميزة مذكورة موجودة فعلًا في المنصة. الألعاب الكبرى (بطولة نشاط + الشفرة)
 * هي محفّز الترقية للباقة الأعلى.
 */

export type PlanId = "starter" | "pro" | "premium";
export type PlanIcon = "sparkle" | "rocket" | "crown";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number; // ﷼ / شهريًا
  icon: PlanIcon;
  badge?: string; // شارة فوق البطاقة
  featured?: boolean; // البطاقة المميّزة (الأعلى)
  inherits?: string; // «كل ما في السابقة، وأكثر»
  features: { text: string; star?: boolean }[];
  cta: string;
  /** لمن هذه الباقة؟ يظهر في مساعد الاختيار «ماذا تحتاج؟» */
  who: string;
  /** جملة تحفيز صغيرة أسفل الأزرار (للباقة الأعلى) */
  nudge?: string;
}

export const TERM_MONTHS = 3; // الترم الدراسي ≈ ٣ أشهر (السنة ثلاثة فصول)

export const PLANS: Plan[] = [
  {
    id: "pro",
    name: "الرائد",
    tagline: "خطّط ونفّذ",
    monthly: 79,
    icon: "rocket",
    who: "أبغى محتوى وخطة جاهزة",
    features: [
      { text: "مكتبة ١١٠+ مسابقة ونشاط جاهز للتنفيذ، بلا بحث ولا تصميم ولا إعداد من الصفر", star: true },
      { text: "الحصص الأسبوعية الجاهزة والأسبوع التمهيدي الحيّ على الشاشة" },
      { text: "أنشطة تغطّي كل المجالات (علوم، مواطنة، كشفي، رياضة، فنون)" },
      { text: "خطة نشاط منظّمة: كل حصة ومناسبة في موعدها" },
      { text: "النقاط والحوافز وإعلان الفائزين" },
      { text: "المحتوى الجديد والتحديثات أوّلًا بأوّل" },
    ],
    cta: "ابدأ مع الرائد",
  },
  {
    id: "premium",
    name: "الرائد المتكامل",
    tagline: "خطّط، نفّذ، قِس، وخلّ الطلاب يعيشون التجربة",
    monthly: 99,
    icon: "crown",
    badge: "الأفضل قيمة",
    featured: true,
    inherits: "كل مزايا الرائد، وأكثر",
    who: "أبغى تجربة متكاملة لطلابي",
    features: [
      { text: "🎮 الألعاب الكبرى: بطولة نشاط، الشفرة، آخر فرصة", star: true },
      { text: "📅 المخطّط الذكي: خطة شهرك تُقترح تلقائيًا من محتواك", star: true },
      { text: "📊 قياس أثر النشاط بعد كل فعالية، و📸 توثيق الأنشطة وأرشيفها", star: true },
      { text: "📄 ملف إنجاز PDF جاهز آخر الشهر (غلاف وملخّص وأنشطة وإحصاءات)", star: true },
      { text: "👑 حزمة النخبة: ١٢ بطولة نوعية حصرية في المستودع" },
    ],
    cta: "احصل على التجربة الكاملة",
    nudge: "بفرق ٢٠ ريالًا فقط عن الرائد، تأخذ الألعاب والمخطّط والتوثيق وملف الإنجاز",
  },
];

export function getPlan(id?: PlanId | null): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** أرقام عربية-هندية لإحساس محلّي أصيل. */
export function arDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/** السعر المعروض حسب الدورة (شهري/للترم). المعامل الثاني: true = للترم. */
export function planPrice(plan: Plan, perTerm: boolean): { amount: number; period: string } {
  return perTerm
    ? { amount: plan.monthly * TERM_MONTHS, period: "﷼ / الترم" }
    : { amount: plan.monthly, period: "﷼ / شهريًا" };
}
