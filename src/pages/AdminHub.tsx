import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Robot, ArrowSquareOut, Database, Trash } from "@phosphor-icons/react";
import { ActivityAssistant } from "../components/dashboard/ActivityAssistant";
import { ChallengePlayer, type ChallengeType, type ChallengeContent } from "../activities/ChallengePlayer";
import { loadGames, saveGames, makeGameId, type SavedGame } from "../lib/agentStore";
import { isSubscribed, setSubscribed } from "../lib/subscriptionStore";
import type { BuiltChallenge } from "../lib/agentBuilder";

const ROUTES: { to: string; label: string; note: string }[] = [
  { to: "/", label: "الصفحة الرئيسية", note: "الهيرو + الباقات السينمائية" },
  { to: "/تسجيل", label: "التسجيل", note: "اختيار الباقة → البيانات → المراجعة" },
  { to: "/لوحة-التحكم", label: "لوحة التحكم", note: "الأركان + الأدوات + الوكيل + الفصول + الكبسولة" },
  { to: "/الأسابيع", label: "رحلة الأسابيع", note: "الأسابيع والمناسبات" },
  { to: "/الأسبوع-التمهيدي", label: "الأسبوع التمهيدي", note: "الشاشات الحيّة (ابتدائي/متوسط)" },
  { to: "/مستودع-الأفكار", label: "مستودع الأفكار", note: "حزم التحديات القابلة للّعب" },
  { to: "/خطة-النشاط", label: "خطة النشاط ١٤٤٨", note: "المجالات وعدد الحصص" },
];

const AGENT_PAL = { accent: "#ff9d3d", accentSoft: "#ffd9a8", deep: "#2a1a05" };

