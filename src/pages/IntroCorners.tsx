import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CaretLeft, Target, Wrench, ListNumbers, Lightbulb, Printer } from "@phosphor-icons/react";
import { INTRO_CORNERS, type IntroCorner } from "../data/introCorners";
import { noDot } from "../lib/utils";

function printSign(corner: IntroCorner) {
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>لافتة ${esc(corner.title)}</title>
<style>*{box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(150deg,${corner.color}22,#fff)}
.sign{text-align:center;border:6px solid ${corner.color};border-radius:34px;padding:60px 70px;background:#fff}
.em{font-size:120px}.ti{font-size:56px;font-weight:900;color:#1a1636;margin-top:10px}
.rk{font-size:24px;color:${corner.color};font-weight:800;margin-top:6px}.wl{margin-top:16px;font-size:20px;color:#555}
@media print{body{background:#fff}}</style></head><body>
<div class="sign"><div class="em">${corner.emoji}</div><div class="ti">${esc(corner.title)}</div><div class="rk">ركن الأسبوع التمهيدي · ١٤٤٨</div><div class="wl">أهلاً بأبطالنا الصغار 🎒</div></div>
<script>window.onload=function(){window.focus();window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function IntroCorners() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg px-4 py-14 text-ink">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300">🎪 الأسبوع التمهيدي</span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">أركان جاهزة للتشغيل</h1>
          <p className="mt-2 text-ink-muted">الأركان الواردة في التعميم، كل ركن ببطاقة تنفيذ جاهزة ولافتة تُطبع</p>
        </div>

        <div className="mt-8 space-y-4">
          {INTRO_CORNERS.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-[1.5rem] border-2 p-5" style={{ borderColor: `${c.color}66`, background: `linear-gradient(135deg, ${c.color}1f, rgba(255,255,255,0.02))` }}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: `${c.color}26` }}>{c.emoji}</span>
                <div className="min-w-0">
                  <h2 className="font-display text-2xl text-ink">{c.title}</h2>
                  <p className="text-sm text-ink-muted">{noDot(c.objective)}</p>
                </div>
                <button onClick={() => printSign(c)} className="mr-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-bg" style={{ background: c.color }}><Printer weight="bold" className="h-4 w-4" /> لافتة الركن</button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold" style={{ color: c.color }}><Wrench weight="fill" className="h-3.5 w-3.5" /> الأدوات</p>
                  <ul className="mt-1.5 space-y-1">{c.tools.map((t) => <li key={t} className="text-sm text-ink-muted">• {noDot(t)}</li>)}</ul>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-bold" style={{ color: c.color }}><Lightbulb weight="fill" className="h-3.5 w-3.5" /> نصيحة الرائد</p>
                  <p className="mt-1 rounded-xl bg-white/[0.04] p-2.5 text-sm text-ink">{noDot(c.tip)}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold" style={{ color: c.color }}><ListNumbers weight="fill" className="h-3.5 w-3.5" /> خطوات التنفيذ</p>
                  <ol className="mt-1.5 space-y-1.5">
                    {c.steps.map((st, k) => (
                      <li key={k} className="flex gap-2 text-sm text-ink-muted"><span className="font-display" style={{ color: c.color }}>{k + 1}</span> {noDot(st)}</li>
                    ))}
                  </ol>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint"><Target weight="fill" className="h-3 w-3" /> ركن ضمن مجموعات — يُفعَّل حسب الإمكانيات (كما في التعميم)</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
