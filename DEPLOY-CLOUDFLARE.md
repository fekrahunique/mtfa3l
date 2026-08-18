# النشر على Cloudflare Workers — منصة «نشاط»

المنصّة تُنشر كـ **Worker واحد** يخدم الملفات الثابتة (`dist`) ويشغّل `/api/generate-game`.
(Cloudflare Pages في وضع صيانة؛ المشاريع الجديدة تُبنى على Workers.)

---

## البنية

| الملف | الدور |
|---|---|
| `wrangler.jsonc` | إعدادات الـ Worker: الملفات الثابتة، توجيه SPA، ومسار الـ API |
| `worker/index.ts` | نقطة الدخول — يوجّه `/api/generate-game` ويسلّم الباقي لـ `env.ASSETS` |
| `server/generateGame.ts` | منطق وكيل الذكاء (مشترك بين الـ Worker وخادم Vite المحلي) |

نقطتان دقيقتان في `wrangler.jsonc`:

- `not_found_handling: "single-page-application"` — أي مسار غير موجود يعيد `index.html`، وهو ما يجعل الروابط العربية العميقة (`/الأسابيع`) تعمل عند فتحها مباشرة. أغنى عن ملف `public/_redirects` (حُذف).
- `run_worker_first: ["/api/*"]` — **ضروري**: بدونه يبتلع توجيه الـ SPA مسار `/api/generate-game` ويعيد له `index.html` بدل تشغيل الدالة.

---

## ١. إنشاء المشروع (مرة واحدة)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Connect GitHub**.
2. امنح الوصول لحساب `fekrahunique` واختر مستودع `mtfa3l`، الفرع `master`.
3. إعدادات البناء:

| الحقل | القيمة |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` (اتركه فارغًا) |

## ٢. المتغيّرات والأسرار

في إعدادات المشروع → **Settings** → **Variables and Secrets**:

| الاسم | النوع | متى يُستخدم |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Secret** | وقت التشغيل — يقرؤه `worker/index.ts` |
| `ANTHROPIC_MODEL` | Variable (اختياري) | افتراضيًا `claude-opus-5` |

وفي إعدادات **Build** → متغيّرات بيئة البناء (Build variables)، والقيم من `.env` المحلي:

| الاسم | ملاحظة |
|---|---|
| `VITE_SUPABASE_URL` | **وقت البناء** — يُخبز داخل حزمة الواجهة |
| `VITE_SUPABASE_ANON_KEY` | **وقت البناء** |
| `NODE_VERSION` = `24` | مطابقة للبيئة المحلية |

> تعديل أي `VITE_*` لا يظهر إلا بعد **إعادة بناء** (retry deployment)، بعكس الأسرار التي تسري فورًا.
>
> `ANTHROPIC_API_KEY` سرّ (Secret) لا متغيّرًا عاديًا — مفتاح مدفوع لا يجوز ظهوره في السجلّات.

## ٣. Supabase — اعتماد النطاق

بدونها **رمز الدخول بالبريد لن يعمل في الإنتاج**.

Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** النطاق النهائي
- **Redirect URLs:** `https://mtfa3l.<subdomain>.workers.dev/**` و`https://<نطاقك-المخصّص>/**`

## ٤. النطاق المخصّص

مشروع الـ Worker → **Settings** → **Domains & Routes** → **Add custom domain**.
بعد الربط، ارجع للخطوة ٣ وحدّث Supabase.

## ٥. التحقّق بعد النشر

- [ ] افتح مسارًا عربيًا **عميقًا مباشرة** (مثل `/الأسابيع`).
- [ ] دورة دخول كاملة بالرمز: إرسال → تحقّق → دخول.
- [ ] بناء لعبة عبر وكيل الذكاء (يختبر `/api/generate-game`).
- [ ] من نافذة خفية لتجاوز الكاش.

---

## النشر اليدوي (بديل / طوارئ)

```bash
npm run deploy:cf     # = npm run build && wrangler deploy
```

يتطلّب `npx wrangler login` مرة واحدة. الأسرار تبقى مضبوطة من اللوحة (أو `npx wrangler secret put ANTHROPIC_API_KEY`).

للتجربة محليًا على بيئة Workers الحقيقية:

```bash
npm run build && npx wrangler dev
```

## ملاحظات

- `npm run dev` (خادم Vite) يشغّل `/api/generate-game` عبر وسيط في `vite.config.ts` — لا علاقة له بالـ Worker.
- `api/generate-game.ts` بصيغة Vercel، متروك للتوافق فقط ولا يُستخدم في Cloudflare.
- `npm run deploy` (سكربت `gh-pages`) لم يعد صالحًا بعد تحويل `base` إلى `/`؛ لو احتجته شغّله بـ `VITE_BASE=/mtfa3l/`.
