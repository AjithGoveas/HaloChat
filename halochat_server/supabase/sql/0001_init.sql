-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Users are often managed by Supabase Auth; for simplicity we store user_id (text) coming from client.

-- Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Room members
create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id text not null,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

-- Messages (DM or room)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  recipient text,                 -- DM recipient (nullable when room_id is set)
  room_id uuid references public.rooms(id),
  text text not null,
  status text not null default 'sent', -- sent | delivered | read
  created_at timestamptz not null default now(),
  constraint dm_or_room CHECK (
    (recipient is not null and room_id is null)
    or
    (recipient is null and room_id is not null)
  )
);

-- Read receipts (optional)
create table if not exists public.read_receipts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  reader text not null,
  read_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_messages_dm on public.messages (sender, recipient, created_at desc);
create index if not exists idx_messages_room on public.messages (room_id, created_at desc);
create index if not exists idx_receipts_message on public.read_receipts (message_id);

-- Realtime publication: enable 'public' schema in Supabase dashboard (Database > Replication > Publications > supabase_realtime)
-- Optionally:
-- alter publication supabase_realtime add table public.messages;
-- alter publication supabase_realtime add table public.read_receipts;
