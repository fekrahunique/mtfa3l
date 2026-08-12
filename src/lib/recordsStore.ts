/**
 * سجل الأنشطة — قياس الأثر (#15) + التوثيق (#16) في نموذج واحد، يُحفَظ محليًا.
 * تتراكم السجلات لتُنتج ملخّص الشهر وملف الإنجاز PDF (#17).
 */

const KEY = "motafael:records:v1";

export interface ActivityRecord {
  id: string;
  name: string;
  date: string;          // نص كما أدخله الرائد (مثلاً «١٢ سبتمبر»)
  participants: number;
  participationPct: number; // نسبة المشاركة
  engagement: number;    // ١..٥
  goal: number;          // تحقيق الهدف ١..٥
  points: number;        // النقاط المكتسبة
  results: string;
  notes: string;
}

export function loadRecords(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivityRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecords(list: ActivityRecord[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* تجاهل */ }
}

export function makeRecordId(list: ActivityRecord[]): string {
  const max = list.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  return String(max + 1);
}

export interface RecordsSummary {
  count: number;
  participants: number;
  avgEngagement: number;
  avgGoal: number;
  points: number;
  most: ActivityRecord | null;
  least: ActivityRecord | null;
}

export function summarize(list: ActivityRecord[]): RecordsSummary {
  if (!list.length) return { count: 0, participants: 0, avgEngagement: 0, avgGoal: 0, points: 0, most: null, least: null };
  const participants = list.reduce((s, r) => s + (r.participants || 0), 0);
  const points = list.reduce((s, r) => s + (r.points || 0), 0);
  const avgEngagement = list.reduce((s, r) => s + (r.engagement || 0), 0) / list.length;
  const avgGoal = list.reduce((s, r) => s + (r.goal || 0), 0) / list.length;
  const sorted = [...list].sort((a, b) => b.engagement - a.engagement);
  return {
    count: list.length, participants, points,
    avgEngagement: Math.round(avgEngagement * 10) / 10,
    avgGoal: Math.round(avgGoal * 10) / 10,
    most: sorted[0], least: sorted[sorted.length - 1],
  };
}
