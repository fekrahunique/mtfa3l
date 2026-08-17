import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ArrowsOut,
  CaretLeft,
  CaretRight,
  Target,
  Sparkle,
  Play,
  PlayCircle,
  PencilSimple,
  Check,
  Lightbulb,
  BookOpen,
  Info,
  ChatsCircle,
  Confetti,
} from "@phosphor-icons/react";
import type { BreakCorner, TeachContent } from "../data/breakPeriods";
import { teachContent } from "../data/teachContent";
import { SaduPattern } from "./ActivityShell";
import { stepIcon } from "./presentationVisuals";
import { cornerScripts } from "./presentationScripts";
import { noDot } from "../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

/** ألوان الفصل والسبورة — الثيم حول السبورة، والسبورة نفسها تبقى واضحة. */
const ROOM = {
  wallTop: "#d8c7a2",
  wallBottom: "#c2ad82",
  floor: "#9c8154",
  board: "#123a2c",
  boardEdge: "#0c2b20",
  frame: "#7a5230",
  frameDark: "#5e3d22",
  chalk: "#f3efe4",
  chalkSoft: "#cfe6da",
  leaf: "#2FBF78",
  gold: "#E8C05A",
  green: "#1E9E63",
  deep: "#0B3B2E",
};

type Slide =
  | { kind: "board" }
  | { kind: "goal" }
  | { kind: "hook" }
  | { kind: "explain"; index: number }
  | { kind: "facts" }
  | { kind: "discuss" }
  | { kind: "step"; index: number }
  | { kind: "fun" }
  | { kind: "launch" };

function buildSlides(steps: string[], t: TeachContent | undefined): Slide[] {
  return [
    { kind: "board" },
    { kind: "goal" },
    // المحتوى التعليمي الكامل: تمهيد ← شرح ← معلومات ← نقاش
    ...(t ? [{ kind: "hook" as const }] : []),
    ...(t ? t.explain.map((_, index) => ({ kind: "explain" as const, index })) : []),
    ...(t ? [{ kind: "facts" as const }] : []),
    ...(t ? [{ kind: "discuss" as const }] : []),
    // التنفيذ العملي
    ...steps.map((_, index) => ({ kind: "step" as const, index })),
    ...(t?.fun ? [{ kind: "fun" as const }] : []),
    { kind: "launch" },
  ];
}

/** نجرّد علامة الحقبة (هـ/م) من ناتج Intl لنضيفها مرة واحدة بثبات في العرض. */
function hijri(d: Date) {
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(d)
    .replace(/\s*هـ?\s*$/u, "")
    .trim();
}
function gregorian(d: Date) {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(d)
    .replace(/\s*م\s*$/u, "")
    .trim();
}

