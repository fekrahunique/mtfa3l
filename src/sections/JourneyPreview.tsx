import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import { CaretLeft, GraduationCap, FileArrowUp, SquaresFour } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { GlassCard } from "../components/GlassCard";
import { STATION_THRESHOLDS } from "../components/three/runTrackConfig";
import { noDot } from "../lib/utils";

const RunTrack = lazy(() =>
  import("../components/three/RunTrack").then((m) => ({ default: m.RunTrack }))
);

const EASE = [0.32, 0.72, 0, 1] as const;

const stations = [
  {
    icon: GraduationCap,
    title: "حدد مدرستك",
    body: "حكومية أو أهلية، ابتدائي أو متوسط، بنين أو بنات، وتتلون المنصة على مزاجك.",
  },
  {
    icon: FileArrowUp,
    title: "ارفع ملف الطلاب",
    body: "إكسل أو وورد من جهازك، وتُجهَّز قائمة طلابك خلال ثوانٍ.",
  },
  {
    icon: SquaresFour,
    title: "ادخل لوحة التحكم",
    body: "أنشطة، مسابقات، وأدوات جاهزة، مع متابعة أسبوعية لكل مستهدف.",
  },
];

function immersiveNow() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function JourneyCards() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <ScrollReveal className="mx-auto max-w-[680px] text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">رحلتك من التسجيل إلى أول نشاط</h2>
        <p className="mt-4 text-lg text-ink-muted">
          تجربة واحدة متصلة، من أول تعريف بالمنصة إلى لوحة التحكم اليومية
        </p>
      </ScrollReveal>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {stations.map((station, i) => (
          <ScrollReveal key={station.title} delay={i * 0.1}>
            <GlassCard className="h-full">
              <station.icon weight="duotone" className="h-9 w-9 text-sun-400" />
              <h3 className="mt-5 text-xl text-ink">{station.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-muted">{noDot(station.body)}</p>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal className="mt-12 flex justify-center">
        <Link
          to="/تسجيل"
          className="group flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-base font-semibold text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/30 hover:bg-white/5 active:scale-95"
        >
          جرّب الرحلة الآن
          <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
        </Link>
      </ScrollReveal>
    </div>
  );
}

export function JourneyPreview() {
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
    STATION_THRESHOLDS.forEach((threshold, i) => {
      if (value >= threshold) next = i;
    });
    setActive(next);
  });

  if (!immersive) {
    return (
      <section id="journey">
        <JourneyCards />
      </section>
    );
  }

  const current = active >= 0 ? stations[active] : null;

  return (
    <section id="journey">
      {/* Title scrolls away before the track pins, so it can never sit over a gate. */}
      <div className="mx-auto max-w-[680px] px-4 pb-16 pt-24 text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">رحلتك من التسجيل إلى أول نشاط</h2>
        <p className="mt-4 text-lg text-ink-muted">
          ثلاث محطات على المضمار، وتوصل لأول نشاط
        </p>
      </div>

      <div ref={trackRef} className="relative h-[230vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Suspense fallback={<div className="h-full w-full bg-[#bcd9ef]" />}>
            <RunTrack progress={scrollYProgress} className="h-full w-full" />
          </Suspense>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#131209]/60 from-2% via-transparent via-35% to-[#131209]/92" />

          {/* All wording lives here, never inside the 3D scene. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center px-4">
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
                    المحطة {active + 1} من {stations.length}
                  </div>
                  <h3 className="mt-2 font-display text-2xl text-white sm:text-3xl">{current.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-white/85">{noDot(current.body)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute inset-x-0 bottom-10 flex justify-center">
            <Link
              to="/تسجيل"
              className="group flex items-center gap-2 rounded-full bg-sun-400 px-6 py-3 text-base font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 hover:bg-sun-300 active:scale-95"
            >
              جرّب الرحلة الآن
              <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <h3>محطات رحلة التسجيل</h3>
        <ol>
          {stations.map((station) => (
            <li key={station.title}>
              {station.title}: {noDot(station.body)}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
