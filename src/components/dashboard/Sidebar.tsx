import { useState } from "react";
import { Link } from "react-router-dom";
import {
  House,
  Confetti,
  UsersThree,
  Wrench,
  List,
  X,
} from "@phosphor-icons/react";
import { FacelessAvatar } from "../illustrations/FacelessAvatar";
import type { Gender } from "../../lib/theme";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: House, label: "الرئيسية" },
  { icon: Confetti, label: "الأنشطة" },
  { icon: UsersThree, label: "الطلاب" },
  { icon: Wrench, label: "الأدوات" },
];

export function Sidebar({
  teacherName,
  schoolName,
  gender,
  accentBg,
}: {
  teacherName: string;
  schoolName: string;
  gender: Gender;
  accentBg: string;
}) {
  const [active, setActive] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <>
      <div className="flex items-center gap-3 px-2">
        <FacelessAvatar gender={gender} className="h-11 w-11" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{teacherName || "معلم النشاط"}</p>
          <p className="truncate text-xs text-ink-faint">{schoolName || "متفاعل"}</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setActive(i);
              setMobileOpen(false);
            }}
            aria-current={active === i ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              active === i ? cn(accentBg, "text-bg") : "text-ink-muted hover:bg-white/5 hover:text-ink"
            )}
          >
            <item.icon weight={active === i ? "fill" : "regular"} className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <Link
        to="/"
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-faint transition-colors duration-300 hover:text-ink"
      >
        خروج
      </Link>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="فتح القائمة"
        className="fixed right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-bg-raised lg:hidden"
      >
        <List weight="bold" className="h-5 w-5 text-ink" />
      </button>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 border-l border-white/10 bg-bg-raised/60 p-5 backdrop-blur-xl lg:flex">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex bg-black/80 backdrop-blur-2xl lg:hidden">
          <div className="flex h-full w-72 flex-col gap-2 bg-bg-raised p-5">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="إغلاق القائمة"
              className="mb-4 flex h-9 w-9 items-center justify-center self-start rounded-full border border-white/10"
            >
              <X weight="bold" className="h-4 w-4 text-ink" />
            </button>
            {content}
          </div>
          <button type="button" aria-label="إغلاق" className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
