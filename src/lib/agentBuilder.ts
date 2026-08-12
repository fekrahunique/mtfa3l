/**
 * وكيل بناء التحديات — يقرأ فكرة الرائد (أو ملفًا وصفيًّا لمسابقة)
 * ويبنيها تحدّيًا قابلًا للّعب فعليًا: يختار محرّك اللعب الأنسب ويولّد محتواه.
 * يعمل محليًا بلا خادم. جاهز مستقبلًا للاستبدال بنموذج Claude خلف خادم آمن.
 */

import type { ChallengeType, ChallengeContent } from "../activities/ChallengePlayer";

export interface BuiltChallenge {
  title: string;
  type: ChallengeType;
  content: ChallengeContent;
  engineLabel: string; // اسم المحرّك المختار (عربي)
  summary: string; // ملخّص ما بُني
  buildLog: string[]; // خطوات الوكيل أثناء البناء
}

export const ENGINE_LABEL: Record<ChallengeType, string> = {
  quizRace: "سباق الأسئلة",
  predict: "التوقّع والتصويت",
  sort: "التصنيف إلى مجموعات",
  order: "الترتيب الصحيح",
  budget: "توزيع الميزانية",
  timer: "التحدّي الزمني والتحكيم",
  map: "خريطة المحطّات",
  xo: "لعبة إكس-أو",
  reveal: "تخمين بالتلميحات",
  duel: "أيهما؟ مبارزة",
  board: "صندوق التحدّي",
};

const norm = (s: string) => s.replace(/[.،؛]+\s*$/u, "").trim();
const lines = (t: string) => t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const has = (t: string, re: RegExp) => re.test(t);

/** يكتشف طلب لعبة إكس-أو (XO / تيك تاك تو) بصيغها المختلفة. */
function isXO(t: string): boolean {
  const s = t.toLowerCase();
  if (/تيك\s*تاك|تكتك|إكس\s*[أا]?و|اكس\s*[أا]?و|tic[\s-]*tac/u.test(s)) return true;
  if (/\bx\s*(?:و|and|&|-)?\s*o\b/.test(s)) return true;
  if (/\bxo\b|\boxo\b/.test(s)) return true;
  if (/لعب/u.test(s) && /\bx\b/.test(s) && /\bo\b/.test(s)) return true;
  return false;
}

/* ————— مستخرجات ————— */

/** أزواج سؤال/جواب من صيغ متعددة: «س: … ج: …» أو «…؟ = …» أو سؤال يليه جواب. */
function extractQA(ls: string[]): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    // صيغة مضمّنة: س: … / ج: …
    let m = l.match(/^(?:س|سؤال)\s*[:：]?\s*(.+?)\s*(?:\|\s*)?(?:ج|جواب|الجواب)\s*[:：]\s*(.+)$/u);
    if (m) { out.push({ q: norm(m[1]), a: norm(m[2]) }); continue; }
    // سؤال؟ = جواب  |  سؤال؟ - جواب  |  سؤال؟ : جواب
    m = l.match(/^(.+؟)\s*[=\-:–]\s*(.+)$/u);
    if (m) { out.push({ q: norm(m[1]), a: norm(m[2]) }); continue; }
    // «صح/خطأ» على شكل: عبارة (صح) أو عبارة — خطأ
    m = l.match(/^(.+?)\s*[\(\-–—:]\s*(صح|خطأ|صحيح|خاطئ)\s*\)?\.?$/u);
    if (m) { out.push({ q: norm(m[1]), a: /صح|صحيح/.test(m[2]) ? "صح" : "خطأ" }); continue; }
    // سطر سؤال يليه سطر جواب
    if (/؟\s*$/u.test(l) && ls[i + 1] && !/؟\s*$/u.test(ls[i + 1])) {
      out.push({ q: norm(l), a: norm(ls[i + 1]) });
      i++;
    }
  }
  return out;
}

