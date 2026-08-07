import type { ComponentType } from "react";
import { Buildings, House, Student, GraduationCap } from "@phosphor-icons/react";
import { ScrollReveal } from "../../components/ScrollReveal";
import { cn } from "../../lib/utils";
import type { Gender, SchoolType, Stage } from "../../lib/theme";

function OptionCard({
  active,
  onClick,
  icon: Icon,
  label,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ weight?: "duotone"; className?: string }>;
  label: string;
  activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 flex-col items-center gap-3 rounded-2xl border px-6 py-8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        active ? cn(activeClass, "border-transparent") : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      )}
    >
      <Icon weight="duotone" className={cn("h-8 w-8", active ? "text-bg" : "text-sun-400")} />
      <span className={cn("text-base font-semibold", active ? "text-bg" : "text-ink")}>{label}</span>
    </button>
  );
}

export function StepSchool({
  schoolType,
  stage,
  gender,
  onChange,
}: {
  schoolType: SchoolType | null;
  stage: Stage | null;
  gender: Gender | null;
  onChange: (patch: Partial<{ schoolType: SchoolType; stage: Stage; gender: Gender }>) => void;
}) {
  return (
    <div className="space-y-10">
      <ScrollReveal>
        <h2 className="text-2xl text-ink">نوع المدرسة</h2>
        <div className="mt-4 flex gap-4">
          <OptionCard
            active={schoolType === "government"}
            onClick={() => onChange({ schoolType: "government" })}
            icon={Buildings}
            label="حكومية"
            activeClass="bg-sun-400"
          />
          <OptionCard
            active={schoolType === "private"}
            onClick={() => onChange({ schoolType: "private" })}
            icon={House}
            label="أهلية"
            activeClass="bg-sun-400"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <h2 className="text-2xl text-ink">المرحلة الدراسية</h2>
        <div className="mt-4 flex gap-4">
          <OptionCard
            active={stage === "primary"}
            onClick={() => onChange({ stage: "primary" })}
            icon={Student}
            label="ابتدائي"
            activeClass="bg-sun-400"
          />
          <OptionCard
            active={stage === "middle"}
            onClick={() => onChange({ stage: "middle" })}
            icon={GraduationCap}
            label="متوسط"
            activeClass="bg-sun-400"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <h2 className="text-2xl text-ink">الطلاب</h2>
        <p className="mt-1 text-sm text-ink-faint">يحدد هذا الاختيار ألوان لوحة التحكم الخاصة بك.</p>
        <div className="mt-4 flex gap-4">
          <OptionCard
            active={gender === "boys"}
            onClick={() => onChange({ gender: "boys" })}
            icon={Student}
            label="بنين"
            activeClass="bg-boys-500"
          />
          <OptionCard
            active={gender === "girls"}
            onClick={() => onChange({ gender: "girls" })}
            icon={Student}
            label="بنات"
            activeClass="bg-girls-500"
          />
        </div>
      </ScrollReveal>
    </div>
  );
}
