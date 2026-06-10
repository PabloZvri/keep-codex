-- VOID Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Connected accounts (stores OAuth tokens server-side)
create table if not exists connected_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  platform text not null check (platform in ('pinterest', 'arena')),
  platform_user_id text not null,
  access_token text not null,
  refresh_token text,
  expires_at bigint,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, platform)
);

-- Canvas nodes (image cards with positions)
create table if not exists void_nodes (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  platform text not null check (platform in ('pinterest', 'arena')),
  source_id text not null,
  title text,
  image_url text,
  source_url text,
  width integer not null default 220,
  height integer not null default 220,
  position_x float not null default 0,
  position_y float not null default 0,
  group_id uuid references void_groups(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, platform, source_id)
);

-- Canvas groups (colored region overlays)
create table if not exists void_groups (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  label text not null default 'Group',
  color text not null default 'rgba(120,120,120,0.12)',
  position_x float not null default 0,
  position_y float not null default 0,
  width float not null default 400,
  height float not null default 300,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists void_nodes_user_id_idx on void_nodes(user_id);
create index if not exists void_groups_user_id_idx on void_groups(user_id);
create index if not exists connected_accounts_user_id_idx on connected_accounts(user_id);

-- RLS (Row Level Security) — enable and restrict to owning user
alter table void_nodes enable row level security;
alter table void_groups enable row level security;
alter table connected_accounts enable row level security;

-- Policies: only service role can access (API routes use service role key)
-- Application code goes through API routes that enforce auth, so service role is sufficient.
-- If you want RLS with JWT from Supabase auth, configure accordingly.

create policy "service role bypass" on void_nodes using (true);
create policy "service role bypass" on void_groups using (true);
create policy "service role bypass" on connected_accounts using (true);
