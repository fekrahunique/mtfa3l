export interface Activity {
  id: string;
  title: string;
  category: "classroom" | "extracurricular";
  description: string;
  minutes: number;
  participants: string;
}

export const activities: Activity[] = [
  {
    id: "act-1",
    title: "ركن القراءة الحرة",
    category: "classroom",
    description: "خمس عشرة دقيقة قراءة صامتة يختار فيها كل طالب كتابه، ثم مشاركة سريعة لفكرة واحدة.",
    minutes: 15,
    participants: "الفصل كامل",
  },
  {
    id: "act-2",
    title: "تحدي حل المسائل السريع",
    category: "classroom",
    description: "مسابقة فردية بالتوقيت على مسائل رياضية مناسبة للمرحلة، مع لوحة نقاط مباشرة.",
    minutes: 20,
    participants: "فرق ثنائية",
  },
  {
    id: "act-3",
    title: "يوم اللغة العربية",
    category: "classroom",
    description: "نشاط أسبوعي يبرز كلمة وتعبيرًا جديدًا، مع بطاقة إنجاز لكل طالب يشارك.",
    minutes: 25,
    participants: "الفصل كامل",
  },
  {
    id: "act-4",
    title: "الفسحة النشيطة",
    category: "extracurricular",
    description: "محطات حركية بسيطة في الساحة تعزز اللياقة وتقلل وقت الجلوس بين الحصص.",
    minutes: 15,
    participants: "المرحلة كاملة",
  },
  {
    id: "act-5",
    title: "إذاعة مدرسية تفاعلية",
    category: "extracurricular",
    description: "فقرات إذاعية جاهزة بأسئلة تفاعلية للطلاب مع نقاط تُحسب لفصولهم.",
    minutes: 10,
    participants: "المدرسة كاملة",
  },
  {
    id: "act-6",
    title: "مسابقة الخط الجميل",
    category: "extracurricular",
    description: "مسابقة أسبوعية بمعايير تصحيح جاهزة وشهادات تقدير قابلة للطباعة فورًا.",
    minutes: 30,
    participants: "تسجيل فردي",
  },
];

export interface Tool {
  id: string;
  title: string;
  description: string;
}

export const tools: Tool[] = [
  { id: "tool-1", title: "مولّد شهادات التميز", description: "أنشئ شهادة مخصصة لكل طالب خلال ثوانٍ." },
  { id: "tool-2", title: "عجلة الأسئلة العشوائية", description: "اختر فئة الأسئلة وخلّها تدور أمام الفصل." },
  { id: "tool-3", title: "مؤقت المسابقات", description: "مؤقت مرئي كبير يناسب عرضه على الشاشة." },
  { id: "tool-4", title: "لوحة النقاط الجماعية", description: "تابع نقاط الفرق أو الفصول في مكان واحد." },
];
