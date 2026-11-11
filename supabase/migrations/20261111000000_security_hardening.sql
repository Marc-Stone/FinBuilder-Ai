-- FinBuilder AI — durcissement de sécurité (audit du 11/11/2026).
--
-- Problème corrigé : toutes les tables de la console donnaient un accès COMPLET (lecture
-- et écriture) à n'importe quel membre de la table `admins`, quelle que soit sa permission.
-- Un membre délégué pouvait donc modifier `admin_roles`, s'attribuer la permission
-- « security », puis réinitialiser le mot de passe de n'importe quel utilisateur.
--
-- Principe après correction :
--   - LECTURE : inchangée (tout membre de la console), pour ne pas casser le tableau de bord ;
--   - ÉCRITURE : réservée à l'administrateur principal ou à la permission correspondante ;
--   - `admin_roles` (les permissions elles-mêmes) : modifiable UNIQUEMENT par l'administrateur principal.
-- Ce script est idempotent : il peut être relancé sans risque.

-- 1. Fonctions d'aide (SECURITY DEFINER : lisent profiles / admin_roles malgré la RLS).

create or replace function public.console_is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.admin_role_id is null
  );
$$;

create or replace function public.console_is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
     and (public.console_is_owner()
          or exists (select 1 from public.admins a where a.user_id = auth.uid()));
$$;

-- Permissions stockées sous forme de liste ["users", …] ou d'objet {"users": true, …}.
create or replace function public.console_can(perm text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.console_is_owner()
      or exists (
        select 1
        from public.admins a
        join public.profiles p on p.id = a.user_id
        join public.admin_roles r on r.id = p.admin_role_id
        where a.user_id = auth.uid()
          and (
            (jsonb_typeof(to_jsonb(r.permissions)) = 'array' and to_jsonb(r.permissions) ? perm)
            or (jsonb_typeof(to_jsonb(r.permissions)) = 'object' and to_jsonb(r.permissions) ->> perm = 'true')
          )
      );
$$;

revoke all on function public.console_is_owner() from public, anon;
revoke all on function public.console_is_member() from public, anon;
revoke all on function public.console_can(text) from public, anon;
grant execute on function public.console_is_owner() to authenticated;
grant execute on function public.console_is_member() to authenticated;
grant execute on function public.console_can(text) to authenticated;

-- 2. Tables de la console : lecture pour les membres, écriture selon la permission.

do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('admin_settings',      'settings'),
      ('admin_contents',      'contents'),
      ('admin_notifications', 'notifications'),
      ('admin_ai_settings',   'ai'),
      ('admin_ai_prompts',    'ai'),
      ('admin_ai_usage',      'ai'),
      ('admin_subscriptions', 'subscriptions'),
      ('admin_payments',      'revenue')
    ) as v(tbl, perm)
  loop
    if to_regclass('public.' || t.tbl) is null then
      continue;
    end if;
    execute format('drop policy if exists %I on public.%I', 'admin_all_' || t.tbl, t.tbl);
    execute format('drop policy if exists %I on public.%I', t.tbl || '_select_console', t.tbl);
    execute format('drop policy if exists %I on public.%I', t.tbl || '_insert_perm', t.tbl);
    execute format('drop policy if exists %I on public.%I', t.tbl || '_update_perm', t.tbl);
    execute format('drop policy if exists %I on public.%I', t.tbl || '_delete_perm', t.tbl);

    execute format(
      'create policy %I on public.%I for select to authenticated using (public.console_is_member())',
      t.tbl || '_select_console', t.tbl);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.console_can(%L))',
      t.tbl || '_insert_perm', t.tbl, t.perm);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.console_can(%L)) with check (public.console_can(%L))',
      t.tbl || '_update_perm', t.tbl, t.perm, t.perm);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.console_can(%L))',
      t.tbl || '_delete_perm', t.tbl, t.perm);
  end loop;
end $$;

-- 3. admin_roles : lecture pour les membres ; création / modification / suppression
--    réservées à l'administrateur principal (sinon un membre peut s'auto-promouvoir).

drop policy if exists admin_all_admin_roles on public.admin_roles;
drop policy if exists admin_roles_select_console on public.admin_roles;
drop policy if exists admin_roles_write_owner on public.admin_roles;

create policy admin_roles_select_console on public.admin_roles
  for select to authenticated using (public.console_is_member());
create policy admin_roles_write_owner on public.admin_roles
  for all to authenticated
  using (public.console_is_owner())
  with check (public.console_is_owner());

-- 4. Journal d'audit : lecture pour les membres, ajout pour les membres,
--    jamais de modification ni de suppression (intégrité du journal).

drop policy if exists admin_all_admin_audit_logs on public.admin_audit_logs;
drop policy if exists admin_audit_logs_select_console on public.admin_audit_logs;
drop policy if exists admin_audit_logs_insert_console on public.admin_audit_logs;

create policy admin_audit_logs_select_console on public.admin_audit_logs
  for select to authenticated using (public.console_is_member());
create policy admin_audit_logs_insert_console on public.admin_audit_logs
  for insert to authenticated with check (public.console_is_member());
-- (Aucune politique UPDATE / DELETE permissive : ces opérations sont refusées.)

-- 5. Profils : seuls les membres ayant la permission « users » peuvent modifier
--    le profil d'un autre utilisateur (le trigger guard_profile_privileges protège déjà
--    role, admin_role_id, email et statut).

drop policy if exists admin_update_all_profiles on public.profiles;
create policy admin_update_all_profiles on public.profiles
  for update to authenticated
  using (public.console_can('users'))
  with check (public.console_can('users'));

-- 6. Défense en profondeur : les visiteurs non connectés n'écrivent jamais dans ces tables.

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'income', 'expenses', 'goals', 'projects', 'financial_profiles',
    'admins', 'admin_roles', 'admin_settings', 'admin_contents', 'admin_notifications',
    'admin_audit_logs', 'admin_ai_settings', 'admin_ai_prompts', 'admin_ai_usage',
    'admin_subscriptions', 'admin_payments', 'assistant_usage'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('revoke insert, update, delete on public.%I from anon', t);
    end if;
  end loop;
end $$;

-- 7. Photos de profil : uniquement des images, 5 Mo maximum
--    (empêche d'héberger du HTML ou d'autres fichiers dans le bucket public).

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 5242880
where id = 'avatars';
