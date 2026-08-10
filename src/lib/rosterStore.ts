/**
 * مخزن الفصول والطلاب والنقاط — محليًا في المتصفح (بلا حسابات ولا خادم).
 * هيكل نظيف يسهل ربطه بخادم/مزامنة لاحقًا. الطلاب أسماء فقط (بلا معرّف دخول).
 */

export interface ClassRoom {
  id: string;
  name: string;
  students: string[];
}

const CLASSES_KEY = "motafael:classes:v1";
const ACTIVE_KEY = "motafael:activeClass:v1";
const POINTS_KEY = "motafael:points:v1"; // { [classId]: { [studentName]: number } }
const DONE_KEY = "motafael:doneActivities:v1"; // { [classId]: string[] } معرّفات الأنشطة المنجزة

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* تجاهل */ }
}

let counter = 0;
export function newId(prefix = "c") {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

/* ————— الفصول ————— */
export function loadClasses(): ClassRoom[] {
  return read<ClassRoom[]>(CLASSES_KEY, []);
}
export function saveClasses(classes: ClassRoom[]) {
  write(CLASSES_KEY, classes);
}
export function loadActiveClassId(): string | null {
  return read<string | null>(ACTIVE_KEY, null);
}
export function saveActiveClassId(id: string | null) {
  write(ACTIVE_KEY, id);
}

/** يحلّل نصًّا (سطر لكل اسم أو مفصولًا بفواصل) إلى قائمة أسماء نظيفة بلا تكرار. */
export function parseNames(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[\n,،؛;]+/)
        .map((s) => s.replace(/^\s*[-•\d.)\]]+\s*/, "").trim()) // إزالة ترقيم/رموز البداية
        .filter((s) => s.length > 0 && s.length < 40)
    )
  );
}

/* ————— النقاط ————— */
type PointsMap = Record<string, Record<string, number>>;
export function loadPoints(): PointsMap {
  return read<PointsMap>(POINTS_KEY, {});
}
export function savePoints(p: PointsMap) {
  write(POINTS_KEY, p);
}
export function classPoints(classId: string): Record<string, number> {
  return loadPoints()[classId] ?? {};
}
export function awardPoints(classId: string, student: string, delta: number) {
  const all = loadPoints();
  const cls = { ...(all[classId] ?? {}) };
  cls[student] = Math.max(0, (cls[student] ?? 0) + delta);
  all[classId] = cls;
  savePoints(all);
}
export function resetClassPoints(classId: string) {
  const all = loadPoints();
  all[classId] = {};
  savePoints(all);
}

/** أعلى الطلاب نقاطًا في الفصل (فائزو الأسبوع). */
export function topStudents(classId: string, limit = 3): { name: string; pts: number }[] {
  const p = classPoints(classId);
  return Object.entries(p)
    .map(([name, pts]) => ({ name, pts }))
    .filter((s) => s.pts > 0)
    .sort((a, b) => b.pts - a.pts)
    .slice(0, limit);
}

/* ————— الأنشطة المنجزة لكل فصل ————— */
type DoneMap = Record<string, string[]>;
export function loadDone(): DoneMap {
  return read<DoneMap>(DONE_KEY, {});
}
export function classDone(classId: string): string[] {
  return loadDone()[classId] ?? [];
}
export function toggleDone(classId: string, activityId: string) {
  const all = loadDone();
  const list = new Set(all[classId] ?? []);
  if (list.has(activityId)) list.delete(activityId);
  else list.add(activityId);
  all[classId] = Array.from(list);
  write(DONE_KEY, all);
}

/* ————— تقسيم المجموعات ————— */
/** يقسّم أسماء الفصل عشوائيًا إلى عدد مجموعات، بأسماء افتراضية قابلة للتعديل. */
export function splitGroups(students: string[], count: number): { name: string; members: string[] }[] {
  const names = ["الفريق الأزرق", "الفريق الأخضر", "الفريق الأحمر", "الفريق الذهبي", "الفريق البنفسجي", "الفريق البرتقالي"];
  const shuffled = [...students].sort(() => (newIdSeed() % 2 ? 1 : -1));
  const groups = Array.from({ length: count }, (_, i) => ({ name: names[i % names.length], members: [] as string[] }));
  shuffled.forEach((s, i) => groups[i % count].members.push(s));
  return groups;
}
let seed = 1;
function newIdSeed() { seed = (seed * 9301 + 49297) % 233280; return seed; }
