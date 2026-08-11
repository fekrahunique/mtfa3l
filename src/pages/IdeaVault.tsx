import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { MagnifyingGlass, CaretLeft, CaretDown, Target, GraduationCap, Play } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { vaultCategories, type VaultChallenge, type VaultStage } from "../data/ideaVault";
import { ChallengePlayer } from "../activities/ChallengePlayer";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { noDot } from "../lib/utils";

const STAGES: (VaultStage | "الكل")[] = ["الكل", "ابتدائي", "متوسط"];
const TYPE_LABEL: Record<string, string> = { quizRace: "سؤال بالنقاط", predict: "تصويت وتوقّع", sort: "تصنيف", order: "ترتيب", budget: "ميزانية", timer: "مؤقّت وتحكيم", map: "خريطة/مناطق" };

function ChallengeCard({ ch, accent, accentSoft, deep, onPlay }: { ch: VaultChallenge; accent: string; accentSoft: string; deep: string; onPlay: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: `${accent}44`, background: `linear-gradient(150deg, ${deep}, rgba(19,18,9,0.92))` }}>
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-right">
          <span className="block font-display text-lg text-white">{noDot(ch.title)}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: accentSoft }}>
            <span className="rounded-full px-2 py-0.5" style={{ background: `${accent}33` }}>{ch.stage}</span>
            <span className="rounded-full border px-2 py-0.5" style={{ borderColor: `${accent}44`, color: accentSoft }}>{TYPE_LABEL[ch.type]}</span>
            <span className="text-white/45">{noDot(ch.tag)}</span>
          </span>
        </button>
        <button type="button" onClick={onPlay} className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95" style={{ background: accent }}>
          <Play weight="fill" className="h-4 w-4" /> شغّل
        </button>
        <button type="button" onClick={() => setOpen((v) => !v)} className="shrink-0"><CaretDown weight="bold" className="h-4 w-4 text-white/50 transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : "none" }} /></button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: accentSoft }}><Target weight="fill" className="h-3.5 w-3.5" /> الهدف التربوي</p>
              <p className="mt-1 text-sm text-white/85">{noDot(ch.objective)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IdeaVault() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<VaultStage | "الكل">("الكل");
  const [activeCat, setActiveCat] = useState(vaultCategories[0].id);
  const [playing, setPlaying] = useState<VaultChallenge | null>(null);

  const cat = vaultCategories.find((c) => c.id === activeCat)!;

  const filtered = useMemo(() => {
    const q = query.trim();
    return cat.challenges.filter((ch) => {
      const stageOk = stage === "الكل" || ch.stage === stage || ch.stage === "المرحلتان";
      const qOk = !q || `${ch.title} ${ch.tag} ${ch.objective} ${ch.play}`.includes(q);
      return stageOk && qOk;
    });
  }, [cat, query, stage]);

  const total = vaultCategories.reduce((n, c) => n + c.challenges.length, 0);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg pb-24">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {vaultCategories.map((c, i) => (
          <div key={c.id} className="absolute rounded-full blur-3xl" style={{ width: 360, height: 360, left: `${[8, 70, 30][i]}%`, top: `${[4, 30, 70][i]}%`, background: `${c.accent}22` }} />
        ))}
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-16">
        <button type="button" onClick={() => navigate("/الأسابيع", { state: data })} className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink">
          <CaretLeft weight="bold" className="h-4 w-4" /> رحلة رائد النشاط
        </button>

        <ScrollReveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-sm">
            <GraduationCap weight="fill" className="h-4 w-4" /> {total} فكرة ومسابقة جاهزة
          </span>
          <h1 className="mt-5 font-display text-4xl text-ink sm:text-6xl">مستودع الأنشطة والأفكار</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">
            كل ما تحتاجه من مسابقات وتحديات وأنشطة تفاعلية، ابحث، افرز، واختر ما يناسب فصلك
          </p>
        </ScrollReveal>

        {/* البحث والفرز */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مسابقة أو تحدٍّ أو فكرة..."
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pr-12 pl-4 text-ink outline-none transition-colors focus:border-sun-400/50"
            />
          </div>
          <div className="flex gap-1.5">
            {STAGES.map((s) => (
              <button key={s} type="button" onClick={() => setStage(s)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${stage === s ? "bg-sun-400 text-bg" : "border border-white/10 bg-white/[0.04] text-ink-muted hover:text-ink"}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* أقسام المستودع */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {vaultCategories.map((c) => {
            const isActive = c.id === activeCat;
            return (
              <button key={c.id} type="button" onClick={() => setActiveCat(c.id)} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{ borderColor: isActive ? c.accentSoft : "rgba(255,255,255,0.12)", backgroundColor: isActive ? `${c.accent}33` : "rgba(255,255,255,0.04)", color: isActive ? c.accentSoft : "rgba(255,255,255,0.75)" }}>
                <span>{c.emoji}</span> {c.title}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{c.challenges.length}</span>
              </button>
            );
          })}
        </div>

        <ScrollReveal className="mt-5 text-center">
          <p className="text-sm" style={{ color: cat.accentSoft }}>{noDot(cat.blurb)}</p>
        </ScrollReveal>

        {/* البطاقات */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {filtered.map((ch) => (
            <ChallengeCard key={ch.id} ch={ch} accent={cat.accent} accentSoft={cat.accentSoft} deep={cat.deep} onPlay={() => setPlaying(ch)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-10 text-center text-ink-muted">لا نتائج مطابقة، جرّب كلمة أخرى أو غيّر المرحلة</p>
        )}
      </main>

      <AnimatePresence>
        {playing && (
          <ChallengePlayer
            title={playing.title}
            type={playing.type}
            content={playing.content}
            pal={{ accent: cat.accent, accentSoft: cat.accentSoft, deep: cat.deep }}
            onClose={() => setPlaying(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
