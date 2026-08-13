import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { UserCirclePlus, FileArrowUp, Confetti } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { STEP_THRESHOLDS } from "../components/three/schoolGateConfig";
import { noDot } from "../lib/utils";

const SchoolGate = lazy(() =>
  import("../components/three/SchoolGate").then((m) => ({ default: m.SchoolGate }))
);

const EASE = [0.32, 0.72, 0, 1] as const;

const steps = [
  {
    icon: UserCirclePlus,
    title: "سجّل بياناتك",
    body: "كمعلم أو معلمة نشاط، حدد المدرسة والمرحلة والجنس بخطوة واحدة.",
  },
  {
    icon: FileArrowUp,
    title: "ارفع ملف طلابك",
    body: "إكسل أو وورد، وتُقرأ أسماء الطلاب تلقائيًا بدون إدخال يدوي.",
  },
  {
    icon: Confetti,
    title: "ابدأ التشغيل",
    body: "أنشطة ومسابقات وألعاب جاهزة تشغّلها على الشاشة، وتقيس أثرها كل أسبوع.",
  },
];

function immersiveNow() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function StepsList() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24">
      <ScrollReveal className="mx-auto max-w-[680px] text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">ابدأ في ثلاث خطوات</h2>
        <p className="mt-4 text-lg text-ink-muted">سجّل، ارفع أسماء طلابك، وابدأ التشغيل</p>
      </ScrollReveal>

      <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="pointer-events-none absolute inset-x-0 top-7 hidden h-px bg-gradient-to-l from-transparent via-white/15 to-transparent sm:block" />
        {steps.map((step, i) => (
          <ScrollReveal key={step.title} delay={i * 0.12} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-bg-raised">
              <step.icon weight="duotone" className="h-7 w-7 text-sun-400" />
            </div>
            <span className="mt-4 text-sm font-semibold text-ink-faint">{`الخطوة ${i + 1}`}</span>
            <h3 className="mt-1 text-xl text-ink">{step.title}</h3>
            <p className="mt-2 max-w-xs text-base leading-relaxed text-ink-muted">{noDot(step.body)}</p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [immersive, setImmersive] = useState(immersiveNow);
  const [active, setActive] = useState(-1);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setImmersive(immersiveNow());
    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    let next = -1;
    STEP_THRESHOLDS.forEach((threshold, i) => {
      if (value >= threshold) next = i;
    });
    setActive(next);
  });

  if (!immersive) {
    return (
      <section id="how-it-works">
        <StepsList />
      </section>
    );
  }

  const current = active >= 0 ? steps[active] : null;

  return (
    <section id="how-it-works">
      {/* Title sits in normal flow so it scrolls away before the yard is pinned. */}
      <div className="mx-auto max-w-[680px] px-4 pb-16 pt-24 text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">ابدأ في ثلاث خطوات</h2>
        <p className="mt-4 text-lg text-ink-muted">
          ادخل من بوابة المدرسة، وعند كل عمود تنتظرك خطوة
        </p>
      </div>

      <div ref={trackRef} className="relative h-[220vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Suspense fallback={<div className="h-full w-full bg-[#b7d8ee]" />}>
            <SchoolGate progress={scrollYProgress} className="h-full w-full" />
          </Suspense>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#131209]/70 from-2% via-transparent via-35% to-[#131209]/92" />

          {/* All wording lives here, never inside the 3D scene. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center px-4">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={current.title}
                  initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="w-full max-w-[560px] rounded-3xl border border-white/15 bg-black/65 px-7 py-6 text-center backdrop-blur-xl"
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-sun-300">
                    <current.icon weight="duotone" className="h-5 w-5" />
                    الخطوة {active + 1} من {steps.length}
                  </div>
                  <h3 className="mt-2 font-display text-2xl text-white sm:text-3xl">{current.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-white/85">{noDot(current.body)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <h3>خطوات العمل على منصة نشاط</h3>
        <ol>
          {steps.map((step) => (
            <li key={step.title}>
              {step.title}: {noDot(step.body)}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
