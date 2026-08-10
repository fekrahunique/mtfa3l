import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash, UploadSimple, UsersThree, Trophy, Crown, ArrowsClockwise, Shuffle, Minus, X, PencilSimple } from "@phosphor-icons/react";
import {
  type ClassRoom, loadClasses, saveClasses, loadActiveClassId, saveActiveClassId, newId, parseNames,
  classPoints, awardPoints, resetClassPoints, topStudents, splitGroups,
} from "../../lib/rosterStore";
import { playCorrect, playWin, playWheelStop } from "../../lib/sound";
import { noDot } from "../../lib/utils";

export function ClassesManager({ accent = "#ff9d3d" }: { accent?: string }) {
  const [classes, setClasses] = useState<ClassRoom[]>(() => loadClasses());
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveClassId() ?? loadClasses()[0]?.id ?? null);
  const [tick, setTick] = useState(0); // لإعادة قراءة النقاط بعد التحديث
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [namesDraft, setNamesDraft] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ name: string; members: string[] }[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const active = classes.find((c) => c.id === activeId) ?? null;

  function persist(next: ClassRoom[]) { setClasses(next); saveClasses(next); }

  function addClass() {
    const name = `فصل ${classes.length + 1}`;
    const c: ClassRoom = { id: newId(), name, students: [] };
    const next = [...classes, c];
    persist(next); setActiveId(c.id); saveActiveClassId(c.id); setRenaming(c.id);
  }
  function removeClass(id: string) {
    const next = classes.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) { const na = next[0]?.id ?? null; setActiveId(na); saveActiveClassId(na); }
  }
  function renameClass(id: string, name: string) {
    persist(classes.map((c) => (c.id === id ? { ...c, name: name || c.name } : c)));
  }
  function switchTo(id: string) { setActiveId(id); saveActiveClassId(id); setGroups(null); setPicked(null); }

  function addNames(text: string) {
    if (!active) return;
    const parsed = parseNames(text);
    if (parsed.length === 0) return;
    const merged = Array.from(new Set([...active.students, ...parsed]));
    persist(classes.map((c) => (c.id === active.id ? { ...c, students: merged } : c)));
    setNamesDraft(""); playCorrect();
  }
  function removeStudent(name: string) {
    if (!active) return;
    persist(classes.map((c) => (c.id === active.id ? { ...c, students: c.students.filter((s) => s !== name) } : c)));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const texts = await Promise.all(Array.from(files).map((f) => f.text().catch(() => "")));
    addNames(texts.join("\n"));
  }

  const points = useMemo(() => (active ? classPoints(active.id) : {}), [active, tick]);
  const leaderboard = useMemo(
    () => (active ? [...active.students].map((s) => ({ name: s, pts: points[s] ?? 0 })).sort((a, b) => b.pts - a.pts) : []),
    [active, points]
  );
  const winners = useMemo(() => (active ? topStudents(active.id, 3) : []), [active, tick]);

  function award(name: string, d: number) { if (active) { awardPoints(active.id, name, d); setTick((t) => t + 1); if (d > 0) playCorrect(); } }
  function resetWeek() { if (active && confirm("تصفير نقاط الأسبوع لهذا الفصل؟")) { resetClassPoints(active.id); setTick((t) => t + 1); } }

  function makeGroups(n: number) {
    if (!active || active.students.length === 0) return;
    setGroups(splitGroups(active.students, Math.min(n, active.students.length)));
    setPicked(null); playCorrect();
  }
  function pickRandom() {
    if (!active || active.students.length === 0) return;
    setGroups(null);
    // دوران بصري بسيط: نبدّل الاسم سريعًا ثم نثبّت
    let n = 0;
    const iv = setInterval(() => {
      setPicked(active.students[Math.floor((Date.now() / 1) % active.students.length)]);
      if (++n > 12) { clearInterval(iv); const finalName = active.students[Math.floor((n * 7) % active.students.length)]; setPicked(finalName); playWheelStop(); }
    }, 90);
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      {/* شريط الفصول */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {classes.map((c) => (
          <div key={c.id} className="flex items-center">
            {renaming === c.id ? (
              <input
                autoFocus defaultValue={c.name}
                onBlur={(e) => { renameClass(c.id, e.target.value.trim()); setRenaming(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { renameClass(c.id, (e.target as HTMLInputElement).value.trim()); setRenaming(null); } }}
                className="w-28 rounded-full border bg-transparent px-3 py-1.5 text-sm text-ink outline-none"
                style={{ borderColor: accent }}
              />
            ) : (
              <button
                onClick={() => switchTo(c.id)}
                onDoubleClick={() => setRenaming(c.id)}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
                style={{ background: c.id === activeId ? accent : "rgba(255,255,255,0.06)", color: c.id === activeId ? "#000" : "rgba(255,255,255,0.8)" }}
              >
                {noDot(c.name)} <span className="text-xs opacity-70">({c.students.length})</span>
              </button>
            )}
          </div>
        ))}
        <button onClick={addClass} className="flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink" style={{ borderColor: `${accent}66` }}>
          <Plus weight="bold" className="h-4 w-4" /> فصل جديد
        </button>
      </div>

      {!active ? (
        <div className="py-10 text-center text-ink-muted">
          <UsersThree className="mx-auto mb-3 h-10 w-10 opacity-50" />
          أضف فصلك الأول لتبدأ — سمّه، ثم أضف أسماء طلابه
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg text-ink">
              {noDot(active.name)}
              <button onClick={() => setRenaming(active.id)} className="text-ink-faint hover:text-ink"><PencilSimple className="h-4 w-4" /></button>
            </h3>
            {classes.length > 1 && (
              <button onClick={() => removeClass(active.id)} className="flex items-center gap-1 text-xs text-red-400/80 hover:text-red-400"><Trash className="h-4 w-4" /> حذف الفصل</button>
            )}
          </div>

          {/* استيراد الأسماء: إسقاط ملف أو كتابة */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className="rounded-2xl border-2 border-dashed p-4 transition-colors"
            style={{ borderColor: dragOver ? accent : "rgba(255,255,255,0.15)", background: dragOver ? `${accent}12` : "transparent" }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={namesDraft} onChange={(e) => setNamesDraft(e.target.value)}
                placeholder={"الصق أو اكتب الأسماء — اسم لكل سطر\nأو أسقِط ملف .txt / .csv هنا"}
                rows={3}
                className="flex-1 resize-y rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-sun-400/50"
              />
              <div className="flex flex-row gap-2 sm:flex-col">
                <button onClick={() => addNames(namesDraft)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-black" style={{ background: accent }}>
                  <Plus weight="bold" className="h-4 w-4" /> أضف
                </button>
                <button onClick={() => fileRef.current?.click()} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-ink">
                  <UploadSimple className="h-4 w-4" /> ملف
                </button>
                <input ref={fileRef} type="file" accept=".txt,.csv,text/plain" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-faint">أسقِط ملف أسماء (.txt / .csv) أو اكتبها — بلا حسابات للطلاب.</p>
          </div>

          {active.students.length > 0 && (
            <>
              {/* أدوات: تقسيم مجموعات + اختيار عشوائي */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-ink-muted">تقسيم مجموعات:</span>
                {[2, 3, 4].map((n) => (
                  <button key={n} onClick={() => makeGroups(n)} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-ink hover:border-white/30">
                    <UsersThree className="h-4 w-4" /> {n}
                  </button>
                ))}
                <button onClick={pickRandom} className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold text-black" style={{ background: accent }}>
                  <Shuffle weight="bold" className="h-4 w-4" /> اختيار عشوائي
                </button>
              </div>

              <AnimatePresence>
                {picked && (
                  <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 flex items-center justify-center gap-2 rounded-2xl border-2 py-4" style={{ borderColor: accent }}>
                    <Shuffle weight="fill" className="h-5 w-5" style={{ color: accent }} />
                    <span className="font-display text-2xl text-ink">{noDot(picked)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {groups && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 grid gap-2 sm:grid-cols-2">
                    {groups.map((g, gi) => (
                      <div key={gi} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <input defaultValue={g.name} onChange={(e) => setGroups((gs) => gs?.map((x, i) => (i === gi ? { ...x, name: e.target.value } : x)) ?? null)}
                          className="mb-1.5 w-full bg-transparent font-display text-base text-ink outline-none" />
                        <div className="flex flex-wrap gap-1.5">
                          {g.members.map((m) => <span key={m} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-ink">{noDot(m)}</span>)}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* لوحة النقاط + الترتيب */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-display text-base text-ink"><Trophy weight="fill" className="h-4 w-4" style={{ color: accent }} /> النقاط والترتيب</h4>
                  <button onClick={resetWeek} className="flex items-center gap-1 text-xs text-ink-faint hover:text-ink"><ArrowsClockwise className="h-3.5 w-3.5" /> تصفير الأسبوع</button>
                </div>
                <div className="space-y-1.5">
                  {leaderboard.map((s, r) => (
                    <div key={s.name} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: r === 0 && s.pts > 0 ? `${accent}18` : "rgba(255,255,255,0.02)" }}>
                      <span className="w-6 text-center text-sm">{r < 3 && s.pts > 0 ? medals[r] : <span className="text-ink-faint">{r + 1}</span>}</span>
                      <span className="flex-1 text-sm font-semibold text-ink">{noDot(s.name)}</span>
                      <span className="font-display text-lg tabular-nums" style={{ color: accent }}>{s.pts}</span>
                      <button onClick={() => award(s.name, 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-black" style={{ background: accent }}><Plus weight="bold" className="h-4 w-4" /></button>
                      <button onClick={() => award(s.name, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-ink"><Minus className="h-3.5 w-3.5" /></button>
                      <button onClick={() => removeStudent(s.name)} className="text-ink-faint hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* فائزو الأسبوع */}
              {winners.length > 0 && (
                <div className="mt-5 rounded-2xl border p-4 text-center" style={{ borderColor: `${accent}44`, background: `linear-gradient(150deg, ${accent}14, transparent)` }}>
                  <p className="flex items-center justify-center gap-2 font-display text-lg text-ink"><Crown weight="fill" className="h-5 w-5" style={{ color: accent }} /> فائزو الأسبوع</p>
                  <div className="mt-3 flex items-end justify-center gap-4">
                    {winners.map((w, i) => (
                      <button key={w.name} onClick={playWin} className="flex flex-col items-center gap-1">
                        <span className="text-3xl">{medals[i]}</span>
                        <span className="text-sm font-semibold text-ink">{noDot(w.name)}</span>
                        <span className="font-display text-base" style={{ color: accent }}>{w.pts} نقطة</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
