create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'contact_form',
  status text not null default 'new',
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,
  message text,
  notes text,
  is_customer boolean not null default false,
  last_contacted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_company_idx on public.leads (lower(company));
create index if not exists leads_email_idx on public.leads (lower(email));

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

alter table public.leads enable row level security;

-- No public policies are added. The website API uses the Supabase service role
-- key on the server side only. Never expose that key in frontend code.
