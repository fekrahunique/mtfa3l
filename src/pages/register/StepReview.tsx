import { Crown } from "@phosphor-icons/react";
import { ScrollReveal } from "../../components/ScrollReveal";
import { GlassCard } from "../../components/GlassCard";
import type { RegistrationData } from "../../lib/theme";
import { getPlan, arDigits } from "../../data/plans";

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
  const plan = getPlan(data.plan);
  return (
    <ScrollReveal className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink">مراجعة قبل الإرسال</h2>
        <p className="mt-1 text-sm text-ink-faint">تأكد من بياناتك وباقتك قبل البدء</p>
      </div>

      {/* الباقة المختارة */}
      <div className="rounded-2xl border border-sun-400/30 bg-sun-400/[0.07] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-400/20 text-sun-300">
              <Crown weight="duotone" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-ink-faint">الباقة المختارة</p>
              <p className="font-display text-lg text-ink">{plan.name}</p>
            </div>
          </div>
          <div className="text-left">
            <p className="font-display text-2xl text-ink">{arDigits(plan.term)}<span className="text-sm text-ink-muted"> ﷼ / الترم</span></p>
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-ink-muted">
          🚀 جرّب نشاطًا واحدًا من الأسبوع التمهيدي قبل الاشتراك، ثم تُفعّل باقتك التي اخترتها
        </p>
      </div>

      <GlassCard>
        <Row label="المعلم أو المعلمة" value={data.teacherName} />
        <Row label="البريد الإلكتروني" value={data.email} />
        <Row label="المدرسة" value={data.schoolName} />
        <Row label="نوع المدرسة" value={schoolTypeLabel[data.schoolType ?? ""] ?? "، "} />
        <Row label="المرحلة" value={stageLabel[data.stage ?? ""] ?? "، "} />
        <Row label="الطلاب" value={genderLabel[data.gender ?? ""] ?? "، "} />
        <Row label="عدد الطلاب المرفوعين" value={String(data.students.length)} />
      </GlassCard>
    </ScrollReveal>
  );
}
