-- Olympus LMS: quizzes. Run in Supabase Dashboard > SQL Editor (after 001, 002).

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  package text not null check (package in ('Starter','Premium','Elite','General')),
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score int not null default 0,
  total int not null default 0,
  created_at timestamptz default now()
);
create index if not exists attempts_user_idx on public.attempts(user_id);
create index if not exists attempts_quiz_idx on public.attempts(quiz_id);

alter table public.quizzes enable row level security;
alter table public.attempts enable row level security;

drop policy if exists "quizzes auth read" on public.quizzes;
create policy "quizzes auth read" on public.quizzes
  for select using (auth.role() = 'authenticated');

drop policy if exists "quizzes admin all" on public.quizzes;
create policy "quizzes admin all" on public.quizzes
  for all using (
    exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "attempts own" on public.attempts;
create policy "attempts own" on public.attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "attempts admin all" on public.attempts;
create policy "attempts admin all" on public.attempts
  for all using (
    exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

-- Sample quiz (Starter basics)
insert into public.quizzes (package, title, questions) values
  ('General','Forex Basics Check',
   '[{"q":"What is a pip?","options":["A unit of price movement","A type of account","A trading session","A broker fee"],"answer":0},
     {"q":"Which session overlaps with London for high volatility?","options":["Sydney","Tokyo","New York","Weekend"],"answer":2}]'::jsonb)
on conflict do nothing;
