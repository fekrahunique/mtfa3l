import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretLeft, CaretRight, Play, Pause } from "@phosphor-icons/react";
import { GlassCard } from "../GlassCard";
import { cn, noDot } from "../../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

const C = {
  fig: "#2FBF78",
  sun: "#ffb84d",
  water: "#8ec6e8",
  cream: "#f5f2ea",
  wood: "#7a5638",
  ink: "#cdbb9c",
};

/** مشهد رسومي لكل خطوة روتين — يُطابق بالترتيب (نزول، غسل، نظافة وعودة). */
function SceneCalmStairs() {
  // درج جانبي واضح ينزل من أعلى اليمين نحو ساحة أسفل اليسار.
  const treads = [
    [150, 46],
    [118, 70],
    [86, 94],
    [54, 118],
  ];
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      {/* كتلة الدرج */}
      <path
        d="M182 46 H150 V70 H118 V94 H86 V118 H30 V140 H182 Z"
        fill={C.wood}
      />
      {/* حافة كل درجة (نافل) */}
      {treads.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={x === 150 ? 32 : 32} height="4" fill={C.cream} opacity={0.45} />
      ))}
      {/* درابزين مائل مع النزول */}
      <line x1="176" y1="30" x2="44" y2="118" stroke={C.ink} strokeWidth="3" strokeLinecap="round" opacity={0.75} />
      {[168, 130, 92].map((x, i) => (
        <line key={i} x1={x} y1={40 + i * 24} x2={x} y2={54 + i * 24} stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" opacity={0.6} />
      ))}
      {/* طفل يهبط الدرج كله من الأعلى حتى آخر درجة ثم يعود من البداية */}
      <motion.g
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{
          x: [0, -32, -64, -96, -128, -150],
          y: [0, 24, 48, 72, 94, 94],
          opacity: [1, 1, 1, 1, 1, 0],
        }}
        transition={{ duration: 1.8, times: [0, 0.2, 0.4, 0.6, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="166" cy="20" r="8" fill={C.cream} />
        <rect x="159" y="28" width="14" height="15" rx="6" fill={C.fig} />
        <rect x="158" y="42" width="5" height="10" rx="2.5" fill={C.ink} transform="rotate(12 160 42)" />
        <rect x="168" y="42" width="5" height="12" rx="2.5" fill={C.ink} transform="rotate(-14 170 42)" />
      </motion.g>
    </svg>
  );
}

function SceneWash() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      {/* الصنبور */}
      <rect x="96" y="18" width="10" height="34" rx="3" fill={C.ink} />
      <rect x="70" y="18" width="40" height="9" rx="4" fill={C.ink} />
      <rect x="66" y="14" width="10" height="18" rx="3" fill={C.sun} />
      {/* قطرات ماء متحركة */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={101}
          r="3.4"
          fill={C.water}
          initial={{ cy: 54, opacity: 0 }}
          animate={{ cy: [54, 92], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.35, ease: "easeIn" }}
        />
      ))}
      {/* يدان */}
      <ellipse cx="88" cy="104" rx="16" ry="10" fill={C.cream} />
      <ellipse cx="114" cy="104" rx="16" ry="10" fill={C.cream} />
      {/* قلب صغير للبركة */}
      <motion.path
        d="M150 96 l6 6 6 -6 a4.2 4.2 0 0 0 -6 -6 a4.2 4.2 0 0 0 -6 6 z"
        fill={C.fig}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "156px 98px" }}
      />
    </svg>
  );
}

function SceneCleanReturn() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      {/* سلة المهملات */}
      <path d="M40 60 h34 l-4 68 h-26 z" fill={C.fig} />
      <rect x="36" y="52" width="42" height="9" rx="4" fill={C.ink} />
      {/* ورقة تسقط في السلة */}
      <motion.rect
        x="52"
        width="12"
        height="12"
        rx="2"
        fill={C.sun}
        initial={{ y: 20, rotate: 0, opacity: 0 }}
        animate={{ y: [20, 54], rotate: [0, 40], opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn" }}
      />
      {/* باب العودة للصف */}
      <rect x="128" y="46" width="44" height="82" rx="4" fill={C.wood} />
      <circle cx="135" cy="88" r="3" fill={C.sun} />
      <motion.path
        d="M96 92 h22"
        stroke={C.cream}
        strokeWidth="4"
        strokeLinecap="round"
        markerEnd=""
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M112 86 l8 6 -8 6"
        fill="none"
        stroke={C.cream}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

const SCENES = [SceneCalmStairs, SceneWash, SceneCleanReturn];

export function RoutineJourney({
  routine,
  accentText,
  accentBg,
}: {
  routine: string[];
  accentText: string;
  accentBg: string;
}) {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [dir, setDir] = useState(1);
  const count = routine.length;

  useEffect(() => {
    if (!auto || count === 0) return;
    const id = setInterval(() => {
      setDir(1);
      setIdx((i) => (i + 1) % count);
    }, 3600);
    return () => clearInterval(id);
  }, [auto, count]);

  if (count === 0) return null;
  const Scene = SCENES[idx] ?? SCENES[0];

  const go = (d: number) => {
    setDir(d);
    setIdx((i) => (i + d + count) % count);
  };

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* لوحة الرسم */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:h-52 sm:w-72">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="absolute inset-0 p-4"
            >
              <Scene />
            </motion.div>
          </AnimatePresence>
          <span
            className={cn(
              "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-bg",
              accentBg
            )}
          >
            {idx + 1}
          </span>
        </div>

        {/* النص والتحكم */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className={cn("text-sm font-semibold", accentText)}>خطوة {idx + 1} من {count}</span>
          <div className="mt-2 min-h-[4.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="text-lg leading-relaxed text-ink"
              >
                {noDot(routine[idx])}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="السابق"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink"
            >
              <CaretRight weight="bold" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="التالي"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-colors duration-300 hover:border-white/30 hover:text-ink"
            >
              <CaretLeft weight="bold" className="h-4 w-4" />
            </button>

            <div className="mx-1 flex items-center gap-1.5">
              {routine.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDir(i > idx ? 1 : -1);
                    setIdx(i);
                  }}
                  aria-label={`خطوة ${i + 1}`}
                  className="h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ width: i === idx ? 20 : 8, backgroundColor: i === idx ? undefined : "rgba(255,255,255,0.2)" }}
                >
                  {i === idx && <span className={cn("block h-full w-full rounded-full", accentBg)} />}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              className={cn(
                "mr-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-300",
                auto ? cn(accentBg, "text-bg") : "border border-white/15 text-ink-muted hover:border-white/30"
              )}
            >
              {auto ? <Pause weight="fill" className="h-3.5 w-3.5" /> : <Play weight="fill" className="h-3.5 w-3.5" />}
              {auto ? "إيقاف" : "عرض تلقائي"}
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
