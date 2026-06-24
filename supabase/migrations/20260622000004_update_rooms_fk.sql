-- Alter rooms table foreign key constraint for created_by to point to auth.users(id)
alter table public.rooms drop constraint if exists rooms_created_by_fkey;
alter table public.rooms add constraint rooms_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
