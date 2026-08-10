import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretLeft, Clock, TrendUp, Trophy, Sparkle } from "@phosphor-icons/react";
import { ScrollReveal } from "../components/ScrollReveal";
import { planDomains, planOccasions, planExtracurricular, planChanges, type PlanProgram } from "../data/plan1448";
import { emptyRegistration, type RegistrationData } from "../lib/theme";
import { noDot } from "../lib/utils";

const STAGES = [
  { id: "primary" as const, label: "ابتدائي (عليا)", key: "primary" as const },
  { id: "middle" as const, label: "متوسط", key: "middle" as const },
];

function HoursRow({ p, stageKey, accent, accentSoft }: { p: PlanProgram; stageKey: "primary" | "middle"; accent: string; accentSoft: string }) {
  const h = p[stageKey];
  if (h == null) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: `${accent}33`, background: "rgba(255,255,255,0.02)" }}>
      <span className="flex h-9 min-w-[3.2rem] items-center justify-center gap-1 rounded-lg font-display text-lg" style={{ background: `${accent}22`, color: accentSoft }}>
        {h}<span className="text-[10px] font-sans">حصص</span>
      </span>
      <span className="flex-1 text-sm font-semibold text-white">{noDot(p.name)}</span>
      {p.note && <span className="hidden text-[11px] text-white/45 sm:block">{noDot(p.note)}</span>}
    </div>
  );
}

export function Plan1448() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as RegistrationData | null) ?? emptyRegistration;
  const [stage, setStage] = useState<"primary" | "middle">(data.stage === "middle" ? "middle" : "primary");

  const changeItems = [
    { icon: TrendUp, text: planChanges.minShare },
    { icon: Sparkle, text: planChanges.programs },
    { icon: Trophy, text: planChanges.contests },
    { icon: Clock, text: planChanges.extracurricular },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg pb-24">
      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-16">
        <button type="button" onClick={() => navigate("/الأسابيع", { state: data })} className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink">
          <CaretLeft weight="bold" className="h-4 w-4" /> رحلة رائد النشاط
        </button>

        <ScrollReveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-5 py-1.5 text-sm font-semibold text-emerald-300">
            ✦ تحديث وزارة التعليم · الإصدار السادس
          </span>
          <h1 className="mt-5 font-display text-4xl text-ink sm:text-6xl">خطة النشاط الطلابي ١٤٤٨هـ</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">
            ٦٤ برنامجًا في خمسة مجالات + الأيام والمناسبات + الفترات اللاصفية — بعدد الحصص المعتمد لكل نشاط
          </p>
        </ScrollReveal>

        {/* أبرز تغييرات ١٤٤٨ */}
        <ScrollReveal className="mt-8">
          <div className="rounded-[1.5rem] border border-emerald-400/20 p-5" style={{ background: "linear-gradient(150deg, rgba(16,185,129,0.1), rgba(19,18,9,0.9))" }}>
            <p className="mb-3 font-display text-lg text-ink">أبرز ما تغيّر عن ١٤٤٧هـ</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {changeItems.map((c) => (
                <div key={c.text} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <c.icon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{noDot(c.text)}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* مبدّل المرحلة */}
        <div className="mt-8 flex justify-center gap-1.5">
          {STAGES.map((s) => (
            <button key={s.id} type="button" onClick={() => setStage(s.key)} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${stage === s.key ? "bg-sun-400 text-bg" : "border border-white/10 bg-white/[0.04] text-ink-muted hover:text-ink"}`}>{s.label}</button>
          ))}
        </div>

        {/* المجالات الخمسة */}
        <div className="mt-8 space-y-6">
          {planDomains.map((d, i) => {
            const rows = d.programs.filter((p) => p[stage] != null);
            if (rows.length === 0) return null;
            const total = rows.reduce((n, p) => n + (p[stage] ?? 0), 0);
            return (
              <motion.section key={d.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="rounded-[1.5rem] border p-5" style={{ borderColor: `${d.accent}44`, background: `linear-gradient(160deg, ${d.accent}12, rgba(19,18,9,0.6))` }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><span className="text-3xl">{d.emoji}</span> {d.title}</h2>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${d.accent}22`, color: d.accentSoft }}>{rows.length} برامج · {total} حصة</span>
                </div>
                <div className="space-y-2">
                  {rows.map((p) => <HoursRow key={p.name} p={p} stageKey={stage} accent={d.accent} accentSoft={d.accentSoft} />)}
                </div>
              </motion.section>
            );
          })}

          {/* الأيام والمناسبات */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[1.5rem] border p-5" style={{ borderColor: "#16653444", background: "linear-gradient(160deg, #16653412, rgba(19,18,9,0.6))" }}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl text-ink"><span className="text-3xl">💚</span> الأيام والمناسبات</h2>
            <div className="space-y-2">
              {planOccasions.filter((p) => p[stage] != null).map((p) => <HoursRow key={p.name} p={p} stageKey={stage} accent="#166534" accentSoft="#4ade80" />)}
            </div>
          </motion.section>

          {/* الفترات اللاصفية */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[1.5rem] border p-5" style={{ borderColor: "#7c3aed44", background: "linear-gradient(160deg, #7c3aed12, rgba(19,18,9,0.6))" }}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl text-ink"><span className="text-3xl">⏰</span> برامج الفترات اللاصفية</h2>
            <div className="space-y-2">
              {planExtracurricular.filter((p) => p[stage] != null).map((p) => <HoursRow key={p.name} p={p} stageKey={stage} accent="#7c3aed" accentSoft="#a78bfa" />)}
            </div>
          </motion.section>
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">المصدر: دليل الخطط الدراسية للأنشطة الطلابية — الإصدار السادس ١٤٤٨هـ · وزارة التعليم</p>
      </main>
    </div>
  );
}
