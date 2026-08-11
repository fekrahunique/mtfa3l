import { motion } from "framer-motion";
import { GlassCard } from "../GlassCard";
import { SaduPattern, DiamondRule } from "../../activities/ActivityShell";
import { cn, noDot } from "../../lib/utils";
import type { BreakWeek } from "../../data/breakPeriods";

const EASE = [0.32, 0.72, 0, 1] as const;

export function WeeklyTargetCard({
  week,
  completed,
  total,
  accentText,
  allDone = false,
}: {
  week: BreakWeek;
  completed: number;
  total?: number;
  accentText: string;
  allDone?: boolean;
}) {
  const totalCount = total ?? week.corners.length;
  const ratio = totalCount === 0 ? 0 : completed / totalCount;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <GlassCard className="relative flex flex-col items-center gap-6 overflow-hidden sm:flex-row sm:justify-between">
      {/* تطريز سدو من هوية المناسبة */}
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <DiamondRule className="w-full opacity-40" />
      </div>
      <SaduPattern className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 opacity-[0.10]" />

      <div className="relative z-10 text-center sm:text-right">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className={cn("rounded-full bg-white/5 px-3 py-1 text-sm font-semibold", accentText)}>
            الأسبوع {week.week}
          </span>
          {week.slogan && (
            <span className="rounded-full bg-sun-400/10 px-3 py-1 text-sm text-sun-300">{noDot(week.slogan)}</span>
          )}
        </div>

        <h3 className="mt-3 text-xl text-ink">{week.occasion ? noDot(week.occasion) : "أنشطة الاستراحة"}</h3>
        <p className="mt-1 text-sm text-ink-muted">
          {allDone ? "🎉 اكتملت أركان الأسبوع" : `أنجزت ${completed} من ${totalCount} أركان هذا الأسبوع`}
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          المرحلة {week.stage}
          {week.stageNote ? `، ${noDot(week.stageNote)}` : ""}
        </p>
      </div>

      <div className="relative z-10 h-32 w-32 shrink-0">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#272727" strokeWidth="10" />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            className={accentText}
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - ratio) }}
            transition={{ duration: 1.2, ease: EASE }}
          />
        </svg>
        <div className={cn("absolute inset-0 flex items-center justify-center text-2xl font-bold", accentText)}>
          {Math.round(ratio * 100)}٪
        </div>
      </div>
    </GlassCard>
  );
}
