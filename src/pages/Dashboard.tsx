import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { CalendarBlank, Info, CaretLeft } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { GlassCard } from "../components/GlassCard";
import { Sidebar } from "../components/dashboard/Sidebar";
import { WeeklyTargetCard } from "../components/dashboard/WeeklyTargetCard";
import { ClassesManager } from "../components/dashboard/ClassesManager";
import { BadgesPanel } from "../components/dashboard/BadgesPanel";
import { isPremium, goToPricing } from "../lib/subscriptionStore";
import { TeacherTools } from "../components/dashboard/TeacherTools";
import { RoutineJourney } from "../components/dashboard/RoutineJourney";
import { YardCorners } from "../components/dashboard/YardCorners";
import { WeekIntro } from "../components/dashboard/WeekIntro";
import { CornerEditor } from "../components/dashboard/CornerEditor";
import { ActivityAssistant } from "../components/dashboard/ActivityAssistant";
import { UpcomingWeeks } from "../components/dashboard/UpcomingWeeks";
import { WeekComplete } from "../components/dashboard/WeekComplete";
import { QuizGame } from "../activities/QuizGame";
import { ValueTree } from "../activities/ValueTree";
import { GalleryWall } from "../activities/GalleryWall";
import { ActivityPresentation } from "../activities/ActivityPresentation";
import { SaduPattern, DiamondRule } from "../activities/ActivityShell";
import { breakWeeks, type BreakCorner } from "../data/breakPeriods";
import { genderAccent, type RegistrationData } from "../lib/theme";
import { weekTheme } from "../lib/weekTheme";
import { cn } from "../lib/utils";
import { BackToSchoolRibbon } from "../components/BackToSchoolRibbon";
import { OnboardingTour, TourButton, type TourStep } from "../components/dashboard/OnboardingTour";

const TOUR_STEPS: TourStep[] = [
  { title: "أهلًا بك في لوحتك 👋", body: "خلّني آخذك جولة سريعة أوريك فيها كل شي بأبسط طريقة، تقدر تتخطّاها وقت ما تبي." },
  { targetId: "activities", title: "📋 أنشطة الأسبوع", body: "هنا أركان يومك جاهزة. اضغط أيّ ركن ليبدأ العرض التفاعلي على الشاشة أمام طلابك، بلا تحضير ولا ورق." },
  { targetId: "tools", title: "🧰 أدواتك", body: "هنا المؤقّت، ومنتقي الطلاب، والمساعد الذكي اللي يصنع لك أنشطة ومسابقات جديدة بضغطة." },
  { targetId: "students", title: "🧑‍🎓 فصولك وطلابك", body: "أضف فصولك وأسماء طلابهم (أسقِط ملفًا أو اكتب)، وزّع المجموعات، وامنح النقاط، وآخر الأسبوع يطلع الفائزون." },
  { title: "جاهز تبدأ! 🎉", body: "تنقّل بين الأقسام من الشريط الجانبي، ولو احتجت الجولة مرة ثانية اضغط زر «؟» تحت." },
];
import {
  loadCornerOverrides,
  saveCornerOverrides,
  blankCorner,
  loadBadges,
  saveBadges,
  type CornerOverrides,
} from "../lib/cornerStore";
import { ChallengePlayer, type ChallengeType, type ChallengeContent } from "../activities/ChallengePlayer";
import { AiGamePlayer } from "../activities/AiGamePlayer";
import type { BuiltChallenge } from "../lib/agentBuilder";
import { loadGames, saveGames, makeGameId, type SavedGame } from "../lib/agentStore";
import { loadCapsule, toggleCapsuleAchieved, removeCapsuleGoal, clearCapsule, type CapsuleGoal } from "../lib/capsuleStore";

const EASE = [0.32, 0.72, 0, 1] as const;
const arN = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

const DashboardScene = lazy(() =>
  import("../components/three/DashboardScene").then((m) => ({ default: m.DashboardScene }))
);

