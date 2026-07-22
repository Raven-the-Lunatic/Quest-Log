-- Run this once in your existing Supabase project's SQL Editor to add Timeline support
-- to a campaign_data table created before this feature existed. New projects don't need
-- this — schema.sql already includes the column.
alter table public.campaign_data
  add column if not exists timeline jsonb not null default '[]'::jsonb;
