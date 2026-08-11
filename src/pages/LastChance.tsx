import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CaretLeft, Play, Pause, ArrowsClockwise, Crown, Heart } from "@phosphor-icons/react";
import { reducer, initState, standings, topValue, type LCState, type Action } from "../lib/lastChanceEngine";
import {
  DECISIONS, CHALLENGES, COMEBACK, DIFFICULTIES, AGE_GROUPS, DURATIONS, DECISION_REASONS,
  FINAL_OPTIONS, REFLECTION_QUESTIONS, TAKE_HOME, VALUES, TYPE_META, valueLabel, valueEmoji,
} from "../data/lastChance";
import { playWin, playAlarm, playTick, playUnlock, playHeartbeat } from "../lib/sound";

const ar = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const money = (n: number) => ar(n.toLocaleString("en-US"));
const mmss = (s: number) => `${ar(String(Math.floor(s / 60)).padStart(2, "0"))}:${ar(String(s % 60).padStart(2, "0"))}`;
const GOLD = "#f5b73c";
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const hearts = (n: number) => "❤️".repeat(Math.max(0, n)) || "💔";

/* ————— طريقة اللعبة (لهجة بيضا) ————— */
function HowToPlay() {
  const steps = [
    { e: "❤️", h: "تبدأون بموارد محدودة", b: "لكل فريق أرواح ورصيد وطاقة، وكل شي ممكن يروح، فديروا بالكم" },
    { e: "🧭", h: "كل محطة فيها قرار", b: "أغامر؟ أتعاون؟ أصبر؟ أستخدم موردي؟ القرار لكم، والنتيجة عليكم" },
    { e: "🎯", h: "القيمة تُعاش ما تُلقّن", b: "ما نقول لكم وش الصح، نحطكم بالموقف وأنتم تقرّرون، وبعدها نسألكم: ليش؟" },
    { e: "💥", h: "الفشل مو النهاية", b: "خسرتم جولة؟ فيه فرصة عودة، الثبات جزء من اللعبة" },
    { e: "🚨", h: "القرار الأخير", b: "بآخر خمس دقائق كل شي يتوقف، وقراركم الأخير يحدّد نهايتكم" },
    { e: "🌱", h: "الأهم بالنهاية", b: "نفكّك معكم قراراتكم، تختارون قيمة تطبّقونها بحياتكم فعلاً هالأسبوع" },
  ];
  return (
    <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5 text-right">
      <p className="font-display text-lg text-amber-200">طريقة اللعبة، باختصار</p>
      <p className="mt-1 text-sm text-white/65">اللعبة تختبر قراراتكم مو معلوماتكم، والحماس وسيلة، والأثر يجي من التفكيك بالنهاية</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {steps.map((st, i) => (
          <div key={st.h} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-xl">{st.e}</span>
            <div>
              <p className="text-sm font-bold text-white">{ar(i + 1)}. {st.h}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/65">{st.b}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl bg-white/[0.03] px-4 py-2.5 text-center text-xs text-white/60">
        قرار وتحدّي ← تجربة القيمة ← تحليل داخل اللعبة ← انعكاس ← تطبيق في الواقع
      </p>
    </div>
  );
}

/* ————— الإعداد ————— */
function Setup({ s, dispatch, onExit }: { s: LCState; dispatch: (a: Action) => void; onExit: () => void }) {
  const c = s.config;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <button onClick={onExit} className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white"><CaretLeft className="h-4 w-4" /> خروج</button>
      <div className="text-center">
        <h1 className="font-display text-4xl text-white sm:text-5xl">⚡ آخر فرصة</h1>
        <p className="mt-2 text-lg text-amber-300">كل قرار له ثمن</p>
      </div>
      <HowToPlay />
      <div className="mt-8 space-y-6">
        <Field label="الفئة العمرية">
          <select value={c.ageGroup} onChange={(e) => dispatch({ t: "setConfig", patch: { ageGroup: e.target.value } })} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none">
            {AGE_GROUPS.map((g) => <option key={g} value={g} className="bg-[#0f141e]">{g}</option>)}
          </select>
        </Field>
        <Field label="مستوى الصعوبة (عدد الأرواح)">
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <Chip key={d.id} active={c.difficulty === d.id} onClick={() => dispatch({ t: "setConfig", patch: { difficulty: d.id } })}>{d.emoji} {d.label} · {hearts(d.hearts)}</Chip>
            ))}
          </div>
        </Field>
        <Field label="مدّة اللعبة">
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => <Chip key={m} active={c.minutes === m} onClick={() => dispatch({ t: "setConfig", patch: { minutes: m } })}>{ar(m)} دقيقة</Chip>)}
          </div>
        </Field>
        <Field label={`عدد الفرق: ${ar(c.teamCount)}`}>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => <Chip key={n} active={c.teamCount === n} onClick={() => dispatch({ t: "setTeamCount", count: n })}>{ar(n)}</Chip>)}
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
        <button onClick={() => { dispatch({ t: "newGame" }); playUnlock(); }} className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-4 text-lg font-bold text-black transition-transform hover:scale-[1.02] active:scale-95">
          ابدأ الرحلة <CaretLeft weight="bold" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="mb-2 text-sm font-semibold text-white/70">{label}</p>{children}</div>;
}
function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-amber-400 text-black" : "border border-white/15 text-white/80 hover:border-white/30"}`}>{children}</button>;
}

