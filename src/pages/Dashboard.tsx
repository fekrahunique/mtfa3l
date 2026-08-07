import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CalendarBlank, Info } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { GlassCard } from "../components/GlassCard";
import { Sidebar } from "../components/dashboard/Sidebar";
import { WeeklyTargetCard } from "../components/dashboard/WeeklyTargetCard";
import { CornerCard } from "../components/dashboard/CornerCard";
import { CornerDetail } from "../components/dashboard/CornerDetail";
import { StudentsTable } from "../components/dashboard/StudentsTable";
import { breakWeeks } from "../data/breakPeriods";
import { genderAccent, type RegistrationData } from "../lib/theme";

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
  const data = (location.state as RegistrationData | null) ?? demoData;
  const gender = data.gender ?? "girls";
  const accent = genderAccent[gender];
  const stageLabel = data.stage === "middle" ? "متوسط" : "ابتدائي";

  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [openCornerId, setOpenCornerId] = useState<string | null>(null);

  // البرامج المتوفرة حاليًا للمرحلة المسجَّلة فقط.
  const weeks = useMemo(() => breakWeeks.filter((w) => w.stage === stageLabel), [stageLabel]);
  const week = weeks[0] ?? null;

  const openCorner = week?.corners.find((c) => c.id === openCornerId) ?? null;
  const completed = week ? week.corners.filter((c) => doneIds.includes(c.id)).length : 0;

  function toggleDone(id: string) {
    setDoneIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar teacherName={data.teacherName} schoolName={data.schoolName} gender={gender} accentBg={accent.bg} />

      <main id="main-content" className="flex-1 px-5 py-10 sm:px-8 lg:py-12">
        <ScrollReveal>
          <h1 className="text-3xl text-ink">أهلًا، {data.teacherName || "معلم النشاط"}</h1>
          <p className="mt-2 text-ink-muted">هذا أسبوعك في {data.schoolName || "متفاعل"}.</p>
        </ScrollReveal>

        {week ? (
          <>
            <ScrollReveal delay={0.05} className="mt-8">
              <WeeklyTargetCard week={week} completed={completed} accentText={accent.text} />
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl text-ink">أركان الاستراحة</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    ركن لكل يوم، جاهز بخطواته وأدواته.
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-ink-faint">
                  <CalendarBlank weight="bold" className="h-4 w-4" />
                  {week.corners.length} أيام
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {week.corners.map((corner) => (
                  <CornerCard
                    key={corner.id}
                    corner={corner}
                    done={doneIds.includes(corner.id)}
                    accentBg={accent.bg}
                    accentText={accent.text}
                    onToggleDone={() => toggleDone(corner.id)}
                    onOpen={() => setOpenCornerId(corner.id)}
                  />
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="mt-12">
              <h2 className="text-2xl text-ink">الروتين اليومي</h2>
              <p className="mt-1 text-sm text-ink-muted">يعوّد المعلم الطلاب عليه طوال الأسبوع.</p>
              <GlassCard className="mt-6">
                <ul className="space-y-3">
                  {week.dailyRoutine.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-relaxed text-ink-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </ScrollReveal>
          </>
        ) : (
          <ScrollReveal delay={0.05} className="mt-8">
            <GlassCard className="flex flex-col items-center gap-3 py-14 text-center">
              <Info weight="duotone" className="h-10 w-10 text-ink-faint" />
              <h2 className="text-xl text-ink">برامج المرحلة {stageLabel} قيد الإدخال</h2>
              <p className="max-w-md text-sm text-ink-muted">
                نعمل على إدخال برامج الأنشطة المعتمدة لهذه المرحلة. المتوفر حاليًا أنشطة
                الاستراحة للمرحلة الابتدائية.
              </p>
            </GlassCard>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.1} className="mt-12">
          <h2 className="text-2xl text-ink">طلابك</h2>
          <div className="mt-6">
            <StudentsTable students={data.students} username={data.username} />
          </div>
        </ScrollReveal>

        {week && (
          <p className="mt-10 text-xs text-ink-faint">
            المصدر: {week.source.fileName} — برامج الأنشطة الطلابية، نسخة تجريبية ١٤٤٧-٢٠٢٥.
          </p>
        )}
      </main>

      <AnimatePresence>
        {openCorner && week && (
          <CornerDetail
            corner={openCorner}
            routine={week.dailyRoutine}
            accentText={accent.text}
            accentBg={accent.bg}
            onClose={() => setOpenCornerId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
