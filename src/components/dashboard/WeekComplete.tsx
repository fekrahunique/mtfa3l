import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Confetti, UsersThree, Sparkle, ShareNetwork, ArrowLeft } from "@phosphor-icons/react";
import { Celebration, SaduPattern } from "../../activities/ActivityShell";
import { cn, noDot } from "../../lib/utils";
import type { BreakWeek } from "../../data/breakPeriods";
import type { WeekTheme } from "../../lib/weekTheme";

const EASE = [0.32, 0.72, 0, 1] as const;

function Stat({ icon: Icon, value, label, tint }: { icon: typeof Trophy; value: number; label: string; tint: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-black/20 px-3 py-4">
      <Icon weight="duotone" className="h-7 w-7" style={{ color: tint }} />
      <span className="font-display text-2xl text-white">{value}</span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}

export function WeekComplete({
  week,
  cornersCount,
  valuesCount,
  studentsCount,
  badgeCount,
  theme,
  accentText,
  accentBg,
  onNext,
}: {
  week: BreakWeek;
  cornersCount: number;
  valuesCount: number;
  studentsCount: number;
  badgeCount: number;
  theme: WeekTheme;
  accentText: string;
  accentBg: string;
  onNext: () => void;
}) {
  const [shared, setShared] = useState(false);

  async function share() {
    const text = `أكملت أنشطة ${week.occasion ? noDot(week.occasion) : "الأسبوع"} على منصة نشاط 🎉`;
    try {
      if (navigator.share) await navigator.share({ title: "نشاط", text });
      else {
        await navigator.clipboard.writeText(text);
        setShared(true);
      }
    } catch {
      /* أُلغيت المشاركة — نتجاهل */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative overflow-hidden rounded-[1.75rem] border p-6 text-center sm:p-9"
      style={{
        background: `linear-gradient(160deg, ${theme.banner}, rgba(19,18,9,0.94))`,
        borderColor: `${theme.accent}55`,
      }}
    >
      <Celebration show />
      <SaduPattern className="pointer-events-none absolute inset-x-0 top-0 h-8 opacity-40" />

      <motion.div
        initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: `${theme.accentSoft}22` }}
      >
        <Trophy weight="fill" className="h-12 w-12" style={{ color: theme.accentSoft }} />
      </motion.div>

      <h2 className="relative z-10 mt-5 font-display text-3xl text-white sm:text-5xl">🎉 أكملت أسبوعك!</h2>
      <p className="relative z-10 mt-2 text-base text-white/85 sm:text-lg">
        أنجزت كل أركان {week.occasion ? noDot(week.occasion) : "الأسبوع"} مع طلابك
      </p>

      {/* ملخّص الإنجاز، لوحة قابلة للمشاركة */}
      <div className="relative z-10 mx-auto mt-7 grid max-w-md grid-cols-3 gap-3">
        <Stat icon={Confetti} value={cornersCount} label="أركان" tint={theme.accentSoft} />
        <Stat icon={Sparkle} value={valuesCount} label="قيم" tint="#E8C05A" />
        <Stat icon={UsersThree} value={studentsCount} label="طالب" tint={theme.accentSoft} />
      </div>

      {/* الأوسمة المتجمّعة عبر الأسابيع */}
      <div className="relative z-10 mx-auto mt-6 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(badgeCount, 6) }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: EASE }}
            >
              <Medal weight="fill" className="h-7 w-7" style={{ color: "#E8C05A" }} />
            </motion.span>
          ))}
        </div>
        <span className="text-sm text-white/80">
          {badgeCount === 1 ? "أول وسام لك 🥳" : `${badgeCount} أسابيع مكتملة`}
        </span>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-bg shadow-xl transition-transform duration-300 hover:scale-[1.03] active:scale-95 sm:w-auto",
            accentBg
          )}
        >
          افتح الأسبوع التالي
          <ArrowLeft weight="bold" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={share}
          className="flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-base font-semibold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
          style={{ borderColor: `${theme.accentSoft}55` }}
        >
          <ShareNetwork weight="bold" className="h-5 w-5" />
          {shared ? "نُسخ الإنجاز ✓" : "شارك إنجازك"}
        </button>
      </div>

      <span className={cn("relative z-10 mt-4 block text-xs", accentText)}>لقطة شاشة لهذه اللوحة تفخر بها في مجموعة المعلمين</span>
    </motion.div>
  );
}
