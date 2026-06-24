-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create public.users table (synced with auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  password_hash text, -- Optional: password_hash is managed by Supabase Auth (auth.users), but included here as requested
  display_name text,
  avatar_url text,
  status text default 'offline' check (status in ('online', 'offline', 'away')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create public.rooms table
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create public.room_members table
create table public.room_members (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'member' check (role in ('member', 'admin')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (room_id, user_id)
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- Create index for querying rooms a user belongs to quickly
create index idx_room_members_user_id on public.room_members(user_id);

-- RLS Policies: users
create policy "Allow public read access to profiles" on public.users
  for select using (true);

create policy "Allow users to update their own profile" on public.users
  for update using (auth.uid() = id);

-- RLS Policies: rooms
create policy "Allow authenticated users to view all rooms" on public.rooms
  for select to authenticated using (true);

create policy "Allow authenticated users to create rooms" on public.rooms
  for insert to authenticated with check (auth.uid() = created_by);

create policy "Allow creators to update their rooms" on public.rooms
  for update to authenticated using (auth.uid() = created_by);

create policy "Allow creators to delete their rooms" on public.rooms
  for delete to authenticated using (auth.uid() = created_by);

-- RLS Policies: room_members
create policy "Allow authenticated users to view room memberships" on public.room_members
  for select to authenticated using (true);

-- Only room creators or room admins can add members, or a user can join themselves
create policy "Allow admins, creators, or self to add members" on public.room_members
  for insert to authenticated with check (
    (auth.uid() = user_id)
    or
    exists (
      select 1 from public.rooms r
      where r.id = room_id and r.created_by = auth.uid()
    )
    or
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_id and rm.user_id = auth.uid() and rm.role = 'admin'
    )
  );

-- Only room creators, room admins can remove members, or a user can leave themselves
create policy "Allow admins, creators, or self to remove members" on public.room_members
  for delete to authenticated using (
    (auth.uid() = user_id)
    or
    exists (
      select 1 from public.rooms r
      where r.id = room_id and r.created_by = auth.uid()
    )
    or
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_id and rm.user_id = auth.uid() and rm.role = 'admin'
    )
  );

-- Postgres trigger function to sync auth.users to public.users on signup
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
end;
$$ language plpgsql security definer;

-- Set up the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
