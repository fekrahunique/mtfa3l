import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CaretLeft, Sparkle } from "@phosphor-icons/react";

const DrivingScene = lazy(() =>
  import("../components/three/DrivingScene").then((m) => ({ default: m.DrivingScene }))
);

const EASE = [0.32, 0.72, 0, 1] as const;

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full w-full bg-[#cfe3f2]" />}>
          <DrivingScene className="h-full w-full" />
        </Suspense>
      </div>

      {/* Dark at the top so the copy stays legible, clear through the middle so
          the road and its vanishing point read, dark again into the next section. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#131209]/90 from-5% via-[#131209]/20 via-55% to-[#131209]/85" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center px-4 pt-[13vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-xl"
        >
          <Sparkle weight="fill" className="h-4 w-4" />
          نسخة تجريبية قيد التطوير
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="mx-auto max-w-[680px] text-4xl leading-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-6xl"
        >
          خطّط أنشطة أسبوعك
          <br />
          في دقائق، لا أيام
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mx-auto mt-6 max-w-[680px] text-lg text-white/85 [text-shadow:0_1px_16px_rgba(0,0,0,0.6)]"
        >
          متفاعل منصة جاهزة لرواد النشاط في المدارس الحكومية والأهلية، فيها كل نشاط
          صفي ولا صفي يحقق المستهدف الأسبوعي المعتمد، لمرحلتي الابتدائي والمتوسط،
          بنين وبنات.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            to="/تسجيل"
            className="group flex items-center gap-2 rounded-full bg-sun-400 px-6 py-3 text-base font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 hover:bg-sun-300 active:scale-95"
          >
            ابدأ التسجيل المجاني
            <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
          </Link>
          <a
            href="#benefits"
            className="rounded-full border border-white/30 bg-black/25 px-6 py-3 text-base font-semibold text-white backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/50 hover:bg-black/40 active:scale-95"
          >
            كمّل الطريق معنا
          </a>
        </motion.div>
      </div>
    </section>
  );
}
