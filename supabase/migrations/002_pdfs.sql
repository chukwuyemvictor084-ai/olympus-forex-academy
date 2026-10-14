-- Olympus LMS: PDF uploads. Run in Supabase Dashboard > SQL Editor (after 001_lms.sql).
-- Creates public bucket lesson-pdfs + policies (public read, admin write).

insert into storage.buckets (id, name, public)
values ('lesson-pdfs', 'lesson-pdfs', true)
on conflict (id) do nothing;

drop policy if exists "pdfs public read" on storage.objects;
create policy "pdfs public read" on storage.objects
  for select using (bucket_id = 'lesson-pdfs');

drop policy if exists "pdfs admin write" on storage.objects;
create policy "pdfs admin write" on storage.objects
  for insert with check (
    bucket_id = 'lesson-pdfs' and
    exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "pdfs admin update" on storage.objects;
create policy "pdfs admin update" on storage.objects
  for update using (
    bucket_id = 'lesson-pdfs' and
    exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "pdfs admin delete" on storage.objects;
create policy "pdfs admin delete" on storage.objects
  for delete using (
    bucket_id = 'lesson-pdfs' and
    exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );
