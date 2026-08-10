import { ScrollReveal } from "../../components/ScrollReveal";
import { GlassCard } from "../../components/GlassCard";
import type { RegistrationData } from "../../lib/theme";

const schoolTypeLabel: Record<string, string> = {
  government: "حكومية",
  private: "أهلية",
};
const stageLabel: Record<string, string> = {
  primary: "ابتدائي",
  middle: "متوسط",
};
const genderLabel: Record<string, string> = {
  boys: "بنين",
  girls: "بنات",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-3 last:border-none">
      <span className="text-sm text-ink-faint">{label}</span>
      <span className="text-base text-ink">{value}</span>
    </div>
  );
}

export function StepReview({ data }: { data: RegistrationData }) {
  return (
    <ScrollReveal className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink">مراجعة قبل الإرسال</h2>
        <p className="mt-1 text-sm text-ink-faint">تأكد من بياناتك قبل إنشاء حسابك وإضافة قائمة طلابك</p>
      </div>

      <GlassCard>
        <Row label="المعلم أو المعلمة" value={data.teacherName} />
        <Row label="البريد الإلكتروني" value={data.email} />
        <Row label="المدرسة" value={data.schoolName} />
        <Row label="نوع المدرسة" value={schoolTypeLabel[data.schoolType ?? ""] ?? "—"} />
        <Row label="المرحلة" value={stageLabel[data.stage ?? ""] ?? "—"} />
        <Row label="الطلاب" value={genderLabel[data.gender ?? ""] ?? "—"} />
        <Row label="عدد الطلاب المرفوعين" value={String(data.students.length)} />
      </GlassCard>
    </ScrollReveal>
  );
}
