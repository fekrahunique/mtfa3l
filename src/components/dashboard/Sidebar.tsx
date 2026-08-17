import { useState } from "react";
import { Link } from "react-router-dom";
import {
  House,
  Confetti,
  Wrench,
  UsersThree,
  List,
  X,
  CloudCheck,
  CloudArrowUp,
  SignOut,
  CircleNotch,
} from "@phosphor-icons/react";
import { FacelessAvatar } from "../illustrations/FacelessAvatar";
import type { Gender } from "../../lib/theme";
import { cn } from "../../lib/utils";
import { useAuth, signOut } from "../../lib/authStore";
import { syncNow } from "../../lib/cloudSync";
import { AuthModal, type SyncResult } from "../AuthModal";

/** صندوق الحساب والمزامنة السحابية أسفل الشريط الجانبي. */
function AccountBox() {
  const { session } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "syncing" | "done">("idle");

  function onDone(result: SyncResult) {
    setAuthOpen(false);
    if (result === "pulled") window.location.reload();
  }

  async function manualSync() {
    setStatus("syncing");
    await syncNow();
    setStatus("done");
    setTimeout(() => setStatus("idle"), 2500);
  }

  if (!session) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="flex items-center gap-3 rounded-xl border border-sun-400/30 bg-sun-400/10 px-3 py-2.5 text-sm font-semibold text-sun-300 transition-colors duration-300 hover:bg-sun-400/15"
        >
          <CloudArrowUp weight="duotone" className="h-5 w-5" />
          فعّل المزامنة السحابية
        </button>
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onDone={onDone}
          title="فعّل المزامنة"
          subtitle="سجّل بالبريد لحفظ فصولك وبياناتك سحابيًا ومزامنتها عبر أجهزتك"
        />
      </>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] text-emerald-300">
        <CloudCheck weight="fill" className="h-4 w-4" />
        <span className="truncate" dir="ltr">{session.user.email}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={manualSync}
          disabled={status === "syncing"}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-white/10 hover:text-ink"
        >
          {status === "syncing" ? (
            <CircleNotch weight="bold" className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CloudArrowUp weight="bold" className="h-3.5 w-3.5" />
          )}
          {status === "done" ? "تمّت المزامنة" : status === "syncing" ? "جارٍ" : "مزامنة الآن"}
        </button>
        <button
          type="button"
          onClick={() => signOut()}
          aria-label="تسجيل الخروج"
          className="flex items-center justify-center rounded-lg bg-white/5 px-2 py-1.5 text-ink-faint transition-colors hover:bg-white/10 hover:text-ink"
        >
          <SignOut weight="bold" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

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
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <AccountBox />
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-faint transition-colors duration-300 hover:text-ink"
        >
          خروج
        </Link>
      </div>
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
