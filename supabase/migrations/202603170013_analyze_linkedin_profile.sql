create or replace function public.analyze_linkedin_profile(
  p_profile_name text default '',
  p_profile_headline text default '',
  p_profile_summary text default ''
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
  v_current_title text := '';
  v_focus_keywords text[] := '{}'::text[];
  v_keyword_gaps text[] := '{}'::text[];
  v_profile_score integer := 48;
  v_combined_text text := lower(coalesce(p_profile_headline, '') || ' ' || coalesce(p_profile_summary, ''));
  v_suggested_headline text := '';
  v_suggested_summary text := '';
  v_record_id uuid;
begin
  select
    coalesce(cg.target_role, ''),
    coalesce(cg.target_company, '')
  into
    v_target_role,
    v_target_company
  from public.career_goals cg
  where cg.user_id = v_user_id;

  select
    coalesce(cp.current_title, ''),
    coalesce(
      array(
        select distinct initcap(trim(skill))
        from unnest(coalesce(cp.skills, '{}'::text[]) || coalesce(cp.tools, '{}'::text[])) as skill
        where trim(skill) <> ''
        order by initcap(trim(skill))
        limit 5
      ),
      '{}'::text[]
    )
  into
    v_current_title,
    v_focus_keywords
  from public.candidate_profiles cp
  where cp.user_id = v_user_id;

  if coalesce(array_length(v_focus_keywords, 1), 0) = 0 then
    v_focus_keywords := array['Azure AD', 'Conditional Access', 'PowerShell', 'Identity Automation'];
  end if;

  select
    coalesce(array_agg(skill), '{}'::text[])
  into v_keyword_gaps
  from (
    select skill
    from unnest(v_focus_keywords) as skill
    where v_combined_text not like '%' || lower(skill) || '%'
    order by skill
    limit 4
  ) gap_list;

  v_profile_score := least(
    92,
    28
    + case when length(trim(coalesce(p_profile_headline, ''))) between 20 and 120 then 18 else 6 end
    + case
        when length(trim(coalesce(p_profile_summary, ''))) >= 220 then 24
        when length(trim(coalesce(p_profile_summary, ''))) >= 120 then 16
        when length(trim(coalesce(p_profile_summary, ''))) >= 80 then 8
        else 0
      end
    + case
        when v_target_role <> '' and v_combined_text like '%' || lower(v_target_role) || '%' then 12
        else 0
      end
    + greatest(0, 20 - coalesce(array_length(v_keyword_gaps, 1), 0) * 5)
  );

  v_suggested_headline := coalesce(
    nullif(trim(p_profile_headline), ''),
    nullif(v_target_role, ''),
    nullif(v_current_title, ''),
    'Identity Engineer'
  );

  if coalesce(array_length(v_focus_keywords, 1), 0) > 0 then
    v_suggested_headline := v_suggested_headline || ' | ' || array_to_string(v_focus_keywords[1:3], ' | ');
  end if;

  v_suggested_summary :=
    'I am building toward '
    || coalesce(nullif(v_target_role, ''), 'identity engineering')
    || case when v_target_company <> '' then ' opportunities aligned to ' || v_target_company else '' end
    || ', with hands-on work across '
    || array_to_string(v_focus_keywords[1:4], ', ')
    || '. I focus on turning access, security, and automation requirements into reliable execution, clear communication, and proof-of-work that shows how I solve production problems.';

  insert into public.linkedin_optimizations (
    user_id,
    profile_name,
    profile_headline,
    profile_summary,
    suggested_headline,
    suggested_summary,
    keyword_gaps,
    profile_score
  )
  values (
    v_user_id,
    nullif(trim(p_profile_name), ''),
    nullif(trim(p_profile_headline), ''),
    nullif(trim(p_profile_summary), ''),
    v_suggested_headline,
    v_suggested_summary,
    v_keyword_gaps,
    v_profile_score
  )
  returning id into v_record_id;

  return jsonb_build_object(
    'optimizationId', v_record_id,
    'profileScore', v_profile_score,
    'suggestedHeadline', v_suggested_headline,
    'suggestedSummary', v_suggested_summary,
    'keywordGaps', to_jsonb(v_keyword_gaps)
  );
end;
$$;

grant execute on function public.analyze_linkedin_profile(text, text, text) to authenticated;
