# دليل تسليم المبرمج — منصة «نشاط»

مرجع سريع لمراجعة الأكواد، والاستضافة، وبوابات الدفع. (Handoff notes for a reviewing developer.)

---

## ١. نظرة عامة والتقنيات (Stack)

- **Vite 8 + React 19 + TypeScript** (SPA).
- **Tailwind CSS v4** للتصميم، **framer-motion** للحركة.
- **@react-three/fiber + three.js** للمشاهد ثلاثية الأبعاد (بوابة المدرسة، خلفية التسجيل، مشهد القيادة...).
- **react-router-dom v7** للتوجيه (مسارات بالعربية، مثل `/تسجيل`, `/الأسابيع`, `/لوحة-التحكم`).
- **لا يوجد backend حاليًا** — كل الحالة تُحفظ في `localStorage` (مفاتيح مُصدَّرة `motafael:*:v1` مع `try/catch`).

## ٢. التشغيل والبناء محليًا

```bash
npm install
npm run dev      # خادم التطوير على http://localhost:5173
npm run build    # tsc -b && vite build  → dist/
npm run deploy   # vite build && node scripts/deploy.mjs
```

> **⚠️ فخّ مهم:** أمر البناء هو `tsc -b && vite build`. إذا فشل `tsc -b` (خطأ أنواع)، **يُجهض البناء بصمت** وقد يُنشَر `dist` قديم. شغّل `npm run build` كاملًا وتأكد من `✓ built` قبل النشر. لاحظ أن `tsc --noEmit` قد يمرّ بسبب الـ incremental cache بينما `tsc -b` يفشل.

## ٣. الاستضافة (Hosting) — الوضع الحالي والمقترح

- **الحالي:** **GitHub Pages** (استضافة ثابتة static فقط). المستودع: `github.com/fekrahunique/mtfa3l` (عام). الفرع `gh-pages` يُدفع إليه `dist` مباشرة عبر `scripts/deploy.mjs` (force-push، بلا Actions لأن التوكن يفتقد صلاحية `workflow`).
- إعدادات SPA: `vite.config` فيه `base: mode==='production' ? '/mtfa3l/' : '/'`؛ التوجيه `basename={BASE_URL}`؛ و`public/404.html` يعيد التوجيه لدعم الروابط العميقة بالعربية.
- **القيد الجوهري:** GitHub Pages **ثابت** — لا يشغّل كود خادم. أي ميزة تحتاج خادمًا (تسجيل دخول حقيقي، رمز تحقق، دفع، تخزين سحابي) **لا تعمل هنا**.
- **المقترح للمبرمج:** الانتقال إلى استضافة تدعم دوال serverless مع نفس الواجهة:
  - **Vercel** أو **Netlify** أو **Cloudflare Pages** (تدعم React SPA + serverless functions + نطاق مخصّص + HTTPS). الأنسب للانتقال السلس.
  - أو الإبقاء على الواجهة على Pages وإضافة **Supabase** (Postgres + Auth + Storage + Edge Functions) للخلفية.

## ٤. تسجيل الدخول ورمز التحقق (Auth) — مؤجّل

- **الحالي:** لا مصادقة حقيقية. التسجيل (`src/pages/Register.tsx`) يجمع البيانات في `localStorage` فقط. زر «تسجيل الدخول» في الشريط العلوي يفتح لوحة التحكم من البيانات المحلية. **رمز التحقق غير مبني** (اتُّفق على تأجيله).
- **المقترح:** **Supabase Auth** يعطي جاهزًا:
  - تسجيل دخول بالبريد + **رمز تحقق OTP بالبريد** (رخيص وسهل).
  - **OTP بالجوال (SMS)** عبر مزوّد (Twilio ونحوه) — له تكلفة شهرية.
  - حقل الجوال موجود بالفعل في التسجيل (`RegistrationData.phone` اختياري) بغرض تنبيهات الخصم/التحديثات.
- بديل: **Firebase Auth** (مشابه).

## ٥. بوابات الدفع (Payments) — مؤجّل، يحتاج خادمًا

- **الحالي:** لا دفع. التسعير **٣٥ ريال (الرائد) و٥٠ ريال (المتكامل) لكل ترم دراسي** (`src/data/plans.ts`، الحقل `term`، ودالة `planPrice`). زر «ابدأ باقة» ينقل مباشرة إلى المنصة بلا تحصيل.
- **لماذا يحتاج خادمًا؟** بوابات الدفع تتطلب إنشاء عملية الدفع والتحقق من الـ webhook **من جهة الخادم** (لا يجوز وضع المفاتيح السرية في الواجهة). لذا يلزم serverless function أو Supabase Edge Function.
- **بوابات مناسبة للسوق السعودي** (تدعم مدى/Apple Pay/بطاقات):
  - **Moyasar** (ميسّر) — سعودية، تكامل بسيط، تدعم مدى وApple Pay.
  - **Tap Payments** (تاب) — خليجية شائعة.
  - **HyperPay** / **PayTabs** — خيارات مؤسسية.
  - **Stripe** — للمدفوعات الدولية (دعم مدى محدود).
- نموذج مقترح: اشتراك لكل ترم (دفعة واحدة) — يناسب `planPrice` الحالي. يمكن لاحقًا ربطه بحالة الاشتراك في `src/lib/subscriptionStore.ts` (حاليًا `localStorage`).

## ٦. التخزين السحابي والمزامنة — مؤجّل

- **الحالي:** كل شيء محلي (`localStorage`): بيانات المعلم، الفصول، الطلاب، سجل الأثر، حالة الاشتراك. لا مزامنة عبر الأجهزة، ولا رفع صور.
- **المقترح:** **Supabase** (Postgres + Storage) — حسابات، صور توثيق الأنشطة، مزامنة، ونسخ احتياطي. المستخدم بصدد الاشتراك فيه.

## ٧. خريطة الملفات المهمة

| المجال | المسار |
|---|---|
| الباقات والتسعير | `src/data/plans.ts` |
| حالة الاشتراك (محلي) | `src/lib/subscriptionStore.ts` |
| التسجيل + الترحيب السينمائي | `src/pages/Register.tsx`, `src/components/WelcomeCinematic.tsx` |
| خلفية التسجيل 3D | `src/components/three/RegisterScene3D.tsx` |
| لوحة التحكم | `src/pages/Dashboard.tsx` + `src/components/dashboard/*` |
| برامج الأنشطة (بيانات) | `src/data/activityPrograms.ts` (٥ مجالات، برامج ابتدائي/متوسط) |
| رحلة الأسابيع | `src/pages/WeeksJourney.tsx` |
| الأدوات (تقرير برنامج، موزّع حصص ١٠٪، سجل الأثر...) | `src/pages/ProgramReport.tsx`, `ActivityRatio.tsx`, `ActivityLog.tsx` |
| النشر | `scripts/deploy.mjs`, `vite.config.ts` |

## ٨. ملاحظات متفرقة

- الروابط بالعربية مُرمّزة في الإنتاج؛ التحقق يكون عبر النافذة الخفية لتجاوز الكاش.
- تحذيرات LF/CRLF على ويندوز طبيعية (لا تؤثر).
- بعض الحزم كبيرة (three.js، pdf، mammoth) — قابلة لتحسين التقسيم (code-splitting) لاحقًا.
