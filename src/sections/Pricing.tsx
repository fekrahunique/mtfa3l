import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
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
const TRIAL_NOTE = "بلا اشتراك: جرّب نشاطًا واحدًا من الأسبوع التمهيدي، ثم اختر خطتك";

/** إمالة ثلاثية الأبعاد خفيفة تتبع المؤشّر. */
function TiltCard({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(mvX, { stiffness: 200, damping: 18 });
  const rotateY = useSpring(mvY, { stiffness: 200, damping: 18 });
  if (reduce) return <div className="h-full">{children}</div>;
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mvY.set(((e.clientX - r.left) / r.width - 0.5) * 6);
    mvX.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  }
  function onLeave() { mvX.set(0); mvY.set(0); }
  return (
    <motion.div onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.012 }} transition={{ scale: { duration: 0.3, ease: EASE } }}
      className="h-full">
      {children}
    </motion.div>
  );
}

function PlanCard({ plan, annual, light }: { plan: Plan; annual: boolean; light?: boolean }) {
  const Icon = ICONS[plan.icon];
  const { amount, period } = planPrice(plan, annual);
  const featured = plan.featured;

  const shell = light
    ? featured ? "border-sun-500/70 bg-white shadow-[0_14px_44px_rgba(180,120,20,0.22)]" : "border-black/10 bg-white/92"
    : featured ? "border-sun-400/60 bg-[#141018]/85 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" : "border-white/12 bg-[#141018]/75 backdrop-blur-xl";
  const ink = light ? "text-[#22203a]" : "text-ink";
  const sub = light ? "text-[#6b6478]" : "text-ink-muted";
  const featText = light ? "text-[#5b5568]" : "text-ink-muted";

  return (
    <div className={`relative h-full ${featured ? "lg:scale-[1.03]" : ""}`} style={{ perspective: "1000px" }}>
      {featured && !light && (
        <div aria-hidden className="pointer-events-none absolute -inset-[2px] -z-10 rounded-[26px] bg-[radial-gradient(ellipse_at_top,theme(colors.sun.400),transparent_70%)] opacity-40 blur-lg" />
      )}
      <TiltCard>
        <div className={`flex h-full flex-col rounded-2xl border p-5 ${shell}`}>
          {plan.badge && (
            <span className={`mb-3 inline-flex w-max items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${featured ? "bg-sun-400 text-[#1a1204]" : light ? "bg-[#4d1c9b]/10 text-[#4d1c9b]" : "bg-white/10 text-sun-300"}`}>
              {featured && <Crown weight="fill" className="h-3.5 w-3.5" />}
              {plan.badge}
            </span>
          )}
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${featured ? "bg-sun-400/20 text-sun-500" : light ? "bg-black/5 text-[#6b6478]" : "bg-white/5 text-ink-muted"}`}>
              <Icon weight="duotone" className="h-5 w-5" />
            </span>
            <div>
              <h3 className={`font-display text-xl ${ink}`}>{plan.name}</h3>
              <p className={`text-xs ${sub}`}>{noDot(plan.tagline)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <AnimatePresence mode="popLayout">
              <motion.span key={amount} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className={`font-display text-4xl leading-none ${ink}`}>
                {arDigits(amount)}
              </motion.span>
            </AnimatePresence>
            <span className={`mb-1 text-xs ${sub}`}>{period}</span>
          </div>
          {annual && <p className="mt-1 text-xs text-emerald-500">ما يعادل {arDigits(plan.monthly)}﷼ شهريًا — بشهرين مجانًا</p>}
          {plan.inherits && <p className={`mt-4 text-sm font-semibold ${light ? "text-[#b06a00]" : "text-sun-300"}`}>{noDot(plan.inherits)}</p>}
          <ul className="mt-3 space-y-2">
            {plan.features.map((f, k) => (
              <li key={k} className="flex items-start gap-2 text-[13px] leading-relaxed">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${f.star ? "bg-sun-400 text-[#1a1204]" : featured ? "bg-sun-400/20 text-sun-500" : light ? "bg-black/5 text-[#6b6478]" : "bg-white/10 text-ink-muted"}`}>
                  {f.star ? <Star weight="fill" className="h-3 w-3" /> : <Check weight="bold" className="h-3 w-3" />}
                </span>
                <span className={f.star ? `font-semibold ${ink}` : featText}>{noDot(f.text)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-1">
            <Link to="/تسجيل" state={{ plan: plan.id }}
              className={`group flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${featured ? "bg-sun-400 text-[#1a1204] hover:scale-[1.03] hover:bg-sun-300" : light ? "border border-[#22203a]/25 text-[#22203a] hover:border-[#22203a]/50" : "border border-white/15 text-ink hover:border-white/35 hover:bg-white/5"}`}>
              {plan.cta}
              <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
            </Link>
            {plan.nudge && <p className={`mt-2 text-center text-xs ${light ? "text-[#b06a00]" : "text-sun-300/90"}`}>{noDot(plan.nudge)}</p>}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

function BillingToggle({ annual, setAnnual, light }: { annual: boolean; setAnnual: (v: boolean) => void; light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`relative flex items-center rounded-full border p-1 ${light ? "border-black/10 bg-black/[0.04]" : "border-white/15 bg-black/40 backdrop-blur-md"}`}>
        {[{ key: false, label: "شهري" }, { key: true, label: "سنوي" }].map((opt) => (
          <button key={String(opt.key)} type="button" onClick={() => setAnnual(opt.key)}
            className="relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300"
            style={{ color: annual === opt.key ? "#131209" : undefined }}>
            {annual === opt.key && <motion.span layoutId="billing-pill" transition={{ duration: 0.4, ease: EASE }} className="absolute inset-0 -z-10 rounded-full bg-sun-400" />}
            <span className={annual === opt.key ? "" : light ? "text-[#6b6478]" : "text-ink-muted"}>{opt.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {annual && (
          <motion.span initial={{ opacity: 0, scale: 0.8, x: 8 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: 8 }} className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-500">
            🎁 شهران مجانًا
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/** محتوى الباقات كما يُعرض «على الشاشة» — بلا إطار، منصة نشاط في الزاوية. */
function PlansContent({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
      <div className="mb-5 text-center">
        <h2 className="font-display text-3xl text-[#22203a] sm:text-4xl">اختر خطة استثمارك في فصلك</h2>
        <p className="mx-auto mt-2 max-w-[540px] text-sm text-[#6b6478] sm:text-base">بأقل من ريالين يوميًا... فصلٌ لا يعرف الملل طوال العام</p>
      </div>
      <BillingToggle annual={annual} setAnnual={setAnnual} light />
      <div className="mt-6 grid items-stretch gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} annual={annual} light />)}
      </div>
      <p className="mt-5 text-center text-xs text-[#8a8397]">{noDot(TRIAL_NOTE)}</p>
    </div>
  );
}

/** نسخة عادية (جوّال أو تفضيل تقليل الحركة). */
function StaticPricing({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  return (
    <section id="pricing" className="relative overflow-hidden bg-gradient-to-b from-[#fdf9f0] to-[#efe2cc] px-4 py-20">
      <div className="absolute right-5 top-5 flex items-center gap-1.5 font-display text-base text-[#4d1c9b]">✦ منصة نشاط</div>
      <div className="mt-6"><PlansContent annual={annual} setAnnual={setAnnual} /></div>
    </section>
  );
}

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const u = () => setWide(m.matches);
    u();
    m.addEventListener("change", u);
    return () => m.removeEventListener("change", u);
  }, []);

  // المرحلة ١: الفصل + العنوان (يتلاشى مبكرًا وبالكامل)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.14, 0.24], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.24], [0, -60]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1, 0.18], [1, 1, 0]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.06, 0.2, 0.4]);
  // المرحلة ٣: سطح الشاشة المضيء يغطّي الفصل والتحدي، ثم يظهر المحتوى — بلا إطار
  const screenOpacity = useTransform(scrollYProgress, [0.46, 0.6], [0, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.57, 0.72], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.57, 0.72], [36, 0]);
  const contentPE = useTransform(scrollYProgress, (v) => (v > 0.62 ? "auto" : "none"));

  if (reduce || !wide) return <StaticPricing annual={annual} setAnnual={setAnnual} />;

  return (
    <section id="pricing" ref={trackRef} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* الفصل الحيّ + الزوم داخل الشاشة */}
        <div className="absolute inset-0">
          <Suspense fallback={<div className="h-full w-full bg-[#171019]" />}>
            <ClassroomBackdrop progress={scrollYProgress} className="h-full w-full" />
          </Suspense>
          <motion.div className="absolute inset-0 bg-[#131209]" style={{ opacity: scrimOpacity }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#131209] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#131209] to-transparent" />
        </div>

        {/* المرحلة ١: العنوان فوق الفصل الواضح */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="pointer-events-none absolute inset-x-0 top-[24vh] flex flex-col items-center px-4 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-md">
            <Sparkle weight="fill" className="h-4 w-4" /> خطط الاستثمار في فصلك
          </span>
          <h2 className="max-w-[820px] font-display text-4xl text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.7)] sm:text-6xl">هكذا يصير فصلك مع نشاط</h2>
        </motion.div>

        <motion.div style={{ opacity: hintOpacity }} className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-1 text-white/70">
          <span className="text-sm">انزل لتُعرَض خطتك على الشاشة</span>
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><CaretDown weight="bold" className="h-5 w-5" /></motion.span>
        </motion.div>

        {/* المرحلة ٣: سطح الشاشة المضيء يغطّي كل ما خلفه */}
        <motion.div style={{ opacity: screenOpacity }} className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fdf9f0] to-[#efe2cc]" />

        {/* منصة نشاط في زاوية الشاشة */}
        <motion.div style={{ opacity: contentOpacity }} className="pointer-events-none absolute right-6 top-5 z-10 flex items-center gap-1.5 font-display text-base text-[#4d1c9b] sm:text-lg">
          ✦ منصة نشاط
        </motion.div>

        {/* الباقات مباشرة على الشاشة — بلا إطار إضافي */}
        <motion.div style={{ opacity: contentOpacity, y: contentY, pointerEvents: contentPE }} className="absolute inset-0 flex flex-col overflow-y-auto px-4 pb-8 pt-14 sm:pt-16">
          <PlansContent annual={annual} setAnnual={setAnnual} />
        </motion.div>
      </div>
    </section>
  );
}
