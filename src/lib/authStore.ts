/**
 * حالة المصادقة — تسجيل دخول حقيقي بالبريد + رمز تحقق (OTP) عبر Supabase.
 * الطلاب أسماء فقط بلا حسابات؛ الحساب للرائد (المعلّم/المعلّمة) فقط.
 *
 * متجر بسيط pub/sub + خطّاف React، بلا مكتبات إضافية. الجلسة تُحفَظ تلقائيًا
 * (persistSession) فيبقى الرائد مسجَّلًا بين الزيارات.
 */

import { useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

let session: Session | null = null;
let ready = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

// تهيئة أولية + متابعة تغيّرات الجلسة.
supabase.auth.getSession().then(({ data }) => {
  session = data.session;
  ready = true;
  emit();
});
supabase.auth.onAuthStateChange((_event, s) => {
  session = s;
  ready = true;
  emit();
});

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  ready: boolean;
}

let snapshot: AuthState = { session: null, user: null, ready: false };
function getSnapshot(): AuthState {
  // نُعيد بناء المرجع فقط عند تغيّر فعلي حتى لا يُعيد React التصيير بلا داعٍ.
  if (snapshot.session !== session || snapshot.ready !== ready) {
    snapshot = { session, user: session?.user ?? null, ready };
  }
  return snapshot;
}

/** خطّاف يُعطي حالة المصادقة الحيّة داخل مكوّنات React. */
export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** قراءة فورية (خارج React) للمستخدم الحالي. */
export function currentUser(): User | null {
  return session?.user ?? null;
}

/** إرسال رمز تحقق (٦ أرقام) إلى البريد. ينشئ الحساب إن لم يكن موجودًا. */
export async function sendOtp(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  return { error: error ? friendly(error.message) : null };
}

/** التحقق من الرمز وإنشاء الجلسة. */
export async function verifyOtp(email: string, token: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: "email",
  });
  return { error: error ? friendly(error.message) : null };
}

export async function signOut() {
  await supabase.auth.signOut();
}

/** ترجمة رسائل Supabase الإنجليزية إلى عربية مفهومة للرائد. */
function friendly(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("token has expired") || m.includes("expired")) return "انتهت صلاحية الرمز، اطلب رمزًا جديدًا";
  if (m.includes("invalid") && m.includes("otp")) return "الرمز غير صحيح، تحقّق منه وحاول مجددًا";
  if (m.includes("invalid")) return "الرمز غير صحيح، تحقّق منه وحاول مجددًا";
  if (m.includes("rate limit") || m.includes("too many")) return "محاولات كثيرة، انتظر دقيقة ثم أعد المحاولة";
  if (m.includes("email")) return "تحقّق من صحّة البريد الإلكتروني";
  return "تعذّرت العملية، حاول مرة أخرى";
}
