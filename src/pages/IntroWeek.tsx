import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CaretLeft, CaretRight, X, Play, Pause, ArrowsClockwise, ListChecks,
  Trophy, LockSimpleOpen, LockSimple, Confetti, ShareNetwork, Copy,
  UserPlus, Sparkle, CaretDown, Rocket,
} from "@phosphor-icons/react";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { introTrack, type IntroScreen, type IntroDay, type IntroTrack } from "../data/introWeek";
import { noDot } from "../lib/utils";
import { playCorrect, playWin, playTick, playLaunch, playUnlock, playAlarm, playWheelSpin, playWheelStop, playDuel } from "../lib/sound";
import { CompetitorBoard } from "../activities/CompetitorBoard";
import { loadClasses, loadActiveClassId } from "../lib/rosterStore";
import { loadCapsule, addCapsuleGoal, type CapsuleGoal } from "../lib/capsuleStore";
import { isSubscribed, goToPricing } from "../lib/subscriptionStore";

const EASE = [0.32, 0.72, 0, 1] as const;

interface Pal {
  bg: string; panel: string; ink: string; sub: string; accent: string; accentSoft: string; ring: string;
}
const SPACE_PAL: Pal = { bg: "#0a0a2e", panel: "#14143f", ink: "#f1f0ff", sub: "#b3a8ff", accent: "#8b7fff", accentSoft: "#b3a8ff", ring: "#8b7fff" };
const ACADEMY_PAL: Pal = { bg: "#080d14", panel: "#0f1a24", ink: "#e6fbff", sub: "#5fe3f7", accent: "#22d3ee", accentSoft: "#34d399", ring: "#22d3ee" };

/* ————————————————————————— شاشات تفاعلية ————————————————————————— */

