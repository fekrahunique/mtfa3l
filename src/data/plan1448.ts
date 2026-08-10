/**
 * دليل خطة النشاط الطلابي ١٤٤٨هـ — الإصدار السادس (وزارة التعليم).
 * تحديثات جوهرية عن ١٤٤٧: الحد الأدنى للنشاط رُفع إلى ١٠٪، و٦٤ برنامجًا في
 * خمسة مجالات (بدل ٥١)، وأصبحت المسابقات مكوّنًا رسميًا ضمن حصص النشاط،
 * والفترات اللاصفية نُظّمت في ١٠ برامج مسمّاة. يعرض هذا المرجع عدد الحصص
 * لكل برنامج للمرحلتين الابتدائية (الصفوف العليا) والمتوسطة.
 */

export interface PlanProgram { name: string; primary?: number; middle?: number; note?: string }
export interface PlanDomain { id: string; title: string; emoji: string; accent: string; accentSoft: string; programs: PlanProgram[] }

export const planChanges = {
  minShare: "رُفع الحد الأدنى لنسبة النشاط من ٥٪ إلى ١٠٪ من الجدول الأسبوعي",
  programs: "٦٤ برنامجًا في خمسة مجالات بدل ٥١ (+١٣ برنامجًا)",
  extracurricular: "الفترات اللاصفية نُظّمت في ١٠ برامج بمسميات واضحة بدل ٤",
  contests: "المسابقات أصبحت مكوّنًا رسميًا ضمن حصص النشاط (بضوابط الاختيار والتأهيل، وفق المركز الوطني للمناهج)",
  measurement: "تحوّل من تنفيذ برامج إلى تعلّم قابل للقياس بنواتج ومؤشرات ومواءمة مع تخصص المعلم",
};

export const planDomains: PlanDomain[] = [
  {
    id: "culture-arts", title: "الثقافة والفنون", emoji: "🎭", accent: "#b45309", accentSoft: "#fbbf24",
    programs: [
      { name: "الفنون البصرية والتشكيلية", primary: 6, middle: 6 },
      { name: "الأزياء السعودية", primary: 4, middle: 6 },
      { name: "الثقافة الإعلامية", primary: 4, middle: 6 },
      { name: "الفن التراثي المعاصر", primary: 5, middle: 5 },
      { name: "الفنون المسرحية", primary: 8, middle: 8 },
      { name: "حكايات مرئية (أنمي استديو)", primary: 6, middle: 11 },
      { name: "مهارات اللغة والتواصل الثقافي", primary: 4, middle: 6 },
      { name: "الكتابة الإبداعية والأدبية", primary: 5, middle: 8 },
      { name: "الحرف والمهن", primary: 4, middle: 8 },
      { name: "الخط العربي", primary: 4, middle: 6 },
    ],
  },
  {
    id: "science-tech", title: "العلوم والتقنية", emoji: "🧪", accent: "#0e7490", accentSoft: "#22d3ee",
    programs: [
      { name: "برنامج تطبيقات STEM", primary: 5, middle: 7 },
      { name: "التصميم والابتكار التقني", primary: 5, middle: 7 },
      { name: "الفضاء والاستكشاف العلمي", primary: 5, middle: 7 },
      { name: "الاستدامة وجودة الحياة", primary: 4, middle: 7 },
      { name: "الذكاء الاصطناعي", primary: 10, middle: 10 },
      { name: "إنترنت الأشياء", primary: 4, middle: 7 },
      { name: "الأمن السيبراني", primary: 4, middle: 6 },
      { name: "البحث العلمي", primary: 4, middle: 6 },
      { name: "حوكمة البيانات", primary: 3, middle: 5 },
    ],
  },
  {
    id: "citizenship", title: "المواطنة والحياة", emoji: "🤝", accent: "#15803d", accentSoft: "#4ade80",
    programs: [
      { name: "التطوع الطلابي", primary: 4, middle: 5 },
      { name: "مهارات طموحة", primary: 4, middle: 3 },
      { name: "نموذج الأمم المتحدة", primary: 8, middle: 10 },
      { name: "قيمنا حياة", primary: 12, middle: 12 },
      { name: "إرث وطموح", primary: 4, middle: 6 },
      { name: "ريادة الأعمال", primary: 4, middle: 6 },
      { name: "السيرة النبوية", primary: 4, middle: 8 },
    ],
  },
  {
    id: "sports-health", title: "الرياضة والصحة", emoji: "🏅", accent: "#b45309", accentSoft: "#fbbf24",
    programs: [
      { name: "منافسة المهارات الرياضية الجماعية", primary: 8, middle: 8 },
      { name: "منافسة المهارات الرياضية الفردية", primary: 8, middle: 8 },
      { name: "مهارات رياضات الدفاع عن النفس", primary: 8, middle: 8 },
      { name: "الرياضة والترفيه الإلكتروني", primary: 8, middle: 6 },
      { name: "الرياضات الذهنية", primary: 8, middle: 8 },
      { name: "الأولمبياد الرياضي", primary: 8, middle: 8 },
      { name: "الإسعافات الأولية", primary: 4, middle: 4 },
      { name: "اللياقة والصحة البدنية", primary: 2, middle: 2 },
      { name: "مهارات التحكيم الرياضي (أنا حكم)", primary: 3, middle: 8 },
      { name: "صحي في بيتي", primary: 3, middle: 8 },
    ],
  },
  {
    id: "scouts", title: "النشاط الكشفي", emoji: "⛺", accent: "#a16207", accentSoft: "#facc15",
    programs: [
      { name: "خشبة وحبل", primary: 12 },
      { name: "خيمة التجارب المسلية", primary: 6 },
      { name: "أشارك مجتمعي وأزرع شجرة", primary: 3 },
      { name: "وطني في قلبي", primary: 3 },
      { name: "طبقي الكشفي", primary: 3 },
      { name: "كنوز الصغار", primary: 2 },
      { name: "صافرة واصطفاف", primary: 2 },
      { name: "مخيمي التقني", middle: 10, note: "يتضمّن ساعات خارج المدرسة" },
      { name: "مجتمعي وبيئتي مسؤوليتي", middle: 6 },
      { name: "خطواتي الكشفية الصحية", middle: 4 },
      { name: "الملاحة على اليابس", middle: 3, note: "يتضمّن ساعات خارج المدرسة" },
      { name: "صناع التغيير", middle: 3 },
      { name: "مهاراتي الكشفية من الاستعداد إلى الإنجاز", middle: 3 },
    ],
  },
];

