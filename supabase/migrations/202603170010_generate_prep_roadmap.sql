create or replace function public.generate_prep_roadmap(
  p_job_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.ensure_profile_for_current_user();
  v_target_role text := '';
  v_target_company text := '';
  v_user_skills text[] := '{}'::text[];
  v_top_gaps text[] := '{}'::text[];
  v_focus_skills text[] := '{}'::text[];
  v_fallback_skills text[] := array['Interview storytelling', 'Resume tailoring', 'Application hygiene'];
  v_job_id uuid := p_job_id;
  v_role text := '';
  v_company text := '';
  v_roadmap_id uuid;
  v_duration_days integer := 14;
  v_start_date date := current_date;
  v_end_date date := current_date + 13;
  v_day integer := 1;
  v_skill text;
  v_first_skill text;
  v_resource_id uuid;
  v_resource_title text;
  v_resource_duration integer;
  v_task_count integer := 0;
  v_plan jsonb := '[]'::jsonb;
  v_readiness jsonb := '{}'::jsonb;
begin
  select
    coalesce(cg.target_role, ''),
    coalesce(cg.target_company, ''),
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
    v_user_skills
  from public.candidate_profiles cp
  full join public.career_goals cg on cg.user_id = cp.user_id
  where coalesce(cp.user_id, cg.user_id) = v_user_id;

  select
    coalesce(top_gaps, '{}'::text[])
  into v_top_gaps
  from public.readiness_snapshots
  where user_id = v_user_id
  order by created_at desc
  limit 1;

  if v_job_id is null then
    select
      j.id,
      j.role_title,
      j.company
    into
      v_job_id,
      v_role,
      v_company
    from public.jobs j
    where j.is_active
      and (
        (v_target_role <> '' and j.role_title ilike '%' || v_target_role || '%')
        or (v_target_company <> '' and j.company ilike '%' || v_target_company || '%')
      )
    order by
      case
        when v_target_company <> '' and j.company ilike '%' || v_target_company || '%' then 1
        else 0
      end desc,
      case
        when v_target_role <> '' and j.role_title ilike '%' || v_target_role || '%' then 1
        else 0
      end desc,
      j.quality_score desc nulls last,
      j.freshness_score desc nulls last
    limit 1;
  else
    select
      j.role_title,
      j.company
    into
      v_role,
      v_company
    from public.jobs j
    where j.id = v_job_id;
  end if;

  if v_job_id is not null then
    select
      coalesce(array_agg(initcap(skill)), '{}'::text[])
    into v_focus_skills
    from (
      select distinct lower(trim(skill)) as skill
      from public.jobs j
      cross join lateral unnest(coalesce(j.required_skills, '{}'::text[])) as skill
      where j.id = v_job_id
        and trim(skill) <> ''
        and not (lower(trim(skill)) = any(v_user_skills))
      order by skill
      limit 3
    ) missing_job_skills;
  end if;

  if coalesce(array_length(v_focus_skills, 1), 0) = 0 then
    v_focus_skills := coalesce(v_top_gaps, '{}'::text[]);
  end if;

  if coalesce(array_length(v_focus_skills, 1), 0) = 0 then
    v_focus_skills := v_fallback_skills;
  end if;

  v_focus_skills := coalesce(v_focus_skills[1:3], v_fallback_skills);
  v_first_skill := coalesce(v_focus_skills[1], 'Interview storytelling');
  v_role := coalesce(nullif(v_role, ''), nullif(v_target_role, ''), 'Target role');
  v_company := coalesce(nullif(v_company, ''), nullif(v_target_company, ''), 'your target company');

  delete from public.prep_roadmaps
  where user_id = v_user_id;

  insert into public.prep_roadmaps (
    user_id,
    role,
    company,
    duration_days,
    start_date,
    end_date
  )
  values (
    v_user_id,
    v_role,
    v_company,
    v_duration_days,
    v_start_date,
    v_end_date
  )
  returning id into v_roadmap_id;

  foreach v_skill in array v_focus_skills
  loop
    select
      lr.id,
      lr.title,
      lr.duration_minutes
    into
      v_resource_id,
      v_resource_title,
      v_resource_duration
    from public.learning_resources lr
    where lr.is_active
      and exists (
        select 1
        from unnest(coalesce(lr.skill_tags, '{}'::text[])) as skill_tag
        where lower(trim(skill_tag)) like '%' || lower(v_skill) || '%'
           or lower(v_skill) like '%' || lower(trim(skill_tag)) || '%'
      )
    order by lr.ranking_score desc nulls last, lr.created_at desc
    limit 1;

    insert into public.prep_tasks (
      roadmap_id,
      user_id,
      day_number,
      title,
      description,
      task_type,
      skill_tags,
      duration_minutes,
      resource_id,
      linked_job_id,
      sort_order
    )
    values (
      v_roadmap_id,
      v_user_id,
      v_day,
      coalesce(v_resource_title, 'Study ' || v_skill || ' fundamentals'),
      'Build conceptual depth in ' || v_skill || ' so you can explain tradeoffs and real-world examples for ' || v_role || '.',
      'Reading',
      array[v_skill],
      coalesce(v_resource_duration, 20),
      v_resource_id,
      v_job_id,
      1
    );
    v_day := v_day + 1;

    insert into public.prep_tasks (
      roadmap_id,
      user_id,
      day_number,
      title,
      description,
      task_type,
      skill_tags,
      duration_minutes,
      linked_job_id,
      sort_order
    )
    values (
      v_roadmap_id,
      v_user_id,
      v_day,
      'Practice 5 interview questions on ' || v_skill,
      'Write concise answers, troubleshooting notes, and one measurable story that proves you have hands-on depth.',
      'Interview questions',
      array[v_skill],
      25,
      v_job_id,
      2
    );
    v_day := v_day + 1;
  end loop;

  insert into public.prep_tasks (
    roadmap_id,
    user_id,
    day_number,
    title,
    description,
    task_type,
    skill_tags,
    duration_minutes,
    linked_job_id,
    sort_order
  )
  values (
    v_roadmap_id,
    v_user_id,
    v_day,
    'Build a mini proof-of-work lab for ' || v_first_skill,
    'Create a small hands-on exercise you can reference in interviews and on your resume.',
    'Mini-project',
    array[v_first_skill],
    45,
    v_job_id,
    3
  );
  v_day := v_day + 1;

  insert into public.prep_tasks (
    roadmap_id,
    user_id,
    day_number,
    title,
    description,
    task_type,
    skill_tags,
    duration_minutes,
    linked_job_id,
    sort_order
  )
  values (
    v_roadmap_id,
    v_user_id,
    v_day,
    'Tailor your resume and shortlist applications',
    'Reflect the strongest skills from this roadmap in your resume bullets, then review the best-matching roles.',
    'Application action',
    array['Resume tailoring', 'Application hygiene'],
    30,
    v_job_id,
    4
  );

  select count(*)
  into v_task_count
  from public.prep_tasks
  where roadmap_id = v_roadmap_id;

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'dayNumber', pt.day_number,
          'title', pt.title,
          'taskType', pt.task_type,
          'skillTags', pt.skill_tags,
          'durationMinutes', pt.duration_minutes
        )
        order by pt.day_number, pt.sort_order
      ),
      '[]'::jsonb
    )
  into v_plan
  from public.prep_tasks pt
  where pt.roadmap_id = v_roadmap_id;

  update public.prep_roadmaps
  set
    plan = v_plan,
    completed_tasks = '[]'::jsonb,
    updated_at = now()
  where id = v_roadmap_id;

  v_readiness := public.refresh_readiness_snapshot();

  return jsonb_build_object(
    'roadmapId', v_roadmap_id,
    'role', v_role,
    'company', v_company,
    'durationDays', v_duration_days,
    'taskCount', v_task_count,
    'focusSkills', to_jsonb(v_focus_skills),
    'readiness', v_readiness
  );
end;
$$;

grant execute on function public.generate_prep_roadmap(uuid) to authenticated;