/** عدّاد الانطلاق التنازلي. */
function CountdownScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const start = screen.data?.seconds ?? 10;
  const [n, setN] = useState<number | null>(null);
  const [launched, setLaunched] = useState(false);

  function begin() {
    setLaunched(false);
    setN(start);
  }
  useEffect(() => {
    if (n === null) return;
    if (n <= 0) {
      setLaunched(true);
      playLaunch();
      return;
    }
    playTick(n <= 3);
    const t = setTimeout(() => setN((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 text-center">
      {!launched ? (
        <motion.div
          key={n ?? "idle"}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display leading-none"
          style={{ fontSize: "min(26vh, 14rem)", color: pal.accent, textShadow: `0 0 60px ${pal.accent}` }}
        >
          {n === null ? "🚀" : n}
        </motion.div>
      ) : (
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
          <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="text-9xl">🚀</motion.div>
          <h2 className="font-display text-4xl sm:text-6xl" style={{ color: pal.ink }}>{noDot(screen.headline ?? "")}</h2>
        </motion.div>
      )}
      {(n === null || launched) && (
        <button onClick={begin} className="rounded-full px-8 py-4 text-lg font-bold text-black shadow-2xl transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: pal.accent }}>
          {launched ? "أعد الانطلاق 🚀" : "ابدأ العدّ التنازلي"}
        </button>
      )}
    </div>
  );
}

/** الرسالة المشفّرة — كتابة برقية ثم فكّ الشفرة. */
function CipherScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const c = screen.data?.cipher;
  const full = screen.headline ?? "";
  const [typed, setTyped] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setTyped(""); setSolved(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [screen.id]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 text-center font-mono">
      <p className="max-w-3xl text-2xl leading-relaxed sm:text-4xl" style={{ color: pal.accentSoft }}>
        {typed}<span className="animate-pulse">▍</span>
      </p>
      {!solved ? (
        <>
          <div className="rounded-2xl border p-6" style={{ borderColor: `${pal.accent}55`, background: pal.panel }}>
            <p className="text-sm" style={{ color: pal.sub }}>الشفرة، {c?.key}</p>
            <p dir="ltr" className="mt-3 text-2xl tracking-widest" style={{ color: pal.ink }}>{c?.encoded}</p>
          </div>
          <button onClick={() => { setSolved(true); playUnlock(); }} className="rounded-full px-8 py-4 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: pal.accent }}>
            فكّوا الشفرة 🔓
          </button>
        </>
      ) : (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="text-7xl">🎖️</div>
          <p className="font-display text-4xl sm:text-6xl" style={{ color: pal.ink }}>{noDot(c?.solved ?? "")}</p>
        </motion.div>
      )}
    </div>
  );
}

/** عجلة التعارف — تدور وتختار اسمًا وتعرض بطاقة سؤال. */
function WheelScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  // أسماء الفصل النشط إن وُجدت، وإلا أسماء عيّنة قابلة للتعديل.
  const rosterNames = useMemo(() => {
    const cls = loadClasses();
    const active = cls.find((c) => c.id === loadActiveClassId()) ?? cls.find((c) => c.students.length > 0);
    return active?.students ?? [];
  }, []);
  const [names, setNames] = useState<string[]>(rosterNames.length > 0 ? rosterNames : ["ماجد", "سارة", "خالد", "نورة", "فيصل", "ريم", "عبدالله", "لمى"]);
  const [draft, setDraft] = useState("");
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<{ name: string; q: string } | null>(null);
  const qs = screen.data?.questions ?? [];

  const seg = 360 / Math.max(names.length, 1);
  const colors = names.map((_, i) => `hsl(${(i * 360) / names.length} 70% 55%)`);
  const gradient = `conic-gradient(${names.map((_, i) => `${colors[i]} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})`;

  const SPIN_DUR = 3.4;
  function spin() {
    if (spinning || names.length === 0) return;
    setSpinning(true); setPicked(null);
    playWheelSpin(SPIN_DUR);
    const turns = 5 + Math.floor(Math.random() * 4);
    const target = Math.random() * 360;
    const final = angle + turns * 360 + target;
    setAngle(final);
    setTimeout(() => {
      // السهم في الأعلى (12 ساعة) — نحسب القطاع تحته
      const norm = (360 - (final % 360) + 90) % 360;
      const idx = Math.floor(norm / seg) % names.length;
      setPicked({ name: names[idx], q: qs[Math.floor(Math.random() * qs.length)] || "" });
      setSpinning(false);
      playWheelStop();
    }, SPIN_DUR * 1000);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2 px-4">
        {names.map((nm) => (
          <span key={nm} className="group flex items-center gap-1 rounded-full px-3 py-1 text-sm" style={{ background: pal.panel, color: pal.ink }}>
            {nm}
            <button onClick={() => setNames((v) => v.filter((x) => x !== nm))} className="opacity-50 hover:opacity-100">×</button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { setNames((v) => [...v, draft.trim()]); setDraft(""); } }}
          placeholder="أضف اسمًا +"
          className="w-28 rounded-full border bg-transparent px-3 py-1 text-sm outline-none"
          style={{ borderColor: `${pal.accent}55`, color: pal.ink }}
        />
      </div>

      {/* العجلة أصغر وأخفت كي لا تحجب الأسماء فوقها، وزر الإعادة يختبئ خلفها */}
      <div className="relative" style={{ width: "min(30vh, 15rem)", height: "min(30vh, 15rem)" }}>
        <button
          onClick={spin}
          disabled={spinning}
          className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
          style={{ background: pal.accent, boxShadow: `0 0 20px ${pal.accent}` }}
        >
          {spinning ? "..." : "أدِر"}
        </button>
        <div className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2 text-2xl" style={{ color: pal.accent }}>▼</div>
        <motion.div
          className="h-full w-full rounded-full border-2"
          style={{ background: gradient, borderColor: `${pal.accent}88`, opacity: 0.62, boxShadow: `0 0 24px ${pal.accent}44` }}
          animate={{ rotate: angle }}
          transition={{ duration: SPIN_DUR, ease: [0.15, 0.85, 0.25, 1] }}
        />
      </div>

      <AnimatePresence>
        {picked && (
          <motion.div initial={{ y: 20, opacity: 0, scale: 0.85 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-xl border-2 px-5 py-3 text-center" style={{ borderColor: pal.accent, background: pal.panel }}>
            <p className="font-display text-2xl" style={{ color: pal.accent }}>{picked.name}</p>
            <p className="mt-1 text-base" style={{ color: pal.ink }}>{noDot(picked.q)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** بطاقات تتقدّم — للأسئلة والمواقف، أو صناديق المواهب. */
function CardsScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const boxes = screen.data?.boxes;
  const prompts = screen.data?.prompts ?? [];
  const [i, setI] = useState(0);
  const [openBox, setOpenBox] = useState<number | null>(null);

  if (boxes) {
    return (
      <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {boxes.map((b, idx) => (
            <motion.button
              key={b.label}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setOpenBox(idx); playCorrect(); }}
              className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 sm:h-28 sm:w-32"
              style={{ borderColor: openBox === idx ? pal.accent : `${pal.accent}44`, background: pal.panel }}
            >
              <span className="text-4xl">{openBox === idx ? "📭" : "🎁"}</span>
              <span className="text-xs font-semibold sm:text-sm" style={{ color: pal.ink }}>{b.label}</span>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {openBox !== null && (
            <motion.div key={openBox} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl shrink-0 rounded-2xl border-2 px-6 py-4 text-center" style={{ borderColor: pal.accent, background: pal.panel }}>
              <p className="text-sm" style={{ color: pal.sub }}>{boxes[openBox].label}</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: pal.ink }}>{noDot(boxes[openBox].challenge)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex min-h-[10rem] max-w-3xl items-center justify-center rounded-[1.5rem] border-2 px-10 py-10"
          style={{ borderColor: pal.accent, background: pal.panel }}
        >
          <p className="font-display text-3xl leading-snug sm:text-5xl" style={{ color: pal.ink }}>{noDot(prompts[i] ?? "")}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-4">
        <button onClick={() => setI((v) => (v - 1 + prompts.length) % prompts.length)} className="flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: `${pal.accent}66`, color: pal.ink }}>
          <CaretRight className="h-6 w-6" />
        </button>
        <span className="text-sm" style={{ color: pal.sub }}>{i + 1} / {prompts.length}</span>
        <button onClick={() => { setI((v) => (v + 1) % prompts.length); playCorrect(); }} className="flex h-12 w-12 items-center justify-center rounded-full text-black" style={{ background: pal.accent }}>
          <CaretLeft className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

/** مؤقّت عملاق + لوحة تحكيم وصدارة. */
function TimerScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const total = screen.data?.seconds ?? 600;
  const criteria = screen.data?.criteria ?? [];
  const prompts = screen.data?.prompts;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const ended = left <= 0;
  const urgent = left <= total * 0.2 && left > 0;

  useEffect(() => {
    if (!running || left <= 0) return;
    const id = setInterval(() => setLeft((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [running, left]);
  useEffect(() => {
    if (ended && running) { setRunning(false); playWin(); }
  }, [ended, running]);
  useEffect(() => { if (urgent) playTick(true); }, [Math.max(0, left)]); // نبضة في الوقت الحرج

  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");

  return (
    <div className="h-full overflow-y-auto">
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-6">
      {prompts && (
        <p className="max-w-2xl text-center text-lg" style={{ color: pal.sub }}>
          موضوع عشوائي: <span className="font-bold" style={{ color: pal.ink }}>{noDot(prompts[Math.floor((total - left) / 8) % prompts.length])}</span>
        </p>
      )}
      <motion.div
        key={urgent ? "u" : "n"}
        animate={urgent ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}
        className="shrink-0 font-display tabular-nums leading-none"
        style={{ fontSize: "min(20vh, 9rem)", color: ended ? "#22c55e" : urgent ? "#ef4444" : pal.accent, textShadow: `0 0 50px ${urgent ? "#ef4444" : pal.accent}66` }}
        dir="ltr"
      >
        {mm}:{ss}
      </motion.div>

      <div className="flex gap-3">
        <button onClick={() => setRunning((v) => !v)} className="flex items-center gap-2 rounded-full px-6 py-3 font-bold text-black" style={{ background: pal.accent }}>
          {running ? <><Pause weight="fill" className="h-5 w-5" /> إيقاف</> : <><Play weight="fill" className="h-5 w-5" /> بدء</>}
        </button>
        <button onClick={() => { setLeft(total); setRunning(false); }} className="flex items-center gap-2 rounded-full border px-5 py-3 font-semibold" style={{ borderColor: `${pal.accent}66`, color: pal.ink }}>
          <ArrowsClockwise className="h-5 w-5" /> إعادة
        </button>
      </div>

      {/* لوحة التنافس: أفراد / مجموعات / فصول، بإظهار النقاط أو إخفائها */}
      {criteria.length > 0 && (
        <p className="flex items-center gap-2 text-xs" style={{ color: pal.sub }}>
          <ListChecks className="h-3.5 w-3.5" /> معايير التحكيم: {criteria.map(noDot).join(" · ")}
        </p>
      )}
      <CompetitorBoard pal={{ accent: pal.accent, accentSoft: pal.accentSoft, ink: pal.ink }} />
    </div>
    </div>
  );
}

/** غرفة الهروب — أربع شفرات وأقفال. */
function EscapeScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const codes = screen.data?.codes ?? [];
  const total = screen.data?.seconds ?? 1500;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [opened, setOpened] = useState<boolean[]>(codes.map(() => false));
  const [drafts, setDrafts] = useState<string[]>(codes.map(() => ""));
  const [shownHint, setShownHint] = useState<number | null>(null);
  const allOpen = opened.every(Boolean);

  useEffect(() => {
    if (!running || left <= 0 || allOpen) return;
    const id = setInterval(() => setLeft((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [running, left, allOpen]);
  useEffect(() => { if (allOpen) playWin(); }, [allOpen]);

  function tryOpen(idx: number) {
    if (drafts[idx].trim() === codes[idx].answer) {
      setOpened((v) => v.map((o, i) => (i === idx ? true : o)));
      playUnlock();
    } else {
      playAlarm();
      setShownHint(idx);
    }
  }

  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");

  return (
    <div className="relative flex h-full flex-col items-center gap-5 overflow-y-auto px-4 py-6">
      {!allOpen && (
        <motion.div className="pointer-events-none fixed inset-0" animate={{ opacity: running ? [0.05, 0.16, 0.05] : 0.05 }} transition={{ duration: 1.4, repeat: Infinity }} style={{ background: "radial-gradient(circle at 50% 40%, #ef444455, transparent 70%)" }} />
      )}
      <div className="z-10 flex items-center gap-4">
        <span className="font-display tabular-nums text-5xl" dir="ltr" style={{ color: left <= total * 0.2 ? "#ef4444" : pal.accent }}>{mm}:{ss}</span>
        <button onClick={() => setRunning((v) => !v)} className="rounded-full px-5 py-2 font-bold text-black" style={{ background: pal.accent }}>{running ? "إيقاف" : "بدء المهمة"}</button>
      </div>

      {allOpen ? (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="text-8xl">🎉</div>
          <h2 className="font-display text-5xl" style={{ color: pal.accentSoft }}>خرجتم!</h2>
          <p className="text-xl" style={{ color: pal.ink }}>لا شفرة تُفكّ بمفردك، التعاون فتح الباب</p>
        </motion.div>
      ) : (
        <div className="z-10 grid w-full max-w-4xl gap-4 sm:grid-cols-2">
          {codes.map((c, idx) => (
            <div key={idx} className="rounded-2xl border-2 p-4" style={{ borderColor: opened[idx] ? "#22c55e" : `${pal.accent}44`, background: pal.panel }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: pal.sub }}>شفرة {idx + 1} · {c.kind}</span>
                {opened[idx] ? <LockSimpleOpen weight="fill" className="h-6 w-6" style={{ color: "#22c55e" }} /> : <LockSimple weight="fill" className="h-6 w-6" style={{ color: pal.accent }} />}
              </div>
              <p className="mt-2 text-lg font-semibold" style={{ color: pal.ink }}>{noDot(c.clue)}</p>
              {!opened[idx] && (
                <>
                  <div className="mt-3 flex gap-2">
                    <input value={drafts[idx]} onChange={(e) => setDrafts((v) => v.map((d, i) => (i === idx ? e.target.value : d)))} placeholder="الجواب" className="flex-1 rounded-lg border bg-transparent px-3 py-2 outline-none" style={{ borderColor: `${pal.accent}55`, color: pal.ink }} />
                    <button onClick={() => tryOpen(idx)} className="rounded-lg px-4 font-bold text-black" style={{ background: pal.accent }}>افتح</button>
                  </div>
                  {shownHint === idx && <p className="mt-2 text-sm" style={{ color: pal.accentSoft }}>💡 {noDot(c.hint)}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** شجرة الفصل — كل أمنية ورقة تنبت. */
function TreeScreen({ pal }: { pal: Pal }) {
  const [leaves, setLeaves] = useState<{ word: string; x: number; y: number }[]>([]);
  const [draft, setDraft] = useState("");
  function add() {
    if (!draft.trim()) return;
    const x = 20 + Math.random() * 60;
    const y = 8 + Math.random() * 42;
    setLeaves((v) => [...v, { word: draft.trim(), x, y }]);
    setDraft(""); playCorrect();
  }
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6">
      <div className="relative flex-1" style={{ width: "min(90vw, 40rem)", minHeight: "40vh" }}>
        {/* الجذع */}
        <div className="absolute bottom-0 left-1/2 h-1/2 w-3 -translate-x-1/2 rounded-t" style={{ background: "#7c5a3a" }} />
        <div className="absolute bottom-[42%] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full" style={{ background: `${pal.accent}18` }} />
        <AnimatePresence>
          {leaves.map((l, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
              transition={{ scale: { duration: 0.4, ease: EASE }, y: { duration: 3, repeat: Infinity, delay: i * 0.1 } }}
              className="absolute rounded-full px-3 py-1 text-sm font-semibold"
              style={{ left: `${l.x}%`, top: `${l.y}%`, background: `hsl(${100 + i * 12} 60% 45%)`, color: "#fff" }}
            >
              {l.word}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="كلمة أمنية للفصل..." className="w-56 rounded-full border bg-transparent px-4 py-2 outline-none" style={{ borderColor: `${pal.accent}66`, color: pal.ink }} />
        <button onClick={add} className="rounded-full px-6 py-2 font-bold text-black" style={{ background: pal.accent }}>ازرعها 🌱</button>
      </div>
      <p className="text-sm" style={{ color: pal.sub }}>{leaves.length} ورقة أورقت في شجرة فصلنا</p>
    </div>
  );
}

/** التتويج / إعلان الرتب. */
function CrownScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const titles = screen.data?.titles ?? [];
  const [shown, setShown] = useState(0);
  function reveal() {
    if (shown >= titles.length) { setShown(0); return; }
    setShown((v) => v + 1);
    playWin();
  }
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <AnimatePresence>
        {shown > 0 && shown <= titles.length && (
          <motion.div key={shown} initial={{ scale: 0.4, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="rounded-[1.5rem] border-2 px-10 py-8" style={{ borderColor: pal.accent, background: pal.panel, boxShadow: `0 0 60px ${pal.accent}55` }}>
            <div className="text-7xl">{titles[shown - 1].emoji}</div>
            <p className="mt-3 font-display text-4xl" style={{ color: pal.accent }}>{noDot(titles[shown - 1].label)}</p>
            <p className="mt-1 text-lg" style={{ color: pal.sub }}>الطالب: __________</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap justify-center gap-2">
        {titles.map((t, i) => (
          <span key={t.label} className="rounded-full px-3 py-1 text-sm" style={{ background: i < shown ? pal.accent : pal.panel, color: i < shown ? "#000" : pal.sub }}>{t.emoji} {t.label}</span>
        ))}
      </div>
      <button onClick={reveal} className="rounded-full px-8 py-4 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95" style={{ background: pal.accent }}>
        {shown >= titles.length ? "أعد التتويج 🏆" : shown === 0 ? "ابدأ التتويج 🏆" : "اللقب التالي"}
      </button>
    </div>
  );
}

/** محرّك النمو — مشاركة إنجاز الفصل ودعوة رواد النشاط. */
function GrowthScreen({ screen, pal, track }: { screen: IntroScreen; pal: Pal; track: IntroTrack }) {
  const [invited, setInvited] = useState(0);
  const [copied, setCopied] = useState(false);
  const goal = 3;
  const baseRank = 27;
  const rank = Math.max(1, baseRank - invited * 8);
  const link = "نشاط.منصة/دعوة/رائد-٩٣٤";

  const board = useMemo(() => {
    const others = [
      { name: "متوسطة الأندلس", pts: 940 },
      { name: "ابتدائية الرواد", pts: 910 },
      { name: "متوسطة اليرموك", pts: 880 },
      { name: "ابتدائية النخبة", pts: 850 },
    ];
    const mine = { name: "مدرستك", pts: 600 + invited * 130, me: true };
    return [...others, mine].sort((a, b) => b.pts - a.pts).slice(0, 5);
  }, [invited]);

  function copy() {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true); playCorrect();
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex h-full flex-col items-center gap-5 overflow-y-auto px-5 py-6">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl">🎇</motion.div>
      <h2 className="text-center font-display text-3xl" style={{ color: pal.ink }}>{noDot(screen.headline ?? "")}</h2>

      {/* بطاقة إنجاز الفصل، قابلة للمشاركة */}
      <div className="w-full max-w-md rounded-[1.5rem] border-2 p-5 text-center" style={{ borderColor: pal.accent, background: `linear-gradient(160deg, ${pal.panel}, ${pal.bg})` }}>
        <p className="text-sm" style={{ color: pal.sub }}>أنهى فصلنا</p>
        <p className="font-display text-2xl" style={{ color: pal.accent }}>{noDot(track.theme)}</p>
        <div className="mt-3 flex justify-center gap-4 text-center">
          <div><p className="font-display text-3xl" style={{ color: pal.ink }}>5</p><p className="text-xs" style={{ color: pal.sub }}>أيام</p></div>
          <div><p className="font-display text-3xl" style={{ color: pal.ink }}>18</p><p className="text-xs" style={{ color: pal.sub }}>تحديًا</p></div>
          <div><p className="font-display text-3xl" style={{ color: pal.ink }}>100٪</p><p className="text-xs" style={{ color: pal.sub }}>حماس</p></div>
        </div>
        <button onClick={copy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 font-bold text-black" style={{ background: pal.accent }}>
          <ShareNetwork weight="fill" className="h-5 w-5" /> شارك إنجاز فصلك
        </button>
      </div>

      {/* حلبة المدارس + الدعوة */}
      <div className="w-full max-w-md rounded-[1.5rem] border p-5" style={{ borderColor: `${pal.accent}44`, background: pal.panel }}>
        <p className="flex items-center gap-2 font-display text-lg" style={{ color: pal.ink }}>
          <Trophy weight="fill" className="h-5 w-5" style={{ color: pal.accent }} /> حلبة المدارس، مركزك #{rank}
        </p>
        <div className="mt-3 space-y-1.5">
          {board.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 rounded-lg px-3 py-1.5" style={{ background: (s as { me?: boolean }).me ? `${pal.accent}22` : "transparent" }}>
              <span className="w-5 font-display" style={{ color: pal.sub }}>{i + 1}</span>
              <span className="flex-1 font-semibold" style={{ color: (s as { me?: boolean }).me ? pal.accent : pal.ink }}>{s.name}</span>
              <span className="font-display tabular-nums" style={{ color: pal.sub }}>{s.pts}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border p-3" style={{ borderColor: `${pal.accent}44` }}>
          <p className="text-sm font-semibold" style={{ color: pal.ink }}>ادعُ رائد نشاط... ارفع مدرستك</p>
          <p className="mt-1 text-xs" style={{ color: pal.sub }}>كل زميل ينضم يرفع مدرستك في حلبة المدارس ويقرّبك من الصدارة</p>
          {/* شريط التقدّم */}
          <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: `${pal.accent}22` }}>
            <motion.div className="h-full rounded-full" style={{ background: pal.accent }} animate={{ width: `${Math.min(100, (invited / goal) * 100)}%` }} />
          </div>
          <p className="mt-1 text-xs" style={{ color: pal.sub }}>{invited} / {goal}، {invited >= goal ? "فتحتَ الأسبوع الإضافي! 🎁" : `ادعُ ${goal - invited} ليُفتح الأسبوع الإضافي`}</p>

          <div className="mt-3 flex gap-2">
            <div dir="ltr" className="flex-1 truncate rounded-lg border px-3 py-2 text-sm" style={{ borderColor: `${pal.accent}44`, color: pal.sub }}>{link}</div>
            <button onClick={copy} className="flex items-center gap-1 rounded-lg px-3 font-semibold text-black" style={{ background: pal.accent }}>
              <Copy className="h-4 w-4" /> {copied ? "نُسخ" : "انسخ"}
            </button>
          </div>
          <button onClick={() => { setInvited((v) => Math.min(goal, v + 1)); playWin(); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border py-2 font-semibold" style={{ borderColor: pal.accent, color: pal.accent }}>
            <UserPlus weight="fill" className="h-4 w-4" /> دعوت زميلًا
          </button>
        </div>
      </div>
    </div>
  );
}

/** خريطة الكنز — كل نقطة لغزٌ يُخمَّن ثم مهمّة، وإنجازها يمنح قطعة تُجمّع كلمة الكنز. */
function MapScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const spots = screen.data?.boxes ?? [];
  const treasure = screen.data?.treasure ?? "";
  const reveal = screen.data?.reveal ?? "وجدتم الكنز!";
  const [open, setOpen] = useState<number | null>(null);
  const [phase, setPhase] = useState<"riddle" | "mission">("riddle");
  const [found, setFound] = useState<boolean[]>(spots.map(() => false));
  const allFound = spots.length > 0 && found.every(Boolean);

  useEffect(() => { if (allFound) playWin(); }, [allFound]);

  function openSpot(i: number) { setOpen(i); setPhase(found[i] ? "mission" : "riddle"); }
  function complete(i: number) {
    setFound((v) => v.map((x, j) => (j === i ? true : x)));
    setOpen(null);
    playUnlock();
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 py-4 text-center">
      {!allFound && (
        <p className="max-w-2xl text-base font-semibold sm:text-lg" style={{ color: pal.sub }}>
          {noDot(screen.headline ?? "")}
        </p>
      )}

      {/* شبكة النقاط الغامضة */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {spots.map((s, i) => (
          <motion.button key={s.label} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            animate={found[i] ? { rotate: [0, -4, 4, 0] } : {}}
            onClick={() => openSpot(i)}
            className="relative flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 sm:h-32 sm:w-32"
            style={{ borderColor: found[i] ? "#22c55e" : `${pal.accent}55`, background: found[i] ? "#22c55e22" : pal.panel }}>
            <span className="text-4xl">{found[i] ? s.emoji : "❓"}</span>
            <span className="text-[11px] font-semibold sm:text-xs" style={{ color: found[i] ? pal.ink : pal.sub }}>
              {found[i] ? s.label : "نقطة غامضة"}
            </span>
            {found[i] && s.piece && (
              <span className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-black shadow" style={{ background: pal.accent }}>{s.piece}</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* شريط قطع الخريطة، الكلمة السرّية تتجمّع */}
      {treasure && !allFound && (
        <div className="flex items-center gap-2" dir="rtl">
          <span className="text-sm font-semibold" style={{ color: pal.sub }}>قطع الخريطة:</span>
          {spots.map((s, i) => (
            <span key={i} className="flex h-9 w-9 items-center justify-center rounded-lg border-2 text-lg font-black"
              style={{ borderColor: found[i] ? pal.accent : `${pal.sub}44`, color: found[i] ? pal.ink : "transparent", background: found[i] ? `${pal.accent}22` : "transparent" }}>
              {found[i] ? s.piece : "•"}
            </span>
          ))}
        </div>
      )}

      {/* بطاقة اللغز ← المهمة */}
      <AnimatePresence mode="wait">
        {open !== null && (
          <motion.div key={`${open}-${phase}`} initial={{ scale: 0.7, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-xl rounded-3xl border-2 px-7 py-5" style={{ borderColor: pal.accent, background: pal.panel }}>
            {phase === "riddle" ? (
              <>
                <p className="text-sm font-bold" style={{ color: pal.accent }}>🧭 لغز النقطة الغامضة</p>
                <p className="mt-2 text-xl font-bold leading-relaxed" style={{ color: pal.ink }}>{noDot(spots[open].riddle ?? spots[open].label)}</p>
                <p className="mt-2 text-sm" style={{ color: pal.sub }}>خمّنوا المرفق... ثم اكشفوه!</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button onClick={() => setOpen(null)} className="rounded-full px-5 py-2 text-sm font-bold" style={{ color: pal.sub, background: `${pal.sub}22` }}>لاحقًا</button>
                  <button onClick={() => { setPhase("mission"); playCorrect(); }} className="rounded-full px-6 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>اكشفوا المكان! ✦</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl">{spots[open].emoji}</p>
                <p className="text-lg font-black" style={{ color: pal.ink }}>{spots[open].label}</p>
                <div className="my-3 h-px" style={{ background: `${pal.sub}33` }} />
                <p className="text-sm font-bold" style={{ color: pal.accent }}>🎯 مهمّة الفريق</p>
                <p className="mt-1 text-lg font-bold leading-relaxed" style={{ color: pal.ink }}>{noDot(spots[open].challenge)}</p>
                <button onClick={() => complete(open)} className="mt-4 rounded-full px-6 py-2 text-sm font-bold text-black" style={{ background: "#22c55e" }}>
                  {found[open] ? "تمام ✓" : `أنجزناها، خذوا القطعة «${spots[open].piece ?? "✓"}» ✓`}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* كشف الكنز النهائي */}
      {allFound && (
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
          <div className="flex gap-2" dir="rtl">
            {treasure.split("").map((ch, i) => (
              <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.12 }}
                className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-black text-black shadow-lg" style={{ background: pal.accent }}>{ch}</motion.span>
            ))}
          </div>
          <p className="font-display text-2xl" style={{ color: "#22c55e" }}>🗺️ الكنز: «{treasure}»</p>
          <p className="max-w-xl text-lg font-bold" style={{ color: pal.ink }}>{noDot(reveal)}</p>
        </motion.div>
      )}
    </div>
  );
}

/** سحابة المواهب — كل مهارة تُضاف تطفو ككلمة بحجم ولون. */
function WordCloudScreen({ screen, pal }: { screen?: IntroScreen; pal: Pal }) {
  const inputHint = screen?.data?.prompts?.[0] ?? "مهارة طالب... (رسم، برمجة، قيادة)";
  const emptyHint = noDot(screen?.headline ?? "أضف مهارات الفصل لتتشكّل سحابة الهوية");
  const [words, setWords] = useState<{ w: string; size: number; hue: number; x: number; y: number }[]>([]);
  const [draft, setDraft] = useState("");
  function add() {
    if (!draft.trim()) return;
    setWords((v) => [...v, { w: draft.trim(), size: 1 + Math.random() * 1.4, hue: (v.length * 47) % 360, x: 8 + Math.random() * 78, y: 8 + Math.random() * 74 }]);
    setDraft(""); playCorrect();
  }
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6">
      <div className="relative w-full max-w-3xl flex-1" style={{ minHeight: "42vh" }}>
        <AnimatePresence>
          {words.map((it, i) => (
            <motion.span key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
              transition={{ scale: { duration: 0.4 }, y: { duration: 3 + (i % 3), repeat: Infinity } }}
              className="absolute font-display font-bold"
              style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `${it.size}rem`, color: `hsl(${it.hue} 70% 65%)`, textShadow: `0 2px 12px rgba(0,0,0,0.5)` }}>
              {it.w}
            </motion.span>
          ))}
          {words.length === 0 && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md px-4 text-center text-sm" style={{ color: pal.sub }}>{emptyHint}</span>}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={inputHint} className="w-64 rounded-full border bg-transparent px-4 py-2 outline-none" style={{ borderColor: `${pal.accent}66`, color: pal.ink }} />
        <button onClick={add} className="rounded-full px-6 py-2 font-bold text-black" style={{ background: pal.accent }}>أضف ✦</button>
      </div>
      <p className="text-sm" style={{ color: pal.sub }}>{words.length} كلمة في سحابة فصلنا</p>
    </div>
  );
}

/** مناظرة الأبطال — تصويت على قضية جدلية مع رسم بياني حي. */
function VoteScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const prompts = screen.data?.prompts ?? [];
  const [i, setI] = useState(0);
  const [votes, setVotes] = useState<[number, number]>([0, 0]);
  const total = votes[0] + votes[1];
  useEffect(() => setVotes([0, 0]), [i]);
  const labels: [string, string] = ["مع", "ضد"];
  const colors = ["#3b82f6", "#ef4444"];
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="max-w-2xl font-display text-2xl leading-snug text-white sm:text-3xl">{noDot(prompts[i] ?? "")}</p>
      <div className="flex w-full max-w-xl items-end justify-center gap-8" style={{ height: "34vh" }}>
        {[0, 1].map((k) => {
          const pct = total ? Math.round((votes[k] / total) * 100) : 0;
          return (
            <div key={k} className="flex flex-1 flex-col items-center justify-end gap-2">
              <span className="font-display text-2xl" style={{ color: colors[k] }}>{votes[k]}</span>
              <motion.div className="w-full rounded-t-2xl" style={{ background: colors[k] }} animate={{ height: `${Math.max(4, pct)}%` }} />
              <button onClick={() => { setVotes((v) => (k === 0 ? [v[0] + 1, v[1]] : [v[0], v[1] + 1])); playTick(); }} className="rounded-full px-6 py-2.5 font-bold text-white" style={{ background: colors[k] }}>{labels[k]}</button>
            </div>
          );
        })}
      </div>
      <button onClick={() => setI((v) => (v + 1) % prompts.length)} className="rounded-full px-8 py-3 font-bold text-black" style={{ background: pal.accent }}>القضية التالية</button>
    </div>
  );
}

/** برج المعرفة — كل إجابة صحيحة تضيف لبنة، أول من يكمل برجه يفوز. */
function TowerScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const goal = screen.data?.seconds ?? 8; // نعيد استخدام seconds كهدف اللبنات
  const colors = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b"];
  const [towers, setTowers] = useState([
    { name: "الفريق الأزرق", bricks: 0 },
    { name: "الفريق الأخضر", bricks: 0 },
  ]);
  const winner = towers.find((t) => t.bricks >= goal);
  function addBrick(i: number) {
    if (winner) return;
    setTowers((v) => v.map((t, k) => (k === i ? { ...t, bricks: t.bricks + 1 } : t)));
    const next = towers[i].bricks + 1;
    if (next >= goal) playWin(); else playCorrect();
  }
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6">
      <p className="text-center text-sm" style={{ color: pal.sub }}>كل إجابة صحيحة = لبنة · أول من يبلغ {goal} لبنات يفوز</p>
      <div className="flex items-end justify-center gap-10" style={{ height: "50vh" }}>
        {towers.map((t, i) => (
          <div key={t.name} className="flex flex-col items-center gap-2">
            <div className="flex flex-col-reverse items-center gap-1" style={{ minHeight: "40vh", justifyContent: "flex-start" }}>
              <AnimatePresence>
                {Array.from({ length: t.bricks }).map((_, b) => (
                  <motion.div key={b} initial={{ y: -40, opacity: 0, scale: 0.6 }} animate={{ y: 0, opacity: 1, scale: 1 }} className="rounded-md" style={{ width: 84, height: 26, background: colors[i], boxShadow: `0 2px 8px ${colors[i]}66` }} />
                ))}
              </AnimatePresence>
            </div>
            <span className="font-display text-lg" style={{ color: pal.ink }}>{noDot(t.name)}</span>
            <span className="font-display text-2xl" style={{ color: colors[i] }}>{t.bricks}</span>
            <button onClick={() => addBrick(i)} disabled={!!winner} className="rounded-full px-5 py-2 text-sm font-bold text-black disabled:opacity-50" style={{ background: colors[i] }}>+ لبنة</button>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {winner && (
          <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl" style={{ color: pal.accent }}>🏆 {noDot(winner.name)} أكمل برجه أولًا!</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** مبارزة الأزرار — جرس رقمي: الأسرع يضغط يُقفل الخصم، ثم يُحكَم صحّة إجابته. */
function BuzzerScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const prompts = screen.data?.prompts ?? [];
  const names = screen.data?.questions ?? ["المتسابق الأول", "المتسابق الثاني"];
  const [qi, setQi] = useState(0);
  const [locked, setLocked] = useState<number | null>(null);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const colors = ["#3b82f6", "#ef4444"];
  function buzz(i: number) { if (locked === null) { setLocked(i); playDuel(); } }
  function judge(correct: boolean) {
    if (locked === null) return;
    if (correct) { setScores((s) => (locked === 0 ? [s[0] + 1, s[1]] : [s[0], s[1] + 1])); playWin(); }
    else playAlarm();
    setLocked(null); setQi((v) => (v + 1) % Math.max(prompts.length, 1));
  }
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex gap-6 text-sm">
        <span style={{ color: colors[0] }}>{noDot(names[0])}: <b className="font-display text-xl">{scores[0]}</b></span>
        <span style={{ color: colors[1] }}>{noDot(names[1])}: <b className="font-display text-xl">{scores[1]}</b></span>
      </div>
      <div className="max-w-2xl rounded-2xl border-2 px-8 py-6" style={{ borderColor: pal.accent, background: pal.panel }}>
        <p className="font-display text-2xl text-white sm:text-3xl">{noDot(prompts[qi] ?? "")}</p>
      </div>
      <div className="flex w-full max-w-2xl gap-4">
        {[0, 1].map((i) => (
          <button key={i} onClick={() => buzz(i)} disabled={locked !== null && locked !== i}
            className="flex-1 rounded-2xl py-8 font-display text-2xl text-white transition-all disabled:opacity-30"
            style={{ background: locked === i ? colors[i] : `${colors[i]}55`, boxShadow: locked === i ? `0 0 32px ${colors[i]}` : "none" }}>
            🔔 {noDot(names[i])}
          </button>
        ))}
      </div>
      {locked !== null ? (
        <div className="flex gap-3">
          <button onClick={() => judge(true)} className="rounded-full bg-green-500 px-6 py-2.5 font-bold text-white">إجابة صحيحة ✓</button>
          <button onClick={() => judge(false)} className="rounded-full bg-red-500 px-6 py-2.5 font-bold text-white">خطأ ✗</button>
        </div>
      ) : (
        <p className="text-sm" style={{ color: pal.sub }}>اضغط زر مَن ضغط الجرس أولًا</p>
      )}
    </div>
  );
}

/** مقياس الحماس — يقيس صوت تشجيع الفصل عبر الميكروفون فيحرّك المركبة نحو الفوز. */
function CheerScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const goal = screen.data?.seconds ?? 100;
  const [status, setStatus] = useState<"idle" | "asking" | "live" | "denied" | "unsupported">("idle");
  const [level, setLevel] = useState(0); // مستوى الصوت الحالي 0..1
  const [progress, setProgress] = useState(0); // تقدّم المركبة 0..goal
  const [won, setWon] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) === "undefined") {
      setStatus("unsupported"); return;
    }
    setStatus("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      setStatus("live"); setProgress(0); setWon(false);
      let raf = 0;
      let prog = 0;
      let running = true;
      const loop = () => {
        if (!running) return;
        analyser.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i];
        const avg = sum / buf.length / 255; // 0..1
        setLevel(avg);
        // الصوت فوق عتبة يدفع المركبة للأمام
        if (avg > 0.14) prog = Math.min(goal, prog + avg * 2.2);
        setProgress(prog);
        if (prog >= goal) { running = false; setWon(true); playWin(); }
        else raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      cleanupRef.current = () => { running = false; cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); ctx.close().catch(() => {}); };
    } catch {
      setStatus("denied");
    }
  }
  useEffect(() => () => cleanupRef.current?.(), []);

  const pct = Math.round((progress / goal) * 100);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
      {status === "idle" && (
        <>
          <div className="text-7xl">🚀</div>
          <p className="max-w-lg text-lg" style={{ color: pal.ink }}>{noDot(screen.headline ?? "")}</p>
          <button onClick={start} className="rounded-full px-8 py-4 text-lg font-bold text-black" style={{ background: pal.accent }}>🎤 اسمح بالميكروفون وابدأ</button>
          <p className="max-w-md text-xs" style={{ color: pal.sub }}>يستخدم الميكروفون لقياس صوت التشجيع فقط، لا يُسجَّل ولا يُرسَل أي صوت</p>
        </>
      )}
      {status === "asking" && <p style={{ color: pal.sub }}>بانتظار إذن الميكروفون من المتصفح...</p>}
      {(status === "denied" || status === "unsupported") && (
        <>
          <div className="text-5xl">🔇</div>
          <p className="max-w-md" style={{ color: pal.ink }}>
            {status === "denied" ? "لم يُسمح باستخدام الميكروفون، يمكنك تفعيله من إعدادات المتصفح والمحاولة، أو تحكيم الحماس يدويًا." : "المتصفح لا يدعم الميكروفون هنا، استخدم التحكيم اليدوي."}
          </p>
          <button onClick={() => { setStatus("live"); setProgress(0); setWon(false); }} className="rounded-full px-6 py-3 font-bold text-black" style={{ background: pal.accent }}>تحكيم يدوي 👏</button>
        </>
      )}
      {status === "live" && (
        <>
          <p className="text-sm" style={{ color: pal.sub }}>شجّعوا فريقكم بأعلى صوت! 📣</p>
          {/* مضمار السباق */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2" style={{ height: 96, borderColor: `${pal.accent}55`, background: pal.panel }}>
            <div className="absolute inset-y-0 left-4 flex items-center" style={{ color: pal.accentSoft }}>🏁</div>
            <motion.div className="absolute top-1/2 -translate-y-1/2 text-5xl" animate={{ left: `${4 + pct * 0.88}%` }} transition={{ type: "spring", stiffness: 60, damping: 14 }} style={{ right: "auto" }}>
              🚀
            </motion.div>
          </div>
          {/* مقياس مستوى الصوت */}
          <div className="w-full max-w-2xl">
            <div className="h-4 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: level > 0.5 ? "#22c55e" : pal.accent }} animate={{ width: `${Math.round(level * 100)}%` }} transition={{ duration: 0.1 }} />
            </div>
            <p className="mt-1 text-xs" style={{ color: pal.sub }}>مستوى الحماس · {pct}%</p>
          </div>
          {/* تحكيم يدوي احتياطي */}
          <div className="flex gap-2">
            <button onClick={() => { const np = Math.min(goal, progress + goal * 0.12); setProgress(np); if (np >= goal) { setWon(true); playWin(); } else playCorrect(); }} className="rounded-full px-5 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>👏 دفعة تشجيع</button>
            <button onClick={() => setProgress(0)} className="rounded-full border px-5 py-2 text-sm" style={{ borderColor: `${pal.accent}66`, color: pal.ink }}>إعادة</button>
          </div>
          <AnimatePresence>
            {won && <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl" style={{ color: pal.accent }}>🏆 وصلتم بحماسكم إلى خط النهاية!</motion.p>}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/** صدى الإيقاع — تسلسل حركات يكبر كل جولة، يُعرَض مضيئًا ثم يعيده الفصل. */
function RhythmScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const moves = screen.data?.moves ?? [];
  const [seq, setSeq] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [won, setWon] = useState(false);
  const timers = useRef<number[]>([]);
  const GOAL = 8;

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  function playSeq(s: number[]) {
    setPlaying(true);
    clearTimers();
    s.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => { setActive(i); playTick(); }, 720 * i + 300));
      timers.current.push(window.setTimeout(() => setActive(null), 720 * i + 720));
    });
    timers.current.push(window.setTimeout(() => { setActive(null); setPlaying(false); }, 720 * s.length + 400));
  }
  function nextRound() {
    const s = [...seq, Math.floor(Math.random() * Math.max(moves.length, 1))];
    setSeq(s);
    playSeq(s);
  }
  function success() { if (seq.length >= GOAL) { setWon(true); playWin(); } else nextRound(); }
  function fail() { clearTimers(); setActive(null); setPlaying(false); setSeq([]); playAlarm(); }
  function replay() { if (seq.length) playSeq(seq); }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-4 text-center">
      <p className="max-w-2xl text-base font-semibold sm:text-lg" style={{ color: pal.sub }}>{noDot(screen.headline ?? "")}</p>
      <p className="font-display text-xl" style={{ color: pal.accent }}>الجولة {seq.length || "، "} / {GOAL}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {seq.length === 0 && <span className="text-sm" style={{ color: pal.sub }}>اضغط «ابدأ» ليظهر أول حركة</span>}
        {seq.map((mi, i) => (
          <motion.div key={i} animate={active === i ? { scale: 1.35 } : { scale: 1 }} transition={{ duration: 0.2 }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl border-2"
            style={{ borderColor: active === i ? pal.accent : `${pal.accent}44`, background: active === i ? `${pal.accent}33` : pal.panel, boxShadow: active === i ? `0 0 24px ${pal.accent}` : "none" }}>
            <span className="text-4xl">{moves[mi]?.emoji}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {moves.map((m, i) => (
          <span key={i} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${pal.accent}44`, color: pal.sub }}>{m.emoji} {noDot(m.label)}</span>
        ))}
      </div>
      {won ? (
        <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl" style={{ color: pal.accent }}>🏆 أتقنتم إيقاعًا من {GOAL} حركات!</motion.p>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          {seq.length === 0 ? (
            <button onClick={nextRound} disabled={playing} className="rounded-full px-8 py-3 font-bold text-black disabled:opacity-50" style={{ background: pal.accent }}>▶ ابدأ</button>
          ) : (
            <>
              <button onClick={replay} disabled={playing} className="rounded-full border px-5 py-3 text-sm font-bold disabled:opacity-50" style={{ borderColor: `${pal.accent}66`, color: pal.ink }}>🔁 أعد العرض</button>
              <button onClick={success} disabled={playing} className="rounded-full px-6 py-3 font-bold text-black disabled:opacity-50" style={{ background: "#22c55e" }}>نجحوا ← حركة أصعب</button>
              <button onClick={fail} disabled={playing} className="rounded-full px-5 py-3 text-sm font-bold text-white disabled:opacity-50" style={{ background: "#ef4444" }}>أخطؤوا ← من البداية</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** بطاقات الذاكرة — اقلب بطاقتين وطابِق القيمة بسلوكها. */
function MemoryScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const pairs = screen.data?.pairs ?? [];
  const deck = useMemo(() => {
    const cards = pairs.flatMap((p, i) => [
      { id: i, text: p.term, key: `${i}-t` },
      { id: i, text: p.match, key: `${i}-m` },
    ]);
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.id]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const done = pairs.length > 0 && matched.length === pairs.length;

  function click(idx: number) {
    if (lock || flipped.includes(idx) || matched.includes(deck[idx].id)) return;
    const nf = [...flipped, idx];
    setFlipped(nf);
    if (nf.length === 2) {
      setLock(true);
      const [a, b] = nf;
      if (deck[a].id === deck[b].id) {
        window.setTimeout(() => {
          setMatched((m) => { const nm = [...m, deck[a].id]; if (nm.length === pairs.length) playWin(); else playCorrect(); return nm; });
          setFlipped([]); setLock(false);
        }, 650);
      } else {
        window.setTimeout(() => { setFlipped([]); setLock(false); }, 950);
      }
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-4 text-center">
      <p className="max-w-2xl text-base font-semibold sm:text-lg" style={{ color: pal.sub }}>{noDot(screen.headline ?? "")}</p>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {deck.map((c, idx) => {
          const isMatched = matched.includes(c.id);
          const up = flipped.includes(idx) || isMatched;
          return (
            <motion.button key={c.key} onClick={() => click(idx)} whileTap={{ scale: 0.95 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 p-1.5 text-center sm:h-28 sm:w-28"
              style={{ borderColor: isMatched ? "#22c55e" : up ? pal.accent : `${pal.accent}44`, background: isMatched ? "#22c55e22" : up ? pal.panel : `${pal.accent}11` }}>
              {up ? <span className="text-[11px] font-bold leading-tight sm:text-sm" style={{ color: pal.ink }}>{noDot(c.text)}</span>
                  : <span className="text-3xl">❓</span>}
            </motion.button>
          );
        })}
      </div>
      {done && <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl" style={{ color: pal.accent }}>🎉 طابقتم كل البطاقات!</motion.p>}
    </div>
  );
}

/** بينغو التعارف — شبكة ٣×٣، أول خطٍّ مكتمل يفوز. */
function BingoScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const cells = (screen.data?.cells ?? []).slice(0, 9);
  const [marked, setMarked] = useState<boolean[]>(cells.map(() => false));
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const bingo = LINES.some((ln) => ln.every((i) => marked[i]));
  useEffect(() => { if (bingo) playWin(); }, [bingo]);
  function toggle(i: number) { if (!marked[i]) playUnlock(); setMarked((m) => m.map((x, j) => (j === i ? !x : x))); }
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-4 text-center">
      <p className="max-w-2xl text-base font-semibold sm:text-lg" style={{ color: pal.sub }}>{noDot(screen.headline ?? "")}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {cells.map((c, i) => (
          <motion.button key={i} onClick={() => toggle(i)} whileTap={{ scale: 0.96 }}
            className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 p-2 text-center sm:h-32 sm:w-32"
            style={{ borderColor: marked[i] ? "#22c55e" : `${pal.accent}44`, background: marked[i] ? "#22c55e22" : pal.panel }}>
            <span className="text-[11px] font-semibold leading-tight sm:text-sm" style={{ color: marked[i] ? "#22c55e" : pal.ink }}>{marked[i] ? "✓ " : ""}{noDot(c)}</span>
          </motion.button>
        ))}
      </div>
      {bingo && <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl" style={{ color: pal.accent }}>🎉 بينغو! خطٌّ مكتمل</motion.p>}
    </div>
  );
}

/** وميض الأبطال — سباق رد فعل: انتظر التحوّل الأخضر ثم الأسرع لمسًا يفوز، والتسرّع يخسر. */
function ReactionScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const names = screen.data?.questions ?? ["الفريق الأول", "الفريق الثاني"];
  const GOAL = 3;
  const [phase, setPhase] = useState<"idle" | "waiting" | "go" | "result">("idle");
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [msg, setMsg] = useState("");
  const timer = useRef<number | null>(null);
  const colors = ["#3b82f6", "#ef4444"];
  const champion = scores[0] >= GOAL ? 0 : scores[1] >= GOAL ? 1 : null;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function award(i: number) { setScores((s) => (i === 0 ? [s[0] + 1, s[1]] : [s[0], s[1] + 1])); }
  function startRound() {
    if (champion !== null) return;
    setMsg(""); setPhase("waiting");
    const delay = 1200 + Math.random() * 2600;
    timer.current = window.setTimeout(() => { setPhase("go"); playTick(); }, delay);
  }
  function tap(i: number) {
    if (phase === "waiting") {
      if (timer.current) clearTimeout(timer.current);
      setMsg(`${noDot(names[i])} تسرّع قبل الإشارة! النقطة للخصم`); award(1 - i); setPhase("result"); playAlarm();
    } else if (phase === "go") {
      setMsg(`${noDot(names[i])} أسرع ⚡`); award(i); setPhase("result"); playWin();
    }
  }
  function reset() { setScores([0, 0]); setMsg(""); setPhase("idle"); }

  const bright = phase === "go";
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 py-4 text-center">
      <p className="max-w-2xl text-base font-semibold sm:text-lg" style={{ color: pal.sub }}>{noDot(screen.headline ?? "")}</p>
      <div className="flex gap-8 text-sm">
        <span style={{ color: colors[0] }}>{noDot(names[0])}: <b className="font-display text-xl">{scores[0]}</b></span>
        <span style={{ color: colors[1] }}>{noDot(names[1])}: <b className="font-display text-xl">{scores[1]}</b></span>
        <span style={{ color: pal.sub }}>الفوز عند {GOAL}</span>
      </div>

      <div className="flex w-full max-w-3xl gap-4" style={{ height: "34vh" }}>
        {[0, 1].map((i) => (
          <motion.button key={i} onClick={() => tap(i)} disabled={phase === "idle" || phase === "result" || champion !== null}
            animate={bright ? { scale: [1, 1.03, 1] } : { scale: 1 }} transition={{ duration: 0.4, repeat: bright ? Infinity : 0 }}
            className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 font-display text-2xl text-white disabled:cursor-default"
            style={{
              borderColor: bright ? "#22c55e" : `${colors[i]}66`,
              background: bright ? "#16a34a" : phase === "waiting" ? `${colors[i]}22` : `${colors[i]}44`,
              boxShadow: bright ? "0 0 40px #22c55e" : "none",
            }}>
            <span className="text-5xl">{bright ? "⚡" : phase === "waiting" ? "✋" : "🏁"}</span>
            {noDot(names[i])}
          </motion.button>
        ))}
      </div>

      {champion !== null ? (
        <div className="flex flex-col items-center gap-3">
          <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl" style={{ color: pal.accent }}>🏆 {noDot(names[champion])} بطل رد الفعل!</motion.p>
          <button onClick={reset} className="rounded-full px-6 py-2.5 font-bold text-black" style={{ background: pal.accent }}>جولة جديدة من الصفر</button>
        </div>
      ) : (
        <div className="flex min-h-[3rem] flex-col items-center gap-2">
          {phase === "waiting" && <p className="font-display text-xl" style={{ color: "#eab308" }}>استعدّوا... لا تلمسوا الآن!</p>}
          {phase === "go" && <p className="font-display text-2xl" style={{ color: "#22c55e" }}>الآن! المسوا جهتكم ⚡</p>}
          {msg && <p className="text-lg font-bold" style={{ color: pal.ink }}>{msg}</p>}
          {(phase === "idle" || phase === "result") && (
            <button onClick={startRound} className="rounded-full px-8 py-3 font-bold text-black" style={{ background: pal.accent }}>▶ ابدأ الجولة</button>
          )}
        </div>
      )}
    </div>
  );
}

/** كبسولة المستقبل — الطلاب يختمون أهدافهم فتُحفظ وتُفتح في لوحة التحكم آخر الفصل. */
function CapsuleScreen({ screen, pal }: { screen: IntroScreen; pal: Pal }) {
  const hint = screen.data?.prompts?.[0] ?? "هدفي هذا العام...";
  const [goals, setGoals] = useState<CapsuleGoal[]>(() => loadCapsule());
  const [text, setText] = useState("");
  const [who, setWho] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  function seal() {
    if (!text.trim()) return;
    const next = addCapsuleGoal(text, who);
    setGoals(next);
    setFlash(text.trim());
    setText(""); setWho("");
    playUnlock();
    window.setTimeout(() => setFlash(null), 1200);
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 py-4 text-center">
      <p className="max-w-2xl text-base font-semibold sm:text-lg" style={{ color: pal.sub }}>{noDot(screen.headline ?? "")}</p>
      <div className="relative">
        <motion.div animate={flash ? { scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] } : {}} transition={{ duration: 0.5 }} className="text-7xl">🔒</motion.div>
        <AnimatePresence>
          {flash && (
            <motion.span initial={{ y: -46, opacity: 0 }} animate={{ y: 8, opacity: 1 }} exit={{ y: 34, opacity: 0, scale: 0.3 }}
              className="absolute left-1/2 top-0 max-w-xs -translate-x-1/2 truncate rounded-full px-3 py-1 text-sm font-bold text-black" style={{ background: pal.accent }}>{noDot(flash)} ✦</motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className="font-display text-2xl" style={{ color: pal.accent }}>{goals.length} هدفًا مختومًا في الكبسولة</p>

      <div className="flex w-full max-w-xl flex-col items-center gap-2 sm:flex-row">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && seal()} placeholder={hint}
          className="flex-1 rounded-full border bg-transparent px-4 py-2.5 text-center outline-none" style={{ borderColor: `${pal.accent}66`, color: pal.ink }} />
        <input value={who} onChange={(e) => setWho(e.target.value)} onKeyDown={(e) => e.key === "Enter" && seal()} placeholder="الاسم (اختياري)"
          className="w-full rounded-full border bg-transparent px-4 py-2.5 text-center outline-none sm:w-40" style={{ borderColor: `${pal.accent}44`, color: pal.ink }} />
        <button onClick={seal} className="rounded-full px-6 py-2.5 font-bold text-black" style={{ background: pal.accent }}>اختِم 🔒</button>
      </div>

      {goals.length > 0 && (
        <div className="flex max-w-2xl flex-wrap justify-center gap-2">
          {goals.slice(-6).map((g) => (
            <span key={g.id} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${pal.accent}44`, color: pal.sub }}>{g.who ? `${noDot(g.who)}: ` : ""}{noDot(g.text)}</span>
          ))}
        </div>
      )}
      <p className="max-w-md text-xs" style={{ color: pal.sub }}>تُحفظ الأهداف وتُفتح من «كبسولة المستقبل» في لوحة التحكم آخر الفصل لقياس ما تحقّق</p>
    </div>
  );
}

/* ————————————————————————— قاذف الشاشة ————————————————————————— */

function ScreenBody({ screen, pal, track }: { screen: IntroScreen; pal: Pal; track: IntroTrack }) {
  switch (screen.kind) {
    case "countdown": return <CountdownScreen screen={screen} pal={pal} />;
    case "cipher": return <CipherScreen screen={screen} pal={pal} />;
    case "wheel": return <WheelScreen screen={screen} pal={pal} />;
    case "cards": return <CardsScreen screen={screen} pal={pal} />;
    case "timer": return <TimerScreen screen={screen} pal={pal} />;
    case "escape": return <EscapeScreen screen={screen} pal={pal} />;
    case "tree": return <TreeScreen pal={pal} />;
    case "crown": return <CrownScreen screen={screen} pal={pal} />;
    case "growth": return <GrowthScreen screen={screen} pal={pal} track={track} />;
    case "map": return <MapScreen screen={screen} pal={pal} />;
    case "wordcloud": return <WordCloudScreen screen={screen} pal={pal} />;
    case "vote": return <VoteScreen screen={screen} pal={pal} />;
    case "tower": return <TowerScreen screen={screen} pal={pal} />;
    case "buzzer": return <BuzzerScreen screen={screen} pal={pal} />;
    case "cheer": return <CheerScreen screen={screen} pal={pal} />;
    case "rhythm": return <RhythmScreen screen={screen} pal={pal} />;
    case "memory": return <MemoryScreen screen={screen} pal={pal} />;
    case "bingo": return <BingoScreen screen={screen} pal={pal} />;
    case "reaction": return <ReactionScreen screen={screen} pal={pal} />;
    case "capsule": return <CapsuleScreen screen={screen} pal={pal} />;
    default: return null;
  }
}

/* ————————————————————————— مشغّل اليوم ————————————————————————— */

function DayPlayer({ day, pal, track, onExit, locked, onSubscribe }: { day: IntroDay; pal: Pal; track: IntroTrack; onExit: () => void; locked?: boolean; onSubscribe?: () => void }) {
  const [s, setS] = useState(0);
  const [scenarioOpen, setScenarioOpen] = useState(true);
  const screen = day.screens[s];
  const last = s === day.screens.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: pal.bg }}>
      {/* ترويسة */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${pal.accent}22` }}>
        <button onClick={onExit} className="flex items-center gap-2 text-sm" style={{ color: pal.sub }}>
          <X className="h-5 w-5" /> خروج
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{day.emoji}</span>
          <span className="font-display" style={{ color: pal.ink }}>{noDot(day.planet)}</span>
        </div>
        <div className="flex gap-1.5">
          {day.screens.map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: i === s ? pal.accent : `${pal.accent}44` }} />
          ))}
        </div>
      </div>

      {/* عنوان الشاشة */}
      <div className="px-5 pt-3 text-center">
        <p className="text-sm" style={{ color: pal.sub }}>{noDot(screen.title)}</p>
      </div>

      {/* جسم الشاشة */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence>
          <motion.div key={screen.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3 }} className="absolute inset-0 overflow-y-auto">
            <ScreenBody screen={screen} pal={pal} track={track} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* لوحة سيناريو الرائد */}
      <AnimatePresence>
        {scenarioOpen && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="mx-4 mb-2 rounded-2xl border p-4" style={{ borderColor: `${pal.accent}44`, background: pal.panel }}>
            <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: pal.accent }}>
              <Sparkle weight="fill" className="h-3.5 w-3.5" /> سيناريو الرائد، ماذا تقول وتفعل
            </p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: pal.ink }}>{noDot(screen.scenario)}</p>
            {screen.minutes && <p className="mt-1 text-xs" style={{ color: pal.sub }}>⏱ نحو {screen.minutes} دقائق</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* شريط التحكّم */}
      <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderTop: `1px solid ${pal.accent}22` }}>
        <button onClick={() => setS((v) => Math.max(0, v - 1))} disabled={s === 0} className="flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ borderColor: `${pal.accent}66`, color: pal.ink }}>
          <CaretRight className="h-4 w-4" /> السابق
        </button>
        <button onClick={() => setScenarioOpen((v) => !v)} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm" style={{ color: pal.sub }}>
          <CaretDown className={`h-4 w-4 transition-transform ${scenarioOpen ? "" : "rotate-180"}`} /> السيناريو
        </button>
        {locked ? (
          <button onClick={onSubscribe} className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>
            <LockSimple weight="fill" className="h-4 w-4" /> اشترك لفتح بقية الأنشطة
          </button>
        ) : last ? (
          <button onClick={onExit} className="flex items-center gap-1 rounded-full px-6 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>
            أنهِ اليوم <Confetti weight="fill" className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={() => { setS((v) => v + 1); playCorrect(); }} className="flex items-center gap-1 rounded-full px-6 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>
            التالي <CaretLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ————————————————————————— الصفحة ————————————————————————— */

export function IntroWeek() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const stage = data.stage === "middle" ? "متوسط" : "ابتدائي";
  const track = introTrack(stage);
  const pal = stage === "متوسط" ? ACADEMY_PAL : SPACE_PAL;
  const [openDay, setOpenDay] = useState<IntroDay | null>(null);
  const subscribed = isSubscribed();

  return (
    <div className="relative min-h-screen overflow-x-clip pb-20" style={{ background: pal.bg }}>
      {/* نجوم/شبكة الخلفية */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {stage === "ابتدائي"
          ? Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="absolute rounded-full" style={{ width: 2, height: 2, left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, background: "#fff", opacity: 0.4 }} />
            ))
          : <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(${pal.accent} 1px, transparent 1px), linear-gradient(90deg, ${pal.accent} 1px, transparent 1px)`, backgroundSize: "44px 44px" }} />}
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-16">
        <button onClick={() => navigate("/الأسابيع", { state: data })} className="mb-6 flex items-center gap-2 text-sm" style={{ color: pal.sub }}>
          <CaretRight className="h-4 w-4" /> رجوع
        </button>

        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-5 py-1.5 text-sm font-semibold" style={{ borderColor: `${pal.accent}44`, color: pal.accentSoft }}>
            <Rocket weight="fill" className="h-4 w-4" /> الأسبوع التمهيدي الحافل
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-6xl" style={{ color: pal.ink }}>{noDot(track.theme)}</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg" style={{ color: pal.sub }}>{noDot(track.tagline)}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm" style={{ color: pal.sub }}>
            شاشة تُعرض على البروجكتر أمام الطلاب، وأنت تقودها بالنقر، بلا ورق ولا تحضير. بجانب كل شاشة سيناريو دقيق لما تقوله وتفعله
          </p>
        </div>

        {/* الأيام */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {track.days.map((day, i) => (
            <motion.button
              key={day.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ scale: 1.02, y: -3 }}
              onClick={() => { if (!subscribed && i > 0) goToPricing(navigate); else setOpenDay(day); }}
              className="relative overflow-hidden rounded-[1.5rem] border-2 p-6 text-right"
              style={{ borderColor: `${pal.accent}44`, background: `linear-gradient(150deg, ${pal.panel}, ${pal.bg})`, opacity: !subscribed && i > 0 ? 0.7 : 1 }}
            >
              <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl" style={{ background: `${pal.accent}33` }} />
              <div className="relative z-10 flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl" style={{ background: `${pal.accent}22`, color: pal.accent }}>{day.index}</span>
                <span className="text-5xl">{day.emoji}</span>
              </div>
              <h3 className="relative z-10 mt-4 font-display text-2xl" style={{ color: pal.ink }}>{noDot(day.planet)}</h3>
              <p className="relative z-10 mt-1 text-sm" style={{ color: pal.accentSoft }}>{day.screens.length} شاشات · {noDot(day.vibe)}</p>
              {!subscribed && i === 0 && (
                <p className="relative z-10 mt-1 text-xs" style={{ color: "#22c55e" }}>✦ نشاط تجريبي مجاني</p>
              )}
              {!subscribed && i > 0 ? (
                <span className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold" style={{ borderColor: `${pal.accent}66`, color: pal.accentSoft }}>
                  <LockSimple weight="fill" className="h-4 w-4" /> اشترك لفتحه
                </span>
              ) : (
                <span className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-black" style={{ background: pal.accent }}>
                  <Play weight="fill" className="h-4 w-4" /> افتح العرض
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {openDay && <DayPlayer day={openDay} pal={pal} track={track} onExit={() => setOpenDay(null)} locked={!subscribed} onSubscribe={() => goToPricing(navigate)} />}
      </AnimatePresence>
    </div>
  );
}
