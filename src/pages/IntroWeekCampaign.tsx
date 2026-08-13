import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "../components/ScrollReveal";
import { CaretLeft, CheckCircle, Clock, FileText, Camera, Confetti } from "@phosphor-icons/react";
import { daysUntilStart, INTRO_PLAN, MANDATE_LINKS } from "../data/introCampaign";

const arN = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** ألوان أيام مبهجة لاستقبال الطلاب (دفء وحيوية). */
const DAY = [
  { c: "#f59e0b", soft: "#fbbf24", emoji: "👋" },
  { c: "#fb7185", soft: "#fda4af", emoji: "🎨" },
  { c: "#2dd4bf", soft: "#5eead4", emoji: "🎭" },
  { c: "#a78bfa", soft: "#c4b5fd", emoji: "✍️" },
  { c: "#34d399", soft: "#6ee7b7", emoji: "🎉" },
];

export function IntroWeekCampaign() {
  const navigate = useNavigate();
  const days = daysUntilStart();
  const floaties = ["🎒", "📚", "✏️", "🎨", "⭐", "🎈", "🧸", "🎉"];

  return (
    <div className="min-h-screen bg-[#1a1206] text-white">
      {/* ——— هيرو احتفالي دافئ ——— */}
      <header className="relative overflow-hidden px-4 pt-14 pb-16">
        {/* توهّجات دافئة */}
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(251,113,133,.35), transparent 65%)" }} />
        <div className="pointer-events-none absolute -top-16 left-[-8%] h-96 w-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(245,183,60,.4), transparent 65%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(45,212,191,.22), transparent 65%)" }} />

        {/* رموز عائمة مرحة */}
        <div className="pointer-events-none absolute inset-0">
          {floaties.map((e, i) => (
            <motion.span key={i} className="absolute text-3xl opacity-70 sm:text-4xl"
              style={{ left: `${[6, 88, 16, 78, 40, 92, 10, 66][i]}%`, top: `${[18, 22, 66, 60, 12, 74, 84, 84][i]}%` }}
              animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 4 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
              {e}
            </motion.span>
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-white/70 hover:text-white"><CaretLeft weight="bold" className="h-4 w-4" /> رجوع</button>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-amber-200 backdrop-blur-md">📢 تعميم تعليم مكة · الأسبوع التمهيدي ١٤٤٨</span>
            {days > 0 && (
              <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-black text-white shadow-lg" style={{ background: "linear-gradient(90deg,#fb7185,#f59e0b)" }}>
                ⏳ باقٍ {arN(days)} يومًا على الدوام
              </motion.span>
            )}
          </div>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="mt-6 font-display text-4xl leading-[1.15] sm:text-6xl">
            استقبالٌ يفرح
            <br />
            <span style={{ background: "linear-gradient(90deg,#fbbf24,#fb7185,#2dd4bf)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>أبطالنا الصغار</span> 🎈
          </motion.h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            أول أسبوع مدرسي لا يُنسى: عروض مبهجة، أركان وألعاب، وترحيب يخلّي طفلك يحب مدرسته من أول يوم — و«نشاط» تجهّزه لك يوم بيوم
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/تسجيل" className="flex items-center gap-2 rounded-full px-8 py-4 text-lg font-black text-[#3a1d00] shadow-xl transition-transform hover:scale-105 active:scale-95" style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }}>
              جرّبها مجانًا <CaretLeft weight="bold" className="h-5 w-5" />
            </Link>
            <Link to="/الأسبوع-التمهيدي" className="rounded-full border-2 border-white/25 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-md transition-colors hover:border-white/50">شاهد الشاشات الحيّة</Link>
          </div>
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/70">📎 رابط جاهز ترسله لمدرستك ومجموعات المديرين</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* الخطة الزمنية ٥ أيام — بطاقات ملوّنة مبهجة */}
        <ScrollReveal className="mt-4">
          <h2 className="text-center font-display text-3xl sm:text-4xl">خمسة أيام مليانة فرح 🎊</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-white/70">الخطة الزمنية كما وردت في التعميم، والمنصة تُشغّلها معك بروح محمّسة</p>
          <div className="mt-8 space-y-4">
            {INTRO_PLAN.map((d, i) => {
              const t = DAY[i];
              return (
                <motion.div key={d.day} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="overflow-hidden rounded-[1.5rem] border-2 p-5" style={{ borderColor: `${t.c}66`, background: `linear-gradient(135deg, ${t.c}26, rgba(26,18,6,0.6))` }}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${t.soft}, ${t.c})` }}>{arN(i + 1)}</span>
                    <div>
                      <h3 className="font-display text-xl text-white">{d.day} <span className="text-2xl">{t.emoji}</span></h3>
                      <span className="flex items-center gap-1 text-sm text-white/70"><Clock weight="bold" className="h-4 w-4" /> {d.time}</span>
                    </div>
                    {d.corners && <span className="mr-auto rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: `${t.c}` }}>🎪 أركان: {d.corners}</span>}
                  </div>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {d.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-sm text-white/90">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: t.soft }} /> {it}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* كيف تجهّزها نشاط */}
        <ScrollReveal className="mt-14">
          <h2 className="text-center font-display text-3xl">التعميم يطلب، و«نشاط» جاهزة ✅</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {MANDATE_LINKS.map((m) => (
              <div key={m.point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle weight="fill" className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
                <p className="text-sm"><span className="font-bold text-white">{m.point}</span><br /><span className="text-white/70">{m.feature}</span></p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* التوثيق */}
        <ScrollReveal className="mt-14">
          <div className="rounded-[1.5rem] border-2 p-6" style={{ borderColor: "rgba(45,212,191,.4)", background: "linear-gradient(135deg, rgba(45,212,191,.16), rgba(26,18,6,0.6))" }}>
            <div className="flex items-center gap-2"><FileText weight="fill" className="h-6 w-6 text-teal-300" /><h2 className="font-display text-2xl">التوثيق جاهز للرفع 📄</h2></div>
            <p className="mt-2 text-white/85">
              التعميم يطلب توثيق الأعمال بالشواهد والصور. المنصة توثّق أنشطتك يومًا بيوم وتُخرج <b className="text-white">ملف إنجاز PDF</b> مرتّبًا، مع <b className="text-white">استمارة ملاحظة يومية</b> لكل طالب تُطبع.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/55"><Camera weight="bold" className="h-4 w-4" /> الصور تُرفق يدويًا حاليًا (وقريبًا رفع مباشر عبر التخزين السحابي)</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/سجل-النشاط" className="rounded-full bg-teal-400 px-5 py-2.5 text-sm font-bold text-[#062522]">سجل وأثر النشاط</Link>
              <Link to="/بطاقة-الملاحظة" className="rounded-full border-2 border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:border-white/40">استمارة الملاحظة اليومية</Link>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA ختامي احتفالي */}
        <ScrollReveal className="mt-16 text-center">
          <Confetti weight="fill" className="mx-auto h-10 w-10 text-amber-300" />
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">جهّز أسبوعك التمهيدي اليوم</h2>
          <p className="mt-2 text-white/75">قبل ما تبدأ الدراسة، خلّ استقبال طلابك ذكرى يحبونها</p>
          <Link to="/تسجيل" className="mt-6 inline-flex items-center gap-2 rounded-full px-9 py-4 text-lg font-black text-[#3a1d00] shadow-xl transition-transform hover:scale-105" style={{ background: "linear-gradient(90deg,#fbbf24,#fb7185)" }}>
            ابدأ الآن <CaretLeft weight="bold" className="h-5 w-5" />
          </Link>
          <p className="mt-6 text-xs text-white/45">جاهزة لتنفيذ متطلبات التعميم · «نشاط» أداة تساعد الرائد، ولسنا جهة اعتماد رسمية</p>
        </ScrollReveal>
      </main>
    </div>
  );
}
