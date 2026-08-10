import { backToSchoolSeason, BTS } from "../lib/backToSchool";

/**
 * شريط موسمي «العودة للدراسة» بالهوية الرسمية — يظهر أول أسبوعين ثم يختفي
 * تلقائيًا. يُحقن بصريًا دون المساس بهوية المنصة. `variant` للتحكم بالحجم.
 */
export function BackToSchoolRibbon({ className = "" }: { className?: string }) {
  if (!backToSchoolSeason()) return null;
  return (
    <div
      className={`flex items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-2.5 ${className}`}
      style={{ background: `linear-gradient(120deg, ${BTS.purple}, #5a26ad)`, borderColor: `${BTS.green}66` }}
    >
      <span className="flex items-center gap-2.5">
        <BackToSchoolMark className="h-8" />
        <span className="hidden text-sm font-semibold text-white/90 sm:inline">أهلًا بعودتكم — عام دراسي جديد ✨</span>
      </span>
      <span
        className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold"
        style={{ background: BTS.green, color: BTS.purple }}
      >
        موسم العودة للدراسة
      </span>
    </div>
  );
}

/** العلامة اللفظية «العودة للدراسة» بالألوان الرسمية. */
export function BackToSchoolMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-[0.9] font-display ${className}`} style={{ fontSize: "inherit" }}>
      <span className="flex items-baseline gap-1 text-lg font-extrabold">
        <span style={{ color: BTS.green }}>العودة</span>
        <span style={{ color: BTS.sky }}>للدراسة</span>
      </span>
    </span>
  );
}
