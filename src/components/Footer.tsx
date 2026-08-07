import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-right">
        <div>
          <span className="font-display text-xl text-ink">متفاعل</span>
          <p className="mt-2 max-w-xs text-sm text-ink-faint">
            منصة الأنشطة المدرسية لرواد النشاط في المدارس الحكومية والأهلية.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          <a href="/#benefits" className="hover:text-ink">المزايا</a>
          <a href="/#how-it-works" className="hover:text-ink">كيف تعمل</a>
          <a href="/#faq" className="hover:text-ink">الأسئلة الشائعة</a>
          <Link to="/سياسة-الخصوصية" className="hover:text-ink">سياسة الخصوصية</Link>
          <Link to="/الشروط-والأحكام" className="hover:text-ink">الشروط والأحكام</Link>
        </nav>
      </div>
      <p className="mt-8 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} متفاعل. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
