import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CaretLeft, Play, Pause, ArrowsClockwise, Crown, Printer, Lock } from "@phosphor-icons/react";
import { reducer, initState, standings, type ShifraState, type Action } from "../lib/shifraEngine";
import {
  CHALLENGES, DIFFICULTIES, AGE_GROUPS, DURATIONS, START_BALANCES, MARKET_PRICE,
  CLUE_META, TYPE_META, type ShifraChallenge,
} from "../data/shifra";
import { playWin, playAlarm, playTick, playUnlock, playHeartbeat } from "../lib/sound";

const ar = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const money = (n: number) => ar(n.toLocaleString("en-US"));
const mmss = (s: number) => `${ar(String(Math.floor(s / 60)).padStart(2, "0"))}:${ar(String(s % 60).padStart(2, "0"))}`;

const GOLD = "#f5b73c";
function randomChallenge(): ShifraChallenge {
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
}

/* ————— طباعة بطاقات الأسرار (النموذج A) ————— */
function printSecrets(s: ShifraState) {
  const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const teamCards = s.teams.map((t) => {
    const clues = t.clueIds.map((id) => s.clues[id]).filter(Boolean);
    const items = clues.map((c) => `<li><span class="ct">${CLUE_META[c.type].emoji}</span> ${esc(c.text)}</li>`).join("");
    return `<div class="card" style="border-color:${t.color}">
      <div class="ch" style="background:${t.color}"><span>${t.emoji}</span> ${esc(t.name)}</div>
      <p class="hint">معلوماتكم السرّية عن الشفرة — لا تكشفوها إلا بصفقة</p>
      <ul>${items || "<li>ابدؤوا بلا معلومات، اكسبوها من التحديات والسوق</li>"}</ul>
    </div>`;
  }).join("");
  const keyClues = s.teams.map((t) => {
    const clues = t.clueIds.map((id) => s.clues[id]?.text).filter(Boolean).map(esc).join(" · ");
    return `<tr><td>${t.emoji} ${esc(t.name)}</td><td>${clues || "—"}</td></tr>`;
  }).join("");
  const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>بطاقات أسرار «الشفرة»</title>
<style>
  *{box-sizing:border-box} body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#12131a;margin:0;padding:26px;background:#fff}
  h1{font-size:22px;margin:0 0 2px;color:#8a5a00} .sub{color:#666;font-size:13px;margin-bottom:18px}
  .keybox{border:2px dashed #d0a54a;border-radius:12px;padding:14px 16px;margin-bottom:22px;background:#fffaf0}
  .keybox h2{margin:0 0 8px;font-size:15px;color:#a9701a}
  .code{font-size:30px;font-weight:800;letter-spacing:10px;color:#8a5a00;direction:ltr}
  table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:10px} td{border-bottom:1px solid #eee;padding:6px 8px;vertical-align:top} tr td:first-child{white-space:nowrap;font-weight:700;width:120px}
  .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .card{border:2px solid #ccc;border-radius:14px;overflow:hidden;break-inside:avoid}
  .card .ch{color:#fff;font-weight:800;padding:9px 14px;font-size:16px}
  .card .hint{margin:10px 14px 4px;font-size:11px;color:#888}
  .card ul{margin:0;padding:4px 30px 14px;font-size:14px;line-height:1.9}
  .card .ct{margin-inline-end:4px}
  @media print{body{padding:0}.keybox{page-break-after:always}}
</style></head><body>
  <h1>🔐 بطاقات أسرار «الشفرة»</h1>
  <div class="sub">اطبع، قصّ البطاقات، ووزّع كل بطاقة على فريقها سرًّا — الصفحة الأولى للرائد وحده</div>
  <div class="keybox">
    <h2>🗝️ مفتاح الرائد (لا يُوزَّع)</h2>
    <div class="code">${s.code.map((d) => d).join(" ")}</div>
    <table><tbody>${keyClues}</tbody></table>
  </div>
  <div class="cards">${teamCards}</div>
  <script>window.onload=function(){window.focus();window.print();}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

/* ————— طريقة اللعبة (لهجة بيضا) ————— */
function HowToPlay() {
  const steps = [
    { e: "🔐", h: "فيه شفرة مخبّاة", b: "الشفرة أرقام، ومحد فيكم يقدر يحلّها لحاله، لأن معلوماتها موزّعة عليكم كلكم" },
    { e: "🎴", h: "كل فريق ياخذ سرّه", b: "توزّع بطاقات مطبوعة، كل فريق فيها معلومات صحيحة بس ناقصة عن الشفرة" },
    { e: "🎯", h: "تبي معلومات أكثر؟", b: "اكسب التحديات قدّام الجميع، وكل فوز يجيب لك معلومة جديدة ورصيد" },
    { e: "💰", h: "أو اشترِ من السوق", b: "عندك رصيد؟ اشترِ معلومة، بس ما تدري قدّ إيش قوّتها إلا بعد ما تفتحها" },
    { e: "🤝", h: "قايض وفاوض", b: "تقدر تبادل فريق ثاني معلومة بمعلومة، أو معلومة زائد رصيد بمعلومة أقوى" },
    { e: "🧠", h: "جمّع وفكّها", b: "لمّا تتجمّع عندك المعلومات، استنتجوا الشفرة وجرّبوها في الخزنة، والمحاولات محدودة" },
    { e: "🏆", h: "مين يكسب؟", b: "آخر اللعبة نحسب: فكّ الشفرة (٦٠٪) + الرصيد (٤٠٪)، فالفايز اللي وازن بين ذكاه وإدارته" },
  ];
  return (
    <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5 text-right">
      <p className="font-display text-lg text-amber-200">طريقة اللعبة، باختصار</p>
      <p className="mt-1 text-sm text-white/65">اللعبة تتعرض على شاشة وحدة والرائد يديرها، والأسرار على بطاقات مطبوعة — تعال نمشيها خطوة خطوة</p>
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
        الإعداد ← وزّع البطاقات ← تحدّيات وسوق ومقايضة ← فكّوا الخزنة ← تُعلَن النتائج
      </p>
    </div>
  );
}

/* ————— الإعداد ————— */
function Setup({ s, dispatch, onExit }: { s: ShifraState; dispatch: (a: Action) => void; onExit: () => void }) {
  const c = s.config;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <button onClick={onExit} className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white"><CaretLeft className="h-4 w-4" /> خروج</button>
      <div className="text-center">
        <h1 className="font-display text-4xl text-white sm:text-5xl">🔐 الشفرة</h1>
        <p className="mt-2 text-lg text-amber-300">معلومة واحدة قد تغيّر كل شيء</p>
      </div>

      <HowToPlay />

      <div className="mt-8 space-y-6">
        <Field label="الفئة العمرية">
          <select value={c.ageGroup} onChange={(e) => dispatch({ t: "setConfig", patch: { ageGroup: e.target.value } })} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none">
            {AGE_GROUPS.map((g) => <option key={g} value={g} className="bg-[#0f141e]">{g}</option>)}
          </select>
        </Field>

        <Field label="مستوى الصعوبة (طول الشفرة)">
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <Chip key={d.id} active={c.difficulty === d.id} onClick={() => dispatch({ t: "setConfig", patch: { difficulty: d.id } })}>
                {d.emoji} {d.label} · {ar(d.len)} أرقام
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="مدّة اللعبة">
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <Chip key={m} active={c.minutes === m} onClick={() => dispatch({ t: "setConfig", patch: { minutes: m } })}>{ar(m)} دقيقة</Chip>
            ))}
          </div>
        </Field>

        <Field label={`عدد الفرق: ${ar(c.teamCount)}`}>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Chip key={n} active={c.teamCount === n} onClick={() => dispatch({ t: "setTeamCount", count: n })}>{ar(n)}</Chip>
            ))}
          </div>
        </Field>

        <Field label="الرصيد الابتدائي لكل فريق">
          <div className="flex flex-wrap gap-2">
            {START_BALANCES.map((b) => (
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

        <button onClick={() => { dispatch({ t: "newGame" }); playUnlock(); }} className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-4 text-lg font-bold text-black transition-transform hover:scale-[1.02] active:scale-95">
          جهّز الشفرة ووزّع الأسرار <CaretLeft weight="bold" className="h-5 w-5" />
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

/* ————— شاشة البدء (SYSTEM LOCKED + توزيع) ————— */
function Brief({ s, dispatch }: { s: ShifraState; dispatch: (a: Action) => void }) {
  const lines = ["SYSTEM LOCKED", "تم تقسيم الشفرة إلى أجزاء", "تم توزيع الأجزاء على الفرق", "لا يوجد فريق يملك الحل كاملًا"];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const id = setTimeout(() => { setShown((n) => n + 1); playTick(); }, shown === 0 ? 400 : 900);
    return () => clearTimeout(id);
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <div className="w-full rounded-2xl border border-white/15 bg-black/60 p-6 text-left font-mono" dir="ltr">
        {lines.slice(0, shown).map((l, i) => (
          <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={i === 0 ? "font-bold tracking-widest text-red-400" : "text-emerald-300"}>
            &gt; {l}
          </motion.p>
        ))}
        {shown >= lines.length && <p className="mt-1 text-amber-300">&gt; الوقت المتاح: {mmss(s.secondsLeft)}</p>}
      </div>

      {shown >= lines.length && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-7 w-full">
          <p className="text-white/70">وزّع بطاقات الأسرار على الفرق قبل أن تبدأ</p>
          <button onClick={() => printSecrets(s)} className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-6 py-3 font-bold text-amber-300 transition-transform hover:scale-[1.03] active:scale-95">
            <Printer weight="bold" className="h-5 w-5" /> اطبع بطاقات الأسرار
          </button>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {s.teams.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: `${t.color}66`, background: `${t.color}14` }}>
                <span className="text-2xl">{t.emoji}</span>
                <span className="flex-1 text-right font-display text-lg text-white">{t.name}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">{ar(t.clueIds.length)} معلومة</span>
              </div>
            ))}
          </div>

          <button onClick={() => { dispatch({ t: "start" }); playHeartbeat(); }} className="mt-7 rounded-full bg-amber-400 px-10 py-4 text-xl font-bold text-black transition-transform hover:scale-105 active:scale-95">
            🔓 ابدأ المهمة
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ————— لوحة الأرصدة ————— */
function Board({ s }: { s: ShifraState }) {
  const ranked = [...s.teams].sort((a, b) => b.balance - a.balance);
  return (
    <div className="flex flex-col gap-2">
      {ranked.map((t) => (
        <motion.div key={t.id} layout className="flex items-center gap-3 rounded-2xl border px-4 py-2.5"
          style={{ borderColor: t.id === s.activeTeamId ? t.color : "rgba(255,255,255,0.1)", background: t.id === s.activeTeamId ? `${t.color}22` : "rgba(255,255,255,0.03)" }}>
          <span className="text-2xl">{t.emoji}</span>
          <span className="flex-1 font-display text-lg text-white">{t.name}</span>
          {t.solved && <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-bold text-emerald-300">🔓 فكّها</span>}
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/75">🔎 {ar(t.clueIds.length)}</span>
          <motion.span key={t.balance} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="font-display text-lg" style={{ color: t.color }}>💰 {money(t.balance)}</motion.span>
        </motion.div>
      ))}
    </div>
  );
}

/* ————— شاشة اللعب ————— */
function Playing({ s, dispatch }: { s: ShifraState; dispatch: (a: Action) => void }) {
  const active = s.teams.find((t) => t.id === s.activeTeamId) ?? s.teams[0];
  const lowTime = s.secondsLeft <= 360;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-white/70">🔐 الشفرة · {ar(s.code.length)} أرقام</span>
        <span className={`font-display text-4xl ${lowTime ? "text-red-400" : "text-white"}`}>⏱ {mmss(s.secondsLeft)}</span>
        <button onClick={() => dispatch({ t: s.paused ? "resume" : "pause" })} className="rounded-full border border-white/15 p-2 text-white/70">
          {s.paused ? <Play weight="fill" className="h-5 w-5" /> : <Pause weight="fill" className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-5"><Board s={s} /></div>

      {/* اختيار الفريق صاحب الدور */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {s.teams.map((t) => (
          <button key={t.id} onClick={() => dispatch({ t: "pickTeam", id: t.id })}
            className="rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors"
            style={{ borderColor: t.id === active?.id ? t.color : "rgba(255,255,255,0.15)", background: t.id === active?.id ? `${t.color}22` : "transparent", color: t.id === active?.id ? "#fff" : "rgba(255,255,255,0.7)" }}>
            {t.emoji} {t.name}
          </button>
        ))}
      </div>

      {/* خريطة المهمة — أفعال الرائد */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ZoneBtn emoji="🧩" label="المختبر" hint="تحدّي يكسب معلومة" onClick={() => { dispatch({ t: "startChallenge", challenge: randomChallenge() }); playUnlock(); }} />
        <ZoneBtn emoji="💰" label="السوق" hint="اشترِ معلومة" onClick={() => dispatch({ t: "openMarket" })} />
        <ZoneBtn emoji="🔐" label="الخزنة" hint={`دور ${active?.name ?? ""}`} onClick={() => active && dispatch({ t: "openVault", teamId: active.id })} />
        <ZoneBtn emoji="🚨" label="الجولة النهائية" hint="أغلق كل شيء" danger onClick={() => { dispatch({ t: "toFinal" }); playAlarm(); }} />
      </div>

      <p className="mt-4 text-center text-xs text-white/45">صاحب الدور: {active?.emoji} {active?.name} — اختر «المختبر» ليبدأ تحدّيه، أو «السوق»/«الخزنة»</p>
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

/* ————— التحدّي ————— */
function Challenge({ s, dispatch }: { s: ShifraState; dispatch: (a: Action) => void }) {
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
      <p className="mt-5 text-sm text-white/60">الفوز يكسب <b className="text-emerald-400">معلومة سرّية جديدة</b> + <b className="text-amber-300">رصيد</b></p>
      <div className="mt-5 flex justify-center gap-4">
        <button onClick={() => { dispatch({ t: "judge", win: true }); playWin(); }} className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white">نجح ✓</button>
        <button onClick={() => { dispatch({ t: "judge", win: false }); playAlarm(); }} className="rounded-full bg-red-500 px-8 py-3 text-lg font-bold text-white">لم ينجح ✗</button>
      </div>
    </div>
  );
}

/* ————— كشف المعلومة السرّية (للفريق فقط) ————— */
function Reveal({ s, dispatch }: { s: ShifraState; dispatch: (a: Action) => void }) {
  const g = s.lastGrant!;
  const team = s.teams.find((t) => t.id === g.teamId);
  const clue = s.clues[g.clueId];
  const meta = clue ? CLUE_META[clue.type] : null;
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full rounded-3xl border-2 p-7" style={{ borderColor: team?.color, background: `${team?.color}14` }}>
        <p className="text-sm text-white/60">معلومة سرّية لـ {team?.emoji} {team?.name}</p>
        <p className="mt-1 text-xs text-amber-300/80">وجّه الشاشة للفريق، أو اقرأها لهم بصوت خافت</p>
        <div className="mt-5 rounded-2xl bg-black/40 p-6">
          {meta && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/75">{meta.emoji} {meta.label}</span>}
          <p className="mt-3 font-display text-2xl text-white sm:text-3xl" dir="rtl">{clue?.text}</p>
        </div>
        {g.cost != null && <p className="mt-3 text-sm text-white/55">دُفِع من الرصيد: 💰 {money(g.cost)}</p>}
      </motion.div>
      <button onClick={() => { dispatch({ t: "closeReveal" }); playTick(); }} className="mt-7 rounded-full bg-amber-400 px-10 py-3.5 text-lg font-bold text-black">أخفِ وأكمل</button>
    </div>
  );
}

/* ————— السوق ————— */
function Market({ s, dispatch }: { s: ShifraState; dispatch: (a: Action) => void }) {
  const price = MARKET_PRICE[s.config.difficulty];
  const soldOut = s.earnPool.length === 0;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button onClick={() => dispatch({ t: "closeMarket" })} className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white"><CaretLeft className="h-4 w-4" /> رجوع للّوحة</button>
      <div className="text-center">
        <h1 className="font-display text-3xl text-white">💰 السوق</h1>
        <p className="mt-1 text-white/60">كل معلومة بـ 💰 {money(price)} — قوّتها تظهر بعد الشراء فقط</p>
        {soldOut && <p className="mt-2 text-sm text-amber-300">نفد المخزون، لم تبقَ معلومات للبيع</p>}
      </div>
      <div className="mt-7 space-y-2.5">
        {s.teams.map((t) => {
          const canBuy = t.balance >= price && !soldOut;
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: `${t.color}55` }}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="flex-1 font-display text-lg text-white">{t.name}</span>
              <span className="font-display text-sm" style={{ color: t.color }}>💰 {money(t.balance)}</span>
              <button disabled={!canBuy} onClick={() => { dispatch({ t: "buyClue", teamId: t.id }); playUnlock(); }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-transform active:scale-95 ${canBuy ? "bg-amber-400 text-black hover:scale-105" : "cursor-not-allowed bg-white/10 text-white/40"}`}>
                {t.balance < price ? "رصيد قليل" : "اشترِ معلومة"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ————— الخزنة ————— */
function Vault({ s, dispatch }: { s: ShifraState; dispatch: (a: Action) => void }) {
  const team = s.teams.find((t) => t.id === s.vaultTeamId)!;
  const [guess, setGuess] = useState<number[]>([]);
  const [result, setResult] = useState<{ correct: number; solved: boolean } | null>(null);
  const len = s.code.length;
  const full = guess.length === len;

  function push(d: number) { if (guess.length < len) setGuess([...guess, d]); }
  function submit() {
    const correct = guess.reduce((n, v, i) => n + (v === s.code[i] ? 1 : 0), 0);
    const solved = correct === len;
    dispatch({ t: "submitGuess", guess });
    setResult({ correct, solved });
    if (solved) playWin(); else playAlarm();
  }
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-8 text-center">
      <button onClick={() => dispatch({ t: "closeVault" })} className="mb-6 flex items-center gap-2 self-start text-sm text-white/60 hover:text-white"><CaretLeft className="h-4 w-4" /> رجوع</button>
      <p className="font-display text-2xl text-white">{team.emoji} {team.name} — الخزنة</p>
      <p className="mt-1 text-sm text-white/55">المحاولات المتبقية: <b className="text-amber-300">{ar(team.attemptsLeft)}</b></p>

      <div className="mt-6 flex justify-center gap-2.5" dir="ltr">
        {Array.from({ length: len }).map((_, i) => (
          <div key={i} className="flex h-16 w-14 items-center justify-center rounded-xl border-2 font-display text-3xl"
            style={{ borderColor: result ? (guess[i] === s.code[i] ? "#46e0a0" : "#ff5470") : "rgba(255,255,255,0.25)", color: GOLD }}>
            {guess[i] != null ? ar(guess[i]) : "_"}
          </div>
        ))}
      </div>

      {result ? (
        <div className="mt-6">
          {result.solved ? (
            <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="font-display text-2xl text-emerald-400">🔓 فُتحت الخزنة! أحسنتم</motion.p>
          ) : (
            <p className="font-display text-xl text-white">{ar(result.correct)} من {ar(len)} في مكانها الصحيح</p>
          )}
          <button onClick={() => dispatch({ t: "closeVault" })} className="mt-5 rounded-full bg-amber-400 px-8 py-3 font-bold text-black">تمام</button>
        </div>
      ) : team.attemptsLeft <= 0 ? (
        <div className="mt-6"><p className="flex items-center justify-center gap-2 text-red-400"><Lock weight="fill" className="h-5 w-5" /> نفدت المحاولات</p>
          <button onClick={() => dispatch({ t: "closeVault" })} className="mt-4 rounded-full border border-white/15 px-8 py-3 font-semibold text-white/80">رجوع</button></div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-5 gap-2" dir="ltr">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button key={d} onClick={() => push(d)} className="rounded-xl border border-white/15 bg-white/5 py-3 font-display text-xl text-white transition-colors hover:border-amber-400/50">{ar(d)}</button>
            ))}
            <button onClick={() => setGuess(guess.slice(0, -1))} className="rounded-xl border border-white/15 bg-white/5 py-3 text-white/70">⌫</button>
          </div>
          <button disabled={!full} onClick={submit} className={`mt-5 rounded-full px-10 py-3.5 text-lg font-bold transition-transform active:scale-95 ${full ? "bg-amber-400 text-black hover:scale-105" : "cursor-not-allowed bg-white/10 text-white/40"}`}>
            🔓 جرّب الفتح
          </button>
        </>
      )}
    </div>
  );
}

/* ————— الجولة النهائية ————— */
function Final({ s, dispatch }: { s: ShifraState; dispatch: (a: Action) => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center">
      <motion.h1 initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="font-display text-4xl text-red-400">🚨 المرحلة النهائية</motion.h1>
      <p className="mt-2 text-white/70">أُغلق السوق والتحديات، الآن كل فريق يجرّب فكّ الشفرة في خزنته</p>

      <div className="mt-6 space-y-3">
        {s.teams.map((t) => {
          const noTries = t.attemptsLeft <= 0 || t.solved;
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: `${t.color}66` }}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="font-display text-lg text-white">{t.name}</span>
              <span className="text-sm text-white/55">🔎 {ar(t.clueIds.length)} معلومة · 💰 {money(t.balance)}</span>
              <div className="mr-auto">
                {t.solved ? <span className="rounded-full bg-emerald-400/20 px-4 py-1.5 text-sm font-bold text-emerald-300">🔓 فكّها</span>
                  : noTries ? <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/50">انتهت محاولاته</span>
                    : <button onClick={() => dispatch({ t: "openVault", teamId: t.id })} className="rounded-full bg-amber-400 px-5 py-1.5 text-sm font-bold text-black">🔐 افتح الخزنة</button>}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => { dispatch({ t: "endGame" }); playHeartbeat(); }} className="mt-8 rounded-full bg-amber-400 px-10 py-4 text-lg font-bold text-black">🏆 أعلن النتائج</button>
    </div>
  );
}

/* ————— النتائج ————— */
function End({ s, dispatch, onExit }: { s: ShifraState; dispatch: (a: Action) => void; onExit: () => void }) {
  const ranked = standings(s.teams, s.code.length);
  const shown = ranked.slice(ranked.length - s.revealed);
  const winner = s.revealed >= ranked.length ? ranked[0] : null;
  useEffect(() => { if (winner) playWin(); }, [winner?.team.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const solvedCount = s.teams.filter((t) => t.solved).length;
  return (
    <div className="relative mx-auto min-h-screen max-w-2xl px-4 py-10 text-center">
      {winner && <Confetti />}
      <h1 className="font-display text-4xl text-white">🔒 انتهت الشفرة</h1>
      <p className="mt-1 text-white/60">النتيجة = فكّ الشفرة (٦٠٪) + الرصيد (٤٠٪)</p>

      <div className="mt-8 flex flex-col-reverse gap-3">
        {shown.map((r) => {
          const place = ranked.indexOf(r) + 1;
          const t = r.team;
          return (
            <motion.div key={t.id} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 rounded-2xl border-2 px-5 py-4" style={{ borderColor: place === 1 ? GOLD : `${t.color}66`, background: place === 1 ? "#f5b73c1f" : `${t.color}14` }}>
              <span className="font-display text-2xl" style={{ color: place === 1 ? GOLD : "#fff" }}>{place === 1 ? <Crown weight="fill" className="h-7 w-7" /> : ar(place)}</span>
              <span className="text-3xl">{t.emoji}</span>
              <span className="flex-1 text-right font-display text-xl text-white">{t.name}</span>
              {t.solved && <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-bold text-emerald-300">🔓</span>}
              <span className="font-display text-lg" style={{ color: t.color }}>💰 {money(t.balance)}</span>
              <span className="w-12 font-display text-lg text-white/70">{ar(Math.round(r.score * 100))}٪</span>
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
          <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="font-display text-3xl text-amber-300">🏆 الفائز: {winner.team.name}</motion.p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
            <p>الشفرة كانت: <b className="font-display text-xl text-amber-300" dir="ltr">{s.code.map((d) => ar(d)).join(" ")}</b></p>
            <p className="mt-2">فكّها {ar(solvedCount)} من {ar(s.teams.length)} فرق</p>
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

export function Shifra() {
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
        <motion.div key={s.phase === "setup" ? "setup" : s.phase === "brief" ? "brief" : "game"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {s.phase === "setup" && <Setup s={s} dispatch={dispatch} onExit={exit} />}
          {s.phase === "brief" && <Brief s={s} dispatch={dispatch} />}
          {s.phase === "playing" && <Playing s={s} dispatch={dispatch} />}
          {s.phase === "challenge" && <Challenge s={s} dispatch={dispatch} />}
          {s.phase === "reveal" && s.lastGrant && <Reveal s={s} dispatch={dispatch} />}
          {s.phase === "market" && <Market s={s} dispatch={dispatch} />}
          {s.phase === "vault" && s.vaultTeamId && <Vault s={s} dispatch={dispatch} />}
          {s.phase === "final" && <Final s={s} dispatch={dispatch} />}
          {s.phase === "end" && <End s={s} dispatch={dispatch} onExit={exit} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
