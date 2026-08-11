/* دالة خادم (Vercel/Netlify) — تحفظ مفتاح Claude في متغيّر بيئة ANTHROPIC_API_KEY */
// @ts-nocheck
import { generateGame } from "../server/generateGame";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const result = await generateGame(
      { prompt: body.prompt, stage: body.stage, gender: body.gender },
      process.env.ANTHROPIC_API_KEY
    );
    res.status(200).json(result);
  } catch (e) {
    const code = (e && e.message) || "ERROR";
    res.status(code === "NO_API_KEY" ? 503 : 500).json({ error: code });
  }
}
