import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, ArrowCounterClockwise, Timer, Shuffle, UserFocus, NotePencil, Robot, Sparkle } from "@phosphor-icons/react";
import { GlassCard } from "../GlassCard";
import { cn } from "../../lib/utils";
import type { Student } from "../../lib/theme";

const EASE = [0.32, 0.72, 0, 1] as const;
const PRESETS = [5, 10, 15];

/** مؤقّت النشاط: يعين المعلم على ضبط زمن الركن (١٠ دقائق غالبًا). */
function ActivityTimer({ accentText, accentBg }: { accentText: string; accentBg: string }) {
  const [total, setTotal] = useState(10 * 60);
  const [left, setLeft] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const done = left === 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function choose(minutes: number) {
    setTotal(minutes * 60);
    setLeft(minutes * 60);
    setRunning(false);
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const ratio = total === 0 ? 0 : left / total;
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <GlassCard className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2 self-start text-sm font-semibold text-ink">
        <Timer weight="duotone" className={cn("h-5 w-5", accentText)} />
        مؤقّت النشاط
      </div>

      <div className="relative h-40 w-40">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="#272727" strokeWidth="9" />
          <motion.circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            className={cn(done ? "text-sun-500" : accentText)}
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - ratio) }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans text-3xl font-bold tabular-nums text-ink">{`${mm}:${ss}`}</span>
          {done && <span className="mt-1 text-xs font-semibold text-sun-400">انتهى الوقت</span>}
        </div>
      </div>

      <div className="flex gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => choose(m)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300",
              total === m * 60 ? cn(accentBg, "text-bg") : "border border-white/15 text-ink-muted hover:border-white/30"
            )}
          >
            {m} دقائق
          </button>
        ))}
      </div>

      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={() => (done ? choose(total / 60) : setRunning((r) => !r))}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-bg transition-transform duration-300 hover:scale-[1.02] active:scale-95",
            accentBg
          )}
        >
          {done ? (
            <>
              <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
              من جديد
            </>
          ) : running ? (
            <>
              <Pause weight="fill" className="h-4 w-4" />
              إيقاف مؤقت
            </>
          ) : (
            <>
              <Play weight="fill" className="h-4 w-4" />
              ابدأ
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setLeft(total);
            setRunning(false);
          }}
          aria-label="تصفير"
          className="flex items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink"
        >
          <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
        </button>
      </div>
    </GlassCard>
  );
}

/** اختيار طالب عشوائي: يعدل فرص المشاركة بين الطلاب أثناء الركن. */
function StudentPicker({ students, accentText, accentBg }: { students: Student[]; accentText: string; accentBg: string }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const names = useMemo(() => students.map((s) => s.name), [students]);

  function pick() {
    if (names.length === 0 || spinning) return;
    setSpinning(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    let delay = 60;
    let elapsed = 0;
    const step = () => {
      setCurrent(names[Math.floor(Math.random() * names.length)]);
      elapsed += delay;
      delay += 14; // يتباطأ تدريجيًا حتى يستقر
      if (elapsed < 1600) {
        timers.current.push(window.setTimeout(step, delay));
      } else {
        setCurrent(names[Math.floor(Math.random() * names.length)]);
        setSpinning(false);
      }
    };
    step();
  }

  return (
    <GlassCard className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2 self-start text-sm font-semibold text-ink">
        <UserFocus weight="duotone" className={cn("h-5 w-5", accentText)} />
        اختيار طالب
      </div>

      <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-center">
        {names.length === 0 ? (
          <p className="text-sm text-ink-faint">ارفع قائمة طلابك ليعمل الاختيار</p>
        ) : current ? (
          <motion.span
            key={current + String(spinning)}
            initial={{ opacity: 0, y: spinning ? 6 : 0, scale: spinning ? 1 : 0.9 }}
            animate={{ opacity: 1, y: 0, scale: spinning ? 1 : 1.05 }}
            transition={{ duration: spinning ? 0.08 : 0.4, ease: EASE }}
            className={cn("font-display text-2xl sm:text-3xl", spinning ? "text-ink-muted" : accentText)}
          >
            {current}
          </motion.span>
        ) : (
          <p className="text-sm text-ink-muted">اضغط لاختيار طالب للمشاركة</p>
        )}
      </div>

      <button
        type="button"
        onClick={pick}
        disabled={names.length === 0 || spinning}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-bg transition-transform duration-300 enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-40",
          accentBg
        )}
      >
        <Shuffle weight="bold" className="h-4 w-4" />
        {spinning ? "نختار…" : "اختر طالبًا"}
      </button>
    </GlassCard>
  );
}

/** تعديل/إضافة المحتوى من جهة المعلم. */
function ContentEditor({
  editMode,
  onToggleEdit,
  accentText,
  accentBg,
}: {
  editMode: boolean;
  onToggleEdit: () => void;
  accentText: string;
  accentBg: string;
}) {
  return (
    <GlassCard className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <NotePencil weight="duotone" className={cn("h-5 w-5", accentText)} />
        تعديل الأنشطة
      </div>
      <p className="flex-1 text-sm leading-relaxed text-ink-muted">
        عدّل أي ركن أو أضف نشاطك الخاص بصياغتك، ويُحفظ لك تلقائيًا على جهازك
      </p>
      <button
        type="button"
        onClick={onToggleEdit}
        className={cn(
          "flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300",
          editMode ? cn(accentBg, "text-bg") : "border border-white/15 text-ink hover:border-white/30 hover:bg-white/5"
        )}
      >
        <NotePencil weight="bold" className="h-4 w-4" />
        {editMode ? "إنهاء التعديل" : "ابدأ التعديل"}
      </button>
    </GlassCard>
  );
}

export function TeacherTools({
  students,
  accentText,
  accentBg,
  editMode,
  onToggleEdit,
  onOpenAssistant,
}: {
  students: Student[];
  accentText: string;
  accentBg: string;
  editMode: boolean;
  onToggleEdit: () => void;
  onOpenAssistant: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* المساعد الذكي — الميزة الأبرز */}
      <button
        type="button"
        onClick={onOpenAssistant}
        className="group flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/10 p-5 text-right transition-all duration-300 hover:border-white/25"
        style={{ background: "linear-gradient(120deg, rgba(168,85,199,0.16), rgba(34,184,216,0.12), rgba(19,18,9,0.6))" }}
      >
        <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-bg", accentBg)}>
          <Robot weight="fill" className="h-7 w-7" />
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-2 font-display text-lg text-ink">
            المساعد الذكي
            <Sparkle weight="fill" className={cn("h-4 w-4", accentText)} />
          </span>
          <span className="mt-0.5 block text-sm text-ink-muted">
            اكتب فكرتك، ويبتكر لك نشاطًا ومسابقة تفاعلية توصل الرسالة — بضغطة
          </span>
        </span>
        <span className="hidden shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-ink transition-colors group-hover:bg-white/15 sm:block">
          ابتكر نشاطًا
        </span>
      </button>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ActivityTimer accentText={accentText} accentBg={accentBg} />
        <StudentPicker students={students} accentText={accentText} accentBg={accentBg} />
        <ContentEditor editMode={editMode} onToggleEdit={onToggleEdit} accentText={accentText} accentBg={accentBg} />
      </div>
    </div>
  );
}
