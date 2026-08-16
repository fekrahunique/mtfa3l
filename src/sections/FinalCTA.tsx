import { Link } from "react-router-dom";
import { CaretLeft } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";

export function FinalCTA() {
  return (
    <section className="px-4 py-24">
      <ScrollReveal className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-16 text-center backdrop-blur-xl">
        <h2 className="mx-auto max-w-[680px] text-3xl text-ink sm:text-4xl">
          جاهز تخطّط أنشطة أسبوعك في دقائق؟
        </h2>
        <p className="mx-auto mt-4 max-w-[680px] text-lg text-ink-muted">
          سجّل الآن وجرّب نشاطًا من الأسبوع التمهيدي، ثم اختر خطتك وانطلق برحلة مدرستك مع نشاط
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/تسجيل"
            className="group flex items-center gap-2 rounded-full bg-sun-400 px-6 py-3 text-base font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 hover:bg-sun-300 active:scale-95"
          >
            ابدأ التسجيل
            <CaretLeft weight="bold" className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
