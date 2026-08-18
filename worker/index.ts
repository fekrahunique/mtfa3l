/**
 * Worker المنصّة على Cloudflare — يوجّه /api/* إلى منطق الخادم،
 * وكل ما عداه يُسلَّم كملفات ثابتة (dist) مع توجيه SPA للمسارات العربية.
 */
// @ts-nocheck
import { generateGame } from "../server/generateGame";

const json = (data, status) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/generate-game") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      try {
        const body = await request.json().catch(() => ({}));
        const result = await generateGame(
          { prompt: body.prompt, stage: body.stage, gender: body.gender },
          env.ANTHROPIC_API_KEY,
          env.ANTHROPIC_MODEL || "claude-opus-5",
        );
        return json(result, 200);
      } catch (e) {
        const code = (e && e.message) || "ERROR";
        return json({ error: String(code) }, code === "NO_API_KEY" ? 503 : 500);
      }
    }

    // أي مسار آخر: الملفات الثابتة، ثم index.html للمسارات العربية (SPA).
    return env.ASSETS.fetch(request);
  },
};
