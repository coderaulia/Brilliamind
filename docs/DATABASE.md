# Database

Supabase Postgres. RLS on every table. Service role key only in Edge Functions.

---

## Migrations

Files go in `supabase/migrations/YYYYMMDDHHMMSS_name.sql`.
Apply locally: `supabase db push` or `supabase migration up`.

---

## Schema SQL

### Extensions

```sql
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for ILIKE typeahead index
```

### profiles

```sql
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text not null,
  role        text not null default 'learner'
                check (role in ('admin', 'instructor', 'learner')),
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### courses

```sql
create table courses (
  id            uuid primary key default uuid_generate_v4(),
  instructor_id uuid not null references profiles on delete cascade,
  title         text not null,
  slug          text not null unique,
  description   text,
  cover_url     text,
  category      text,
  tags          text[] not null default '{}',
  price         integer not null default 0,   -- cents
  currency      text not null default 'USD',
  status        text not null default 'draft'
                  check (status in ('draft', 'published', 'archived')),
  search_tsv    tsvector,
  created_at    timestamptz not null default now()
);

create index courses_search_idx on courses using gin(search_tsv);
create index courses_title_trgm_idx on courses using gin(title gin_trgm_ops);

-- keep search_tsv current
create or replace function courses_tsv_update()
returns trigger language plpgsql as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');
  return new;
end;
$$;

create trigger courses_tsv_trigger
  before insert or update on courses
  for each row execute function courses_tsv_update();
```

### sections

```sql
create table sections (
  id        uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses on delete cascade,
  title     text not null,
  position  integer not null default 0
);
```

### lessons

```sql
create table lessons (
  id              uuid primary key default uuid_generate_v4(),
  section_id      uuid not null references sections on delete cascade,
  title           text not null,
  type            text not null
                    check (type in ('text', 'video', 'youtube', 'pdf', 'quiz')),
  content_json    jsonb,
  video_url       text,
  pdf_url         text,
  position        integer not null default 0,
  is_free_preview boolean not null default false
);
```

### enrollments

```sql
create table enrollments (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles on delete cascade,
  course_id    uuid not null references courses on delete cascade,
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);
```

### user_progress

```sql
create table user_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles on delete cascade,
  lesson_id    uuid not null references lessons on delete cascade,
  completed    boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);
```

### video_watch_logs

```sql
create table video_watch_logs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles on delete cascade,
  lesson_id     uuid not null references lessons on delete cascade,
  watch_seconds integer not null default 0,
  updated_at    timestamptz not null default now(),
  unique (user_id, lesson_id)
);
```

### quiz_definitions

```sql
create table quiz_definitions (
  id              uuid primary key default uuid_generate_v4(),
  lesson_id       uuid not null references lessons on delete cascade unique,
  schema_json     jsonb not null,
  passing_score   integer not null default 70,  -- percent
  time_limit_sec  integer,                       -- null = no limit
  max_attempts    integer not null default 3
);
```

### quiz_attempts

```sql
create table quiz_attempts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles on delete cascade,
  quiz_id      uuid not null references quiz_definitions on delete cascade,
  score        integer not null,   -- percent
  passed       boolean not null,
  answers_json jsonb not null,
  attempted_at timestamptz not null default now()
);
```

### certificates

```sql
create table certificates (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references profiles on delete cascade,
  course_id uuid not null references courses on delete cascade,
  cert_uuid uuid not null default uuid_generate_v4() unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
```

### discussions

```sql
create table discussions (
  id         uuid primary key default uuid_generate_v4(),
  lesson_id  uuid not null references lessons on delete cascade,
  user_id    uuid not null references profiles on delete cascade,
  parent_id  uuid references discussions on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index discussions_lesson_idx on discussions (lesson_id, created_at);
```

### payments

```sql
create table payments (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles on delete cascade,
  course_id    uuid not null references courses on delete cascade,
  provider     text not null,         -- 'stripe' | 'midtrans'
  provider_ref text not null,
  amount       integer not null,      -- cents
  currency     text not null,
  status       text not null default 'pending'
                 check (status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at      timestamptz
);
```

### media_files

```sql
create table media_files (
  id         uuid primary key default uuid_generate_v4(),
  owner_id   uuid not null references profiles on delete cascade,
  course_id  uuid references courses on delete set null,
  r2_key     text not null unique,
  size_bytes bigint not null,
  mime       text not null,
  created_at timestamptz not null default now()
);
```

---

## Views

### course_progress_view

```sql
create or replace view course_progress_view as
select
  e.user_id,
  e.course_id,
  count(l.id)                                        as total_lessons,
  count(up.id) filter (where up.completed = true)    as completed_lessons,
  round(
    count(up.id) filter (where up.completed = true)::numeric
    / nullif(count(l.id), 0) * 100
  )                                                  as progress_pct,
  e.completed_at is not null                         as course_completed
from enrollments e
join courses c on c.id = e.course_id
join sections s on s.course_id = c.id
join lessons l on l.section_id = s.id
left join user_progress up on up.lesson_id = l.id and up.user_id = e.user_id
group by e.user_id, e.course_id, e.completed_at;
```

---

## RLS Policies

### profiles

```sql
alter table profiles enable row level security;

create policy "users read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users update own profile"
  on profiles for update using (auth.uid() = id);

create policy "admin reads all profiles"
  on profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
```

### courses

```sql
alter table courses enable row level security;

create policy "public read published courses"
  on courses for select using (status = 'published');

create policy "instructors crud own courses"
  on courses for all
  using (instructor_id = auth.uid())
  with check (instructor_id = auth.uid());

create policy "admin read all courses"
  on courses for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
```

### enrollments

```sql
alter table enrollments enable row level security;

create policy "learners read own enrollments"
  on enrollments for select using (user_id = auth.uid());

create policy "learners self-enroll free courses"
  on enrollments for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from courses where id = course_id and price = 0)
  );
```

### user_progress

```sql
alter table user_progress enable row level security;

create policy "learners rw own progress"
  on user_progress for all using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

### quiz_attempts

```sql
alter table quiz_attempts enable row level security;

create policy "learners read own attempts"
  on quiz_attempts for select using (user_id = auth.uid());

-- insert only via Edge Function (service role) to prevent tampering
```

### certificates

```sql
alter table certificates enable row level security;

create policy "learners read own certs"
  on certificates for select using (user_id = auth.uid());

create policy "public verify by cert_uuid"
  on certificates for select using (true);  -- limited columns via view
```

### discussions

```sql
alter table discussions enable row level security;

create policy "enrolled read/insert discussions"
  on discussions for select
  using (
    exists (
      select 1 from lessons l
      join sections s on s.id = l.section_id
      join enrollments e on e.course_id = s.course_id
      where l.id = lesson_id and e.user_id = auth.uid()
    )
  );

create policy "authors edit/delete own discussions"
  on discussions for update using (user_id = auth.uid());

create policy "authors delete own discussions"
  on discussions for delete using (user_id = auth.uid());
```

### payments, media_files

```sql
alter table payments enable row level security;
create policy "users read own payments" on payments for select using (user_id = auth.uid());

alter table media_files enable row level security;
create policy "owners manage own media" on media_files for all using (owner_id = auth.uid());
```

---

## Certificate Trigger

Fires when all lessons complete + required quizzes passed:

```sql
-- Called by Edge Function (service role) after progress update
-- Edge Function checks: course_progress_view.progress_pct = 100
--   and all quiz_attempts for required quizzes have passed = true
-- Then inserts into certificates if not exists
```

Certificate issuance logic lives in an Edge Function, not a DB trigger, to keep
it testable and to send the Resend email in the same transaction.
