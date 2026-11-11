-- FinBuilder AI — notifications push automatiques.
--
--   1. « Budget dépassé » : chaque soir à 19 h (heure d'Abidjan / UTC), vérification du mois
--      en cours selon la règle choisie par l'utilisateur (50/30/20 ou 80/20).
--   2. « Objectif atteint » : dès qu'un objectif d'épargne arrive à 100 %.
--
-- Le calcul et l'envoi sont faits par la fonction Edge `push-scheduler`. Elle est appelée
-- uniquement par la base (pg_cron + pg_net) avec un secret aléatoire conservé dans le
-- coffre-fort Supabase (Vault) : ce secret n'apparaît ni dans le code ni dans l'application.
-- Ce script est idempotent : il peut être relancé sans risque.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- 1. Journal anti-doublon : une notification par objectif, une par bloc de budget et par mois.
--    Aucune donnée financière : seulement le type et une référence (id d'objectif ou « 2026-11:envies »).

create table if not exists public.push_log (
  user_id  uuid not null references auth.users (id) on delete cascade,
  kind     text not null,
  ref      text not null,
  sent_at  timestamptz not null default now(),
  primary key (user_id, kind, ref)
);

alter table public.push_log enable row level security;
-- Aucune politique : seule la fonction serveur (rôle service) y accède.
revoke all on public.push_log from anon, authenticated;

-- 2. Secret partagé entre la base et la fonction Edge (généré ici, jamais affiché).

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'push_scheduler_secret') then
    perform vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'push_scheduler_secret',
      'Authentifie les appels de la base vers la fonction Edge push-scheduler'
    );
  end if;
end $$;

-- Vérification du secret par la fonction Edge (rôle service uniquement).
create or replace function public.push_scheduler_secret_ok(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(length(candidate) >= 32, false)
     and exists (
       select 1 from vault.decrypted_secrets
       where name = 'push_scheduler_secret' and decrypted_secret = candidate
     );
$$;

revoke all on function public.push_scheduler_secret_ok(text) from public, anon, authenticated;
grant execute on function public.push_scheduler_secret_ok(text) to service_role;

-- Appel asynchrone de la fonction Edge (ne ralentit jamais l'enregistrement d'un objectif).
create or replace function public.push_call_scheduler(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  secret text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'push_scheduler_secret';

  if secret is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://oylcyiavxlwohdsxnbqy.supabase.co/functions/v1/push-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-scheduler-secret', secret
    ),
    body := payload,
    timeout_milliseconds := 20000
  );
end;
$$;

revoke all on function public.push_call_scheduler(jsonb) from public, anon, authenticated;

-- 3. « Objectif atteint » : déclenché au passage à 100 % (création ou mise à jour).

create or replace function public.goals_notify_reached()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  now_reached boolean;
  was_reached boolean := false;
begin
  now_reached := coalesce(new.montant_objectif, 0) > 0
             and coalesce(new.montant_actuel, 0) >= new.montant_objectif;

  if tg_op = 'UPDATE' then
    was_reached := coalesce(old.montant_objectif, 0) > 0
               and coalesce(old.montant_actuel, 0) >= old.montant_objectif;
  end if;

  if now_reached and not was_reached
     and exists (select 1 from public.push_subscriptions s where s.user_id = new.user_id) then
    begin
      perform public.push_call_scheduler(jsonb_build_object('job', 'goal', 'goal_id', new.id));
    exception when others then
      -- Une notification ne doit jamais empêcher l'enregistrement de l'objectif.
      null;
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists goals_notify_reached on public.goals;
create trigger goals_notify_reached
  after insert or update of montant_actuel, montant_objectif on public.goals
  for each row execute function public.goals_notify_reached();

-- 4. « Budget dépassé » : tous les soirs à 19 h UTC (19 h à Abidjan).

do $$
begin
  if exists (select 1 from cron.job where jobname = 'push-budget-soir') then
    perform cron.unschedule('push-budget-soir');
  end if;
end $$;

select cron.schedule(
  'push-budget-soir',
  '0 19 * * *',
  $job$ select public.push_call_scheduler('{"job":"budget"}'::jsonb); $job$
);
