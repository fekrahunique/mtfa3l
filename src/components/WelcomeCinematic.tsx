import { useEffect } from "react";
import { motion } from "framer-motion";

/**
 * ترحيب سينمائي راقٍ يظهر لحظة اكتمال التسجيل — بأسلوب احترافي يليق بالمربّين:
 * «منصة نشاط ترحّب بمربّي الأجيال — مرحبًا ألف»، بلا رموز طائرة.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function WelcomeCinematic({ teacherName, onEnter }: { teacherName?: string; onEnter: () => void }) {
  useEffect(() => {
    const t = setTimeout(onEnter, 5200);
    return () => clearTimeout(t);
  }, [onEnter]);

  const name = teacherName?.trim();

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ background: "radial-gradient(120% 120% at 50% 30%, #2b2350 0%, #1a1226 55%, #0d0a16 100%)" }}
    >
      {/* توهّج مركزي هادئ */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(244,182,58,0.32), transparent 64%)" }}
        animate={{ scale: [0.85, 1.08, 1], opacity: [0, 0.9, 0.8] }}
        transition={{ duration: 2.2, ease: EASE }}
      />

      <div className="relative z-10 text-center">
        {/* شعار ذهبي أنيق بدل الرموز */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.15 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-sun-400/40"
          style={{ boxShadow: "0 0 50px rgba(244,182,58,0.4)", background: "radial-gradient(circle, rgba(244,182,58,0.14), transparent 70%)" }}
        >
          {/* حلقة نبضة ناعمة */}
          <motion.span
            className="absolute h-24 w-24 rounded-full border border-sun-400/30"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
          <span className="font-display text-3xl text-sun-300">نشاط</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="font-display text-2xl text-white/90 sm:text-3xl"
        >
          منصة نشاط ترحّب بمربّي الأجيال
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          className="mt-4 bg-gradient-to-l from-sun-300 to-amber-200 bg-clip-text font-display text-5xl text-transparent sm:text-7xl"
        >
          مرحبًا ألف
        </motion.p>

        {/* خط ذهبي يتمدّد */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.2, ease: EASE }}
          className="mx-auto mt-6 h-px w-40 origin-center bg-gradient-to-r from-transparent via-sun-400/70 to-transparent"
        />

        {name && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="mt-6 text-lg text-white/75"
          >
            أهلًا بك، {name}
          </motion.p>
        )}

        <motion.button
          type="button"
          onClick={onEnter}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.9, ease: EASE }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="mt-10 rounded-full bg-sun-400 px-8 py-3.5 font-bold text-[#1a1204] shadow-[0_0_30px_rgba(244,182,58,0.45)]"
        >
          ادخل إلى منصتك
        </motion.button>
      </div>
    </motion.div>
  );
}
