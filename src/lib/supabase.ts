/**
 * عميل Supabase — الخلفية السحابية (حسابات، تخزين، مزامنة).
 *
 * المفتاح العام (publishable/anon) آمن في الواجهة بحكم سياسات RLS في Supabase.
 * النشر محلي عبر GitHub Pages، لذا نوفّر قيمة احتياطية في الكود حتى تعمل أي نسخة
 * جديدة بلا ملف .env. المفتاح السري (service_role) لا يدخل الواجهة إطلاقًا.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://swvfiuuvlezqxydzseqo.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_s0N4T_Tk48aIhdrv8KvqlA_Bx_mBKuv";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