/** خيارات توقّع: أسطر تحوي «/» أو «أو» أو ترقيم أ) ب) ج). */
function extractPredict(ls: string[]): { prompt: string; options: string[] }[] {
  const out: { prompt: string; options: string[] }[] = [];
  for (const l of ls) {
    const q = l.match(/^(.+?)\s*[:：]\s*(.+)$/u);
    const body = q ? q[2] : l;
    const prompt = q ? norm(q[1]) : "ما توقّعكم؟";
    let opts: string[] = [];
    if (/\//.test(body)) opts = body.split("/");
    else if (/\bأو\b|،/.test(body)) opts = body.split(/\bأو\b|،/u);
    opts = opts.map(norm).filter(Boolean);
    if (opts.length >= 2 && opts.length <= 5) out.push({ prompt, options: opts });
  }
  return out;
}

/** خطوات للترتيب: أسطر مرقّمة أو مسبوقة بشرطة. */
function extractSteps(ls: string[]): string[] {
  const steps = ls
    .filter((l) => /^\s*(?:[0-9٠-٩]+[.\-)]|[-•*])\s+/u.test(l))
    .map((l) => norm(l.replace(/^\s*(?:[0-9٠-٩]+[.\-)]|[-•*])\s+/u, "")));
  return steps.filter(Boolean);
}

/** عناصر ميزانية: «اسم = تكلفة» أو «اسم: تكلفة». */
function extractBudgetItems(ls: string[]): { label: string; cost: number }[] {
  const out: { label: string; cost: number }[] = [];
  for (const l of ls) {
    const m = l.match(/^(.+?)\s*[:=\-]\s*(\d[\d٠-٩]*)/u);
    if (m) {
      const cost = parseInt(m[2].replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))), 10);
      if (!Number.isNaN(cost)) out.push({ label: norm(m[1]), cost });
    }
  }
  return out;
}

/* ————— مكتبة احتياطية لمواضيع المواطنة الرقمية ————— */
const FALLBACK_LIB: { match: RegExp; quiz: { q: string; a: string }[] }[] = [
  { match: /تصيّد|تصيد|رابط|احتيال|اختراق|أمن|سيبر/, quiz: [
    { q: "الضغط على رابط مجهول يعدك بجائزة", a: "خطأ" },
    { q: "التحقق من عنوان الموقع قبل إدخال بياناتي", a: "صح" },
    { q: "مشاركة كلمة المرور مع صديق مقرّب", a: "خطأ" },
    { q: "الإبلاغ عن رسالة مشبوهة للمعلّم أو ولي الأمر", a: "صح" },
    { q: "تحميل تطبيق من مصدر غير معروف", a: "خطأ" },
    { q: "استخدام كلمة مرور قوية ومختلفة لكل حساب", a: "صح" },
  ] },
  { match: /تنمر|تنمّر|احترام|إساءة|مشاعر/, quiz: [
    { q: "كتابة تعليق ساخر يجرح زميلي", a: "خطأ" },
    { q: "الردّ بكلمة طيبة تشجّع من حولي", a: "صح" },
    { q: "نشر صورة زميلي دون إذنه للسخرية", a: "خطأ" },
    { q: "الدفاع عن زميل يتعرّض للإساءة", a: "صح" },
    { q: "مشاركة رسالة مؤذية في مجموعة الدردشة", a: "خطأ" },
    { q: "الإبلاغ عن محتوى مسيء بدل مشاركته", a: "صح" },
  ] },
  { match: /أخبار|إعلام|مزيف|شائع|مصدر|صحاف/, quiz: [
    { q: "مشاركة خبر عاجل فورًا قبل التحقّق منه", a: "خطأ" },
    { q: "البحث عن مصدر موثوق قبل تصديق الخبر", a: "صح" },
    { q: "تصديق كل ما يصلني في مجموعات الدردشة", a: "خطأ" },
    { q: "التوقّف والتفكير قبل نشر أي معلومة", a: "صح" },
    { q: "نشر إشاعة لأنها مثيرة", a: "خطأ" },
    { q: "الاعتماد على القنوات الرسمية لأخبار المدرسة", a: "صح" },
  ] },
];

