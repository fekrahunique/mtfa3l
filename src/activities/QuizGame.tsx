import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, CaretLeft, Trophy, ArrowCounterClockwise, Flag, Tree } from "@phosphor-icons/react";
import { ActivityShell, Celebration, ND } from "./ActivityShell";

const EASE = [0.32, 0.72, 0, 1] as const;

export interface QuizItem {
  question: string;
  answer: string;
}

const TEAMS = [
  { id: "flag", name: "فريق العلم", icon: Flag, color: ND.leaf },
  { id: "palm", name: "فريق النخلة", icon: Tree, color: ND.gold },
] as const;

type TeamId = (typeof TEAMS)[number]["id"];

function ScorePanel({
  team,
  score,
  onAward,
  disabled,
}: {
  team: (typeof TEAMS)[number];
  score: number;
  onAward: () => void;
  disabled: boolean;
}) {
  const Icon = team.icon;
  return (
    <button
      type="button"
      onClick={onAward}
      disabled={disabled}
      className="flex flex-1 flex-col items-center gap-2 rounded-3xl border-2 px-4 py-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] enabled:hover:scale-[1.03] enabled:active:scale-95 disabled:opacity-45"
      style={{ borderColor: `${team.color}66`, backgroundColor: `${team.color}14` }}
    >
      <Icon weight="fill" className="h-6 w-6" style={{ color: team.color }} />
      <span className="text-sm font-semibold sm:text-base" style={{ color: ND.cream }}>
        {team.name}
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
      {!disabled && (
        <span className="text-xs" style={{ color: `${ND.cream}99` }}>
          امنح نقطة
        </span>
      )}
    </button>
  );
}

export function QuizGame({ items, onExit }: { items: QuizItem[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<Record<TeamId, number>>({ flag: 0, palm: 0 });
  const [finished, setFinished] = useState(false);

  const current = items[index];
  const isLast = index === items.length - 1;

  function award(team: TeamId) {
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
    setScores({ flag: 0, palm: 0 });
    setFinished(false);
  }

  const winner =
    scores.flag === scores.palm ? null : scores.flag > scores.palm ? TEAMS[0] : TEAMS[1];

  return (
    <ActivityShell
      title="سؤال وجواب عن الوطن"
      subtitle={finished ? "انتهى التحدي" : `السؤال ${index + 1} من ${items.length}`}
      onExit={onExit}
      footer={
        !finished ? (
          <div className="flex items-center gap-1.5" dir="ltr">
            {items.map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors duration-500"
                style={{ backgroundColor: i <= index ? ND.leaf : `${ND.cream}22` }}
              />
            ))}
          </div>
        ) : undefined
      }
    >
      {finished ? (
        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          <Celebration show />
          <Trophy weight="fill" className="h-16 w-16" style={{ color: ND.gold }} />
          <h3 className="mt-5 font-display text-4xl sm:text-6xl" style={{ color: ND.cream }}>
            {winner ? winner.name : "تعادل مشرّف"}
          </h3>
          <p className="mt-3 text-lg" style={{ color: ND.leaf }}>
            {scores.flag} — {scores.palm}
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-9 flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
            style={{ backgroundColor: ND.leaf, color: ND.deep }}
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
                style={{ borderColor: `${ND.leaf}55`, backgroundColor: `${ND.mid}cc` }}
              >
                <span
                  className="inline-block rounded-full px-4 py-1 text-sm font-semibold"
                  style={{ backgroundColor: `${ND.gold}22`, color: ND.gold }}
                >
                  سؤال {index + 1}
                </span>

                <p
                  className="mt-6 font-display text-3xl leading-snug sm:text-5xl"
                  style={{ color: ND.cream }}
                >
                  {current.question}
                </p>

                <AnimatePresence>
                  {revealed && (
                    <motion.p
                      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="mt-7 text-2xl sm:text-3xl"
                      style={{ color: ND.leaf }}
                    >
                      {current.answer}
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
                style={{ backgroundColor: ND.leaf, color: ND.deep }}
              >
                <Eye weight="bold" className="h-5 w-5" />
                اكشف الإجابة
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm" style={{ color: `${ND.cream}99` }}>
                من أجاب إجابة صحيحة؟
              </p>
              <div className="flex gap-3">
                {TEAMS.map((team) => (
                  <ScorePanel
                    key={team.id}
                    team={team}
                    score={scores[team.id]}
                    onAward={() => award(team.id)}
                    disabled={false}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                className="mx-auto flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-transform duration-500 hover:scale-105 active:scale-95"
                style={{ borderColor: `${ND.cream}33`, color: ND.cream }}
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