/** لوحة تجربة داخلية (آدمن) — للوصول السريع لكل الشاشات وتجربة الوكيل. غير مُدرَجة في التنقّل. */
export function AdminHub() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [games, setGames] = useState<SavedGame[]>(() => loadGames());
  const [playing, setPlaying] = useState<{ title: string; type: ChallengeType; content: ChallengeContent } | null>(null);
  const [storageTick, setStorageTick] = useState(0);
  const [subscribed, setSub] = useState(isSubscribed());

  const storage = useMemo(() => {
    void storageTick;
    let total = 0;
    const rows: { key: string; kb: number }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith("motafael:")) continue;
        const bytes = new Blob([localStorage.getItem(key) ?? ""]).size;
        total += bytes;
        rows.push({ key: key.replace("motafael:", ""), kb: bytes / 1024 });
      }
    } catch { /* تجاهل */ }
    return { totalKb: total / 1024, rows: rows.sort((a, b) => b.kb - a.kb) };
  }, [storageTick, games]);

  function playBuilt(b: BuiltChallenge) { setAssistantOpen(false); setPlaying({ title: b.title, type: b.type, content: b.content }); }
  function saveBuilt(b: BuiltChallenge) {
    setGames((prev) => { const next: SavedGame[] = [...prev, { ...b, id: makeGameId(prev), createdLabel: "لعبة الوكيل" }]; saveGames(next); return next; });
    setStorageTick((n) => n + 1);
  }
  function clearGames() { saveGames([]); setGames([]); setStorageTick((n) => n + 1); }

  return (
    <div className="min-h-screen bg-bg px-4 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-sun-300">🛠️ لوحة تجربة داخلية</span>
          <h1 className="font-display text-3xl sm:text-4xl">جرّب كل شيء من مكان واحد</h1>
          <p className="mt-2 text-ink-muted">روابط سريعة لكل الشاشات + مجرِّب مباشر لوكيل الذكاء الاصطناعي</p>
        </header>

        {/* روابط الشاشات */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r) => (
            <Link key={r.to} to={r.to} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg">{r.label}</h3>
                <ArrowSquareOut weight="bold" className="h-5 w-5 text-ink-faint transition-colors group-hover:text-sun-300" />
              </div>
              <p className="mt-1 text-sm text-ink-muted">{r.note}</p>
            </Link>
          ))}
        </div>

        {/* مجرِّب الوكيل */}
        <section className="mt-10 rounded-2xl border border-sun-400/30 bg-sun-400/[0.06] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-400 text-bg"><Robot weight="fill" className="h-6 w-6" /></span>
              <div>
                <h2 className="font-display text-xl">وكيل الذكاء الاصطناعي</h2>
                <p className="text-sm text-ink-muted">اكتب فكرة أو أرفِق ملفًا → يبني لعبة تُلعب فورًا. جرّبه هنا مباشرة</p>
              </div>
            </div>
            <button onClick={() => setAssistantOpen(true)} className="rounded-full bg-sun-400 px-6 py-3 font-bold text-bg transition-transform hover:scale-[1.03] active:scale-95">
              افتح الوكيل وجرّب ▶
            </button>
          </div>
          {games.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="mb-3 text-sm text-ink-muted">ألعاب محفوظة ({games.length})، تظهر أيضًا في لوحة التحكم:</p>
              <div className="flex flex-wrap gap-2">
                {games.map((g) => (
                  <button key={g.id} onClick={() => setPlaying({ title: g.title, type: g.type, content: g.content })} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-sun-400/50">
                    ▶ {g.title} <span className="text-ink-faint">· {g.engineLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* حالة الاشتراك للتجربة */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl">حالة الاشتراك (تبديل للتجربة)</h2>
              <p className="mt-1 text-sm text-ink-muted">{subscribed ? "مفعّل: كل الأنشطة والأسابيع مفتوحة" : "مطفأ: نشاط واحد فقط في الأسبوع التمهيدي، والباقي مقفل"}</p>
            </div>
            <button onClick={() => { const n = !subscribed; setSubscribed(n); setSub(n); setStorageTick((x) => x + 1); }}
              className={`rounded-full px-6 py-3 font-bold transition-transform hover:scale-[1.03] active:scale-95 ${subscribed ? "bg-emerald-400 text-bg" : "border border-white/20 text-ink"}`}>
              {subscribed ? "مشترك ✓، إلغاء" : "فعّل الاشتراك"}
            </button>
          </div>
        </section>

        {/* التخزين المحلي */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database weight="duotone" className="h-6 w-6 text-sun-300" />
              <div>
                <h2 className="font-display text-xl">التخزين المحلي (متصفّحك فقط)</h2>
                <p className="text-sm text-ink-muted">كل ما يضيفه المعلم يُحفَظ في متصفّحه، لا خادم ولا تخزين سحابي</p>
              </div>
            </div>
            <span className="font-display text-2xl text-sun-300">{storage.totalKb.toFixed(1)} كيلوبايت</span>
          </div>
          {storage.rows.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {storage.rows.map((r) => (
                <li key={r.key} className="flex items-center justify-between border-b border-white/5 py-1.5 text-ink-muted last:border-none">
                  <span dir="ltr" className="font-mono text-xs">{r.key}</span>
                  <span>{r.kb.toFixed(2)} ك.ب</span>
                </li>
              ))}
            </ul>
          )}
          {games.length > 0 && (
            <button onClick={clearGames} className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-ink-muted transition-colors hover:border-red-400/50 hover:text-red-300">
              <Trash weight="bold" className="h-4 w-4" /> امسح ألعاب الوكيل المحفوظة
            </button>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-ink-faint">صفحة داخلية للتجربة، غير مربوطة بالتنقّل العام. تُؤمَّن أو تُزال قبل الإطلاق</p>
      </div>

      <AnimatePresence>
        {assistantOpen && (
          <ActivityAssistant accentBg="bg-sun-400" accentText="text-sun-300" onPlay={playBuilt} onSaveGame={saveBuilt} onClose={() => setAssistantOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {playing && (
          <ChallengePlayer title={playing.title} type={playing.type} content={playing.content} pal={AGENT_PAL} onClose={() => setPlaying(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
