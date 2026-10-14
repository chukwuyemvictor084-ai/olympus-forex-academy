-- Olympus LMS: remove duplicate seed rows + prevent future dupes.
-- Run in Supabase Dashboard > SQL Editor (after 001, 002, 003).

-- Lessons: keep earliest row per (package, title)
delete from public.lessons a using public.lessons b
where a.ctid > b.ctid and a.package = b.package and a.title = b.title;

alter table public.lessons
  drop constraint if exists lessons_unique;
alter table public.lessons
  add constraint lessons_unique unique (package, title);

-- Quizzes: keep earliest row per (package, title)
delete from public.quizzes a using public.quizzes b
where a.ctid > b.ctid and a.package = b.package and a.title = b.title;

alter table public.quizzes
  drop constraint if exists quizzes_unique;
alter table public.quizzes
  add constraint quizzes_unique unique (package, title);
