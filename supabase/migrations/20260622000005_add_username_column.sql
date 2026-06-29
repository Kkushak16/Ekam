-- Add username column to public.users
alter table public.users add column if not exists username text;

-- Update the handle_new_user trigger function to include username
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, username, avatar_url, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    'offline'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Backfill usernames for existing users from auth.users
update public.users u
set username = a.raw_user_meta_data->>'username'
from auth.users a
where u.id = a.id;
