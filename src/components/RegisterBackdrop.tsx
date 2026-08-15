import { motion, useReducedMotion } from "framer-motion";

/**
 * خلفية تسجيل سينمائية: مبنى «المربّون رواد ورائدات النشاط المتميّزون»
 * يقترب أكثر مع كل خطوة يُنجزها المستخدم (إحساس ثلاثي الأبعاد عبر المنظور والتقريب).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

// كل خطوة تقرّب المبنى أكثر (مقياس + رفع + وضوح)
const FRAMES = [
  { scale: 0.62, y: 40, blur: 3, glow: 0.25 },
  { scale: 0.82, y: 18, blur: 1.4, glow: 0.5 },
  { scale: 1.04, y: -6, blur: 0, glow: 0.85 },
];

export function RegisterBackdrop({ step, total }: { step: number; total: number }) {
  const reduced = useReducedMotion();
  const idx = Math.min(step, total - 1, FRAMES.length - 1);
  const f = FRAMES[idx];

  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden>
      {/* سماء الفجر السينمائية */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#1a1330 0%,#2b2350 30%,#5b3f6e 58%,#a86a72 80%,#e0a878 100%)" }} />

      {/* نجوم/جسيمات خافتة */}
      {!reduced && [...Array(18)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ width: 2, height: 2, left: `${(i * 53) % 100}%`, top: `${(i * 29) % 55}%`, opacity: 0.5 }}
          animate={{ opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      {/* توهّج خلف المبنى يزداد مع الاقتراب */}
      <motion.div
        className="absolute left-1/2 top-[46%] h-[520px] w-[520px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(244,182,58,0.55), transparent 66%)" }}
        animate={{ opacity: f.glow, scale: reduced ? 1 : f.scale }}
        transition={{ duration: 1.1, ease: EASE }}
      />

      {/* الأرض + الطريق المؤدّي للمبنى (منظور) */}
      <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: "linear-gradient(180deg, transparent, #241a2e 40%, #1a1226)" }} />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "60%", height: "40%",
          background: "linear-gradient(180deg, rgba(244,182,58,0.18), rgba(244,182,58,0.03))",
          clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0% 100%)",
        }}
        animate={{ opacity: 0.4 + idx * 0.2 }}
        transition={{ duration: 1, ease: EASE }}
      />

      {/* المبنى — يقترب مع كل خطوة */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ translateX: "-50%", translateY: "-50%", perspective: 900 }}
        animate={{ scale: reduced ? 0.95 : f.scale, y: reduced ? 0 : f.y, filter: `blur(${reduced ? 0 : f.blur}px)` }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <div className="relative w-[300px]">
          {/* لافتة المبنى */}
          <div className="mx-auto mb-2 w-[290px] rounded-xl border-2 border-sun-400/70 bg-[#1b1330]/90 px-3 py-2 text-center shadow-[0_0_30px_rgba(244,182,58,0.35)] backdrop-blur-sm">
            <p className="font-display text-[15px] leading-tight text-sun-300">المربّون رواد ورائدات</p>
            <p className="font-display text-[15px] leading-tight text-sun-300">النشاط المتميّزون</p>
          </div>

          {/* السقف */}
          <div className="mx-auto h-0 w-0" style={{ borderLeft: "150px solid transparent", borderRight: "150px solid transparent", borderBottom: "34px solid #6b4de6" }} />
          {/* الواجهة */}
          <div className="relative mx-auto w-[260px] rounded-b-md bg-gradient-to-b from-[#3a2f63] to-[#2a2049] px-4 pb-0 pt-4 shadow-2xl">
            {/* نوافذ مضيئة */}
            <div className="grid grid-cols-4 gap-2.5">
              {[...Array(12)].map((_, i) => (
                <motion.span
                  key={i}
                  className="h-6 rounded-sm"
                  style={{ background: "#f4b63a" }}
                  animate={reduced ? {} : { opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 2.4 + (i % 5) * 0.5, repeat: Infinity, delay: i * 0.13 }}
                />
              ))}
            </div>
            {/* الباب */}
            <div className="mx-auto mt-3 h-16 w-14 rounded-t-lg bg-gradient-to-b from-[#f4b63a] to-[#b06a00] shadow-[0_0_20px_rgba(244,182,58,0.5)]" />
          </div>
        </div>
      </motion.div>

      {/* حجاب سفلي ليندمج المحتوى فوقه */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#131209]/30 via-transparent to-[#131209]/70" />
    </div>
  );
}
