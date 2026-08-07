import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";

const Register = lazy(() => import("./pages/Register").then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const PrivacyPolicy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/تسجيل" element={<Register />} />
          <Route path="/لوحة-التحكم" element={<Dashboard />} />
          <Route path="/سياسة-الخصوصية" element={<PrivacyPolicy />} />
          <Route path="/الشروط-والأحكام" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
