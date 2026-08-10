/**
 * تخزين محلي لتعديلات المعلم على الأركان، مفصولة حسب الأسبوع.
 * يبقي محتوى الوزارة الأصلي سليمًا في الشيفرة، ويحفظ ما يعدّله المعلم فقط.
 */
import type { BreakCorner } from "../data/breakPeriods";

// نرقّي رقم النسخة لتجاهل أي نسخ محفوظة قديمة تحجب محتوى محدَّثًا (مسابقات جديدة مثلًا).
const KEY = "motafael:corners:v2";

/** خريطة معرّف الأسبوع ← قائمة أركانه بعد تعديل المعلم. */
export type CornerOverrides = Record<string, BreakCorner[]>;

export function loadCornerOverrides(): CornerOverrides {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CornerOverrides) : {};
  } catch {
    return {};
  }
}

export function saveCornerOverrides(overrides: CornerOverrides) {
  try {
    localStorage.setItem(KEY, JSON.stringify(overrides));
  } catch {
    /* التخزين ممتلئ أو محظور — نتجاهل بهدوء */
  }
}

const BADGE_KEY = "motafael:badges";

/** أوسمة الأسابيع المكتملة، تتجمّع عبر الأسابيع. */
export function loadBadges(): string[] {
  try {
    const raw = localStorage.getItem(BADGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveBadges(badges: string[]) {
  try {
    localStorage.setItem(BADGE_KEY, JSON.stringify(badges));
  } catch {
    /* نتجاهل بهدوء */
  }
}

/** يبني ركنًا فارغًا لإضافته من جهة المعلم. */
export function blankCorner(day: number): BreakCorner {
  return {
    id: `custom-${day}-${Math.floor(performance.now())}`,
    day,
    title: "",
    outcomes: [""],
    values: [],
    minutes: 10,
    place: "ساحة المدرسة",
    tools: [],
    steps: [""],
    edited: true,
  };
}