/* ————— البدء (عدّاد القلوب) ————— */
function Brief({ dispatch }: { dispatch: (a: Action) => void }) {
  const [beat, setBeat] = useState(3);
  useEffect(() => {
    if (beat <= 0) return;
    const id = setTimeout(() => { setBeat((n) => n - 1); playHeartbeat(); }, 900);
    return () => clearTimeout(id);
  }, [beat]);
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl text-white">⚡ آخر فرصة</motion.h1>
      <p className="mt-4 text-lg text-white/75">لديكم فريق، وموارد محدودة، ووقت محدود</p>
      <p className="mt-1 text-lg font-bold text-amber-300">وكل قرار ستتخذونه سيغيّر ما بعده</p>
      {beat > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div key={beat} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.8, opacity: 0 }} className="mt-10 text-7xl">
            {ar(beat)} <Heart weight="fill" className="inline h-14 w-14 text-red-500" />
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={() => { dispatch({ t: "start" }); playLaunchSafe(); }} className="mt-10 rounded-full bg-amber-400 px-12 py-4 text-2xl font-bold text-black transition-transform hover:scale-105 active:scale-95">
          ابدأوا
        </motion.button>
      )}
    </div>
  );
}
function playLaunchSafe() { try { playUnlock(); } catch { /* تجاهل */ } }

/* ————— لوحة الفرق ————— */
function Board({ s }: { s: LCState }) {
  const ranked = standings(s.teams);
  return (
    <div className="flex flex-col gap-2">
      {ranked.map((t) => (
        <motion.div key={t.id} layout className="flex items-center gap-2.5 rounded-2xl border px-4 py-2.5"
          style={{ borderColor: t.id === s.activeTeamId ? t.color : "rgba(255,255,255,0.1)", background: t.id === s.activeTeamId ? `${t.color}22` : "rgba(255,255,255,0.03)" }}>
          <span className="text-2xl">{t.emoji}</span>
          <span className="flex-1 font-display text-lg text-white">{t.name}</span>
          <span className="text-sm" title="الأرواح">{hearts(t.hearts)}</span>
          <span className="text-xs text-amber-200" title="الطاقة">{"⚡".repeat(Math.max(0, t.energy)) || "—"}</span>
          <motion.span key={t.balance} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="w-24 text-left font-display text-lg" style={{ color: t.color }}>💰 {money(t.balance)}</motion.span>
        </motion.div>
      ))}
    </div>
  );
}

