alter table public.profiles enable row level security;
alter table public.career_goals enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.user_job_matches enable row level security;
alter table public.job_saved enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.jd_analyses enable row level security;
alter table public.skill_gaps enable row level security;
alter table public.prep_roadmaps enable row level security;
alter table public.prep_tasks enable row level security;
alter table public.readiness_snapshots enable row level security;
alter table public.linkedin_optimizations enable row level security;
alter table public.mock_interviews enable row level security;

drop policy if exists "users_manage_own_profile" on public.profiles;
create policy "users_manage_own_profile"
  on public.profiles
  for all
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "users_manage_own_career_goals" on public.career_goals;
create policy "users_manage_own_career_goals"
  on public.career_goals
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_manage_own_candidate_profile" on public.candidate_profiles;
create policy "users_manage_own_candidate_profile"
  on public.candidate_profiles
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_manage_own_resumes" on public.resumes;
create policy "users_manage_own_resumes"
  on public.resumes
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_read_own_job_matches" on public.user_job_matches;
create policy "users_read_own_job_matches"
  on public.user_job_matches
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "users_manage_own_saved_jobs" on public.job_saved;
create policy "users_manage_own_saved_jobs"
  on public.job_saved
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_manage_own_applications" on public.applications;
create policy "users_manage_own_applications"
  on public.applications
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_read_events_for_owned_applications" on public.application_events;
create policy "users_read_events_for_owned_applications"
  on public.application_events
  for select
  using (
    exists (
      select 1
      from public.applications
      where public.applications.id = application_events.application_id
        and public.applications.user_id = (select auth.uid())
    )
  );

drop policy if exists "users_manage_own_jd_analyses" on public.jd_analyses;
create policy "users_manage_own_jd_analyses"
  on public.jd_analyses
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_read_own_skill_gaps" on public.skill_gaps;
create policy "users_read_own_skill_gaps"
  on public.skill_gaps
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "users_manage_own_roadmaps" on public.prep_roadmaps;
create policy "users_manage_own_roadmaps"
  on public.prep_roadmaps
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_manage_own_tasks" on public.prep_tasks;
create policy "users_manage_own_tasks"
  on public.prep_tasks
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_read_own_readiness" on public.readiness_snapshots;
create policy "users_read_own_readiness"
  on public.readiness_snapshots
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "users_manage_own_linkedin_optimizations" on public.linkedin_optimizations;
create policy "users_manage_own_linkedin_optimizations"
  on public.linkedin_optimizations
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_read_own_mock_interviews" on public.mock_interviews;
create policy "users_read_own_mock_interviews"
  on public.mock_interviews
  for select
  using ((select auth.uid()) = user_id);

alter table public.jobs enable row level security;
alter table public.job_sources enable row level security;
alter table public.crawl_logs enable row level security;
alter table public.learning_resources enable row level security;
alter table public.feature_flags enable row level security;

drop policy if exists "authenticated_users_read_jobs" on public.jobs;
create policy "authenticated_users_read_jobs"
  on public.jobs
  for select
  using ((select auth.role()) = 'authenticated');

drop policy if exists "authenticated_users_read_resources" on public.learning_resources;
create policy "authenticated_users_read_resources"
  on public.learning_resources
  for select
  using ((select auth.role()) = 'authenticated');

drop policy if exists "authenticated_users_read_flags" on public.feature_flags;
create policy "authenticated_users_read_flags"
  on public.feature_flags
  for select
  using ((select auth.role()) = 'authenticated');