export function ActivityPresentation({
  corner,
  slogan,
  occasion,
  hasActivity,
  onClose,
  onLaunch,
}: {
  corner: BreakCorner;
  slogan: string | null;
  occasion: string | null;
  hasActivity: boolean;
  onClose: () => void;
  onLaunch: () => void;
}) {
  // خطوات المعلم المعدَّلة تسبق السيناريو الجاهز، ثم خطوات الملف كما هي.
  const steps = useMemo(
    () => (corner.edited ? corner.steps : cornerScripts[corner.id]?.steps ?? corner.steps),
    [corner]
  );
  const teach = useMemo(() => corner.teach ?? teachContent[corner.id], [corner]);
  const slides = useMemo(() => buildSlides(steps, teach), [steps, teach]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (delta: number) =>
    setI((prev) => {
      const next = Math.min(Math.max(prev + delta, 0), slides.length - 1);
      if (next !== prev) setDir(delta);
      return next;
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, onClose]);

  async function goFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* بعض المتصفحات ترفض بلا تفاعل مباشر */
    }
  }

  const slide = slides[i];
  const stepCount = steps.length;
  const currentStepNumber = slide.kind === "step" ? slide.index + 1 : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${ROOM.wallTop}, ${ROOM.wallBottom} 78%, ${ROOM.floor})` }}
    >
      <ClassroomDecor />

      {/* رأس خفيف فوق جدار الفصل */}
      <header className="relative z-20 flex items-center justify-between gap-4 px-5 pt-6 sm:px-8">
        <span className="rounded-full bg-black/15 px-4 py-1.5 text-sm font-semibold" style={{ color: ROOM.deep }}>
          اليوم {corner.day}، {noDot(corner.title)}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={goFullscreen}
            aria-label="ملء الشاشة"
            className="hidden h-10 w-10 items-center justify-center rounded-full border transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 sm:flex"
            style={{ borderColor: `${ROOM.deep}44`, color: ROOM.deep }}
          >
            <ArrowsOut weight="bold" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق العرض"
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
            style={{ borderColor: `${ROOM.deep}44`, color: ROOM.deep }}
          >
            <X weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* المسرح: السبورة في وسط الفصل */}
      <main
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-8"
        style={{ perspective: 1400 }}
      >
        <Blackboard>
          {/* شريط التقدّم أعلى السبورة */}
          <div className="absolute inset-x-6 top-4 z-20 h-1 rounded-full" style={{ backgroundColor: `${ROOM.chalk}22` }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: ROOM.leaf }}
              animate={{ width: `${((i + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>

          <div className="flex h-full w-full items-center justify-center px-5 pb-6 pt-10 sm:px-10">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={i}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: dir * -60, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex w-full max-w-3xl flex-col items-center text-center"
              >
                {slide.kind === "board" && (
                  <BoardSlide corner={corner} slogan={slogan} occasion={occasion} />
                )}
                {slide.kind === "goal" && <GoalSlide corner={corner} />}
                {slide.kind === "hook" && teach && <HookSlide text={teach.hook} />}
                {slide.kind === "explain" && teach && (
                  <ExplainSlide text={teach.explain[slide.index]} index={slide.index} total={teach.explain.length} />
                )}
                {slide.kind === "facts" && teach && <FactsSlide facts={teach.facts} />}
                {slide.kind === "discuss" && teach && <DiscussSlide questions={teach.discuss} />}
                {slide.kind === "fun" && teach?.fun && <FunSlide fun={teach.fun} />}
                {slide.kind === "step" && <StepSlide text={steps[slide.index]} index={slide.index} total={stepCount} />}
                {slide.kind === "launch" && (
                  <LaunchSlide corner={corner} hasActivity={hasActivity} onLaunch={onLaunch} onClose={onClose} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Blackboard>
      </main>

      {/* أدوات التنقّل */}
      <footer className="relative z-20 flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={i === 0}
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-30"
          style={{ borderColor: `${ROOM.deep}44`, color: ROOM.deep }}
        >
          <CaretRight weight="bold" className="h-4 w-4" />
          السابق
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDir(idx > i ? 1 : -1);
                setI(idx);
              }}
              aria-label={`الشريحة ${idx + 1}`}
              className="h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ width: idx === i ? 22 : 8, backgroundColor: idx === i ? ROOM.green : `${ROOM.deep}40` }}
            />
          ))}
        </div>

        {i < slides.length - 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
            style={{ backgroundColor: ROOM.green }}
          >
            {currentStepNumber ? `الخطوة ${currentStepNumber} من ${stepCount}` : "التالي"}
            <CaretLeft weight="bold" className="h-4 w-4" />
          </button>
        ) : (
          <span className="w-24" />
        )}
      </footer>
    </motion.div>
  );
}

/* ————————————————————— الفصل والسبورة ————————————————————— */

/** زينة المناسبة على جدران الفصل قرب السبورة فقط — لا تغطّي وسطه. */
function ClassroomDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {/* شريط سدو أعلى الجدار */}
      <div className="absolute inset-x-0 top-0 h-6 opacity-60">
        <SaduPattern className="h-full w-full" opacity={0.5} />
      </div>
      {/* علمان صغيران عند الزاويتين العلويتين */}
      <MiniFlag className="absolute left-6 top-16 hidden sm:block" />
      <MiniFlag className="absolute right-6 top-16 hidden sm:block" />
      {/* لمحة نخيل عند أسفل الزوايا */}
      <PalmHint className="absolute bottom-2 left-2 opacity-70 sm:left-6" />
      <PalmHint className="absolute bottom-2 right-2 -scale-x-100 opacity-70 sm:right-6" />
    </div>
  );
}

