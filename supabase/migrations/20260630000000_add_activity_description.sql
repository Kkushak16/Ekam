-- Add activity_description column to public.users table
alter table public.users add column if not exists activity_description text;
