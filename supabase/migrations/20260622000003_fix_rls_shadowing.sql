-- 1. Fix messages read and write RLS policies
drop policy if exists "Allow room members to read messages" on public.messages;
create policy "Allow room members to read messages" on public.messages
  for select to authenticated using (
    deleted_at is null
    and
    exists (
      select 1 from public.room_members rm
      where rm.room_id = messages.room_id and rm.user_id = auth.uid()
    )
  );

drop policy if exists "Allow room members to insert messages" on public.messages;
create policy "Allow room members to insert messages" on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id
    and
    exists (
      select 1 from public.room_members rm
      where rm.room_id = messages.room_id and rm.user_id = auth.uid()
    )
  );

-- 2. Fix room_members insert and delete policies
drop policy if exists "Allow admins, creators, or self to add members" on public.room_members;
create policy "Allow admins, creators, or self to add members" on public.room_members
  for insert to authenticated with check (
    (auth.uid() = user_id)
    or
    exists (
      select 1 from public.rooms r
      where r.id = room_members.room_id and r.created_by = auth.uid()
    )
    or
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id and rm.user_id = auth.uid() and rm.role = 'admin'
    )
  );

drop policy if exists "Allow admins, creators, or self to remove members" on public.room_members;
create policy "Allow admins, creators, or self to remove members" on public.room_members
  for delete to authenticated using (
    (auth.uid() = user_id)
    or
    exists (
      select 1 from public.rooms r
      where r.id = room_members.room_id and r.created_by = auth.uid()
    )
    or
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id and rm.user_id = auth.uid() and rm.role = 'admin'
    )
  );

-- 3. Fix message_status read policy
drop policy if exists "Allow room members to view message status receipts" on public.message_status;
create policy "Allow room members to view message status receipts" on public.message_status
  for select to authenticated using (
    exists (
      select 1 from public.room_members rm
      join public.messages m on m.room_id = rm.room_id
      where m.id = message_status.message_id and rm.user_id = auth.uid()
    )
  );
