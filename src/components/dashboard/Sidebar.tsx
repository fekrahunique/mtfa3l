import { useState } from "react";
import { Link } from "react-router-dom";
import {
  House,
  Confetti,
  Wrench,
  UsersThree,
  Trophy,
  List,
  X,
} from "@phosphor-icons/react";
import { FacelessAvatar } from "../illustrations/FacelessAvatar";
import type { Gender } from "../../lib/theme";
import { cn } from "../../lib/utils";

/** كل بند يمرّر إلى قسم حقيقي في الصفحة عبر معرّفه. */
const navItems = [
  { icon: House, label: "الرئيسية", target: "main-content" },
  { icon: Confetti, label: "الأنشطة", target: "activities" },
  { icon: Wrench, label: "الأدوات", target: "tools" },
  { icon: UsersThree, label: "الطلاب", target: "students" },
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

  function goTo(i: number, target: string) {
    setActive(i);
    setMobileOpen(false);
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const content = (
    <>
      <div className="flex items-center gap-3 px-2">
        <FacelessAvatar gender={gender} className="h-11 w-11" />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-sun-300">{gender === "boys" ? "مربّي الأجيال" : "مربية الأجيال"}</p>
          <p className="truncate text-sm font-semibold text-ink">{teacherName || "معلم النشاط"}</p>
          <p className="truncate text-xs text-ink-faint">{schoolName || "نشاط"}</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => goTo(i, item.target)}
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

        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            const el = document.getElementById("tournament");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="mt-1 flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-sm font-bold text-amber-300 transition-all duration-300 hover:bg-amber-400/20 hover:text-amber-200"
        >
          <Trophy weight="fill" className="h-5 w-5" />
          بطولة نشاط
          <span className="mr-auto rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">جديد</span>
        </button>
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
