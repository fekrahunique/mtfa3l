import { motion, useReducedMotion } from "framer-motion";

/**
 * خلفية تسجيل سينمائية خيالية: صباح تُشرق فيه الشمس تدريجيًا من نفسها،
 * وطيور تعبر السماء، وفرش خزامى يمتدّ نحو مبنى «المربّون رواد ورائدات النشاط المتميّزون».
 * المستخدم «يمشي» نحو المبنى: يقترب أكثر مع كل خطوة يُنجزها.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

// كل خطوة تقرّب المشهد أكثر (كأنك تمشي نحو المبنى)
const WALK = [
  { scale: 0.72, y: 26, blur: 2.4 },
  { scale: 0.9, y: 8, blur: 1 },
  { scale: 1.08, y: -8, blur: 0 },
];

// طيور تعبر السماء
const BIRDS = [
  { top: "18%", size: 22, dur: 14, delay: 0 },
  { top: "26%", size: 16, dur: 18, delay: 2.5 },
  { top: "13%", size: 18, dur: 16, delay: 5 },
  { top: "30%", size: 13, dur: 20, delay: 8 },
];

function Bird({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 24 12" fill="none">
      <path d="M1 8 Q6 1 12 7 Q18 1 23 8" stroke="#3a2f4a" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function RegisterBackdrop({ step, total }: { step: number; total: number }) {
  const reduced = useReducedMotion();
  const idx = Math.min(step, total - 1, WALK.length - 1);
  const f = WALK[idx];

  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden style={{ perspective: 1100 }}>
      {/* سماء الصباح */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#1e2a52 0%,#3a3a74 26%,#6f5b93 48%,#b98aa0 66%,#e9b48c 82%,#f6d9a8 100%)" }} />

      {/* توهّج الشروق يشتدّ مع طلوع الشمس */}
      <motion.div
        className="absolute left-1/2 bottom-[26%] h-[560px] w-[560px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,214,140,0.6), transparent 62%)" }}
        initial={{ opacity: 0.15, scale: 0.7 }}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.15, 0.85], scale: [0.7, 1.05] }}
        transition={{ duration: 9, ease: "easeOut" }}
      />

      {/* الشمس تطلع تدريجيًا من نفسها */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 130, height: 130, background: "radial-gradient(circle at 50% 45%, #fff6df, #ffcf7a 60%, #ffb24d)", boxShadow: "0 0 90px 30px rgba(255,196,102,0.55)" }}
        initial={{ bottom: "8%", opacity: 0.5 }}
        animate={reduced ? { bottom: "40%", opacity: 1 } : { bottom: ["8%", "44%"], opacity: [0.5, 1] }}
        transition={{ duration: 9, ease: "easeOut" }}
      />

      {/* غيوم ناعمة تنساب */}
      {!reduced && [{ top: "20%", w: 150, dur: 40, o: 0.35 }, { top: "34%", w: 110, dur: 52, o: 0.28 }, { top: "12%", w: 90, dur: 46, o: 0.3 }].map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white blur-xl"
          style={{ top: c.top, height: c.w * 0.4, width: c.w, opacity: c.o }}
          initial={{ left: "-20%" }}
          animate={{ left: "120%" }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "linear", delay: i * 6 }}
        />
      ))}

      {/* طيور تعبر */}
      {!reduced && BIRDS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: b.top }}
          initial={{ left: "110%" }}
          animate={{ left: "-10%", y: [0, -14, 0, -8, 0] }}
          transition={{ left: { duration: b.dur, repeat: Infinity, ease: "linear", delay: b.delay }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        >
          <Bird size={b.size} />
        </motion.div>
      ))}

      {/* الأرض */}
      <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{ background: "linear-gradient(180deg, transparent, #3a2b4a 30%, #2a1f3a)" }} />

      {/* فرش الخزامى الممتدّ نحو المبنى (منظور) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: "64%", height: "42%", transformStyle: "preserve-3d" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #c9a9e9 0%, #b57edc 45%, #9a6fc9 100%)",
            clipPath: "polygon(41% 0, 59% 0, 100% 100%, 0% 100%)",
            boxShadow: "0 0 40px rgba(181,126,220,0.5)",
          }}
        />
        {/* خطوط عرضية تتحرّك للأمام (إحساس المشي) */}
        {!reduced && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0"
            style={{ height: 3, background: "rgba(255,255,255,0.22)", clipPath: "polygon(41% 0, 59% 0, 100% 100%, 0% 100%)" }}
            initial={{ bottom: `${i * 18}%`, opacity: 0 }}
            animate={{ bottom: ["100%", "0%"], opacity: [0, 0.6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* المبنى — يقترب مع كل خطوة (كأنك تمشي إليه)، مع تمايل مشي خفيف */}
      <motion.div
        className="absolute left-1/2 top-[40%]"
        style={{ translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: reduced ? 0.95 : f.scale, y: reduced ? 0 : f.y, filter: `blur(${reduced ? 0 : f.blur}px)` }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <motion.div
          animate={reduced ? {} : { y: [0, -3, 0, -2, 0], rotate: [0, 0.3, 0, -0.3, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-[300px]">
            {/* لافتة المبنى */}
            <div className="mx-auto mb-2 w-[292px] rounded-xl border-2 border-sun-400/80 bg-[#241640]/90 px-3 py-2 text-center shadow-[0_0_34px_rgba(244,182,58,0.45)] backdrop-blur-sm">
              <p className="font-display text-[15px] leading-tight text-sun-300">المربّون رواد ورائدات</p>
              <p className="font-display text-[15px] leading-tight text-sun-300">النشاط المتميّزون</p>
            </div>
            {/* السقف */}
            <div className="mx-auto h-0 w-0" style={{ borderLeft: "150px solid transparent", borderRight: "150px solid transparent", borderBottom: "36px solid #7c5fd6" }} />
            {/* الواجهة */}
            <div className="relative mx-auto w-[262px] rounded-b-md bg-gradient-to-b from-[#4a3a7d] to-[#332658] px-4 pb-0 pt-4 shadow-2xl">
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
              {/* الباب في نهاية الفرش */}
              <div className="mx-auto mt-3 h-16 w-14 rounded-t-lg bg-gradient-to-b from-[#f4b63a] to-[#b06a00] shadow-[0_0_22px_rgba(244,182,58,0.6)]" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* جسيمات خيالية متلألئة */}
      {!reduced && [...Array(16)].map((_, i) => (
        <motion.span
          key={`p${i}`}
          className="absolute rounded-full"
          style={{ width: 3, height: 3, left: `${(i * 61) % 100}%`, top: `${20 + (i * 37) % 55}%`, background: i % 2 ? "#f4d58a" : "#d8bfe8" }}
          animate={{ y: [0, -22, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
        />
      ))}

      {/* حجاب سفلي ليقرأ المحتوى فوقه */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#131209]/20 via-transparent to-[#131209]/72" />
    </div>
  );
}
