import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/** حافلة مدرسة مبسّطة (زخرفية). */
function Bus({ scale = 1 }: { scale?: number }) {
  return (
    <div className="relative" style={{ transform: `scale(${scale})` }}>
      <div className="relative h-9 w-24 rounded-lg rounded-tr-[1.1rem] shadow-lg" style={{ background: "linear-gradient(180deg,#ffd85e,#f7c11e)" }}>
        <div className="absolute right-2 top-1.5 flex gap-1">
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-3 w-3 rounded-[3px] bg-sky-100/90" />)}
        </div>
        <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-[3px] bg-sky-100/80" />
        <div className="absolute inset-x-0 bottom-1.5 h-1 bg-black/15" />
      </div>
      <div className="absolute -bottom-1.5 right-3.5 h-3.5 w-3.5 rounded-full border-2 border-neutral-500 bg-neutral-800" />
      <div className="absolute -bottom-1.5 left-3.5 h-3.5 w-3.5 rounded-full border-2 border-neutral-500 bg-neutral-800" />
    </div>
  );
}

/** لوحة/شعار «عودة المدارس» — واضحة وهادئة. */
function Sign({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl px-3.5 py-2 text-center text-[11px] font-black leading-tight shadow-md" style={{ background: "rgba(255,255,255,.92)", color: "#356b86", border: "2px solid rgba(255,255,255,.75)" }}>{text}</div>
      <div className="h-12 w-1.5 rounded-full" style={{ background: "rgba(255,255,255,.45)" }} />
    </div>
  );
}

/**
 * خلفية «عودة المدارس»: تدرّج ألوان رايق (فجر هادئ)، شمس ناعمة تطلع مع
 * التمرير، حافلات تمشي لحالها في الشارع، وشعارات عودة واضحة غير مزعجة.
 * بلا تعتيم — زخرفية بالكامل (pointer-events: none).
 */
export function BackToSchoolBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const sunY = useTransform(scrollYProgress, [0, 1], [150, -50]); // الشمس تطلع مع النزول
  const sunGlow = useTransform(scrollYProgress, [0, 0.6, 1], [0.6, 0.9, 1]);
  const signsX = useTransform(scrollYProgress, [0, 1], ["0vw", "-12vw"]);

  const BUSES = [
    { bottom: "6%", op: 0.6, scale: 1, dur: 16, delay: 0, rest: "18%" },
    { bottom: "11%", op: 0.42, scale: 0.72, dur: 24, delay: 6, rest: "54%" },
    { bottom: "3%", op: 0.5, scale: 0.9, dur: 19, delay: 12, rest: "80%" },
  ];
  const SIGNS = [
    { text: "🎒 عودة المدارس", style: { right: "9%", bottom: "24%", opacity: 0.6 } },
    { text: "🚌 أهلاً بالطلاب", style: { left: "13%", bottom: "24%", opacity: 0.55 } },
    { text: "📚 عام دراسي سعيد", style: { right: "42%", bottom: "24%", opacity: 0.42 } },
    { text: "١٤٤٨ · نبدأ بفرح", style: { left: "44%", bottom: "24%", opacity: 0.4 } },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* سماء فجر هادئة — تدرّج ألوان رايق */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#25405f 0%,#356b86 34%,#5f8fa6 58%,#9a8bb0 78%,#c99ba8 92%,#e6b79a 100%)" }} />
      {/* توهّج أفق ناعم */}
      <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: "linear-gradient(180deg,transparent,rgba(240,190,160,.35) 55%,rgba(230,170,140,.5))" }} />

      {/* الشمس — توهّج ناعم بلا ذهبي صارخ */}
      <motion.div style={{ y: sunY, opacity: sunGlow }} className="absolute left-1/2 top-[56%] h-56 w-56 -translate-x-1/2 rounded-full" aria-hidden>
        <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle,#fff4e8 0%,#ffdcc4 42%,rgba(255,200,175,.4) 66%,transparent 74%)" }} />
      </motion.div>

      {/* شعارات العودة للمدارس — واضحة وهادئة */}
      <motion.div style={{ x: signsX }} className="absolute inset-0">
        {SIGNS.map((s, i) => (
          <div key={i} className="absolute" style={s.style}><Sign text={s.text} /></div>
        ))}
      </motion.div>

      {/* الشارع + خط متقطّع */}
      <div className="absolute inset-x-0 bottom-0 h-[15%]" style={{ background: "linear-gradient(180deg,rgba(70,90,110,.25),rgba(50,65,85,.45))" }} />
      <div className="absolute inset-x-0 bottom-[8%] h-0.5" style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(255,255,255,.4) 0 22px,transparent 22px 44px)" }} />

      {/* الحافلات — تمشي لحالها باستمرار من اليمين خارج الشاشة إلى اليسار */}
      {BUSES.map((b, i) => (
        <motion.div key={i} className="absolute" style={{ bottom: b.bottom, left: reduce ? b.rest : "100%", opacity: b.op }}
          animate={reduce ? undefined : { x: ["0vw", "-116vw"] }}
          transition={reduce ? undefined : { duration: b.dur, repeat: Infinity, ease: "linear", delay: b.delay }}>
          <Bus scale={b.scale} />
        </motion.div>
      ))}
    </div>
  );
}
