create or replace function public.analyze_jd(
  p_raw_jd text default '',
  p_job_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.ensure_profile_for_current_user();
  v_job_id uuid := p_job_id;
  v_role text := '';
  v_company text := '';
  v_jd_text text := lower(coalesce(p_raw_jd, ''));
  v_user_skills text[] := '{}'::text[];
  v_key_skills text[] := '{}'::text[];
  v_gap_skills text[] := '{}'::text[];
  v_summary text := '';
  v_rounds jsonb := '[]'::jsonb;
  v_analysis_id uuid;
  v_round_count integer := 3;
begin
  select
    coalesce(
      array(
        select distinct lower(trim(skill))
        from public.candidate_profiles cp
        cross join lateral unnest(coalesce(cp.skills, '{}'::text[]) || coalesce(cp.tools, '{}'::text[])) as skill
        where cp.user_id = v_user_id
          and trim(skill) <> ''
      ),
      '{}'::text[]
    )
  into v_user_skills;

  if v_job_id is not null then
    select
      coalesce(j.role_title, ''),
      coalesce(j.company, ''),
      lower(coalesce(nullif(j.description_normalized, ''), nullif(j.description_raw, ''), p_raw_jd, ''))
    into
      v_role,
      v_company,
      v_jd_text
    from public.jobs j
    where j.id = v_job_id;
  else
    select
      coalesce(cg.target_role, ''),
      coalesce(cg.target_company, '')
    into
      v_role,
      v_company
    from public.career_goals cg
    where cg.user_id = v_user_id;
  end if;

  if length(trim(v_jd_text)) = 0 then
    raise exception 'Paste a job description or analyze from a selected job.';
  end if;

  with skill_pool as (
    select distinct lower(trim(skill)) as skill
    from public.jobs j
    cross join lateral unnest(coalesce(j.required_skills, '{}'::text[])) as skill
    where j.is_active
      and trim(skill) <> ''
    union
    select distinct lower(trim(skill_tag)) as skill
    from public.learning_resources lr
    cross join lateral unnest(coalesce(lr.skill_tags, '{}'::text[])) as skill_tag
    where lr.is_active
      and trim(skill_tag) <> ''
  )
  select
    coalesce(array_agg(initcap(skill)), '{}'::text[])
  into v_key_skills
  from (
    select skill
    from skill_pool
    where v_jd_text like '%' || skill || '%'
    order by length(skill) desc, skill
    limit 6
  ) extracted;

  if coalesce(array_length(v_key_skills, 1), 0) = 0 and v_job_id is not null then
    select
      coalesce(array_agg(initcap(skill)), '{}'::text[])
    into v_key_skills
    from (
      select distinct lower(trim(skill)) as skill
      from public.jobs j
      cross join lateral unnest(coalesce(j.required_skills, '{}'::text[])) as skill
      where j.id = v_job_id
        and trim(skill) <> ''
      order by skill
      limit 6
    ) direct_skills;
  end if;

  if coalesce(array_length(v_key_skills, 1), 0) = 0 then
    v_key_skills := array['Identity Administration', 'Troubleshooting', 'Interview Communication'];
  end if;

  select
    coalesce(array_agg(skill), '{}'::text[])
  into v_gap_skills
  from (
    select skill
    from unnest(v_key_skills) as skill
    where not (lower(skill) = any(v_user_skills))
    order by skill
    limit 3
  ) gap_list;

  v_summary := coalesce(nullif(v_role, ''), 'This role')
    || case when v_company <> '' then ' at ' || v_company else '' end
    || ' emphasizes '
    || array_to_string(v_key_skills[1:3], ', ')
    || ', with strong signal on execution, troubleshooting, and interview-ready examples.';

  v_rounds := jsonb_build_array(
    jsonb_build_object(
      'name', 'Recruiter screen',
      'focus', jsonb_build_array('Role motivation', 'Communication', 'Company fit')
    ),
    jsonb_build_object(
      'name', 'Technical round',
      'focus', to_jsonb(v_key_skills[1:3])
    ),
    jsonb_build_object(
      'name', 'Scenario round',
      'focus', jsonb_build_array('Troubleshooting', 'Tradeoffs', 'Operational judgment')
    )
  );

  insert into public.jd_analyses (
    user_id,
    job_id,
    company,
    role,
    summary,
    key_skills,
    total_rounds,
    rounds,
    raw_jd
  )
  values (
    v_user_id,
    v_job_id,
    nullif(v_company, ''),
    nullif(v_role, ''),
    v_summary,
    v_key_skills,
    v_round_count,
    v_rounds,
    p_raw_jd
  )
  returning id into v_analysis_id;

  insert into public.skill_gaps (
    user_id,
    jd_analysis_id,
    skill_name,
    importance,
    user_strength,
    gap_score,
    suggested_actions
  )
  select
    v_user_id,
    v_analysis_id,
    skill,
    case when row_number() over () = 1 then 'high' when row_number() over () = 2 then 'high' else 'medium' end,
    'emerging',
    case when row_number() over () = 1 then 88 when row_number() over () = 2 then 76 else 64 end,
    jsonb_build_array(
      'Study the concept deeply',
      'Practice 5 interview answers',
      'Build one proof-of-work example'
    )
  from unnest(v_gap_skills) as skill;

  return jsonb_build_object(
    'analysisId', v_analysis_id,
    'summary', v_summary,
    'keySkills', to_jsonb(v_key_skills),
    'criticalGaps', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'skill', sg.skill_name,
            'importance', initcap(sg.importance),
            'note', 'This skill appears central to the role and should be supported with concrete examples.'
          )
        )
        from public.skill_gaps sg
        where sg.jd_analysis_id = v_analysis_id
      ),
      '[]'::jsonb
    ),
    'interviewRounds', v_rounds,
    'role', v_role,
    'company', v_company,
    'rawText', p_raw_jd
  );
end;
$$;

grant execute on function public.analyze_jd(text, uuid) to authenticated;
