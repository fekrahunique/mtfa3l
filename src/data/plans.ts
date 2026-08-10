/**
 * باقات الاشتراك — ثلاث فئات تُعرض على الصفحة الرئيسية بروح رحلة النشاط.
 * وكيل الذكاء الاصطناعي حصريٌّ للباقة الأعلى ليكون أقوى محفّز للترقية.
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

export const ANNUAL_MULTIPLIER = 10; // الدفع السنوي بسعر ١٠ أشهر — شهران مجانًا

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "المنطلِق",
    tagline: "ابدأ رحلتك بثقة",
    monthly: 49,
    icon: "sparkle",
    features: [
      { text: "أنشطة الاستراحة الأسبوعية جاهزة للعرض على الشاشة" },
      { text: "الأسبوع التمهيدي الحافل — شاشات حيّة يقودها الرائد" },
      { text: "إدارة فصل واحد مع النقاط والفائزين" },
      { text: "لوحة تحكم ومتابعة المستهدف أسبوعًا بأسبوع" },
      { text: "جولة إرشادية ودعم أساسي" },
    ],
    cta: "ابدأ بالمنطلِق",
  },
  {
    id: "pro",
    name: "الرائد",
    tagline: "المحتوى الكامل لرائد النشاط",
    monthly: 74,
    icon: "rocket",
    badge: "الأكثر اختيارًا",
    inherits: "كل ما في المنطلِق، وأكثر",
    features: [
      { text: "مستودع ١٠٠+ تحدٍّ ومسابقة تفاعلية جاهزة" },
      { text: "المجالات الست بأنشطتها السينمائية القابلة للّعب" },
      { text: "فصول متعددة + كبسولة المستقبل لقياس إنجاز الطلاب" },
      { text: "خطة النشاط ١٤٤٨ الرسمية بعدد الحصص" },
      { text: "هوية المواسم تلقائيًا — العودة للدراسة والمناسبات" },
    ],
    cta: "اختر الرائد",
  },
  {
    id: "premium",
    name: "الرائد المتكامل",
    tagline: "الذكاء الاصطناعي بين يديك — بلا حدود",
    monthly: 89,
    icon: "crown",
    badge: "أفضل قيمة",
    featured: true,
    inherits: "كل ما في الرائد، وأكثر",
    features: [
      { text: "وكيل الذكاء الاصطناعي: يبني لك أي لعبة أو تحدٍّ من فكرة", star: true },
      { text: "استيراد ملفات المسابقات (Word · PDF · Excel) وتنفيذها فورًا", star: true },
      { text: "تقارير وتوثيق قابلة للطباعة و PDF — الكبسولة والإنجاز والفائزون" },
      { text: "وصول مبكر للفعاليات والتحديات الجديدة أولًا" },
      { text: "دعم ذو أولوية" },
    ],
    cta: "انطلق بالمتكامل",
    nudge: "بأقل من نصف ريال إضافي يوميًا — امتلك وكيلًا يبني ألعابك بلا حدود",
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
