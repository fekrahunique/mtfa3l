import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretLeft, FileText, Crown, Printer } from "@phosphor-icons/react";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { emptyRegistration, type RegistrationData } from "../lib/theme";

interface Evidence { type: string; note: string; link: string }
interface Report {
  admin: string; office: string; school: string; schoolType: string;
  program: string; field: string; target: string; date: string; place: string; executor: string; beneficiaries: string;
  objectives: string; mechanism: string; activities: string; results: string; strengths: string; recommendations: string;
  impactTool: string; impactResult: string; impactNote: string;
  evidence: Evidence[];
  leaderName: string; signDate: string;
}

function blank(data: RegistrationData): Report {
  return {
    admin: "", office: "", school: data.schoolName || "", schoolType: data.gender === "boys" ? "بنين" : data.gender === "girls" ? "بنات" : "",
    program: "", field: "نشاط طلابي", target: "", date: "", place: "", executor: data.teacherName || "", beneficiaries: "",
    objectives: "", mechanism: "", activities: "", results: "", strengths: "", recommendations: "",
    impactTool: "", impactResult: "", impactNote: "",
    evidence: [{ type: "", note: "", link: "" }, { type: "", note: "", link: "" }, { type: "", note: "", link: "" }, { type: "", note: "", link: "" }],
    leaderName: "", signDate: "",
  };
}

const esc = (s: string) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
const nl = (s: string) => esc(s).replace(/\n/g, "<br>");
const li = (s: string) => (s.trim() ? s.split(/\n+/).filter(Boolean).map((x) => `<li>${esc(x.replace(/^[-•]\s*/, ""))}</li>`).join("") : "");

