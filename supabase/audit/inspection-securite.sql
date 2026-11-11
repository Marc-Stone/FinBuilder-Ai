-- FinBuilder AI — inspection de sécurité (LECTURE SEULE : ne modifie rien).
-- À exécuter dans Supabase → SQL Editor, puis copier tout le résultat (Export → Copy as CSV/Markdown).

select 'A_rls' as section, c.relname as objet,
       case when c.relrowsecurity then 'RLS ON' else 'RLS OFF' end as detail
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'

union all
select 'B_policy',
       schemaname || '.' || tablename || ' :: ' || policyname,
       cmd || ' | roles=' || array_to_string(roles, ',')
         || ' | using=' || coalesce(qual, '-')
         || ' | check=' || coalesce(with_check, '-')
from pg_policies
where schemaname in ('public', 'storage')

union all
select 'C_trigger',
       event_object_schema || '.' || event_object_table || ' :: ' || trigger_name,
       action_timing || ' ' || event_manipulation || ' -> ' || action_statement
from information_schema.triggers
where event_object_schema in ('public', 'auth')

union all
select 'D_function',
       p.proname,
       (case when p.prosecdef then 'SECURITY DEFINER' else 'invoker' end)
         || ' | ' || pg_get_functiondef(p.oid)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f'

union all
select 'E_grant_profiles',
       table_name || '.' || column_name,
       grantee || ' ' || privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('role', 'admin_role_id', 'email', 'derniere_connexion')
  and grantee in ('anon', 'authenticated')
  and privilege_type in ('INSERT', 'UPDATE')

union all
select 'F_bucket', id, 'public=' || public::text
from storage.buckets

order by 1, 2;
