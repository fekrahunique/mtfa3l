/**
 * مولّد أنشطة محلي — يبتكر لرائد النشاط هيكل نشاط ومسابقة حول فكرته.
 * يعمل دون خادم أو إنترنت. جاهز لاحقًا للاستبدال بنموذج ذكاء اصطناعي حقيقي
 * (Claude API) عند توفّر خادم آمن يحمل المفتاح.
 */

export interface GeneratedActivity {
  title: string;
  outcomes: string[];
  values: string[];
  steps: string[];
  quiz: { question: string; answer: string }[];
}

/** مكتبة مسابقات جاهزة لمواضيع المواطنة الرقمية الشائعة. */
const LIBRARY: { match: RegExp; quiz: { question: string; answer: string }[] }[] = [
  {
    match: /تصيّد|تصيد|رابط|احتيال|اختراق|أمن|سيبر/,
    quiz: [
      { question: "الضغط على رابط مجهول يعدك بجائزة.", answer: "خطأ." },
      { question: "التحقق من عنوان الموقع قبل إدخال بياناتي.", answer: "صح." },
      { question: "مشاركة كلمة المرور مع صديق مقرّب.", answer: "خطأ." },
      { question: "الإبلاغ عن رسالة مشبوهة للمعلم أو ولي الأمر.", answer: "صح." },
      { question: "تحميل تطبيق من مصدر غير معروف.", answer: "خطأ." },
      { question: "استخدام كلمة مرور قوية ومختلفة لكل حساب.", answer: "صح." },
    ],
  },
  {
    match: /تنمر|تنمّر|كلمات|احترام|إساءة|مشاعر/,
    quiz: [
      { question: "كتابة تعليق ساخر يجرح زميلي.", answer: "خطأ." },
      { question: "الرد بكلمة طيبة تشجّع من حولي.", answer: "صح." },
      { question: "نشر صورة زميلي دون إذنه للسخرية.", answer: "خطأ." },
      { question: "الدفاع عن زميل يتعرّض للإساءة.", answer: "صح." },
      { question: "مشاركة رسالة مؤذية في مجموعة الدردشة.", answer: "خطأ." },
      { question: "الإبلاغ عن محتوى مسيء بدل مشاركته.", answer: "صح." },
    ],
  },
  {
    match: /أخبار|إعلام|مزيف|شائع|مصدر|صحاف/,
    quiz: [
      { question: "مشاركة خبر عاجل فورًا قبل التحقق منه.", answer: "خطأ." },
      { question: "البحث عن مصدر موثوق قبل تصديق الخبر.", answer: "صح." },
      { question: "تصديق كل ما يصلني في مجموعات الدردشة.", answer: "خطأ." },
      { question: "التوقف والتفكير قبل نشر أي معلومة.", answer: "صح." },
      { question: "نشر إشاعة لأنها مثيرة ومضحكة.", answer: "خطأ." },
      { question: "الاعتماد على القنوات الرسمية لأخبار المدرسة.", answer: "صح." },
    ],
  },
  {
    match: /خصوصية|بيانات|كلمة مرور|معلومات شخصية/,
    quiz: [
      { question: "كتابة اسمي وعنواني الكامل لأي موقع.", answer: "خطأ." },
      { question: "الاستئذان قبل نشر صورة صديقي.", answer: "صح." },
      { question: "حفظ بياناتي الشخصية وعدم مشاركتها.", answer: "صح." },
      { question: "مشاركة موقعي الحالي مع الغرباء.", answer: "خطأ." },
      { question: "قفل جهازي بكلمة مرور.", answer: "صح." },
      { question: "الدخول لحساب غيري دون إذنه.", answer: "خطأ." },
    ],
  },
];

function quizFor(topic: string): { question: string; answer: string }[] {
  const found = LIBRARY.find((l) => l.match.test(topic));
  if (found) return found.quiz;
  // هيكل عام يعدّله المعلم بلمسته حول فكرته.
  return [
    { question: `ممارسة صحيحة تتعلق بـ«${topic}».`, answer: "صح." },
    { question: `تصرّف خاطئ يخالف «${topic}».`, answer: "خطأ." },
    { question: `سلوك إيجابي يعزّز «${topic}».`, answer: "صح." },
    { question: `موقف ينبغي تجنّبه في «${topic}».`, answer: "خطأ." },
  ];
}

export function generateActivity(topicInput: string): GeneratedActivity {
  const topic = topicInput.trim() || "موضوع اليوم";
  const steps = [
    `اليوم نكتشف مع بعض: ${topic}! جاهزين؟ 🚀`,
    "المعلم يعرض موقفًا أو سؤالًا، وننقسم مجموعات نتناقش سوا",
    "كل مجموعة تفكّر وترفع إجابتها بسرعة: صح أو خطأ؟",
    "نتعلّم من كل إجابة، ونربطها بالفكرة الأساسية",
    `وفي الختام نلخّص أهم رسالة عن ${topic} 🌟`,
  ];
  return {
    title: topic,
    outcomes: [`التعرّف إلى ${topic} وأهميته.`, `تمييز الممارسات الصحيحة والخاطئة في ${topic}.`],
    values: ["التعاون", "الأمانة", "العزيمة"],
    steps,
    quiz: quizFor(topic),
  };
}

/** اقتراحات مواضيع سريعة للمعلم. */
export const TOPIC_SUGGESTIONS = [
  "التصيّد الإلكتروني",
  "التنمّر الرقمي",
  "الأخبار المزيفة",
  "حماية الخصوصية",
  "احترام الآخرين على الإنترنت",
];
