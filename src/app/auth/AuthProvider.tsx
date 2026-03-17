import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  type AuthChangeEvent,
  type Session,
  type User
} from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { hasSupabase } from "@/lib/env";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  isConfigured: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function shouldRefreshQueries(event: AuthChangeEvent) {
  return event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setSession(null);
      } else {
        setSession(data.session);
      }

      setIsLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);

      if (shouldRefreshQueries(event)) {
        void queryClient.invalidateQueries();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: hasSupabase,
      isLoading,
      user: session?.user ?? null,
      session,
      async signIn(email, password) {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw new Error(error.message);
        }
      },
      async signUp(email, password) {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          throw new Error(error.message);
        }
      },
      async signOut() {
        if (!supabase) {
          return;
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
          throw new Error(error.message);
        }
      }
    }),
    [isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

