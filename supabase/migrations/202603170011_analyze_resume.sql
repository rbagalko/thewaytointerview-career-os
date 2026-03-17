create or replace function public.analyze_resume(
  p_raw_text text,
  p_job_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.ensure_profile_for_current_user();
  v_resume_text text := lower(coalesce(p_raw_text, ''));
  v_target_role text := '';
  v_target_company text := '';
  v_target_skills text[] := '{}'::text[];
  v_keyword_gaps text[] := '{}'::text[];
  v_keyword_hits integer := 0;
  v_total_keywords integer := 0;
  v_action_verb_hits integer := 0;
  v_ats_score numeric := 0;
  v_resume_id uuid;
  v_suggestions jsonb := '[]'::jsonb;
begin
  if length(trim(coalesce(p_raw_text, ''))) < 80 then
    raise exception 'Paste a fuller resume before running analysis.';
  end if;

  if p_job_id is not null then
    select
      coalesce(j.role_title, ''),
      coalesce(j.company, ''),
      coalesce(
        array(
          select distinct lower(trim(skill))
          from unnest(coalesce(j.required_skills, '{}'::text[])) as skill
          where trim(skill) <> ''
        ),
        '{}'::text[]
      )
    into
      v_target_role,
      v_target_company,
      v_target_skills
    from public.jobs j
    where j.id = p_job_id;
  else
    select
      coalesce(cg.target_role, ''),
      coalesce(cg.target_company, '')
    into
      v_target_role,
      v_target_company
    from public.career_goals cg
    where cg.user_id = v_user_id;

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
    ) matched_skills;
  end if;

  if coalesce(array_length(v_target_skills, 1), 0) = 0 then
    v_target_skills := array['azure ad', 'powershell', 'mfa'];
  end if;

  select count(*)
  into v_total_keywords
  from unnest(v_target_skills) as skill;

  select count(*)
  into v_keyword_hits
  from unnest(v_target_skills) as skill
  where v_resume_text like '%' || skill || '%';

  select
    coalesce(array_agg(initcap(skill)), '{}'::text[])
  into v_keyword_gaps
  from (
    select skill
    from unnest(v_target_skills) as skill
    where v_resume_text not like '%' || skill || '%'
    order by skill
    limit 5
  ) gaps;

  select count(*)
  into v_action_verb_hits
  from unnest(array['built', 'automated', 'reduced', 'improved', 'designed', 'implemented']) as verb
  where v_resume_text like '%' || verb || '%';

  v_ats_score := round(
    least(
      100,
      42
      + (coalesce(v_keyword_hits, 0)::numeric / greatest(v_total_keywords, 1)) * 38
      + least(v_action_verb_hits, 4) * 4
      + case when length(v_resume_text) >= 1200 then 4 else 0 end
    ),
    2
  );

  v_suggestions := jsonb_build_array(
    jsonb_build_object(
      'before', 'Managed identity operations and user access tasks.',
      'after', 'Automated identity operations with PowerShell and Azure AD workflows, reducing repetitive access administration and improving consistency.'
    ),
    jsonb_build_object(
      'before', 'Worked on account provisioning and security.',
      'after', 'Implemented MFA, access controls, and user provisioning workflows aligned to enterprise identity and security requirements.'
    ),
    jsonb_build_object(
      'before', 'Supported cloud identity environments.',
      'after', 'Supported ' || coalesce(nullif(v_target_role, ''), 'cloud identity') || ' priorities by troubleshooting identity flows, documenting fixes, and strengthening tenant hygiene.'
    )
  );

  update public.resumes
  set
    is_primary = false,
    updated_at = now()
  where user_id = v_user_id;

  insert into public.resumes (
    user_id,
    file_name,
    source,
    version_no,
    raw_text,
    parsed_sections,
    ats_score,
    job_target,
    is_primary,
    updated_at
  )
  values (
    v_user_id,
    'pasted-resume.txt',
    'paste',
    (
      select coalesce(max(version_no), 0) + 1
      from public.resumes
      where user_id = v_user_id
    ),
    p_raw_text,
    jsonb_build_object(
      'keywordGaps', to_jsonb(v_keyword_gaps),
      'suggestions', v_suggestions,
      'targetRole', v_target_role,
      'targetCompany', v_target_company
    ),
    v_ats_score,
    coalesce(nullif(v_target_role, ''), 'General target'),
    true,
    now()
  )
  returning id into v_resume_id;

  return jsonb_build_object(
    'resumeId', v_resume_id,
    'atsScore', v_ats_score,
    'keywordGaps', to_jsonb(v_keyword_gaps),
    'suggestions', v_suggestions,
    'targetRole', v_target_role,
    'targetCompany', v_target_company
  );
end;
$$;

grant execute on function public.analyze_resume(text, uuid) to authenticated;
