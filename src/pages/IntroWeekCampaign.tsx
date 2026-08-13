import { Link, useNavigate } from "react-router-dom";
import { ScrollReveal } from "../components/ScrollReveal";
import { CaretLeft, CheckCircle, Megaphone, Clock, FileText, Camera } from "@phosphor-icons/react";
import { daysUntilStart, INTRO_PLAN, MANDATE_LINKS } from "../data/introCampaign";

const arN = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export function IntroWeekCampaign() {
  const navigate = useNavigate();
  const days = daysUntilStart();
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* هيرو */}
      <header className="relative overflow-hidden px-4 pt-16 pb-12" style={{ background: "linear-gradient(180deg, rgba(245,183,60,.1), transparent)" }}>
        <div className="mx-auto max-w-3xl text-center">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-400/15 px-4 py-1.5 text-sm font-bold text-sun-300"><Megaphone weight="fill" className="h-4 w-4" /> تعميم تعليم مكة · الأسبوع التمهيدي ١٤٤٨</span>
            {days > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-4 py-1.5 text-sm font-bold text-red-300">⏳ الدراسة تبدأ بعد {arN(days)} يومًا</span>}
          </div>
          <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">أسبوعك التمهيدي جاهز، يوم بيوم</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">
            «نشاط» تُنفّذ خطة التعميم الزمنية للأيام الخمسة: عروض جاذبة، أركان وألعاب جاهزة، استمارة ملاحظة تُطبع، وملف توثيق جاهز للرفع
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/تسجيل" className="flex items-center gap-2 rounded-full bg-sun-400 px-7 py-3.5 text-base font-bold text-bg transition-transform hover:scale-105 active:scale-95">جرّب مجانًا <CaretLeft weight="bold" className="h-4 w-4" /></Link>
            <Link to="/الأسبوع-التمهيدي" className="rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-white/40">شاهد الشاشات الحيّة</Link>
          </div>
          <p className="mt-4 text-xs text-ink-faint">📎 رابط جاهز ترسله لمدرستك ومجموعات المديرين</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* وش يطلب التعميم */}
        <ScrollReveal className="mt-10">
          <h2 className="font-display text-2xl">ماذا يطلب التعميم؟</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {MANDATE_LINKS.map((m) => (
              <div key={m.point} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-ink">{m.point}</div>
            ))}
          </div>
        </ScrollReveal>

        {/* الخطة الزمنية ٥ أيام */}
        <ScrollReveal className="mt-12">
          <h2 className="font-display text-2xl">الخطة الزمنية · خمسة أيام</h2>
          <p className="mt-1 text-sm text-ink-muted">كما وردت في التعميم — والمنصة تُشغّلها معك</p>
          <div className="mt-5 space-y-3">
            {INTRO_PLAN.map((d, i) => (
              <div key={d.day} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-400/15 font-display text-lg text-sun-300">{arN(i + 1)}</span>
                  <h3 className="font-display text-lg">{d.day}</h3>
                  <span className="flex items-center gap-1 text-sm text-ink-muted"><Clock weight="bold" className="h-4 w-4" /> {d.time}</span>
                  {d.corners && <span className="mr-auto rounded-full bg-white/10 px-3 py-0.5 text-xs text-ink-muted">أركان: {d.corners}</span>}
                </div>
                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {d.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-ink-muted"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-400" /> {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* كيف يجهّزها نشاط */}
        <ScrollReveal className="mt-12">
          <h2 className="font-display text-2xl">كيف تجهّزها «نشاط»؟</h2>
          <div className="mt-4 space-y-2">
            {MANDATE_LINKS.map((m) => (
              <div key={m.point} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <CheckCircle weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm"><span className="font-semibold text-ink">{m.point}</span><br /><span className="text-ink-muted">{m.feature}</span></p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* التوثيق */}
        <ScrollReveal className="mt-12">
          <div className="rounded-2xl border border-sun-400/25 bg-sun-400/[0.06] p-5">
            <div className="flex items-center gap-2"><FileText weight="fill" className="h-5 w-5 text-sun-300" /><h2 className="font-display text-xl">التوثيق جاهز للرفع</h2></div>
            <p className="mt-2 text-sm text-ink-muted">
              التعميم يطلب توثيق الأعمال بالشواهد والصور. المنصة توثّق أنشطتك يومًا بيوم، وتُخرج <b className="text-ink">ملف إنجاز PDF</b> مرتّبًا، مع <b className="text-ink">استمارة ملاحظة يومية</b> لكل طالب تُطبع.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-faint"><Camera weight="bold" className="h-4 w-4" /> الصور تُرفق يدويًا حاليًا (وقريبًا رفع مباشر عبر التخزين السحابي)</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/سجل-النشاط" className="rounded-full bg-sun-400 px-5 py-2.5 text-sm font-bold text-bg">سجل وأثر النشاط</Link>
              <Link to="/بطاقة-الملاحظة" className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-ink hover:border-white/40">استمارة الملاحظة اليومية</Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-12 text-center">
          <h2 className="font-display text-2xl">جهّز أسبوعك التمهيدي اليوم</h2>
          <p className="mt-2 text-ink-muted">قبل ما تبدأ الدراسة، خلّ استقبال طلابك تجربة يتذكّرونها</p>
          <Link to="/تسجيل" className="mt-5 inline-flex items-center gap-2 rounded-full bg-sun-400 px-8 py-3.5 font-bold text-bg transition-transform hover:scale-105">ابدأ الآن <CaretLeft weight="bold" className="h-4 w-4" /></Link>
          <p className="mt-6 text-xs text-ink-faint">جاهزة لتنفيذ متطلبات التعميم · «نشاط» أداة تساعد الرائد، ولسنا جهة اعتماد رسمية</p>
        </ScrollReveal>
      </main>
    </div>
  );
}
