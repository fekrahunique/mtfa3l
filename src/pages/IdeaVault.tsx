import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { MagnifyingGlass, CaretLeft, CaretDown, Target, GraduationCap, Play, Lock, Crown } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { vaultCategories, type VaultChallenge, type VaultStage } from "../data/ideaVault";
import { ChallengePlayer } from "../activities/ChallengePlayer";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { noDot } from "../lib/utils";

const STAGES: (VaultStage | "الكل")[] = ["الكل", "ابتدائي", "متوسط"];
const TYPE_LABEL: Record<string, string> = { quizRace: "سؤال بالنقاط", predict: "تصويت وتوقّع", sort: "تصنيف", order: "ترتيب", budget: "ميزانية", timer: "مؤقّت وتحكيم", map: "خريطة/مناطق" };

function ChallengeCard({ ch, accent, accentSoft, deep, onPlay, locked }: { ch: VaultChallenge; accent: string; accentSoft: string; deep: string; onPlay: () => void; locked?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: `${accent}44`, background: `linear-gradient(150deg, ${deep}, rgba(19,18,9,0.92))` }}>
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-right">
          <span className="flex items-center gap-1.5 font-display text-lg text-white">{locked && <Lock weight="fill" className="h-4 w-4 shrink-0" style={{ color: accentSoft }} />}{noDot(ch.title)}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: accentSoft }}>
            <span className="rounded-full px-2 py-0.5" style={{ background: `${accent}33` }}>{ch.stage}</span>
            <span className="rounded-full border px-2 py-0.5" style={{ borderColor: `${accent}44`, color: accentSoft }}>{TYPE_LABEL[ch.type]}</span>
            <span className="text-white/45">{noDot(ch.tag)}</span>
          </span>
        </button>
        {locked ? (
          <button type="button" onClick={onPlay} className="flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition-transform hover:scale-105 active:scale-95" style={{ borderColor: `${accent}88`, color: accentSoft }}>
            <Lock weight="fill" className="h-4 w-4" /> للباقة العليا
          </button>
        ) : (
          <button type="button" onClick={onPlay} className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95" style={{ background: accent }}>
            <Play weight="fill" className="h-4 w-4" /> شغّل
          </button>
        )}
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
  const [activeCat, setActiveCat] = useState((vaultCategories.find((c) => !c.premium) ?? vaultCategories[0]).id);
  const [playing, setPlaying] = useState<VaultChallenge | null>(null);

  const cat = vaultCategories.find((c) => c.id === activeCat)!;
  const premiumUnlocked = isPremium(data.plan);
  const catLocked = !!cat.premium && !premiumUnlocked;

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
          <div key={c.id} className="absolute rounded-full blur-3xl" style={{ width: 360, height: 360, left: `${[8, 70, 30, 55, 18][i % 5]}%`, top: `${[4, 30, 70, 12, 52][i % 5]}%`, background: `${c.accent}22` }} />
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

        {/* الألعاب الكبرى — تجارب جماعية كاملة تُدار من شاشة الرائد */}
        <ScrollReveal className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🎮</span>
            <h2 className="font-display text-xl text-ink">الألعاب الكبرى</h2>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ink-muted">تجربة جماعية كاملة</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => navigate("/بطولة-نشاط", { state: data })}
              className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-amber-400/30 p-5 text-right transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: "linear-gradient(150deg, rgba(245,158,11,0.16), rgba(19,18,9,0.92))" }}>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">🏆 لعبة جماعية</span>
                <h3 className="mt-2 font-display text-xl text-white">بطولة نشاط</h3>
                <p className="mt-1 text-sm text-white/70">قسّم فصلك فرقًا: تحدّيات ومخاطرة وأحداث وجولة نهائية</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black shadow-xl transition-transform duration-300 group-hover:scale-105">ابدأ ▶</span>
            </button>

            <button type="button" onClick={() => navigate("/الشفرة", { state: data })}
              className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl border p-5 text-right transition-transform duration-300 hover:scale-[1.02]"
              style={{ borderColor: "rgba(245,183,60,0.3)", background: "linear-gradient(150deg, rgba(75,214,239,0.12), rgba(10,13,20,0.95))" }}>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">🔐 ألغاز وتفاوض · جديد</span>
                <h3 className="mt-2 font-display text-xl text-white">الشفرة</h3>
                <p className="mt-1 text-sm text-white/70">معلومات ناقصة موزّعة على الفرق، اجمعوها وفكّوا الشفرة قبل الوقت</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black shadow-xl transition-transform duration-300 group-hover:scale-105">ابدأ ▶</span>
            </button>

            <button type="button" onClick={() => navigate("/آخر-فرصة", { state: data })}
              className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl border p-5 text-right transition-transform duration-300 hover:scale-[1.02]"
              style={{ borderColor: "rgba(245,84,112,0.35)", background: "linear-gradient(150deg, rgba(245,84,112,0.14), rgba(10,13,20,0.95))" }}>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">⚡ قرارات وقيم · جديد</span>
                <h3 className="mt-2 font-display text-xl text-white">آخر فرصة</h3>
                <p className="mt-1 text-sm text-white/70">قرارات تحت الضغط يعيش فيها الطالب القيمة، ثم انعكاس وتطبيق في الواقع</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black shadow-xl transition-transform duration-300 group-hover:scale-105">ابدأ ▶</span>
            </button>
          </div>
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
                {c.premium && !premiumUnlocked && <Lock weight="fill" className="h-3 w-3" />}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{c.challenges.length}</span>
              </button>
            );
          })}
        </div>

        <ScrollReveal className="mt-5 text-center">
          <p className="text-sm" style={{ color: cat.accentSoft }}>{noDot(cat.blurb)}</p>
        </ScrollReveal>

        {/* شريط الترقية للحزمة الحصرية */}
        {catLocked && (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border p-5 text-center sm:flex-row sm:text-right"
            style={{ borderColor: `${cat.accent}55`, background: `linear-gradient(150deg, ${cat.accent}1f, rgba(19,18,9,0.9))` }}>
            <Crown weight="fill" className="h-8 w-8 shrink-0" style={{ color: cat.accent }} />
            <div className="flex-1">
              <p className="font-display text-lg text-white">حزمة حصرية للرائد المتكامل</p>
              <p className="mt-0.5 text-sm text-white/70">هذه البطولات النوعية متاحة لمشتركي الباقة العليا، رقِّ باقتك لتفتحها كلها</p>
            </div>
            <button type="button" onClick={() => goToPricing(navigate)} className="shrink-0 rounded-full px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95" style={{ background: cat.accent }}>
              رقِّ للباقة العليا ✨
            </button>
          </div>
        )}

        {/* البطاقات */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {filtered.map((ch) => (
            <ChallengeCard key={ch.id} ch={ch} accent={cat.accent} accentSoft={cat.accentSoft} deep={cat.deep} locked={catLocked} onPlay={() => (catLocked ? goToPricing(navigate) : setPlaying(ch))} />
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
