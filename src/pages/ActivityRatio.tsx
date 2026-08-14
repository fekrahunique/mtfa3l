import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretLeft, Calculator, Crown, Printer, Plus, Trash, MagicWand, Info } from "@phosphor-icons/react";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { emptyRegistration, type RegistrationData } from "../lib/theme";

/**
 * موزّع حصص النشاط (نسبة ١٠٪) — مبني على الآلية الرسمية لدليل الخطط الدراسية:
 * حصة النشاط الأسبوعية × ٣٦ = الحصص السنوية المطلوبة، تُوزَّع على مواد دون تجاوز ١٠٪ من حصص كل مادة.
 * الحد الأعلى لكل مادة = تقريب (الحصص السنوية × ١٠٪) كما في الدليل (٢١٦ → ٢٢، ٢٨٨ → ٢٩).
 */

const KEY = "motafael:ratio10:v1";
const YEAR_WEEKS = 36;

interface Subject { id: string; name: string; annual: number; taken: number }

const PRESET_MIDDLE: Omit<Subject, "id" | "taken">[] = [
  { name: "القرآن والدراسات الإسلامية", annual: 180 },
  { name: "اللغة العربية", annual: 180 },
  { name: "الرياضيات", annual: 216 },
  { name: "العلوم", annual: 144 },
  { name: "اللغة الإنجليزية", annual: 144 },
  { name: "الدراسات الاجتماعية", annual: 108 },
  { name: "المهارات الرقمية", annual: 72 },
  { name: "التربية الفنية", annual: 72 },
  { name: "التربية البدنية والدفاع عن النفس", annual: 72 },
  { name: "التفكير الناقد", annual: 72 },
  { name: "المهارات الحياتية والأسرية", annual: 36 },
];

const PRESET_PRIMARY: Omit<Subject, "id" | "taken">[] = [
  { name: "القرآن والدراسات الإسلامية", annual: 180 },
  { name: "اللغة العربية", annual: 180 },
  { name: "الرياضيات", annual: 216 },
  { name: "العلوم", annual: 144 },
  { name: "اللغة الإنجليزية", annual: 108 },
  { name: "الدراسات الاجتماعية", annual: 72 },
  { name: "المهارات الرقمية", annual: 72 },
  { name: "التربية الفنية", annual: 36 },
  { name: "التربية البدنية", annual: 72 },
  { name: "المهارات الحياتية والأسرية", annual: 36 },
];

let seq = 0;
const uid = () => `s${Date.now().toString(36)}${seq++}`;
const withIds = (list: Omit<Subject, "id" | "taken">[]): Subject[] =>
  list.map((s) => ({ ...s, id: uid(), taken: 0 }));

/** الحد الأعلى المسموح للمادة = تقريب ١٠٪ من حصصها السنوية (مطابق للدليل). */
const cap = (annual: number) => Math.round(annual * 0.1);
const ar = (n: number) => n.toLocaleString("ar-EG", { maximumFractionDigits: 2 });

function loadState(defaultStage: "middle" | "primary"): { weekly: number; subjects: Subject[] } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p.subjects)) return { weekly: p.weekly ?? 1, subjects: p.subjects };
    }
  } catch { /* تجاهل */ }
  return { weekly: 1, subjects: withIds(defaultStage === "middle" ? PRESET_MIDDLE : PRESET_PRIMARY) };
}

function saveState(weekly: number, subjects: Subject[]) {
  try { localStorage.setItem(KEY, JSON.stringify({ weekly, subjects })); } catch { /* تجاهل */ }
}

/** يوزّع «المطلوب» بالتناوب على المواد المتاحة دون تجاوز حد كل مادة. */
function autoDistribute(required: number, subjects: Subject[]): Subject[] {
  const next = subjects.map((s) => ({ ...s, taken: 0 }));
  let remaining = required;
  let guard = required + next.length + 1;
  while (remaining > 0 && guard-- > 0) {
    let placedThisRound = false;
    for (const s of next) {
      if (remaining <= 0) break;
      if (s.taken < cap(s.annual)) { s.taken += 1; remaining -= 1; placedThisRound = true; }
    }
    if (!placedThisRound) break; // لا سعة متبقية
  }
  return next;
}

function printPlan(school: string, weekly: number, required: number, subjects: Subject[]) {
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const used = subjects.filter((s) => s.taken > 0);
  const totalTaken = subjects.reduce((a, s) => a + s.taken, 0);
  const rows = used.map((s) => {
    const pct = ((s.taken / s.annual) * 100);
    const over = s.taken > cap(s.annual);
    return `<tr>
      <td class="r">${esc(s.name)}</td>
      <td>${ar(s.annual)}</td>
      <td>${ar(s.taken)}</td>
      <td class="${over ? "bad" : "ok"}">${ar(Number(pct.toFixed(2)))}%</td>
      <td>${ar(cap(s.annual))}</td>
    </tr>`;
  }).join("");
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>خطة توزيع حصص النشاط (نسبة ١٠٪)</title>
<style>*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;margin:0;padding:28px;color:#0f2b31;background:#fff}
.head{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #0e7490;padding-bottom:14px}
.head .t{font-size:22px;font-weight:800;color:#0e7490}.head .s{font-size:13px;color:#5b7075;margin-top:3px}
.badge{background:#0e7490;color:#fff;border-radius:10px;padding:8px 14px;font-weight:800;font-size:13px}
.grid{display:flex;gap:12px;margin:18px 0}
.stat{flex:1;border:1px solid #cfe6ea;border-radius:12px;padding:12px 14px;background:#f3fbfc}
.stat b{display:block;font-size:24px;color:#0e7490}.stat span{font-size:12px;color:#5b7075}
h2{font-size:15px;color:#0e7490;margin:20px 0 8px;border-right:4px solid #22c55e;padding-right:8px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{border:1px solid #cfe6ea;padding:8px 10px;text-align:center}
th{background:#0e7490;color:#fff;font-weight:700}td.r{text-align:right;font-weight:600}
td.ok{color:#15803d;font-weight:700}td.bad{color:#b91c1c;font-weight:700}
.sched td:first-child{text-align:right}.sched .act{color:#b91c1c;font-weight:800}
.note{margin-top:16px;font-size:12px;color:#5b7075;background:#f3fbfc;border:1px dashed #9fc9d0;border-radius:10px;padding:10px 12px;line-height:1.7}
@media print{body{padding:0}}</style></head><body>
<div class="head"><div><div class="t">خطة توزيع حصص النشاط (نسبة ١٠٪)</div><div class="s">${esc(school || "المدرسة")} · وفق دليل الخطط الدراسية ١٤٤٨هـ</div></div><div class="badge">النشاط الطلابي</div></div>
<div class="grid">
  <div class="stat"><b>${ar(weekly)}</b><span>حصة نشاط أسبوعية</span></div>
  <div class="stat"><b>${ar(required)}</b><span>الحصص السنوية المطلوبة (× ٣٦)</span></div>
  <div class="stat"><b>${ar(totalTaken)}</b><span>المخصَّص من المواد</span></div>
</div>
<h2>توزيع النسبة على المواد</h2>
<table><thead><tr><th>المادة</th><th>الحصص السنوية</th><th>المأخوذ للنشاط</th><th>النسبة الفعلية</th><th>الحد الأعلى (١٠٪)</th></tr></thead>
<tbody>${rows || '<tr><td colspan="5">لم تُوزَّع أي حصص بعد</td></tr>'}</tbody></table>
<h2>كيف تظهر في الجدول الدراسي</h2>
<table class="sched"><thead><tr><th>البند</th><th>عدد الحصص الأسبوعية</th></tr></thead><tbody>
<tr><td>المواد الدراسية</td><td>${ar(35)}</td></tr>
<tr><td class="act">النشاط</td><td class="act">${ar(weekly)}</td></tr>
<tr><td>المجموع</td><td>${ar(35 + weekly)}</td></tr>
<tr><td>الفترات اللاصفية</td><td>—</td></tr>
</tbody></table>
<div class="note">النسبة لا تعني حصصًا إضافية فوق الخطة، بل تخصيص ما لا يتجاوز ١٠٪ من الوزن النسبي لحصص كل مادة باعتبارها الحد الأدنى، وتفعيلها من خلال برامج النشاط الطلابي المعتمدة. تُطبَّق في المدارس التي عدد حصصها النظامية ٣٥ حصة، ويبقى نصاب المعلم ٢٤ حصة. هذه الأداة مساعدة تخطيطية وليست جهة اعتماد.</div>
<script>window.onload=function(){window.focus();window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function ActivityRatio() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const premium = isPremium(data.plan);
  const defaultStage = data.stage === "middle" ? "middle" : "primary";

  const initial = useMemo(() => loadState(defaultStage), [defaultStage]);
  const [weekly, setWeekly] = useState<number>(initial.weekly);
  const [subjects, setSubjects] = useState<Subject[]>(initial.subjects);

  const required = Math.max(0, Math.round(weekly * YEAR_WEEKS));
  const totalTaken = subjects.reduce((a, s) => a + s.taken, 0);
  const balanced = totalTaken === required && required > 0;

  const commit = (w: number, list: Subject[]) => { setWeekly(w); setSubjects(list); saveState(w, list); };

  const setTaken = (id: string, v: number) => {
    const list = subjects.map((s) => (s.id === id ? { ...s, taken: Math.max(0, Math.min(v, s.annual)) } : s));
    commit(weekly, list);
  };
  const setField = (id: string, field: "name" | "annual", v: string) => {
    const list = subjects.map((s) => (s.id === id ? { ...s, [field]: field === "annual" ? Math.max(0, Number(v) || 0) : v } : s));
    commit(weekly, list);
  };
  const addSubject = () => commit(weekly, [...subjects, { id: uid(), name: "", annual: 0, taken: 0 }]);
  const removeSubject = (id: string) => commit(weekly, subjects.filter((s) => s.id !== id));
  const loadPreset = (which: "middle" | "primary") =>
    commit(weekly, withIds(which === "middle" ? PRESET_MIDDLE : PRESET_PRIMARY));
  const distribute = () => commit(weekly, autoDistribute(required, subjects));

  return (
    <div className="min-h-screen bg-bg px-4 py-14 text-ink">
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300"><Calculator weight="fill" className="h-4 w-4" /> أداة تخطيط</span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">موزّع حصص النشاط (نسبة ١٠٪) 📐</h1>
          <p className="mx-auto mt-2 max-w-xl text-ink-muted">احسب حصص النشاط ووزّعها على المواد وفق الآلية الرسمية، دون تجاوز ١٠٪ لكل مادة، واطبع الخطة</p>
        </div>

        {!premium ? (
          <div className="mt-10 rounded-2xl border border-sun-400/30 bg-sun-400/[0.06] p-8 text-center">
            <Crown weight="fill" className="mx-auto h-10 w-10 text-sun-400" />
            <h2 className="mt-3 font-display text-xl">ميزة الرائد المتكامل</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">موزّع حصص النشاط أداة تخطيط حصريّة للباقة العليا</p>
            <button onClick={() => goToPricing(navigate)} className="mt-5 rounded-full bg-sun-400 px-6 py-3 font-bold text-bg">رقِّ للباقة العليا ✨</button>
          </div>
        ) : (
          <>
            {/* شرح مبسّط */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4 text-sm leading-relaxed text-ink-muted">
              <Info weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
              <p>النسبة ليست حصصًا إضافية فوق الخطة، بل تخصيص ما لا يتجاوز <b className="text-ink">١٠٪</b> من حصص بعض المواد لتفعيل النشاط. حصة نشاط أسبوعية واحدة × ٣٦ أسبوعًا = <b className="text-ink">٣٦ حصة سنويًا</b>، تُوزَّع على المواد بالتناوب. يبقى نصاب المعلم ٢٤ حصة.</p>
            </div>

            {/* المطلوب */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs text-ink-muted">حصص النشاط الأسبوعية</span>
                <input type="number" min={0} step={1} value={weekly}
                  onChange={(e) => commit(Math.max(0, Number(e.target.value) || 0), subjects)}
                  className="mt-1 w-full bg-transparent font-display text-3xl text-ink outline-none" />
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs text-ink-muted">المطلوب سنويًا (× ٣٦)</span>
                <p className="mt-1 font-display text-3xl text-sun-300">{ar(required)}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${balanced ? "border-emerald-400/40 bg-emerald-400/[0.08]" : "border-white/10 bg-white/[0.03]"}`}>
                <span className="text-xs text-ink-muted">المخصَّص / المتبقّي</span>
                <p className={`mt-1 font-display text-3xl ${balanced ? "text-emerald-300" : "text-ink"}`}>{ar(totalTaken)}<span className="text-lg text-ink-faint"> / {ar(required)}</span></p>
                {!balanced && required > 0 && <span className="text-xs text-ink-faint">{totalTaken < required ? `تبقّى ${ar(required - totalTaken)} حصة` : `زيادة ${ar(totalTaken - required)} حصة`}</span>}
                {balanced && <span className="text-xs font-bold text-emerald-300">مكتمل ✓</span>}
              </div>
            </div>

            {/* أزرار */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={distribute} className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 px-4 py-2 text-sm font-bold text-white"><MagicWand weight="bold" className="h-4 w-4" /> وزّع تلقائيًا</button>
              <button onClick={() => loadPreset("middle")} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-ink">مواد المتوسط</button>
              <button onClick={() => loadPreset("primary")} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-ink">مواد الابتدائي</button>
              <button onClick={addSubject} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-ink-muted hover:text-ink"><Plus weight="bold" className="h-3.5 w-3.5" /> مادة</button>
              <button onClick={() => printPlan(data.schoolName, weekly, required, subjects)} className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-5 py-2.5 text-sm font-bold text-bg"><Printer weight="bold" className="h-4 w-4" /> اطبع الخطة / PDF</button>
            </div>

            {/* جدول المواد */}
            <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-white/[0.04] text-ink-muted">
                    <th className="p-3 text-right font-semibold">المادة</th>
                    <th className="p-3 font-semibold">الحصص السنوية</th>
                    <th className="p-3 font-semibold">المأخوذ للنشاط</th>
                    <th className="p-3 font-semibold">النسبة</th>
                    <th className="p-3 font-semibold">الحد الأعلى</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => {
                    const pct = s.annual > 0 ? (s.taken / s.annual) * 100 : 0;
                    const over = s.taken > cap(s.annual);
                    return (
                      <tr key={s.id} className="border-t border-white/[0.06]">
                        <td className="p-2">
                          <input value={s.name} onChange={(e) => setField(s.id, "name", e.target.value)} placeholder="اسم المادة"
                            className="w-full rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-right text-ink outline-none focus:bg-white/[0.06]" />
                        </td>
                        <td className="p-2 text-center">
                          <input type="number" min={0} value={s.annual} onChange={(e) => setField(s.id, "annual", e.target.value)}
                            className="w-20 rounded-lg bg-white/[0.03] px-2 py-1.5 text-center text-ink outline-none focus:bg-white/[0.06]" />
                        </td>
                        <td className="p-2 text-center">
                          <input type="number" min={0} max={s.annual} value={s.taken} onChange={(e) => setTaken(s.id, Number(e.target.value) || 0)}
                            className={`w-20 rounded-lg px-2 py-1.5 text-center font-bold outline-none ${over ? "bg-red-500/15 text-red-300" : "bg-cyan-500/10 text-cyan-200"}`} />
                        </td>
                        <td className={`p-2 text-center font-semibold ${over ? "text-red-300" : "text-emerald-300"}`}>{ar(Number(pct.toFixed(2)))}%</td>
                        <td className="p-2 text-center text-ink-muted">{ar(cap(s.annual))}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => removeSubject(s.id)} className="text-ink-faint hover:text-red-300"><Trash weight="bold" className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {subjects.some((s) => s.taken > cap(s.annual)) && (
              <p className="mt-3 text-center text-sm font-semibold text-red-300">⚠️ بعض المواد تجاوزت حد الـ١٠٪ المسموح — قلّل المأخوذ منها</p>
            )}

            {/* كيف تظهر في الجدول */}
            <div className="mt-8">
              <h2 className="font-display text-lg text-ink">كيف تظهر في الجدول الدراسي</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-white/[0.06]"><td className="p-3 text-right text-ink-muted">المواد الدراسية</td><td className="p-3 text-center font-bold text-ink">{ar(35)}</td></tr>
                    <tr className="border-b border-white/[0.06] bg-red-500/[0.06]"><td className="p-3 text-right font-bold text-red-300">النشاط</td><td className="p-3 text-center font-bold text-red-300">{ar(weekly)}</td></tr>
                    <tr className="border-b border-white/[0.06]"><td className="p-3 text-right text-ink-muted">المجموع</td><td className="p-3 text-center font-bold text-ink">{ar(35 + weekly)}</td></tr>
                    <tr><td className="p-3 text-right text-ink-muted">الفترات اللاصفية</td><td className="p-3 text-center text-ink-faint">—</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink-faint">مصدر الآلية: دليل الخطط الدراسية ١٤٤٨هـ. هذه الأداة مساعدة تخطيطية وليست جهة اعتماد</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