function MiniFlag({ className }: { className?: string }) {
  return (
    <svg className={className} width="52" height="60" viewBox="0 0 52 60" fill="none">
      <rect x="6" y="2" width="2.6" height="56" rx="1.3" fill={ROOM.frameDark} />
      <path d="M8 5 H46 V26 H8 Z" fill={ROOM.green} />
      <rect x="14" y="13" width="24" height="3" rx="1.5" fill={ROOM.chalk} opacity="0.9" />
    </svg>
  );
}

function PalmHint({ className }: { className?: string }) {
  return (
    <svg className={className} width="90" height="120" viewBox="0 0 90 120" fill="none">
      <path d="M44 120 C44 80 42 60 40 44" stroke={ROOM.frameDark} strokeWidth="5" strokeLinecap="round" />
      {[-60, -30, 0, 30, 60, 90, 120].map((a) => (
        <path
          key={a}
          d="M40 44 q22 -6 34 4"
          stroke={ROOM.green}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          transform={`rotate(${a} 40 44)`}
          opacity="0.75"
        />
      ))}
    </svg>
  );
}

/** السبورة: تدخل بحركة «اقتراب» مرة واحدة، ثم تبقى إطارًا ثابتًا للشرائح. */
function Blackboard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, rotateX: 14, y: 46 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="relative aspect-[16/9] w-full max-w-5xl rounded-[1.4rem] p-[14px] shadow-[0_40px_90px_rgba(0,0,0,0.45)]"
      style={{ background: `linear-gradient(145deg, ${ROOM.frame}, ${ROOM.frameDark})` }}
    >
      {/* سطح السبورة */}
      <div
        className="relative h-full w-full overflow-hidden rounded-[0.9rem]"
        style={{
          background: `radial-gradient(120% 120% at 30% 20%, ${ROOM.board}, ${ROOM.boardEdge})`,
          boxShadow: "inset 0 0 90px rgba(0,0,0,0.5)",
        }}
      >
        {/* غبار طباشير خفيف */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ background: "radial-gradient(circle at 70% 80%, #fff, transparent 45%)" }}
        />
        {children}
      </div>
      {/* حامل الطباشير */}
      <div
        className="absolute inset-x-10 -bottom-2 h-2.5 rounded-b-lg"
        style={{ background: `linear-gradient(${ROOM.frame}, ${ROOM.frameDark})` }}
      />
    </motion.div>
  );
}

/* ————————————————————— الشرائح ————————————————————— */

