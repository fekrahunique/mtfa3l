import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { LockSimple, Play, Sparkle, Crown, CaretLeft, CheckCircle, Timer, MapPin, Wrench, Eye, X, FilmSlate, MagnifyingGlass } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { ChallengePlayer, type ChallengeType, type ChallengeContent } from "../activities/ChallengePlayer";
import { breakWeeks, type BreakWeek } from "../data/breakPeriods";
import { activityDomains, activityPrograms, type ActivityProgram } from "../data/activityPrograms";
import { noDot } from "../lib/utils";
import { weekTheme } from "../lib/weekTheme";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { isSubscribed, setSubscribed as persistSubscribed } from "../lib/subscriptionStore";

const EASE = [0.32, 0.72, 0, 1] as const;

/** إيماءة موضوع كل أسبوع. */
function motifFor(decor: string) {
  if (decor === "national") return "💚";
  if (decor === "media") return "🎤";
  if (decor === "cyber") return "🛡️";
  if (decor === "space") return "🚀";
  return "🎯";
}

function WeekTile({
  week,
  index,
  locked,
  onOpen,
}: {
  week: BreakWeek;
  index: number;
  locked: boolean;
  onOpen: () => void;
}) {
  const theme = weekTheme(week);
  const side = index % 2 === 0 ? -1 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: side * 70, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative w-full sm:w-[46%]"
      style={{ alignSelf: side === -1 ? "flex-start" : "flex-end" }}
    >
      <div
        className="relative overflow-hidden rounded-[1.6rem] border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{
          background: `linear-gradient(150deg, ${theme.banner}, rgba(19,18,9,0.94))`,
          borderColor: `${theme.accent}55`,
        }}
      >
        {/* توهّج الموضوع */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `${theme.accent}44` }}
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl font-display text-2xl text-white"
            style={{ backgroundColor: `${theme.accentSoft}2a`, color: theme.accentSoft }}
          >
            {week.week}
          </span>
          <span className="text-4xl">{motifFor(theme.decor)}</span>
        </div>

        <h3 className="relative z-10 mt-4 font-display text-2xl text-white sm:text-3xl">
          {week.occasion ?? "أنشطة الأسبوع"}
        </h3>
        <p className="relative z-10 mt-1 text-sm" style={{ color: theme.accentSoft }}>
          {week.corners.length} أنشطة تفاعلية · {week.stageNote ?? week.stage}
        </p>

        <div className="relative z-10 mt-6">
          {locked ? (
            <button
              type="button"
              onClick={onOpen}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition-colors duration-300 hover:bg-white/10"
            >
              <LockSimple weight="fill" className="h-4 w-4" />
              اشترك لتفتح هذا الأسبوع
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpen}
              className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-bg shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-95"
              style={{ backgroundColor: theme.accentSoft }}
            >
              <Play weight="fill" className="h-4 w-4" />
              ابدأ هذا الأسبوع
            </button>
          )}
        </div>

        {locked && (
          <span className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/80">
            <LockSimple weight="fill" className="h-3 w-3" />
            مقفل
          </span>
        )}
      </div>
    </motion.div>
  );
}