function fallbackQuiz(topic: string): { q: string; a: string }[] {
  const found = FALLBACK_LIB.find((l) => l.match.test(topic));
  if (found) return found.quiz;
  return [
    { q: `ممارسة صحيحة تتعلّق بـ«${topic}»`, a: "صح" },
    { q: `تصرّف خاطئ يخالف «${topic}»`, a: "خطأ" },
    { q: `سلوك إيجابي يعزّز «${topic}»`, a: "صح" },
    { q: `موقف ينبغي تجنّبه في «${topic}»`, a: "خطأ" },
  ];
}

/* ————— محرّك القرار ————— */

export function buildChallenge(input: string): BuiltChallenge {
  const raw = input.trim();
  const ls = lines(raw);
  const full = raw;
  const log: string[] = [];

  // العنوان: أول سطر قصير أو مشتقّ من النص
  const firstShort = ls.find((l) => l.length <= 40 && !/[:؟=]/.test(l));
  const title = norm(firstShort || ls[0] || "تحدٍّ جديد").slice(0, 48);
  log.push(`قرأت ${ls.length} سطرًا (${full.length} حرفًا) وحدّدت العنوان: «${title}»`);

  // ٠) ألعاب حقيقية بمحرّك خاص — إكس أو (XO)
  if (isXO(full)) {
    log.push("طلبت لعبة إكس-أو → بنيت لوحة تفاعلية كاملة (٣×٣) بلاعبَين وكشف الفوز والتعادل");
    return pack(title === "تحدٍّ جديد" ? "إكس أو" : title, "xo", { xo: {} }, log, "لوحة إكس-أو تفاعلية بلاعبَين");
  }

  // ١) الترتيب
  const steps = extractSteps(ls);
  if (has(full, /رتّب|الترتيب الصحيح|رتب الخطوات|تسلسل|ترتيب/u) && steps.length >= 3) {
    log.push("لاحظت طلب ترتيب وخطوات مرقّمة → اخترت محرّك «الترتيب الصحيح»");
    const instruction = norm(ls.find((l) => /رتّب|رتب|الترتيب/u.test(l)) || "رتّبوا الخطوات بالتسلسل الصحيح");
    const content: ChallengeContent = { order: { instruction, steps } };
    return pack(title, "order", content, log, `${steps.length} خطوات للترتيب`);
  }

  // ٢) الميزانية
  const bItems = extractBudgetItems(ls);
  if (has(full, /ميزانية|وزّع|وزع|ريال|نقطة|رصيد/u) && bItems.length >= 3) {
    log.push("لاحظت أرقامًا وتوزيع رصيد → اخترت محرّك «توزيع الميزانية»");
    const totalM = full.match(/(?:ميزانية|رصيد|لديكم|المجموع)\D*(\d{2,4})/u);
    const total = totalM ? parseInt(totalM[1], 10) : Math.max(100, Math.round(bItems.reduce((a, b) => a + b.cost, 0) * 0.7));
    const unit = /نقطة/.test(full) ? "نقطة" : "ريال";
    const content: ChallengeContent = { budget: { total, unit, items: bItems, emergencies: ["ظرف طارئ: تكلفة غير متوقّعة — كيف تعيدون التوزيع؟"] } };
    return pack(title, "budget", content, log, `${bItems.length} بنود ضمن ${total} ${unit}`);
  }

  // ٣) التوقّع/التصويت
  const preds = extractPredict(ls);
  if ((has(full, /توقّع|توقع|صوّت|صوت|برأي|ماذا سيحدث|أيّهما|أيهما/u) && preds.length >= 1) || preds.length >= 3) {
    log.push("لاحظت خيارات وتصويتًا → اخترت محرّك «التوقّع والتصويت»");
    const content: ChallengeContent = { predict: preds.slice(0, 8) };
    return pack(title, "predict", content, log, `${content.predict!.length} مواقف تصويت`);
  }

  // ٤) التصنيف
  if (has(full, /صنّف|صنف|مجموعتين|مجموعات|قسّم|فئات|أيّ فئة/u)) {
    const sort = buildSort(ls);
    if (sort) {
      log.push("لاحظت فئات وعناصر تُصنَّف → اخترت محرّك «التصنيف إلى مجموعات»");
      return pack(title, "sort", { sort }, log, `${sort.items.length} عناصر في ${sort.groups.length} مجموعات`);
    }
  }

  // ٥) التحدّي الزمني
  if (has(full, /مؤقّت|مؤقت|دقائق|دقيقة|زمن|ابنوا|اصنعوا|تحدّي زمني|خلال/u) && !extractQA(ls).length) {
    log.push("لاحظت مهمة تُنفَّذ ضمن وقت → اخترت محرّك «التحدّي الزمني والتحكيم»");
    const mm = full.match(/(\d{1,3})\s*دقيق/u);
    const seconds = mm ? parseInt(mm[1], 10) * 60 : 300;
    const content: ChallengeContent = { timer: { seconds, criteria: ["الإبداع", "التعاون", "الإتقان"], prompts: ls.slice(0, 4) } };
    return pack(title, "timer", content, log, `مؤقّت ${Math.round(seconds / 60)} دقائق بمعايير تحكيم`);
  }

  // ٦) خريطة المحطّات
  const qa = extractQA(ls);
  if (has(full, /خريطة|محطّات|محطات|مواقع|مرافق|نقاط/u) && qa.length >= 3) {
    log.push("لاحظت محطّات بأسئلة → اخترت محرّك «خريطة المحطّات»");
    const regions = qa.slice(0, 8).map((p) => ({ label: p.q.slice(0, 18), q: p.q, a: p.a }));
    return pack(title, "map", { map: { title, regions } }, log, `${regions.length} محطّات على الخريطة`);
  }

  // ٧) الافتراضي: سباق الأسئلة
  if (qa.length >= 2) {
    log.push(`استخرجت ${qa.length} أسئلة من نصّك → اخترت محرّك «سباق الأسئلة»`);
    return pack(title, "quizRace", { quiz: qa.slice(0, 12) }, log, `${Math.min(qa.length, 12)} أسئلة بمنافسة فرق`);
  }

  log.push("لم أجد أسئلة صريحة، فولّدت مسابقة «صح/خطأ» حول فكرتك جاهزة للتعديل");
  const topic = title;
  return pack(topic, "quizRace", { quiz: fallbackQuiz(topic) }, log, "مسابقة صح/خطأ مولّدة");
}

