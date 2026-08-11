import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Star, Trash } from "@phosphor-icons/react";
import { ActivityShell, ND } from "./ActivityShell";

const EASE = [0.32, 0.72, 0, 1] as const;

/** ألوان أوراق المعرض، مستمدة من مربعات الهوية في الملف. */
const PAPERS = ["#E9DCC0", "#CFE3D2", "#E7C9C0", "#D6D2E8", "#F0E3C2", "#C7DFE3"];

interface Work {
  id: string;
  author: string;
  text: string;
  paper: string;
  tilt: number;
  featured: boolean;
}

export function GalleryWall({ onExit }: { onExit: () => void }) {
  const [works, setWorks] = useState<Work[]>([]);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const textRef = useRef<HTMLInputElement>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const phrase = text.trim();
    if (!phrase) return;
    setWorks((prev) => [
      {
        id: `${Date.now()}-${prev.length}`,
        author: author.trim() || "طالب",
        text: phrase,
        paper: PAPERS[prev.length % PAPERS.length],
        tilt: ((prev.length * 37) % 9) - 4,
        featured: false,
      },
      ...prev,
    ]);
    setText("");
    textRef.current?.focus();
  }

  const featuredCount = works.filter((w) => w.featured).length;

  return (
    <ActivityShell
      title="ركن عزنا بأصالتنا"
      subtitle={
        works.length === 0
          ? "كل طالب يكتب عبارة عن الوطن، وتُعلَّق في الركن"
          : `${works.length} عمل معلّق${featuredCount ? `، ${featuredCount} بوسام إبداع مميز` : ""}`
      }
      onExit={onExit}
      footer={
        <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={24}
            placeholder="اسم الطالب"
            className="rounded-full border-2 px-5 py-3 text-base outline-none sm:w-48"
            style={{ borderColor: `${ND.leaf}44`, backgroundColor: `${ND.deep}cc`, color: ND.cream }}
          />
          <input
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={60}
            placeholder="عبارة عن الوطن، مثل: أنا سعودي وأفتخر"
            className="flex-1 rounded-full border-2 px-5 py-3 text-base outline-none"
            style={{ borderColor: `${ND.leaf}55`, backgroundColor: `${ND.deep}cc`, color: ND.cream }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: ND.leaf, color: ND.deep }}
          >
            <Plus weight="bold" className="h-5 w-5" />
            علّق العمل
          </button>
        </form>
      }
    >
      {works.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed"
            style={{ borderColor: `${ND.cream}33` }}
          >
            <Plus weight="bold" className="h-7 w-7" style={{ color: `${ND.cream}55` }} />
          </div>
          <p className="max-w-md text-base" style={{ color: `${ND.cream}99` }}>
            الركن فاضي، أول عمل يُعلَّق يفتح المعرض
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {works.map((work) => (
              <motion.article
                key={work.id}
                layout
                initial={{ opacity: 0, y: 60, rotate: work.tilt - 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotate: work.tilt, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.65, ease: EASE }}
                className="group relative flex min-h-[9rem] flex-col justify-between rounded-sm p-4 shadow-xl"
                style={{ backgroundColor: work.paper, color: "#2C2419" }}
              >
                {/* شريط لاصق أعلى الورقة */}
                <span
                  className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rounded-sm opacity-70"
                  style={{ backgroundColor: `${ND.cream}` }}
                />

                <p className="pt-2 text-base leading-relaxed">{work.text}</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs opacity-70">{work.author}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setWorks((prev) =>
                          prev.map((w) => (w.id === work.id ? { ...w, featured: !w.featured } : w))
                        )
                      }
                      aria-pressed={work.featured}
                      aria-label={`وسام إبداع مميز لعمل ${work.author}`}
                      className="transition-transform duration-300 hover:scale-110"
                    >
                      <Star
                        weight={work.featured ? "fill" : "regular"}
                        className="h-4 w-4"
                        style={{ color: work.featured ? ND.sand : "#2C241966" }}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorks((prev) => prev.filter((w) => w.id !== work.id))}
                      aria-label={`إزالة عمل ${work.author}`}
                      className="opacity-0 transition-opacity duration-300 focus:opacity-100 group-hover:opacity-100"
                    >
                      <Trash weight="bold" className="h-4 w-4 opacity-60" />
                    </button>
                  </div>
                </div>

                {work.featured && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: -12 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="absolute -right-2 -top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-md"
                    style={{ backgroundColor: ND.sand, color: ND.deep }}
                  >
                    إبداع مميز
                  </motion.span>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ActivityShell>
  );
}
