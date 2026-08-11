import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CaretLeft, Play, Pause, ArrowsClockwise, Crown } from "@phosphor-icons/react";
import { reducer, initState, pickChallenge, rewardFor, standings, type GameState, type Action, type Team } from "../lib/bigGameEngine";
import { TYPE_META, EVENTS, DURATIONS, AGE_GROUPS, DIFFICULTIES, SIDE_AWARDS } from "../data/bigGame";
import { playWin, playAlarm, playTick, playUnlock, playLaunch, playHeartbeat } from "../lib/sound";

const ar = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const money = (n: number) => ar(n.toLocaleString("en-US"));
const mmss = (s: number) => `${ar(String(Math.floor(s / 60)).padStart(2, "0"))}:${ar(String(s % 60).padStart(2, "0"))}`;

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    x: (i * 37) % 100, delay: (i % 10) * 0.12, hue: (i * 47) % 360, dur: 2.4 + (i % 5) * 0.4,
  })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span key={i} initial={{ y: -40, opacity: 0 }} animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity }}
          className="absolute h-3 w-2 rounded-sm" style={{ left: `${b.x}%`, background: `hsl(${b.hue} 85% 60%)` }} />
      ))}
    </div>
  );
}

function Leaderboard({ teams, activeId }: { teams: Team[]; activeId?: string | null }) {
  const ranked = standings(teams);
  return (
    <div className="flex flex-col gap-2">
      {ranked.map((t, i) => (
        <motion.div key={t.id} layout className="flex items-center gap-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: t.id === activeId ? t.color : "rgba(255,255,255,0.1)", background: t.id === activeId ? `${t.color}22` : "rgba(255,255,255,0.03)" }}>
          <span className="w-6 text-center font-display text-lg text-white/50">{ar(i + 1)}</span>
          <span className="text-2xl">{t.emoji}</span>
          <span className="flex-1 font-display text-lg text-white">{t.name}</span>
          <motion.span key={t.balance} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-display text-xl" style={{ color: t.color }}>💰 {money(t.balance)}</motion.span>
        </motion.div>
      ))}
    </div>
  );
}

/* ————— شاشة الإعداد ————— */
function Setup({ s, dispatch, onExit }: { s: GameState; dispatch: (a: Action) => void; onExit: () => void }) {
  const c = s.config;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <button onClick={onExit} className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white"><CaretLeft className="h-4 w-4" /> خروج</button>
      <div className="text-center">
        <h1 className="font-display text-4xl text-white sm:text-5xl">🏆 بطولة نشاط</h1>
        <p className="mt-2 text-lg text-amber-300">خطّط. خاطر. نافس. اربح</p>
      </div>

      <HowToPlay />

      <div className="mt-8 space-y-6">
        <Field label="الفئة العمرية">
          <select value={c.ageGroup} onChange={(e) => dispatch({ t: "setConfig", patch: { ageGroup: e.target.value } })} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none">
            {AGE_GROUPS.map((g) => <option key={g} value={g} className="bg-[#14141f]">{g}</option>)}
          </select>
        </Field>

        <Field label="مدّة اللعبة">
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <Chip key={m} active={c.minutes === m} onClick={() => dispatch({ t: "setConfig", patch: { minutes: m } })}>{ar(m)} دقيقة</Chip>
            ))}
          </div>
        </Field>

        <Field label="مستوى اللعبة">
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <Chip key={d.id} active={c.difficulty === d.id} onClick={() => dispatch({ t: "setConfig", patch: { difficulty: d.id } })}>
                {d.id === "easy" ? "🟢" : d.id === "medium" ? "🟡" : "🔴"} {d.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={`عدد الفرق: ${ar(s.teams.length)}`}>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Chip key={n} active={s.teams.length === n} onClick={() => dispatch({ t: "setTeamCount", count: n })}>{ar(n)}</Chip>
            ))}
          </div>
        </Field>

        <Field label="الرصيد الابتدائي لكل فريق">
          <div className="flex flex-wrap gap-2">
            {[500, 1000, 1500, 2000].map((b) => (
              <Chip key={b} active={c.startBalance === b} onClick={() => dispatch({ t: "setConfig", patch: { startBalance: b } })}>💰 {money(b)}</Chip>
            ))}
          </div>
        </Field>

        <Field label="الفرق (عدّل الأسماء)">
          <div className="grid gap-2 sm:grid-cols-2">
            {s.teams.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-2xl">{t.emoji}</span>
                <input value={t.name} onChange={(e) => dispatch({ t: "renameTeam", id: t.id, name: e.target.value })} className="w-full bg-transparent text-white outline-none" style={{ color: t.color }} />
              </div>
            ))}
          </div>
        </Field>

        <div className="flex flex-wrap gap-3">
          <Toggle on={c.enableRisk} onClick={() => dispatch({ t: "setConfig", patch: { enableRisk: !c.enableRisk } })}>نظام المخاطرة</Toggle>
          <Toggle on={c.enableEvents} onClick={() => dispatch({ t: "setConfig", patch: { enableEvents: !c.enableEvents } })}>الأحداث المفاجئة</Toggle>
        </div>

        <button onClick={() => { dispatch({ t: "toLobby" }); playUnlock(); }} className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-4 text-lg font-bold text-black transition-transform hover:scale-[1.02] active:scale-95">
          جهّز اللعبة <CaretLeft weight="bold" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** شرح مبسّط للرائد: كيف تُدار البطولة أمام الفصل، قبل أن يبدأ الإعداد. */
