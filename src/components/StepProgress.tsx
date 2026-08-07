import { Check } from "@phosphor-icons/react";
import { cn } from "../lib/utils";

export function StepProgress({
  steps,
  current,
  accentClass,
}: {
  steps: string[];
  current: number;
  accentClass: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-between" dir="rtl">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  done && cn(accentClass, "border-transparent text-bg"),
                  active && "border-white/30 bg-white/10 text-ink",
                  !done && !active && "border-white/10 text-ink-faint"
                )}
              >
                {done ? <Check weight="bold" className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-xs sm:block", active ? "text-ink" : "text-ink-faint")}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-2 h-px flex-1 transition-colors duration-700", done ? accentClass : "bg-white/10")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
