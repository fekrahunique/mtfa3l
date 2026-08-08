import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X, ArrowsOut } from "@phosphor-icons/react";

const EASE = [0.32, 0.72, 0, 1] as const;

/** هوية اليوم الوطني كما في ملف الوزارة. */
export const ND = {
  deep: "#0B3B2E",
  mid: "#12513C",
  green: "#1E9E63",
  leaf: "#2FBF78",
  cream: "#F4F1E8",
  gold: "#E8C05A",
  sand: "#C9A227",
};

/** نقش هندسي مستوحى من هوية الملف، مرسوم كنمط متكرر بلا تدرجات. */
export function SaduPattern({ className, opacity = 0.14 }: { className?: string; opacity?: number }) {
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern id="sadu" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="none" />
          <path d="M32 4 L44 16 L32 28 L20 16 Z" fill={ND.green} opacity={opacity} />
          <path d="M0 36 L12 48 L0 60 Z" fill={ND.leaf} opacity={opacity * 0.8} />
          <path d="M64 36 L52 48 L64 60 Z" fill={ND.leaf} opacity={opacity * 0.8} />
          <rect x="28" y="40" width="8" height="8" fill={ND.gold} opacity={opacity * 0.9} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sadu)" />
    </svg>
  );
}

/** شريط المعينات الأخضر الذي يفصل الأقسام في الملف الأصلي. */
export function DiamondRule({ className }: { className?: string }) {
  return (
    <svg className={className} height="14" aria-hidden="true">
      <defs>
        <pattern id="diamonds" width="22" height="14" patternUnits="userSpaceOnUse">
          <path d="M11 1 L20 7 L11 13 L2 7 Z" fill={ND.leaf} />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill="url(#diamonds)" />
    </svg>
  );
}

export function ActivityShell({
  title,
  subtitle,
  onExit,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onExit: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onExit]);

  async function goFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // بعض المتصفحات ترفض بلا تفاعل مباشر — نتجاهل بهدوء
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden"
      style={{ backgroundColor: ND.deep }}
    >
      <SaduPattern className="pointer-events-none absolute inset-0 h-full w-full" />

      <header className="relative z-10 flex items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
        <div>
          <h2 className="font-display text-2xl leading-tight sm:text-4xl" style={{ color: ND.cream }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base" style={{ color: ND.leaf }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={goFullscreen}
            aria-label="ملء الشاشة"
            className="hidden h-10 w-10 items-center justify-center rounded-full border transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 sm:flex"
            style={{ borderColor: `${ND.cream}33`, color: ND.cream }}
          >
            <ArrowsOut weight="bold" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onExit}
            aria-label="إنهاء النشاط"
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
            style={{ borderColor: `${ND.cream}33`, color: ND.cream }}
          >
            <X weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <DiamondRule className="relative z-10 mt-4 w-full opacity-70" />

      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8">{children}</main>

      {footer && (
        <footer className="relative z-10 border-t px-5 py-4 sm:px-8" style={{ borderColor: `${ND.cream}1a` }}>
          {footer}
        </footer>
      )}
    </motion.div>
  );
}

/** انفجار احتفالي خفيف بلا مكتبات خارجية. */
export function Celebration({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  const colors = [ND.leaf, ND.gold, ND.cream, ND.green];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const distance = 180 + ((i * 37) % 220);
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 block h-3 w-3 rounded-sm"
            style={{ backgroundColor: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 120,
              opacity: 0,
              rotate: (i % 2 ? 1 : -1) * 320,
            }}
            transition={{ duration: 1.6 + (i % 5) * 0.15, ease: EASE }}
          />
        );
      })}
    </div>
  );
}
