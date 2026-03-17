create or replace function public.refresh_readiness_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.ensure_profile_for_current_user();
  v_target_role text := '';
  v_target_company text := '';
  v_preferred_locations text[] := '{}'::text[];
  v_user_skills text[] := '{}'::text[];
  v_target_skills text[] := '{}'::text[];
  v_top_gaps text[] := '{}'::text[];
  v_skill_coverage numeric := 0;
  v_proof_of_work numeric := 0;
  v_resume_fit numeric := 0;
  v_prep_consistency numeric := 0;
  v_role_clarity numeric := 0;
  v_application_hygiene numeric := 0;
  v_overall numeric := 0;
  v_resume_score numeric := 0;
  v_total_tasks integer := 0;
  v_done_tasks integer := 0;
  v_total_apps integer := 0;
  v_actionable_apps integer := 0;
  v_next_best_action jsonb := '{}'::jsonb;
  v_snapshot_id uuid;
begin
  select
    coalesce(cg.target_role, ''),
    coalesce(cg.target_company, ''),
    coalesce(cg.desired_locations, '{}'::text[]),
    coalesce(
      array(
        select distinct lower(trim(skill))
        from unnest(coalesce(cp.skills, '{}'::text[]) || coalesce(cp.tools, '{}'::text[])) as skill
        where trim(skill) <> ''
      ),
      '{}'::text[]
    )
  into
    v_target_role,
    v_target_company,
    v_preferred_locations,
    v_user_skills
  from public.candidate_profiles cp
  full join public.career_goals cg on cg.user_id = cp.user_id
  where coalesce(cp.user_id, cg.user_id) = v_user_id;

  v_target_role := coalesce(v_target_role, '');
  v_target_company := coalesce(v_target_company, '');
  v_preferred_locations := coalesce(v_preferred_locations, '{}'::text[]);
  v_user_skills := coalesce(v_user_skills, '{}'::text[]);

  select
    coalesce(array_agg(distinct lower(trim(skill))), '{}'::text[])
  into v_target_skills
  from (
    select skill
    from public.jobs j
    cross join lateral unnest(coalesce(j.required_skills, '{}'::text[])) as skill
    where j.is_active
      and trim(skill) <> ''
      and (
        v_target_role = ''
        or j.role_title ilike '%' || v_target_role || '%'
        or coalesce(j.department, '') ilike '%' || v_target_role || '%'
      )
    limit 200
  ) matching_skills;

  if coalesce(array_length(v_target_skills, 1), 0) = 0 then
    select
      coalesce(array_agg(distinct lower(trim(skill))), '{}'::text[])
    into v_target_skills
    from (
      select skill
      from public.jobs j
      cross join lateral unnest(coalesce(j.required_skills, '{}'::text[])) as skill
      where j.is_active
        and trim(skill) <> ''
      order by j.created_at desc
      limit 200
    ) fallback_skills;
  end if;

  if coalesce(array_length(v_target_skills, 1), 0) = 0 then
    v_skill_coverage := least(100, 30 + coalesce(array_length(v_user_skills, 1), 0) * 8);
  else
    select
      round(
        (
          count(*)::numeric
          / greatest(coalesce(array_length(v_target_skills, 1), 0), 1)
        ) * 100,
        2
      )
    into v_skill_coverage
    from unnest(v_target_skills) as skill
    where skill = any(v_user_skills);
  end if;

  select
    coalesce(least(100, array_length(proof_of_work_urls, 1) * 25), 0)
  into v_proof_of_work
  from public.candidate_profiles
  where user_id = v_user_id;

  select
    coalesce(max(ats_score), 0)
  into v_resume_score
  from public.resumes
  where user_id = v_user_id;

  v_resume_fit := round(greatest(v_resume_score, v_skill_coverage * 0.75), 2);

  select
    count(*),
    count(*) filter (where status = 'done')
  into
    v_total_tasks,
    v_done_tasks
  from public.prep_tasks
  where user_id = v_user_id;

  if v_total_tasks > 0 then
    v_prep_consistency := round((v_done_tasks::numeric / v_total_tasks) * 100, 2);
  end if;

  v_role_clarity :=
    case when v_target_role <> '' then 60 else 0 end
    + case when v_target_company <> '' then 20 else 0 end
    + case when coalesce(array_length(v_preferred_locations, 1), 0) > 0 then 20 else 0 end;

  select
    count(*),
    count(*) filter (
      where next_action_date is not null
        or status in ('screening', 'interview', 'offer')
    )
  into
    v_total_apps,
    v_actionable_apps
  from public.applications
  where user_id = v_user_id
    and status <> 'archived';

  if v_total_apps > 0 then
    v_application_hygiene := round((v_actionable_apps::numeric / v_total_apps) * 100, 2);
  end if;

  select
    coalesce(array_agg(initcap(skill)), '{}'::text[])
  into v_top_gaps
  from (
    select skill
    from unnest(v_target_skills) as skill
    where not (skill = any(v_user_skills))
    order by skill
    limit 3
  ) gaps;

  if v_target_role = '' then
    v_next_best_action := jsonb_build_object(
      'title', 'Define your target role and company to unlock personalized recommendations.',
      'route', '/app/onboarding',
      'cta', 'Complete onboarding'
    );
  elsif v_skill_coverage < 60 then
    v_next_best_action := jsonb_build_object(
      'title', 'Analyze jobs to sharpen the exact skills separating you from your target role.',
      'route', '/app/jobs',
      'cta', 'Open job discovery'
    );
  elsif v_resume_fit < 70 then
    v_next_best_action := jsonb_build_object(
      'title', 'Tailor your resume around the top missing keywords and strongest proof of work.',
      'route', '/app/resume',
      'cta', 'Optimize resume'
    );
  elsif v_prep_consistency < 50 then
    v_next_best_action := jsonb_build_object(
      'title', 'Complete today''s prep tasks to raise consistency and interview readiness.',
      'route', '/app/prep',
      'cta', 'Open prep engine'
    );
  elsif v_application_hygiene < 50 then
    v_next_best_action := jsonb_build_object(
      'title', 'Track your target jobs and set next-action dates so opportunities do not go stale.',
      'route', '/app/tracker',
      'cta', 'Open career CRM'
    );
  else
    v_next_best_action := jsonb_build_object(
      'title', 'Shortlist and apply to the best-matching roles in your 90-day fit window.',
      'route', '/app/jobs',
      'cta', 'Review matching jobs'
    );
  end if;

  v_overall := round(
    v_skill_coverage * 0.35
    + v_proof_of_work * 0.15
    + v_resume_fit * 0.15
    + v_prep_consistency * 0.15
    + v_role_clarity * 0.10
    + v_application_hygiene * 0.10,
    2
  );

  insert into public.readiness_snapshots (
    user_id,
    overall_score,
    skill_coverage_score,
    proof_of_work_score,
    resume_fit_score,
    prep_consistency_score,
    role_clarity_score,
    application_hygiene_score,
    top_gaps,
    next_best_action
  )
  values (
    v_user_id,
    v_overall,
    v_skill_coverage,
    v_proof_of_work,
    v_resume_fit,
    v_prep_consistency,
    v_role_clarity,
    v_application_hygiene,
    v_top_gaps,
    v_next_best_action
  )
  returning id into v_snapshot_id;

  return jsonb_build_object(
    'id', v_snapshot_id,
    'overallScore', v_overall,
    'topGaps', to_jsonb(v_top_gaps),
    'nextBestAction', v_next_best_action,
    'factorBreakdown', jsonb_build_object(
      'skillCoverage', v_skill_coverage,
      'proofOfWork', v_proof_of_work,
      'resumeFit', v_resume_fit,
      'prepConsistency', v_prep_consistency,
      'roleClarity', v_role_clarity,
      'applicationHygiene', v_application_hygiene
    )
  );
