import { Wrench } from "@phosphor-icons/react";
import { GlassCard } from "../GlassCard";
import type { Tool } from "../../lib/dashboardData";
import { cn } from "../../lib/utils";

export function ToolCard({ tool, accentText }: { tool: Tool; accentText: string }) {
  return (
    <GlassCard className="flex items-center gap-4">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5", accentText)}>
        <Wrench weight="duotone" className="h-5 w-5" />
      </div>
      <div>
        <h4 className="text-base text-ink">{tool.title}</h4>
        <p className="mt-0.5 text-sm text-ink-muted">{tool.description}</p>
      </div>
    </GlassCard>
  );
}
