# دليل تسليم المبرمج — منصة «نشاط»

مرجع سريع لمراجعة الأكواد، والاستضافة، وبوابات الدفع. (Handoff notes for a reviewing developer.)

> آخر تحديث: ١٨ أغسطس ٢٠٢٦ — بعد الانتقال إلى Cloudflare Workers وتفعيل المصادقة والمزامنة السحابية.

---

## ١. نظرة عامة والتقنيات (Stack)

- **Vite 8 + React 19 + TypeScript** (SPA).
- **Tailwind CSS v4** للتصميم، **framer-motion** للحركة.
- **@react-three/fiber + three.js** للمشاهد ثلاثية الأبعاد (بوابة المدرسة، خلفية التسجيل، مشهد القيادة...).
- **react-router-dom v7** للتوجيه (مسارات بالعربية، مثل `/تسجيل`, `/الأسابيع`, `/لوحة-التحكم`).
- **الخلفية:** Cloudflare Worker خفيف (`worker/index.ts`) + **Supabase** (Postgres + Auth).
- **الحالة:** المصدر الأساسي ما زال `localStorage` (مفاتيح مُصدَّرة `motafael:*:v1` مع `try/catch`)، وتُزامَن سحابيًا كوثيقة واحدة عبر `src/lib/cloudSync.ts` عند تسجيل الدخول.

## ٢. التشغيل والبناء محليًا

```bash
npm install
npm run dev        # خادم التطوير على http://localhost:5173
npm run build      # tsc -b && vite build  → dist/
npm run deploy:cf  # بناء + نشر يدوي إلى Cloudflare (يتطلّب wrangler login)
npx wrangler dev   # تشغيل بيئة Workers الحقيقية محليًا (بعد npm run build)
```

> **⚠️ فخّ مهم:** أمر البناء هو `tsc -b && vite build`. إذا فشل `tsc -b` (خطأ أنواع)، **يُجهض البناء** وقد يُنشَر `dist` قديم. تأكّد من `✓ built` قبل النشر. لاحظ أن `tsc --noEmit` قد يمرّ بسبب الـ incremental cache بينما `tsc -b` يفشل.

`npm run dev` يشغّل `/api/generate-game` عبر وسيط داخل `vite.config.ts` (لا علاقة له بالـ Worker) — نفس المنطق في `server/generateGame.ts`.

## ٣. الاستضافة (Hosting)

**Cloudflare Workers** — مشروع باسم `nashat`.

- **الرابط:** https://nashat.fekrahunique.workers.dev
- **النشر تلقائي** عند كل `git push` إلى `master` (Workers Builds مربوط بمستودع `github.com/fekrahunique/mtfa3l`).
- إعدادات البناء في اللوحة: `Build command: npm run build` · `Deploy command: npx wrangler deploy`.
- `vite.config.ts`: `base` افتراضيه `'/'` (قابل للتجاوز بـ `VITE_BASE`).

`wrangler.jsonc` — سطران دقيقان لا تعبث بهما:

- `not_found_handling: "single-page-application"` — أي مسار غير موجود يعيد `index.html`، وهو ما يجعل الروابط العربية العميقة (`/الأسابيع`) تعمل عند فتحها مباشرة. أغنى عن ملف `public/_redirects` (حُذف).
- `run_worker_first: ["/api/*"]` — **ضروري**: بدونه يبتلع توجيه الـ SPA مسار `/api/generate-game` ويعيد له `index.html` بدل تشغيل الدالة.

تفاصيل النشر كاملة في **`DEPLOY-CLOUDFLARE.md`**.

> تاريخيًا كان المشروع على **GitHub Pages** (فرع `gh-pages` عبر `scripts/deploy.mjs`). السكربت ما زال موجودًا لكنه **لم يعد صالحًا** بعد تحويل `base` إلى `/`؛ لو احتجته شغّله بـ `VITE_BASE=/mtfa3l/`.

## ٤. تسجيل الدخول ورمز التحقق (Auth) — **مبني ويعمل**

- **Supabase Auth** بالبريد + **رمز تحقق OTP من ٨ أرقام**. تم التحقّق من الدورة كاملة: SMTP → إرسال → تحقّق → دخول → كتابة `profiles` مع RLS.
- `src/lib/authStore.ts` (الجلسة والدخول) · `src/components/AuthModal.tsx` (النافذة) · `src/lib/supabase.ts` (العميل).
- `supabase/schema.sql`: جدول `profiles` + سياسات RLS.
- `supabase/email-otp-template.html`: قالب بريد الرمز (عربي RTL) — يُلصق في لوحة Supabase.
- **مهم عند تغيير النطاق:** لوحة Supabase → Authentication → URL Configuration → حدّث **Site URL** و**Redirect URLs** (`https://<النطاق>/**`). بدونها لا يعمل رمز الدخول في الإنتاج.

> **ملاحظة تستحق التنظيف:** `src/lib/supabase.ts` فيه قيم احتياطية للـ URL والمفتاح العام مكتوبة داخل الكود (من أيام GitHub Pages حيث لا توجد متغيّرات بناء). المفتاح `anon` عام وآمن بحكم RLS، لكن الأنظف نقلها إلى متغيّرات بناء `VITE_SUPABASE_*` في لوحة Cloudflare وحذف القيم المكتوبة.

