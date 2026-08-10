import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkle, RocketLaunch, Crown, Check, Star, CaretLeft } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { noDot } from "../lib/utils";
import { PLANS, planPrice, arDigits, type PlanIcon } from "../data/plans";

const EASE = [0.32, 0.72, 0, 1] as const;

const ICONS: Record<PlanIcon, typeof Sparkle> = {
  sparkle: Sparkle,
  rocket: RocketLaunch,
  crown: Crown,
};

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative px-4 py-24">
      <ScrollReveal className="mx-auto max-w-[680px] text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-sm">
          <Sparkle weight="fill" className="h-4 w-4" />
          الباقات · اختر مركبتك
        </span>
        <h2 className="text-3xl text-ink sm:text-4xl">إلى أين توصلك رحلتك؟</h2>
        <p className="mt-4 text-lg text-ink-muted">
          كل باقة تقطع بك مسافة أبعد في رحلة نشاط مدرستك — اختر باقتك، وأكمل الطريق
        </p>
      </ScrollReveal>

      {/* مفتاح الدورة */}
      <ScrollReveal delay={0.1} className="mt-10 flex items-center justify-center gap-3">
        <div className="relative flex items-center rounded-full border border-white/15 bg-white/[0.04] p-1 backdrop-blur-sm">
          {[
            { key: false, label: "شهري" },
            { key: true, label: "سنوي" },
          ].map((opt) => (
            <button
              key={String(opt.key)}
              type="button"
              onClick={() => setAnnual(opt.key)}
              className="relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300"
              style={{ color: annual === opt.key ? "#131209" : undefined }}
            >
              {annual === opt.key && (
                <motion.span
                  layoutId="billing-pill"
                  transition={{ duration: 0.4, ease: EASE }}
                  className="absolute inset-0 -z-10 rounded-full bg-sun-400"
                />
              )}
              <span className={annual === opt.key ? "" : "text-ink-muted"}>{opt.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence>
          {annual && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 8 }}
              className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-300"
            >
              🎁 شهران مجانًا
            </motion.span>
          )}
        </AnimatePresence>
      </ScrollReveal>

      {/* البطاقات */}
      <div className="mx-auto mt-14 grid max-w-6xl items-stretch gap-6 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const Icon = ICONS[plan.icon];
          const { amount, period } = planPrice(plan, annual);
          const featured = plan.featured;
          return (
            <ScrollReveal key={plan.id} delay={i * 0.1} className={featured ? "lg:-my-3" : ""}>
              <div className="relative h-full">
                {/* هالة نابضة خلف الباقة المميّزة */}
                {featured && (
                  <motion.div
                    aria-hidden
                    animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.98, 1.02, 0.98] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute -inset-[2px] -z-10 rounded-[26px] bg-[radial-gradient(ellipse_at_top,theme(colors.sun.400),transparent_70%)] blur-lg"
                  />
                )}
                <div
                  className={`flex h-full flex-col rounded-3xl border p-7 backdrop-blur-xl transition-transform duration-500 ${
                    featured
                      ? "border-sun-400/50 bg-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.45)] lg:scale-[1.03]"
                      : "border-white/10 bg-white/[0.03] hover:-translate-y-1"
                  }`}
                >
                  {plan.badge && (
                    <span
                      className={`mb-4 inline-flex w-max items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        featured ? "bg-sun-400 text-bg" : "bg-white/10 text-sun-300"
                      }`}
                    >
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

                  {/* السعر */}
                  <div className="mt-6 flex items-end gap-2">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={amount}
                        initial={{ y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -14, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="font-display text-5xl leading-none text-ink"
                      >
                        {arDigits(amount)}
                      </motion.span>
                    </AnimatePresence>
                    <span className="mb-1 text-sm text-ink-muted">{period}</span>
                  </div>
                  {annual && (
                    <p className="mt-1 text-xs text-emerald-300">
                      ما يعادل {arDigits(plan.monthly)}﷼ شهريًا — بشهرين مجانًا
                    </p>
                  )}

                  {plan.inherits && (
                    <p className="mt-6 text-sm font-semibold text-sun-300">{noDot(plan.inherits)}</p>
                  )}

                  {/* المزايا */}
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((f, k) => (
                      <li key={k} className="flex items-start gap-2.5 text-sm leading-relaxed">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            f.star ? "bg-sun-400 text-bg" : featured ? "bg-sun-400/20 text-sun-300" : "bg-white/10 text-ink-muted"
                          }`}
                        >
                          {f.star ? <Star weight="fill" className="h-3 w-3" /> : <Check weight="bold" className="h-3 w-3" />}
                        </span>
                        <span className={f.star ? "font-semibold text-ink" : "text-ink-muted"}>{noDot(f.text)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-2">
                    <Link
                      to="/تسجيل"
                      state={{ plan: plan.id }}
                      className={`group flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                        featured
                          ? "bg-sun-400 text-bg hover:scale-[1.03] hover:bg-sun-300"
                          : "border border-white/15 text-ink hover:border-white/35 hover:bg-white/5"
                      }`}
                    >
                      {plan.cta}
                      <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
                    </Link>
                    {plan.nudge && (
                      <p className="mt-3 text-center text-xs text-sun-300/90">{noDot(plan.nudge)}</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal delay={0.15} className="mx-auto mt-12 max-w-[680px] text-center">
        <p className="text-sm text-ink-muted">
          🚀 تبدأ بأسبوع مجاني كامل — بلا بطاقة الآن، وتلغي متى شئت
        </p>
      </ScrollReveal>
    </section>
  );
}
