-- Moderation log: one row per moderator action, so the history page keeps every decision
-- (reports.reviewed_by only remembers the latest one per report).
-- Written by the API only (service role); closed to anon/authenticated like every other table.
-- Run once in Supabase -> SQL Editor (project dcqzspcxgwcbrogcxyhm). Safe to run again.

create table if not exists public.moderation_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references public.users(id) on delete cascade,
  action      text not null,         -- report_reviewed, report_dismissed, report_reopened, post_hidden, post_unhidden,
                                     -- post_edited, post_deleted, comment_deleted, category_created, category_updated,
                                     -- category_deleted, role_granted, role_revoked
  post_id     uuid,                  -- no foreign key: the entry must outlive a deleted post
  post_title  text,                  -- kept for the same reason
  target_id   uuid,                  -- the comment, category or user the action was about
  detail      text,                  -- reason, category name, user name, number of reports
  created_at  timestamptz not null default now()
);

create index if not exists moderation_log_created_idx on public.moderation_log (created_at desc);

revoke all on public.moderation_log from anon, authenticated;
alter table public.moderation_log enable row level security;

notify pgrst, 'reload schema';

-- Check: should return one row named moderation_log.
select table_name from information_schema.tables where table_schema = 'public' and table_name = 'moderation_log';
