-- Enable moddatetime extension in the extensions schema
create extension if not exists moddatetime schema extensions;

-- 1. Alter public.users schema
alter table public.users add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Trigger to update updated_at on users update
drop trigger if exists handle_users_updated_at on public.users;
create trigger handle_users_updated_at before update on public.users
  for each row execute procedure extensions.moddatetime(updated_at);

-- 2. Alter public.rooms schema to add room type
alter table public.rooms add column if not exists type text default 'group' check (type in ('group', 'dm')) not null;

-- 3. Alter public.messages schema for soft deletes, media uploads, and timestamps
alter table public.messages add column if not exists deleted_at timestamp with time zone;
alter table public.messages add column if not exists media_url text;
alter table public.messages add column if not exists media_type text;
alter table public.messages add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Trigger to update updated_at on messages update
drop trigger if exists handle_messages_updated_at on public.messages;
create trigger handle_messages_updated_at before update on public.messages
  for each row execute procedure extensions.moddatetime(updated_at);

-- 4. Overwrite trigger handle_new_user() with robust exception handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, avatar_url, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url',
    'offline'
  );
  return new;
exception when others then
  raise warning 'Error syncing user %: %', new.id, SQLERRM;
  return new;
end;
$$ language plpgsql security definer;

-- 5. Harden messages RLS read policy to filter out soft-deleted messages
drop policy if exists "Allow room members to read messages" on public.messages;
create policy "Allow room members to read messages" on public.messages
  for select to authenticated using (
    deleted_at is null
    and
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_id and rm.user_id = auth.uid()
    )
  );
