-- Security: the browser only uses Supabase for login and realtime broadcast; all data goes
-- through the API, which uses the service role. So the public (anon) and signed-in
-- (authenticated) roles need no direct access to tables, views or functions.
-- Before this, anyone with the anon key (it ships in the web page) could read every
-- report and every user's notifications. Run once in Supabase -> SQL Editor. Safe to rerun.

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from anon, authenticated;

-- Keep new tables/functions closed too (Supabase grants them to anon by default).
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- Row level security as a second lock (the API's service role bypasses it).
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Old announcement trigger function, replaced by notify_announcement_followers().
drop function if exists public.insert_notification();

notify pgrst, 'reload schema';
