import fs from "node:fs";
const need = JSON.parse(fs.readFileSync("__need.json","utf8"));
const S = "C:/Users/alssm/AppData/Local/Temp/claude/D--mtfa3l/788b0209-61ae-4603-95e1-2680b252bf09/scratchpad";
const script = `export const meta = {
  name: 'teach-content-authoring',
  description: 'تأليف محتوى تعليمي رصين لأركان الأنشطة (شرح + معلومات + نقاش + نشاط مساعد)',
  phases: [{ title: 'تأليف' }],
};

const CORNERS = ${JSON.stringify(need)};
const GROUPS = {};
for (const c of CORNERS) { const k = c.stage + ' · أسبوع ' + c.week; (GROUPS[k] = GROUPS[k] || []).push(c); }
const KEYS = Object.keys(GROUPS);

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { corners: { type: 'array', items: {
    type: 'object', additionalProperties: false,
    properties: {
      id: { type: 'string' },
      hook: { type: 'string' },
      explain: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 4 },
      facts: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 4 },
      discuss: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
      fun: { type: 'object', additionalProperties: false, properties: { title: { type: 'string' }, desc: { type: 'string' } }, required: ['title','desc'] },
    },
    required: ['id','hook','explain','facts','discuss','fun'],
  } } },
  required: ['corners'],
};

function buildPrompt(key, corners) {
  const stage = corners[0].stage;
  const occasion = corners[0].occasion || 'نشاط عام';
  const list = corners.map(c => ({ id: c.id, title: c.title, outcomes: c.outcomes, values: c.values, slogan: c.slogan })).sort();
  return [
    'أنت خبير مناهج ومحتوى تربوي سعودي متمرّس. مطلوب محتوى تعليمي **رصين ودقيق وموثوق** يعتمد عليه معلم النشاط تمامًا ليشرح للطلاب بلا أي تحضير إضافي.',
    'المرحلة: ' + stage + ' · المناسبة/المجال: ' + occasion + '.',
    'الأركان المطلوب تأليف محتواها (أعِد id كما هو حرفيًا):',
    JSON.stringify(list, null, 1),
    '',
    'لكل ركن أنتج الحقول التالية بجودة عالية:',
    '- hook: تمهيد تشويقي قصير يخاطب الطلاب مباشرة ويثير فضولهم حول الموضوع.',
    '- explain: من ٣ إلى ٤ فقرات شرح **كامل ورصين ودقيق** عن الموضوع نفسه (المعلومة الحقيقية التي تُفهّم الطلاب جوهر الموضوع)، متدرّجة ومترابطة، تناسب مستوى المرحلة (' + stage + '). كل فقرة مكتملة المعنى.',
    '- facts: من ٣ إلى ٤ معلومات/حقائق **دقيقة وصحيحة** مرتبطة بالموضوع (أرقام، تعريفات، أمثلة واقعية موثوقة). تجنّب المعلومات المشكوك فيها.',
    '- discuss: ٣ أسئلة نقاش مفتوحة تحفّز تفكير الطلاب وتربط الموضوع بحياتهم.',
    '- fun: نشاط مساعد ممتع (title موجز + desc يشرح كيف يُنفَّذ في دقائق داخل الفصل أو الساحة) يرسّخ الفكرة بأسلوب تفاعلي.',
    '',
    'القيود المهمة:',
    '- الدقة أولًا: لا تخترع أرقامًا أو حقائق غير صحيحة. إن كان الموضوع دينيًا أو وطنيًا فالتزم الصحّة والاعتدال.',
    '- بالعربية الفصحى المبسّطة، بروح حيّة تخاطب الطلاب، ومناسبة ثقافيًا للسعودية.',
    '- اربط المحتوى بنواتج التعلم والقيم المذكورة لكل ركن.',
    '- محتوى أصيل لكل ركن (لا تكرار حرفي بين الأركان).',
    'أعِد النتيجة عبر أداة الإخراج المنظّم فقط.',
  ].join(String.fromCharCode(10));
}

phase('تأليف');
const results = await parallel(KEYS.map((k) => () => agent(buildPrompt(k, GROUPS[k]), { schema: SCHEMA, label: k, phase: 'تأليف', effort: 'high' })));
const merged = {};
let count = 0;
for (const r of results) { if (!r || !r.corners) continue; for (const c of r.corners) { merged[c.id] = { hook: c.hook, explain: c.explain, facts: c.facts, discuss: c.discuss, fun: c.fun }; count++; } }
log('تم تأليف ' + count + ' ركنًا في ' + KEYS.length + ' مجموعة');
return merged;
`;
fs.writeFileSync(S + "/teachWorkflow.mjs", script);
console.log("wrote teachWorkflow.mjs |", script.length, "bytes | groups:", new Set(need.map(c=>c.stage+"-w"+c.week)).size);
