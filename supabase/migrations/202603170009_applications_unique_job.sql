create unique index if not exists idx_applications_user_job_unique
  on public.applications (user_id, job_id);
