-- Progress tracking (completed & bookmarked questions)
create table if not exists user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  type text not null check (type in ('completed', 'bookmarked')),
  created_at timestamptz default now() not null,
  unique (user_id, question_id, type)
);

-- Notes
create table if not exists user_notes (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  content text not null,
  created_at bigint not null,
  primary key (user_id, id)
);

-- Row Level Security
alter table user_progress enable row level security;
alter table user_notes enable row level security;

-- Users can only access their own data
create policy "Users can read own progress" on user_progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on user_progress
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own progress" on user_progress
  for delete using (auth.uid() = user_id);

create policy "Users can read own notes" on user_notes
  for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on user_notes
  for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on user_notes
  for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on user_notes
  for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_user_progress_user_id on user_progress(user_id);
create index if not exists idx_user_notes_user_id_question on user_notes(user_id, question_id);
