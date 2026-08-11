/**
 * وكيل الذكاء الحقيقي — يطلب من Claude بناء لعبة كاملة (HTML/CSS/JS مكتفية ذاتيًا)
 * من وصف الرائد، ثم تُشغَّل في إطار معزول (sandbox) على المنصة.
 * يعمل خلف خادم (serverless / Vite dev middleware) لحفظ مفتاح API بأمان.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface GenerateGameInput {
  prompt: string;
  stage?: string; // ابتدائي | متوسط
  gender?: string; // بنين | بنات
}

export interface GenerateGameResult {
  title: string;
  html: string;
}

const SYSTEM = `أنت مطوّر ألعاب تعليمية خبير لمنصة «نشاط» السعودية لرواد النشاط المدرسي.
مهمتك: من وصف الرائد، تبني لعبة أو مسابقة **كاملة قابلة للّعب فعليًا** كصفحة HTML واحدة مكتفية ذاتيًا.

قواعد إلزامية:
1) أخرِج **وثيقة HTML كاملة فقط** تبدأ بـ <!doctype html> وتنتهي بـ </html>. لا شروح، لا Markdown، لا أسوار كود، لا أي نص خارج الوثيقة.
2) **مكتفية ذاتيًا تمامًا**: كل CSS وJS مضمّن داخل الصفحة. ممنوع أي مورد خارجي (لا روابط CDN، لا خطوط ويب، لا صور من الإنترنت، لا fetch/XHR). استخدم خطوط النظام والرموز التعبيرية (emoji) للرسوم.
3) **عربية RTL**: <html dir="rtl" lang="ar">، كل النصوص عربية فصيحة مبسّطة مناسبة للطلاب.
4) **تُدار من شاشة الرائد على البروجكتر**: خط كبير واضح، أزرار كبيرة، تعمل باللمس والفأرة، وتملأ الشاشة (viewport)، وتصميم متجاوب وجذّاب بألوان مبهجة.
5) **لعبة حقيقية مكتملة**: نفّذ المنطق فعليًا (نقاط، فوز/خسارة، مؤقّت، جولات، إعادة تشغيل) حسب طبيعة اللعبة المطلوبة. لو طلب لعبة معروفة (إكس-أو، ذاكرة، سلّم وثعبان، عجلة، سباق أسئلة…) فابنِها صحيحة وكاملة.
6) لا تعتمد على localStorage أو الكوكيز (البيئة معزولة). احتفظ بالحالة في الذاكرة فقط.
7) محتوى آمن ومناسب للأطفال والمدارس، بلا أي محتوى غير لائق.
8) اجعل للصفحة <title> يصف اللعبة بالعربية.

أخرِج الآن وثيقة HTML الكاملة فقط.`;

function extractHtml(text: string): string {
  let t = text.trim();
  const fence = t.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const i = t.search(/<!doctype html|<html[\s>]/i);
  if (i > 0) t = t.slice(i);
  return t.trim();
}

function extractTitle(html: string, fallback: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const t = m ? m[1].trim() : "";
  return t || fallback;
}

export async function generateGame(
  input: GenerateGameInput,
  apiKey: string | undefined,
  model?: string
): Promise<GenerateGameResult> {
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }
  const client = new Anthropic({ apiKey });
  const ctx: string[] = [];
  if (input.stage) ctx.push(`المرحلة: ${input.stage}`);
  if (input.gender) ctx.push(`الفئة: ${input.gender}`);
  const userText = `${ctx.length ? ctx.join(" · ") + "\n" : ""}اطلب اللعبة: ${input.prompt.trim()}`;

  const response = await client.messages.create({
    model: model || process.env.ANTHROPIC_MODEL || "claude-opus-5",
    max_tokens: 16000,
    // نعطّل التفكير هنا لأن المهمة توليد كود مباشر: أسرع وكل الميزانية للمخرَج
    thinking: { type: "disabled" },
    system: SYSTEM,
    messages: [{ role: "user", content: userText }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("REFUSED");
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const html = extractHtml(text);
  if (!/<html[\s>]/i.test(html)) {
    throw new Error("NO_HTML");
  }
  return { title: extractTitle(html, input.prompt.slice(0, 40)), html };
}
