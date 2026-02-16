import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string, userMetadata?: any) => {
    try {
      // First, check user_metadata.role (set by promotion script)
      if (userMetadata?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      // Fallback: check via RPC if table exists
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
        clearTimeout(timeoutId);
        if (error) {
          console.warn('RPC has_role error (table may not exist):', error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(!!data);
      } catch (rpcError) {
        console.warn('RPC call failed or timed out:', rpcError);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Error in checkAdmin:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Increased timeout for slow connections
        const sessionTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth session timeout")), 20000)
        );

        const result: any = await Promise.race([
          supabase.auth.getSession(),
          sessionTimeout,
        ]);

        const session = result?.data?.session ?? null;
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkAdmin(session.user.id, session.user.user_metadata);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        if (!isMounted) return;
        console.warn("Auth session restore failed:", error);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkAdmin(session.user.id, session.user.user_metadata);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error("Supabase signOut error:", error.message);
    }
    // Ensure local auth state is cleared even if signOut fails
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
    } catch (storageError) {
      console.error("Failed to clear auth storage:", storageError);
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
