import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkle, Robot, FloppyDisk, PencilSimple, ArrowsClockwise, Play } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import { generateActivity, TOPIC_SUGGESTIONS, type GeneratedActivity } from "../../lib/activityGenerator";

const EASE = [0.32, 0.72, 0, 1] as const;

type Phase = "input" | "thinking" | "result";

export function ActivityAssistant({
  accentBg,
  accentText,
  onSave,
  onEdit,
  onClose,
}: {
  accentBg: string;
  accentText: string;
  onSave: (activity: GeneratedActivity) => void;
  onEdit: (activity: GeneratedActivity) => void;
  onClose: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [result, setResult] = useState<GeneratedActivity | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (timer.current) clearTimeout(timer.current);
    };
  }, [onClose]);

  function generate(t: string) {
    const value = t.trim();
    if (!value) return;
    setTopic(value);
    setPhase("thinking");
    timer.current = window.setTimeout(() => {
      setResult(generateActivity(value));
      setPhase("result");
    }, 1300);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="المساعد الذكي"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-raised p-6 sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-bg", accentBg)}>
              <Robot weight="fill" className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-2xl text-ink">المساعد الذكي</h3>
              <p className="text-sm text-ink-muted">اكتب فكرتك، ويبتكر لك نشاطًا ومسابقة توصل الرسالة</p>
            </div>
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

        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  generate(topic);
                }}
              >
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: التصيّد الإلكتروني، احترام الآخرين، الأخبار المزيفة…"
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-base text-ink outline-none transition-colors duration-300 focus:border-white/35"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {TOPIC_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => generate(s)}
                      className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className={cn(
                    "mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold text-bg transition-transform duration-300 enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-40",
                    accentBg
                  )}
                >
                  <Sparkle weight="fill" className="h-5 w-5" />
                  ابتكر النشاط
                </button>
              </form>
            </motion.div>
          )}

          {phase === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 flex flex-col items-center gap-4 py-10 text-center"
            >
              <motion.span
                className={cn("flex h-16 w-16 items-center justify-center rounded-2xl text-bg", accentBg)}
                animate={{ scale: [1, 1.1, 1], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Robot weight="fill" className="h-8 w-8" />
              </motion.span>
              <p className="text-base font-semibold text-ink">المساعد يبتكر لك نشاطًا…</p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className={cn("h-2.5 w-2.5 rounded-full", accentBg)}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className={cn("text-xs font-semibold", accentText)}>نشاط مقترح</span>
                <h4 className="mt-1 font-display text-xl text-ink">{result.title}</h4>
                <ul className="mt-3 space-y-1.5">
                  {result.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-muted">
                      <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", accentBg)} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold", accentText)}>
                  <Play weight="fill" className="h-3.5 w-3.5" />
                  مسابقة تفاعلية ({result.quiz.length} مواقف)
                </span>
                <ul className="mt-3 space-y-1.5">
                  {result.quiz.map((q, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm text-ink">
                      <span className="leading-relaxed text-ink-muted">{q.question}</span>
                      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", accentText)}>{q.answer.replace(/\.$/, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onSave(result)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-bg transition-transform duration-300 hover:scale-[1.02] active:scale-95",
                    accentBg
                  )}
                >
                  <FloppyDisk weight="bold" className="h-5 w-5" />
                  احفظه كنشاط
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(result)}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-base font-semibold text-ink transition-colors duration-300 hover:border-white/30 hover:bg-white/5"
                >
                  <PencilSimple weight="bold" className="h-5 w-5" />
                  عدّله أولًا
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("input")}
                  aria-label="فكرة أخرى"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink"
                >
                  <ArrowsClockwise weight="bold" className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
