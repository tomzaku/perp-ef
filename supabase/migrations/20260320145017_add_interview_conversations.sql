-- Interview conversations
create table if not exists interview_conversations (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id text not null,
  title text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (user_id, id)
);

alter table interview_conversations enable row level security;

create policy "Users can read own conversations" on interview_conversations
  for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on interview_conversations
  for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations" on interview_conversations
  for update using (auth.uid() = user_id);
create policy "Users can delete own conversations" on interview_conversations
  for delete using (auth.uid() = user_id);

create index if not exists idx_interview_conversations_user_question
  on interview_conversations(user_id, question_id);
