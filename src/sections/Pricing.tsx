import { lazy, Suspense, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkle, RocketLaunch, Crown, Check, Star, CaretLeft, CaretDown } from "@phosphor-icons/react";
import { noDot } from "../lib/utils";
import { PLANS, planPrice, arDigits, type PlanIcon, type Plan } from "../data/plans";

const ClassroomBackdrop = lazy(() =>
  import("../components/three/ClassroomBackdrop").then((m) => ({ default: m.ClassroomBackdrop }))
);

const EASE = [0.32, 0.72, 0, 1] as const;

const ICONS: Record<PlanIcon, typeof Sparkle> = { sparkle: Sparkle, rocket: RocketLaunch, crown: Crown };

/** بطاقة بإمالة ثلاثية الأبعاد تتبع المؤشّر (تحويلات GPU خفيفة، بلا WebGL). */
function TiltCard({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(mvX, { stiffness: 200, damping: 18 });
  const rotateY = useSpring(mvY, { stiffness: 200, damping: 18 });
  if (reduce) return <div className="h-full">{children}</div>;
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mvY.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    mvX.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
  }
  function onLeave() { mvX.set(0); mvY.set(0); }
  return (
    <motion.div onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.015 }} transition={{ scale: { duration: 0.3, ease: EASE } }}
      className="h-full">
      {children}
    </motion.div>
  );
}

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const Icon = ICONS[plan.icon];
  const { amount, period } = planPrice(plan, annual);
  const featured = plan.featured;
  return (
    <div className={`relative h-full ${featured ? "lg:scale-[1.03]" : ""}`} style={{ perspective: "1000px" }}>
      {featured && (
        <div aria-hidden className="pointer-events-none absolute -inset-[2px] -z-10 rounded-[26px] bg-[radial-gradient(ellipse_at_top,theme(colors.sun.400),transparent_70%)] opacity-40 blur-lg" />
      )}
      <TiltCard>
        <div className={`flex h-full flex-col rounded-3xl border p-7 backdrop-blur-xl ${featured ? "border-sun-400/60 bg-[#141018]/85 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" : "border-white/12 bg-[#141018]/75"}`}>
          {plan.badge && (
            <span className={`mb-4 inline-flex w-max items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${featured ? "bg-sun-400 text-bg" : "bg-white/10 text-sun-300"}`}>
              {featured && <Crown weight="fill" className="h-3.5 w-3.5" />}
              {plan.badge}
            </span>
          )}
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${featured ? "bg-sun-400/20 text-sun-300" : "bg-white/5 text-ink-muted"}`}>
              <Icon weight="duotone" className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-2xl text-ink">{plan.name}</h3>
              <p className="text-sm text-ink-muted">{noDot(plan.tagline)}</p>
            </div>
          </div>
          <div className="mt-6 flex items-end gap-2">
            <AnimatePresence mode="popLayout">
              <motion.span key={amount} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="font-display text-5xl leading-none text-ink">
                {arDigits(amount)}
              </motion.span>
            </AnimatePresence>
            <span className="mb-1 text-sm text-ink-muted">{period}</span>
          </div>
          {annual && <p className="mt-1 text-xs text-emerald-300">ما يعادل {arDigits(plan.monthly)}﷼ شهريًا — بشهرين مجانًا</p>}
          {plan.inherits && <p className="mt-6 text-sm font-semibold text-sun-300">{noDot(plan.inherits)}</p>}
          <ul className="mt-4 space-y-3">
            {plan.features.map((f, k) => (
              <li key={k} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${f.star ? "bg-sun-400 text-bg" : featured ? "bg-sun-400/20 text-sun-300" : "bg-white/10 text-ink-muted"}`}>
                  {f.star ? <Star weight="fill" className="h-3 w-3" /> : <Check weight="bold" className="h-3 w-3" />}
                </span>
                <span className={f.star ? "font-semibold text-ink" : "text-ink-muted"}>{noDot(f.text)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-2">
            <Link to="/تسجيل" state={{ plan: plan.id }}
              className={`group flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${featured ? "bg-sun-400 text-bg hover:scale-[1.03] hover:bg-sun-300" : "border border-white/15 text-ink hover:border-white/35 hover:bg-white/5"}`}>
              {plan.cta}
              <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
            </Link>
            {plan.nudge && <p className="mt-3 text-center text-xs text-sun-300/90">{noDot(plan.nudge)}</p>}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

/** مفتاح الدورة + شبكة البطاقات. */
function PlanGrid({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  return (
    <>
      <div className="flex items-center justify-center gap-3">
        <div className="relative flex items-center rounded-full border border-white/15 bg-black/40 p-1 backdrop-blur-md">
          {[{ key: false, label: "شهري" }, { key: true, label: "سنوي" }].map((opt) => (
            <button key={String(opt.key)} type="button" onClick={() => setAnnual(opt.key)}
              className="relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300"
              style={{ color: annual === opt.key ? "#131209" : undefined }}>
              {annual === opt.key && <motion.span layoutId="billing-pill" transition={{ duration: 0.4, ease: EASE }} className="absolute inset-0 -z-10 rounded-full bg-sun-400" />}
              <span className={annual === opt.key ? "" : "text-ink-muted"}>{opt.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {annual && (
            <motion.span initial={{ opacity: 0, scale: 0.8, x: 8 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: 8 }} className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
              🎁 شهران مجانًا
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl items-stretch gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} annual={annual} />)}
      </div>
    </>
  );
}

/** نسخة مبسّطة بلا تثبيت (لتفضيل تقليل الحركة). */
function StaticPricing({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  return (
    <section id="pricing" className="relative overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Suspense fallback={<div className="h-full w-full bg-[#171019]" />}>
          <ClassroomBackdrop className="h-full w-full" />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-[#131209] via-[#131209]/55 to-[#131209]" />
      </div>
      <div className="mx-auto max-w-[680px] text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">اختر خطة استثمارك في فصلك</h2>
        <p className="mt-4 text-lg text-ink-muted">بأقل من ريالين يوميًا، فصلٌ لا يعرف الملل طوال العام</p>
      </div>
      <div className="mt-10"><PlanGrid annual={annual} setAnnual={setAnnual} /></div>
    </section>
  );
}

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // شفافية طبقة التعتيم: الفصل واضح أولًا ثم يعتم قليلًا لتُقرأ البطاقات
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.35, 0.62, 1], [0.1, 0.22, 0.52, 0.55]);
  // العنوان التسويقي الأول: ظاهر ثم يتلاشى مع بدء الزوم
  const heroOpacity = useTransform(scrollYProgress, [0, 0.16, 0.24], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.24], [0, -50]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12, 0.2], [1, 1, 0]);
  // البطاقات تُركَّب على الشاشة بعد الزوم
  const cardsOpacity = useTransform(scrollYProgress, [0.5, 0.72], [0, 1]);
  const cardsScale = useTransform(scrollYProgress, [0.5, 0.72], [0.92, 1]);
  const cardsY = useTransform(scrollYProgress, [0.5, 0.72], [60, 0]);
  const cardsPE = useTransform(scrollYProgress, (v) => (v > 0.58 ? "auto" : "none"));

  if (reduce) return <StaticPricing annual={annual} setAnnual={setAnnual} />;

  return (
    <section id="pricing" ref={trackRef} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* الفصل الحيّ خلفية، مقاد بالتمرير للزوم داخل الشاشة */}
        <div className="absolute inset-0">
          <Suspense fallback={<div className="h-full w-full bg-[#171019]" />}>
            <ClassroomBackdrop progress={scrollYProgress} className="h-full w-full" />
          </Suspense>
          <motion.div className="absolute inset-0 bg-[#131209]" style={{ opacity: scrimOpacity }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#131209] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#131209] to-transparent" />
        </div>

        {/* العنوان التسويقي فوق الفصل الواضح */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="pointer-events-none absolute inset-x-0 top-[22vh] flex flex-col items-center px-4 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-md">
            <Sparkle weight="fill" className="h-4 w-4" />
            خطط الاستثمار في فصلك
          </span>
          <h2 className="max-w-[820px] font-display text-4xl text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.7)] sm:text-6xl">
            هكذا يصير فصلك مع نشاط
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-lg text-white/85 [text-shadow:0_1px_16px_rgba(0,0,0,0.75)]">
            طلابٌ يرفعون أيديهم، وشاشةٌ تشتعل بالتحديات — واصل النزول، وضَع فصلك على الشاشة
          </p>
        </motion.div>

        {/* مؤشّر النزول */}
        <motion.div style={{ opacity: hintOpacity }} className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-1 text-white/70">
          <span className="text-sm">انزل لتُركّب خطتك على الشاشة</span>
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <CaretDown weight="bold" className="h-5 w-5" />
          </motion.span>
        </motion.div>

        {/* البطاقات تُركَّب على شاشة العرض */}
        <motion.div style={{ opacity: cardsOpacity, scale: cardsScale, y: cardsY, pointerEvents: cardsPE }} className="absolute inset-0 flex flex-col justify-center overflow-y-auto px-4 py-12">
          <div className="mx-auto mb-7 max-w-[680px] text-center">
            <h2 className="font-display text-3xl text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.8)] sm:text-4xl">اختر خطة استثمارك</h2>
            <p className="mx-auto mt-3 max-w-[560px] text-base text-white/85 [text-shadow:0_1px_14px_rgba(0,0,0,0.8)]">
              بأقل من ريالين يوميًا... فصلٌ لا يعرف الملل طوال العام
            </p>
          </div>
          <PlanGrid annual={annual} setAnnual={setAnnual} />
        </motion.div>
      </div>
    </section>
  );
}
