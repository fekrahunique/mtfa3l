import { motion } from "framer-motion";
import { GlassCard } from "../GlassCard";
import { cn } from "../../lib/utils";
import type { BreakWeek } from "../../data/breakPeriods";

const EASE = [0.32, 0.72, 0, 1] as const;

export function WeeklyTargetCard({
  week,
  completed,
  accentText,
}: {
  week: BreakWeek;
  completed: number;
  accentText: string;
}) {
  const total = week.corners.length;
  const ratio = total === 0 ? 0 : completed / total;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <GlassCard className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div className="text-center sm:text-right">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className={cn("rounded-full bg-white/5 px-3 py-1 text-sm font-semibold", accentText)}>
            الأسبوع {week.week}
          </span>
          {week.slogan && (
            <span className="rounded-full bg-sun-400/10 px-3 py-1 text-sm text-sun-300">{week.slogan}</span>
          )}
        </div>

        <h3 className="mt-3 text-xl text-ink">{week.occasion ?? "أنشطة الاستراحة"}</h3>
        <p className="mt-1 text-sm text-ink-muted">
          أنجزت {completed} من {total} أركان هذا الأسبوع.
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          المرحلة {week.stage}
          {week.stageNote ? ` — ${week.stageNote}` : ""}
        </p>
      </div>

      <div className="relative h-32 w-32 shrink-0">
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
        <div className={cn("absolute inset-0 flex items-center justify-center font-display text-2xl", accentText)}>
          {Math.round(ratio * 100)}٪
        </div>
      </div>
    </GlassCard>
  );
}
