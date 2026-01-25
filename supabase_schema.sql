
-- 1. ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. USERS TABLE
-- Stores user profiles linked to Supabase Auth
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  referral_code text unique,
  role text default 'student',
  points numeric default 0,
  courses_completed numeric default 0,
  is_mentor boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Security Policies for Users
alter table public.users enable row level security;
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can insert their own profile." on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

-- 3. USER PROGRESS TABLE
-- Tracks which lessons a user has completed
create table public.user_progress (
  user_id uuid references public.users not null,
  lesson_id text not null,
  course_id text,
  status text check (status in ('started', 'completed')),
  quiz_score numeric default 0,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, lesson_id)
);

-- RLS: Security Policies for Progress
alter table public.user_progress enable row level security;
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can modify own progress" on public.user_progress for update using (auth.uid() = user_id);

-- 4. REFERRAL TREE TABLE
-- Tracks who referred whom
create table public.referral_tree (
  user_id uuid references public.users not null primary key,
  referrer_id uuid references public.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Security Policies for Referrals
alter table public.referral_tree enable row level security;
create policy "Read referrals" on public.referral_tree for select using (true);
create policy "Insert referral" on public.referral_tree for insert with check (auth.uid() = user_id);

-- 5. POINTS LOGS TABLE
-- Audit trail for points awarded to users
create table public.points_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  points numeric not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Security Policies for Points
alter table public.points_logs enable row level security;
create policy "View own points logs" on public.points_logs for select using (auth.uid() = user_id);
create policy "Insert points logs" on public.points_logs for insert with check (auth.uid() = user_id);

-- 6. CONTENTS TABLE
-- Caches generated lesson content to save API costs and improve speed
create table public.contents (
  lesson_id text not null,
  type text not null,
  content jsonb,
  created_by uuid references public.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (lesson_id, type)
);

-- RLS: Security Policies for Content
alter table public.contents enable row level security;
create policy "Everyone can read content" on public.contents for select using (true);
create policy "Authenticated users can insert content" on public.contents for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update content" on public.contents for update using (auth.role() = 'authenticated');
