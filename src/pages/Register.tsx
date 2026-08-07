import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { IslandNav } from "../components/IslandNav";
import { StepProgress } from "../components/StepProgress";
import { StepSchool } from "./register/StepSchool";
import { StepTeacher } from "./register/StepTeacher";
import { StepStudents } from "./register/StepStudents";
import { StepReview } from "./register/StepReview";
import { emptyRegistration, genderAccent, type RegistrationData } from "../lib/theme";
import { generateUsername } from "../lib/studentFile";
import { cn } from "../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;
const STEP_LABELS = ["المدرسة", "بياناتك", "الطلاب", "المراجعة"];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Register() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RegistrationData>(emptyRegistration);
  const navigate = useNavigate();

  const accent = data.gender ? genderAccent[data.gender] : null;
  const accentBg = accent?.bg ?? "bg-sun-400";

  const teacherErrors = useMemo(() => {
    const errors: { teacherName?: string; email?: string; schoolName?: string } = {};
    if (data.teacherName && data.teacherName.trim().length < 2) {
      errors.teacherName = "اكتب الاسم كاملًا.";
    }
    if (data.email && !validateEmail(data.email)) {
      errors.email = "البريد الإلكتروني غير صحيح.";
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
    data.students.length > 0,
    true,
  ][step];

  function goNext() {
    if (step < STEP_LABELS.length - 1) {
      setStep((s) => s + 1);
    } else {
      const username = generateUsername(data.schoolName);
      navigate("/لوحة-التحكم", { state: { ...data, username } });
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip pb-24">
      <IslandNav />
      <main id="main-content" className="mx-auto max-w-2xl px-4 pt-40">
        <div className="mb-12 text-center">
          <h1 className="text-3xl text-ink sm:text-4xl">سجّل كمعلم أو معلمة نشاط</h1>
          <p className="mt-3 text-ink-muted">أربع خطوات بسيطة، وتوصل للوحة التحكم.</p>
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
                  schoolName={data.schoolName}
                  errors={teacherErrors}
                  onChange={patch}
                />
              )}
              {step === 2 && (
                <StepStudents students={data.students} onChange={(students) => patch({ students })} />
              )}
              {step === 3 && <StepReview data={data} />}
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
            {step === STEP_LABELS.length - 1 ? "أنشئ حسابي وابدأ" : "التالي"}
            <CaretLeft weight="bold" className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-ink-faint">
          عندك حساب بالفعل؟{" "}
          <Link to="/لوحة-التحكم" className="text-sun-400 hover:underline">
            ادخل للوحة التحكم
          </Link>
        </p>
      </main>
    </div>
  );
}
