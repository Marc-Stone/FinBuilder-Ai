import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyAdminRole, type AdminRole } from "@/lib/roles";

type AdminAccessValue = {
  loading: boolean;
  member: boolean;
  fullAccess: boolean;
  role: AdminRole | null;
  roleName: string;
  permissions: string[];
  can: (permission: string) => boolean;
  reload: () => void;
};

const AdminAccessContext = createContext<AdminAccessValue | undefined>(undefined);

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const { session, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const userId = session?.user?.id;

  useEffect(() => {
    let mounted = true;

    if (authLoading) return () => undefined;
    if (!userId) {
      setMember(false);
      setRole(null);
      setRoleId(null);
      setLoading(false);
      return () => undefined;
    }

    setLoading(true);
    fetchMyAdminRole(userId)
      .then((result) => {
        if (!mounted) return;
        setMember(result.member);
        setRole(result.role);
        setRoleId(result.roleId);
      })
      .catch(() => {
        if (!mounted) return;
        setMember(false);
        setRole(null);
        setRoleId(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId, authLoading, reloadKey]);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  const fullAccess = !roleId && (member || profile?.role === "admin");
  const permissions = useMemo(() => role?.permissions ?? [], [role]);

  const can = useCallback(
    (permission: string) => fullAccess || permissions.includes(permission),
    [fullAccess, permissions],
  );

  const value = useMemo<AdminAccessValue>(
    () => ({
      loading,
      member,
      fullAccess,
      role,
      roleName: fullAccess ? "Admin" : role?.nom ?? "Accès limité",
      permissions,
      can,
      reload,
    }),
    [loading, member, fullAccess, role, permissions, can, reload],
  );

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}

export function useAdminAccess() {
  const context = useContext(AdminAccessContext);
  if (!context) {
    throw new Error("useAdminAccess doit être utilisé dans AdminAccessProvider");
  }
  return context;
}