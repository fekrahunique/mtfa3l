import { Check, Clock, MapPin, Question, Play, Presentation } from "@phosphor-icons/react";
import { GlassCard } from "../GlassCard";
import { cn, noDot } from "../../lib/utils";
import type { BreakCorner } from "../../data/breakPeriods";

function playLabel(play: NonNullable<BreakCorner["play"]>) {
  if (play === "quiz") return "المسابقة";
  if (play === "tree") return "الشجرة";
  return "المعرض";
}

export function CornerCard({
  corner,
  done,
  accentBg,
  accentText,
  onToggleDone,
  onOpen,
  onPlay,
}: {
  corner: BreakCorner;
  done: boolean;
  accentBg: string;
  accentText: string;
  onToggleDone: () => void;
  onOpen: () => void;
  onPlay: () => void;
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

      <h3 className="mt-4 text-lg text-ink">{noDot(corner.title)}</h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{noDot(corner.outcomes[0])}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
        <span className="flex items-center gap-1">
          <Clock weight="bold" className="h-3.5 w-3.5" />
          {corner.minutes} دقائق
        </span>
        <span className="flex items-center gap-1">
          <MapPin weight="bold" className="h-3.5 w-3.5" />
          {noDot(corner.place)}
        </span>
        {corner.quiz && (
          <span className="flex items-center gap-1">
            <Question weight="bold" className="h-3.5 w-3.5" />
            {corner.quiz.length} أسئلة
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "group flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-95",
            accentBg
          )}
        >
          <Presentation weight="fill" className="h-4 w-4" />
          اعرض النشاط
        </button>
        {corner.play && (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`ابدأ ${playLabel(corner.play)} — ${corner.title}`}
            className="group flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/30 hover:bg-white/5 active:scale-95"
          >
            <Play weight="fill" className="h-4 w-4" />
            {playLabel(corner.play)}
          </button>
        )}
      </div>
    </GlassCard>
  );
}
