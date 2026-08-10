import { motion } from "framer-motion";
import { CaretLeft } from "@phosphor-icons/react";
import { SaduPattern, DiamondRule } from "../../activities/ActivityShell";
import { noDot } from "../../lib/utils";
import type { BreakWeek } from "../../data/breakPeriods";
import type { WeekTheme } from "../../lib/weekTheme";

const EASE = [0.32, 0.72, 0, 1] as const;

/** إيماءات بصرية تعبّر عن نشاط الأسبوع. */
function motifsFor(theme: WeekTheme) {
  // إيماءات توحي بموضوع الأسبوع (نتجنّب علم الدولة لأنه يظهر «SA» على ويندوز).
  switch (theme.decor) {
    case "national":
      return ["💚", "🌴", "⭐", "🏅"];
    case "media":
      return ["🎤", "📷", "📺", "⭐"];
    case "cyber":
      return ["🛡️", "🔒", "💻", "⭐"];
    case "space":
      return ["🚀", "🪐", "⭐", "🌙"];
    default:
      return ["🎒", "✏️", "⭐", "🎉"];
  }
}

/**
 * بوابة الأسبوع: نشاط الأسبوع كبير في الوسط بإيماءات المناسبة وترحيب،
 * وزر «يلا نبدأ» يفتح المحتوى بحركة ديناميكية.
 */
export function WeekIntro({
  week,
  teacherName,
  theme,
  accentBg,
  onStart,
}: {
  week: BreakWeek;
  teacherName: string;
  theme: WeekTheme;
  accentBg: string;
  onStart: () => void;
}) {
  const motifs = motifsFor(theme);
  const line = (delay: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, y: -30 }}
      transition={{ duration: 0.32, ease: EASE }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-bg/20 via-transparent to-bg/55 px-4 text-center"
    >
      <div className="relative w-full max-w-2xl">
        <SaduPattern className="pointer-events-none absolute -inset-x-10 -top-16 h-40 opacity-[0.12]" />

        {/* إيماءات المناسبة تطفو حول العنوان */}
        <div className="mb-6 flex items-center justify-center gap-5 text-4xl sm:text-5xl">
          {motifs.map((m, i) => (
            <motion.span
              key={m}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.2 + i * 0.12 },
                scale: { duration: 0.5, delay: 0.2 + i * 0.12, ease: EASE },
                y: { duration: 2.6 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: 0.6 + i * 0.15 },
              }}
            >
              {m}
            </motion.span>
          ))}
        </div>

        <motion.p {...line(0.15)} className="text-lg text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">
          أهلًا {teacherName || "معلم النشاط"} 👋
        </motion.p>

        <motion.span
          {...line(0.28)}
          className="mt-4 inline-block rounded-full bg-black/25 px-5 py-1.5 text-base font-semibold text-white backdrop-blur-sm"
        >
          الأسبوع {week.week}
        </motion.span>

        <motion.h1
          {...line(0.4)}
          className="mt-4 font-display text-4xl leading-tight text-white [text-shadow:0_3px_24px_rgba(0,0,0,0.9)] sm:text-6xl"
        >
          {week.occasion ? noDot(week.occasion) : "أنشطة الأسبوع"}
        </motion.h1>

        <motion.div {...line(0.5)} className="mx-auto mt-5 w-48">
          <DiamondRule className="w-full opacity-80" />
        </motion.div>

        {week.slogan && (
          <motion.span
            {...line(0.58)}
            className="mt-5 inline-block rounded-full px-6 py-2 text-lg font-bold sm:text-xl"
            style={{ backgroundColor: `${theme.accent}e6`, color: theme.bannerInk }}
          >
            {noDot(week.slogan)}
          </motion.span>
        )}

        <motion.p {...line(0.7)} className="mt-6 text-base text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.8)] sm:text-lg">
          أسبوعك جاهز — {week.corners.length} أركان تنتظر طلابك
        </motion.p>

        <motion.button
          type="button"
          onClick={onStart}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className={`mt-10 inline-flex items-center gap-3 rounded-full px-10 py-4 text-lg font-bold text-bg shadow-2xl ${accentBg}`}
        >
          <motion.span
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3"
          >
            يلا نبدأ 🎉
            <CaretLeft weight="bold" className="h-6 w-6" />
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}
