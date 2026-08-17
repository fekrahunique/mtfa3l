/**
 * المزامنة السحابية — يرفع/ينزّل كامل حالة التطبيق (كل مفاتيح `motafael:*`) كوثيقة
 * واحدة في جدول `profiles.app_state`. لا يلمس المخازن القائمة: يلتقط أي كتابة عبر
 * اعتراض `localStorage.setItem`، فيغطّي كل الفصول والطلاب والنقاط وسجل الأثر والباقة.
 *
 * استراتيجية الدمج: آخر كتابة تفوز (updated_at). عند الدخول: إن كانت السحابة أحدث
 * نُنزّلها ونعيد تحميل الصفحة؛ وإلا نرفع المحلي.
 */

import { supabase } from "./supabase";
import { currentUser } from "./authStore";

const PREFIX = "motafael:";
const TS_KEY = "motafael:sync:updatedAt"; // طابع زمني محلي (لا يُزامَن معناه، لكنه ضمن الوثيقة)
const META_KEYS = new Set([TS_KEY]);

let dirty = false;
let interval: ReturnType<typeof setInterval> | null = null;
let patched = false;

/* ————— التقاط الكتابات المحلية دون لمس المخازن ————— */
function patchLocalStorage() {
  if (patched) return;
  patched = true;
  const orig = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key: string, value: string) => {
    orig(key, value);
    if (key.startsWith(PREFIX) && !META_KEYS.has(key)) {
      dirty = true;
      orig(TS_KEY, String(Date.now()));
    }
  };
}

/* ————— جمع/تطبيق الحالة ————— */
function collectLocalState(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    if (key === "motafael:open-tour") continue; // مُشغّل عابر لا معنى لمزامنته
    const v = localStorage.getItem(key);
    if (v != null) out[key] = v;
  }
  return out;
}

function applyLocalState(state: Record<string, string>) {
  for (const [key, value] of Object.entries(state)) {
    if (!key.startsWith(PREFIX)) continue;
    try {
      localStorage.setItem(key, value);
    } catch {
      /* تجاهل */
    }
  }
}

function localTs(): number {
  return Number(localStorage.getItem(TS_KEY) || 0);
}

/* ————— الرفع والتنزيل ————— */
export async function pushToCloud(): Promise<{ error: string | null }> {
  const user = currentUser();
  if (!user) return { error: "not-signed-in" };
  const state = collectLocalState();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      app_state: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (!error) dirty = false;
  return { error: error ? error.message : null };
}

export interface CloudRow {
  app_state: Record<string, string> | null;
  updated_at: string | null;
}

export async function fetchCloud(): Promise<{ row: CloudRow | null; error: string | null }> {
  const user = currentUser();
  if (!user) return { row: null, error: "not-signed-in" };
  const { data, error } = await supabase
    .from("profiles")
    .select("app_state, updated_at")
    .eq("id", user.id)
    .maybeSingle();
  return { row: (data as CloudRow) ?? null, error: error ? error.message : null };
}

/**
 * مزامنة الدخول: يوازن بين المحلي والسحابي.
 * يُعيد ما حدث حتى يقرّر النداء إن كان يلزم إعادة تحميل الصفحة.
 */
export async function syncOnLogin(): Promise<"pulled" | "pushed" | "noop" | "error"> {
  const { row, error } = await fetchCloud();
  if (error) return "error";

  const hasCloud = row && row.app_state && Object.keys(row.app_state).length > 0;
  const cloudTs = row?.updated_at ? new Date(row.updated_at).getTime() : 0;

  if (!hasCloud) {
    // أول دخول لهذا الحساب — ارفع المحلي (إن وُجد).
    const local = collectLocalState();
    if (Object.keys(local).length > 0) {
      await pushToCloud();
      return "pushed";
    }
    return "noop";
  }

  // توجد بيانات سحابية. إن كانت أحدث من المحلي، نزّلها.
  if (cloudTs >= localTs()) {
    applyLocalState(row!.app_state!);
    return "pulled";
  }
  // المحلي أحدث — ارفعه.
  await pushToCloud();
  return "pushed";
}

/* ————— المزامنة التلقائية أثناء الاستخدام ————— */
export function startAutoSync() {
  patchLocalStorage();
  if (interval) return;
  interval = setInterval(() => {
    if (dirty && currentUser()) void pushToCloud();
  }, 20_000);
  const flush = () => {
    if (dirty && currentUser()) void pushToCloud();
  };
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("beforeunload", flush);
}

export function stopAutoSync() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

/** مزامنة يدوية فورية (زر «مزامنة الآن»). */
export async function syncNow(): Promise<{ error: string | null }> {
  return pushToCloud();
}