function buildSort(ls: string[]): NonNullable<ChallengeContent["sort"]> | null {
  // صيغة: «الفئة: عنصر، عنصر، عنصر»
  const groups: { id: string; label: string }[] = [];
  const items: { label: string; group: string }[] = [];
  for (const l of ls) {
    const m = l.match(/^(.+?)\s*[:：]\s*(.+)$/u);
    if (!m) continue;
    const label = norm(m[1]);
    const parts = m[2].split(/[،,]/u).map(norm).filter(Boolean);
    if (parts.length < 1) continue;
    const id = `g${groups.length}`;
    groups.push({ id, label });
    parts.forEach((p) => items.push({ label: p, group: id }));
  }
  if (groups.length >= 2 && items.length >= 3) return { groups, items };
  return null;
}

function pack(title: string, type: ChallengeType, content: ChallengeContent, log: string[], summary: string): BuiltChallenge {
  log.push(`بنيت اللعبة ✓ — ${ENGINE_LABEL[type]}: ${summary}`);
  return { title, type, content, engineLabel: ENGINE_LABEL[type], summary, buildLog: log };
}

/** أمثلة جاهزة يجرّبها الرائد بضغطة. */
export const AGENT_EXAMPLES = [
  "مسابقة عن الأمن السيبراني للطلاب",
  "س: عاصمة السعودية؟ ج: الرياض\nس: كم ركنًا للإسلام؟ ج: خمسة\nس: كم لونًا في قوس المطر؟ ج: سبعة",
  "رتّبوا خطوات الوضوء بالترتيب الصحيح:\n1. النيّة\n2. غسل الكفّين\n3. المضمضة\n4. غسل الوجه\n5. غسل اليدين للمرفقين",
  "صنّفوا الأطعمة:\nصحّي: تفاح، ماء، تمر، حليب\nغير صحّي: مشروب غازي، رقائق، حلوى",
  "لديكم ميزانية 500 ريال لرحلة الفصل:\nباص = 200\nوجبات = 150\nهدايا = 100\nألعاب = 80\nتذكارات = 60",
];
