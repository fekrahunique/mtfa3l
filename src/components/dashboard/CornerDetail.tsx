import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Clock, MapPin, Target, Sparkle, ListChecks, Question, Paperclip } from "@phosphor-icons/react";
import type { BreakCorner } from "../../data/breakPeriods";
import { cn } from "../../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ weight?: "duotone"; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-5">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-sun-300">
        <Icon weight="duotone" className="h-4 w-4" />
        {title}
      </h4>
      {children}
    </section>
  );
}

export function CornerDetail({
  corner,
  routine,
  accentText,
  accentBg,
  onClose,
}: {
  corner: BreakCorner;
  routine: string[];
  accentText: string;
  accentBg: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={corner.title}
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-raised p-6 sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={cn("text-sm font-semibold", accentText)}>اليوم {corner.day}</span>
            <h3 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{corner.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink"
          >
            <X weight="bold" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm text-ink-muted">
            <Clock weight="bold" className="h-4 w-4" />
            {corner.minutes} دقائق
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm text-ink-muted">
            <MapPin weight="bold" className="h-4 w-4" />
            {corner.place}
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <Section icon={Target} title="نواتج التعلم">
            <ul className="space-y-2">
              {corner.outcomes.map((item) => (
                <li key={item} className="flex gap-2 text-base leading-relaxed text-ink-muted">
                  <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", accentBg)} />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Sparkle} title="القيم">
            <div className="flex flex-wrap gap-2">
              {corner.values.map((value) => (
                <span key={value} className="rounded-full bg-sun-400/10 px-3 py-1 text-sm text-sun-300">
                  {value}
                </span>
              ))}
            </div>
          </Section>

          <Section icon={ListChecks} title="أدوات التنفيذ">
            <ul className="space-y-2">
              {corner.tools.map((tool) => (
                <li key={tool} className="flex gap-2 text-base leading-relaxed text-ink-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                  {tool}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={ListChecks} title="إجراءات التنفيذ">
            <ol className="space-y-3">
              {corner.steps.map((step, i) => (
                <li key={step} className="flex gap-3 text-base leading-relaxed text-ink-muted">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-bg",
                      accentBg
                    )}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>

          {corner.quiz && (
            <Section icon={Question} title={`أسئلة جاهزة (${corner.quiz.length})`}>
              <ol className="space-y-3">
                {corner.quiz.map((item, i) => (
                  <li key={item.question} className="rounded-xl border border-white/10 p-4">
                    <p className="text-base text-ink">
                      {i + 1}. {item.question}
                    </p>
                    <p className={cn("mt-1.5 text-base", accentText)}>{item.answer}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          <Section icon={ListChecks} title="الروتين اليومي">
            <ul className="space-y-2">
              {routine.map((item) => (
                <li key={item} className="flex gap-2 text-base leading-relaxed text-ink-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {corner.attachment && (
            <Section icon={Paperclip} title="مرفق">
              <p className="text-base text-ink-muted">{corner.attachment}</p>
            </Section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
