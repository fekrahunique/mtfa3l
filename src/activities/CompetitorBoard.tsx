import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UsersThree, User, Buildings, Eye, EyeSlash, ArrowsClockwise, Plus, Minus, Trophy, X } from "@phosphor-icons/react";
import { loadClasses, loadActiveClassId, saveActiveClassId, splitGroups, awardPoints } from "../lib/rosterStore";
import { playCorrect, playWin, playDuel, playDrum, playStadium, playHeartbeat } from "../lib/sound";
import { noDot } from "../lib/utils";

export type CompetitorMode = "individuals" | "groups" | "classes";

interface Competitor { id: string; name: string; pts: number; studentName?: string; classId?: string }

const MODE_META: { id: CompetitorMode; label: string; icon: typeof User }[] = [
  { id: "individuals", label: "أفراد", icon: User },
  { id: "groups", label: "مجموعات", icon: UsersThree },
  { id: "classes", label: "فصول", icon: Buildings },
];

const FALLBACK = ["الفريق الأزرق", "الفريق الأخضر", "الفريق الأحمر", "الفريق الذهبي"];
const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#a855c7", "#ec4899"];

/**
 * لوحة تنافس مرنة للمسابقات: يختار المدرّس أن يكون التنافس بين أفراد أو
 * مجموعات أو فصول (من الأسماء والفصول المرفوعة)، مع إظهار النقاط أو إخفائها.
 * منح النقاط للأفراد يُحفظ في المنصة فيظهر في فائزي الأسبوع.
 */
