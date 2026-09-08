-- db/schema.sql
-- OAU Lodge — Student Accommodation Search & Management
-- PostgreSQL schema, designed for Neon Postgres.
-- Safe to re-run: drops existing objects first (dev convenience).

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

drop table if exists messages cascade;
drop table if exists conversations cascade;
drop table if exists reports cascade;
drop table if exists inspection_requests cascade;
drop table if exists reviews cascade;
drop table if exists comparison_items cascade;
drop table if exists favourites cascade;
drop table if exists property_facilities cascade;
drop table if exists property_images cascade;
drop table if exists properties cascade;
drop table if exists facilities cascade;
drop table if exists locations cascade;
drop table if exists universities cascade;
drop table if exists users cascade;

drop type if exists user_role cascade;
drop type if exists user_status cascade;
drop type if exists property_status cascade;
drop type if exists price_period cascade;
drop type if exists inspection_status cascade;
drop type if exists report_status cascade;
drop type if exists report_reason cascade;
drop type if exists review_status cascade;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('student', 'landlord', 'agent', 'admin');
create type user_status as enum ('active', 'suspended', 'pending');

create type property_status as enum ('draft', 'pending_review', 'published', 'rejected', 'archived');
create type price_period as enum ('per_session', 'per_year', 'per_semester', 'per_month');

create type inspection_status as enum ('pending', 'confirmed', 'declined', 'completed', 'cancelled');

create type report_reason as enum ('fraudulent', 'inaccurate', 'unavailable', 'inappropriate', 'other');
create type report_status as enum ('open', 'reviewed', 'resolved', 'dismissed');

create type review_status as enum ('pending', 'published', 'rejected');

-- ---------------------------------------------------------------------------
-- Core reference tables
-- ---------------------------------------------------------------------------

create table universities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  short_name    text not null unique,
  city          text not null,
  state         text not null,
  country       text not null default 'Nigeria',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table locations (
  id                  uuid primary key default gen_random_uuid(),
  university_id       uuid not null references universities(id) on delete cascade,
  name                text not null,
  description         text,
  distance_to_campus_km numeric(5,2),
  walk_minutes        integer,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (university_id, name)
);

create index idx_locations_university on locations(university_id);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

create table users (
  id              uuid primary key default gen_random_uuid(),
  role            user_role not null default 'student',
  full_name       text not null,
  email           citext not null unique,
  phone           text,
  password_hash   text not null,
  university_id   uuid references universities(id) on delete set null,
  avatar_url      text,
  agency_name     text,               -- used by agents
  bio             text,
  is_verified     boolean not null default false,
  status          user_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_users_role on users(role);
create index idx_users_university on users(university_id);

-- ---------------------------------------------------------------------------
-- Facilities (lookup)
-- ---------------------------------------------------------------------------

create table facilities (
  id        uuid primary key default gen_random_uuid(),
  name      text not null unique,
  icon      text not null default 'check-circle'
);

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------

create table properties (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references users(id) on delete cascade,
  university_id         uuid not null references universities(id) on delete restrict,
  location_id           uuid not null references locations(id) on delete restrict,
  title                 text not null,
  slug                  text not null unique,
  description           text not null default '',
  property_type         text not null default 'self_contain',
  room_type             text not null default 'self_contain',
  price_amount          numeric(12,2) not null check (price_amount >= 0),
  price_period          price_period not null default 'per_session',
  bedrooms              integer not null default 1,
  bathrooms             integer not null default 1,
  max_occupants         integer not null default 1,
  address_line          text not null,
  latitude              numeric(9,6),
  longitude             numeric(9,6),
  distance_to_campus_km numeric(5,2),
  status                property_status not null default 'draft',
  is_verified           boolean not null default false,
  verification_notes    text,
  is_available          boolean not null default true,
  view_count            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_properties_university on properties(university_id);
create index idx_properties_location on properties(location_id);
create index idx_properties_owner on properties(owner_id);
create index idx_properties_status on properties(status);
create index idx_properties_price on properties(price_amount);
create index idx_properties_search on properties using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(address_line,''))
);

create table property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties(id) on delete cascade,
  url           text not null,
  is_cover      boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_property_images_property on property_images(property_id);

create table property_facilities (
  property_id   uuid not null references properties(id) on delete cascade,
  facility_id   uuid not null references facilities(id) on delete cascade,
  primary key (property_id, facility_id)
);

-- ---------------------------------------------------------------------------
-- Student interactions
-- ---------------------------------------------------------------------------

create table favourites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  property_id   uuid not null references properties(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (user_id, property_id)
);

create index idx_favourites_user on favourites(user_id);

create table comparison_items (
  user_id       uuid not null references users(id) on delete cascade,
  property_id   uuid not null references properties(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table reviews (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  rating        integer not null check (rating between 1 and 5),
  comment       text not null default '',
  status        review_status not null default 'published',
  created_at    timestamptz not null default now(),
  unique (property_id, user_id)
);

create index idx_reviews_property on reviews(property_id);

create table inspection_requests (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references properties(id) on delete cascade,
  student_id      uuid not null references users(id) on delete cascade,
  owner_id        uuid not null references users(id) on delete cascade,
  preferred_date  date not null,
  preferred_time  text not null default 'Afternoon',
  message         text not null default '',
  status          inspection_status not null default 'pending',
  owner_note      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_inspections_property on inspection_requests(property_id);
create index idx_inspections_student on inspection_requests(student_id);
create index idx_inspections_owner on inspection_requests(owner_id);
create index idx_inspections_status on inspection_requests(status);

create table reports (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid references properties(id) on delete cascade,
  reported_by     uuid not null references users(id) on delete cascade,
  reason          report_reason not null default 'other',
  details         text not null default '',
  status          report_status not null default 'open',
  resolved_by     uuid references users(id) on delete set null,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_reports_status on reports(status);
create index idx_reports_property on reports(property_id);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------

create table conversations (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid references properties(id) on delete set null,
  student_id      uuid not null references users(id) on delete cascade,
  owner_id        uuid not null references users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (student_id, owner_id, property_id)
);

create index idx_conversations_student on conversations(student_id);
create index idx_conversations_owner on conversations(owner_id);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id) on delete cascade,
  body            text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index idx_messages_conversation on messages(conversation_id);

commit;
