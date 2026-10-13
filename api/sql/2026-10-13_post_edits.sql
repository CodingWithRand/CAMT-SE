-- Remember that a post was edited, and by whom, so the "edited" / "edited by a moderator"
-- label survives a reload. Run once in Supabase -> SQL Editor. Safe to run again.
alter table public.posts add column if not exists edited_at timestamptz;
alter table public.posts add column if not exists edited_by uuid;
notify pgrst, 'reload schema';
