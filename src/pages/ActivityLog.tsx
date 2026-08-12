import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretLeft, ChartBar, Crown, Printer, Trash, Star, Plus } from "@phosphor-icons/react";
import { loadRecords, saveRecords, makeRecordId, summarize, type ActivityRecord } from "../lib/recordsStore";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { noDot } from "../lib/utils";

const ar = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const stars = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));

function blank(): Omit<ActivityRecord, "id"> {
  return { name: "", date: "", participants: 0, participationPct: 0, engagement: 5, goal: 4, points: 0, results: "", notes: "" };
}

function printPortfolio(list: ActivityRecord[], data: RegistrationData) {
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const s = summarize(list);
  const cards = list.map((r) => `<div class="rec">
    <div class="rh"><b>${esc(r.name)}</b><span>${esc(r.date)}</span></div>
    <div class="meta">👥 ${r.participants} مشارك · نسبة ${r.participationPct}% · تفاعل ${"★".repeat(r.engagement)} · هدف ${"★".repeat(r.goal)} · 💰 ${r.points}</div>
    ${r.results ? `<p><b>النتائج:</b> ${esc(r.results)}</p>` : ""}
    ${r.notes ? `<p><b>ملاحظات:</b> ${esc(r.notes)}</p>` : ""}
  </div>`).join("");
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>ملف إنجاز النشاط</title>
<style>*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1a1636;margin:0;padding:34px}
.cover{border-bottom:3px solid #7a4dd6;padding-bottom:18px;margin-bottom:22px}
.cover h1{margin:0 0 6px;font-size:26px;color:#4d1c9b}.cover .m{color:#444;font-size:14px}
.sum{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px}
.sum .b{flex:1;min-width:120px;background:#f6f2ff;border:1px solid #e5dcff;border-radius:12px;padding:12px;text-align:center}
.sum .b .n{font-size:24px;font-weight:800;color:#4d1c9b}.sum .b .l{font-size:12px;color:#666}
h2{color:#4d1c9b;font-size:17px;border-bottom:1px solid #eee;padding-bottom:6px}
.rec{border:1px solid #eee;border-radius:12px;padding:12px 14px;margin-bottom:10px;break-inside:avoid}
.rh{display:flex;justify-content:space-between;font-size:15px}.rh span{color:#888;font-size:13px}
.meta{color:#555;font-size:12.5px;margin:6px 0}.rec p{font-size:13px;margin:3px 0}
footer{margin-top:22px;text-align:center;color:#999;font-size:12px}@media print{body{padding:0}.cover{page-break-after:avoid}}</style></head><body>
<div class="cover"><h1>📄 ملف إنجاز النشاط</h1><div class="m"><b>المدرسة:</b> ${esc(data.schoolName || "—")} &nbsp; · &nbsp; <b>رائد النشاط:</b> ${esc(data.teacherName || "—")}</div></div>
<h2>ملخّص الإنجاز</h2>
<div class="sum">
  <div class="b"><div class="n">${s.count}</div><div class="l">نشاطًا</div></div>
  <div class="b"><div class="n">${s.participants}</div><div class="l">مشاركًا</div></div>
  <div class="b"><div class="n">${s.avgEngagement}/5</div><div class="l">متوسط التفاعل</div></div>
  <div class="b"><div class="n">${s.avgGoal}/5</div><div class="l">تحقيق الهدف</div></div>
  <div class="b"><div class="n">${s.points}</div><div class="l">إجمالي النقاط</div></div>
</div>
<h2>الأنشطة المنفَّذة</h2>${cards || "<p>لا توجد أنشطة مسجّلة بعد</p>"}
<footer>وُثّق عبر منصة «نشاط» · ملف إنجاز النشاط</footer>
<script>window.onload=function(){window.focus();window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function ActivityLog() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const premium = isPremium(data.plan);

  const [records, setRecords] = useState<ActivityRecord[]>(() => loadRecords());
  const [form, setForm] = useState<Omit<ActivityRecord, "id"> | null>(null);
  const s = summarize(records);

  function persist(next: ActivityRecord[]) { setRecords(next); saveRecords(next); }
  function add() {
    if (!form || !form.name.trim()) return;
    persist([...records, { ...form, id: makeRecordId(records) }]);
    setForm(null);
  }
  function remove(id: string) { persist(records.filter((r) => r.id !== id)); }

  if (!premium) {
    return (
      <Shell onBack={() => navigate(-1)}>
        <div className="mt-10 rounded-2xl border border-sun-400/30 bg-sun-400/[0.06] p-8 text-center">
          <Crown weight="fill" className="mx-auto h-10 w-10 text-sun-400" />
          <h2 className="mt-3 font-display text-xl">ميزة الرائد المتكامل</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">قياس الأثر وتوثيق الأنشطة وملف الإنجاز PDF حصريّة للباقة العليا</p>
          <button onClick={() => goToPricing(navigate)} className="mt-5 rounded-full bg-sun-400 px-6 py-3 font-bold text-bg">رقِّ للباقة العليا ✨</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell onBack={() => navigate(-1)}>
      {/* ملخّص الشهر */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { n: ar(s.count), l: "نشاطًا" }, { n: ar(s.participants), l: "مشاركًا" },
          { n: `${ar(s.avgEngagement)}/٥`, l: "متوسط التفاعل" }, { n: `${ar(s.avgGoal)}/٥`, l: "تحقيق الهدف" },
          { n: ar(s.points), l: "إجمالي النقاط" },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="font-display text-2xl text-sun-300">{c.n}</p>
            <p className="text-xs text-ink-muted">{c.l}</p>
          </div>
        ))}
      </div>
      {records.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-ink-muted">
          <span>🔥 الأكثر تفاعلًا: <b className="text-ink">{s.most ? noDot(s.most.name) : "—"}</b> · 💤 الأقل: <b className="text-ink">{s.least ? noDot(s.least.name) : "—"}</b></span>
          <button onClick={() => printPortfolio(records, data)} className="inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-4 py-2 text-sm font-bold text-bg"><Printer weight="bold" className="h-4 w-4" /> أنشئ ملف الإنجاز PDF</button>
        </div>
      )}

      {/* زر إضافة / النموذج */}
      {!form ? (
        <button onClick={() => setForm(blank())} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-sun-400 px-6 py-3.5 text-lg font-bold text-bg transition-transform hover:scale-[1.02] active:scale-95"><Plus weight="bold" className="h-5 w-5" /> وثّق نشاطًا</button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <p className="font-display text-lg">كيف كان النشاط؟</p>
          <Row><Inp label="اسم النشاط" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="تحدي التعاون" /><Inp label="التاريخ" value={form.date} onChange={(v) => setForm({ ...form, date: v })} placeholder="١٢ سبتمبر" /></Row>
          <Row>
            <NumInp label="عدد المشاركين" value={form.participants} onChange={(v) => setForm({ ...form, participants: v })} />
            <NumInp label="نسبة المشاركة %" value={form.participationPct} onChange={(v) => setForm({ ...form, participationPct: v })} />
            <NumInp label="النقاط" value={form.points} onChange={(v) => setForm({ ...form, points: v })} />
          </Row>
          <Row>
            <Stars label="التفاعل" value={form.engagement} onChange={(v) => setForm({ ...form, engagement: v })} />
            <Stars label="تحقيق الهدف" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} />
          </Row>
          <Area label="النتائج" value={form.results} onChange={(v) => setForm({ ...form, results: v })} placeholder="الفريق الأول حقّق..." />
          <Area label="ملاحظات" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="تفاعل الطلاب بشكل ممتاز" />
          <div className="flex gap-2">
            <button onClick={add} disabled={!form.name.trim()} className="flex-1 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white disabled:opacity-40">حفظ التوثيق</button>
            <button onClick={() => setForm(null)} className="rounded-full border border-white/15 px-5 py-3 font-semibold text-ink-muted">إلغاء</button>
          </div>
        </motion.div>
      )}

      {/* الأرشيف */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl">أرشيف أنشطتك ({ar(records.length)})</h2>
        <AnimatePresence>
          {records.length === 0 && <p className="text-sm text-ink-faint">ابدأ بتوثيق أول نشاط، وسيتكوّن لك أرشيف كامل وملف إنجاز</p>}
          {[...records].reverse().map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mb-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-ink">{noDot(r.name)} <span className="text-xs text-ink-faint">· {noDot(r.date)}</span></p>
                  <p className="mt-1 text-xs text-ink-muted">👥 {ar(r.participants)} · نسبة {ar(r.participationPct)}٪ · تفاعل <span className="text-sun-300">{stars(r.engagement)}</span> · هدف <span className="text-sun-300">{stars(r.goal)}</span> · 💰 {ar(r.points)}</p>
                  {r.results && <p className="mt-1 text-sm text-ink-muted">النتائج: {noDot(r.results)}</p>}
                </div>
                <button onClick={() => remove(r.id)} className="shrink-0 text-ink-faint hover:text-red-300"><Trash weight="bold" className="h-4 w-4" /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Shell>
  );
}

function Shell({ children, onBack }: { children: ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-bg px-4 py-14 text-ink">
      <div className="mx-auto max-w-3xl">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300"><ChartBar weight="fill" className="h-4 w-4" /> سجل وأثر النشاط</span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">وثّق نشاطك، واقرأ أثرك</h1>
          <p className="mt-2 text-ink-muted">سجّل كل نشاط بعد تنفيذه، وفي نهاية الشهر أنشئ ملف إنجازك PDF</p>
        </div>
        {children}
      </div>
    </div>
  );
}
function Row({ children }: { children: ReactNode }) { return <div className="grid gap-3 sm:grid-cols-2">{children}</div>; }
function Inp({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-ink-muted">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-ink outline-none focus:border-sun-400/50" /></label>;
}
function NumInp({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-ink-muted">{label}</span><input type="number" min={0} value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)} className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-ink outline-none focus:border-sun-400/50" /></label>;
}
function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-ink-muted">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className="w-full resize-none rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-ink outline-none focus:border-sun-400/50" /></label>;
}
function Stars({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div><span className="mb-1 block text-xs font-semibold text-ink-muted">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(n)} className="text-2xl transition-transform hover:scale-110" style={{ color: n <= value ? "#f5b73c" : "rgba(255,255,255,0.2)" }}><Star weight="fill" className="h-6 w-6" /></button>
        ))}
      </div>
    </div>
  );
}