end;
$$;

grant execute on function public.refresh_readiness_snapshot() to authenticated;

create or replace function public.submit_onboarding_profile(
  p_target_role text,
  p_target_company text,
  p_salary_goal integer,
  p_experience_level public.experience_level,
  p_current_skills text[] default '{}'::text[],
  p_tools text[] default '{}'::text[],
  p_preferred_locations text[] default '{}'::text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.ensure_profile_for_current_user();
  v_readiness jsonb;
begin
  insert into public.career_goals (
    user_id,
    target_role,
    target_company,
    salary_goal,
    experience_level,
    desired_locations,
    is_onboarded,
    updated_at
  )
  values (
    v_user_id,
    nullif(trim(p_target_role), ''),
    nullif(trim(p_target_company), ''),
    p_salary_goal,
    p_experience_level,
    coalesce(p_preferred_locations, '{}'::text[]),
    true,
    now()
  )
  on conflict (user_id) do update
  set
    target_role = excluded.target_role,
    target_company = excluded.target_company,
    salary_goal = excluded.salary_goal,
    experience_level = excluded.experience_level,
    desired_locations = excluded.desired_locations,
    is_onboarded = true,
    updated_at = now();

  insert into public.candidate_profiles (
    user_id,
    skills,
    tools,
    updated_at
  )
  values (
    v_user_id,
    coalesce(p_current_skills, '{}'::text[]),
    coalesce(p_tools, '{}'::text[]),
    now()
  )
  on conflict (user_id) do update
  set
    skills = excluded.skills,
    tools = excluded.tools,
    updated_at = now();

  v_readiness := public.refresh_readiness_snapshot();

  return jsonb_build_object(
    'careerGoal', jsonb_build_object(
      'targetRole', p_target_role,
      'targetCompany', p_target_company,
      'salaryGoal', p_salary_goal,
      'experienceLevel', p_experience_level::text,
      'preferredLocations', to_jsonb(coalesce(p_preferred_locations, '{}'::text[]))
    ),
    'readiness', v_readiness
  );
end;
$$;

grant execute on function public.submit_onboarding_profile(
  text,
  text,
  integer,
  public.experience_level,
  text[],
  text[],
  text[]
) to authenticated;

create or replace function public.get_job_discovery(
  p_query text default '',
  p_readiness_min numeric default 0,
  p_limit integer default 24
)
returns table (
  job_id uuid,
  company text,
  role_title text,
  salary_range text,
  location text,
  work_mode text,
  experience_level text,
  readiness_score numeric,
  match_score numeric,
  missing_skills text[],
  recommended_actions text[]
)
language sql
security definer
set search_path = public
as $$
  with me as (
    select
      coalesce(
        array(
          select distinct lower(trim(skill))
          from public.candidate_profiles cp
          cross join lateral unnest(coalesce(cp.skills, '{}'::text[]) || coalesce(cp.tools, '{}'::text[])) as skill
          where cp.user_id = auth.uid()
            and trim(skill) <> ''
        ),
        '{}'::text[]
      ) as user_skills,
      coalesce((select target_role from public.career_goals where user_id = auth.uid()), '') as target_role,
      coalesce((select target_company from public.career_goals where user_id = auth.uid()), '') as target_company,
      coalesce(
        (
          select overall_score
          from public.readiness_snapshots
          where user_id = auth.uid()
          order by created_at desc
          limit 1
        ),
        0
      )::numeric as baseline_readiness
  ),
  base_jobs as (
    select
      j.id as job_id,
      j.company,
      j.role_title,
      coalesce(
        j.salary_range,
        case
          when j.salary_min is not null or j.salary_max is not null
            then concat_ws(' - ', j.salary_min::text, j.salary_max::text)
          else 'Comp not listed'
        end
      ) as salary_range,
      coalesce(j.location, 'Location flexible') as location,
      j.work_mode::text as work_mode,
      coalesce(j.experience_level::text, 'mid') as experience_level,
      coalesce(
        array(
          select distinct lower(trim(skill))
          from unnest(coalesce(j.required_skills, '{}'::text[])) as skill
          where trim(skill) <> ''
        ),
        '{}'::text[]
      ) as job_skills
    from public.jobs j
    where j.is_active
      and (
        coalesce(p_query, '') = ''
        or j.company ilike '%' || p_query || '%'
        or j.role_title ilike '%' || p_query || '%'
        or coalesce(j.location, '') ilike '%' || p_query || '%'
      )
  ),
  scored as (
    select
      b.job_id,
      b.company,
      b.role_title,
      b.salary_range,
      b.location,
      b.work_mode,
      b.experience_level,
      round(
        least(
          100,
          m.baseline_readiness * 0.40
          + (
            select
              coalesce(
                100.0 * count(*) / greatest(coalesce(array_length(b.job_skills, 1), 0), 1),
                0
              )
            from unnest(b.job_skills) as skill
            where skill = any(m.user_skills)
          ) * 0.60
        ),
        2
      ) as readiness_score,
      round(
        least(
          100,
          (
            select
              coalesce(
                100.0 * count(*) / greatest(coalesce(array_length(b.job_skills, 1), 0), 1),
                0
              )
            from unnest(b.job_skills) as skill
            where skill = any(m.user_skills)
          ) * 0.70
          + case
              when m.target_role <> ''
                and b.role_title ilike '%' || m.target_role || '%'
                then 20
              else 0
            end
          + case
              when m.target_company <> ''
                and b.company ilike '%' || m.target_company || '%'
                then 10
              else 0
            end
        ),
        2
      ) as match_score,
      coalesce(
        array(
          select initcap(skill)
          from unnest(b.job_skills) as skill
          where not (skill = any(m.user_skills))
          order by skill
          limit 3
        ),
        '{}'::text[]
      ) as missing_skills
    from base_jobs b
    cross join me m
  )
  select
    s.job_id,
    s.company,
    s.role_title,
    s.salary_range,
    s.location,
    s.work_mode,
    s.experience_level,
    s.readiness_score,
    s.match_score,
    s.missing_skills,
    array[
      case
        when coalesce(array_length(s.missing_skills, 1), 0) > 0 then 'Close top skill gaps'
        else 'Tailor resume'
      end,
      case
        when s.match_score < 70 then 'Analyze JD before applying'
        else 'Track application in CRM'
      end,
      case
        when s.readiness_score < 60 then 'Create 14-day roadmap'
        else 'Prepare targeted answers'
      end
    ] as recommended_actions
  from scored s
  where s.readiness_score >= p_readiness_min
  order by s.match_score desc, s.readiness_score desc, s.company
  limit greatest(p_limit, 1);
$$;

grant execute on function public.get_job_discovery(text, numeric, integer) to authenticated;
