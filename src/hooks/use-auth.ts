import { useCallback, useEffect, useState } from "react";
import { checkIsAdmin, getToken, loginWithCode, setToken } from "@/lib/api";

export interface AuthUser {
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!getToken()) {
      setLoading(false);
      return;
    }

    checkIsAdmin()
      .then((ok) => {
        if (active) setUser(ok ? { role: "admin" } : null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (code: string) => {
    const res = await loginWithCode(code);
    setUser({ role: res.user.role });
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    session: user ? { user } : null,
    isAuthenticated: Boolean(user),
    loading,
    signIn,
    signOut,
  };
}
