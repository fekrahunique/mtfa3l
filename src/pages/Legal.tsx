import type { ReactNode } from "react";
import { IslandNav } from "../components/IslandNav";
import { Footer } from "../components/Footer";
import { ScrollReveal } from "../components/ScrollReveal";

function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <IslandNav />
      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-24 pt-40">
        <ScrollReveal>
          <h1 className="text-3xl text-ink sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-ink-faint">آخر تحديث: {updated}</p>
          <div className="prose-invert mt-10 space-y-6 text-base leading-relaxed text-ink-muted">{children}</div>
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="سياسة الخصوصية" updated="7 أغسطس 2026">
      <p>
        نشاط منصة موجهة لرواد ورائدات النشاط في المدارس الحكومية والأهلية. نجمع فقط
        البيانات اللازمة لتشغيل الحسابات: اسم المعلم أو المعلمة، البريد الإلكتروني،
        اسم المدرسة، وأسماء الطلاب اللي ترفعها من ملف الإكسل أو الوورد الخاص بك.
      </p>
      <h2 className="text-xl text-ink">بيانات الطلاب</h2>
      <p>
        أسماء الطلاب تُستخدم فقط لتنظيم الأنشطة وعرض القائمة داخل لوحة التحكم، دون
        إنشاء حسابات دخول للطلاب، ولا تُشارك مع أي جهة خارجية. يبقى المعلم أو المعلمة
        المسؤول المباشر عن دقة الأسماء المرفوعة، وله الحق في حذف أي اسم في أي وقت من
        لوحة التحكم.
      </p>
      <h2 className="text-xl text-ink">حقوقك</h2>
      <p>
        يمكنك طلب نسخة من بياناتك أو حذف حسابك بالكامل من خلال التواصل معنا على
        البريد privacy@motafael.sa، وسنستجيب خلال خمسة أيام عمل.
      </p>
    </LegalLayout>
  );
}

export function Terms() {
  return (
    <LegalLayout title="الشروط والأحكام" updated="7 أغسطس 2026">
      <p>
        باستخدامك منصة نشاط، فأنت توافق على استخدامها في الغرض المخصص لها: تنفيذ
        الأنشطة الصفية واللاصفية المعتمدة في المدارس الحكومية والأهلية، ضمن مرحلتي
        الابتدائي والمتوسط.
      </p>
      <h2 className="text-xl text-ink">فترة التجربة المبكرة</h2>
      <p>
        التسجيل متاح حاليًا مجانًا ضمن فترة التجربة المبكرة، وقد تتغير هذه الشروط
        مستقبلًا مع إشعار مسبق لجميع المستخدمين المسجلين.
      </p>
      <h2 className="text-xl text-ink">المسؤولية</h2>
      <p>
        رائد أو رائدة النشاط مسؤول عن دقة البيانات المدخلة وعن ملاءمة الأنشطة
        المنفذة لسياسات مدرسته. نشاط توفر الأدوات والمحتوى، والقرار النهائي
        بتنفيذ النشاط يبقى للمعلم أو المعلمة.
      </p>
    </LegalLayout>
  );
}
