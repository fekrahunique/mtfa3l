import { lazy, Suspense } from "react";

const SunScene = lazy(() => import("./SunScene").then((m) => ({ default: m.SunScene })));

function SunFallback({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="mx-auto h-40 w-40 rounded-full bg-sun-400/40 blur-2xl" />
    </div>
  );
}

export function LazySunScene({ className }: { className?: string }) {
  return (
    <Suspense fallback={<SunFallback className={className} />}>
      <SunScene className={className} />
    </Suspense>
  );
}
