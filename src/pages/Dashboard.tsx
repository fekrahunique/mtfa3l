import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScrollReveal } from "../components/ScrollReveal";
import { Sidebar } from "../components/dashboard/Sidebar";
import { WeeklyTargetCard } from "../components/dashboard/WeeklyTargetCard";
import { ActivityCard } from "../components/dashboard/ActivityCard";
import { ToolCard } from "../components/dashboard/ToolCard";
import { StudentsTable } from "../components/dashboard/StudentsTable";
import { activities, tools } from "../lib/dashboardData";
import { genderAccent, type RegistrationData } from "../lib/theme";
import { cn } from "../lib/utils";

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

type Filter = "all" | "classroom" | "extracurricular";

export function Dashboard() {
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? demoData;
  const gender = data.gender ?? "girls";
  const accent = genderAccent[gender];
  const [filter, setFilter] = useState<Filter>("all");

  const filteredActivities = useMemo(
    () => activities.filter((a) => filter === "all" || a.category === filter),
    [filter]
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "الكل" },
    { id: "classroom", label: "صفي" },
    { id: "extracurricular", label: "لا صفي" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar teacherName={data.teacherName} schoolName={data.schoolName} gender={gender} accentBg={accent.bg} />

      <main id="main-content" className="flex-1 px-5 py-10 sm:px-8 lg:py-12">
        <ScrollReveal>
          <h1 className="text-3xl text-ink">أهلًا، {data.teacherName || "معلم النشاط"}</h1>
          <p className="mt-2 text-ink-muted">هذا أسبوعك في {data.schoolName || "متفاعل"}.</p>
        </ScrollReveal>

        <ScrollReveal delay={0.05} className="mt-8">
          <WeeklyTargetCard completed={2} total={5} accentText={accent.text} />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl text-ink">الأنشطة الأسبوعية</h2>
            <div className="flex gap-2 rounded-full border border-white/10 p-1">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    filter === f.id ? cn(accent.bg, "text-bg") : "text-ink-muted hover:text-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} accentBg={accent.bg} accentText={accent.text} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <h2 className="text-2xl text-ink">أدوات مساعدة</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} accentText={accent.text} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12">
          <h2 className="text-2xl text-ink">طلابك</h2>
          <div className="mt-6">
            <StudentsTable students={data.students} username={data.username} />
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
