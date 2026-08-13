import { Link } from "react-router-dom";
import { ScrollReveal } from "../components/ScrollReveal";
import { CaretLeft, CheckCircle, Megaphone } from "@phosphor-icons/react";
import { daysUntilStart, MANDATE_LINKS } from "../data/introCampaign";

const arN = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** قسم حملة الأسبوع التمهيدي على الصفحة الرئيسية — يربط تعميم المدارس بجاهزية المنصة. */
export function IntroWeekBanner() {
  const days = daysUntilStart();
  return (
    <section id="intro-week" className="relative scroll-mt-20 bg-bg px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="overflow-hidden rounded-[1.75rem] border p-6 sm:p-8" style={{ borderColor: "rgba(245,183,60,.3)", background: "linear-gradient(150deg, rgba(245,183,60,.1), rgba(19,18,9,0.9))" }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-400/15 px-3 py-1 text-xs font-bold text-sun-300"><Megaphone weight="fill" className="h-3.5 w-3.5" /> تعميم الأسبوع التمهيدي ١٤٤٨</span>
              {days > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">⏳ الدراسة تبدأ بعد {arN(days)} يومًا</span>}
            </div>

            <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">جاهز للأسبوع التمهيدي ١٤٤٨</h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              التعميم يُلزم مدرستك ببيئة جاذبة وبرنامج خمسة أيام وتوثيق بالشواهد — و«نشاط» يجهّزه لك كاملًا، فلا تبدأ من الصفر
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {MANDATE_LINKS.slice(0, 4).map((m) => (
                <div key={m.point} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <p className="text-sm text-ink"><span className="text-ink-muted">{m.point}:</span> {m.feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/الأسبوع-التمهيدي-١٤٤٨" className="flex items-center gap-2 rounded-full bg-sun-400 px-6 py-3 font-bold text-bg transition-transform hover:scale-105 active:scale-95">
                افتح صفحة الحملة <CaretLeft weight="bold" className="h-4 w-4" />
              </Link>
              <Link to="/تسجيل" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-ink transition-colors hover:border-white/40">جهّز أسبوعك التمهيدي</Link>
            </div>
            <p className="mt-4 text-xs text-ink-faint">جاهزة لتنفيذ متطلبات التعميم · لسنا جهة اعتماد رسمية</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
