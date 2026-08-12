import { ScrollReveal } from "../components/ScrollReveal";

/** حلقة التشغيل: من التخطيط إلى التقرير — يعرّف المنصة كنظام تشغيل لا مكتبة محتوى. */
const STEPS = [
  { emoji: "📅", title: "يخطّط لك", feature: "المخطّط الذكي يقترح خطة شهرك" },
  { emoji: "📚", title: "يعطيك النشاط", feature: "١١٠+ مسابقة ونشاط جاهز" },
  { emoji: "🖥️", title: "يشغّل التجربة", feature: "عرض تفاعلي على الشاشة" },
  { emoji: "🏆", title: "يدير المنافسة", feature: "الألعاب الكبرى والنقاط" },
  { emoji: "📊", title: "يسجّل النتائج", feature: "قياس أثر كل نشاط" },
  { emoji: "📸", title: "يوثّق التنفيذ", feature: "أرشيف أنشطتك كاملًا" },
  { emoji: "📄", title: "يُخرج تقريرك", feature: "ملف إنجاز PDF جاهز" },
] as const;

const AR = ["١", "٢", "٣", "٤", "٥", "٦", "٧"];

export function OperatingLoop() {
  return (
    <section id="loop" className="relative scroll-mt-20 bg-bg px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="text-center">
          <span className="text-sm font-semibold tracking-[0.2em] text-sun-300">كيف تعمل</span>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl text-ink sm:text-4xl">نظام تشغيل كامل، لا مجرّد مكتبة محتوى</h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">
            من التخطيط إلى التقرير — حلقة واحدة تديرها المنصة معك، فلا تبدأ من الصفر ولا تنتهي بلا أثر
          </p>
        </ScrollReveal>

        <div className="relative mt-14 grid gap-x-3 gap-y-8 sm:grid-cols-7">
          {/* خط الوصل (سطح المكتب) */}
          <div className="pointer-events-none absolute inset-x-[7%] top-7 hidden h-px bg-gradient-to-l from-transparent via-sun-400/30 to-transparent sm:block" />
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.05} className="relative flex items-center gap-4 text-right sm:block sm:text-center">
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-sun-400/30 bg-bg-raised text-2xl transition-transform duration-300 hover:-translate-y-1 hover:border-sun-400 sm:mx-auto">
                  {s.emoji}
                </div>
                <span className="absolute -top-1.5 right-0 rounded-md bg-bg px-1 font-display text-xs text-sun-300 sm:right-auto sm:left-[calc(50%+16px)]">{AR[i]}</span>
              </div>
              <div className="sm:mt-3">
                <h3 className="font-display text-base text-ink">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">{s.feature}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
