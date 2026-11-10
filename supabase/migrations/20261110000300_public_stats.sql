-- FinBuilder AI — statistiques publiques de la page d'accueil.
-- Renvoie UNIQUEMENT des compteurs agrégés (aucune donnée personnelle), calculés en direct :
-- ils augmentent à chaque création de profil et baissent à chaque suppression de compte.
-- Les comptes supprimés ne sont jamais comptés, même si une ligne orpheline subsistait.

create or replace function public.public_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'financial_profiles', (
      select count(*)
      from public.financial_profiles fp
      where exists (select 1 from auth.users u where u.id = fp.user_id)
    ),
    'users', (select count(*) from auth.users)
  );
$$;

revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;
