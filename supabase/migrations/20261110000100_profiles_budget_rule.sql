-- FinBuilder AI — règle de répartition du budget intelligent, synchronisée entre appareils.
-- Valeurs : '50-30-20' (par défaut) ou '80-20'.
-- Les politiques RLS existantes de « profiles » s'appliquent : chaque utilisateur
-- ne peut lire et modifier que sa propre ligne. Aucune nouvelle politique n'est nécessaire.

alter table public.profiles
  add column if not exists budget_rule text not null default '50-30-20';

alter table public.profiles
  drop constraint if exists profiles_budget_rule_check;

alter table public.profiles
  add constraint profiles_budget_rule_check
  check (budget_rule in ('50-30-20', '80-20'));
