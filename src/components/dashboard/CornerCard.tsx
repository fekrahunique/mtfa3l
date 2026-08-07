import { Check, Clock, MapPin, CaretLeft, Question } from "@phosphor-icons/react";
import { GlassCard } from "../GlassCard";
import { cn } from "../../lib/utils";
import type { BreakCorner } from "../../data/breakPeriods";

export function CornerCard({
  corner,
  done,
  accentBg,
  accentText,
  onToggleDone,
  onOpen,
}: {
  corner: BreakCorner;
  done: boolean;
  accentBg: string;
  accentText: string;
  onToggleDone: () => void;
  onOpen: () => void;
}) {
  return (
    <GlassCard className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("rounded-full bg-white/5 px-3 py-1 text-xs font-semibold", accentText)}>
          اليوم {corner.day}
        </span>
        <button
          type="button"
          onClick={onToggleDone}
          aria-pressed={done}
          aria-label={done ? `إلغاء إنجاز ${corner.title}` : `تعليم ${corner.title} كمنجَز`}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            done ? cn(accentBg, "border-transparent text-bg") : "border-white/15 text-ink-faint hover:border-white/30"
          )}
        >
          <Check weight="bold" className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-4 text-lg text-ink">{corner.title}</h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{corner.outcomes[0]}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-faint">
        <span className="flex items-center gap-1">
          <Clock weight="bold" className="h-3.5 w-3.5" />
          {corner.minutes} دقائق
        </span>
        <span className="flex items-center gap-1">
          <MapPin weight="bold" className="h-3.5 w-3.5" />
          {corner.place.replace(/\.$/, "")}
        </span>
        {corner.quiz && (
          <span className="flex items-center gap-1">
            <Question weight="bold" className="h-3.5 w-3.5" />
            {corner.quiz.length} أسئلة
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="group mt-5 flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/30 hover:bg-white/5 active:scale-95"
      >
        افتح خطوات التنفيذ
        <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
      </button>
    </GlassCard>
  );
}
