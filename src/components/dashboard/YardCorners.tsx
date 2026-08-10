import { useState } from "react";
import { motion } from "framer-motion";
import { PencilSimple, Plus, CheckCircle } from "@phosphor-icons/react";
import { CornerCard } from "./CornerCard";
import { cn } from "../../lib/utils";
import type { BreakCorner } from "../../data/breakPeriods";
import type { WeekTheme } from "../../lib/weekTheme";

const EASE = [0.32, 0.72, 0, 1] as const;

const ORD = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن"];
const dayLabel = (day: number) => `اليوم ${ORD[day - 1] ?? day}`;

/** خلفية ساحة المدرسة (مكان الفسحة) — متيمّنة بألوان المناسبة. */
function YardBackdrop({ theme }: { theme: WeekTheme }) {
  const national = theme.decor === "national";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.06 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease: EASE }}
      className="pointer-events-none absolute inset-0"
    >
      <svg viewBox="0 0 1200 820" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="yardSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.skyTop} />
            <stop offset="1" stopColor={theme.skyBottom} />
          </linearGradient>
        </defs>

        {/* سماء وشمس */}
        <rect width="1200" height="380" fill="url(#yardSky)" />
        <circle cx="990" cy="96" r="48" fill={theme.accentSoft} opacity="0.5" />

        {/* مبنى المدرسة في العمق */}
        <rect x="250" y="150" width="700" height="235" fill={theme.wall} />
        <rect x="232" y="130" width="736" height="28" rx="4" fill={theme.roof} />
        <rect x="560" y="270" width="80" height="115" rx="6" fill={theme.roof} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={300 + i * 78} y="195" width="46" height="52" rx="4" fill={theme.window} opacity="0.85" />
        ))}

        {/* أرض الساحة */}
        <rect y="370" width="1200" height="450" fill={theme.ground} />
        {/* بلاط الفسحة */}
        <rect x="110" y="450" width="980" height="360" rx="46" fill={theme.path} opacity="0.92" />
        {/* خطوط ملعب الساحة */}
        <circle cx="600" cy="630" r="78" fill="none" stroke="#ffffff" strokeWidth="5" opacity="0.35" />
        <line x1="600" y1="452" x2="600" y2="808" stroke="#ffffff" strokeWidth="5" opacity="0.28" />

        {national ? (
          <>
            {/* نخيل عند الطرفين */}
            {[180, 1030].map((x) => (
              <g key={x}>
                <rect x={x - 6} y="470" width="12" height="120" rx="6" fill="#8a6234" />
                {[-55, -20, 20, 55].map((a) => (
                  <path
                    key={a}
                    d={`M${x} 470 q40 -12 64 6`}
                    transform={`rotate(${a} ${x} 470)`}
                    stroke={theme.accent}
                    strokeWidth="9"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.85"
                  />
                ))}
              </g>
            ))}
            {/* أعلام */}
            {[430, 770].map((x) => (
              <g key={x}>
                <rect x={x} y="360" width="5" height="120" rx="2.5" fill="#c9c9cf" />
                <path d={`M${x + 5} 366 h60 v34 h-60 z`} fill={theme.accent} />
                <rect x={x + 16} y="380" width="36" height="5" rx="2.5" fill="#ffffff" opacity="0.9" />
              </g>
            ))}
          </>
        ) : (
          [180, 1030].map((x) => (
            <g key={x}>
              <rect x={x - 6} y="500" width="12" height="90" rx="6" fill="#7a5638" />
              <circle cx={x} cy="480" r="46" fill="#3f8f4d" />
            </g>
          ))
        )}
      </svg>

      {/* حجاب داكن يضمن قراءة البطاقات فوق المشهد */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(19,18,9,0.28), rgba(19,18,9,0.74))" }}
      />
    </motion.div>
  );
}

export function YardCorners({
  corners,
  doneIds,
  accentBg,
  accentText,
  theme,
  editMode = false,
  onToggleDone,
  onOpen,
  onPlay,
  onEdit,
  onAdd,
}: {
  corners: BreakCorner[];
  doneIds: string[];
  accentBg: string;
  accentText: string;
  theme: WeekTheme;
  editMode?: boolean;
  onToggleDone: (id: string) => void;
  onOpen: (id: string) => void;
  onPlay: (id: string) => void;
  onEdit?: (id: string) => void;
  onAdd?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(corners[0]?.id ?? null);
  const selected = corners.find((c) => c.id === selectedId) ?? corners[0];

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] border p-5 sm:p-8 lg:p-10"
      style={{ borderColor: `${theme.accent}33` }}
    >
      <YardBackdrop theme={theme} />

      <div className="relative z-10">
        {/* خط الأيام المستقيم — اختر يومًا ليظهر محتواه وحده */}
        <div className="relative mx-auto flex max-w-3xl items-start justify-center gap-8 sm:gap-16">
          <div className="absolute inset-x-8 top-6 h-0.5 bg-white/15" />
          {corners.map((corner) => {
            const active = selected?.id === corner.id;
            const done = doneIds.includes(corner.id);
            return (
              <button
                key={corner.id}
                type="button"
                onClick={() => setSelectedId(corner.id)}
                className="relative z-10 flex shrink-0 flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full border-2 font-display text-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    active ? cn(accentBg, "scale-110 border-transparent text-bg") : "border-white/25 bg-bg text-ink"
                  )}
                >
                  {corner.day}
                  {done && (
                    <span className="absolute -bottom-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bg">
                      <CheckCircle weight="fill" className={cn("h-5 w-5", accentText)} />
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-sm font-semibold transition-colors duration-300",
                    active ? accentText : "text-white/70"
                  )}
                >
                  {dayLabel(corner.day)}
                </span>
              </button>
            );
          })}

          {editMode && onAdd && (
            <button
              type="button"
              onClick={onAdd}
              aria-label="أضف نشاطًا"
              className="relative z-10 flex shrink-0 flex-col items-center gap-2"
            >
              <span className={cn("flex h-12 w-12 items-center justify-center rounded-full text-bg", accentBg)}>
                <Plus weight="bold" className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-white/70">أضف</span>
            </button>
          )}
        </div>

        {/* محتوى اليوم المختار فقط */}
        {selected && (
          <div className="mt-9 flex justify-center">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative w-full max-w-lg rounded-2xl"
              style={{ backgroundColor: `${theme.banner}f2`, boxShadow: "0 16px 44px rgba(0,0,0,0.5)" }}
            >
              {editMode && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(selected.id)}
                  aria-label={`تعديل ${selected.title}`}
                  className={cn(
                    "absolute -left-3 -top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full text-bg shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95",
                    accentBg
                  )}
                >
                  <PencilSimple weight="bold" className="h-5 w-5" />
                </button>
              )}
              <CornerCard
                corner={selected}
                done={doneIds.includes(selected.id)}
                accentBg={accentBg}
                accentText={accentText}
                onToggleDone={() => onToggleDone(selected.id)}
                onOpen={() => onOpen(selected.id)}
                onPlay={() => onPlay(selected.id)}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
