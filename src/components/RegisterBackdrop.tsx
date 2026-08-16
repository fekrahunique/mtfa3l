import { lazy, Suspense } from "react";

/**
 * خلفية التسجيل: مشهد ثلاثي الأبعاد حقيقي (صباح مدرسي، شمس، طيور، فرش خزامى،
 * مبنى «المربّون رواد ورائدات النشاط المتميّزون») يُحمّل كسولًا مع بديل صباحي.
 */

const RegisterScene3D = lazy(() =>
  import("./three/RegisterScene3D").then((m) => ({ default: m.RegisterScene3D }))
);

// بديل صباحي بينما يُحمّل مشهد الثري دي
const MORNING = "linear-gradient(180deg,#1e2a52 0%,#3a3a74 26%,#6f5b93 48%,#b98aa0 66%,#e9b48c 82%,#f6d9a8 100%)";

export function RegisterBackdrop({ step, total }: { step: number; total: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden>
      <Suspense fallback={<div className="h-full w-full" style={{ background: MORNING }} />}>
        <RegisterScene3D step={step} total={total} className="h-full w-full" />
      </Suspense>
      {/* حجاب سفلي ليقرأ المحتوى فوقه */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#131209]/15 via-transparent to-[#131209]/72" />
    </div>
  );
}