- **الجوال (SMS OTP):** غير مبني. حقل الجوال موجود في التسجيل (`RegistrationData.phone` اختياري) بغرض التنبيهات. يحتاج مزوّدًا (Twilio ونحوه) بتكلفة شهرية.

## ٥. بوابات الدفع (Payments) — لم تُبنَ بعد

- **الحالي:** لا تحصيل. التسعير **٣٥ ريال (الرائد) و٥٠ ريال (المتكامل) لكل ترم دراسي** (`src/data/plans.ts`، الحقل `term`، ودالة `planPrice`). زر «ابدأ باقة» ينقل مباشرة إلى المنصة بلا دفع.
- **العائق التقني ارتفع:** بوابات الدفع تتطلّب إنشاء عملية الدفع والتحقق من الـ webhook من جهة الخادم — وصار عندك خادم (`worker/index.ts`) ومكان آمن للأسرار (Cloudflare Secrets). التنفيذ: مسار جديد مثل `/api/checkout` و`/api/webhook` داخل الـ Worker.
- **بوابات مناسبة للسوق السعودي** (تدعم مدى/Apple Pay/بطاقات): **Moyasar** (سعودية، تكامل بسيط) · **Tap Payments** · **HyperPay** / **PayTabs** (مؤسسية) · **Stripe** (دولي، دعم مدى محدود).
- نموذج مقترح: اشتراك لكل ترم (دفعة واحدة) — يناسب `planPrice` الحالي، ويُربط بـ `src/lib/subscriptionStore.ts`.

## ٦. التخزين السحابي والمزامنة — **مبني جزئيًا**

- `src/lib/cloudSync.ts` يزامن كل حالة `motafael:*` كوثيقة واحدة في Supabase، مع التقاط تلقائي للكتابات. صندوق الحساب/المزامنة/الخروج في الشريط الجانبي للوحة.
- **الناقص:** رفع الصور (توثيق الأنشطة) عبر Supabase Storage، وحلّ تعارضات المزامنة بين جهازين (الحالي: آخر كتابة تفوز).

## ٧. وكيل الذكاء (بناء الألعاب) — **مبني، معطّل بانتظار مفتاح**

- `server/generateGame.ts` يطلب من Claude بناء لعبة HTML مكتفية ذاتيًا من وصف الرائد، وتُشغَّل في إطار معزول.
- يُستدعى عبر `POST /api/generate-game` من `src/lib/aiGame.ts`.
- **معطّل حاليًا:** سرّ `ANTHROPIC_API_KEY` غير مضبوط في Cloudflare (ولا في `.env` محليًا)، فالمسار يرجّع `503 NO_API_KEY` والزر يعطي خطأ للمستخدم.
- للتفعيل: مفتاح من console.anthropic.com → لوحة الـ Worker → Settings → Variables and Secrets → نوع **Secret**.
- تنبيه تكلفة: كل بناء لعبة حتى ١٦ ألف توكن مخرَج من `claude-opus-5`. متغيّر `ANTHROPIC_MODEL` يسمح بنموذج أرخص.

## ٨. خريطة الملفات المهمة

| المجال | المسار |
|---|---|
| نقطة دخول الخادم (Worker) | `worker/index.ts` |
| إعدادات النشر | `wrangler.jsonc`, `DEPLOY-CLOUDFLARE.md`, `vite.config.ts` |
| المصادقة | `src/lib/authStore.ts`, `src/lib/supabase.ts`, `src/components/AuthModal.tsx` |
| المزامنة السحابية | `src/lib/cloudSync.ts` |
| قاعدة البيانات | `supabase/schema.sql`, `supabase/email-otp-template.html` |
| وكيل الذكاء | `server/generateGame.ts`, `src/lib/aiGame.ts` |
| الباقات والتسعير | `src/data/plans.ts` |
| حالة الاشتراك (محلي) | `src/lib/subscriptionStore.ts` |
| التسجيل + الترحيب السينمائي | `src/pages/Register.tsx`, `src/components/WelcomeCinematic.tsx` |
| خلفية التسجيل 3D | `src/components/three/RegisterScene3D.tsx` |
| لوحة التحكم | `src/pages/Dashboard.tsx` + `src/components/dashboard/*` |
| برامج الأنشطة (بيانات) | `src/data/activityPrograms.ts` (٥ مجالات، برامج ابتدائي/متوسط) |
| رحلة الأسابيع | `src/pages/WeeksJourney.tsx` |
| الأدوات (تقرير برنامج، موزّع حصص ١٠٪، سجل الأثر...) | `src/pages/ProgramReport.tsx`, `ActivityRatio.tsx`, `ActivityLog.tsx` |

## ٩. ملاحظات متفرقة

- `api/generate-game.ts` بصيغة Vercel، متروك للتوافق ولا يُستخدم في Cloudflare.
- الروابط بالعربية مُرمّزة في الإنتاج؛ التحقق يكون عبر النافذة الخفية لتجاوز الكاش.
- تحذيرات LF/CRLF على ويندوز طبيعية (لا تؤثر).
- بعض الحزم كبيرة (three.js، pdf، mammoth) — قابلة لتحسين التقسيم (code-splitting) لاحقًا.
