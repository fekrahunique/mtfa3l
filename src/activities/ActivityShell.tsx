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

/** لوحة ألوان الإطار — افتراضها هوية اليوم الوطني، وتُستبدل بثيم الموضوع. */
export interface ActivityPalette {
  deep: string;
  ink: string;
  accent: string;
  gold?: string;
}

/** نقش هندسي مستوحى من هوية الملف، بلون الموضوع. */
export function SaduPattern({
  className,
  opacity = 0.14,
  color,
  gold,
}: {
  className?: string;
  opacity?: number;
  color?: string;
  gold?: string;
}) {
  const c = color ?? ND.green;
  const g = gold ?? ND.gold;
  const id = `sadu-${c.replace("#", "")}`;
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="none" />
          <path d="M32 4 L44 16 L32 28 L20 16 Z" fill={c} opacity={opacity} />
          <path d="M0 36 L12 48 L0 60 Z" fill={c} opacity={opacity * 0.8} />
          <path d="M64 36 L52 48 L64 60 Z" fill={c} opacity={opacity * 0.8} />
          <rect x="28" y="40" width="8" height="8" fill={g} opacity={opacity * 0.9} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** شريط المعينات الفاصل، بلون الموضوع. */
export function DiamondRule({ className, color }: { className?: string; color?: string }) {
  const c = color ?? ND.leaf;
  const id = `diamonds-${c.replace("#", "")}`;
  return (
    <svg className={className} height="14" aria-hidden="true">
      <defs>
        <pattern id={id} width="22" height="14" patternUnits="userSpaceOnUse">
          <path d="M11 1 L20 7 L11 13 L2 7 Z" fill={c} />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill={`url(#${id})`} />
    </svg>
  );
}

export function ActivityShell({
  title,
  subtitle,
  onExit,
  children,
  footer,
  palette,
}: {
  title: string;
  subtitle?: string;
  onExit: () => void;
  children: ReactNode;
  footer?: ReactNode;
  palette?: ActivityPalette;
}) {
  const p: Required<ActivityPalette> = {
    deep: palette?.deep ?? ND.deep,
    ink: palette?.ink ?? ND.cream,
    accent: palette?.accent ?? ND.leaf,
    gold: palette?.gold ?? ND.gold,
  };
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
      style={{ backgroundColor: p.deep }}
    >
      <SaduPattern className="pointer-events-none absolute inset-0 h-full w-full" color={p.accent} gold={p.gold} />

      <header className="relative z-10 flex items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
        <div>
          <h2 className="font-display text-2xl leading-tight sm:text-4xl" style={{ color: p.ink }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base" style={{ color: p.accent }}>
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
            style={{ borderColor: `${p.ink}33`, color: p.ink }}
          >
            <ArrowsOut weight="bold" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onExit}
            aria-label="إنهاء النشاط"
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95"
            style={{ borderColor: `${p.ink}33`, color: p.ink }}
          >
            <X weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <DiamondRule className="relative z-10 mt-4 w-full opacity-70" color={p.accent} />

      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8">{children}</main>

      {footer && (
        <footer className="relative z-10 border-t px-5 py-4 sm:px-8" style={{ borderColor: `${p.ink}1a` }}>
          {footer}
        </footer>
      )}
    </motion.div>
  );
}

/** انفجار احتفالي خفيف بلا مكتبات خارجية. */
export function Celebration({ show, colors }: { show: boolean; colors?: string[] }) {
  if (!show) return null;
  const pieces = Array.from({ length: 48 }, (_, i) => i);
  const palette = colors ?? [ND.leaf, ND.gold, ND.cream, ND.green];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {/* موجة انفجار مركزية */}
      {[0, 1].map((r) => (
        <motion.span
          key={`ring-${r}`}
          className="absolute left-1/2 top-1/2 block rounded-full border-2"
          style={{ borderColor: palette[r % palette.length], translateX: "-50%", translateY: "-50%" }}
          initial={{ width: 0, height: 0, opacity: 0.7 }}
          animate={{ width: 520, height: 520, opacity: 0 }}
          transition={{ duration: 1 + r * 0.25, ease: EASE, delay: r * 0.12 }}
        />
      ))}
      {/* قصاصات ملوّنة تتطاير */}
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2 + (i % 3) * 0.2;
        const distance = 160 + ((i * 53) % 300);
        const size = 8 + (i % 4) * 3;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 block rounded-sm"
            style={{ width: size, height: size * 0.7, backgroundColor: palette[i % palette.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 160,
              opacity: 0,
              rotate: (i % 2 ? 1 : -1) * (360 + (i % 4) * 120),
              scale: 0.6,
            }}
            transition={{ duration: 1.8 + (i % 6) * 0.14, ease: EASE }}
          />
        );
      })}
    </div>
  );
}
