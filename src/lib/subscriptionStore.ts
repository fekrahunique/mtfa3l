/**
 * حالة الاشتراك — نموذج التجربة: بلا اشتراك يُتاح نشاط واحد فقط من الأسبوع التمهيدي،
 * وبقيّة الأنشطة والأسابيع تتطلّب اشتراكًا. يُحفَظ محليًا (لا خادم بعد).
 * الفئة (tier) تحدّد المحتوى الحصري: بعض أنشطة المستودع للباقة العليا فقط.
 */

import type { PlanId } from "../data/plans";

const KEY = "motafael:subscribed:v1";
const TIER_KEY = "motafael:tier:v1";

export function isSubscribed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSubscribed(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* تجاهل */
  }
}

/** فئة الاشتراك المحفوظة (أو null إن لم تُحدَّد بعد). */
export function getTier(): PlanId | null {
  try {
    const v = localStorage.getItem(TIER_KEY);
    return v === "starter" || v === "pro" || v === "premium" ? v : null;
  } catch {
    return null;
  }
}

export function setTier(t: PlanId | null) {
  try {
    if (t) localStorage.setItem(TIER_KEY, t);
    else localStorage.removeItem(TIER_KEY);
  } catch {
    /* تجاهل */
  }
}

/** هل يملك المستخدم الباقة العليا؟ يعتمد الفئة المحفوظة أو فئة قادمة من التسجيل. */
export function isPremium(incoming?: PlanId | null): boolean {
  return getTier() === "premium" || incoming === "premium";
}

/** ينتقل إلى قسم الباقات في الصفحة الرئيسية من أي مسار. */
export function goToPricing(navigate: (to: string) => void) {
  navigate("/");
  window.setTimeout(() => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 450);
}
