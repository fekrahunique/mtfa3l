import { Link } from "react-router-dom";
import { CaretLeft } from "@phosphor-icons/react";
import { IslandNav } from "../components/IslandNav";
import { LazySunScene } from "../components/LazySunScene";

export function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <IslandNav />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60">
        <LazySunScene className="mx-auto h-full max-w-lg" />
      </div>
      <div className="relative">
        <p className="font-display text-7xl text-sun-400">٤٠٤</p>
        <h1 className="mt-4 text-3xl text-ink">هذه الصفحة ما وصلتها الشمس بعد</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          الرابط اللي فتحته مو موجود. ارجع للرئيسية وكمّل رحلتك من هناك.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-sun-400 px-6 py-3 text-base font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
        >
          العودة للرئيسية
          <CaretLeft weight="bold" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
