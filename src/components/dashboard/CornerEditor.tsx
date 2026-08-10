import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, FloppyDisk, Trash } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";
import type { BreakCorner } from "../../data/breakPeriods";

const EASE = [0.32, 0.72, 0, 1] as const;

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const csv = (s: string) => s.split(/[،,]/).map((x) => x.trim()).filter(Boolean);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-base text-ink outline-none transition-colors duration-300 focus:border-white/35";

export function CornerEditor({
  initial,
  isNew,
  accentBg,
  onSave,
  onDelete,
  onClose,
}: {
  initial: BreakCorner;
  isNew: boolean;
  accentBg: string;
  onSave: (corner: BreakCorner) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [outcomes, setOutcomes] = useState(initial.outcomes.join("\n"));
  const [values, setValues] = useState(initial.values.join("، "));
  const [minutes, setMinutes] = useState(String(initial.minutes));
  const [place, setPlace] = useState(initial.place);
  const [tools, setTools] = useState(initial.tools.join("\n"));
  const [steps, setSteps] = useState(initial.steps.join("\n"));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function save() {
    const t = title.trim();
    if (!t) return;
    onSave({
      ...initial,
      title: t,
      outcomes: lines(outcomes),
      values: csv(values),
      minutes: Math.max(1, parseInt(minutes, 10) || initial.minutes),
      place: place.trim() || initial.place,
      tools: lines(tools),
      steps: lines(steps),
      edited: true,
    });
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
        aria-label={isNew ? "إضافة نشاط" : "تعديل النشاط"}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-raised p-6 sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl text-ink">{isNew ? "إضافة نشاط جديد" : "تعديل النشاط"}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink"
          >
            <X weight="bold" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="عنوان النشاط">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="مثال: ركن عزنا بأصالتنا" />
          </Field>

          <Field label="وش نتعلّم؟ (سطر لكل هدف)">
            <textarea value={outcomes} onChange={(e) => setOutcomes(e.target.value)} rows={2} className={cn(inputCls, "resize-y leading-relaxed")} />
          </Field>

          <Field label="القيم (افصل بفاصلة)">
            <input value={values} onChange={(e) => setValues(e.target.value)} className={inputCls} placeholder="الانضباط، الانتماء الوطني" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="المدة (دقائق)">
              <input type="number" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} className={inputCls} />
            </Field>
            <Field label="المكان">
              <input value={place} onChange={(e) => setPlace(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="الأدوات (سطر لكل أداة)">
            <textarea value={tools} onChange={(e) => setTools(e.target.value)} rows={3} className={cn(inputCls, "resize-y leading-relaxed")} />
          </Field>

          <Field label="خطوات العرض — بصيغة تخاطب الطلاب (سطر لكل خطوة)">
            <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={5} className={cn(inputCls, "resize-y leading-relaxed")} placeholder="بنفتح الركن… خذ ورقتك… جاهزين؟" />
          </Field>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!title.trim()}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-bg transition-transform duration-300 enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-40",
              accentBg
            )}
          >
            <FloppyDisk weight="bold" className="h-5 w-5" />
            حفظ
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="حذف النشاط"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-girls-500/40 text-girls-300 transition-colors duration-300 hover:bg-girls-500/10"
            >
              <Trash weight="bold" className="h-5 w-5" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
