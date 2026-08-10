import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, X, Sparkle } from "@phosphor-icons/react";

const KEY = "motafael:tour:v1";

export interface TourStep {
  /** معرّف العنصر المستهدَف في الصفحة (فارغ = خطوة وسط الشاشة). */
  targetId?: string;
  title: string;
  body: string;
}

interface Rect { top: number; left: number; width: number; height: number }

/**
 * جولة تعريفية بسيطة تظهر مرة واحدة بعد أول دخول لرائد النشاط: تؤشّر على كل
 * أداة/قسم بضوء كاشف وعبارة سهلة «هنا كذا كذا»، ويمكن إعادتها بزر المساعدة.
 */
export function OnboardingTour({ steps, accent = "#ff9d3d" }: { steps: TourStep[]; accent?: string }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // تُفتح تلقائيًا أول مرة فقط.
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
      }
    } catch { /* تجاهل */ }
  }, []);

  // إتاحة إعادة الفتح من زر عائم.
  useEffect(() => {
    const handler = () => { setI(0); setOpen(true); };
    window.addEventListener("motafael:open-tour", handler);
    return () => window.removeEventListener("motafael:open-tour", handler);
  }, []);

  const step = steps[i];

  useLayoutEffect(() => {
    if (!open) return;
    if (!step?.targetId) { setRect(null); return; }
    const el = document.getElementById(step.targetId);
    if (!el) { setRect(null); return; }

    let last = "";
    const measure = () => {
      const r = el.getBoundingClientRect();
      const key = `${Math.round(r.top)},${Math.round(r.left)},${Math.round(r.width)},${Math.round(r.height)}`;
      if (key === last) return; // لا نُعيد الرسم إلا عند تغيّر فعلي
      last = key;
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    // تمرير فوري لوسط الشاشة (لا سلس) لتجنّب تأخّر الاستقرار، ثم قياس فوري.
    el.scrollIntoView({ behavior: "auto", block: "center" });
    measure();
    // تتبّع مستمر طوال عرض الخطوة — يصحّح أي إزاحة تخطيط متأخّرة فيبقى
    // التأشير محاذيًا للمكان تمامًا. المؤقّت يعمل حتى في التبويب المخفي.
    const id = setInterval(measure, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, i, step]);

  function finish() {
    setOpen(false);
    try { localStorage.setItem(KEY, "1"); } catch { /* تجاهل */ }
  }

  if (!open) return null;
  const last = i === steps.length - 1;
  const pad = 10;

  // موضع البطاقة: أسفل الهدف إن أمكن، وإلا فوقه، وإلا وسط الشاشة.
  const cardTop = rect
    ? rect.top + rect.height + pad + 150 < window.innerHeight
      ? rect.top + rect.height + pad
      : Math.max(16, rect.top - 160)
    : window.innerHeight / 2 - 90;

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
        {/* الطبقة المعتمة + الضوء الكاشف على الهدف */}
        {rect ? (
          <div
            className="absolute rounded-2xl"
            style={{
              top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2,
              boxShadow: `0 0 0 9999px rgba(6,6,12,0.78)`, border: `2px solid ${accent}`,
            }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: "rgba(6,6,12,0.82)" }} />
        )}

        {/* بطاقة الشرح */}
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 w-[min(92vw,26rem)] -translate-x-1/2 rounded-2xl border p-5 shadow-2xl"
          style={{ top: cardTop, background: "#14131f", borderColor: `${accent}55` }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: accent }}>
              <Sparkle weight="fill" className="h-3.5 w-3.5" /> جولة سريعة · {i + 1} / {steps.length}
            </span>
            <button onClick={finish} className="text-white/50 transition-colors hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <h3 className="mt-2 font-display text-xl text-white">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/80">{step.body}</p>

          <div className="mt-4 flex items-center justify-between">
            <button onClick={finish} className="text-sm text-white/50 transition-colors hover:text-white/80">تخطّي</button>
            <div className="flex items-center gap-1.5">
              {steps.map((_, k) => (
                <span key={k} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 18 : 6, background: k === i ? accent : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
            <button
              onClick={() => (last ? finish() : setI(i + 1))}
              className="flex items-center gap-1 rounded-full px-5 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
              style={{ background: accent }}
            >
              {last ? "تمّ 🎉" : <>التالي <CaretLeft weight="bold" className="h-4 w-4" /></>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

/** زر عائم صغير لإعادة فتح الجولة في أي وقت. */
export function TourButton({ accent = "#ff9d3d" }: { accent?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("motafael:open-tour"))}
      className="fixed bottom-5 left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-black shadow-xl transition-transform hover:scale-110"
      style={{ background: accent }}
      title="جولة تعريفية"
    >
      ؟
    </button>
  );
}