function EditableDate() {
  const [iso, setIso] = useState(() => new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = useState(false);
  const date = useMemo(() => new Date(`${iso}T00:00:00`), [iso]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold sm:text-base" style={{ color: ROOM.gold }}>
          {hijri(date)} هـ
        </p>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label="تعديل التاريخ"
          className="flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
          style={{ backgroundColor: `${ROOM.chalk}1f`, color: ROOM.chalkSoft }}
        >
          {editing ? <Check weight="bold" className="h-3.5 w-3.5" /> : <PencilSimple weight="bold" className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="text-xs sm:text-sm" style={{ color: ROOM.chalkSoft }}>
        {gregorian(date)} م
      </p>
      {editing && (
        <input
          type="date"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
          className="mt-1 rounded-lg border bg-transparent px-3 py-1 text-sm outline-none"
          style={{ borderColor: `${ROOM.chalk}44`, color: ROOM.chalk, colorScheme: "dark" }}
        />
      )}
    </div>
  );
}

/** شريحة الافتتاح على السبورة: التاريخ + ترحيب يخاطب الطلاب + سبب النشاط. */
function BoardSlide({
  corner,
  slogan,
  occasion,
}: {
  corner: BreakCorner;
  slogan: string | null;
  occasion: string | null;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <EditableDate />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="text-lg font-semibold sm:text-2xl"
        style={{ color: ROOM.chalk }}
      >
        مرحبًا يا أبطال 👋
      </motion.p>

      <div className="flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          className="font-display text-3xl leading-tight sm:text-5xl"
          style={{ color: ROOM.chalk }}
        >
          {noDot(corner.title)}
        </motion.h1>
        {/* خط طباشير تحت العنوان */}
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
          className="mt-2 block h-1 w-40 origin-right rounded-full sm:w-56"
          style={{ backgroundColor: ROOM.leaf }}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="max-w-xl text-base leading-relaxed sm:text-lg"
        style={{ color: ROOM.chalkSoft }}
      >
        {occasion ? noDot(occasion) : "اليوم عندنا نشاط ممتع"}
        {slogan ? ` تحت شعار «${noDot(slogan)}»` : ""}، ونعيش قيم: {corner.values.join("، ")}
      </motion.p>
    </div>
  );
}

function GoalSlide({ corner }: { corner: BreakCorner }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl"
        style={{ backgroundColor: `${ROOM.leaf}22` }}
      >
        <Target weight="duotone" className="h-10 w-10" style={{ color: ROOM.leaf }} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        className="mt-5 font-display text-2xl sm:text-3xl"
        style={{ color: ROOM.chalk }}
      >
        وش راح نتعلّم اليوم؟
      </motion.h2>
      <div className="mt-6 flex w-full flex-col gap-3">
        {corner.outcomes.map((o, idx) => (
          <motion.div
            key={o}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.3 + idx * 0.2, ease: EASE }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4 text-right"
            style={{ borderColor: `${ROOM.leaf}33`, backgroundColor: `${ROOM.chalk}0a` }}
          >
            <Sparkle weight="fill" className="h-6 w-6 shrink-0" style={{ color: ROOM.gold }} />
            <p className="text-base leading-relaxed sm:text-lg" style={{ color: ROOM.chalk }}>
              {noDot(o)}
            </p>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/** تمهيد تشويقي يخاطب الطلاب. */
function HookSlide({ text }: { text: string }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl"
        style={{ backgroundColor: `${ROOM.gold}22` }}
      >
        <Lightbulb weight="duotone" className="h-10 w-10" style={{ color: ROOM.gold }} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
        className="mt-7 max-w-2xl text-xl leading-relaxed sm:text-2xl"
        style={{ color: ROOM.chalk }}
      >
        {noDot(text)}
      </motion.p>
    </>
  );
}

/** شريحة شرح: فقرة كاملة من المحتوى التعليمي يقرؤها المعلم أو يعرضها. */
function ExplainSlide({ text, index, total }: { text: string; index: number; total: number }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-3"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${ROOM.leaf}1f` }}>
          <BookOpen weight="duotone" className="h-8 w-8" style={{ color: ROOM.leaf }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: ROOM.leaf }}>
          الشرح {index + 1} من {total}
        </span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="mt-6 max-w-2xl text-lg leading-loose sm:text-2xl"
        style={{ color: ROOM.chalk }}
      >
        {noDot(text)}
      </motion.p>
    </>
  );
}

/** معلومات وحقائق سريعة. */
function FactsSlide({ facts }: { facts: string[] }) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-3 font-display text-2xl sm:text-3xl"
        style={{ color: ROOM.chalk }}
      >
        <Info weight="duotone" className="h-8 w-8" style={{ color: ROOM.gold }} /> معلومات تهمّك
      </motion.h2>
      <div className="mt-6 flex w-full flex-col gap-3">
        {facts.map((f, idx) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + idx * 0.15, ease: EASE }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-right"
            style={{ borderColor: `${ROOM.gold}33`, backgroundColor: `${ROOM.chalk}0a` }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: ROOM.gold, color: ROOM.deep }}>{idx + 1}</span>
            <p className="text-base leading-relaxed sm:text-lg" style={{ color: ROOM.chalk }}>{noDot(f)}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/** أسئلة نقاش تفاعلية مع الطلاب. */
function DiscussSlide({ questions }: { questions: string[] }) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-3 font-display text-2xl sm:text-3xl"
        style={{ color: ROOM.chalk }}
      >
        <ChatsCircle weight="duotone" className="h-8 w-8" style={{ color: ROOM.leaf }} /> نتناقش معًا
      </motion.h2>
      <p className="mt-2 text-sm" style={{ color: ROOM.chalkSoft }}>اطرح الأسئلة على طلابك واسمع إجاباتهم</p>
      <div className="mt-6 flex w-full flex-col gap-3">
        {questions.map((q, idx) => (
          <motion.div
            key={q}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + idx * 0.18, ease: EASE }}
            className="flex items-start gap-3 rounded-2xl border px-5 py-4 text-right"
            style={{ borderColor: `${ROOM.leaf}33`, backgroundColor: `${ROOM.chalk}0a` }}
          >
            <ChatsCircle weight="fill" className="mt-0.5 h-6 w-6 shrink-0" style={{ color: ROOM.leaf }} />
            <p className="text-base leading-relaxed sm:text-lg" style={{ color: ROOM.chalk }}>{noDot(q)}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/** نشاط تعليمي/ترفيهي مساعد جاهز. */
function FunSlide({ fun }: { fun: { title: string; desc: string } }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: 8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl"
        style={{ backgroundColor: `${ROOM.leaf}22` }}
      >
        <Confetti weight="duotone" className="h-10 w-10" style={{ color: ROOM.leaf }} />
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6 text-sm font-semibold"
        style={{ color: ROOM.leaf }}
      >
        نشاط مساعد ممتع
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
        className="mt-2 font-display text-2xl sm:text-4xl"
        style={{ color: ROOM.chalk }}
      >
        {noDot(fun.title)}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.45, ease: EASE }}
        className="mt-4 max-w-2xl text-lg leading-relaxed sm:text-xl"
        style={{ color: ROOM.chalkSoft }}
      >
        {noDot(fun.desc)}
      </motion.p>
    </>
  );
}

