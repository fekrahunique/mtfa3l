import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash } from "@phosphor-icons/react";
import { ActivityShell, Celebration, ND } from "./ActivityShell";

const EASE = [0.32, 0.72, 0, 1] as const;

/** القيم المقترحة في ملف الوزارة لهذا الركن. */
const SUGGESTIONS = [
  "التضامن الاجتماعي",
  "الكرم والضيافة",
  "الأمن والأمان",
  "التراث السعودي",
  "العلم السعودي",
  "المعالم الوطنية",
];

/** مواضع الأوراق على الشجرة، موزعة يدويًا لتبدو طبيعية. */
const LEAF_SPOTS = [
  { x: 50, y: 16 }, { x: 38, y: 21 }, { x: 62, y: 21 },
  { x: 26, y: 28 }, { x: 50, y: 27 }, { x: 74, y: 28 },
  { x: 15, y: 36 }, { x: 35, y: 36 }, { x: 65, y: 36 }, { x: 85, y: 36 },
  { x: 23, y: 45 }, { x: 50, y: 42 }, { x: 77, y: 45 },
  { x: 11, y: 52 }, { x: 37, y: 52 }, { x: 63, y: 52 }, { x: 89, y: 52 },
  { x: 27, y: 60 }, { x: 73, y: 60 }, { x: 50, y: 57 },
];

interface Leaf {
  id: string;
  text: string;
  spot: number;
}

export function ValueTree({ onExit }: { onExit: () => void }) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const full = leaves.length >= LEAF_SPOTS.length;
  const remaining = useMemo(
    () => SUGGESTIONS.filter((s) => !leaves.some((l) => l.text === s)),
    [leaves]
  );

  function add(text: string) {
    const value = text.trim();
    if (!value || full) return;
    setLeaves((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, text: value, spot: prev.length }]);
    setDraft("");
    inputRef.current?.focus();
  }

  return (
    <ActivityShell
      title="شجرة عزنا بطبعنا"
      subtitle={
        full
          ? "اكتملت اللوحة الجماعية"
          : `${leaves.length} من ${LEAF_SPOTS.length} ورقة، كل طالب يضيف قيمة يفتخر بها`
      }
      onExit={onExit}
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(draft);
          }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={full}
              maxLength={28}
              placeholder={full ? "اكتملت الشجرة" : "اكتب قيمة تجعلك فخورًا بوطنك…"}
              className="flex-1 rounded-full border-2 px-5 py-3 text-base outline-none transition-colors duration-500 disabled:opacity-50"
              style={{
                borderColor: `${ND.leaf}55`,
                backgroundColor: `${ND.deep}cc`,
                color: ND.cream,
              }}
            />
            <button
              type="submit"
              disabled={full || !draft.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: ND.leaf, color: ND.deep }}
              aria-label="أضف الورقة"
            >
              <Plus weight="bold" className="h-5 w-5" />
            </button>
          </div>

          {remaining.length > 0 && !full && (
            <div className="flex flex-wrap gap-2">
              {remaining.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="rounded-full border px-3 py-1.5 text-sm transition-transform duration-500 hover:scale-105 active:scale-95"
                  style={{ borderColor: `${ND.cream}2a`, color: `${ND.cream}cc` }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>
      }
    >
      <div className="relative flex flex-1 items-center justify-center">
        <Celebration show={full} />

        <div className="relative aspect-[4/3] w-full max-w-4xl">
          <svg viewBox="0 0 100 78" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {/* الجذع */}
            <motion.path
              d="M50 78 L50 42"
              stroke="#6B4A2F"
              strokeWidth="4.2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: EASE }}
            />
            {/* الأغصان */}
            {[
              "M50 62 L26 46", "M50 62 L74 46",
              "M50 54 L13 40", "M50 54 L87 40",
              "M50 48 L34 24", "M50 48 L66 24",
              "M50 44 L50 16",
              "M34 32 L25 26", "M66 32 L75 26",
              "M26 46 L21 38", "M74 46 L79 38",
            ].map((d, i) => (
              <motion.path
                key={d}
                d={d}
                stroke="#6B4A2F"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.09, ease: EASE }}
              />
            ))}
            {/* التربة */}
            <ellipse cx="50" cy="78" rx="24" ry="2.4" fill={ND.green} opacity="0.4" />
          </svg>

          <AnimatePresence>
            {leaves.map((leaf) => {
              const spot = LEAF_SPOTS[leaf.spot];
              return (
                <motion.div
                  key={leaf.id}
                  initial={{ opacity: 0, scale: 0.4, x: "-50%", y: "120%", rotate: -25 }}
                  animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%", rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.85, ease: EASE }}
                  className="group absolute"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  <div
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg sm:text-sm"
                    style={{ backgroundColor: ND.leaf, color: ND.deep }}
                  >
                    {leaf.text}
                    <button
                      type="button"
                      onClick={() => setLeaves((prev) => prev.filter((l) => l.id !== leaf.id))}
                      aria-label={`إزالة ${leaf.text}`}
                      className="opacity-0 transition-opacity duration-300 focus:opacity-100 group-hover:opacity-100"
                    >
                      <Trash weight="bold" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {leaves.length === 0 && (
            <p
              className="absolute inset-x-0 top-[18%] text-center text-base sm:text-lg"
              style={{ color: `${ND.cream}88` }}
            >
              الشجرة تمثل الوطن والقيم السعودية تحت شعار «عزّنا بطبعنا»
            </p>
          )}
        </div>
      </div>
    </ActivityShell>
  );
}
