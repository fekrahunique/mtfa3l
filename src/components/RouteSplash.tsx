import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * فاصل انتقالي يعرض شعار المنصة «نشاط» عند كل تنقّل بين الصفحات،
 * ويغطّي لحظة تحميل الصفحة الكسولة ثم يتلاشى كاشفًا المحتوى.
 */
export function RouteSplash() {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    // لا فاصل عند أول تحميل للصفحة.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), 720);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="route-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
          aria-hidden="true"
        >
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center gap-3"
          >
            <span className="font-display text-6xl text-ink sm:text-7xl">نشاط</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
              className="h-1 w-24 origin-center rounded-full bg-sun-400"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
