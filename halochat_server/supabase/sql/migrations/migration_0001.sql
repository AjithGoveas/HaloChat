-- 1) Extensions (existing)
create extension if not exists pgcrypto;

-- 2) Rooms: add metadata for UX (avatar, privacy, creator)
alter table public.rooms
  add column if not exists avatar_url text,
  add column if not exists is_private boolean not null default false,
  add column if not exists created_by text,
  add column if not exists updated_at timestamptz;

-- 2b) Room members: roles and lifecycle
alter table public.room_members
  add column if not exists role text not null default 'member',   -- member | admin | owner
  add column if not exists left_at timestamptz;

-- 3) Contacts: per-user address book
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,                -- current user (client-provided id)
  contact_user_id text not null,         -- other user (client-provided id)
  alias text,
  is_blocked boolean not null default false,
  is_muted boolean not null default false,
  created_at timestamptz not null default now(),
  unique (owner_id, contact_user_id)
);

-- 4) Messages: unify model and add rich features
-- 4a) Add columns
alter table public.messages
  add column if not exists kind text,                        -- 'dm' | 'room'
  add column if not exists type text not null default 'text',-- 'text' | 'image' | 'file' | 'system'
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz;

-- 4b) Backfill 'kind' based on existing constraint
update public.messages
set kind = case
  when recipient is not null and room_id is null then 'dm'
  when recipient is null and room_id is not null then 'room'
  else null
end
where kind is null;

-- 4c) Strengthen constraint (replace old dm_or_room)
alter table public.messages drop constraint if exists dm_or_room;
alter table public.messages
  add constraint dm_or_room check (
    (kind = 'dm' and recipient is not null and room_id is null)
    or
    (kind = 'room' and room_id is not null and recipient is null)
  );

-- 5) Receipts: normalized delivery/read per recipient
create table if not exists public.receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id text not null,                 -- recipient's client-provided id
  status text not null check (status in ('delivered','read')),
  at timestamptz not null default now(),
  primary key (message_id, user_id, status)
);

-- Keep existing read_receipts for backward compatibility; optionally migrate reads into receipts:
-- insert into public.receipts (message_id, user_id, status, at)
-- select rr.message_id, rr.reader, 'read', rr.read_at
-- from public.read_receipts rr
-- on conflict do nothing;

-- 6) Attachments: media/files linked to messages
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  storage_url text not null,             -- points to object storage
  size_bytes bigint not null,
  mime_type text not null,
  width int,
  height int,
  created_at timestamptz not null default now()
);

-- 7) Sessions: presence + last seen (per device/user)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,                 -- client-provided id
  device_id text,                        -- optional device identifier
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz,
  last_seen_at timestamptz
);

-- 8) Indexes: performance for common queries

-- Chat history (DM pairs)
create index if not exists idx_messages_dm_pair
  on public.messages (sender, recipient, created_at desc)
  where kind = 'dm';

-- DM inbox/history by recipient
create index if not exists idx_messages_dm_recipient
  on public.messages (recipient, created_at desc)
  where kind = 'dm';

-- Room history
create index if not exists idx_messages_room_time
  on public.messages (room_id, created_at desc)
  where kind = 'room';

-- Last message by sender (useful for sent box or chat list derivations)
create index if not exists idx_messages_sender_time
  on public.messages (sender, created_at desc);

-- Receipts lookups and unread aggregation
create index if not exists idx_receipts_msg_user
  on public.receipts (message_id, user_id, status);

-- Contacts by owner
create index if not exists idx_contacts_owner_time
  on public.contacts (owner_id, created_at desc);

-- Room members by user
create index if not exists idx_room_members_user_joined
  on public.room_members (user_id, joined_at);

-- Sessions presence queries
create index if not exists idx_sessions_user_active
  on public.sessions (user_id, disconnected_at);


-- Ensure publication has all relevant tables (messages, receipts, room_members, sessions, attachments if needed)
-- alter publication supabase_realtime add table public.messages;
-- alter publication supabase_realtime add table public.receipts;
-- alter publication supabase_realtime add table public.room_members;
-- alter publication supabase_realtime add table public.sessions;
