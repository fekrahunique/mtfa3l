import { useEffect, useRef, useState } from "react";

/**
 * يراقب ظهور عنصر في الشاشة عبر IntersectionObserver.
 * يُستخدم لإيقاف حلقة رسم مشاهد الـ3D حين تخرج عن الشاشة حفاظًا على الأداء.
 */
export function useInView<T extends HTMLElement>(rootMargin = "150px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
