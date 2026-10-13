-- Hide posts instead of deleting them.
-- A deleted post takes its reports (and the reporters' notifications) with it, or fails
-- on the foreign key, so moderators could not close the reports. A hidden post keeps
-- them, disappears from the feed, and stays visible to its author with the reason.
--
-- Run once in Supabase -> SQL Editor (project dcqzspcxgwcbrogcxyhm). Safe to run again.

alter table public.posts add column if not exists is_hidden     boolean not null default false;
alter table public.posts add column if not exists hidden_at     timestamptz;
alter table public.posts add column if not exists hidden_by     uuid;
alter table public.posts add column if not exists hidden_reason text;

create index if not exists posts_hidden_idx on public.posts (id) where is_hidden;

-- Make the API (PostgREST) see the new columns right away.
notify pgrst, 'reload schema';

-- Check: should list the four columns.
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'posts' and column_name like '%hidden%'
order by column_name;
