/** تخزين شارات الطلاب محليًا: معرّف الطالب → قائمة مفاتيح الشارات. */
const KEY = "motafael:studentBadges:v1";

export type BadgeMap = Record<string, string[]>;

export function loadStudentBadges(): BadgeMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BadgeMap) : {};
  } catch {
    return {};
  }
}

export function saveStudentBadges(map: BadgeMap) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* تجاهل */ }
}

export function toggleStudentBadge(map: BadgeMap, studentId: string, key: string): BadgeMap {
  const cur = map[studentId] ?? [];
  const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
  return { ...map, [studentId]: next };
}

/** إجمالي الشارات الممنوحة عبر كل الطلاب. */
export function totalBadges(map: BadgeMap): number {
  return Object.values(map).reduce((s, arr) => s + arr.length, 0);
}
