/**
 * عميل وكيل الذكاء الحقيقي — يطلب من الخادم بناء لعبة كاملة عبر Claude،
 * ويميّز حالة «غير مفعّل» (بلا خادم/مفتاح) عن الأخطاء الأخرى.
 */

export interface AiGame {
  title: string;
  html: string;
}

/** يُرمى عندما لا يكون الوكيل الذكي مفعّلًا (لا خادم أو لا مفتاح Claude). */
export class AiUnavailableError extends Error {
  constructor() {
    super("AI_UNAVAILABLE");
    this.name = "AiUnavailableError";
  }
}

export async function generateAiGame(prompt: string, opts?: { stage?: string; gender?: string }): Promise<AiGame> {
  let res: Response;
  try {
    res = await fetch("/api/generate-game", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, ...opts }),
    });
  } catch {
    // لا خادم يستجيب
    throw new AiUnavailableError();
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    // استضافة ثابتة بلا دالة خادم — الردّ صفحة لا JSON
    throw new AiUnavailableError();
  }

  let data: { title?: string; html?: string; error?: string };
  try {
    data = await res.json();
  } catch {
    throw new AiUnavailableError();
  }

  if (!res.ok) {
    if (res.status === 503 || data.error === "NO_API_KEY") throw new AiUnavailableError();
    if (data.error === "REFUSED") throw new Error("رفض النموذج بناء هذا الطلب، جرّب فكرة أخرى");
    throw new Error(data.error || `تعذّر البناء (${res.status})`);
  }
  if (!data.html) throw new Error("لم يُرجِع النموذج لعبة صالحة، أعد المحاولة");
  return { title: data.title || "لعبة", html: data.html };
}
