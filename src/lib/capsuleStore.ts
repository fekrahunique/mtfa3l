/**
 * كبسولة المستقبل — أهداف يختمها الطلاب في الأسبوع التمهيدي، تُحفظ محليًا
 * وتُفتح في لوحة التحكم آخر الفصل لقياس ما تحقّق منها.
 */

export interface CapsuleGoal {
  id: string;
  text: string;
  who?: string; // اسم صاحب الهدف (اختياري)
  achieved: boolean;
}

const KEY = "motafael:capsule:v1";

export function loadCapsule(): CapsuleGoal[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCapsule(goals: CapsuleGoal[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(goals));
  } catch {
    /* تجاهل امتلاء التخزين */
  }
}

function nextId(goals: CapsuleGoal[]): string {
  const n = goals.reduce((max, g) => {
    const m = g.id.match(/c(\d+)/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `c${n + 1}`;
}

/** يضيف هدفًا جديدًا ويعيد القائمة المحدّثة. */
export function addCapsuleGoal(text: string, who?: string): CapsuleGoal[] {
  const t = text.trim();
  if (!t) return loadCapsule();
  const goals = loadCapsule();
  const next: CapsuleGoal[] = [...goals, { id: nextId(goals), text: t, who: who?.trim() || undefined, achieved: false }];
  saveCapsule(next);
  return next;
}

export function toggleCapsuleAchieved(id: string): CapsuleGoal[] {
  const next = loadCapsule().map((g) => (g.id === id ? { ...g, achieved: !g.achieved } : g));
  saveCapsule(next);
  return next;
}

export function removeCapsuleGoal(id: string): CapsuleGoal[] {
  const next = loadCapsule().filter((g) => g.id !== id);
  saveCapsule(next);
  return next;
}

export function clearCapsule(): CapsuleGoal[] {
  saveCapsule([]);
  return [];
}