function HowToPlay() {
  const steps = [
    { emoji: "🧩", title: "قسّم فصلك فِرَقًا", body: "تختار عدد الفرق (٢ إلى ٨) وتسمّيها، ولكل فريق رصيد يبدأ به السباق" },
    { emoji: "🎯", title: "جولات التحدّي", body: "كل فريق بدوره ينفّذ تحدّياً على الشاشة، وأنت الحَكَم: نجح فيربح رصيداً، أخفق فيخسر جزءاً منه" },
    { emoji: "💥", title: "المخاطرة (اختياري)", body: "قبل التحدّي يراهن الفريق بجزء من رصيده، الجرأة تضاعف الربح لكنها تضاعف الخسارة أيضاً" },
    { emoji: "⚡", title: "أحداث مفاجئة (اختياري)", body: "بضغطة تنقلب الموازين: جولة ذهبية بمكافأة مضاعفة أو مفاجأة تهزّ الترتيب فجأة" },
    { emoji: "🚨", title: "الجولة النهائية", body: "قرب نهاية الوقت كل فريق يقرّر: يحافظ على رصيده بأمان أو يخاطر ليضاعفه بتحدٍّ أخير" },
    { emoji: "👑", title: "التتويج", body: "يُعلَن الترتيب تشويقاً من الأخير إلى الأول، ويُتوَّج صاحب أعلى رصيد بطلاً للبطولة" },
  ];
  return (
    <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5 text-right">
      <p className="font-display text-lg text-amber-200">كيف تُدار البطولة؟</p>
      <p className="mt-1 text-sm text-white/65">أنت تقودها من شاشة العرض، والفرق تتنافس أمامك، إليك الفكرة كاملة في لمحة</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {steps.map((st, i) => (
          <div key={st.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-xl">{st.emoji}</span>
            <div>
              <p className="text-sm font-bold text-white">{ar(i + 1)}. {st.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/65">{st.body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-white/[0.03] px-4 py-2.5 text-center text-xs text-white/60">
        الإعداد ← انطلاق بعدّاد ← جولات وتحدّيات ← الجولة النهائية ← تتويج البطل
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="mb-2 text-sm font-semibold text-white/70">{label}</p>{children}</div>;
}
function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-amber-400 text-black" : "border border-white/15 text-white/80 hover:border-white/30"}`}>{children}</button>;
}
function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${on ? "bg-emerald-400/20 text-emerald-300" : "border border-white/15 text-white/50"}`}>{on ? "✓" : "○"} {children}</button>;
}

/* ————— اللوبي + العدّاد ————— */
function Lobby({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  const [count, setCount] = useState<number | null>(null);
  function begin() {
    setCount(3); playHeartbeat();
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(id); setCount(0); playLaunch(); setTimeout(() => dispatch({ t: "start" }), 700); }
      else { setCount(n); playTick(); }
    }, 900);
  }
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
      {count === null ? (
        <>
          <h1 className="font-display text-4xl text-white">🎮 بطولة نشاط</h1>
          <p className="mt-1 text-white/60">الفرق المشاركة</p>
          <div className="mt-6 w-full space-y-2">
            {s.teams.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border px-5 py-3" style={{ borderColor: `${t.color}66`, background: `${t.color}18` }}>
                <span className="text-3xl">{t.emoji}</span>
                <span className="flex-1 text-right font-display text-xl text-white">{t.name}</span>
                <span className="font-display text-xl" style={{ color: t.color }}>💰 {money(t.balance)}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 font-display text-2xl text-white">هل أنتم مستعدّون؟</p>
          <button onClick={begin} className="mt-4 flex items-center gap-2 rounded-full bg-amber-400 px-10 py-4 text-xl font-bold text-black transition-transform hover:scale-105 active:scale-95">
            🚀 ابدأ اللعبة
          </button>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={count} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="font-display text-white" style={{ fontSize: "22vh" }}>
            {count === 0 ? "🚀" : ar(count)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/* ————— شاشة اللعب ————— */
function Playing({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  const active = s.teams.find((t) => t.id === s.activeTeamId) ?? s.teams[0];
  const lowTime = s.secondsLeft <= 180;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-white/70">الجولة {ar(s.round)}</span>
        <span className={`font-display text-4xl ${lowTime ? "text-red-400" : "text-white"}`}>⏱ {mmss(s.secondsLeft)}</span>
        <button onClick={() => dispatch({ t: s.paused ? "resume" : "pause" })} className="rounded-full border border-white/15 p-2 text-white/70">
          {s.paused ? <Play weight="fill" className="h-5 w-5" /> : <Pause weight="fill" className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-5"><Leaderboard teams={s.teams} activeId={active?.id} /></div>

      <div className="mt-6 rounded-2xl border-2 p-5 text-center" style={{ borderColor: active?.color }}>
        <p className="text-sm text-white/60">دور الفريق</p>
        <p className="font-display text-2xl text-white">{active?.emoji} {active?.name}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button onClick={() => { dispatch({ t: "startChallenge", challenge: pickChallenge(s.config, s.usedChallengeIds) }); playUnlock(); }} className="rounded-full bg-amber-400 px-6 py-2.5 font-bold text-black">🎯 ابدأ التحدّي</button>
          <button onClick={() => { const idx = s.teams.findIndex((t) => t.id === active?.id); dispatch({ t: "pickTeam", id: s.teams[(idx + 1) % s.teams.length].id }); }} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80">بدّل الفريق</button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {s.config.enableEvents && (
          <button onClick={() => { dispatch({ t: "triggerEvent", event: EVENTS[Math.floor(Math.random() * EVENTS.length)] }); playHeartbeat(); }} className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/80">⚡ حدث مفاجئ</button>
        )}
        <button onClick={() => { dispatch({ t: "startFinal" }); playAlarm(); }} className={`rounded-full px-5 py-2 text-sm font-bold ${lowTime ? "bg-red-500 text-white" : "border border-white/15 text-white/80"}`}>🚨 الجولة النهائية</button>
      </div>
      {s.golden && <p className="mt-3 text-center text-sm font-bold text-amber-300">⚡ الجولة الذهبية فعّالة — مكافأة التحدّي القادم ×٢</p>}
    </div>
  );
}

/* ————— شاشة التحدّي ————— */
function Challenge({ s, dispatch, isFinal }: { s: GameState; dispatch: (a: Action) => void; isFinal?: boolean }) {
  const active = s.teams.find((t) => t.id === (isFinal ? s.finalTeamId : s.activeTeamId));
  const ch = s.challenge!;
  const meta = TYPE_META[ch.type];
  const reward = rewardFor(ch, s.config) * (s.golden ? 2 : 1);
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-8 text-center">
      <p className="text-sm text-white/60">{isFinal ? "تحدّي المضاعفة" : "دور"} {active?.emoji} {active?.name}</p>
      <div className="mt-4 rounded-3xl border-2 p-7" style={{ borderColor: active?.color, background: `${active?.color}14` }}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">{meta.emoji} {meta.label}</span>
        <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">{ch.title}</h2>
        <p className="mt-3 text-lg leading-relaxed text-white/85">{ch.instruction}</p>
      </div>

      {!isFinal && s.config.enableRisk && (
        <div className="mt-5">
          <p className="text-sm text-white/60">💥 المخاطرة (اختياري) — راهنوا برصيدكم</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[100, 200, 300, 500].map((b) => (
              <button key={b} onClick={() => { dispatch({ t: "setBet", amount: b }); playTick(); }} className={`rounded-full px-4 py-1.5 text-sm font-bold ${s.bet === b ? "bg-amber-400 text-black" : "border border-white/15 text-white/80"}`}>{money(b)}</button>
            ))}
            <button onClick={() => { dispatch({ t: "setBet", amount: active?.balance ?? 0 }); playTick(); }} className={`rounded-full px-4 py-1.5 text-sm font-bold ${s.bet > 0 && s.bet === active?.balance ? "bg-red-500 text-white" : "border border-red-400/50 text-red-300"}`}>كل الرصيد</button>
            {s.bet > 0 && <button onClick={() => dispatch({ t: "setBet", amount: 0 })} className="rounded-full px-3 py-1.5 text-sm text-white/50">إلغاء</button>}
          </div>
        </div>
      )}

      <p className="mt-5 text-sm text-white/60">
        {s.bet > 0 ? <>عند الفوز <b className="text-emerald-400">+{money(s.bet * (s.golden ? 2 : 1))}</b> · عند الخسارة <b className="text-red-400">-{money(s.bet)}</b></>
          : <>عند الفوز <b className="text-emerald-400">+{money(reward)}</b> · عند الخسارة <b className="text-red-400">-{money(Math.round(rewardFor(ch, s.config) / 2))}</b></>}
      </p>

      <div className="mt-5 flex justify-center gap-4">
        <button onClick={() => { dispatch(isFinal ? { t: "finalJudge", win: true } : { t: "judge", win: true }); playWin(); }} className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white">نجح ✓</button>
        <button onClick={() => { dispatch(isFinal ? { t: "finalJudge", win: false } : { t: "judge", win: false }); playAlarm(); }} className="rounded-full bg-red-500 px-8 py-3 text-lg font-bold text-white">لم ينجح ✗</button>
      </div>
    </div>
  );
}

/* ————— شاشة الحدث ————— */
function EventScreen({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  const e = s.event!;
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <motion.div initial={{ scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} className="text-8xl">{e.emoji}</motion.div>
      <h2 className="mt-4 font-display text-4xl text-white">{e.title}</h2>
      <p className="mt-3 text-lg text-white/85">{e.desc}</p>
      <button onClick={() => { dispatch({ t: "applyEvent" }); playUnlock(); }} className="mt-8 rounded-full bg-amber-400 px-10 py-4 text-lg font-bold text-black">تطبيق</button>
    </div>
  );
}

/* ————— الجولة النهائية ————— */
function Final({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  const allDecided = s.teams.every((t) => s.finalChoices[t.id] != null);
  const pendingDouble = s.teams.filter((t) => s.finalChoices[t.id] === "double" && !s.finalDone.includes(t.id));
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center">
      <motion.h1 initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="font-display text-4xl text-red-400">🚨 الجولة النهائية</motion.h1>
      <p className="mt-2 text-white/70">كل فريق يقرّر: يحافظ على رصيده، أو يضاعفه بتحدٍّ أخير</p>
      <div className="mt-6 space-y-3">
        {s.teams.map((t) => {
          const choice = s.finalChoices[t.id];
          const done = s.finalDone.includes(t.id);
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: `${t.color}66` }}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="font-display text-lg text-white">{t.name}</span>
              <span className="font-display text-lg" style={{ color: t.color }}>💰 {money(t.balance)}</span>
              <div className="mr-auto flex gap-2">
                {done ? <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/60">تمّ</span>
                  : choice === "double" ? (
                    <button onClick={() => { dispatch({ t: "finalStart", id: t.id, challenge: pickChallenge(s.config, s.usedChallengeIds) }); playHeartbeat(); }} className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white">🔥 نفّذ التحدّي</button>
                  ) : (
                    <>
                      <button onClick={() => dispatch({ t: "finalChoice", id: t.id, choice: "keep" })} className={`rounded-full px-4 py-1.5 text-sm font-bold ${choice === "keep" ? "bg-emerald-500 text-white" : "border border-white/15 text-white/80"}`}>🛡️ حافظ</button>
                      <button onClick={() => dispatch({ t: "finalChoice", id: t.id, choice: "double" })} className="rounded-full border border-red-400/50 px-4 py-1.5 text-sm font-bold text-red-300">🔥 ضاعف</button>
                    </>
                  )}
              </div>
            </div>
          );
        })}
      </div>
      {allDecided && pendingDouble.length === 0 && (
        <button onClick={() => { dispatch({ t: "endGame" }); playHeartbeat(); }} className="mt-8 rounded-full bg-amber-400 px-10 py-4 text-lg font-bold text-black">🏆 أعلن النتائج</button>
      )}
    </div>
  );
}

/* ————— شاشة النتائج ————— */
function End({ s, dispatch, onExit }: { s: GameState; dispatch: (a: Action) => void; onExit: () => void }) {
  const ranked = standings(s.teams);
  const shown = ranked.slice(ranked.length - s.revealed);
  const winner = s.revealed >= ranked.length ? ranked[0] : null;
  useEffect(() => { if (winner) { playWin(); } }, [winner?.id]);
  return (
    <div className="relative mx-auto min-h-screen max-w-2xl px-4 py-10 text-center">
      {winner && <Confetti />}
      <h1 className="font-display text-4xl text-white">🔒 انتهت اللعبة</h1>
      <p className="mt-1 text-white/60">النتائج من الأخير إلى الأول</p>

      <div className="mt-8 flex flex-col-reverse gap-3">
        {shown.map((t) => {
          const place = ranked.indexOf(t) + 1;
          return (
            <motion.div key={t.id} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 rounded-2xl border-2 px-5 py-4" style={{ borderColor: place === 1 ? "#f4b63a" : `${t.color}66`, background: place === 1 ? "#f4b63a1f" : `${t.color}14` }}>
              <span className="font-display text-2xl" style={{ color: place === 1 ? "#f4b63a" : "#fff" }}>{place === 1 ? <Crown weight="fill" className="h-7 w-7" /> : ar(place)}</span>
              <span className="text-3xl">{t.emoji}</span>
              <span className="flex-1 text-right font-display text-xl text-white">{t.name}</span>
              <span className="font-display text-2xl" style={{ color: t.color }}>💰 {money(t.balance)}</span>
            </motion.div>
          );
        })}
      </div>

      {!winner ? (
        <button onClick={() => { dispatch({ t: "reveal" }); playTick(); }} className="mt-8 rounded-full bg-amber-400 px-10 py-3.5 text-lg font-bold text-black">
          {s.revealed === 0 ? "ابدأ الإعلان" : "التالي"} ←
        </button>
      ) : (
        <div className="mt-8">
          <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="font-display text-3xl text-amber-300">🏆 الفائز: {winner.name}</motion.p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 text-sm font-semibold text-white/70">🎖️ جوائز جانبية (يمنحها الرائد شفهيًا)</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SIDE_AWARDS.map((a) => <span key={a.label} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/75">{a.emoji} {a.label}</span>)}
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => dispatch({ t: "reset" })} className="flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-black"><ArrowsClockwise weight="bold" className="h-5 w-5" /> لعبة جديدة</button>
            <button onClick={onExit} className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80">خروج</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BigGame() {
  const navigate = useNavigate();
  const [s, dispatch] = useReducer(reducer, undefined, initState);

  useEffect(() => {
    const id = setInterval(() => dispatch({ t: "tick" }), 1000);
    return () => clearInterval(id);
  }, []);

  const exit = () => navigate("/لوحة-التحكم");

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white" dir="rtl">
      {/* توهّج خلفي */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-40">
        {["#f59e0b", "#a855f7", "#22c55e"].map((c, i) => (
          <div key={c} className="absolute h-96 w-96 rounded-full blur-3xl" style={{ left: `${[10, 70, 40][i]}%`, top: `${[5, 55, 30][i]}%`, background: `${c}22` }} />
        ))}
      </div>
      <div className="relative z-10">
        {s.phase === "setup" && <Setup s={s} dispatch={dispatch} onExit={exit} />}
        {s.phase === "lobby" && <Lobby s={s} dispatch={dispatch} />}
        {s.phase === "playing" && <Playing s={s} dispatch={dispatch} />}
        {s.phase === "challenge" && <Challenge s={s} dispatch={dispatch} />}
        {s.phase === "final-challenge" && <Challenge s={s} dispatch={dispatch} isFinal />}
        {s.phase === "event" && <EventScreen s={s} dispatch={dispatch} />}
        {s.phase === "final" && <Final s={s} dispatch={dispatch} />}
        {s.phase === "end" && <End s={s} dispatch={dispatch} onExit={exit} />}
      </div>
    </div>
  );
}
