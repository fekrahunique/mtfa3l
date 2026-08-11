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

/* ————— بطاقات نسخة الجوّال ————— */
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
    <motion.div onMouseMove={onMove} onMouseLeave={onLeave} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} whileHover={{ scale: 1.012 }} transition={{ scale: { duration: 0.3, ease: EASE } }} className="h-full">
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
      {featured && <div aria-hidden className="pointer-events-none absolute -inset-[2px] -z-10 rounded-[26px] bg-[radial-gradient(ellipse_at_top,theme(colors.sun.400),transparent_70%)] opacity-40 blur-lg" />}
      <TiltCard>
        <div className={`flex h-full flex-col rounded-2xl border p-5 ${featured ? "border-sun-400/60 bg-[#141018]/85" : "border-white/12 bg-[#141018]/75 backdrop-blur-xl"}`}>
          {plan.badge && (
            <span className={`mb-3 inline-flex w-max items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${featured ? "bg-sun-400 text-[#1a1204]" : "bg-white/10 text-sun-300"}`}>
              {featured && <Crown weight="fill" className="h-3.5 w-3.5" />}{plan.badge}
            </span>
          )}
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${featured ? "bg-sun-400/20 text-sun-500" : "bg-white/5 text-ink-muted"}`}><Icon weight="duotone" className="h-5 w-5" /></span>
            <div><h3 className="font-display text-xl text-ink">{plan.name}</h3><p className="text-xs text-ink-muted">{noDot(plan.tagline)}</p></div>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-display text-4xl leading-none text-ink">{arDigits(amount)}</span>
            <span className="mb-1 text-xs text-ink-muted">{period}</span>
          </div>
          {plan.inherits && <p className="mt-4 text-sm font-semibold text-sun-300">{noDot(plan.inherits)}</p>}
          <ul className="mt-3 space-y-2">
            {plan.features.map((f, k) => (
              <li key={k} className="flex items-start gap-2 text-[13px] leading-relaxed">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${f.star ? "bg-sun-400 text-[#1a1204]" : featured ? "bg-sun-400/20 text-sun-500" : "bg-white/10 text-ink-muted"}`}>
                  {f.star ? <Star weight="fill" className="h-3 w-3" /> : <Check weight="bold" className="h-3 w-3" />}
                </span>
                <span className={f.star ? "font-semibold text-ink" : "text-ink-muted"}>{noDot(f.text)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-1">
            <Link to="/تسجيل" state={{ plan: plan.id }} className={`group flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold active:scale-95 ${featured ? "bg-sun-400 text-[#1a1204] hover:bg-sun-300" : "border border-white/15 text-ink hover:border-white/35"}`}>
              {plan.cta}<CaretLeft weight="bold" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

function BillingToggle({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative flex items-center rounded-full border border-white/15 bg-black/50 p-1 backdrop-blur-md">
        {[{ key: false, label: "شهري" }, { key: true, label: "سنوي" }].map((opt) => (
          <button key={String(opt.key)} type="button" onClick={() => setAnnual(opt.key)} className="relative z-10 rounded-full px-5 py-1.5 text-sm font-semibold transition-colors duration-300" style={{ color: annual === opt.key ? "#131209" : undefined }}>
            {annual === opt.key && <motion.span layoutId="billing-pill" transition={{ duration: 0.4, ease: EASE }} className="absolute inset-0 -z-10 rounded-full bg-sun-400" />}
            <span className={annual === opt.key ? "" : "text-ink-muted"}>{opt.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {annual && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">🎁 شهران مجانًا</motion.span>}
      </AnimatePresence>
    </div>
  );
}

/** نسخة الجوّال/تقليل الحركة — بطاقات جنبًا إلى جنب فوق الفصل. */
function StaticPricing({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  return (
    <section id="pricing" className="relative overflow-hidden px-4 py-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Suspense fallback={<div className="h-full w-full bg-[#171019]" />}><ClassroomBackdrop className="h-full w-full" /></Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-[#131209] via-[#131209]/60 to-[#131209]" />
      </div>
      <div className="mx-auto max-w-[680px] text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">اختر خطة استثمارك في فصلك</h2>
        <p className="mt-3 text-ink-muted">بأقل من ريالين يوميًا، فصلٌ لا يعرف الملل طوال العام</p>
      </div>
      <div className="mt-8"><BillingToggle annual={annual} setAnnual={setAnnual} /></div>
      <div className="mx-auto mt-8 grid max-w-6xl items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} annual={annual} />)}
      </div>
      <p className="mt-8 text-center text-sm text-ink-muted">{noDot(TRIAL_NOTE)}</p>
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
    u(); m.addEventListener("change", u);
    return () => m.removeEventListener("change", u);
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.14, 0.24], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.24], [0, -60]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1, 0.18], [1, 1, 0]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.4], [0.28, 0.12]);
  // شريط التحكّم أسفل السبورة — يظهر بعد اكتمال الزوم على الباقات المرسومة
  const ctrlOpacity = useTransform(scrollYProgress, [0.52, 0.66], [0, 1]);
  const ctrlY = useTransform(scrollYProgress, [0.52, 0.66], [40, 0]);
  const ctrlPE = useTransform(scrollYProgress, (v) => (v > 0.6 ? "auto" : "none"));
  const titleOpacity = useTransform(scrollYProgress, [0.44, 0.56], [0, 1]);

  if (reduce || !wide) return <StaticPricing annual={annual} setAnnual={setAnnual} />;

  return (
    <section id="pricing" ref={trackRef} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* الفصل + الزوم على السبورة (الباقات مرسومة عليها) */}
        <div className="absolute inset-0">
          <Suspense fallback={<div className="h-full w-full bg-[#171019]" />}>
            <ClassroomBackdrop progress={scrollYProgress} annual={annual} className="h-full w-full" />
          </Suspense>
          <motion.div className="absolute inset-0 bg-[#131209]" style={{ opacity: scrimOpacity }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#131209] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#131209] via-[#131209]/70 to-transparent" />
        </div>

        {/* المرحلة ١: الجملة التسويقية فوق الفصل — بخلفية ناعمة تفصلها عن زحمة المشهد */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="pointer-events-none absolute inset-x-0 top-[17vh] flex flex-col items-center px-4 text-center">
          <div className="relative flex flex-col items-center">
            <div aria-hidden className="absolute -inset-x-24 -inset-y-10 -z-10 rounded-[50%] bg-[#131209]/60 blur-2xl" />
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-sun-400/30 bg-black/45 px-4 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-md">
              <Sparkle weight="fill" className="h-4 w-4" /> خطط الاستثمار في فصلك
            </span>
            <h2 className="max-w-[900px] font-display text-5xl leading-[1.15] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.85)] sm:text-7xl">
              حصةٌ ينتظرها طلابك
            </h2>
            <p className="mt-4 max-w-[560px] text-lg font-medium text-white/85 [text-shadow:0_1px_16px_rgba(0,0,0,0.9)]">
              حوّل وقت النشاط إلى تجربة يعيشها فصلك — واستثمِر فيها بثقة
            </p>
            <motion.div style={{ opacity: hintOpacity }} className="mt-8 flex flex-col items-center gap-1 text-white/75">
              <span className="text-sm">انزل لتظهر الباقات على سبورة الفصل</span>
              <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><CaretDown weight="bold" className="h-5 w-5" /></motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* عنوان صغير أعلى السبورة عند ظهور الباقات */}
        <motion.div style={{ opacity: titleOpacity }} className="pointer-events-none absolute inset-x-0 top-[8vh] text-center">
          <p className="text-lg font-semibold text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]">اختر خطة استثمارك في فصلك</p>
        </motion.div>

        {/* المرحلة ٣: شريط الاختيار أسفل السبورة */}
        <motion.div style={{ opacity: ctrlOpacity, y: ctrlY, pointerEvents: ctrlPE }} className="absolute inset-x-0 bottom-0 px-4 pb-7 pt-6">
          <div className="mx-auto max-w-3xl">
            <BillingToggle annual={annual} setAnnual={setAnnual} />
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {PLANS.map((plan) => {
                const { amount } = planPrice(plan, annual);
                const featured = plan.featured;
                return (
                  <Link key={plan.id} to="/تسجيل" state={{ plan: plan.id }}
                    className={`flex flex-col items-center gap-0.5 rounded-2xl border px-3 py-3 text-center backdrop-blur-md transition-transform duration-300 hover:scale-[1.03] active:scale-95 ${featured ? "border-sun-400 bg-sun-400/90 text-[#1a1204]" : "border-white/20 bg-black/40 text-white hover:border-white/40"}`}>
                    <span className="font-display text-base">{plan.name}</span>
                    <span className="font-display text-xl font-bold">{arDigits(amount)}<span className="text-xs font-normal"> ﷼</span></span>
                    <span className={`text-[11px] ${featured ? "text-[#1a1204]/80" : "text-white/70"}`}>{plan.cta} ›</span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-white/70">{noDot(TRIAL_NOTE)}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