/** الأيام والمناسبات (١٢) — بحصصها المعتمدة لكل مرحلة. */
export const planOccasions: PlanProgram[] = [
  { name: "اليوم الوطني", primary: 4, middle: 4, note: "يُخصّص يوم دراسي كامل للاحتفال + الحصص المعتمدة" },
  { name: "يوم التأسيس", primary: 4, middle: 4, note: "يُخصّص يوم دراسي كامل للاحتفال + الحصص المعتمدة" },
  { name: "يوم السعودية الخضراء", primary: 4, middle: 4 },
  { name: "يوم العلم", primary: 3, middle: 2 },
  { name: "يوم اللغة العربية العالمي", primary: 2, middle: 1 },
  { name: "يوم التسامح العالمي", primary: 2, middle: 2 },
  { name: "اليوم العالمي للطفل", primary: 2, middle: 1 },
  { name: "اليوم العالمي لذوي الإعاقة", primary: 2, middle: 2 },
  { name: "يوم المعلم العالمي", primary: 2, middle: 2 },
  { name: "يوم الصحة العالمي", primary: 3, middle: 2 },
  { name: "اليوم العالمي للتعليم", primary: 2, middle: 2 },
  { name: "اليوم الدولي للأسرة", primary: 2, middle: 2 },
];

/** برامج الفترات اللاصفية (١٠) — عدد الحصص موحّد للمرحلتين. */
export const planExtracurricular: PlanProgram[] = [
  { name: "رحلة نجاح", primary: 11, middle: 11 },
  { name: "النادي الثقافي", primary: 11, middle: 11 },
  { name: "صحي مسؤوليتي", primary: 11, middle: 11 },
  { name: "الإرث والأمجاد", primary: 11, middle: 11 },
  { name: "سفراء الاستدامة والوعي البيئي", primary: 11, middle: 11 },
  { name: "مهارات المستقبل", primary: 11, middle: 11 },
  { name: "كن واعيًا", primary: 11, middle: 11 },
  { name: "صانع الأثر", primary: 6, middle: 6 },
  { name: "القيم", primary: 20, middle: 20 },
  { name: "النسك", primary: 4, middle: 4 },
];