export function CompetitorBoard({ pal }: { pal: { accent: string; accentSoft: string; ink?: string } }) {
  const classes = useMemo(() => loadClasses(), []);
  const activeId = useMemo(() => loadActiveClassId() ?? classes.find((c) => c.students.length > 0)?.id ?? null, [classes]);
  const hasRoster = classes.some((c) => c.students.length > 0);

  // الفصل المختار لهذه المسابقة (null = فرق عامة بلا فصل)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(activeId);
  const activeClass = classes.find((c) => c.id === selectedClassId) ?? null;

  const [mode, setMode] = useState<CompetitorMode>(hasRoster ? "groups" : "individuals");
  const [groupCount, setGroupCount] = useState(2);
  const [showPoints, setShowPoints] = useState(true);
  const [comps, setComps] = useState<Competitor[]>(() => defaultComps());
  const [started, setStarted] = useState(false);
  const [champion, setChampion] = useState<Competitor | null>(null);
  const [flash, setFlash] = useState<string | null>(null); // وميض أخضر عند كسب نقطة

  /** الصوت المناسب للنمط: مبارزة للأفراد، طبل للمجموعات، ملعب للفصول. */
  function modeSound() {
    if (mode === "individuals") playDuel();
    else if (mode === "groups") playDrum();
    else playStadium();
  }

  function defaultComps(): Competitor[] {
    return FALLBACK.slice(0, 2).map((n, i) => ({ id: `f${i}`, name: n, pts: 0 }));
  }

  function build(m: CompetitorMode, n = groupCount): Competitor[] {
    if (m === "individuals") {
      const list = activeClass?.students ?? [];
      if (list.length === 0) return FALLBACK.slice(0, 2).map((nm, i) => ({ id: `i${i}`, name: nm, pts: 0 }));
      return list.map((s, i) => ({ id: `s${i}`, name: s, pts: 0, studentName: s, classId: activeClass?.id }));
    }
    if (m === "groups") {
      const list = activeClass?.students ?? [];
      if (list.length === 0) return FALLBACK.slice(0, n).map((nm, i) => ({ id: `g${i}`, name: nm, pts: 0 }));
      return splitGroups(list, Math.min(n, list.length)).map((g, i) => ({ id: `g${i}`, name: g.name, pts: 0 }));
    }
    // classes
    const withStudents = classes.filter((c) => c.students.length > 0);
    const pool = withStudents.length >= 2 ? withStudents : classes;
    if (pool.length < 2) return FALLBACK.slice(0, 2).map((nm, i) => ({ id: `c${i}`, name: nm, pts: 0 }));
    return pool.map((c, i) => ({ id: `c${i}`, name: c.name, pts: 0, classId: c.id }));
  }

  function start() { setComps(build(mode)); setStarted(true); playCorrect(); }
  function reset() { setComps(build(mode)); }

  function award(id: string, d: number) {
    setComps((v) => v.map((c) => (c.id === id ? { ...c, pts: Math.max(0, c.pts + d) } : c)));
    const c = comps.find((x) => x.id === id);
    if (d > 0 && c?.studentName && c.classId) awardPoints(c.classId, c.studentName, d); // يغذّي فائزي الأسبوع
    if (d > 0) { modeSound(); setFlash(id); setTimeout(() => setFlash((f) => (f === id ? null : f)), 650); }
  }

  function announce() {
    const top = [...comps].sort((a, b) => b.pts - a.pts)[0];
    if (!top) return;
    playHeartbeat();
    setTimeout(() => { setChampion(top); modeSound(); playWin(); }, 700);
  }

  const ranked = [...comps].sort((a, b) => b.pts - a.pts);

  if (!started) {
    const rosterClasses = classes.filter((c) => c.students.length > 0);
    return (
      <div className="w-full max-w-lg rounded-2xl border p-4" style={{ borderColor: `${pal.accent}33`, background: "rgba(255,255,255,0.02)" }}>
        {/* خطوة ١: اختيار الفصل (أو فرق عامة) */}
        <p className="mb-2 text-center text-sm font-semibold" style={{ color: pal.accentSoft }}>مع أيّ فصل تلعب؟</p>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {rosterClasses.map((c) => (
            <button key={c.id} onClick={() => { setSelectedClassId(c.id); saveActiveClassId(c.id); }}
              className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
              style={{ background: selectedClassId === c.id ? pal.accent : "rgba(255,255,255,0.06)", color: selectedClassId === c.id ? "#000" : "rgba(255,255,255,0.8)" }}>
              {noDot(c.name)} <span className="text-xs opacity-70">({c.students.length})</span>
            </button>
          ))}
          <button onClick={() => setSelectedClassId(null)}
            className="rounded-full border border-dashed px-4 py-1.5 text-sm font-semibold transition-colors"
            style={{ borderColor: `${pal.accent}66`, background: selectedClassId === null ? pal.accent : "transparent", color: selectedClassId === null ? "#000" : "rgba(255,255,255,0.7)" }}>
            فرق عامة
          </button>
          {rosterClasses.length === 0 && <span className="text-xs" style={{ color: pal.accentSoft }}>لا فصول بعد، أضفها من لوحة التحكم، أو العب بفرق عامة</span>}
        </div>

        {/* خطوة ٢: نمط المنافسة */}
        <p className="mb-3 text-center text-sm font-semibold" style={{ color: pal.accentSoft }}>بين مَن تكون المنافسة؟</p>
        <div className="flex justify-center gap-2">
          {MODE_META.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{ background: mode === m.id ? pal.accent : "rgba(255,255,255,0.06)", color: mode === m.id ? "#000" : "rgba(255,255,255,0.8)" }}>
              <m.icon weight="fill" className="h-4 w-4" /> {m.label}
            </button>
          ))}
        </div>
        {mode === "groups" && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm" style={{ color: pal.accentSoft }}>
            عدد المجموعات:
            {[2, 3, 4].map((n) => (
              <button key={n} onClick={() => setGroupCount(n)} className="h-8 w-8 rounded-full text-sm font-bold" style={{ background: groupCount === n ? pal.accent : "rgba(255,255,255,0.08)", color: groupCount === n ? "#000" : "#fff" }}>{n}</button>
            ))}
          </div>
        )}
        {!hasRoster && <p className="mt-3 text-center text-xs" style={{ color: pal.accentSoft }}>أضف فصولك وطلابك من لوحة التحكم لتنافس بأسمائهم، أو ابدأ بفرق عامة الآن</p>}
        <button onClick={start} className="mt-4 w-full rounded-full py-2.5 font-bold text-black" style={{ background: pal.accent }}>ابدأ المنافسة</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border p-4" style={{ borderColor: `${pal.accent}33`, background: "rgba(255,255,255,0.02)" }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: pal.accentSoft }}>
          {MODE_META.find((m) => m.id === mode)?.label} · التحكيم المباشر
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowPoints((v) => !v)} className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${pal.accent}55`, color: pal.accentSoft }}>
            {showPoints ? <><EyeSlash className="h-3.5 w-3.5" /> إخفاء النقاط</> : <><Eye className="h-3.5 w-3.5" /> إظهار النقاط</>}
          </button>
          <button onClick={reset} className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${pal.accent}55`, color: pal.accentSoft }}><ArrowsClockwise className="h-3.5 w-3.5" /> إعادة</button>
          <button onClick={() => setStarted(false)} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${pal.accent}55`, color: pal.accentSoft }}>تغيير</button>
        </div>
      </div>
      <div className="max-h-[42vh] space-y-2 overflow-y-auto">
        <AnimatePresence>
          {ranked.map((c, r) => {
            const leading = r === 0 && c.pts > 0;
            const color = COLORS[comps.findIndex((x) => x.id === c.id) % COLORS.length];
            return (
              <motion.div layout key={c.id} animate={flash === c.id ? { boxShadow: ["0 0 0 0 #22c55e00", "0 0 26px 4px #22c55eaa", "0 0 0 0 #22c55e00"] } : {}} transition={{ duration: 0.65 }} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: flash === c.id ? "#22c55e22" : leading ? `${color}22` : "rgba(255,255,255,0.03)", boxShadow: leading && flash !== c.id ? `0 0 22px ${color}66, inset 0 0 0 1px ${color}88` : "none" }}>
                <span className="w-6 text-center font-display text-lg" style={{ color: pal.ink ?? "#fff" }}>{leading ? "👑" : r + 1}</span>
                <span className="h-3 w-3 rounded-full" style={{ background: color }} />
                <span className="flex-1 font-semibold" style={{ color: pal.ink ?? "#fff" }}>{noDot(c.name)}</span>
                {showPoints
                  ? <span className="min-w-[2ch] text-center font-display text-xl tabular-nums" style={{ color: pal.accent }}>{c.pts}</span>
                  : <span className="min-w-[2ch] text-center font-display text-xl" style={{ color: pal.accentSoft }}>•••</span>}
                <button onClick={() => award(c.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-transform active:scale-90" style={{ background: pal.accent }}><Plus weight="bold" className="h-4 w-4" /></button>
                <button onClick={() => award(c.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-full border" style={{ borderColor: `${pal.accent}66`, color: pal.ink ?? "#fff" }}><Minus className="h-3.5 w-3.5" /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {comps.some((c) => c.pts > 0) && (
        <button onClick={announce} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 font-bold text-black transition-transform hover:scale-[1.02] active:scale-95" style={{ background: pal.accent }}>
          <Trophy weight="fill" className="h-5 w-5" /> أعلن الفائز
        </button>
      )}

      {/* إعلان الفائز، قصاصات وأضواء وصوت مبهر */}
      <AnimatePresence>
        {champion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden" style={{ background: "rgba(6,6,12,0.82)" }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.span key={i} initial={{ y: -40, x: `${(i * 37) % 100}vw`, opacity: 1, rotate: 0 }} animate={{ y: "110vh", rotate: 360 + i * 20 }} transition={{ duration: 2 + (i % 5) * 0.4, delay: (i % 7) * 0.08, ease: "easeIn" }} className="absolute top-0 h-3 w-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            ))}
            <motion.div initial={{ scale: 0.4, y: 30 }} animate={{ scale: 1, y: 0 }} className="relative z-10 rounded-[1.75rem] border-2 px-10 py-8 text-center" style={{ borderColor: pal.accent, background: "#14131f", boxShadow: `0 0 80px ${pal.accent}88` }}>
              <div className="text-7xl">🏆</div>
              <p className="mt-2 text-sm" style={{ color: pal.accentSoft }}>الفائز في {MODE_META.find((m) => m.id === mode)?.label}</p>
              <p className="mt-1 font-display text-4xl" style={{ color: pal.accent }}>{noDot(champion.name)}</p>
              {showPoints && <p className="mt-1 font-display text-xl text-white">{champion.pts} نقطة</p>}
              <button onClick={() => setChampion(null)} className="mt-4 inline-flex items-center gap-1 rounded-full border px-5 py-2 text-sm font-semibold" style={{ borderColor: `${pal.accent}66`, color: "#fff" }}><X className="h-4 w-4" /> إغلاق</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
