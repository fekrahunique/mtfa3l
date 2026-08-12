import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { RouteSplash } from "./components/RouteSplash";

const Register = lazy(() => import("./pages/Register").then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const WeeksJourney = lazy(() => import("./pages/WeeksJourney").then((m) => ({ default: m.WeeksJourney })));
const IntroWeek = lazy(() => import("./pages/IntroWeek").then((m) => ({ default: m.IntroWeek })));
const IdeaVault = lazy(() => import("./pages/IdeaVault").then((m) => ({ default: m.IdeaVault })));
const Plan1448 = lazy(() => import("./pages/Plan1448").then((m) => ({ default: m.Plan1448 })));
const PrivacyPolicy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));
const AdminHub = lazy(() => import("./pages/AdminHub").then((m) => ({ default: m.AdminHub })));
const BigGame = lazy(() => import("./pages/BigGame").then((m) => ({ default: m.BigGame })));
const Shifra = lazy(() => import("./pages/Shifra").then((m) => ({ default: m.Shifra })));
const LastChance = lazy(() => import("./pages/LastChance").then((m) => ({ default: m.LastChance })));
const SmartPlanner = lazy(() => import("./pages/SmartPlanner").then((m) => ({ default: m.SmartPlanner })));
const ActivityLog = lazy(() => import("./pages/ActivityLog").then((m) => ({ default: m.ActivityLog })));

const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <RouteSplash />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/تسجيل" element={<Register />} />
          <Route path="/لوحة-التحكم" element={<Dashboard />} />
          <Route path="/الأسابيع" element={<WeeksJourney />} />
          <Route path="/الأسبوع-التمهيدي" element={<IntroWeek />} />
          <Route path="/مستودع-الأفكار" element={<IdeaVault />} />
          <Route path="/خطة-النشاط" element={<Plan1448 />} />
          <Route path="/admin" element={<AdminHub />} />
          <Route path="/بطولة-نشاط" element={<BigGame />} />
          <Route path="/الشفرة" element={<Shifra />} />
          <Route path="/آخر-فرصة" element={<LastChance />} />
          <Route path="/مخطط-النشاط" element={<SmartPlanner />} />
          <Route path="/سجل-النشاط" element={<ActivityLog />} />
          <Route path="/سياسة-الخصوصية" element={<PrivacyPolicy />} />
          <Route path="/الشروط-والأحكام" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
