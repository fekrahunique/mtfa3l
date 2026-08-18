/**
 * نافذة تسجيل الدخول — بريد + رمز تحقق (OTP) حقيقي عبر Supabase.
 * بعد النجاح تُشغّل مزامنة الدخول، وتُبلّغ المُستدعي بالنتيجة.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EnvelopeSimple, ShieldCheck, X, CircleNotch } from "@phosphor-icons/react";
import { sendOtp, verifyOtp } from "../lib/authStore";
import { syncOnLogin } from "../lib/cloudSync";
import { cn } from "../lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

export type SyncResult = "pulled" | "pushed" | "noop" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  onDone: (result: SyncResult) => void;
  prefillEmail?: string;
  /** عنوان مخصّص (مثلاً «فعّل المزامنة وأكمل تسجيلك»). */
  title?: string;
  subtitle?: string;
}

function validEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function AuthModal({ open, onClose, onDone, prefillEmail, title, subtitle }: Props) {
  const [phase, setPhase] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPhase("email");
      setCode("");
      setError(null);
      setBusy(false);
      if (prefillEmail) setEmail(prefillEmail);
    }
  }, [open, prefillEmail]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (phase === "otp") setTimeout(() => otpRef.current?.focus(), 200);
  }, [phase]);

  async function requestCode() {
    if (!validEmail(email)) {
      setError("اكتب بريدًا إلكترونيًا صحيحًا");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await sendOtp(email);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    setPhase("otp");
    setResendIn(45);
  }

  async function confirmCode() {
    if (code.trim().length < 6) {
      setError("أدخل الرمز كاملًا كما وصلك في البريد");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await verifyOtp(email, code);
    if (error) {
      setBusy(false);
      setError(error);
      return;
    }
    const result = await syncOnLogin();
    setBusy(false);
    onDone(result);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={busy ? undefined : onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1526]/90 p-7 shadow-2xl backdrop-blur-2xl sm:p-9"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="إغلاق"
              className="absolute left-5 top-5 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-white/10 hover:text-ink disabled:opacity-40"
            >
              <X weight="bold" className="h-5 w-5" />
            </button>

            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sun-400/15 text-sun-300">
                {phase === "email" ? (
                  <EnvelopeSimple weight="duotone" className="h-7 w-7" />
                ) : (
                  <ShieldCheck weight="duotone" className="h-7 w-7" />
                )}
              </div>
              <h2 className="text-2xl text-ink">
                {phase === "email" ? title ?? "تسجيل الدخول" : "أدخل رمز التحقق"}
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                {phase === "email"
                  ? subtitle ?? "بريدك فقط — نرسل لك رمزًا إلى بريدك، بلا كلمة مرور"
                  : `أرسلنا رمزًا إلى ${email}`}
              </p>
            </div>

            <div>
              {phase === "email" ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-4"
                >
                  <input
                    type="email"
                    dir="ltr"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && requestCode()}
                    className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center text-ink outline-none transition-colors focus:border-sun-400/60"
                  />
                  {error && <p className="text-center text-sm text-red-400">{error}</p>}
                  <button
                    type="button"
                    onClick={requestCode}
                    disabled={busy}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl bg-sun-400 px-6 py-3 font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      busy ? "opacity-70" : "hover:scale-[1.02] active:scale-95"
                    )}
                  >
                    {busy && <CircleNotch weight="bold" className="h-5 w-5 animate-spin" />}
                    {busy ? "جارٍ الإرسال" : "أرسل الرمز"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-4"
                >
                  <input
                    ref={otpRef}
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    placeholder="••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onKeyDown={(e) => e.key === "Enter" && confirmCode()}
                    className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-ink outline-none transition-colors focus:border-sun-400/60"
                  />
                  {error && <p className="text-center text-sm text-red-400">{error}</p>}
                  <button
                    type="button"
                    onClick={confirmCode}
                    disabled={busy}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl bg-sun-400 px-6 py-3 font-semibold text-bg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      busy ? "opacity-70" : "hover:scale-[1.02] active:scale-95"
                    )}
                  >
                    {busy && <CircleNotch weight="bold" className="h-5 w-5 animate-spin" />}
                    {busy ? "جارٍ التحقق" : "تأكيد الدخول"}
                  </button>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setPhase("email")}
                      disabled={busy}
                      className="text-ink-muted hover:text-ink"
                    >
                      تغيير البريد
                    </button>
                    <button
                      type="button"
                      onClick={requestCode}
                      disabled={busy || resendIn > 0}
                      className="font-semibold text-sun-400 hover:underline disabled:text-ink-faint disabled:no-underline"
                    >
                      {resendIn > 0 ? `إعادة الإرسال بعد ${resendIn}s` : "إعادة إرسال الرمز"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
