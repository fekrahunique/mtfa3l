import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { CalendarBlank, Info, CaretLeft } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { GlassCard } from "../components/GlassCard";
import { Sidebar } from "../components/dashboard/Sidebar";
import { WeeklyTargetCard } from "../components/dashboard/WeeklyTargetCard";
import { ClassesManager } from "../components/dashboard/ClassesManager";
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
  { title: "أهلًا بك في لوحتك 👋", body: "خلّني آخذك جولة سريعة أوريك فيها كل شي بأبسط طريقة — تقدر تتخطّاها وقت ما تبي." },
  { targetId: "activities", title: "📋 أنشطة الأسبوع", body: "هنا أركان يومك جاهزة. اضغط أيّ ركن ليبدأ العرض التفاعلي على الشاشة أمام طلابك — بلا تحضير ولا ورق." },
  { targetId: "tools", title: "🧰 أدواتك", body: "هنا المؤقّت، ومنتقي الطلاب، والمساعد الذكي اللي يصنع لك أنشطة ومسابقات جديدة بضغطة." },
  { targetId: "students", title: "🧑‍🎓 فصولك وطلابك", body: "أضف فصولك وأسماء طلابهم (أسقِط ملفًا أو اكتب)، وزّع المجموعات، وامنح النقاط — وآخر الأسبوع يطلع الفائزون." },
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
import type { GeneratedActivity } from "../lib/activityGenerator";

const EASE = [0.32, 0.72, 0, 1] as const;

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

  function cornerFromGenerated(gen: GeneratedActivity): BreakCorner {
    return {
      ...blankCorner(corners.length + 1),
      title: gen.title,
      outcomes: gen.outcomes,
      values: gen.values,
      tools: ["اللاقط (المايكروفون)."],
      steps: gen.steps,
      quiz: gen.quiz,
      play: "quiz",
      edited: true,
    };
  }

  function saveGenerated(gen: GeneratedActivity) {
    persistCorners([...corners, cornerFromGenerated(gen)]);
    setAssistantOpen(false);
  }

  function editGenerated(gen: GeneratedActivity) {
    setEditing({ corner: cornerFromGenerated(gen), isNew: true });
    setAssistantOpen(false);
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
      {/* خلفية المدرسة ثلاثية الأبعاد — ثابتة خلف كامل اللوحة. */}
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

        {/* شريط موسمي «العودة للدراسة» — يظهر أول أسبوعين ثم يختفي تلقائيًا. */}
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
                      <span className="block text-xs text-ink-muted">كل أسبوع بموضوعه وهويته — افتح رحلتك النوعية</span>
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
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <h2 id="students" className="scroll-mt-24 text-2xl text-ink">فصولك وطلابك</h2>
          <p className="mt-1 text-sm text-ink-muted">أضف فصولك وأسماء طلابك، وزّع المجموعات، وامنح النقاط — وفي نهاية الأسبوع يظهر الفائزون</p>
          <div className="mt-6">
            <ClassesManager accent="#ff9d3d" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <div id="upcoming" className="scroll-mt-24">
            <UpcomingWeeks accentBg={accent.bg} accentText={accent.text} />
          </div>
        </ScrollReveal>

        {week && (
          <p className="mt-10 text-xs text-ink-faint">
            المصدر: {week.source.fileName} — برامج الأنشطة الطلابية، نسخة تجريبية ١٤٤٧-٢٠٢٥
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
            onSave={saveGenerated}
            onEdit={editGenerated}
            onClose={() => setAssistantOpen(false)}
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
