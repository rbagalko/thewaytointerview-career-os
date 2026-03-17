create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  create type experience_level as enum ('entry', 'junior', 'mid', 'senior', 'lead');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type work_mode as enum ('remote', 'hybrid', 'onsite', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type task_status as enum ('todo', 'in_progress', 'done', 'skipped');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type application_status as enum ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type source_status as enum ('queued', 'running', 'success', 'failed', 'partial');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  timezone text default 'UTC',
  resume_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_goals (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  target_role text,
  target_company text,
  salary_goal integer,
  experience_level experience_level not null default 'mid',
  target_domain text,
  current_location text,
  desired_locations text[] not null default '{}',
  target_timeline_days integer default 90,
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_title text,
  years_experience numeric(4,1),
  primary_domain text,
  summary text,
  skills text[] not null default '{}',
  tools text[] not null default '{}',
  certifications text[] not null default '{}',
  proof_of_work_urls text[] not null default '{}',
  preferred_work_modes work_mode[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text,
  file_path text,
  source text not null default 'upload',
  version_no integer not null default 1,
  raw_text text,
  parsed_sections jsonb not null default '{}'::jsonb,
  ats_score numeric(5,2),
  job_target text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  base_url text,
  parser_key text,
  schedule_hours integer not null default 6,
  rate_limit_per_hour integer,
  is_active boolean not null default true,
  last_success_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crawl_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.job_sources(id) on delete set null,
  status source_status not null,
  pages_fetched integer not null default 0,
  jobs_found integer not null default 0,
  jobs_inserted integer not null default 0,
  jobs_updated integer not null default 0,
  error_message text,
  meta jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.job_sources(id) on delete set null,
  external_job_id text,
  canonical_url text unique,
  dedupe_key text unique,
  company text not null,
  role_title text not null,
  department text,
  location text,
  geography text,
  work_mode work_mode not null default 'unknown',
  experience_level experience_level,
  salary_min integer,
  salary_max integer,
  salary_currency text default 'INR',
  salary_range text,
  description_raw text,
  description_normalized text,
  required_skills text[] not null default '{}',
  responsibilities text[] not null default '{}',
  interview_topics text[] not null default '{}',
  education_requirements text[] not null default '{}',
  quality_score numeric(5,2),
  freshness_score numeric(5,2),
  posted_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_skill_requirements (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  skill_name text not null,
  importance text not null default 'medium',
  category text,
  evidence text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  match_score numeric(5,2) not null,
  readiness_score numeric(5,2) not null,
  experience_fit numeric(5,2),
  salary_fit numeric(5,2),
  location_fit numeric(5,2),
  skill_overlap text[] not null default '{}',
  missing_skills text[] not null default '{}',
  next_actions jsonb not null default '[]'::jsonb,
  resume_suggestions jsonb not null default '[]'::jsonb,
  computed_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists public.job_saved (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  resume_id uuid references public.resumes(id) on delete set null,
  company text not null,
  role text not null,
  status application_status not null default 'saved',
  source text,
  salary_range text,
  applied_date date,
  next_action_date date,
  stage_name text,
  notes text,
  position_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null,
  event_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.jd_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  company text,
  role text,
  summary text,
  key_skills text[] not null default '{}',
  skill_categories jsonb not null default '{}'::jsonb,
  total_rounds integer,
  rounds jsonb not null default '[]'::jsonb,
  general_tips jsonb not null default '[]'::jsonb,
  interview_rounds_prediction jsonb not null default '[]'::jsonb,
  employer_signals jsonb not null default '[]'::jsonb,
  what_matters_most jsonb not null default '[]'::jsonb,
  prep_48h jsonb not null default '[]'::jsonb,
  prep_2week jsonb not null default '[]'::jsonb,
  geography text,
  job_family text,
  function_area text,
  seniority text,
  confidence_scores jsonb not null default '{}'::jsonb,
  raw_jd text,
  created_at timestamptz not null default now()
);

create table if not exists public.skill_gaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  jd_analysis_id uuid references public.jd_analyses(id) on delete cascade,
  skill_name text not null,
  category text,
  importance text not null default 'medium',
  user_strength text not null default 'unknown',
  gap_score numeric(5,2),
  suggested_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text,
  resource_type text not null,
  url text not null unique,
  skill_tags text[] not null default '{}',
  difficulty text,
  duration_minutes integer,
  popularity_score numeric(5,2),
  relevance_score numeric(5,2),
  quality_score numeric(5,2),
  ranking_score numeric(5,2),
  is_free boolean not null default true,
  is_active boolean not null default true,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prep_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  jd_analysis_id uuid references public.jd_analyses(id) on delete set null,
  role text,
  company text,
  duration_days integer not null default 14,
  start_date date,
  end_date date,
  plan jsonb not null default '[]'::jsonb,
  completed_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prep_tasks (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.prep_roadmaps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_number integer not null,
  title text not null,
  description text,
  task_type text not null,
  skill_tags text[] not null default '{}',
  duration_minutes integer,
  status task_status not null default 'todo',
  resource_id uuid references public.learning_resources(id) on delete set null,
  linked_job_id uuid references public.jobs(id) on delete set null,
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overall_score numeric(5,2) not null,
  skill_coverage_score numeric(5,2),
  proof_of_work_score numeric(5,2),
  resume_fit_score numeric(5,2),
  prep_consistency_score numeric(5,2),
  role_clarity_score numeric(5,2),
  application_hygiene_score numeric(5,2),
  top_gaps text[] not null default '{}',
  next_best_action jsonb not null default '{}'::jsonb,
  source_analysis_id uuid references public.jd_analyses(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.linkedin_optimizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  profile_name text,
  profile_headline text,
  profile_summary text,
  suggested_headline text,
  suggested_summary text,
  keyword_gaps text[] not null default '{}',
  profile_score numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null default 'coming_soon',
  round_type text,
  status text not null default 'disabled',
  score_overall numeric(5,2),
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  engine_name text not null,
  provider text not null,
  prompt_version text not null,
  status text not null,
  latency_ms integer,
  cost_estimate_usd numeric(10,4),
  trace_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key,
  label text not null,
  status text not null,
  audience text not null default 'all',
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_company_role on public.jobs (company, role_title);
create index if not exists idx_jobs_active_created on public.jobs (is_active, created_at desc);
create index if not exists idx_jobs_required_skills on public.jobs using gin (required_skills);
create index if not exists idx_candidate_profiles_skills on public.candidate_profiles using gin (skills);
create index if not exists idx_user_job_matches_user_score on public.user_job_matches (user_id, match_score desc);
create index if not exists idx_job_saved_user on public.job_saved (user_id, created_at desc);
create index if not exists idx_applications_user_status on public.applications (user_id, status, position_order);
create index if not exists idx_jd_analyses_user_created on public.jd_analyses (user_id, created_at desc);
create index if not exists idx_prep_tasks_user_status on public.prep_tasks (user_id, status, day_number);
create index if not exists idx_readiness_user_created on public.readiness_snapshots (user_id, created_at desc);
create index if not exists idx_learning_resources_skill_tags on public.learning_resources using gin (skill_tags);

