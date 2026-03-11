import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user' | 'superadmin';

const SUPERADMIN_EMAIL = 'osvaldo@mkt.grupotiradentes.com';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  rolesLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}


export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    rolesLoading: false,
    isAdmin: false,
    isSuperAdmin: false,
  });

  const checkRoles = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking roles:', error);
        return { isAdmin: false, isSuperAdmin: false };
      }

      const roles = data?.map(r => r.role) || [];
      const isSuperAdmin = roles.includes('superadmin') || email === SUPERADMIN_EMAIL;
      const isAdmin = isSuperAdmin || roles.includes('admin');

      return { isAdmin, isSuperAdmin };
    } catch (error) {
      console.error('Error checking roles:', error);
      return { isAdmin: false, isSuperAdmin: false };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        if (!session?.user) {
          if (mounted) setAuthState(prev => ({ ...prev, user: null, session: null, isLoading: false, isAdmin: false, isSuperAdmin: false }));
          return;
        }

        const { isAdmin, isSuperAdmin } = await checkRoles(session.user.id, session.user.email);

        if (mounted) {
          setAuthState({
            user: session.user,
            session,
            isLoading: false,
            rolesLoading: false,
            isAdmin,
            isSuperAdmin,
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
        if (mounted) setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session?.user) {
          const { isAdmin, isSuperAdmin } = await checkRoles(session.user.id, session.user.email);
          setAuthState({
            user: session.user,
            session,
            isLoading: false,
            rolesLoading: false,
            isAdmin,
            isSuperAdmin,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            rolesLoading: false,
            isAdmin: false,
            isSuperAdmin: false,
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRoles]);

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    return res;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return res;
  };

  const signOut = async () => {
    const res = await supabase.auth.signOut();
    return res;
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
}