function printReport(r: Report) {
  const box = (title: string, body: string) => `<section class="box"><h3>${title}</h3><div class="bd">${body || '<span class="ph">—</span>'}</div></section>`;
  const field = (label: string, val: string) => `<div class="f"><span class="fl">${label}</span><span class="fv">${esc(val) || "................"}</span></div>`;
  const evid = r.evidence.map((e, i) => `<div class="ev"><div class="evh">الشاهد ${["الأول", "الثاني", "الثالث", "الرابع"][i]}</div><div class="evimg">🖼️ أرفق صورة/دليل</div><div class="evm"><b>النوع:</b> ${esc(e.type) || "................"}</div><div class="evm"><b>ملاحظات:</b> ${esc(e.note) || "................"}</div>${e.link ? `<div class="evm"><b>رابط:</b> ${esc(e.link)}</div>` : '<div class="evm qr">QR / رابط: أضفه هنا</div>'}</div>`).join("");
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير تنفيذ برنامج ${esc(r.program)}</title>
<style>
  @page{size:A4 portrait;margin:12mm}
  *{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1f2937;margin:0}
  :root{--teal:#0f766e;--green:#15803d;--grey:#64748b;--soft:#eef5f4}
  .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid var(--teal);padding-bottom:8px}
  .head .lines{font-size:12px;color:#374151;line-height:2}.head .moe{text-align:left;color:var(--teal);font-weight:800;font-size:15px}
  .title{background:var(--teal);color:#fff;text-align:center;font-size:19px;font-weight:800;border-radius:10px;padding:9px;margin:12px 0}
  .title span{color:#bff0e6}
  h3{background:var(--teal);color:#fff;font-size:13px;margin:0;padding:6px 12px;border-radius:8px 8px 0 0;display:flex;gap:6px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:10px}
  .f{border:1px solid #dbe4e2;border-radius:8px;padding:7px 9px;background:var(--soft)}
  .fl{display:block;font-size:10px;color:var(--grey)}.fv{display:block;font-size:12px;font-weight:700;margin-top:2px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .box{border:1px solid #dbe4e2;border-radius:10px;overflow:hidden;margin-bottom:8px}
  .box .bd{padding:9px 12px;font-size:12px;line-height:1.9;min-height:44px}
  .box .bd ul{margin:0;padding-inline-start:18px}.ph{color:#9aa4a0}
  .green h3{background:var(--green)}
  .impact{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
  .evgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
  .ev{border:1px solid #dbe4e2;border-radius:10px;overflow:hidden;font-size:10.5px}
  .evh{background:var(--teal);color:#fff;text-align:center;padding:4px;font-weight:700}
  .evimg{height:70px;display:flex;align-items:center;justify-content:center;color:#9aa4a0;background:#f3f6f5;font-size:11px}
  .evm{padding:4px 7px;border-top:1px dashed #e2e8e6}.evm.qr{color:#9aa4a0}
  .sign{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:12px;font-size:12px}
  .sign .s{border-top:2px solid var(--teal);padding-top:6px}.sign .s b{color:var(--teal)}
  .sec-title{color:var(--teal);font-weight:800;font-size:13px;margin:12px 0 6px;border-inline-start:4px solid var(--green);padding-inline-start:8px}
</style></head><body>
  <div class="head">
    <div class="lines">الإدارة العامة للتعليم: ${esc(r.admin) || "................"}<br>مكتب التعليم: ${esc(r.office) || "................"}<br>المدرسة: ${esc(r.school) || "................"}</div>
    <div class="moe">وزارة التعليم<br><span style="font-weight:400;font-size:11px;color:#64748b">Ministry of Education</span></div>
  </div>
  <div class="title">تقرير تنفيذ برنامج <span>${esc(r.program) || "[اسم البرنامج]"}</span></div>

  <div class="sec-title">📌 بيانات البرنامج الأساسية</div>
  <div class="grid">
    ${field("اسم المدرسة", r.school)}${field("نوع المدرسة", r.schoolType)}${field("تاريخ التنفيذ", r.date)}${field("مكان التنفيذ", r.place)}
    ${field("الفئة المستهدفة", r.target)}${field("مجال البرنامج", r.field)}${field("منفذ البرنامج", r.executor)}${field("عدد المستفيدين", r.beneficiaries)}
  </div>

  <div class="two">${box("🎯 الأهداف", li(r.objectives) ? `<ul>${li(r.objectives)}</ul>` : "")}${box("⚙️ آلية التنفيذ", nl(r.mechanism))}</div>
  ${box("🎨 الأنشطة المنفذة", li(r.activities) ? `<ul>${li(r.activities)}</ul>` : nl(r.activities))}
  <div class="two"><div class="green">${box("📊 النتائج والمخرجات", li(r.results) ? `<ul>${li(r.results)}</ul>` : nl(r.results))}</div>${box("⭐ أبرز نقاط القوة", li(r.strengths) ? `<ul>${li(r.strengths)}</ul>` : "")}</div>
  ${box("📝 التوصيات والتحسينات المقترحة", li(r.recommendations) ? `<ul>${li(r.recommendations)}</ul>` : "")}

  <div class="sec-title">📈 قياس الأثر</div>
  <div class="impact">${field("أداة القياس", r.impactTool)}${field("النتيجة", r.impactResult)}${field("ملاحظات", r.impactNote)}</div>

  <div class="sec-title">📷 شواهد التنفيذ</div>
  <div class="evgrid">${evid}</div>

  <div class="sign">
    <div class="s"><b>منفذ البرنامج</b><br>الاسم: ${esc(r.executor) || "................"}<br>التوقيع: ................</div>
    <div class="s"><b>قائد/ة المدرسة</b><br>الاسم: ${esc(r.leaderName) || "................"}<br>التوقيع: ................</div>
    <div class="s"><b>التاريخ</b><br>${esc(r.signDate) || "..... / ..... / 14....هـ"}</div>
  </div>
  <script>window.onload=function(){window.focus();window.print()}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function ProgramReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const premium = isPremium(data.plan);
  const [r, setR] = useState<Report>(() => blank(data));
  const set = (patch: Partial<Report>) => setR((p) => ({ ...p, ...patch }));
  const setEv = (i: number, patch: Partial<Evidence>) => setR((p) => ({ ...p, evidence: p.evidence.map((e, k) => (k === i ? { ...e, ...patch } : e)) }));

  return (
    <div className="min-h-screen bg-bg px-4 py-14 text-ink">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300"><FileText weight="fill" className="h-4 w-4" /> توثيق رسمي</span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">تقرير تنفيذ برنامج</h1>
          <p className="mt-2 text-ink-muted">عبّئ البيانات، ويطلع تقرير احترافي بهوية الوزارة جاهز للطباعة — بلا اختلاق نتائج</p>
        </div>

        {!premium ? (
          <div className="mt-10 rounded-2xl border border-sun-400/30 bg-sun-400/[0.06] p-8 text-center">
            <Crown weight="fill" className="mx-auto h-10 w-10 text-sun-400" />
            <h2 className="mt-3 font-display text-xl">ميزة الرائد المتكامل</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">مولّد تقارير البرامج بهوية الوزارة حصريّ للباقة العليا</p>
            <button onClick={() => goToPricing(navigate)} className="mt-5 rounded-full bg-sun-400 px-6 py-3 font-bold text-bg">رقِّ للباقة العليا ✨</button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <Group title="ترويسة">
              <Two><Inp label="الإدارة العامة للتعليم" v={r.admin} on={(v) => set({ admin: v })} /><Inp label="مكتب التعليم" v={r.office} on={(v) => set({ office: v })} /></Two>
              <Two><Inp label="اسم المدرسة" v={r.school} on={(v) => set({ school: v })} /><Inp label="نوع المدرسة" v={r.schoolType} on={(v) => set({ schoolType: v })} placeholder="بنين / بنات" /></Two>
            </Group>
            <Group title="بيانات البرنامج">
              <Two><Inp label="اسم البرنامج أو الفعالية" v={r.program} on={(v) => set({ program: v })} placeholder="اليوم العالمي للتطوع" /><Inp label="مجال البرنامج" v={r.field} on={(v) => set({ field: v })} placeholder="نشاط طلابي / توعوي..." /></Two>
              <Two><Inp label="الفئة المستهدفة" v={r.target} on={(v) => set({ target: v })} placeholder="طلاب أول متوسط" /><Inp label="عدد المستفيدين" v={r.beneficiaries} on={(v) => set({ beneficiaries: v })} /></Two>
              <Two><Inp label="تاريخ التنفيذ" v={r.date} on={(v) => set({ date: v })} /><Inp label="مكان التنفيذ" v={r.place} on={(v) => set({ place: v })} placeholder="المسرح المدرسي" /></Two>
              <Inp label="منفذ البرنامج" v={r.executor} on={(v) => set({ executor: v })} />
            </Group>
            <Group title="المحتوى">
              <Area label="الأهداف (سطر لكل هدف)" v={r.objectives} on={(v) => set({ objectives: v })} />
              <Area label="آلية التنفيذ" v={r.mechanism} on={(v) => set({ mechanism: v })} />
              <Area label="الأنشطة المنفذة" v={r.activities} on={(v) => set({ activities: v })} />
              <Area label="النتائج والمخرجات" v={r.results} on={(v) => set({ results: v })} />
              <Area label="أبرز نقاط القوة" v={r.strengths} on={(v) => set({ strengths: v })} />
              <Area label="التوصيات والتحسينات" v={r.recommendations} on={(v) => set({ recommendations: v })} />
            </Group>
            <Group title="قياس الأثر (اتركه فارغًا إن لم تتوفر بيانات)">
              <Two><Inp label="أداة القياس" v={r.impactTool} on={(v) => set({ impactTool: v })} placeholder="استبانة / ملاحظة..." /><Inp label="النتيجة" v={r.impactResult} on={(v) => set({ impactResult: v })} /></Two>
              <Inp label="ملاحظات" v={r.impactNote} on={(v) => set({ impactNote: v })} />
            </Group>
            <Group title="شواهد التنفيذ">
              {r.evidence.map((e, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="mb-2 text-xs font-bold text-sun-300">الشاهد {["الأول", "الثاني", "الثالث", "الرابع"][i]}</p>
                  <Two><Inp label="نوع الشاهد" v={e.type} on={(v) => setEv(i, { type: v })} placeholder="صور / كشف حضور / أعمال..." /><Inp label="رابط أو QR" v={e.link} on={(v) => setEv(i, { link: v })} /></Two>
                  <Inp label="ملاحظات" v={e.note} on={(v) => setEv(i, { note: v })} />
                </div>
              ))}
            </Group>
            <Group title="الاعتماد">
              <Two><Inp label="قائد/ة المدرسة" v={r.leaderName} on={(v) => set({ leaderName: v })} /><Inp label="التاريخ" v={r.signDate} on={(v) => set({ signDate: v })} placeholder="١٤٤٨/../.." /></Two>
            </Group>

            <button onClick={() => printReport(r)} disabled={!r.program.trim()} className="flex w-full items-center justify-center gap-2 rounded-full bg-sun-400 px-6 py-4 text-lg font-bold text-bg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40">
              <Printer weight="bold" className="h-5 w-5" /> أنشئ التقرير واطبع / PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h2 className="mb-3 font-display text-lg text-ink">{title}</h2><div className="space-y-3">{children}</div></div>;
}
function Two({ children }: { children: ReactNode }) { return <div className="grid gap-3 sm:grid-cols-2">{children}</div>; }
function Inp({ label, v, on, placeholder }: { label: string; v: string; on: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-ink-muted">{label}</span><input value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-ink outline-none focus:border-sun-400/50" /></label>;
}
function Area({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-ink-muted">{label}</span><textarea value={v} onChange={(e) => on(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-ink outline-none focus:border-sun-400/50" /></label>;
}
