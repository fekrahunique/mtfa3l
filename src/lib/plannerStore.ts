/** تخزين خطة «المخطط الذكي» المعتمَدة محليًا (لا خادم بعد). */
import type { PlanWeek } from "./planGenerator";

const KEY = "motafael:plan:v1";

export interface SavedPlan {
  stage: string;
  createdLabel: string;
  weeks: PlanWeek[];
}

export function loadPlan(): SavedPlan | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedPlan) : null;
  } catch {
    return null;
  }
}

export function savePlan(p: SavedPlan) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* تجاهل */ }
}

export function clearPlan() {
  try { localStorage.removeItem(KEY); } catch { /* تجاهل */ }
}
