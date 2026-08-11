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
  /** جملة تحفيز صغيرة أسفل الأزرار (للباقة الأعلى) */
  nudge?: string;
}

export const ANNUAL_MULTIPLIER = 10; // الدفع السنوي بسعر ١٠ أشهر، شهران مجانًا

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "المنطلِق",
    tagline: "ابدأ رحلتك بثقة",
    monthly: 49,
    icon: "sparkle",
    features: [
      { text: "حصة نشاط جاهزة كل أسبوع تُعرض على الشاشة، بلا تحضير ولا ورق" },
      { text: "أسبوع تمهيدي حيّ يكسر الجليد ويشدّ طلابك من أول يوم" },
      { text: "وزّع النقاط وأعلِن الفائزين، وأشعِل التنافس في فصلك" },
      { text: "لوحة تحكّم تريك خطوتك القادمة في ثوانٍ" },
      { text: "جولة تعريفية تمشّيك على كل أداة بلمسة" },
    ],
    cta: "ابدأ بالمنطلِق",
  },
  {
    id: "pro",
    name: "الرائد",
    tagline: "المحتوى الكامل لرائد النشاط",
    monthly: 79,
    icon: "rocket",
    badge: "الأكثر اختيارًا",
    inherits: "كل ما في المنطلِق، وأكثر",
    features: [
      { text: "مكتبة ١٢٢ مسابقة وتحدٍّ تفاعلي، اختر واعرض في ثوانٍ" },
      { text: "أنشطة كل المجالات (علوم، مواطنة، كشفي، رياضة، فنون) تُلعب على الشاشة" },
      { text: "أدِر فصولك كلها ووزّع مجموعاتها بضغطة" },
      { text: "كبسولة المستقبل: طلابك يكتبون أحلامهم، وآخر الفصل تقيسون ما تحقّق" },
      { text: "سنتك مخطّطة لك: كل حصة ومناسبة في موعدها، والشاشة تتزيّن بهوية كل مناسبة" },
    ],
    cta: "اختر الرائد",
  },
  {
    id: "premium",
    name: "الرائد المتكامل",
    tagline: "التجربة الكاملة والألعاب الكبرى",
    monthly: 99,
    icon: "crown",
    badge: "أفضل قيمة",
    featured: true,
    inherits: "كل ما في الرائد، وأكثر",
    features: [
      { text: "بطولة نشاط: قسّم فصلك فرقًا في بطولة حماسية بمخاطرة وأحداث وتتويج", star: true },
      { text: "لعبة الشفرة: فرق تتنافس على فكّ شفرة سرّية بالذكاء والتفاوض", star: true },
      { text: "حزمة النخبة: ١٢ بطولة نوعية في المستودع حصريّة لباقتك وحدها", star: true },
      { text: "بطاقات وأدوات جاهزة للطباعة، وتقرير إنجاز طلابك PDF" },
    ],
    cta: "انطلق بالمتكامل",
    nudge: "بأقل من ريال إضافي يوميًا، خذ الألعاب الكبرى والتجربة الكاملة لفصلك",
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
