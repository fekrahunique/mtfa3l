import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/20 hover:bg-white/[0.06]",
        className
      )}
    >
      {children}
    </div>
  );
}
