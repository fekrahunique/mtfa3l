import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkle, Robot, Play, FloppyDisk, ArrowsClockwise, UploadSimple, CheckCircle } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import { buildChallenge, AGENT_EXAMPLES, type BuiltChallenge } from "../../lib/agentBuilder";
import { extractFileText } from "../../lib/fileText";

const EASE = [0.32, 0.72, 0, 1] as const;

type Phase = "input" | "building" | "result";

/**
 * وكيل الأنشطة الذكي — يقرأ فكرة الرائد أو ملفًا وصفيًّا لمسابقة،
 * ثم يبنيها تحدّيًا يُلعب فعليًا على صفحته: يشغّله فورًا أو يحفظه في لوحته.
 */
export function ActivityAssistant({
  accentBg,
  accentText,
  onPlay,
  onSaveGame,
  onClose,
}: {
  accentBg: string;
  accentText: string;
  onPlay: (built: BuiltChallenge) => void;
  onSaveGame: (built: BuiltChallenge) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("input");
  const [logShown, setLogShown] = useState(0);
  const [result, setResult] = useState<BuiltChallenge | null>(null);
  const [saved, setSaved] = useState(false);
  const [drag, setDrag] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      timers.current.forEach(clearTimeout);
    };
  }, [onClose]);

  async function readFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { setFileName("الملف كبير جدًّا (أكثر من ١٠ ميغا) — الصق نصّه مباشرة"); return; }
    setFileName(`${file.name} — يُقرأ…`);
    try {
      const { text: content, note } = await extractFileText(file);
      if (!content.trim()) { setFileName(note || "لم أعثر على نصّ في الملف — الصقه مباشرة"); return; }
      setText((prev) => (prev ? prev + "\n" : "") + content);
      setFileName(note ? `${file.name} — ${note}` : file.name);
    } catch {
      setFileName("تعذّرت قراءة الملف — جرّب نصًّا أو CSV أو Word/PDF أوضح");
    }
  }

  function run(value: string) {
    const v = value.trim();
    if (!v) return;
    setText(v);
    setResult(null);
    setSaved(false);
    setLogShown(0);
    setPhase("building");
    const built = buildChallenge(v);
    // كشف خطوات الوكيل تِباعًا ثم عرض النتيجة
    built.buildLog.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setLogShown(i + 1), 500 + i * 650));
    });
    timers.current.push(
      window.setTimeout(() => { setResult(built); setPhase("result"); }, 700 + built.buildLog.length * 650)
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label="وكيل الأنشطة الذكي"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-raised p-6 sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-bg", accentBg)}>
              <Robot weight="fill" className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-2xl text-ink">وكيل الأنشطة الذكي</h3>
              <p className="text-sm text-ink-muted">اكتب فكرتك أو أرفِق ملف مسابقة — والوكيل يبنيها لعبةً تُلعب على شاشتك</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink">
            <X weight="bold" className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ———— الإدخال ———— */}
          {phase === "input" && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
              <form onSubmit={(e) => { e.preventDefault(); run(text); }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) readFile(f); }}
                  className={cn("relative rounded-2xl border transition-colors duration-300", drag ? "border-white/40 bg-white/[0.06]" : "border-white/15 bg-white/[0.04]")}
                >
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    placeholder={"اكتب فكرتك بحرّية، مثال: «مسابقة عن الأمن السيبراني»\nأو الصق أسئلة: «س: عاصمة السعودية؟ ج: الرياض»\nأو أفلِت ملف مسابقة هنا (Word أو PDF أو Excel أو نصّي)"}
                    className="w-full resize-none rounded-2xl bg-transparent px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-muted/70"
                  />
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2.5">
                    <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
                      <UploadSimple weight="bold" className="h-4 w-4" />
                      أرفِق ملفًا (Word · PDF · Excel · نصّي)
                      <input type="file" accept=".txt,.csv,.md,.text,.docx,.pdf,.xlsx,.xls,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
                    </label>
                    {fileName && <span className={cn("truncate text-xs", accentText)}>📎 {fileName}</span>}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-ink-muted">جرّب مثالًا:</p>
                  <div className="flex flex-wrap gap-2">
                    {AGENT_EXAMPLES.map((s, i) => (
                      <button key={i} type="button" onClick={() => run(s)}
                        className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink">
                        {s.split("\n")[0].slice(0, 28)}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={!text.trim()}
                  className={cn("mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold text-bg transition-transform duration-300 enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-40", accentBg)}>
                  <Sparkle weight="fill" className="h-5 w-5" />
                  ابنِ اللعبة الآن
                </button>
              </form>
            </motion.div>
          )}

          {/* ———— البناء (خطوات الوكيل تِباعًا) ———— */}
          {phase === "building" && (
            <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 min-h-[220px]">
              <div className="mb-5 flex flex-col items-center gap-3 text-center">
                <motion.span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-bg", accentBg)}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 6, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                  <Robot weight="fill" className="h-7 w-7" />
                </motion.span>
                <p className="text-base font-semibold text-ink">الوكيل يبني لعبتك…</p>
              </div>
              <ul className="space-y-2">
                {buildChallenge(text).buildLog.slice(0, logShown).map((line, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm leading-relaxed text-ink">
                    <CheckCircle weight="fill" className={cn("mt-0.5 h-4 w-4 shrink-0", accentText)} />
                    {line}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* ———— النتيجة ———— */}
          {phase === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className={cn("text-xs font-semibold", accentText)}>لعبة جاهزة للّعب</span>
                <h4 className="mt-1 font-display text-2xl text-ink">{result.title}</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={cn("rounded-full px-3 py-1 text-xs font-bold text-bg", accentBg)}>{result.engineLabel}</span>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-ink-muted">{result.summary}</span>
                </div>
                <details className="mt-4 text-sm text-ink-muted">
                  <summary className="cursor-pointer select-none hover:text-ink">كيف بناها الوكيل؟</summary>
                  <ul className="mt-2 space-y-1.5 pr-1">
                    {result.buildLog.map((l, i) => (
                      <li key={i} className="flex gap-2 leading-relaxed"><span className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", accentBg)} />{l}</li>
                    ))}
                  </ul>
                </details>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => onPlay(result)}
                  className={cn("flex flex-[1.4] items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold text-bg transition-transform duration-300 hover:scale-[1.02] active:scale-95", accentBg)}>
                  <Play weight="fill" className="h-5 w-5" />
                  شغّل اللعبة الآن
                </button>
                <button type="button" disabled={saved} onClick={() => { onSaveGame(result); setSaved(true); }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3.5 text-base font-semibold text-ink transition-colors duration-300 hover:border-white/30 hover:bg-white/5 disabled:opacity-50">
                  <FloppyDisk weight="bold" className="h-5 w-5" />
                  {saved ? "حُفِظت في لوحتك ✓" : "احفظها في صفحتي"}
                </button>
                <button type="button" onClick={() => setPhase("input")} aria-label="فكرة أخرى"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3.5 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink">
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
