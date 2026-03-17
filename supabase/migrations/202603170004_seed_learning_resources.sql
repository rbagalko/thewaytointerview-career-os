insert into public.learning_resources (
  title,
  provider,
  resource_type,
  url,
  skill_tags,
  difficulty,
  duration_minutes,
  popularity_score,
  relevance_score,
  quality_score,
  ranking_score
)
values
  (
    'Conditional Access Fundamentals',
    'Microsoft Learn',
    'guide',
    'https://learn.microsoft.com/',
    array['Conditional Access', 'Azure AD'],
    'Beginner',
    14,
    82,
    93,
    91,
    90
  ),
  (
    'PowerShell Automation for Identity Teams',
    'YouTube',
    'video',
    'https://www.youtube.com/',
    array['PowerShell automation', 'Azure AD'],
    'Intermediate',
    21,
    87,
    89,
    83,
    86
  ),
  (
    'Azure AD Connect Health Walkthrough',
    'Microsoft Docs',
    'guide',
    'https://learn.microsoft.com/entra/identity/',
    array['Azure AD Connect', 'Identity sync'],
    'Intermediate',
    12,
    76,
    91,
    88,
    87
  )
on conflict (url) do update
set
  title = excluded.title,
  provider = excluded.provider,
  resource_type = excluded.resource_type,
  skill_tags = excluded.skill_tags,
  difficulty = excluded.difficulty,
  duration_minutes = excluded.duration_minutes,
  popularity_score = excluded.popularity_score,
  relevance_score = excluded.relevance_score,
  quality_score = excluded.quality_score,
  ranking_score = excluded.ranking_score,
  updated_at = now();
