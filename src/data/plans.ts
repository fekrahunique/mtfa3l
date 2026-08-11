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

export const ANNUAL_MULTIPLIER = 10; // الدفع السنوي بسعر ١٠ أشهر، شهران مجانًا

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "المنطلِق",
    tagline: "ابدأ نشاطك بأدوات جاهزة",
    monthly: 49,
    icon: "sparkle",
    who: "أحتاج محتوى جاهزًا أبدأ به",
    features: [
      { text: "حصة نشاط أسبوعية جاهزة على الشاشة، بلا تحضير ولا ورق" },
      { text: "أسبوع تمهيدي حيّ يشدّ طلابك من أول يوم" },
      { text: "نظام نقاط وحوافز وإعلان فائزين" },
      { text: "لوحة تحكّم تقول لك: هذا نشاطك هذا الأسبوع" },
    ],
    cta: "ابدأ بالمنطلِق",
  },
  {
    id: "pro",
    name: "الرائد",
    tagline: "خطتك جاهزة طوال الشهر",
    monthly: 79,
    icon: "rocket",
    badge: "الخيار الموصى به",
    inherits: "كل مزايا المنطلِق، وأكثر",
    who: "أبغى خطة ومسابقات جاهزة",
    features: [
      { text: "مكتبة ١١٠+ مسابقة ونشاط جاهز للتنفيذ، بلا بحث ولا تصميم ولا إعداد من الصفر", star: true },
      { text: "أنشطة تغطّي كل المجالات (علوم، مواطنة، كشفي، رياضة، فنون) تُلعب على الشاشة" },
      { text: "خطة نشاط منظّمة: كل حصة ومناسبة في موعدها، والشاشة تتزيّن بهويتها" },
      { text: "أدِر فصولك ووزّع مجموعاتها، وتابِع إنجاز أنشطتك بلوحة ونِسَب" },
      { text: "كبسولة المستقبل: طلابك يكتبون أحلامهم، وآخر الفصل تقيسون ما تحقّق" },
    ],
    cta: "ابدأ مع الرائد",
  },
  {
    id: "premium",
    name: "الرائد المتكامل",
    tagline: "حوّل النشاط إلى تجربة يعيشها طلابك",
    monthly: 99,
    icon: "crown",
    badge: "الأفضل قيمة",
    featured: true,
    inherits: "كل مزايا الرائد، وأكثر",
    who: "أبغى تجربة متكاملة لطلابي",
    features: [
      { text: "🏆 بطولة نشاط: فرق تتنافس بتحدّيات ومخاطرة وتتويج", star: true },
      { text: "🔐 لعبة الشفرة: فرق تفكّ شفرة سرّية بالتفاوض والذكاء", star: true },
      { text: "⚡ آخر فرصة: قرارات تحت الضغط تُمارَس فيها القيم", star: true },
      { text: "👑 حزمة النخبة: ١٢ بطولة نوعية حصرية لا تظهر في الباقات الأقل", star: true },
      { text: "لوحة إنجاز وتقارير متقدّمة تقيس أثر نشاطك، وبطاقات وتقارير PDF" },
    ],
    cta: "احصل على التجربة الكاملة",
    nudge: "بفرق ٢٠ ريالًا فقط عن الرائد، تأخذ الألعاب الكبرى وحزمة النخبة كاملة",
  },
];

export function getPlan(id?: PlanId | null): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[1];
}

/** أرقام عربية-هندية لإحساس محلّي أصيل. */
export function arDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/** السعر المعروض حسب الدورة (شهري/سنوي). */
export function planPrice(plan: Plan, annual: boolean): { amount: number; period: string } {
  return annual
    ? { amount: plan.monthly * ANNUAL_MULTIPLIER, period: "﷼ / سنويًا" }
    : { amount: plan.monthly, period: "﷼ / شهريًا" };
}
