-- Fix: creating an announcement failed with `column reference "id" is ambiguous`.
--
-- The old trigger (on_announcement_post -> insert_notification) had three problems:
--   1. `ui.user_id = id` -- `id` could be post_categories.id or user_interests.id (the error).
--   2. It ran right after the posts insert, before the API adds the post's categories,
--      so the interest check could never find anything.
--   3. Had it matched, it would have notified every user, not only the interested ones.
--
-- New behaviour: when an announcement gets a category, every user interested in that
-- category is notified once (not the author, never twice for the same post).
--
-- Run once in Supabase -> SQL Editor (project dcqzspcxgwcbrogcxyhm). Safe to run again.

create or replace function public.notify_announcement_followers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, post_id, message, is_read)
  select distinct
    ui.user_id,
    p.id,
    'ประกาศใหม่: ' || coalesce(nullif(p.title, ''), left(p.content, 80)),
    false
  from public.posts as p
  join public.user_interests as ui on ui.category_id = new.category_id
  where p.id = new.post_id
    and p.is_important
    and ui.user_id <> p.user_id
    and not exists (
      select 1 from public.notifications as n
      where n.post_id = p.id and n.user_id = ui.user_id
    );
  return new;
end;
$$;

-- Notify from post_categories, where the categories actually arrive.
drop trigger if exists on_announcement_post on public.posts;
drop trigger if exists on_announcement_category on public.post_categories;
create trigger on_announcement_category
  after insert on public.post_categories
  for each row execute function public.notify_announcement_followers();

-- Check: should show on_announcement_category on post_categories, and nothing named on_announcement_post.
select tgname as trigger_name, tgrelid::regclass as on_table
from pg_trigger
where tgname in ('on_announcement_post', 'on_announcement_category');
