import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, ArrowsClockwise, Check, Eye } from "@phosphor-icons/react";
import { noDot } from "../lib/utils";
import { playCorrect, playWin, playTick, playAlarm, playUnlock } from "../lib/sound";
import { CompetitorBoard } from "./CompetitorBoard";

export type ChallengeType = "quizRace" | "predict" | "sort" | "order" | "budget" | "timer" | "map" | "xo";

export interface ChallengeContent {
  quiz?: { q: string; a: string }[];
  predict?: { prompt: string; options: string[] }[];
  sort?: { groups: { id: string; label: string; emoji?: string }[]; items: { label: string; group: string }[] };
  order?: { instruction: string; steps: string[] };
  budget?: { total: number; unit: string; items: { label: string; cost: number; essential?: boolean }[]; emergencies: string[] };
  timer?: { seconds: number; criteria: string[]; prompts?: string[] };
  map?: { title: string; regions: { label: string; q: string; a: string }[] };
  xo?: { xName?: string; oName?: string };
}

interface Pal { accent: string; accentSoft: string; deep: string; }

/* ————— محرّك سؤال بالنقاط ————— */
function QuizRace({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const qs = content.quiz ?? [];
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const done = i >= qs.length;

  function next() { if (i + 1 >= qs.length) { setI(qs.length); playWin(); } else { setI(i + 1); setRevealed(false); } }

  return (
    <div className="h-full overflow-y-auto">
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 py-6 text-center">
      {!done ? (
        <>
          <span className="text-sm" style={{ color: pal.accentSoft }}>سؤال {i + 1} / {qs.length}</span>
          <AnimatePresence mode="wait">
            <motion.p key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl font-display text-3xl leading-snug text-white sm:text-4xl">{noDot(qs[i].q)}</motion.p>
          </AnimatePresence>
          <AnimatePresence>
            {revealed && <motion.p initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl border-2 px-6 py-3 text-2xl font-bold" style={{ borderColor: pal.accent, color: pal.accent, background: pal.deep }}>{noDot(qs[i].a)}</motion.p>}
          </AnimatePresence>
          <div className="flex gap-3">
            {!revealed
              ? <button onClick={() => { setRevealed(true); playUnlock(); }} className="flex items-center gap-2 rounded-full px-6 py-3 font-bold text-black" style={{ background: pal.accent }}><Eye weight="fill" className="h-5 w-5" /> اكشف الجواب</button>
              : <button onClick={next} className="rounded-full px-8 py-3 font-bold text-black" style={{ background: pal.accent }}>السؤال التالي</button>}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">✅</div>
          <h3 className="font-display text-2xl" style={{ color: pal.accent }}>انتهت الأسئلة، أعلن الفائز من اللوحة</h3>
          <button onClick={() => { setI(0); setRevealed(false); }} className="rounded-full px-6 py-2.5 font-bold text-black" style={{ background: pal.accent }}>أعد الأسئلة</button>
        </div>
      )}
      {/* لوحة التنافس: خطوة اختيار الفصل + أفراد/مجموعات/فصول + النقاط والفائز */}
      <CompetitorBoard pal={{ accent: pal.accent, accentSoft: pal.accentSoft }} />
    </div>
    </div>
  );
}

/* ————— محرّك التوقّع/التصويت ————— */
function Predict({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const items = content.predict ?? [];
  const [i, setI] = useState(0);
  const [votes, setVotes] = useState<number[]>([]);
  const cur = items[i];
  useEffect(() => { setVotes(new Array(cur?.options.length ?? 0).fill(0)); }, [i]);
  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-sm" style={{ color: pal.accentSoft }}>موقف {i + 1} / {items.length}</span>
      <p className="max-w-2xl font-display text-2xl leading-snug text-white sm:text-3xl">{noDot(cur?.prompt ?? "")}</p>
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {cur?.options.map((o, k) => {
          const pct = totalVotes ? Math.round((votes[k] / totalVotes) * 100) : 0;
          return (
            <button key={o} onClick={() => { setVotes((v) => v.map((x, j) => (j === k ? x + 1 : x))); playTick(); }} className="relative overflow-hidden rounded-2xl border-2 p-4 text-white transition-transform hover:scale-[1.03]" style={{ borderColor: `${pal.accent}66`, background: pal.deep }}>
              <div className="absolute inset-0 origin-bottom" style={{ background: `${pal.accent}33`, height: `${pct}%`, top: "auto" }} />
              <span className="relative z-10 block font-semibold">{noDot(o)}</span>
              <span className="relative z-10 mt-1 block font-display text-xl" style={{ color: pal.accent }}>{votes[k]}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm" style={{ color: pal.accentSoft }}>اضغط الخيار مع كل صوت من الفصل، ثم ناقشوا: لماذا؟</p>
      <button onClick={() => setI((v) => (v + 1) % items.length)} className="rounded-full px-8 py-3 font-bold text-black" style={{ background: pal.accent }}>الموقف التالي</button>
    </div>
  );
}

/* ————— محرّك التصنيف ————— */
function Sort({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const s = content.sort!;
  const [remaining, setRemaining] = useState(s.items);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const cur = remaining[0];
  const done = remaining.length === 0;

  function place(groupId: string) {
    if (!cur) return;
    if (cur.group === groupId) { setScore((v) => v + 1); setRemaining((v) => v.slice(1)); setWrong(null); playCorrect(); if (remaining.length === 1) playWin(); }
    else { setWrong(groupId); playAlarm(); setTimeout(() => setWrong(null), 500); }
  }

  if (done) return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
      <div className="text-7xl">✅</div>
      <h3 className="font-display text-3xl" style={{ color: pal.accent }}>أحسنتم! صنّفتم الجميع</h3>
      <button onClick={() => { setRemaining(s.items); setScore(0); }} className="rounded-full px-6 py-3 font-bold text-black" style={{ background: pal.accent }}>أعد التصنيف</button>
    </div>
  );
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 text-center">
      <span className="text-sm" style={{ color: pal.accentSoft }}>بقي {remaining.length} · نقاط {score}</span>
      <AnimatePresence mode="wait">
        <motion.div key={cur.label} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.3, opacity: 0 }} className="rounded-2xl border-2 px-10 py-8" style={{ borderColor: pal.accent, background: pal.deep }}>
          <span className="font-display text-3xl text-white">{noDot(cur.label)}</span>
        </motion.div>
      </AnimatePresence>
      <div className="flex flex-wrap justify-center gap-3">
        {s.groups.map((g) => (
          <motion.button key={g.id} animate={wrong === g.id ? { x: [0, -8, 8, 0] } : {}} onClick={() => place(g.id)} className="rounded-2xl border-2 px-6 py-4 font-semibold text-white" style={{ borderColor: `${pal.accent}66`, background: pal.deep }}>
            {g.emoji && <span className="ml-1 text-xl">{g.emoji}</span>}{noDot(g.label)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ————— محرّك الترتيب ————— */
function Order({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const o = content.order!;
  const shuffled = useMemo(() => o.steps.map((s, idx) => ({ s, idx })).sort((a, b) => ((a.idx * 7) % o.steps.length) - ((b.idx * 5) % o.steps.length)), [o]);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const correct = picked.every((p, k) => p === k);

  function tap(idx: number) { if (picked.includes(idx) || checked) return; setPicked((v) => [...v, idx]); playTick(); }
  function check() { setChecked(true); if (picked.every((p, k) => p === k) && picked.length === o.steps.length) playWin(); else playAlarm(); }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="max-w-2xl font-display text-2xl text-white">{noDot(o.instruction)}</p>
      {/* التسلسل المبني */}
      <div className="flex min-h-[3rem] w-full max-w-2xl flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3" style={{ borderColor: `${pal.accent}55` }}>
        {picked.length === 0 && <span className="text-sm" style={{ color: pal.accentSoft }}>اضغط الخطوات بالترتيب الصحيح</span>}
        {picked.map((p, k) => (
          <span key={p} className="rounded-full px-3 py-1.5 text-sm font-semibold text-white" style={{ background: checked ? (p === k ? "#22c55e" : "#ef4444") : `${pal.accent}55` }}>{k + 1}. {noDot(o.steps[p])}</span>
        ))}
      </div>
      {/* الخيارات */}
      <div className="flex flex-wrap justify-center gap-2">
        {shuffled.map(({ idx }) => (
          <button key={idx} disabled={picked.includes(idx)} onClick={() => tap(idx)} className="rounded-xl border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-30" style={{ borderColor: `${pal.accent}66`, background: pal.deep }}>{noDot(o.steps[idx])}</button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => { setPicked([]); setChecked(false); }} className="rounded-full border px-5 py-2.5 font-semibold text-white" style={{ borderColor: `${pal.accent}66` }}>إعادة</button>
        <button onClick={check} disabled={picked.length !== o.steps.length} className="flex items-center gap-2 rounded-full px-6 py-2.5 font-bold text-black disabled:opacity-40" style={{ background: pal.accent }}><Check weight="bold" className="h-5 w-5" /> تحقّق</button>
      </div>
      {checked && <p className="font-display text-xl" style={{ color: correct ? "#22c55e" : "#ef4444" }}>{correct ? "ترتيب صحيح! 🎉" : "راجعوا الترتيب وحاولوا مجددًا"}</p>}
    </div>
  );
}

/* ————— محرّك الميزانية ————— */
function Budget({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const b = content.budget!;
  const [cart, setCart] = useState<string[]>([]);
  const [emergency, setEmergency] = useState<string | null>(null);
  const spent = b.items.filter((it) => cart.includes(it.label)).reduce((s, it) => s + it.cost, 0);
  const remaining = b.total - spent;
  const savedEnough = remaining >= b.total * 0.15;
  const gotEssentials = b.items.filter((it) => it.essential).every((it) => cart.includes(it.label));

  function toggle(label: string, cost: number) {
    if (cart.includes(label)) setCart((v) => v.filter((x) => x !== label));
    else if (cost <= remaining) { setCart((v) => [...v, label]); playTick(); }
    else playAlarm();
  }
  function finish() { setEmergency(b.emergencies[Math.floor((cart.length * 3) % b.emergencies.length)]); (savedEnough || gotEssentials) ? playWin() : playAlarm(); }

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto px-5 py-6">
      <div className="flex items-center gap-4">
        <span className="text-sm" style={{ color: pal.accentSoft }}>المتبقّي</span>
        <span className="font-display text-4xl tabular-nums" style={{ color: remaining < 0 ? "#ef4444" : pal.accent }}>{remaining} <span className="text-lg">{b.unit}</span></span>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3">
        {b.items.map((it) => {
          const on = cart.includes(it.label);
          return (
            <button key={it.label} onClick={() => toggle(it.label, it.cost)} className="rounded-xl border-2 p-3 text-white transition-transform hover:scale-[1.02]" style={{ borderColor: on ? pal.accent : `${pal.accent}44`, background: on ? `${pal.accent}22` : pal.deep }}>
              <span className="block text-sm font-semibold">{noDot(it.label)}{it.essential && <span className="mr-1 text-[10px]" style={{ color: pal.accentSoft }}> (أساسي)</span>}</span>
              <span className="mt-1 block font-display" style={{ color: pal.accent }}>{it.cost} {b.unit}</span>
            </button>
          );
        })}
      </div>
      <button onClick={finish} className="rounded-full px-8 py-3 font-bold text-black" style={{ background: pal.accent }}>أنهِ التوزيع</button>
      <AnimatePresence>
        {emergency && (
          <motion.div initial={{ y: 30, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} className="max-w-md rounded-2xl border-2 p-5 text-center" style={{ borderColor: savedEnough || gotEssentials ? "#22c55e" : "#ef4444", background: pal.deep }}>
            <p className="text-sm" style={{ color: pal.accentSoft }}>⚡ طارئ مفاجئ</p>
            <p className="mt-1 text-lg font-bold text-white">{noDot(emergency)}</p>
            <p className="mt-3 font-display text-xl" style={{ color: savedEnough || gotEssentials ? "#22c55e" : "#ef4444" }}>
              {savedEnough ? "ادّخارك أنقذك! 🎉" : gotEssentials ? "غطّيت الأساسيات، بالكاد نجوت" : "انهار توزيعك، لا ادّخار ولا أساسيات"}
            </p>
            <button onClick={() => { setEmergency(null); setCart([]); }} className="mt-3 rounded-full px-5 py-2 font-semibold text-black" style={{ background: pal.accent }}>أعد المحاولة</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ————— محرّك المؤقّت والتحكيم ————— */
function TimerJudge({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const t = content.timer!;
  const [left, setLeft] = useState(t.seconds);
  const [running, setRunning] = useState(false);
  const ended = left <= 0;
  const urgent = left <= t.seconds * 0.2 && left > 0;
  useEffect(() => { if (!running || left <= 0) return; const id = setInterval(() => setLeft((v) => v - 1), 1000); return () => clearInterval(id); }, [running, left]);
  useEffect(() => { if (ended && running) { setRunning(false); playWin(); } }, [ended, running]);
  useEffect(() => { if (urgent) playTick(true); }, [Math.max(0, left)]);
  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");
  return (
    <div className="h-full overflow-y-auto">
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-6">
      {t.prompts && <p className="max-w-xl text-center" style={{ color: pal.accentSoft }}>{noDot(t.prompts[Math.floor((t.seconds - left) / 6) % t.prompts.length])}</p>}
      <motion.div animate={urgent ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }} className="shrink-0 font-display tabular-nums leading-none" style={{ fontSize: "min(18vh, 8rem)", color: ended ? "#22c55e" : urgent ? "#ef4444" : pal.accent }} dir="ltr">{mm}:{ss}</motion.div>
      <div className="flex gap-3">
        <button onClick={() => setRunning((v) => !v)} className="flex items-center gap-2 rounded-full px-6 py-3 font-bold text-black" style={{ background: pal.accent }}>{running ? <><Pause weight="fill" className="h-5 w-5" /> إيقاف</> : <><Play weight="fill" className="h-5 w-5" /> بدء</>}</button>
        <button onClick={() => { setLeft(t.seconds); setRunning(false); }} className="flex items-center gap-2 rounded-full border px-5 py-3 font-semibold text-white" style={{ borderColor: `${pal.accent}66` }}><ArrowsClockwise className="h-5 w-5" /> إعادة</button>
      </div>
      <p className="text-xs" style={{ color: pal.accentSoft }}>معايير التحكيم: {t.criteria.map(noDot).join(" · ")}</p>
      <CompetitorBoard pal={{ accent: pal.accent, accentSoft: pal.accentSoft }} />
    </div>
    </div>
  );
}

/* ————— محرّك الخريطة/المناطق ————— */
function MapGrid({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const m = content.map!;
  const [active, setActive] = useState<number | null>(null);
  const [lit, setLit] = useState<boolean[]>(m.regions.map(() => false));
  const [revealed, setRevealed] = useState(false);
  const allLit = lit.every(Boolean);
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-display text-2xl text-white">{noDot(m.title)}</p>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
        {m.regions.map((r, k) => (
          <button key={r.label} onClick={() => { setActive(k); setRevealed(false); }} className="rounded-2xl border-2 p-4 font-semibold text-white transition-transform hover:scale-[1.03]" style={{ borderColor: lit[k] ? "#22c55e" : `${pal.accent}55`, background: lit[k] ? "#22c55e22" : pal.deep }}>{r.label}</button>
        ))}
      </div>
      <AnimatePresence>
        {active !== null && (
          <motion.div key={active} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-lg rounded-2xl border-2 px-6 py-4" style={{ borderColor: pal.accent, background: pal.deep }}>
            <p className="text-lg font-semibold text-white">{noDot(m.regions[active].q)}</p>
            {revealed
              ? <><p className="mt-2 text-xl font-bold" style={{ color: pal.accent }}>{noDot(m.regions[active].a)}</p>
                  <button onClick={() => { setLit((v) => v.map((x, j) => (j === active ? true : x))); setActive(null); playCorrect(); }} className="mt-3 rounded-full px-5 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>أضئ المنطقة ✓</button></>
              : <button onClick={() => { setRevealed(true); playUnlock(); }} className="mt-3 rounded-full px-5 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>اكشف الجواب</button>}
          </motion.div>
        )}
      </AnimatePresence>
      {allLit && <p className="font-display text-2xl" style={{ color: "#22c55e" }}>أضأتم كل المناطق! 🎉</p>}
    </div>
  );
}

/* ————— لعبة إكس-أو (XO) تفاعلية بلوحة كاملة ————— */
const XO_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function TicTacToe({ content, pal }: { content: ChallengeContent; pal: Pal }) {
  const xName = noDot(content.xo?.xName ?? "الفريق ✕");
  const oName = noDot(content.xo?.oName ?? "الفريق ◯");
  const [cells, setCells] = useState<("X" | "O" | null)[]>(() => Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [scores, setScores] = useState({ X: 0, O: 0, d: 0 });
  const [starter, setStarter] = useState<"X" | "O">("X");

  const winLine = XO_LINES.find((l) => cells[l[0]] && cells[l[0]] === cells[l[1]] && cells[l[1]] === cells[l[2]]);
  const winner = winLine ? cells[winLine[0]] : null;
  const filled = cells.every(Boolean);
  const over = !!winner || filled;

  useEffect(() => {
    if (winner) { setScores((s) => (winner === "X" ? { ...s, X: s.X + 1 } : { ...s, O: s.O + 1 })); playWin(); }
    else if (filled) { setScores((s) => ({ ...s, d: s.d + 1 })); playAlarm(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  function place(i: number) {
    if (cells[i] || over) return;
    setCells((c) => c.map((v, j) => (j === i ? turn : v)));
    setTurn((t) => (t === "X" ? "O" : "X"));
    playCorrect();
  }
  function newRound() {
    const next = starter === "X" ? "O" : "X";
    setStarter(next); setTurn(next); setCells(Array(9).fill(null));
  }
  function resetAll() { setScores({ X: 0, O: 0, d: 0 }); setStarter("X"); setTurn("X"); setCells(Array(9).fill(null)); }

  const xColor = "#38bdf8", oColor = "#fb7185";

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 py-6 text-center">
      {/* لوحة النتائج */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center" style={{ opacity: turn === "X" && !over ? 1 : 0.55 }}>
          <span className="font-display text-lg" style={{ color: xColor }}>✕ {xName}</span>
          <span className="font-display text-3xl" style={{ color: xColor }}>{scores.X}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs" style={{ color: pal.accentSoft }}>تعادل</span>
          <span className="font-display text-2xl text-white">{scores.d}</span>
        </div>
        <div className="flex flex-col items-center" style={{ opacity: turn === "O" && !over ? 1 : 0.55 }}>
          <span className="font-display text-lg" style={{ color: oColor }}>◯ {oName}</span>
          <span className="font-display text-3xl" style={{ color: oColor }}>{scores.O}</span>
        </div>
      </div>

      {/* حالة الدور/الفوز */}
      <div className="min-h-[2rem]">
        {over ? (
          <motion.p initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-2xl" style={{ color: winner ? (winner === "X" ? xColor : oColor) : pal.accent }}>
            {winner ? `🎉 فاز ${winner === "X" ? xName : oName}` : "🤝 تعادل"}
          </motion.p>
        ) : (
          <p className="font-display text-xl" style={{ color: turn === "X" ? xColor : oColor }}>دور {turn === "X" ? xName : oName} {turn === "X" ? "✕" : "◯"}</p>
        )}
      </div>

      {/* اللوحة */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {cells.map((v, i) => {
          const inWin = winLine?.includes(i);
          return (
            <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => place(i)} disabled={!!v || over}
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 font-display text-5xl sm:h-28 sm:w-28 sm:text-6xl"
              style={{
                borderColor: inWin ? "#22c55e" : `${pal.accent}44`,
                background: inWin ? "#22c55e22" : pal.deep,
                color: v === "X" ? xColor : v === "O" ? oColor : "transparent",
                boxShadow: inWin ? "0 0 24px #22c55e" : "none",
              }}>
              {v === "X" ? "✕" : v === "O" ? "◯" : ""}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={newRound} className="rounded-full px-6 py-2.5 font-bold text-black" style={{ background: pal.accent }}>جولة جديدة</button>
        <button onClick={resetAll} className="rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ borderColor: `${pal.accent}66`, color: "#fff" }}>صفّر النتائج</button>
      </div>
    </div>
  );
}

const ENGINES: Record<ChallengeType, (p: { content: ChallengeContent; pal: Pal }) => React.ReactElement> = {
  quizRace: QuizRace, predict: Predict, sort: Sort, order: Order, budget: Budget, timer: TimerJudge, map: MapGrid, xo: TicTacToe,
};

export function ChallengePlayer({ title, type, content, pal, onClose }: { title: string; type: ChallengeType; content: ChallengeContent; pal: Pal; onClose: () => void }) {
  const Engine = ENGINES[type];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex flex-col" style={{ background: `radial-gradient(ellipse at 50% 0%, ${pal.deep} 0%, #050505 75%)` }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${pal.accent}22` }}>
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-white/70"><X className="h-5 w-5" /> خروج</button>
        <span className="font-display text-white">{noDot(title)}</span>
        <span className="w-16" />
      </div>
      <div className="relative flex-1 overflow-y-auto">
        <Engine content={content} pal={pal} />
      </div>
    </motion.div>
  );
}