function immersiveNow() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const demoData: RegistrationData = {
  teacherName: "سلمى العتيبي",
  email: "salma.otaibi@school.edu.sa",
  schoolName: "ابتدائية الفيصلية",
  schoolType: "government",
  stage: "primary",
  gender: "girls",
  students: [
    { id: "d1", name: "جود الحربي" },
    { id: "d2", name: "لين المطيري" },
    { id: "d3", name: "دانة القحطاني" },
  ],
  username: "الفيصلية-4821",
};

export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = (location.state as RegistrationData | null) ?? demoData;
  const gender = data.gender ?? "girls";
  const accent = genderAccent[gender];
  const stageLabel = data.stage === "middle" ? "متوسط" : "ابتدائي";

  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [presentingId, setPresentingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [immersive, setImmersive] = useState(immersiveNow);
  const [overrides, setOverrides] = useState<CornerOverrides>(() => loadCornerOverrides());
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<{ corner: BreakCorner; isNew: boolean } | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [games, setGames] = useState<SavedGame[]>(() => loadGames());
  const [playingGame, setPlayingGame] = useState<{ title: string; type: ChallengeType; content: ChallengeContent } | null>(null);
  const [aiGame, setAiGame] = useState<{ title: string; html: string } | null>(null);
  const [capsule, setCapsule] = useState<CapsuleGoal[]>(() => loadCapsule());
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [badges, setBadges] = useState<string[]>(() => loadBadges());
  const [weekIndex, setWeekIndex] = useState(0);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setImmersive(immersiveNow());
    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  // البرامج المتوفرة حاليًا للمرحلة المسجَّلة فقط.
  const weeks = useMemo(
    () => breakWeeks.filter((w) => w.stage === stageLabel).sort((a, b) => a.week - b.week),
    [stageLabel]
  );
  const week = weeks[weekIndex] ?? weeks[0] ?? null;
  const scene = useMemo(() => weekTheme(week), [week]);

  // أسبوع مختار قادم من صفحة رحلة الأسابيع.
  useEffect(() => {
    const id = (location.state as { weekId?: string } | null)?.weekId;
    if (id) {
      const i = weeks.findIndex((w) => w.id === id);
      if (i >= 0) setWeekIndex(i);
    }
  }, [weeks, location.state]);

  // أركان الأسبوع بعد أي تعديل من المعلم، وإلا أركان الملف الأصلية.
  const corners = week ? overrides[week.id] ?? week.corners : [];
  const presenting = corners.find((c) => c.id === presentingId) ?? null;
  const playing = corners.find((c) => c.id === playingId) ?? null;
  const completed = corners.filter((c) => doneIds.includes(c.id)).length;
  const allDone = corners.length > 0 && completed === corners.length;
  const uniqueValues = new Set(corners.flatMap((c) => c.values)).size;
  const premium = isPremium(data.plan);
  const nextCorner = corners.find((c) => !doneIds.includes(c.id)) ?? null;
  const weekPct = corners.length ? Math.round((completed / corners.length) * 100) : 0;

  function toggleDone(id: string) {
    setDoneIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function persistCorners(next: BreakCorner[]) {
    if (!week) return;
    setOverrides((prev) => {
      const merged = { ...prev, [week.id]: next };
      saveCornerOverrides(merged);
      return merged;
    });
  }

  function saveCorner(corner: BreakCorner) {
    const exists = corners.some((c) => c.id === corner.id);
    persistCorners(exists ? corners.map((c) => (c.id === corner.id ? corner : c)) : [...corners, corner]);
    setEditing(null);
  }

  function deleteCorner(id: string) {
    persistCorners(corners.filter((c) => c.id !== id));
    setDoneIds((prev) => prev.filter((x) => x !== id));
    setEditing(null);
  }

  // وكيل الأنشطة: يشغّل اللعبة المبنيّة فورًا، أو يحفظها في لوحة الرائد
  function playBuilt(built: BuiltChallenge) {
    setAssistantOpen(false);
    setPlayingGame({ title: built.title, type: built.type, content: built.content });
  }

  function saveBuilt(built: BuiltChallenge) {
    setGames((prev) => {
      const next: SavedGame[] = [...prev, { ...built, id: makeGameId(prev), createdLabel: "لعبة الوكيل" }];
      saveGames(next);
      return next;
    });
  }

  function deleteGame(id: string) {
    setGames((prev) => {
      const next = prev.filter((g) => g.id !== id);
      saveGames(next);
      return next;
    });
  }

  // كبسولة المستقبل: مراجعة الأهداف المختومة وقياس ما تحقّق آخر الفصل
  const capsuleDone = capsule.filter((g) => g.achieved).length;

  function toggleGoal(id: string) { setCapsule(toggleCapsuleAchieved(id)); }
  function removeGoal(id: string) { setCapsule(removeCapsuleGoal(id)); }
  function emptyCapsule() { setCapsule(clearCapsule()); setCapsuleOpen(false); }

  function printCapsule() {
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
    const pct = capsule.length ? Math.round((capsuleDone / capsule.length) * 100) : 0;
    const rows = capsule
      .map((g, i) => `<tr class="${g.achieved ? "done" : ""}"><td class="n">${i + 1}</td><td class="goal">${esc(g.text)}</td><td class="who">${g.who ? esc(g.who) : "، "}</td><td class="st">${g.achieved ? "✓ تحقّق" : "لم يتحقّق بعد"}</td></tr>`)
      .join("");
    const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>كبسولة المستقبل، حصاد الأهداف</title>
<style>
  *{box-sizing:border-box} body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1a1636;margin:0;padding:32px;background:#fff}
  .head{border-bottom:3px solid #6b4de6;padding-bottom:16px;margin-bottom:20px}
  .head h1{margin:0 0 4px;font-size:24px;color:#4d1c9b}
  .head .sub{color:#555;font-size:14px}
  .meta{display:flex;gap:24px;flex-wrap:wrap;margin:14px 0 22px;font-size:14px;color:#333}
  .meta b{color:#4d1c9b}
  .summary{display:flex;align-items:center;gap:14px;background:#f3efff;border:1px solid #e0d7ff;border-radius:14px;padding:14px 18px;margin-bottom:20px}
  .summary .big{font-size:26px;font-weight:800;color:#4d1c9b}
  .bar{flex:1;height:12px;background:#e6ddff;border-radius:99px;overflow:hidden}
  .bar > i{display:block;height:100%;width:${pct}%;background:#6b4de6}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{text-align:right;padding:10px 12px;border-bottom:1px solid #eee}
  th{background:#faf8ff;color:#4d1c9b;font-weight:700}
  td.n{color:#999;width:36px}
  tr.done td.goal{text-decoration:line-through;color:#7a7a7a}
  td.st{white-space:nowrap;font-weight:700;color:#b06a00}
  tr.done td.st{color:#18794e}
  footer{margin-top:26px;color:#999;font-size:12px;text-align:center}
  @media print{body{padding:0}}
</style></head>
<body>
  <div class="head">
    <h1>كبسولة المستقبل، حصاد الأهداف</h1>
    <div class="sub">ما تمنّاه الطلاب في بداية العام، وما تحقّق منه</div>
  </div>
  <div class="meta"><span><b>المدرسة:</b> ${esc(data.schoolName || "، ")}</span><span><b>رائد النشاط:</b> ${esc(data.teacherName || "، ")}</span><span><b>المرحلة:</b> ${esc(stageLabel)}</span></div>
  <div class="summary"><span class="big">${capsuleDone} / ${capsule.length}</span><div class="bar"><i></i></div><span>${pct}% تحقّق</span></div>
  <table><thead><tr><th>#</th><th>الهدف</th><th>الطالب</th><th>الحالة</th></tr></thead><tbody>${rows}</tbody></table>
  <footer>وُثّق عبر منصة «نشاط»، كبسولة المستقبل</footer>
  <script>window.onload=function(){window.focus();window.print();}</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  // وسام يُضاف مرة واحدة عند اكتمال الأسبوع، ويُحفظ ليتجمّع عبر الأسابيع.
  useEffect(() => {
    if (allDone && week && !badges.includes(week.id)) {
      setBadges((prev) => {
        if (prev.includes(week.id)) return prev;
        const next = [...prev, week.id];
        saveBadges(next);
        return next;
      });
    }
  }, [allDone, week, badges]);

  function goToUpcoming() {
    document.getElementById("upcoming")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="relative min-h-screen">
      {/* خلفية المدرسة ثلاثية الأبعاد، ثابتة خلف كامل اللوحة. */}
      {immersive ? (
        <Suspense
          fallback={
            <div
              className="pointer-events-none fixed inset-0 z-0"
              style={{ background: `linear-gradient(to bottom, ${scene.skyTop}, ${scene.skyBottom})` }}
            />
          }
        >
          <DashboardScene
            theme={scene}
            schoolName={data.schoolName}
            animate
            scroll={scrollYProgress}
            className="pointer-events-none fixed inset-0 z-0"
          />
        </Suspense>
      ) : (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{ background: `linear-gradient(to bottom, ${scene.skyTop}, ${scene.skyBottom})` }}
        />
      )}

      {/* طبقة تباين: تُبقي المبنى واضحًا أعلى الشاشة وتُعتّم الأسفل ليقرأ المحتوى. */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />

      <div className="relative z-10 flex min-h-screen">
      <Sidebar teacherName={data.teacherName} schoolName={data.schoolName} gender={gender} accentBg={accent.bg} />

      <main id="main-content" className="flex-1 px-5 py-10 sm:px-8 lg:py-12">
        {(entered || !week) && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
        {/* جولة تعريفية بعد أول دخول + زر إعادتها. */}
        <OnboardingTour steps={TOUR_STEPS} />
        <TourButton />

        {/* شريط موسمي «العودة للدراسة»، يظهر أول أسبوعين ثم يختفي تلقائيًا. */}
        <BackToSchoolRibbon className="mb-4" />

        {/* ترحيب مختصر أعلى المحتوى بعد الدخول. */}
        <div className="flex min-h-[22vh] flex-col justify-end pb-4">
          <h1 className="text-3xl text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.9)] sm:text-4xl">
            أهلًا، {data.teacherName || "معلم النشاط"}
          </h1>
          <p className="mt-2 text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
            هذا أسبوعك في {data.schoolName || "نشاط"}
          </p>
        </div>

        {/* صفيحة المحتوى: مطرّزة بهوية المناسبة ومتصلة بجو المدرسة، وتبقى مقروءة. */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-7"
          style={{
            background: `linear-gradient(180deg, ${scene.banner}59, rgba(19,18,9,0.92) 280px)`,
            borderColor: `${scene.accent}33`,
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0">
            <DiamondRule className="w-full opacity-50" />
          </div>
          <SaduPattern className="pointer-events-none absolute right-0 top-6 z-0 h-44 w-44 opacity-[0.06]" />
          <div className="relative z-10">
        {week ? (
          <>
            {/* مركز القيادة: يجيب بثوانٍ — ماذا أفعل الآن؟ ماذا لديّ؟ ما الجديد؟ كيف أنفّذ؟ */}
            <ScrollReveal>
              <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: `${scene.accent}33`, background: "rgba(255,255,255,0.03)" }}>
                <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-faint">🧭 مركز القيادة</span>
                {/* ماذا أفعل الآن؟ */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4" style={{ borderColor: `${scene.accent}44`, background: `${scene.accent}12` }}>
                  <div className="min-w-0">
                    <span className={cn("text-xs font-bold", accent.text)}>▶ ماذا أفعل الآن؟</span>
                    <h3 className="mt-1 font-display text-xl text-ink sm:text-2xl">{nextCorner ? nextCorner.title : "أنجزت كل أركان الأسبوع 🎉"}</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">{nextCorner ? "جاهز بخطواته وأدواته، اعرضه على طلابك مباشرة" : "أحسنت، راجع إنجازك أو استكشف رحلة الأسابيع"}</p>
                  </div>
                  {nextCorner && (
                    <button type="button" onClick={() => setPresentingId(nextCorner.id)} className={cn("shrink-0 rounded-full px-7 py-3.5 text-base font-bold text-bg shadow-xl transition-transform hover:scale-105 active:scale-95", accent.bg)}>
                      ▶ ابدأ العرض
                    </button>
                  )}
                </div>
                {/* ثلاث إجابات سريعة */}
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-xs font-bold text-ink-muted">📅 ماذا لديّ هذا الأسبوع؟</span>
                    <p className="mt-1 truncate font-display text-ink">{week.occasion ?? `الأسبوع ${arN(week.week)}`}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{arN(completed)}/{arN(corners.length)} أركان · {arN(weekPct)}٪ مكتمل</p>
                  </div>
                  <button type="button" onClick={() => navigate("/آخر-فرصة", { state: data })} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right transition-colors hover:border-white/25">
                    <span className="text-xs font-bold text-ink-muted">✨ ما الجديد؟</span>
                    <p className="mt-1 font-display text-ink">الألعاب الكبرى + المخطّط الذكي</p>
                    <p className="mt-0.5 text-xs" style={{ color: scene.accent }}>جرّبها الآن ←</p>
                  </button>
                  <button type="button" onClick={() => window.dispatchEvent(new Event("motafael:open-tour"))} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right transition-colors hover:border-white/25">
                    <span className="text-xs font-bold text-ink-muted">❓ كيف أنفّذ فعالية؟</span>
                    <p className="mt-1 font-display text-ink">جولة سريعة خطوة بخطوة</p>
                    <p className="mt-0.5 text-xs" style={{ color: scene.accent }}>ابدأ الجولة ←</p>
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {weeks.length > 1 && (
              <ScrollReveal className="mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/الأسابيع", { state: data })}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <span className="flex items-center gap-3">
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-lg text-bg", accent.bg)}>
                      🚀
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">استكشف رحلة الأسابيع</span>
                      <span className="block text-xs text-ink-muted">كل أسبوع بموضوعه وهويته، افتح رحلتك النوعية</span>
                    </span>
                  </span>
                  <CaretLeft weight="bold" className="h-5 w-5 text-ink-faint transition-transform duration-300 group-hover:-translate-x-1" />
                </button>
              </ScrollReveal>
            )}

            {allDone && (
              <ScrollReveal className="mt-8">
                <WeekComplete
                  week={week}
                  cornersCount={corners.length}
                  valuesCount={uniqueValues}
                  studentsCount={data.students.length}
                  badgeCount={badges.length}
                  theme={scene}
                  accentText={accent.text}
                  accentBg={accent.bg}
                  onNext={goToUpcoming}
                />
              </ScrollReveal>
            )}

            <ScrollReveal delay={0.05} className="mt-8">
              <WeeklyTargetCard week={week} total={corners.length} completed={completed} accentText={accent.text} allDone={allDone} />
            </ScrollReveal>

            <ScrollReveal delay={0.07} className="mt-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <h3 className="font-display text-lg text-ink">لوحة الإنجاز</h3>
                  <span className="text-xs text-ink-faint">قياس أثر نشاطك</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { emoji: "🎯", label: "إنجاز الأسبوع", value: `${arN(corners.length ? Math.round((completed / corners.length) * 100) : 0)}٪`, sub: `${arN(completed)}/${arN(corners.length)} ركن` },
                    { emoji: "🏅", label: "الأوسمة", value: arN(badges.length), sub: "مكتسبة" },
                    { emoji: "🎮", label: "أنشطة محفوظة", value: arN(games.length), sub: "من الوكيل" },
                    { emoji: "🔮", label: "الكبسولة", value: `${arN(capsuleDone)}/${arN(capsule.length)}`, sub: "أهداف تحقّقت" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <span className="text-xl">{s.emoji}</span>
                      <p className={cn("mt-1 font-display text-2xl", accent.text)}>{s.value}</p>
                      <p className="text-xs font-semibold text-ink">{s.label}</p>
                      <p className="text-[11px] text-ink-faint">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.09} className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => navigate("/مخطط-النشاط", { state: data })}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right transition-transform hover:scale-[1.01]">
                  <div><span className="inline-flex items-center gap-1.5 rounded-full bg-sun-400/15 px-2.5 py-0.5 text-[11px] font-bold text-sun-300">📅 المتكامل</span>
                    <h3 className="mt-1.5 font-display text-lg text-ink">المخطّط الذكي</h3>
                    <p className="text-xs text-ink-muted">خطة شهرك تُقترح تلقائيًا من محتواك</p></div>
                  <CaretLeft weight="bold" className="h-5 w-5 text-ink-faint transition-colors group-hover:text-sun-300" />
                </button>
                <button type="button" onClick={() => navigate("/سجل-النشاط", { state: data })}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right transition-transform hover:scale-[1.01]">
                  <div><span className="inline-flex items-center gap-1.5 rounded-full bg-sun-400/15 px-2.5 py-0.5 text-[11px] font-bold text-sun-300">📊 المتكامل</span>
                    <h3 className="mt-1.5 font-display text-lg text-ink">سجل وأثر النشاط</h3>
                    <p className="text-xs text-ink-muted">وثّق كل نشاط، وأنشئ ملف إنجازك PDF</p></div>
                  <CaretLeft weight="bold" className="h-5 w-5 text-ink-faint transition-colors group-hover:text-sun-300" />
                </button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="activities" className="scroll-mt-24 text-2xl text-ink">أركان الاستراحة</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {editMode ? "عدّل أي ركن أو أضف نشاطك الخاص" : "ركن لكل يوم، جاهز بخطواته وأدواته"}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-ink-faint">
                  <CalendarBlank weight="bold" className="h-4 w-4" />
                  {corners.length} أيام
                </span>
              </div>

              <div className="mt-6">
                <YardCorners
                  corners={corners}
                  doneIds={doneIds}
                  accentBg={accent.bg}
                  accentText={accent.text}
                  theme={scene}
                  editMode={editMode}
                  onToggleDone={toggleDone}
                  onOpen={setPresentingId}
                  onPlay={setPlayingId}
                  onEdit={(id) => setEditing({ corner: corners.find((c) => c.id === id)!, isNew: false })}
                  onAdd={() => setEditing({ corner: blankCorner(corners.length + 1), isNew: true })}
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="mt-12">
              <h2 className="text-2xl text-ink">الروتين اليومي</h2>
              <p className="mt-1 text-sm text-ink-muted">اعرضه على طلابك خطوة بخطوة بشكل ممتع</p>
              <div className="mt-6">
                <RoutineJourney routine={week.dailyRoutine} accentText={accent.text} accentBg={accent.bg} />
              </div>
            </ScrollReveal>
          </>
        ) : (
          <ScrollReveal delay={0.05} className="mt-8">
            <GlassCard className="flex flex-col items-center gap-3 py-14 text-center">
              <Info weight="duotone" className="h-10 w-10 text-ink-faint" />
              <h2 className="text-xl text-ink">برامج المرحلة {stageLabel} قيد الإدخال</h2>
              <p className="max-w-md text-sm text-ink-muted">
                نعمل على إدخال برامج الأنشطة المعتمدة لهذه المرحلة. المتوفر حاليًا أنشطة
                الاستراحة للمرحلة الابتدائية
              </p>
            </GlassCard>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.1} className="mt-12">
          <h2 id="tools" className="scroll-mt-24 text-2xl text-ink">أدوات المعلم</h2>
          <p className="mt-1 text-sm text-ink-muted">تعينك على إدارة الركن أثناء تنفيذه</p>
          <div className="mt-6">
            <TeacherTools
              students={data.students}
              accentText={accent.text}
              accentBg={accent.bg}
              editMode={editMode}
              onToggleEdit={() => setEditMode((v) => !v)}
              onOpenAssistant={() => setAssistantOpen(true)}
            />
          </div>

          <button
            id="tournament"
            type="button"
            onClick={() => navigate("/بطولة-نشاط", { state: data })}
            className="group mt-4 flex w-full scroll-mt-24 items-center justify-between gap-4 rounded-2xl border border-amber-400/30 p-5 text-right transition-transform duration-300 hover:scale-[1.01]"
            style={{ background: "linear-gradient(150deg, rgba(245,158,11,0.16), rgba(19,18,9,0.9))" }}
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-0.5 text-[11px] font-bold text-amber-300">🏆 لعبة جماعية · جديد</span>
              <h3 className="mt-2 font-display text-xl text-ink sm:text-2xl">بطولة نشاط</h3>
              <p className="mt-1 text-sm text-ink-muted">قسّم فصلك فرقًا وأدِر بطولة تنافسية: تحديات ومخاطرة وأحداث وجولة نهائية</p>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-base font-bold text-bg shadow-xl transition-transform duration-300 group-hover:scale-105">
              🎮 ابدأ البطولة
            </span>
          </button>
        </ScrollReveal>

        {games.length > 0 && (
          <ScrollReveal delay={0.1} className="mt-12">
            <h2 id="agent-games" className="scroll-mt-24 text-2xl text-ink">ألعاب بناها لك الوكيل</h2>
            <p className="mt-1 text-sm text-ink-muted">تحديات جاهزة على صفحتك، اضغط ▶ لتلعبها أمام طلابك</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((g) => (
                <GlassCard key={g.id} className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg text-ink">{g.title}</h3>
                    <button onClick={() => deleteGame(g.id)} aria-label="حذف اللعبة"
                      className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-xs text-ink-muted transition-colors hover:border-white/30 hover:text-ink">حذف</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold text-bg", accent.bg)}>{g.engineLabel}</span>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-ink-muted">{g.summary}</span>
                  </div>
                  <button onClick={() => setPlayingGame({ title: g.title, type: g.type, content: g.content })}
                    className={cn("mt-auto flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-bg transition-transform duration-300 hover:scale-[1.02] active:scale-95", accent.bg)}>
                    ▶ شغّل اللعبة
                  </button>
                </GlassCard>
              ))}
            </div>
          </ScrollReveal>
        )}

        {capsule.length > 0 && (
          <ScrollReveal delay={0.1} className="mt-12">
            <h2 id="capsule" className="scroll-mt-24 text-2xl text-ink">كبسولة المستقبل</h2>
            <p className="mt-1 text-sm text-ink-muted">أهداف ختمها طلابك في الأسبوع التمهيدي، افتحها آخر الفصل وأشّر ما تحقّق ليقيس كل طالب نموّه</p>
            <div className="mt-6">
              <GlassCard className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{capsuleOpen ? "🔓" : "🔒"}</span>
                    <div>
                      <p className="font-display text-lg text-ink">{capsule.length} هدفًا مختومًا</p>
                      <p className="text-sm text-ink-muted">تحقّق {capsuleDone} من {capsule.length}</p>
                    </div>
                  </div>
                  {!capsuleOpen ? (
                    <button onClick={() => setCapsuleOpen(true)} className={cn("rounded-full px-6 py-2.5 text-sm font-bold text-bg", accent.bg)}>🔓 افتح الكبسولة</button>
                  ) : (
                    <button onClick={() => setCapsuleOpen(false)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-white/30">أغلِق</button>
                  )}
                </div>

                {capsuleOpen && (
                  <div className="mt-5 space-y-4">
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div className={cn("h-full rounded-full transition-all duration-500", accent.bg)} style={{ width: `${capsule.length ? Math.round((capsuleDone / capsule.length) * 100) : 0}%` }} />
                    </div>
                    <ul className="space-y-2">
                      {capsule.map((g) => (
                        <li key={g.id} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3", g.achieved ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/[0.03]")}>
                          <button onClick={() => toggleGoal(g.id)} aria-label="تبديل التحقّق"
                            className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold", g.achieved ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/30 text-transparent")}>✓</button>
                          <div className="flex-1 text-right">
                            <p className={cn("text-sm", g.achieved ? "text-ink-muted line-through" : "text-ink")}>{g.text}</p>
                            {g.who && <p className="text-xs text-ink-muted">{g.who}</p>}
                          </div>
                          <button onClick={() => removeGoal(g.id)} className="shrink-0 text-xs text-ink-muted transition-colors hover:text-ink">حذف</button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <button onClick={printCapsule} className={cn("rounded-full px-5 py-2 text-sm font-bold text-bg transition-transform hover:scale-[1.02] active:scale-95", accent.bg)}>🖨️ اطبع / احفظ PDF</button>
                      <button onClick={emptyCapsule} className="text-xs text-ink-muted transition-colors hover:text-red-400">إفراغ الكبسولة</button>
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.1} className="mt-12">
          <h2 id="students" className="scroll-mt-24 text-2xl text-ink">فصولك وطلابك</h2>
          <p className="mt-1 text-sm text-ink-muted">أضف فصولك وأسماء طلابك، وزّع المجموعات، وامنح النقاط، وفي نهاية الأسبوع يظهر الفائزون</p>
          <div className="mt-6">
            <ClassesManager accent="#ff9d3d" />
          </div>
          <div className="mt-4">
            <BadgesPanel students={data.students} premium={premium} accentBg={accent.bg} accentText={accent.text} onUpgrade={() => goToPricing(navigate)} />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <div id="upcoming" className="scroll-mt-24">
            <UpcomingWeeks accentBg={accent.bg} accentText={accent.text} />
          </div>
        </ScrollReveal>

        {week && (
          <p className="mt-10 text-xs text-ink-faint">
            المصدر: {week.source.fileName}، برامج الأنشطة الطلابية، نسخة تجريبية ١٤٤٧-٢٠٢٥
          </p>
        )}
          </div>
        </div>
          </motion.div>
        )}
      </main>
      </div>

      {/* بوابة الأسبوع: طبقة فوق المشهد تتلاشى عند «يلا نبدأ» ليظهر المحتوى. */}
      <AnimatePresence>
        {week && !entered && (
          <WeekIntro
            key="intro"
            week={week}
            teacherName={data.teacherName}
            theme={scene}
            accentBg={accent.bg}
            onStart={() => setEntered(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assistantOpen && (
          <ActivityAssistant
            accentBg={accent.bg}
            accentText={accent.text}
            onPlay={playBuilt}
            onSaveGame={saveBuilt}
            onAiGame={(g) => { setAssistantOpen(false); setAiGame(g); }}
            stage={stageLabel}
            gender={gender === "boys" ? "بنين" : "بنات"}
            onClose={() => setAssistantOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiGame && <AiGamePlayer title={aiGame.title} html={aiGame.html} onClose={() => setAiGame(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {playingGame && (
          <ChallengePlayer
            title={playingGame.title}
            type={playingGame.type}
            content={playingGame.content}
            pal={gender === "boys"
              ? { accent: "#4aa8ff", accentSoft: "#bfe0ff", deep: "#04162a" }
              : { accent: "#ff6fb5", accentSoft: "#ffd3e8", deep: "#2a0a1c" }}
            onClose={() => setPlayingGame(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editing && (
          <CornerEditor
            initial={editing.corner}
            isNew={editing.isNew}
            accentBg={accent.bg}
            onSave={saveCorner}
            onClose={() => setEditing(null)}
            onDelete={editing.isNew ? undefined : () => deleteCorner(editing.corner.id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {presenting && (
          <ActivityPresentation
            corner={presenting}
            slogan={scene.slogan}
            occasion={week?.occasion ?? null}
            hasActivity={!!presenting.play}
            onClose={() => setPresentingId(null)}
            onLaunch={() => {
              setPlayingId(presenting.id);
              setPresentingId(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing?.play === "quiz" && playing.quiz && (
          <QuizGame items={playing.quiz} title={playing.title} theme={scene} onExit={() => setPlayingId(null)} />
        )}
        {playing?.play === "tree" && <ValueTree onExit={() => setPlayingId(null)} />}
        {playing?.play === "gallery" && <GalleryWall onExit={() => setPlayingId(null)} />}
      </AnimatePresence>
    </div>
  );
}
