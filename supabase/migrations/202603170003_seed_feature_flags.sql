insert into public.feature_flags (key, label, status, audience, meta)
values
  (
    'mock-interview-audio',
    'AI mock interviews (audio)',
    'disabled',
    'all',
    jsonb_build_object('description', 'Soon you can experience this.')
  ),
  (
    'mock-interview-video',
    'AI mock interviews (video)',
    'disabled',
    'all',
    jsonb_build_object('description', 'Soon you can experience this.')
  ),
  (
    'live-recruiter-interviews',
    'Live recruiter interviews',
    'disabled',
    'all',
    jsonb_build_object('description', 'Soon you can experience this.')
  ),
  (
    'offer-negotiation-assistant',
    'Offer negotiation assistant',
    'disabled',
    'all',
    jsonb_build_object('description', 'Soon you can experience this.')
  ),
  (
    'recruiter-marketplace',
    'Recruiter marketplace',
    'disabled',
    'all',
    jsonb_build_object('description', 'Soon you can experience this.')
  )
on conflict (key) do update
set
  label = excluded.label,
  status = excluded.status,
  audience = excluded.audience,
  meta = excluded.meta,
  updated_at = now();

