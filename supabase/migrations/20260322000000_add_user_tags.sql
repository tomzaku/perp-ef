-- Custom tags (tag definitions per user)
create table if not exists user_tag_names (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz default now() not null,
  unique (user_id, name)
);

-- Question-tag assignments
create table if not exists user_question_tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  tag_name text not null,
  created_at timestamptz default now() not null,
  unique (user_id, question_id, tag_name)
);

-- Row Level Security
alter table user_tag_names enable row level security;
alter table user_question_tags enable row level security;

create policy "Users can read own tag names" on user_tag_names
  for select using (auth.uid() = user_id);
create policy "Users can insert own tag names" on user_tag_names
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tag names" on user_tag_names
  for update using (auth.uid() = user_id);
create policy "Users can delete own tag names" on user_tag_names
  for delete using (auth.uid() = user_id);

create policy "Users can read own question tags" on user_question_tags
  for select using (auth.uid() = user_id);
create policy "Users can insert own question tags" on user_question_tags
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own question tags" on user_question_tags
  for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_user_tag_names_user_id on user_tag_names(user_id);
create index if not exists idx_user_question_tags_user_id on user_question_tags(user_id);
create index if not exists idx_user_question_tags_tag on user_question_tags(user_id, tag_name);
