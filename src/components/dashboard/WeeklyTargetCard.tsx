import { motion } from "framer-motion";
import { GlassCard } from "../GlassCard";
import { cn } from "../../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

export function WeeklyTargetCard({
  completed,
  total,
  accentText,
}: {
  completed: number;
  total: number;
  accentText: string;
}) {
  const ratio = total === 0 ? 0 : completed / total;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <GlassCard className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div className="text-center sm:text-right">
        <h3 className="text-xl text-ink">المستهدف الأسبوعي</h3>
        <p className="mt-1 text-sm text-ink-muted">
          أنجزت {completed} من {total} أنشطة هذا الأسبوع.
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