/** سؤال تحدٍّ يُكشف جوابه بضغطة. */
function ChallengeRow({ q, a, accent }: { q: string; a: string; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right transition-colors hover:bg-white/[0.07]"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-white/90">{noDot(q)}</span>
        <Eye weight={open ? "fill" : "regular"} className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="block overflow-hidden text-sm font-bold"
            style={{ color: accent }}
          >
            <span className="block pt-2">{noDot(a)}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** بوستر برنامج — يفتح عرضًا سينمائيًا كامل الشاشة. */
const arWJ = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** توزيع محرّكات المسابقة على المجالات للتنويع، بتحويل أسئلة البرنامج لكل محرّك. */
const DOMAIN_ENGINE: Record<string, "board" | "duel" | "reveal"> = {
  "science-tech": "board", "sports-health": "duel", "citizenship": "reveal",
  "scouts": "board", "world-days": "duel", "national-days": "reveal", "prayer-duty": "board",
};

function programGame(program: ActivityProgram): { type: ChallengeType; content: ChallengeContent; label: string } {
  const ch = program.challenge;
  const engine = DOMAIN_ENGINE[program.domainId] ?? "board";

  if (engine === "duel" && ch.length >= 2) {
    const rounds = ch.map((c, i) => {
      const distractor = ch[(i + 1) % ch.length].answer;
      const aIsCorrect = i % 2 === 0;
      return {
        prompt: c.question,
        a: aIsCorrect ? c.answer : distractor,
        b: aIsCorrect ? distractor : c.answer,
        correct: (aIsCorrect ? "a" : "b") as "a" | "b",
      };
    });
    return { type: "duel", content: { duel: { rounds } }, label: "⚔️ مبارزة: أيّهما الصحيح؟" };
  }

  if (engine === "reveal") {
    const rounds = ch.map((c) => {
      const ans = c.answer.trim();
      const words = ans.split(/\s+/).filter(Boolean).length;
      return { answer: c.answer, clues: [c.question, `تبدأ بحرف «${ans[0] ?? ""}»`, `من ${arWJ(words)} كلمة`] };
    });
    return { type: "reveal", content: { reveal: { rounds } }, label: "🔍 خمّن الإجابة بالتلميحات" };
  }

  return { type: "board", content: { quiz: ch.map((c) => ({ q: c.question, a: c.answer })) }, label: "🎮 معركة الفرق (صندوق التحدّي)" };
}

function ProgramCard({ program, accent, accentSoft, deep }: { program: ActivityProgram; accent: string; accentSoft: string; deep: string }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const game = programGame(program);
  const EASE_C = [0.32, 0.72, 0, 1] as const;
  const scene = (delay: number) => ({
    initial: { opacity: 0, y: 28, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, delay, ease: EASE_C },
  });

  return (
    <>
      {/* البوستر */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.03, rotate: -0.6 }}
        whileTap={{ scale: 0.97 }}
        className="group relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[1.5rem] border p-5 text-right shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
        style={{ background: `linear-gradient(165deg, ${accent}66 0%, ${deep} 55%, #0a0a0a 100%)`, borderColor: `${accent}66` }}
      >
        {/* توهّج وإيماءة عملاقة */}
        <span className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full blur-3xl" style={{ background: `${accentSoft}33` }} />
        <motion.span
          animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-3 top-3 text-[5.5rem] opacity-90 drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        >
          {program.motif}
        </motion.span>

        <span className="relative z-10 mt-20 block font-display text-2xl leading-snug text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.8)]">
          {noDot(program.title)}
        </span>
        <span className="relative z-10 mt-1 block text-sm font-semibold" style={{ color: accentSoft }}>
          {noDot(program.tagline)}
        </span>
        <span
          className="relative z-10 mt-4 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-black transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: accentSoft }}
        >
          <Play weight="fill" className="h-4 w-4" />
          شاهد العرض
        </span>
      </motion.button>

      {/* العرض السينمائي */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] overflow-y-auto"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${deep} 0%, #050505 70%)` }}
          >
            {/* أشرطة السينما */}
            <motion.div initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }} transition={{ duration: 0.5, ease: EASE_C }} className="fixed inset-x-0 top-0 z-10 h-10 bg-black sm:h-14" />
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} transition={{ duration: 0.5, ease: EASE_C }} className="fixed inset-x-0 bottom-0 z-10 h-10 bg-black sm:h-14" />

            {/* إيماءات طافية */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="pointer-events-none fixed text-4xl opacity-15"
                style={{ left: `${[8, 82, 14, 74, 46][i]}%`, top: `${[18, 24, 68, 72, 40][i]}%` }}
                animate={{ y: [0, -18, 0], rotate: [0, i % 2 ? 12 : -12, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
              >
                {program.motif}
              </motion.span>
            ))}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="fixed left-4 top-14 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-transform hover:scale-110 sm:top-20"
            >
              <X weight="bold" className="h-5 w-5" />
            </button>

            <div className="relative mx-auto max-w-2xl px-5 pb-24 pt-24 sm:pt-28">
              {/* المشهد الافتتاحي */}
              <motion.div {...scene(0.1)} className="text-center">
                <motion.span
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block text-8xl drop-shadow-[0_16px_50px_rgba(0,0,0,0.8)]"
                >
                  {program.motif}
                </motion.span>
              </motion.div>
              <motion.h3 {...scene(0.3)} className="mt-4 text-center font-display text-4xl text-white sm:text-5xl">
                {noDot(program.title)}
              </motion.h3>
              <motion.p {...scene(0.5)} className="mt-3 text-center text-lg font-semibold" style={{ color: accentSoft }}>
                {noDot(program.tagline)}
              </motion.p>

              <motion.div {...scene(0.65)} className="mt-6 flex flex-wrap justify-center gap-2 text-[12px] font-semibold text-white/85">
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                  <Timer weight="fill" className="h-3.5 w-3.5" style={{ color: accentSoft }} />
                  {noDot(program.sessions)}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                  <MapPin weight="fill" className="h-3.5 w-3.5" style={{ color: accentSoft }} />
                  {noDot(program.place.split("،")[0])}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                  <Wrench weight="fill" className="h-3.5 w-3.5" style={{ color: accentSoft }} />
                  {program.tools.length} أدوات
                </span>
              </motion.div>

              {/* مشاهد الرحلة */}
              <motion.h4 {...scene(0.8)} className="mt-12 flex items-center gap-2 font-display text-2xl text-white">
                <FilmSlate weight="fill" className="h-6 w-6" style={{ color: accentSoft }} />
                مشاهد الرحلة
              </motion.h4>
              <div className="mt-4 space-y-3">
                {program.highlights.map((h, i) => (
                  <motion.div
                    key={h}
                    {...scene(0.95 + i * 0.18)}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-lg" style={{ backgroundColor: `${accent}44`, color: accentSoft }}>
                      {i + 1}
                    </span>
                    <span className="pt-1 text-base text-white/90">{noDot(h)}</span>
                  </motion.div>
                ))}
              </div>

              {/* نواتج التعلم */}
              <motion.h4 {...scene(1.7)} className="mt-12 font-display text-2xl text-white">نواتج التعلم</motion.h4>
              <motion.ul {...scene(1.85)} className="mt-4 space-y-2">
                {program.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm text-white/75">
                    <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentSoft }} />
                    {noDot(o)}
                  </li>
                ))}
              </motion.ul>

              {/* تحدي الفريقين */}
              <motion.div {...scene(2)} className="mt-12 flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-display text-2xl text-white">
                  تحدي الفريقين <span className="text-sm font-sans text-white/60">، اضغط لكشف الجواب</span>
                </h4>
                {program.challenge.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="flex items-center gap-2 rounded-full px-6 py-3 text-base font-bold text-black shadow-xl transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: accentSoft }}
                  >
                    <Play weight="fill" className="h-5 w-5" /> {game.label}
                  </button>
                )}
              </motion.div>
              <motion.div {...scene(2.15)} className="mt-4 space-y-2">
                {program.challenge.map((c) => (
                  <ChallengeRow key={c.question} q={c.question} a={c.answer} accent={accentSoft} />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* تشغيل تحدّي البرنامج كمسابقة تفاعلية بالنقاط */}
      <AnimatePresence>
        {playing && (
          <ChallengePlayer
            title={program.title}
            type={game.type}
            content={game.content}
            pal={{ accent, accentSoft, deep }}
            onClose={() => setPlaying(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/** قسم مجالات الأنشطة الطلابية — يعرض برامج مرحلة المستخدم. */
function DomainsSection({ stage }: { stage: "ابتدائي" | "متوسط" }) {
  const [activeId, setActiveId] = useState("science-tech");
  const active = activityDomains.find((d) => d.id === activeId)!;
  const programs = activityPrograms.filter((p) => p.domainId === activeId && p.stage === stage);

  return (
    <section className="mt-24">
      <ScrollReveal className="text-center">
        <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-5 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-sm">
          🧭 عوالم جديدة
        </span>
        <h2 className="mt-4 font-display text-3xl text-ink sm:text-5xl">مجالات الأنشطة الطلابية</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-ink-muted">
          برامج ممتدة من ملفات الوزارة، كل مجال بعالمه وبرامجه وتحدياته
        </p>
      </ScrollReveal>

      {/* شريط المجالات */}
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {activityDomains.map((d) => {
          const isActive = d.id === activeId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => !d.comingSoon && setActiveId(d.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                d.comingSoon ? "cursor-default opacity-45" : "hover:scale-105"
              }`}
              style={{
                borderColor: isActive ? d.accentSoft : "rgba(255,255,255,0.12)",
                backgroundColor: isActive ? `${d.accent}33` : "rgba(255,255,255,0.04)",
                color: isActive ? d.accentSoft : "rgba(255,255,255,0.75)",
              }}
            >
              <span>{d.motif}</span>
              {d.title}
              {d.comingSoon && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">قريبًا</span>}
            </button>
          );
        })}
      </div>

      <ScrollReveal className="mt-6 text-center">
        <p className="text-sm" style={{ color: active.accentSoft }}>{noDot(active.blurb)}</p>
      </ScrollReveal>

      {/* برامج المجال النشط، شبكة بوسترات */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {programs.map((p) => (
          <ProgramCard key={p.id} program={p} accent={active.accent} accentSoft={active.accentSoft} deep={active.deep} />
        ))}
      </div>
    </section>
  );
}

export function WeeksJourney() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const stageLabel = data.stage === "middle" ? "متوسط" : "ابتدائي";
  const weeks = breakWeeks.filter((w) => w.stage === stageLabel).sort((a, b) => a.week - b.week);
  const [subscribed, setSubscribed] = useState(isSubscribed());

  // افتح الصفحة من أعلاها دائمًا (لا من موضع تمرير سابق).
  useEffect(() => { window.scrollTo(0, 0); }, []);

  function openWeek(week: BreakWeek, locked: boolean) {
    if (locked) {
      document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    navigate("/لوحة-التحكم", { state: { ...data, weekId: week.id } });
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg pb-24">
      {/* توهّجات خلفية حيّة */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {["#ff9d3d", "#a855c7", "#22b8d8", "#1E9E63"].map((c, i) => (
          <motion.div
            key={c}
            className="absolute rounded-full blur-3xl"
            style={{ width: 420, height: 420, left: `${[6, 68, 12, 70][i]}%`, top: `${[2, 8, 62, 66][i]}%`, background: `${c}33` }}
            animate={{ x: [0, 30, -20, 0], y: [0, -24, 16, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-20">
        <button
          type="button"
          onClick={() => navigate("/لوحة-التحكم", { state: data })}
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <CaretLeft weight="bold" className="h-4 w-4" />
          لوحة التحكم
        </button>

        <ScrollReveal className="text-center">
          <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-5 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-sm">
            🚀 رحلتك النوعية
          </span>
          <h1 className="mt-5 font-display text-4xl text-ink sm:text-6xl">رحلة رائد النشاط</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">
            كل أسبوع بموضوعه وهويته ومغامرته، أسبوعك الأول هدية، وبقية الرحلة بانتظارك
          </p>
        </ScrollReveal>

        {/* خطة النشاط ١٤٤٨هـ، تحديث الوزارة */}
        <ScrollReveal className="mt-12">
          <button
            type="button"
            onClick={() => navigate("/خطة-النشاط", { state: data })}
            className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-emerald-400/25 p-5 text-right transition-transform duration-300 hover:scale-[1.01]"
            style={{ background: "linear-gradient(150deg, rgba(16,185,129,0.12), rgba(19,18,9,0.9))" }}
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-0.5 text-[11px] font-bold text-emerald-300">✦ تحديث ١٤٤٨هـ · الإصدار السادس</span>
              <h3 className="mt-2 font-display text-xl text-ink sm:text-2xl">خطة النشاط ٦٤ برنامجًا، بعدد الحصص لكل نشاط</h3>
              <p className="mt-1 text-sm text-ink-muted">خمسة مجالات + الأيام والمناسبات + الفترات اللاصفية، بحصصها المعتمدة للمرحلتين</p>
            </div>
            <CaretLeft weight="bold" className="h-6 w-6 shrink-0 text-emerald-300" />
          </button>
        </ScrollReveal>

        {/* الأسبوع التمهيدي، بوابة العرض الحيّ */}
        <ScrollReveal className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/الأسبوع-التمهيدي", { state: data })}
            className="group relative block w-full overflow-hidden rounded-[1.75rem] border-2 border-sun-400/40 p-7 text-right transition-transform duration-300 hover:scale-[1.01] sm:p-9"
            style={{ background: "linear-gradient(150deg, rgba(139,127,255,0.22), rgba(34,211,238,0.14), rgba(10,10,46,0.94))" }}
          >
            <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[#8b7fff]/30 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold text-white">✦ جديد · عرض حيّ على البروجكتر</span>
                <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">الأسبوع التمهيدي الحافل</h2>
                <p className="mt-2 max-w-lg text-sm text-ink-muted">
                  خمسة أيام، شاشة حيّة يقودها رائد النشاط بالنقر، وسيناريو جاهز لكل لحظة، {stageLabel === "متوسط" ? "أكاديمية الرواد" : "رحلة كوكب المواهب"}. بلا ورق ولا تحضير
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-2 rounded-full bg-sun-400 px-7 py-3.5 text-base font-bold text-bg shadow-xl transition-transform duration-300 group-hover:scale-105">
                <Play weight="fill" className="h-5 w-5" /> ابدأ العرض
              </span>
            </div>
          </button>
        </ScrollReveal>

        {/* الرحلة، بطاقات متعرّجة على مسار */}
        <div className="relative mt-16 flex flex-col gap-10">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-white/15 to-transparent sm:block" />
          {weeks.map((week, i) => (
            <WeekTile key={week.id} week={week} index={i} locked={!subscribed} onOpen={() => openWeek(week, !subscribed)} />
          ))}
        </div>

        {/* مجالات الأنشطة الطلابية */}
        <DomainsSection stage={stageLabel} />

        {/* مستودع الأنشطة والأفكار */}
        <ScrollReveal className="mt-16">
          <button
            type="button"
            onClick={() => navigate("/مستودع-الأفكار", { state: data })}
            className="group relative block w-full overflow-hidden rounded-[1.75rem] border-2 border-cyan-400/30 p-7 text-right transition-transform duration-300 hover:scale-[1.01] sm:p-8"
            style={{ background: "linear-gradient(150deg, rgba(14,116,144,0.2), rgba(180,83,9,0.12), rgba(19,18,9,0.94))" }}
          >
            <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold text-white">🧰 ٧٠+ مسابقة وفكرة</span>
                <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">مستودع الأنشطة والأفكار</h2>
                <p className="mt-2 max-w-lg text-sm text-ink-muted">
                  تحديات المجالات الأربعة، ومسابقات المناسبات الوطنية والعالمية، وأفكار الأسبوع التمهيدي، ابحث واختر ما يناسب فصلك
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-2 rounded-full bg-cyan-400 px-7 py-3.5 text-base font-bold text-bg shadow-xl transition-transform duration-300 group-hover:scale-105">
                <MagnifyingGlass weight="bold" className="h-5 w-5" /> تصفّح المستودع
              </span>
            </div>
          </button>
        </ScrollReveal>

        {/* بانر الاشتراك، تشويق لاستكمال الرحلة */}
        <ScrollReveal className="mt-16">
          <div
            id="subscribe"
            className="relative overflow-hidden rounded-[1.75rem] border border-sun-400/30 p-8 text-center sm:p-10"
            style={{ background: "linear-gradient(150deg, rgba(255,157,61,0.16), rgba(19,18,9,0.9))" }}
          >
            <Crown weight="fill" className="mx-auto h-12 w-12 text-sun-400" />
            <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">أكمل رحلتك النوعية</h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-ink-muted">
              افتح كل الأسابيع بمواضيعها وأنشطتها التفاعلية وأدوات صنع أنشطتك الخاصة، تجربة مختلفة لكل رائد نشاط
            </p>
            {subscribed ? (
              <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-ink">
                <CheckCircle weight="fill" className="h-5 w-5 text-sun-400" />
                سجّلناك في قائمة الاهتمام، بنبلّغك أول ما تُفتح الرحلة الكاملة
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { persistSubscribed(true); setSubscribed(true); }}
                className="mx-auto mt-7 flex items-center gap-2 rounded-full bg-sun-400 px-8 py-3.5 text-base font-bold text-bg shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <Sparkle weight="fill" className="h-5 w-5" />
                فعّل التجربة الكاملة
              </button>
            )}
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
