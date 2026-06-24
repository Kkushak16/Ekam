-- Create public.messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete set null not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  edited_at timestamp with time zone
);

-- Create public.message_status table for delivered/read receipts
create table public.message_status (
  message_id uuid references public.messages(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  status text not null check (status in ('delivered', 'read')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (message_id, user_id)
);

-- Enable Row Level Security (RLS)
alter table public.messages enable row level security;
alter table public.message_status enable row level security;

-- Create high-performance index for fetching messages in chronological order inside a room
create index idx_messages_room_id_created_at on public.messages (room_id, created_at desc);

-- RLS Policies: messages
create policy "Allow room members to read messages" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_id and rm.user_id = auth.uid()
    )
  );

create policy "Allow room members to insert messages" on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id
    and
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_id and rm.user_id = auth.uid()
    )
  );

create policy "Allow authors to update their own messages" on public.messages
  for update to authenticated using (
    auth.uid() = sender_id
  ) with check (
    auth.uid() = sender_id
  );

create policy "Allow authors to delete their own messages" on public.messages
  for delete to authenticated using (
    auth.uid() = sender_id
  );

-- RLS Policies: message_status
create policy "Allow room members to view message status receipts" on public.message_status
  for select to authenticated using (
    exists (
      select 1 from public.room_members rm
      join public.messages m on m.room_id = rm.room_id
      where m.id = message_id and rm.user_id = auth.uid()
    )
  );

create policy "Allow users to manage their own message status receipts" on public.message_status
  for all to authenticated using (
    auth.uid() = user_id
  ) with check (
    auth.uid() = user_id
  );
