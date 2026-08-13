import { useNavigate, useLocation } from "react-router-dom";
import { CaretLeft, IdentificationCard, Crown, Printer } from "@phosphor-icons/react";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { noDot } from "../lib/utils";

const EMOJI = ["🦊", "🐧", "🦁", "🐢", "🐬", "🦉", "🐝", "🦋", "🐨", "🦕", "🐳", "🦄"];
const HUE = ["#f59e0b", "#fb7185", "#2dd4bf", "#a78bfa", "#34d399", "#60a5fa", "#f472b6", "#facc15"];
const stageLabel = (s?: string | null) => (s === "middle" ? "المتوسط" : "الابتدائي");

function printCards(students: { id: string; name: string }[], data: RegistrationData) {
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const cards = students.map((s, i) => {
    const c = HUE[i % HUE.length];
    return `<div class="card" style="--c:${c}">
      <div class="top"><span class="em">${EMOJI[i % EMOJI.length]}</span><span class="yr">١٤٤٨</span></div>
      <div class="hi">أهلاً بك في مدرستك 🎒</div>
      <div class="nm">${esc(s.name)}</div>
      <div class="meta">${esc(data.schoolName || "مدرستي")} · ${esc(stageLabel(data.stage))}</div>
    </div>`;
  }).join("");
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>بطاقات التعريف — الأسبوع التمهيدي</title>
<style>*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;margin:0;padding:14px;background:#fff}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.card{position:relative;overflow:hidden;border-radius:16px;border:2px solid var(--c);padding:16px;min-height:150px;
  background:linear-gradient(150deg,color-mix(in srgb,var(--c) 18%,#fff),#fff);break-inside:avoid}
.top{display:flex;align-items:center;justify-content:space-between}
.top .em{font-size:40px}.top .yr{font-weight:800;color:var(--c);font-size:14px}
.hi{margin-top:8px;font-size:13px;color:#555}
.nm{margin-top:6px;font-size:26px;font-weight:900;color:#1a1636}
.meta{margin-top:6px;font-size:13px;color:#666}
.card::after{content:"";position:absolute;left:-20px;bottom:-20px;width:90px;height:90px;border-radius:50%;background:var(--c);opacity:.12}
@media print{body{padding:0}.grid{gap:8px}}</style></head><body>
<div class="grid">${cards || "<p>لا يوجد طلاب</p>"}</div>
<script>window.onload=function(){window.focus();window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function StudentCards() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const premium = isPremium(data.plan);
  const students = data.students ?? [];

  return (
    <div className="min-h-screen bg-bg px-4 py-14 text-ink">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300"><IdentificationCard weight="fill" className="h-4 w-4" /> الأسبوع التمهيدي</span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">بطاقات تعريف الطلاب 🪪</h1>
          <p className="mt-2 text-ink-muted">بطاقة ترحيب لكل طالب، جاهزة للطباعة والتوزيع يوم الاستقبال</p>
        </div>

        {!premium ? (
          <div className="mt-10 rounded-2xl border border-sun-400/30 bg-sun-400/[0.06] p-8 text-center">
            <Crown weight="fill" className="mx-auto h-10 w-10 text-sun-400" />
            <h2 className="mt-3 font-display text-xl">ميزة الرائد المتكامل</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">بطاقات التعريف القابلة للطباعة حصريّة للباقة العليا</p>
            <button onClick={() => goToPricing(navigate)} className="mt-5 rounded-full bg-sun-400 px-6 py-3 font-bold text-bg">رقِّ للباقة العليا ✨</button>
          </div>
        ) : students.length === 0 ? (
          <p className="mt-10 text-center text-ink-muted">أضِف طلابك أولًا من «فصولك وطلابك» في لوحة التحكم</p>
        ) : (
          <>
            <div className="mt-6 flex justify-end">
              <button onClick={() => printCards(students, data)} className="inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-5 py-2.5 text-sm font-bold text-bg"><Printer weight="bold" className="h-4 w-4" /> اطبع البطاقات ({students.length})</button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {students.map((s, i) => {
                const c = HUE[i % HUE.length];
                return (
                  <div key={s.id} className="relative overflow-hidden rounded-2xl border-2 p-4" style={{ borderColor: `${c}66`, background: `linear-gradient(150deg, ${c}22, rgba(255,255,255,0.02))` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">{EMOJI[i % EMOJI.length]}</span>
                      <span className="font-display text-sm" style={{ color: c }}>١٤٤٨</span>
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">أهلاً بك في مدرستك 🎒</p>
                    <p className="mt-1 font-display text-2xl text-ink">{noDot(s.name)}</p>
                    <p className="mt-1 text-xs text-ink-faint">{noDot(data.schoolName || "مدرستي")} · {stageLabel(data.stage)}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