/* ————— اللعب ————— */
function Playing({ s, dispatch }: { s: LCState; dispatch: (a: Action) => void }) {
  const active = s.teams.find((t) => t.id === s.activeTeamId) ?? s.teams[0];
  const lowTime = s.secondsLeft <= 360;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-white/70">⚡ آخر فرصة</span>
        <span className={`font-display text-4xl ${lowTime ? "text-red-400" : "text-white"}`}>⏱ {mmss(s.secondsLeft)}</span>
        <button onClick={() => dispatch({ t: s.paused ? "resume" : "pause" })} className="rounded-full border border-white/15 p-2 text-white/70">
          {s.paused ? <Play weight="fill" className="h-5 w-5" /> : <Pause weight="fill" className="h-5 w-5" />}
        </button>
      </div>
      <div className="mt-5"><Board s={s} /></div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {s.teams.map((t) => (
          <button key={t.id} onClick={() => dispatch({ t: "pickTeam", id: t.id })} className="rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors"
            style={{ borderColor: t.id === active?.id ? t.color : "rgba(255,255,255,0.15)", background: t.id === active?.id ? `${t.color}22` : "transparent", color: t.id === active?.id ? "#fff" : "rgba(255,255,255,0.7)" }}>
            {t.emoji} {t.name}
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ZoneBtn emoji="🧭" label="قرار" hint="موقف يمارس قيمة" onClick={() => { dispatch({ t: "startDecision", decision: pick(DECISIONS) }); playUnlock(); }} />
        <ZoneBtn emoji="🎯" label="تحدّي" hint="يكسب رصيدًا" onClick={() => { dispatch({ t: "startChallenge", challenge: pick(CHALLENGES) }); playUnlock(); }} />
        <ZoneBtn emoji="🚨" label="القرار الأخير" hint="أغلق كل شيء" danger onClick={() => { dispatch({ t: "toFinal" }); playAlarm(); }} />
      </div>
      <p className="mt-4 text-center text-xs text-white/45">دور: {active?.emoji} {active?.name} — اختر «قرار» ليعيش الفريق موقفًا، أو «تحدّي» ليكسب</p>
    </div>
  );
}
function ZoneBtn({ emoji, label, hint, onClick, danger }: { emoji: string; label: string; hint: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-2xl border p-4 text-center transition-transform hover:scale-[1.03] active:scale-95 ${danger ? "border-red-400/40 bg-red-400/[0.07]" : "border-white/12 bg-white/[0.03]"}`}>
      <span className="text-3xl">{emoji}</span>
      <span className="font-display text-sm text-white">{label}</span>
      <span className="text-[11px] text-white/50">{hint}</span>
    </button>
  );
}

/* ————— القرار (خيار ثم «ليش؟») ————— */
function Decision({ s, dispatch }: { s: LCState; dispatch: (a: Action) => void }) {
  const active = s.teams.find((t) => t.id === s.activeTeamId);
  const d = s.decision!;
  const [chosen, setChosen] = useState<number | null>(null);
  const [left, setLeft] = useState(d.discussSeconds ?? 0);
  useEffect(() => {
    if (chosen != null || left <= 0) return;
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [left, chosen]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-8 text-center">
      <p className="text-sm text-white/60">دور {active?.emoji} {active?.name}</p>
      <div className="mt-3 rounded-3xl border-2 p-6" style={{ borderColor: active?.color, background: `${active?.color}14` }}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">🧭 قرار</span>
        <h2 className="mt-3 font-display text-2xl text-white sm:text-3xl">{d.title}</h2>
        <p className="mt-2 text-lg leading-relaxed text-white/85">{d.scenario}</p>
        {chosen == null && left > 0 && <p className="mt-3 text-sm text-amber-300">مهلة النقاش: {ar(left)} ثانية</p>}
      </div>

      {chosen == null ? (
        <div className="mt-5 grid gap-2.5">
          {d.options.map((o, i) => (
            <button key={i} onClick={() => { setChosen(i); playTick(); }} className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 text-right transition-colors hover:border-amber-400/50">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-lg text-white">{o.label}</span>
                <span className="shrink-0 font-display text-sm" style={{ color: o.points < 0 ? "#ff8fa3" : o.points > 0 ? "#7be0a8" : "#cbd5e1" }}>
                  {o.points !== 0 && `${o.points > 0 ? "+" : ""}${money(o.points)}`}
                  {o.hearts ? ` · ${ar(o.hearts)}❤️` : ""}{o.energy ? ` · ${o.energy > 0 ? "+" : ""}${ar(o.energy)}⚡` : ""}
                </span>
              </div>
              {o.sub && <p className="mt-1 text-sm text-white/55">{o.sub}</p>}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          {d.options[chosen].note && <p className="mb-4 rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-white/75">{d.options[chosen].note}</p>}
          <p className="font-display text-lg text-amber-200">ما الذي اعتمدتم عليه في قراركم؟</p>
          <p className="text-xs text-white/50">هنا تظهر القيمة، لا نحكم عليكم، نفهم أسلوبكم</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {DECISION_REASONS.map((r) => (
              <button key={r} onClick={() => { dispatch({ t: "applyDecision", optionIndex: chosen, reason: r }); playUnlock(); }} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/85 transition-colors hover:border-amber-400/50 hover:text-white">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ————— التحدّي ————— */
function Challenge({ s, dispatch }: { s: LCState; dispatch: (a: Action) => void }) {
  const active = s.teams.find((t) => t.id === s.activeTeamId);
  const ch = s.challenge!;
  const meta = TYPE_META[ch.type];
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-8 text-center">
      <p className="text-sm text-white/60">دور {active?.emoji} {active?.name}</p>
      <div className="mt-4 rounded-3xl border-2 p-7" style={{ borderColor: active?.color, background: `${active?.color}14` }}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">{meta.emoji} {meta.label}</span>
        <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">{ch.title}</h2>
        <p className="mt-3 text-lg leading-relaxed text-white/85">{ch.instruction}</p>
      </div>
      <p className="mt-5 text-sm text-white/60">النجاح يكسب <b className="text-emerald-400">رصيدًا</b>، والخسارة تُنقص <b className="text-red-400">قلبًا</b> وتفتح فرصة عودة</p>
      <div className="mt-5 flex justify-center gap-4">
        <button onClick={() => { dispatch({ t: "judgeChallenge", win: true }); playWin(); }} className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white">نجح ✓</button>
        <button onClick={() => { dispatch({ t: "judgeChallenge", win: false }); playAlarm(); }} className="rounded-full bg-red-500 px-8 py-3 text-lg font-bold text-white">لم ينجح ✗</button>
      </div>
    </div>
  );
}

/* ————— فرصة العودة ————— */
function Comeback({ s, dispatch }: { s: LCState; dispatch: (a: Action) => void }) {
  const team = s.teams.find((t) => t.id === s.comebackTeamId);
  const started = !!s.challenge;
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-8 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl">💥</motion.div>
      <h2 className="mt-3 font-display text-3xl text-white">خسرتم الجولة، لكن اللعبة لم تنتهِ</h2>
      <p className="mt-2 text-white/70">{team?.emoji} {team?.name} — أمامكم فرصة عودة، لا تُمنح مجانًا</p>
      {!started ? (
        <div className="mt-7 flex flex-col items-center gap-3">
          <button onClick={() => { dispatch({ t: "startComeback", teamId: team!.id, challenge: COMEBACK }); playHeartbeat(); }} className="rounded-full bg-amber-400 px-10 py-4 text-lg font-bold text-black">🆘 خوضوا فرصة العودة</button>
          <button onClick={() => dispatch({ t: "closeComeback" })} className="rounded-full border border-white/15 px-8 py-2.5 text-sm text-white/70">تخطّي</button>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-3xl border-2 p-6" style={{ borderColor: team?.color, background: `${team?.color}14` }}>
            <h3 className="font-display text-2xl text-white">{COMEBACK.title}</h3>
            <p className="mt-2 text-lg text-white/85">{COMEBACK.instruction}</p>
          </div>
          <div className="mt-5 flex justify-center gap-4">
            <button onClick={() => { dispatch({ t: "judgeComeback", win: true }); playWin(); }} className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white">نجح ✓ (+قلب)</button>
            <button onClick={() => { dispatch({ t: "judgeComeback", win: false }); playAlarm(); }} className="rounded-full bg-red-500 px-8 py-3 text-lg font-bold text-white">لم ينجح ✗</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ————— القرار الأخير ————— */
function Final({ s, dispatch }: { s: LCState; dispatch: (a: Action) => void }) {
  const allDone = s.teams.every((t) => t.finalDone);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center">
      <motion.h1 initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="font-display text-4xl text-red-400">🚨 آخر فرصة</motion.h1>
      <p className="mt-2 text-white/70">لن تجمعوا نقاطًا بالطريقة المعتادة، كل ما فعلتموه أوصلكم هنا، القرار الأخير لكم</p>
      <div className="mt-6 space-y-3">
        {s.teams.map((t) => (
          <div key={t.id} className="rounded-2xl border px-4 py-3" style={{ borderColor: `${t.color}66` }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl">{t.emoji}</span>
              <span className="font-display text-lg text-white">{t.name}</span>
              <span className="text-sm text-white/55">{hearts(t.hearts)} · 💰 {money(t.balance)}</span>
              {t.finalDone && <span className="mr-auto rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">تمّ</span>}
            </div>
            {!t.finalDone && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {FINAL_OPTIONS.map((o) => {
                  const chosen = t.finalChoice === o.id;
                  return (
                    <div key={o.id} className="flex items-center gap-1.5">
                      <button onClick={() => dispatch({ t: "setFinalChoice", id: t.id, choice: o.id })}
                        className={`rounded-full px-4 py-1.5 text-sm font-bold ${chosen ? "bg-amber-400 text-black" : "border border-white/15 text-white/80"}`}>
                        {o.emoji} {o.label}
                      </button>
                      {chosen && o.id === "safe" && <button onClick={() => { dispatch({ t: "resolveFinal", id: t.id }); playWin(); }} className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">طبّق</button>}
                      {chosen && (o.id === "bold" || o.id === "all") && (
                        <>
                          <button onClick={() => { dispatch({ t: "resolveFinal", id: t.id, win: true }); playWin(); }} className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">نجح</button>
                          <button onClick={() => { dispatch({ t: "resolveFinal", id: t.id, win: false }); playAlarm(); }} className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white">فشل</button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!t.finalDone && t.finalChoice && <p className="mt-2 text-xs text-white/50">{FINAL_OPTIONS.find((o) => o.id === t.finalChoice)?.sub}</p>}
          </div>
        ))}
      </div>
      {allDone && <button onClick={() => { dispatch({ t: "endGame" }); playHeartbeat(); }} className="mt-8 rounded-full bg-amber-400 px-10 py-4 text-lg font-bold text-black">🏆 انهِ الرحلة واعرض التقرير</button>}
    </div>
  );
}

/* ————— التقرير النهائي (الفوز منفصل عن القيم) ————— */
function End({ s, dispatch, onExit }: { s: LCState; dispatch: (a: Action) => void; onExit: () => void }) {
  const ranked = standings(s.teams);
  const shown = ranked.slice(ranked.length - s.revealed);
  const done = s.revealed >= ranked.length;
  const winner = done ? ranked[0] : null;
  useEffect(() => { if (winner) playWin(); }, [winner?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative mx-auto min-h-screen max-w-2xl px-4 py-10 text-center">
      {winner && <Confetti />}
      <h1 className="font-display text-4xl text-white">🏆 انتهت الرحلة</h1>
      <p className="mt-1 text-white/60">نتيجة اللعبة شيء، والقيم التي مارستموها شيء آخر</p>

      {/* نتيجة اللعبة (الرصيد) */}
      <p className="mt-7 font-display text-sm uppercase tracking-widest text-white/40">🏁 نتيجة اللعبة</p>
      <div className="mt-3 flex flex-col-reverse gap-3">
        {shown.map((t) => {
          const place = ranked.indexOf(t) + 1;
          return (
            <motion.div key={t.id} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 rounded-2xl border-2 px-5 py-4" style={{ borderColor: place === 1 ? GOLD : `${t.color}66`, background: place === 1 ? "#f5b73c1f" : `${t.color}14` }}>
              <span className="font-display text-2xl" style={{ color: place === 1 ? GOLD : "#fff" }}>{place === 1 ? <Crown weight="fill" className="h-7 w-7" /> : ar(place)}</span>
              <span className="text-3xl">{t.emoji}</span>
              <span className="flex-1 text-right font-display text-xl text-white">{t.name}</span>
              <span className="font-display text-lg" style={{ color: t.color }}>💰 {money(t.balance)}</span>
            </motion.div>
          );
        })}
      </div>
      {!done && <button onClick={() => { dispatch({ t: "reveal" }); playTick(); }} className="mt-6 rounded-full bg-amber-400 px-10 py-3 text-lg font-bold text-black">{s.revealed === 0 ? "ابدأ الإعلان" : "التالي"} ←</button>}

      {winner && (
        <>
          <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mt-6 font-display text-2xl text-amber-300">🏆 الأعلى رصيدًا: {winner.name}</motion.p>

          {/* مرآة الفرق — القيم الممارَسة (منفصلة عن الفوز) */}
          <div className="mt-10 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5 text-right">
            <p className="text-center font-display text-xl text-emerald-200">🌱 القيم التي مارستها الفرق</p>
            <p className="mb-4 text-center text-xs text-white/55">عدد المواقف التي مُورست فيها كل قيمة، لا حكم على الشخصية ولا نسبة مصطنعة</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {s.teams.map((t) => {
                const tv = topValue(t);
                const items = VALUES.filter((v) => (t.values[v.key] ?? 0) > 0).sort((a, b) => (t.values[b.key] ?? 0) - (t.values[a.key] ?? 0));
                return (
                  <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-display text-white">{t.emoji} {t.name}</p>
                    {items.length ? (
                      <ul className="mt-2 space-y-1">
                        {items.map((v) => (
                          <li key={v.key} className={`flex items-center justify-between text-sm ${v.key === tv ? "text-emerald-300" : "text-white/70"}`}>
                            <span>{v.emoji} {v.label}</span>
                            <span className="font-display">{ar(t.values[v.key])} {t.values[v.key] === 1 ? "موقف" : "مواقف"}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="mt-2 text-xs text-white/45">لم تُرصد مواقف قيمية بعد</p>}
                    {tv && <p className="mt-2 text-xs text-emerald-300/90">أبرز ما ظهر: {valueEmoji(tv)} {valueLabel(tv)}</p>}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-center text-xs text-white/45">الفريق الأعلى رصيدًا ليس بالضرورة الأكثر ممارسةً للقيم — وهذا مقصود</p>
          </div>

          {/* أسئلة الانعكاس */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-right">
            <p className="text-center font-display text-xl text-white">👇 نفكّكها معًا</p>
            <p className="mb-3 text-center text-xs text-white/55">يطرحها الرائد على الفرق، لا إجابة واحدة صحيحة</p>
            <ol className="space-y-2">
              {REFLECTION_QUESTIONS.map((q, i) => (
                <li key={i} className="flex gap-2.5 rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm text-white/85">
                  <span className="font-display text-amber-300">{ar(i + 1)}</span> {q}
                </li>
              ))}
            </ol>
          </div>

          {/* خذها معك */}
          <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5">
            <p className="font-display text-xl text-amber-200">🎯 خذوها معكم</p>
            <p className="mt-1 text-sm text-white/70">اختر كل فريق قيمة يطبّقها فعلًا خلال هذا الأسبوع، ويسألهم الرائد عنها في النشاط القادم</p>
            <div className="mt-4 space-y-3">
              {s.teams.map((t) => (
                <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-right">
                  <p className="mb-2 font-display text-white">{t.emoji} {t.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {TAKE_HOME.map((h) => (
                      <button key={h.key} onClick={() => { dispatch({ t: "setTakeHome", id: t.id, value: h.label }); playTick(); }}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${t.takeHome === h.label ? "bg-amber-400 text-black" : "border border-white/15 text-white/75 hover:border-amber-400/50"}`}>
                        {h.emoji} {h.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button onClick={() => dispatch({ t: "reset" })} className="flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-black"><ArrowsClockwise weight="bold" className="h-5 w-5" /> رحلة جديدة</button>
            <button onClick={onExit} className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80">خروج</button>
          </div>
        </>
      )}
    </div>
  );
}

