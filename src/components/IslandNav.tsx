import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const EASE = [0.32, 0.72, 0, 1] as const;

const links = [
  { label: "المزايا", href: "/#benefits" },
  { label: "كيف تعمل", href: "/#how-it-works" },
  { label: "الباقات", href: "/#pricing" },
  { label: "الأسئلة الشائعة", href: "/#faq" },
];

export function IslandNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <div className="fixed inset-x-0 top-6 z-50 mx-auto w-max">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <Link to="/" className="flex items-center gap-2 rounded-full px-3 py-1.5">
            <span className="font-display text-lg text-ink">نشاط</span>
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-muted transition-colors duration-500 hover:bg-white/10 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Link
            to="/تسجيل"
            aria-current={location.pathname === "/تسجيل" ? "page" : undefined}
            className="hidden rounded-full bg-sun-400 px-4 py-2 text-sm font-semibold text-bg transition-transform duration-500 hover:scale-105 sm:block"
          >
            ابدأ التسجيل
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 sm:hidden"
          >
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-0.5 w-4 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/80 backdrop-blur-3xl sm:hidden"
          >
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                initial={{ y: 48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: EASE }}
                className="font-display text-3xl text-ink"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 + links.length * 0.08, ease: EASE }}
            >
              <Link
                to="/تسجيل"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-sun-400 px-6 py-3 font-semibold text-bg"
              >
                ابدأ التسجيل
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
