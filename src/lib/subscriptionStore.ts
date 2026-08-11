/**
 * حالة الاشتراك — نموذج التجربة: بلا اشتراك يُتاح نشاط واحد فقط من الأسبوع التمهيدي،
 * وبقيّة الأنشطة والأسابيع تتطلّب اشتراكًا. يُحفَظ محليًا (لا خادم بعد).
 */

const KEY = "motafael:subscribed:v1";

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

/** ينتقل إلى قسم الباقات في الصفحة الرئيسية من أي مسار. */
export function goToPricing(navigate: (to: string) => void) {
  navigate("/");
  window.setTimeout(() => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 450);
}
