import { motion, useScroll, useTransform } from "framer-motion";

/** حافلة مدرسة مبسّطة (زخرفية). */
function Bus({ scale = 1 }: { scale?: number }) {
  return (
    <div className="relative" style={{ transform: `scale(${scale})` }}>
      <div className="relative h-9 w-24 rounded-lg rounded-tr-[1.1rem] shadow-lg" style={{ background: "linear-gradient(180deg,#ffd233,#f5b60a)" }}>
        <div className="absolute right-2 top-1.5 flex gap-1">
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-3 w-3 rounded-[3px] bg-sky-100/85" />)}
        </div>
        <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-[3px] bg-sky-100/70" />
        <div className="absolute inset-x-0 bottom-1.5 h-1 bg-black/25" />
      </div>
      <div className="absolute -bottom-1.5 right-3.5 h-3.5 w-3.5 rounded-full border-2 border-neutral-600 bg-neutral-900" />
      <div className="absolute -bottom-1.5 left-3.5 h-3.5 w-3.5 rounded-full border-2 border-neutral-600 bg-neutral-900" />
    </div>
  );
}

/** لوحة إعلان شارع «عودة المدارس». */
function Billboard({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-md border-2 px-3 py-2 text-center text-[11px] font-black leading-tight" style={{ borderColor: "rgba(255,255,255,.4)", background: "linear-gradient(135deg,#fb7185,#f59e0b)", color: "#3a1d00" }}>{text}</div>
      <div className="h-10 w-1.5 bg-white/25" />
    </div>
  );
}

/**
 * خلفية «عودة المدارس» باهتة خلف المحتوى: شروق يطلع مع التمرير، وحافلات
 * تتحرك في الشارع، ولوحات إعلانات — زخرفية بالكامل (pointer-events: none).
 */
export function BackToSchoolBackdrop() {
  const { scrollYProgress } = useScroll();
  const sunY = useTransform(scrollYProgress, [0, 1], [140, -60]); // الشمس تطلع مع النزول
  const sunGlow = useTransform(scrollYProgress, [0, 0.6, 1], [0.55, 0.85, 1]);
  const bus1 = useTransform(scrollYProgress, [0, 1], ["8vw", "-46vw"]);
  const bus2 = useTransform(scrollYProgress, [0, 1], ["-10vw", "60vw"]);
  const bus3 = useTransform(scrollYProgress, [0, 1], ["36vw", "-24vw"]);
  const boardsX = useTransform(scrollYProgress, [0, 1], ["0vw", "-14vw"]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* سماء الشروق */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#1c1204 0%,#2c1806 38%,#5a2f08 66%,#9a4d0c 84%,#d1701a 100%)" }} />

      {/* الشمس */}
      <motion.div style={{ y: sunY, opacity: sunGlow }} className="absolute left-1/2 top-[54%] h-52 w-52 -translate-x-1/2 rounded-full"
        aria-hidden
        // توهّج ذهبي دافئ
      >
        <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle,#ffedc0 0%,#f9c74f 45%,rgba(247,183,51,.35) 66%,transparent 74%)", filter: "blur(1px)" }} />
      </motion.div>

      {/* أفق ووهج قرب الأرض */}
      <div className="absolute inset-x-0 bottom-0 h-[34%]" style={{ background: "linear-gradient(180deg,transparent,rgba(209,112,26,.25) 40%,rgba(0,0,0,.4))" }} />

      {/* لوحات إعلانات الشوارع */}
      <motion.div style={{ x: boardsX }} className="absolute inset-x-0 bottom-[22%]">
        <div className="absolute right-[10%] opacity-30"><Billboard text="🎒 عودة المدارس" /></div>
        <div className="absolute left-[14%] opacity-25"><Billboard text="🚌 أهلاً بالطلاب" /></div>
        <div className="absolute right-[46%] opacity-20"><Billboard text="١٤٤٨ · نبدأ بفرح" /></div>
      </motion.div>

      {/* الشارع + الحافلات */}
      <div className="absolute inset-x-0 bottom-0 h-[16%]" style={{ background: "linear-gradient(180deg,rgba(30,20,8,.5),rgba(10,7,3,.85))" }} />
      <div className="absolute inset-x-0 bottom-[8%] h-0.5 bg-white/15" style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0 22px,transparent 22px 44px)" }} />
      <motion.div style={{ x: bus1 }} className="absolute bottom-[6%] right-0 opacity-45"><Bus /></motion.div>
      <motion.div style={{ x: bus2 }} className="absolute bottom-[11%] left-0 opacity-30"><Bus scale={0.72} /></motion.div>
      <motion.div style={{ x: bus3 }} className="absolute bottom-[3%] right-0 opacity-35"><Bus scale={0.9} /></motion.div>

      {/* طبقة تعتيم للوضوح — تُبقي المشهد باهتًا خلف النص */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(26,18,6,.8) 0%,rgba(26,18,6,.62) 42%,rgba(26,18,6,.72) 100%)" }} />
    </div>
  );
}
