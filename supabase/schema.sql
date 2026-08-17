-- ══════════════════════════════════════════════════════════════════
--  منصة «نشاط» — مخطّط قاعدة البيانات (Supabase / Postgres)
--  شغّل هذا الملف مرّة واحدة في: لوحة Supabase → SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════════

-- جدول ملفّات الروّاد: صفّ واحد لكل حساب، يحمل كامل حالة التطبيق كوثيقة JSON.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  app_state   jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- تفعيل أمان مستوى الصف: كل رائد يرى ويعدّل صفّه فقط.
alter table public.profiles enable row level security;

-- سياسات الوصول (idempotent: نحذف ثم ننشئ).
drop policy if exists "read own profile"   on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;

create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
