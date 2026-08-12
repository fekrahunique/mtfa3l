import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretLeft, Sparkle, Crown, Printer, ArrowsClockwise, Check } from "@phosphor-icons/react";
import { generatePlan, PLAN_DOMAINS, type PlanStage, type PlanWeek } from "../lib/planGenerator";
import { loadPlan, savePlan, clearPlan, type SavedPlan } from "../lib/plannerStore";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { noDot } from "../lib/utils";

const ar = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

function printPlan(plan: PlanWeek[], data: RegistrationData) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const rows = plan.map((w) => `<tr><td class="n">${w.week}</td><td>${w.items.map((it) => `<b>${esc(it.title)}</b> <span class="k">${esc(it.kind)}</span>`).join("<br>")}</td></tr>`).join("");
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>خطة النشاط</title>
<style>*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1a1636;margin:0;padding:30px}
h1{color:#7a4dd6;margin:0 0 4px}.sub{color:#666;font-size:13px;margin-bottom:18px}
table{width:100%;border-collapse:collapse;font-size:14px}td{border-bottom:1px solid #eee;padding:11px 12px;vertical-align:top}td.n{width:70px;color:#7a4dd6;font-weight:800}.k{color:#999;font-size:12px}
th{background:#f6f2ff;color:#7a4dd6;text-align:right;padding:10px 12px}@media print{body{padding:0}}</style></head><body>
<h1>📅 خطة النشاط</h1><div class="sub">${esc(data.schoolName || "")} · ${esc(data.teacherName || "")}</div>
<table><thead><tr><th>الأسبوع</th><th>النشاط المقترح</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.onload=function(){window.focus();window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function SmartPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const premium = isPremium(data.plan);

  const [stage, setStage] = useState<PlanStage>(data.stage === "middle" ? "متوسط" : "ابتدائي");
  const [weeks, setWeeks] = useState(4);
  const [perWeek, setPerWeek] = useState(1);
  const [domainIds, setDomainIds] = useState<string[]>(PLAN_DOMAINS.map((d) => d.id));
  const [occasions, setOccasions] = useState(true);
  const [preview, setPreview] = useState<PlanWeek[] | null>(null);
  const [saved, setSaved] = useState<SavedPlan | null>(() => loadPlan());

  const toggleDomain = (id: string) => setDomainIds((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  function suggest() { setPreview(generatePlan({ stage, weeks, perWeek, domainIds: domainIds.length ? domainIds : PLAN_DOMAINS.map((d) => d.id), occasions })); }
  function approve() {
    if (!preview) return;
    const p: SavedPlan = { stage, createdLabel: "خطة مقترحة", weeks: preview };
    savePlan(p); setSaved(p); setPreview(null);
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-14 text-ink">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300"><Sparkle weight="fill" className="h-4 w-4" /> المخطّط الذكي</span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">خطتك جاهزة في ثوانٍ</h1>
          <p className="mt-2 text-ink-muted">حدّد ما تريد، ويقترح لك المخطّط خطة أسابيع من محتوى المنصة</p>
        </div>

        {!premium ? (
          <div className="mt-10 rounded-2xl border border-sun-400/30 bg-sun-400/[0.06] p-8 text-center">
            <Crown weight="fill" className="mx-auto h-10 w-10 text-sun-400" />
            <h2 className="mt-3 font-display text-xl">ميزة الرائد المتكامل</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">المخطّط الذكي يبني لك خطة الشهر تلقائيًا، وهو حصريّ للباقة العليا</p>
            <button onClick={() => goToPricing(navigate)} className="mt-5 rounded-full bg-sun-400 px-6 py-3 font-bold text-bg">رقِّ للباقة العليا ✨</button>
          </div>
        ) : saved && !preview ? (
          <SavedView saved={saved} onPrint={() => printPlan(saved.weeks, data)} onNew={() => { clearPlan(); setSaved(null); }} />
        ) : (
          <>
            <div className="mt-8 space-y-6">
              <Field label="المرحلة">
                <div className="flex gap-2">
                  {(["ابتدائي", "متوسط"] as PlanStage[]).map((s) => <Chip key={s} active={stage === s} onClick={() => setStage(s)}>{s}</Chip>)}
                </div>
              </Field>
              <Field label={`عدد الأسابيع: ${ar(weeks)}`}>
                <div className="flex flex-wrap gap-2">{[2, 3, 4, 5, 6, 8].map((n) => <Chip key={n} active={weeks === n} onClick={() => setWeeks(n)}>{ar(n)}</Chip>)}</div>
              </Field>
              <Field label="أنشطة كل أسبوع">
                <div className="flex gap-2">{[1, 2].map((n) => <Chip key={n} active={perWeek === n} onClick={() => setPerWeek(n)}>{ar(n)}</Chip>)}</div>
              </Field>
              <Field label="المجالات">
                <div className="flex flex-wrap gap-2">
                  {PLAN_DOMAINS.map((d) => <Chip key={d.id} active={domainIds.includes(d.id)} onClick={() => toggleDomain(d.id)}>{d.emoji} {d.title}</Chip>)}
                </div>
              </Field>
              <Field label="المناسبات">
                <button onClick={() => setOccasions((v) => !v)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${occasions ? "bg-emerald-400/20 text-emerald-300" : "border border-white/15 text-ink-muted"}`}>{occasions ? "✓" : "○"} تضمين أنشطة المناسبات</button>
              </Field>
              <button onClick={suggest} className="flex w-full items-center justify-center gap-2 rounded-full bg-sun-400 px-6 py-3.5 text-lg font-bold text-bg transition-transform hover:scale-[1.02] active:scale-95">
                {preview ? <><ArrowsClockwise weight="bold" className="h-5 w-5" /> اقترح خطة أخرى</> : <>اقترح الخطة ✨</>}
              </button>
            </div>

            {preview && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                <PlanTimeline plan={preview} />
                <button onClick={approve} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-lg font-bold text-white transition-transform hover:scale-[1.02] active:scale-95">
                  <Check weight="bold" className="h-5 w-5" /> اعتمد الخطة
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SavedView({ saved, onPrint, onNew }: { saved: SavedPlan; onPrint: () => void; onNew: () => void }) {
  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
        <p className="font-display text-lg text-emerald-200">✓ خطتك معتمدة، {ar(saved.weeks.length)} أسابيع</p>
        <div className="flex gap-2">
          <button onClick={onPrint} className="inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-4 py-2 text-sm font-bold text-bg"><Printer weight="bold" className="h-4 w-4" /> اطبع / PDF</button>
          <button onClick={onNew} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-ink-muted hover:text-ink">خطة جديدة</button>
        </div>
      </div>
      <PlanTimeline plan={saved.weeks} />
    </div>
  );
}

function PlanTimeline({ plan }: { plan: PlanWeek[] }) {
  return (
    <div className="space-y-3">
      {plan.map((w) => (
        <div key={w.week} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-sun-400/15 text-center">
            <span className="text-[10px] text-ink-faint">الأسبوع</span>
            <span className="font-display text-lg text-sun-300">{ar(w.week)}</span>
          </div>
          <div className="flex-1 space-y-2">
            {w.items.length === 0 && <p className="text-sm text-ink-faint">لا يوجد اقتراح، اختر مجالًا</p>}
            {w.items.map((it, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-xl">{it.emoji}</span>
                <span className="font-display text-ink">{noDot(it.title)}</span>
                <span className="rounded-full border border-white/12 px-2 py-0.5 text-[11px] text-ink-muted">{it.kind}</span>
                {it.tag && <span className="text-[11px] text-ink-faint">{noDot(it.tag)}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="mb-2 text-sm font-semibold text-ink-muted">{label}</p>{children}</div>;
}
function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-sun-400 text-bg" : "border border-white/15 text-ink-muted hover:text-ink"}`}>{children}</button>;
}
