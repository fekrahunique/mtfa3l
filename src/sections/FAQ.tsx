import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { noDot } from "../lib/utils";

const Classroom = lazy(() =>
  import("../components/three/Classroom").then((m) => ({ default: m.Classroom }))
);

const EASE = [0.32, 0.72, 0, 1] as const;

const faqs = [
  {
    q: "هل المنصة مناسبة للمدارس الحكومية والأهلية معًا؟",
    a: "نعم، نشاط موجهة لرواد ورائدات النشاط في المدارس الحكومية والأهلية معًا، وتشتغل بنفس الكفاءة في الحالتين.",
  },
  {
    q: "أي مراحل دراسية تغطي المنصة؟",
    a: "المرحلتان الابتدائية والمتوسطة حاليًا، بمحتوى وتصميم مختلف يناسب كل مرحلة.",
  },
  {
    q: "كيف أضيف طلابي إلى المنصة؟",
    a: "ترفع ملف إكسل أو وورد فيه أسماء طلابك، وتُقرأ القائمة تلقائيًا دون إدخال يدوي، وتظهر لك في لوحة التحكم.",
  },
  {
    q: "هل يوجد فرق بين تجربة البنين والبنات؟",
    a: "نعم، الألوان والرسومات في لوحة التحكم تتغير حسب اختيارك عند التسجيل لتناسب كل فئة.",
  },
  {
    q: "كيف أجرّب المنصة قبل الاشتراك؟",
    a: "تجرّب نشاطًا واحدًا من الأسبوع التمهيدي بلا اشتراك، وبعدها تختار الخطة التي تناسب فصلك.",
  },
  {
    q: "هل الأنشطة تغطي المستهدف الأسبوعي المطلوب من الوزارة؟",
    a: "نعمل حاليًا على إدخال برامج الأنشطة الطلابية المعتمدة داخل المنصة. المحتوى المعروض الآن تجريبي، وسنعلن عند اكتمال الربط بالبرامج الرسمية.",
  },
  {
    q: "هل أحتاج تدريب لاستخدام المنصة؟",
    a: "لا، الأدوات مبسطة والتفاعل بديهي، ويمكنك البدء من أول استخدام بدون تدريب مسبق.",
  },
  {
    q: "ماذا لو واجهت مشكلة أثناء رفع ملف الطلاب؟",
    a: "لوحة التحكم توضح لك أي سطر فيه خطأ قبل اعتماد القائمة، وتقدر تصححه وترفع الملف من جديد.",
  },
];

function immersiveNow() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10 py-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-4 text-right"
      >
        <span className="text-lg text-ink">{q}</span>
        <CaretDown
          weight="bold"
          className={`h-5 w-5 shrink-0 text-ink-faint transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-base leading-relaxed text-ink-muted">{noDot(a)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <ScrollReveal className="text-center">
        <h2 className="text-3xl text-ink sm:text-4xl">الأسئلة الشائعة</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1} className="mt-10">
        {faqs.map((item, i) => (
          <FaqItem
            key={item.q}
            q={item.q}
            a={item.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </ScrollReveal>
    </div>
  );
}

export function FAQ() {
  const [immersive, setImmersive] = useState(immersiveNow);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setImmersive(immersiveNow());
    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  if (!immersive) {
    return (
      <section id="faq">
        <FaqList />
      </section>
    );
  }

  return (
    <section id="faq" ref={trackRef} className="relative h-[420vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Suspense fallback={<div className="h-full w-full bg-[#e6dcc6]" />}>
          <Classroom progress={scrollYProgress} faqs={faqs} className="h-full w-full" />
        </Suspense>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#131209]/85 from-4% via-transparent via-40% to-[#131209]/88" />

        <div className="pointer-events-none absolute inset-x-0 top-28 px-4 text-center">
          <h2 className="text-3xl text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.6)] sm:text-4xl">
            الأسئلة الشائعة
          </h2>
          <p className="mx-auto mt-3 max-w-[680px] text-white/85 [text-shadow:0_1px_14px_rgba(0,0,0,0.6)]">
            كمّل التمرير، والسبورة تجاوب سؤالًا بعد سؤال.
          </p>
        </div>
      </div>

      <div className="sr-only">
        <h3>الأسئلة الشائعة عن منصة نشاط</h3>
        <dl>
          {faqs.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{noDot(item.a)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
