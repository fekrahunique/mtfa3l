import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, CaretLeft, Trophy, ArrowCounterClockwise, UsersThree } from "@phosphor-icons/react";
import { ActivityShell, Celebration } from "./ActivityShell";
import { noDot } from "../lib/utils";
import { playCorrect, playWin } from "../lib/sound";
import type { WeekTheme } from "../lib/weekTheme";

const EASE = [0.32, 0.72, 0, 1] as const;

export interface QuizItem {
  question: string;
  answer: string;
}

const TEAMS = [
  { id: "blue", name: "الفريق الأزرق", color: "#3b82f6" },
  { id: "green", name: "الفريق الأخضر", color: "#22c55e" },
] as const;

type TeamId = (typeof TEAMS)[number]["id"];

function ScorePanel({
  team,
  name,
  score,
  onAward,
  ink,
}: {
  team: (typeof TEAMS)[number];
  name: string;
  score: number;
  onAward: () => void;
  ink: string;
}) {
  return (
    <button
      type="button"
      onClick={onAward}
      className="flex flex-1 flex-col items-center gap-2 rounded-3xl border-2 px-4 py-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-95"
      style={{ borderColor: `${team.color}66`, backgroundColor: `${team.color}1a` }}
    >
      <UsersThree weight="fill" className="h-6 w-6" style={{ color: team.color }} />
      <span className="text-sm font-semibold sm:text-base" style={{ color: ink }}>
        {name}
      </span>
      <motion.span
        key={score}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="text-4xl font-bold sm:text-5xl"
        style={{ color: team.color }}
      >
        {score}
      </motion.span>
      <span className="text-xs" style={{ color: `${ink}99` }}>
        امنح نقطة
      </span>
    </button>
  );
}

export function QuizGame({
  items,
  title,
  theme,
  onExit,
}: {
  items: QuizItem[];
  title: string;
  theme: WeekTheme;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<Record<TeamId, number>>({ blue: 0, green: 0 });
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [teamNames, setTeamNames] = useState<Record<TeamId, string>>({
    blue: "الفريق الأزرق",
    green: "الفريق الأخضر",
  });

  // ألوان المسابقة تتبع ثيم موضوع الأسبوع.
  const pal = {
    deep: theme.banner,
    ink: theme.bannerInk,
    accent: theme.accentSoft,
    gold: "#E8C05A",
  };

  const current = items[index];
  const isLast = index === items.length - 1;

  function award(team: TeamId) {
    playCorrect();
    setScores((prev) => ({ ...prev, [team]: prev[team] + 1 }));
    next();
  }

  function next() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setRevealed(false);
    setScores({ blue: 0, green: 0 });
    setFinished(false);
  }

  const winner =
    scores.blue === scores.green ? null : scores.blue > scores.green ? TEAMS[0] : TEAMS[1];

  useEffect(() => {
    if (finished && winner) playWin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  return (
    <ActivityShell
      title={title}
      subtitle={!started ? "تهيئة الفريقين" : finished ? "انتهى التحدي" : `السؤال ${index + 1} من ${items.length}`}
      onExit={onExit}
      palette={{ deep: pal.deep, ink: pal.ink, accent: pal.accent, gold: pal.gold }}
      footer={
        started && !finished ? (
          <div className="flex items-center gap-1.5" dir="ltr">
            {items.map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors duration-500"
                style={{ backgroundColor: i <= index ? pal.accent : `${pal.ink}22` }}
              />
            ))}
          </div>
        ) : undefined
      }
    >
      {!started ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
          <div>
            <h3 className="font-display text-3xl sm:text-4xl" style={{ color: pal.ink }}>
              جهّزوا الفريقين!
            </h3>
            <p className="mt-2 text-base" style={{ color: `${pal.ink}99` }}>
              سمّوا كل فريق (أو وزّعوا الطلاب)، ثم ابدأوا التحدي
            </p>
          </div>
          <div className="flex w-full max-w-xl flex-col gap-4 sm:flex-row">
            {TEAMS.map((team) => (
              <div
                key={team.id}
                className="flex flex-1 flex-col items-center gap-3 rounded-3xl border-2 p-5"
                style={{ borderColor: `${team.color}66`, backgroundColor: `${team.color}1a` }}
              >
                <UsersThree weight="fill" className="h-9 w-9" style={{ color: team.color }} />
                <input
                  value={teamNames[team.id]}
                  onChange={(e) => setTeamNames((prev) => ({ ...prev, [team.id]: e.target.value }))}
                  maxLength={24}
                  aria-label="اسم الفريق"
                  className="w-full rounded-xl border-2 bg-transparent px-3 py-2 text-center text-base font-semibold outline-none"
                  style={{ borderColor: `${team.color}66`, color: pal.ink }}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="flex items-center gap-2 rounded-full px-9 py-4 text-lg font-bold transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
            style={{ backgroundColor: pal.accent, color: pal.deep }}
          >
            ابدأ التحدي 🚀
          </button>
        </div>
      ) : finished ? (
        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          <Celebration show colors={[pal.accent, pal.gold, pal.ink, theme.accent]} />
          <Trophy weight="fill" className="h-16 w-16" style={{ color: pal.gold }} />
          <motion.h3
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="mt-5 font-display text-4xl sm:text-6xl"
            style={{ color: pal.ink, textShadow: `0 0 30px ${pal.accent}` }}
          >
            {winner ? teamNames[winner.id] : "تعادل مشرّف"}
          </motion.h3>
          <p className="mt-3 text-lg" style={{ color: pal.accent }}>
            {scores.blue} — {scores.green}
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-9 flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
            style={{ backgroundColor: pal.accent, color: pal.deep }}
          >
            <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
            جولة جديدة
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-6">
          <div className="flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.98 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="w-full max-w-3xl rounded-3xl border-2 px-6 py-10 text-center sm:px-12 sm:py-14"
                style={{ borderColor: `${pal.accent}55`, backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <span
                  className="inline-block rounded-full px-4 py-1 text-sm font-semibold"
                  style={{ backgroundColor: `${pal.gold}22`, color: pal.gold }}
                >
                  سؤال {index + 1}
                </span>

                <p className="mt-6 font-display text-3xl leading-snug sm:text-5xl" style={{ color: pal.ink }}>
                  {noDot(current.question)}
                </p>

                <AnimatePresence>
                  {revealed && (
                    <motion.p
                      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="mt-7 text-2xl sm:text-3xl"
                      style={{ color: pal.accent }}
                    >
                      {noDot(current.answer)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>

          {!revealed ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
                style={{ backgroundColor: pal.accent, color: pal.deep }}
              >
                <Eye weight="bold" className="h-5 w-5" />
                اكشف الإجابة
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm" style={{ color: `${pal.ink}99` }}>
                من أجاب إجابة صحيحة؟
              </p>
              <div className="flex gap-3">
                {TEAMS.map((team) => (
                  <ScorePanel
                    key={team.id}
                    team={team}
                    name={teamNames[team.id]}
                    score={scores[team.id]}
                    onAward={() => award(team.id)}
                    ink={pal.ink}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                className="mx-auto flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-transform duration-500 hover:scale-105 active:scale-95"
                style={{ borderColor: `${pal.ink}33`, color: pal.ink }}
              >
                {isLast ? "أنهِ التحدي" : "تخطَّ بلا نقطة"}
                <CaretLeft weight="bold" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </ActivityShell>
  );
}
