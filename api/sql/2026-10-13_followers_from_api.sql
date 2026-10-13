-- Notifications for followed categories now come from the API (api/src/followers.ts):
-- every new post in a followed category, not only announcements, with the category's name,
-- and also when a moderator turns an existing post into an announcement.
-- The old trigger only covered announcements at creation, so it is no longer needed.
-- Until this runs, the API sees the trigger's notifications and does not send a second one.
-- Run once in Supabase -> SQL Editor. Safe to run again.

drop trigger if exists on_announcement_category on public.post_categories;
drop trigger if exists on_announcement_post on public.posts;
drop function if exists public.notify_announcement_followers();

-- Check: should return no rows.
select tgname from pg_trigger where tgname in ('on_announcement_category', 'on_announcement_post');
