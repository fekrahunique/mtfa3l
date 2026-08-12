import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Medal, Crown, X } from "@phosphor-icons/react";
import { BADGES, badgeDef } from "../../data/studentBadges";
import { loadStudentBadges, saveStudentBadges, toggleStudentBadge, type BadgeMap } from "../../lib/badgeStore";
import { cn } from "../../lib/utils";

interface Student { id: string; name: string }

/** لوحة الشارات — الرائد يمنح طلابه شارات نوعية. حصري للباقة العليا. */
export function BadgesPanel({ students, premium, accentBg, accentText, onUpgrade }: {
  students: Student[]; premium: boolean; accentBg: string; accentText: string; onUpgrade: () => void;
}) {
  const [map, setMap] = useState<BadgeMap>(() => loadStudentBadges());
  const [picking, setPicking] = useState<Student | null>(null);

  function toggle(studentId: string, key: string) {
    setMap((prev) => { const next = toggleStudentBadge(prev, studentId, key); saveStudentBadges(next); return next; });
  }
  function openPicker(s: Student) { if (!premium) { onUpgrade(); return; } setPicking(s); }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-1 flex items-center gap-2">
        <Medal weight="fill" className={cn("h-5 w-5", accentText)} />
        <h3 className="font-display text-lg text-ink">لوحة الشارات</h3>
        {!premium && <span className="inline-flex items-center gap-1 rounded-full bg-sun-400/15 px-2 py-0.5 text-[10px] font-bold text-sun-300"><Crown weight="fill" className="h-3 w-3" /> المتكامل</span>}
      </div>
      <p className="mb-4 text-sm text-ink-muted">امنح طلابك شارات نوعية تحفّزهم وتبرز تميّزهم</p>

      {/* دليل الشارات */}
      <div className="mb-4 flex flex-wrap gap-2">
        {BADGES.map((b) => (
          <span key={b.key} title={b.desc} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-ink-muted">
            <span>{b.emoji}</span> {b.name}
          </span>
        ))}
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-ink-faint">أضِف طلابك أولًا من «فصولك وطلابك»</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {students.map((s) => {
            const owned = map[s.id] ?? [];
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-ink">{s.name.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {owned.length ? owned.map((k) => <span key={k} title={badgeDef(k)?.name} className="text-base">{badgeDef(k)?.emoji}</span>)
                      : <span className="text-[11px] text-ink-faint">بلا شارات بعد</span>}
                  </div>
                </div>
                <button onClick={() => openPicker(s)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-bg transition-transform hover:scale-105 active:scale-95", accentBg)}>+ شارة</button>
              </div>
            );
          })}
        </div>
      )}

      {/* منتقي الشارات */}
      <AnimatePresence>
        {picking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4" onClick={() => setPicking(null)}>
            <motion.div initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/12 bg-bg-raised p-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-display text-lg text-ink">شارات {picking.name}</h4>
                <button onClick={() => setPicking(null)} className="text-ink-faint hover:text-ink"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BADGES.map((b) => {
                  const on = (map[picking.id] ?? []).includes(b.key);
                  return (
                    <button key={b.key} onClick={() => toggle(picking.id, b.key)}
                      className={cn("flex items-center gap-2 rounded-xl border p-3 text-right transition-colors", on ? "border-sun-400 bg-sun-400/15" : "border-white/12 bg-white/[0.03] hover:border-white/25")}>
                      <span className="text-2xl">{b.emoji}</span>
                      <span className="min-w-0"><span className="block text-sm font-bold text-ink">{b.name}</span><span className="block truncate text-[11px] text-ink-faint">{b.desc}</span></span>
                      {on && <span className={cn("mr-auto text-sm font-bold", accentText)}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setPicking(null)} className={cn("mt-4 w-full rounded-full px-5 py-2.5 font-bold text-bg", accentBg)}>تمّ</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
