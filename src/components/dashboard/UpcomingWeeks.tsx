import { useState } from "react";
import { motion } from "framer-motion";
import { LockSimple, Sparkle, CheckCircle } from "@phosphor-icons/react";
import { SaduPattern } from "../../activities/ActivityShell";
import { cn } from "../../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

/** مناسبات قادمة كتشويق — عناوين فقط، محتواها يُفتح مع التجربة الكاملة. */
const UPCOMING = [
  { occasion: "يوم التأسيس", motif: "🏛️", tint: "#8a5a2b" },
  { occasion: "يوم العلم السعودي", motif: "🏴", tint: "#1E9E63" },
  { occasion: "أسبوع الشجرة", motif: "🌳", tint: "#3f8f4d" },
  { occasion: "اليوم العالمي للغة العربية", motif: "📖", tint: "#c93f6f" },
];

export function UpcomingWeeks({ accentBg, accentText }: { accentBg: string; accentText: string }) {
  const [requested, setRequested] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <SaduPattern className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 opacity-[0.07]" />

      <div className="relative z-10 flex flex-col gap-1 text-center sm:text-right">
        <span className={cn("text-sm font-semibold", accentText)}>التجربة الكاملة</span>
        <h3 className="font-display text-2xl text-ink sm:text-3xl">أسابيع كاملة بانتظارك</h3>
        <p className="mt-1 text-sm text-ink-muted">
          جرّبت نشاطًا من الأسبوع التمهيدي، اشترك لتفتح كل الأسابيع بمناسباتها وأنشطتها التفاعلية وأدوات صنع أنشطتك
        </p>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {UPCOMING.map((w, i) => (
          <motion.div
            key={w.occasion}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
            className="relative flex aspect-[3/4] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 p-4 text-center"
            style={{ background: `linear-gradient(160deg, ${w.tint}33, rgba(19,18,9,0.7))` }}
          >
            <span className="text-4xl blur-[1px] saturate-50">{w.motif}</span>
            <span className="text-sm font-semibold text-white/80">{w.occasion}</span>
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[11px] font-semibold text-white/75">
              <LockSimple weight="fill" className="h-3 w-3" />
              قريبًا
            </span>
          </motion.div>
        ))}
      </div>

      {requested ? (
        <div className="relative z-10 mt-6 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm text-ink">
          <CheckCircle weight="fill" className={cn("h-5 w-5", accentText)} />
          سجّلناك في قائمة الاهتمام، بنبلّغك أول ما تُفتح التجربة الكاملة
        </div>
      ) : (
        <div className="relative z-10 mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setRequested(true)}
            className={cn(
              "flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-bg shadow-xl transition-transform duration-300 hover:scale-[1.03] active:scale-95",
              accentBg
            )}
          >
            <Sparkle weight="fill" className="h-5 w-5" />
            فعّل التجربة الكاملة
          </button>
        </div>
      )}
    </div>
  );
}
