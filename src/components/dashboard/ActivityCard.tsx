import { useState } from "react";
import { Check, Clock, Users } from "@phosphor-icons/react";
import { GlassCard } from "../GlassCard";
import { cn } from "../../lib/utils";
import type { Activity } from "../../lib/dashboardData";

export function ActivityCard({
  activity,
  accentBg,
  accentText,
}: {
  activity: Activity;
  accentBg: string;
  accentText: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <GlassCard className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            activity.category === "classroom" ? "bg-white/10 text-ink-muted" : cn(accentText, "bg-white/5")
          )}
        >
          {activity.category === "classroom" ? "صفي" : "لا صفي"}
        </span>
        <button
          type="button"
          onClick={() => setDone((v) => !v)}
          aria-pressed={done}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            done ? cn(accentBg, "border-transparent text-bg") : "border-white/15 text-ink-faint hover:border-white/30"
          )}
        >
          <Check weight="bold" className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-4 text-lg text-ink">{activity.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{activity.description}</p>

      <div className="mt-4 flex items-center gap-4 text-xs text-ink-faint">
        <span className="flex items-center gap-1">
          <Clock weight="bold" className="h-3.5 w-3.5" />
          {activity.minutes} دقيقة
        </span>
        <span className="flex items-center gap-1">
          <Users weight="bold" className="h-3.5 w-3.5" />
          {activity.participants}
        </span>
      </div>
    </GlassCard>
  );
}
