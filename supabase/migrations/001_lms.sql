-- Olympus LMS MVP: run in Supabase Dashboard > SQL Editor.
-- Bank transfer now (Paystack later). Classes: Zoom + PDFs (placeholders seeded below).

-- 1) Profiles (role: student/admin). One row per auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz default now()
);

-- 2) Enrollments: student requests access after WhatsApp + bank transfer.
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  package text not null check (package in ('Starter','Premium','Elite')),
  class_type text not null default 'Online' check (class_type in ('Online','Physical')),
  status text not null default 'pending' check (status in ('pending','paid','active','suspended')),
  receipt_ref text,
  created_at timestamptz default now()
);
create index if not exists enrollments_user_idx on public.enrollments(user_id);
create index if not exists enrollments_status_idx on public.enrollments(status);

-- 3) Lessons: Zoom links + PDFs per package (placeholders — replace url/notes).
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  package text not null check (package in ('Starter','Premium','Elite','General')),
  title text not null,
  kind text not null default 'zoom' check (kind in ('zoom','pdf','note')),
  url text,
  notes text,
  sort int default 0,
  created_at timestamptz default now()
);

-- Placeholder lessons (edit in admin dashboard later)
insert into public.lessons (package, title, kind, url, notes, sort) values
  ('General','Welcome + How classes work','note',null,'Live classes hold on Zoom. PDFs are attached per module. After bank transfer, send your receipt on WhatsApp (09041004544) and admin activates you.',0),
  ('Starter','Starter Week 1 — Forex Fundamentals (Zoom)','zoom','https://zoom.us/j/0000000000','Placeholder Zoom link. Meeting ID + passcode will be posted here before class.',1),
  ('Starter','Starter PDFs — Pairs, Pips & Sessions','pdf','#','Placeholder PDF. Upload final PDF and paste link here.',2),
  ('Premium','Premium — Technical Analysis (Zoom)','zoom','https://zoom.us/j/0000000000','Placeholder Zoom link for Premium technical sessions.',1),
  ('Premium','Premium PDFs — Candlesticks + Indicators','pdf','#','Placeholder PDF pack.',2),
  ('Elite','Elite — Strategy + Psychology (Zoom)','zoom','https://zoom.us/j/0000000000','Placeholder Zoom link for Elite strategy sessions.',1),
  ('Elite','Elite PDFs — Trading Plan Pack','pdf','#','Placeholder PDF pack.',2)
on conflict do nothing;

-- 4) RLS
alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.lessons enable row level security;

-- Profiles: users read/update own; admins read all.
drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles for all using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- Enrollments: students manage own; admins manage all.
drop policy if exists "enrollments own" on public.enrollments;
create policy "enrollments own" on public.enrollments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "enrollments admin all" on public.enrollments;
create policy "enrollments admin all" on public.enrollments for all using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- Lessons: readable by any logged-in user (app filters by active enrollment); admins manage.
drop policy if exists "lessons auth read" on public.lessons;
create policy "lessons auth read" on public.lessons for select using (auth.role() = 'authenticated');
drop policy if exists "lessons admin all" on public.lessons;
create policy "lessons admin all" on public.lessons for all using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- 5) Make yourself admin (after signing up once via student.html):
-- insert into public.admin_users (user_id) values ('PASTE-YOUR-AUTH-USER-ID');
-- Find your id: Supabase Dashboard > Authentication > Users.
