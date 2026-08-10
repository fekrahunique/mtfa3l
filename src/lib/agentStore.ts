/**
 * مخزن ألعاب الوكيل — يحفظ التحديات التي بناها الوكيل على صفحة الرائد محليًا،
 * فتبقى ظاهرة في لوحة التحكم بعد الإغلاق وإعادة الفتح.
 */

import type { BuiltChallenge } from "./agentBuilder";

export interface SavedGame extends BuiltChallenge {
  id: string;
  createdLabel: string; // وصف زمني بسيط (لا نعتمد على Date في البناء)
}

const KEY = "motafael:agentGames:v1";

export function loadGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveGames(games: SavedGame[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(games));
  } catch {
    /* تجاهل امتلاء التخزين */
  }
}

/** يولّد معرّفًا فريدًا دون الاعتماد على Date/Math.random في وقت البناء الحرِج. */
export function makeGameId(existing: SavedGame[]): string {
  const n = existing.reduce((max, g) => {
    const m = g.id.match(/g(\d+)/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `g${n + 1}`;
}
