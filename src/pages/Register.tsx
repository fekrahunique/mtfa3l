import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { RegisterBackdrop } from "../components/RegisterBackdrop";
import { WelcomeCinematic } from "../components/WelcomeCinematic";
import { StepProgress } from "../components/StepProgress";
import { StepSchool } from "./register/StepSchool";
import { StepTeacher } from "./register/StepTeacher";
import { StepReview } from "./register/StepReview";
import { emptyRegistration, genderAccent, type RegistrationData } from "../lib/theme";
import { generateUsername } from "../lib/studentFile";
import { getPlan, arDigits, type PlanId } from "../data/plans";
import { cn } from "../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;
const STEP_LABELS = ["المدرسة", "بياناتك", "المراجعة"];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingPlan = (location.state as { plan?: PlanId } | null)?.plan;
  const [step, setStep] = useState(0);
  const [welcoming, setWelcoming] = useState(false);
  const [data, setData] = useState<RegistrationData>(() => ({
    ...emptyRegistration,
    plan: incomingPlan ?? emptyRegistration.plan,
  }));
  const plan = getPlan(data.plan);

  const accent = data.gender ? genderAccent[data.gender] : null;
  const accentBg = accent?.bg ?? "bg-sun-400";

  const teacherErrors = useMemo(() => {
    const errors: { teacherName?: string; email?: string; schoolName?: string } = {};
    if (data.teacherName && data.teacherName.trim().length < 2) {
      errors.teacherName = "اكتب الاسم كاملًا";
    }
    if (data.email && !validateEmail(data.email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
    }
    return errors;
  }, [data.teacherName, data.email]);

  function patch(p: Partial<RegistrationData>) {
    setData((prev) => ({ ...prev, ...p }));
  }

  const canProceed = [
    Boolean(data.schoolType && data.stage && data.gender),
    Boolean(
      data.teacherName.trim().length >= 2 &&
        validateEmail(data.email) &&
        data.schoolName.trim().length >= 2
    ),
    true,
  ][step];

  function goNext() {
    if (step < STEP_LABELS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setWelcoming(true);
    }
  }

  function enterPlatform() {
    const username = generateUsername(data.schoolName);
    navigate("/الأسابيع", { state: { ...data, username } });
  }

  return (
    <div className="relative min-h-screen overflow-x-clip pb-24">
      <RegisterBackdrop step={step} total={STEP_LABELS.length} />
      <AnimatePresence>
        {welcoming && <WelcomeCinematic teacherName={data.teacherName} gender={data.gender} onEnter={enterPlatform} />}
      </AnimatePresence>
      <main id="main-content" className="relative z-10 mx-auto max-w-2xl px-4 pt-28">
        <div className="rounded-3xl border border-white/10 bg-[#1a1526]/50 p-6 shadow-2xl backdrop-blur-2xl sm:p-9">
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-3 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300 backdrop-blur-sm"
          >
            ✨ رحلة تسجيلك تبدأ هنا
          </motion.span>
          <h1 className="text-3xl text-ink sm:text-4xl">سجّل كمعلم أو معلمة نشاط</h1>
          <p className="mt-3 text-ink-muted">ثلاث خطوات بسيطة، وتوصل للوحة التحكم، وتضيف فصولك وطلابك من داخل اللوحة</p>

          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-sun-400/30 bg-sun-400/10 px-4 py-2 text-sm">
            <span className="font-semibold text-sun-300">باقتك: {plan.name}</span>
            <span className="text-ink-muted">· {arDigits(plan.term)}﷼ / الترم</span>
            <Link to="/#plans" className="rounded-full px-2 text-xs font-semibold text-sun-400 hover:underline">غيّر الباقة</Link>
          </div>
        </div>

        <StepProgress steps={STEP_LABELS} current={step} accentClass={accentBg} />

        <div className="relative mt-12 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {step === 0 && (
                <StepSchool
                  schoolType={data.schoolType}
                  stage={data.stage}
                  gender={data.gender}
                  onChange={patch}
                />
              )}
              {step === 1 && (
                <StepTeacher
                  teacherName={data.teacherName}
                  email={data.email}
                  phone={data.phone ?? ""}
                  schoolName={data.schoolName}
                  errors={teacherErrors}
                  onChange={patch}
                />
              )}
              {step === 2 && <StepReview data={data} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step === 0 ? navigate("/") : setStep((s) => s - 1))}
            className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-ink-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/30 hover:text-ink"
          >
            <CaretRight weight="bold" className="h-4 w-4" />
            {step === 0 ? "عودة للرئيسية" : "السابق"}
          </button>

          <button
            type="button"
            disabled={!canProceed}
            onClick={goNext}
            className={cn(
              "flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              canProceed ? cn(accentBg, "hover:scale-105 active:scale-95") : "cursor-not-allowed bg-white/10 text-ink-faint"
            )}
          >
            {step === STEP_LABELS.length - 1 ? `ابدأ باقة ${plan.name}` : "التالي"}
            <CaretLeft weight="bold" className="h-4 w-4" />
          </button>
        </div>
        </div>
      </main>
    </div>
  );
}
