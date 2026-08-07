import { ScrollReveal } from "../../components/ScrollReveal";
import { cn } from "../../lib/utils";

interface Errors {
  teacherName?: string;
  email?: string;
  schoolName?: string;
}

export function StepTeacher({
  teacherName,
  email,
  schoolName,
  errors,
  onChange,
}: {
  teacherName: string;
  email: string;
  schoolName: string;
  errors: Errors;
  onChange: (patch: Partial<{ teacherName: string; email: string; schoolName: string }>) => void;
}) {
  const fieldClass = (hasError?: string) =>
    cn(
      "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-base text-ink outline-none transition-all duration-500 placeholder:text-ink-faint focus:border-sun-400 focus:bg-white/[0.05]",
      hasError ? "border-girls-500" : "border-white/10"
    );

  return (
    <ScrollReveal className="space-y-6">
      <div>
        <label htmlFor="teacherName" className="mb-2 block text-sm font-semibold text-ink">
          اسم المعلم أو المعلمة
        </label>
        <input
          id="teacherName"
          type="text"
          value={teacherName}
          onChange={(e) => onChange({ teacherName: e.target.value })}
          placeholder="مثال: نورة السبيعي"
          className={fieldClass(errors.teacherName)}
        />
        {errors.teacherName && <p className="mt-1.5 text-sm text-girls-400">{errors.teacherName}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="name@school.edu.sa"
          className={fieldClass(errors.email)}
        />
        {errors.email && <p className="mt-1.5 text-sm text-girls-400">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="schoolName" className="mb-2 block text-sm font-semibold text-ink">
          اسم المدرسة
        </label>
        <input
          id="schoolName"
          type="text"
          value={schoolName}
          onChange={(e) => onChange({ schoolName: e.target.value })}
          placeholder="مثال: متوسطة الأمير سلطان"
          className={fieldClass(errors.schoolName)}
        />
        {errors.schoolName && <p className="mt-1.5 text-sm text-girls-400">{errors.schoolName}</p>}
      </div>
    </ScrollReveal>
  );
}
