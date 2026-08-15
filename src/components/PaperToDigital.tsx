import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { noDot } from "../lib/utils";

/**
 * قسم تحويلي بأسلوب الإعلانات الحركية (مستوحى من ريلز تسويقي):
 * ينتقل بصريًا من عالم الورق والطباعة والهدر → إلى منصة نشاط الرقمية،
 * مع بطاقات فائدة «تقفز» بالتتابع حول الشاشة، وعبارة تسويقية ختامية.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

// فوضى الورق (الحالة القديمة) — تتلاشى وتنكمش
const WASTE = [
  { icon: "🖨️", label: "طباعة وتكلفة" },
  { icon: "🗂️", label: "ملفات تضيع" },
  { icon: "🗑️", label: "هدر ورق" },
  { icon: "⏳", label: "وقت يُهدر" },
];

// فوائد المنصة (الحالة الرقمية) — تقفز حول الشاشة
const GAINS = [
  { icon: "🚫📄", label: "بلا ورق", x: "-118%", y: "-58%" },
  { icon: "🖱️", label: "جاهز بضغطة", x: "112%", y: "-46%" },
  { icon: "📊", label: "يقيس الأثر", x: "-126%", y: "34%" },
  { icon: "🗃️", label: "يوثّق تلقائيًا", x: "120%", y: "40%" },
  { icon: "🌿", label: "صديق للبيئة", x: "-6%", y: "-96%" },
];

export function PaperToDigital() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const on = reduced ? true : inView;

  return (
    <section
      ref={ref}
      dir="rtl"
      className="relative overflow-hidden px-4 py-24 sm:py-28"
      style={{ background: "radial-gradient(120% 120% at 80% 0%, #0e5563 0%, #10233a 46%, #131209 100%)" }}
    >
      {/* توهج خلفي متحرك */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.22), transparent 68%)" }}
        animate={on ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-5xl">
        {/* العنوان */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-sm font-semibold text-cyan-200">
            ♻️ تحوّل رقمي
          </span>
          <h2 className="mt-5 font-display text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            من كومة أوراق<span className="text-white/40"> ... </span>
            <span className="bg-gradient-to-l from-cyan-300 to-sun-300 bg-clip-text text-transparent">إلى ضغطة زر</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            {noDot("ودّع الطباعة والهدر والملفات الضائعة — نشاطك كله صار رقميًا، جاهزًا، ومُوثّقًا")}
          </p>
        </motion.div>

        {/* المسرح: ورق (يمين) ← تحوّل ← شاشة نشاط (يسار) */}
        <div className="mt-16 grid items-center gap-10 md:grid-cols-[1fr_auto_1.15fr]">
          {/* عالم الورق القديم */}
          <motion.div
            className="relative mx-auto flex h-52 w-56 items-center justify-center"
            animate={on ? { opacity: [1, 1, 0.55], filter: ["grayscale(0)", "grayscale(0)", "grayscale(0.6)"] } : { opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
          >
            {/* أوراق متطايرة */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-md border border-white/10 bg-white/85 shadow-lg"
                style={{ width: 58, height: 74, right: 30 + i * 8, top: 20 + i * 14, rotate: `${i * 7 - 14}deg` }}
                animate={on ? { x: [0, -6, 4, 0], y: [0, 4, -3, 0] } : {}}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              >
                <div className="mt-3 space-y-1.5 px-2">
                  <span className="block h-1 w-full rounded bg-slate-300" />
                  <span className="block h-1 w-4/5 rounded bg-slate-300" />
                  <span className="block h-1 w-full rounded bg-slate-200" />
                  <span className="block h-1 w-3/5 rounded bg-slate-200" />
                </div>
              </motion.div>
            ))}
            {/* شارات الهدر */}
            {WASTE.map((w, i) => (
              <motion.span
                key={w.label}
                className="absolute z-10 inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/15 px-2.5 py-1 text-[11px] font-bold text-red-200 backdrop-blur-sm"
                style={{ right: i % 2 ? -10 : 120, top: 10 + i * 46 }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={on ? { opacity: [0, 1, 1, 0.4], scale: 1 } : { opacity: 0 }}
                transition={{ duration: 1.8, delay: 0.2 + i * 0.15, ease: EASE }}
              >
                {w.icon} {w.label}
              </motion.span>
            ))}
          </motion.div>

          {/* سهم التحوّل */}
          <motion.div
            className="mx-auto flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
          >
            <span className="flex h-12 w-12 rotate-90 items-center justify-center rounded-full bg-gradient-to-l from-cyan-400 to-sun-400 text-2xl text-bg shadow-xl md:rotate-0">
              ←
            </span>
          </motion.div>

          {/* شاشة نشاط الرقمية + بطاقات الفائدة */}
          <div className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center">
            <motion.div
              className="relative z-10 aspect-[9/16] h-64 rounded-[26px] border-[6px] border-slate-800 bg-gradient-to-br from-[#0e2233] to-[#0a3a44] shadow-2xl"
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={on ? { opacity: 1, scale: 1, y: [0, -8, 0] } : { opacity: 0, scale: 0.7 }}
              transition={{
                opacity: { duration: 0.6, delay: 0.9 },
                scale: { duration: 0.6, delay: 0.9, ease: EASE },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.4 },
              }}
            >
              {/* واجهة مصغّرة */}
              <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                <span className="text-4xl">📱</span>
                <span className="font-display text-lg text-white">نشاط</span>
                <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200">كل شيء رقمي</span>
                <div className="mt-1 w-full space-y-1.5">
                  <span className="block h-1.5 w-full rounded bg-white/25" />
                  <span className="block h-1.5 w-4/5 rounded bg-white/15" />
                  <span className="block h-1.5 w-full rounded bg-white/15" />
                </div>
              </div>
            </motion.div>

            {/* بطاقات الفائدة تقفز حول الشاشة */}
            {GAINS.map((g, i) => (
              <motion.span
                key={g.label}
                className="absolute left-1/2 top-1/2 z-20 inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-cyan-300/30 bg-white/95 px-3 py-1.5 text-xs font-extrabold text-[#0e2233] shadow-xl"
                style={{ translateX: "-50%", translateY: "-50%" }}
                initial={{ opacity: 0, scale: 0.4, x: "-50%", y: "-50%" }}
                animate={on ? { opacity: 1, scale: 1, x: `calc(-50% + ${g.x})`, y: `calc(-50% + ${g.y})` } : { opacity: 0, scale: 0.4 }}
                transition={{ type: "spring", stiffness: 260, damping: 15, delay: 1.2 + i * 0.18 }}
              >
                <span className="text-sm">{g.icon}</span> {g.label}
              </motion.span>
            ))}
          </div>
        </div>

        {/* العبارة الختامية */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.6, ease: EASE }}
        >
          <p className="mx-auto max-w-[680px] font-display text-2xl leading-snug text-white sm:text-3xl">
            نشاطك بلا ورق، بلا طباعة، بلا هدر
            <span className="mt-1 block bg-gradient-to-l from-cyan-300 to-sun-300 bg-clip-text text-transparent">
              كل نشاط له معنى، وكل مسابقة لها أثر — رقميًا بالكامل
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
