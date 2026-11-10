-- FinBuilder AI — quota journalier du Coach IA (protège la facture du fournisseur d'IA).
-- Ne stocke qu'un compteur par utilisateur et par jour : aucun contenu de conversation.

create table if not exists public.assistant_usage (
  user_id  uuid not null references auth.users (id) on delete cascade,
  day      date not null default current_date,
  count    integer not null default 0,
  primary key (user_id, day)
);

alter table public.assistant_usage enable row level security;

-- Lecture de son propre compteur uniquement ; aucune écriture directe depuis l'application.
drop policy if exists "assistant_usage_select_own" on public.assistant_usage;
create policy "assistant_usage_select_own"
  on public.assistant_usage for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.assistant_usage from anon;

-- Incrément atomique, appelé uniquement par la fonction Edge (rôle service).
create or replace function public.assistant_consume_quota(p_user_id uuid, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.assistant_usage (user_id, day, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, day)
  do update set count = public.assistant_usage.count + 1
  returning count into v_count;
  return v_count;
end;
$$;

revoke all on function public.assistant_consume_quota(uuid, integer) from public, anon, authenticated;
grant execute on function public.assistant_consume_quota(uuid, integer) to service_role;
