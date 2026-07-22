-- Quest Log — Cloud Sync schema
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query) after
-- creating the project. Auth (magic link) needs no setup here — it's built into Supabase.

-- One row per signed-in user, mirroring the shape already used in localStorage
-- (STORAGE_KEY = "questlog-notes-v2" in src/QuestLog.jsx), so the sync logic is a
-- near-drop-in swap for the existing persist()/load code rather than a data model rewrite.
create table public.campaign_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  categories jsonb not null default '[]'::jsonb,
  notes jsonb not null default '{}'::jsonb,
  theme text not null default 'purple',
  timeline jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.campaign_data enable row level security;

create policy "Users can view their own campaign data"
  on public.campaign_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own campaign data"
  on public.campaign_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own campaign data"
  on public.campaign_data for update
  using (auth.uid() = user_id);

-- Premium entitlement — written ONLY by the Stripe webhook function, which uses the
-- service role key (server-side only, bypasses RLS). No insert/update policy is granted
-- to regular users below, so a signed-in user cannot set their own is_premium = true no
-- matter what the client sends. This is what makes it real verification instead of the
-- honor-system `?upgraded=1` flag the free-tier PDF export / party sharing still use.
create table public.premium_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_premium boolean not null default false,
  stripe_customer_id text,
  plan text, -- 'monthly' | 'yearly' | 'lifetime'
  updated_at timestamptz not null default now()
);

alter table public.premium_status enable row level security;

create policy "Users can view their own premium status"
  on public.premium_status for select
  using (auth.uid() = user_id);
