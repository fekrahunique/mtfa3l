import { motion } from "framer-motion";

/** هالات لونية ناعمة وإيماءات مدرسية تطفو — تبثّ الحياة في الصفحات الداكنة. */
const BLOBS = [
  { color: "#ff9d3d", left: "-8%", top: "-6%", size: 440, dur: 19 },
  { color: "#2bab9f", left: "68%", top: "6%", size: 400, dur: 23 },
  { color: "#ea5a8c", left: "12%", top: "64%", size: 480, dur: 21 },
  { color: "#1E9E63", left: "72%", top: "70%", size: 380, dur: 25 },
];

const MOTIFS = ["✏️", "🎒", "⭐", "🎉", "📚", "🖍️", "🎨", "🧩"];

export function LivelyBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color}4d, transparent 70%)`,
            filter: "blur(36px)",
          }}
          animate={{ x: [0, 34, -22, 0], y: [0, -28, 16, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {MOTIFS.map((m, i) => (
        <motion.span
          key={m}
          className="absolute text-3xl opacity-[0.18] sm:text-4xl"
          style={{ left: `${(i * 13 + 7) % 90}%`, top: `${(i * 19 + 12) % 82}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 9, -9, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          {m}
        </motion.span>
      ))}
    </div>
  );
}
