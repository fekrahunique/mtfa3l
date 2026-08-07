import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import {
  RocketLaunch,
  FileArrowUp,
  PuzzlePiece,
  Toolbox,
  ChartLineUp,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { GlassCard } from "../components/GlassCard";

const RoadJourney = lazy(() =>
  import("../components/three/RoadJourney").then((m) => ({ default: m.RoadJourney }))
);

const benefits = [
  {
    icon: RocketLaunch,
    title: "جاهزة من أول يوم",
    body: "أنشطة صفية ولا صفية جاهزة تحقق المستهدف الأسبوعي مباشرة، بدون ما تبدأ من صفر.",
  },
  {
    icon: FileArrowUp,
    title: "حسابات الطلاب بضغطة واحدة",
    body: "ارفع ملف الإكسل أو الوورد اللي عندك، ويطلع لكل طالب حساب يدخل فيه ويتفاعل.",
  },
  {
    icon: PuzzlePiece,
    title: "متلائمة مع كل مرحلة وجنس",
    body: "محتوى وتصميم يفرّق بين الابتدائي والمتوسط، وبين البنين والبنات.",
  },
  {
    icon: Toolbox,
    title: "أدوات تسهّل التنفيذ",
    body: "مسابقات وتفاعلات وأدوات جاهزة تختصر وقت التحضير الأسبوعي.",
  },
  {
    icon: ChartLineUp,
    title: "لوحة تحكم توضح كل شيء",
    body: "تتابع تنفيذ الأنشطة والمستهدفات أسبوعًا بأسبوع من مكان واحد.",
  },
];

function immersiveNow() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useImmersiveEnabled() {
  const [enabled, setEnabled] = useState(immersiveNow);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(immersiveNow());
    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  return enabled;
}

function BenefitsGrid() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <ScrollReveal className="mx-auto max-w-[680px] text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">كل ما يحتاجه رائد النشاط، في مكان واحد</h2>
        <p className="mt-4 text-lg text-ink-muted">
          من التحضير إلى التنفيذ إلى المتابعة، متفاعل تختصر عليك الوقت وتحافظ على الجودة.
        </p>
      </ScrollReveal>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 0.08} className={i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}>
            <GlassCard className="h-full">
              <item.icon weight="duotone" className="h-9 w-9 text-sun-400" />
              <h3 className="mt-5 text-xl text-ink">{item.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-muted">{item.body}</p>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

export function Benefits() {
  const immersive = useImmersiveEnabled();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  if (!immersive) {
    return (
      <section id="benefits">
        <BenefitsGrid />
      </section>
    );
  }

  const signs = benefits.map((item, i) => ({
    title: item.title,
    body: item.body,
    step: `المحطة ${i + 1} من ${benefits.length}`,
  }));

  return (
    <section id="benefits" ref={trackRef} className="relative h-[250vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Suspense fallback={<div className="h-full w-full bg-[#d3e6f5]" />}>
          <RoadJourney progress={scrollYProgress} signs={signs} className="h-full w-full" />
        </Suspense>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#131209] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#131209] to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 top-28 text-center">
          <h2 className="text-3xl text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]">
            كل ما يحتاجه رائد النشاط، في مكان واحد
          </h2>
          <p className="mx-auto mt-3 max-w-[680px] px-4 text-white/80 [text-shadow:0_1px_14px_rgba(0,0,0,0.6)]">
            كمّل الطريق، وكل لوحة توقفك عند فائدة جديدة.
          </p>
        </div>
      </div>

      <div className="sr-only">
        <h3>مزايا منصة متفاعل</h3>
        <ul>
          {benefits.map((item) => (
            <li key={item.title}>
              {item.title}: {item.body}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