function StepSlide({ text, index, total }: { text: string; index: number; total: number }) {
  const Icon = stepIcon(text);
  return (
    <>
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative flex h-28 w-28 items-center justify-center rounded-[1.8rem]"
        style={{ backgroundColor: `${ROOM.leaf}1f` }}
      >
        <Icon weight="duotone" className="h-14 w-14" style={{ color: ROOM.leaf }} />
        <span
          className="absolute -bottom-3 -left-3 flex h-11 w-11 items-center justify-center rounded-full font-display text-xl"
          style={{ backgroundColor: ROOM.gold, color: ROOM.deep }}
        >
          {index + 1}
        </span>
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-7 text-sm font-semibold"
        style={{ color: ROOM.leaf }}
      >
        خطوة {index + 1} من {total}
      </motion.span>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
        className="mt-3 max-w-2xl text-xl leading-relaxed sm:text-2xl"
        style={{ color: ROOM.chalk }}
      >
        {noDot(text)}
      </motion.p>
    </>
  );
}

function LaunchSlide({
  corner,
  hasActivity,
  onLaunch,
  onClose,
}: {
  corner: BreakCorner;
  hasActivity: boolean;
  onLaunch: () => void;
  onClose: () => void;
}) {
  if (!hasActivity) {
    return (
      <>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: `${ROOM.gold}22` }}
        >
          <PlayCircle weight="duotone" className="h-12 w-12" style={{ color: ROOM.gold }} />
        </motion.div>
        <h2 className="mt-6 font-display text-3xl sm:text-4xl" style={{ color: ROOM.chalk }}>
          الركن جاهز للتنفيذ
        </h2>
        <p className="mt-3 text-lg" style={{ color: ROOM.chalkSoft }}>
          نفّذوا «{noDot(corner.title)}» في {noDot(corner.place)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-9 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
          style={{ backgroundColor: ROOM.green }}
        >
          إنهاء العرض
        </button>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.08, 1], opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="flex h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: `${ROOM.leaf}22` }}
      >
        <Play weight="fill" className="h-12 w-12" style={{ color: ROOM.leaf }} />
      </motion.div>
      <h2 className="mt-6 font-display text-3xl sm:text-5xl" style={{ color: ROOM.chalk }}>
        هيّا نبدأ النشاط!
      </h2>
      <p className="mt-3 text-lg" style={{ color: ROOM.chalkSoft }}>
        شرحنا الفكرة، الآن نلعبها مع الطلاب
      </p>
      <motion.button
        type="button"
        onClick={onLaunch}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-9 flex items-center gap-3 rounded-full px-10 py-4 text-lg font-bold text-white shadow-2xl transition-transform duration-500 hover:scale-105 active:scale-95"
        style={{ backgroundColor: ROOM.green }}
      >
        <Play weight="fill" className="h-6 w-6" />
        ابدأ النشاط الآن
      </motion.button>
    </>
  );
}
