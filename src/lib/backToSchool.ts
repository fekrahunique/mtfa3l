/**
 * طبقة موسمية «العودة للدراسة» — هوية وزارة التعليم البصرية ٢٠٢٦.
 * تُحقن بصريًا في المنصة خلال أول أسبوعين من العودة ثم تعود هويتنا تلقائيًا،
 * دون المساس بما بُني: لوحات إعلانية على الطريق، السبورة، وشريط لوحة التحكم.
 */

/** الألوان الرسمية من دليل الهوية. */
export const BTS = {
  purple: "#4D1C9B",
  green: "#7BD84A",
  sky: "#61BBFF",
  white: "#FFFFFF",
  // ثانوية (باستيل)
  lightYellow: "#FFEFAB",
  lightTurquoise: "#C9F7F5",
  lightPink: "#FDDCFF",
  lightPurple: "#E1DEFF",
  beige: "#F2E9DD",
} as const;

/** نهاية موسم العودة للدراسة — أول أسبوعين، ثم تعود الهوية الأصلية. */
const SEASON_END = new Date("2026-08-24T23:59:59");

/** هل نحن ضمن موسم العودة للدراسة الآن؟ (يعود تلقائيًا بعد انتهائه) */
export function backToSchoolSeason(): boolean {
  try {
    // إتاحة تجاوز يدوي للتجربة: ?bts=on / ?bts=off
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("bts");
      if (q === "on") return true;
      if (q === "off") return false;
    }
    return new Date() <= SEASON_END;
  } catch {
    return false;
  }
}