function Confetti() {
  const bits = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: (i * 37) % 100, delay: (i % 10) * 0.12, hue: (i * 47) % 360, dur: 2.4 + (i % 5) * 0.4 })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span key={i} initial={{ y: -40, opacity: 0 }} animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity }} className="absolute h-3 w-2 rounded-sm" style={{ left: `${b.x}%`, background: `hsl(${b.hue} 85% 60%)` }} />
      ))}
    </div>
  );
}

export function LastChance() {
  const navigate = useNavigate();
  const [s, dispatch] = useReducer(reducer, undefined, initState);
  useEffect(() => {
    if (s.phase !== "playing") return;
    const id = setInterval(() => dispatch({ t: "tick" }), 1000);
    return () => clearInterval(id);
  }, [s.phase]);
  const exit = () => navigate(-1);
  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      <AnimatePresence mode="wait">
        <motion.div key={s.phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {s.phase === "setup" && <Setup s={s} dispatch={dispatch} onExit={exit} />}
          {s.phase === "brief" && <Brief dispatch={dispatch} />}
          {s.phase === "playing" && <Playing s={s} dispatch={dispatch} />}
          {s.phase === "decision" && s.decision && <Decision s={s} dispatch={dispatch} />}
          {s.phase === "challenge" && s.challenge && <Challenge s={s} dispatch={dispatch} />}
          {s.phase === "comeback" && <Comeback s={s} dispatch={dispatch} />}
          {s.phase === "final" && <Final s={s} dispatch={dispatch} />}
          {s.phase === "end" && <End s={s} dispatch={dispatch} onExit={exit} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
