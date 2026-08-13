import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretLeft, ClipboardText, Crown, Printer, Star } from "@phosphor-icons/react";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { noDot } from "../lib/utils";

const arN = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const KEY = "motafael:observation:v1";

const CRITERIA = [
  { key: "participation", label: "المشاركة" },
  { key: "discipline", label: "الانضباط" },
  { key: "cooperation", label: "التعاون" },
  { key: "focus", label: "التركيز" },
];

interface Obs { r: Record<string, number>; note: string; talent: boolean }
type ObsMap = Record<string, Obs>;

function load(): ObsMap { try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : {}; } catch { return {}; } }
function save(m: ObsMap) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* تجاهل */ } }

function printForm(students: { id: string; name: string }[], map: ObsMap, data: RegistrationData) {
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const stars = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
  const rows = students.map((s) => {
    const o = map[s.id] ?? { r: {}, note: "", talent: false };
    const cells = CRITERIA.map((c) => `<td>${o.r[c.key] ? stars(o.r[c.key]) : "—"}</td>`).join("");
    return `<tr><td class="nm">${esc(s.name)}${o.talent ? " ⭐" : ""}</td>${cells}<td class="nt">${esc(o.note || "")}</td></tr>`;
  }).join("");
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>استمارة الملاحظة اليومية</title>
<style>*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1a1636;margin:0;padding:28px}
h1{color:#8a5a00;margin:0 0 4px;font-size:22px}.sub{color:#666;font-size:13px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #e3dcc9;padding:8px 10px;text-align:center}
th{background:#fbf1dc;color:#8a5a00}td.nm{text-align:right;font-weight:700;white-space:nowrap}td.nt{text-align:right;color:#555;font-size:12px}
footer{margin-top:18px;color:#999;font-size:11px;text-align:center}@media print{body{padding:0}}</style></head><body>
<h1>📋 استمارة الملاحظة اليومية — الأسبوع التمهيدي</h1>
<div class="sub">${esc(data.schoolName || "")} · رائد النشاط: ${esc(data.teacherName || "")} · التاريخ: ..................</div>
<table><thead><tr><th>الطالب</th>${CRITERIA.map((c) => `<th>${c.label}</th>`).join("")}<th>ملاحظات</th></tr></thead><tbody>${rows || "<tr><td colspan='6'>لا يوجد طلاب</td></tr>"}</tbody></table>
<footer>وُثّق عبر منصة «نشاط» · استمارة الملاحظة اليومية (تُرفق بها الصور)</footer>
<script>window.onload=function(){window.focus();window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function ObservationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const premium = isPremium(data.plan);
  const students = data.students ?? [];
  const [map, setMap] = useState<ObsMap>(() => load());

  function setRating(id: string, key: string, val: number) {
    setMap((prev) => {
      const o = prev[id] ?? { r: {}, note: "", talent: false };
      const next = { ...prev, [id]: { ...o, r: { ...o.r, [key]: val } } };
      save(next); return next;
    });
  }
  function setNote(id: string, note: string) { setMap((p) => { const o = p[id] ?? { r: {}, note: "", talent: false }; const n = { ...p, [id]: { ...o, note } }; save(n); return n; }); }
  function toggleTalent(id: string) { setMap((p) => { const o = p[id] ?? { r: {}, note: "", talent: false }; const n = { ...p, [id]: { ...o, talent: !o.talent } }; save(n); return n; }); }

  return (
    <div className="min-h-screen bg-bg px-4 py-14 text-ink">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300"><ClipboardText weight="fill" className="h-4 w-4" /> الأسبوع التمهيدي</span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">استمارة الملاحظة اليومية</h1>
          <p className="mt-2 text-ink-muted">ارصد سلوك كل طالب، وعلّم الموهوبين — يُستعان بها لتوزيع الفصول واكتشاف المهارات</p>
        </div>

        {!premium ? (
          <div className="mt-10 rounded-2xl border border-sun-400/30 bg-sun-400/[0.06] p-8 text-center">
            <Crown weight="fill" className="mx-auto h-10 w-10 text-sun-400" />
            <h2 className="mt-3 font-display text-xl">ميزة الرائد المتكامل</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">استمارة الملاحظة اليومية القابلة للطباعة حصريّة للباقة العليا</p>
            <button onClick={() => goToPricing(navigate)} className="mt-5 rounded-full bg-sun-400 px-6 py-3 font-bold text-bg">رقِّ للباقة العليا ✨</button>
          </div>
        ) : students.length === 0 ? (
          <p className="mt-10 text-center text-ink-muted">أضِف طلابك أولًا من «فصولك وطلابك» في لوحة التحكم</p>
        ) : (
          <>
            <div className="mt-6 flex justify-end">
              <button onClick={() => printForm(students, map, data)} className="inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-5 py-2.5 text-sm font-bold text-bg"><Printer weight="bold" className="h-4 w-4" /> اطبع الاستمارة</button>
            </div>
            <div className="mt-4 space-y-3">
              {students.map((s) => {
                const o = map[s.id] ?? { r: {}, note: "", talent: false };
                return (
                  <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-lg text-ink">{noDot(s.name)}</p>
                      <button onClick={() => toggleTalent(s.id)} className={`rounded-full px-3 py-1 text-xs font-bold ${o.talent ? "bg-sun-400 text-bg" : "border border-white/15 text-ink-muted"}`}>⭐ موهبة</button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {CRITERIA.map((c) => (
                        <div key={c.key} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                          <span className="text-sm text-ink-muted">{c.label}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} onClick={() => setRating(s.id, c.key, n)} title={arN(n)} className="transition-transform hover:scale-110" style={{ color: n <= (o.r[c.key] ?? 0) ? "#f5b73c" : "rgba(255,255,255,0.2)" }}>
                                <Star weight="fill" className="h-4 w-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <input value={o.note} onChange={(e) => setNote(s.id, e.target.value)} placeholder="ملاحظة..." className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus:border-sun-400/50" />
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
