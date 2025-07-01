import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: 'admin' | 'mentor' | 'mentorado' | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useOptimizedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(async (session: Session | null) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      setAuthState({
        session,
        user: session.user,
        profile,
        loading: false,
        error: null,
      });
    } else {
      setAuthState({
        session: null,
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (error) {
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        } else {
          updateAuthState(session);
        }
      }
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          await updateAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao fazer logout' 
      }));
    }
  }, []);

  const isAuthenticated = useMemo(() => !!authState.session, [authState.session]);
  
  const userRole = useMemo(() => authState.profile?.role || null, [authState.profile?.role]);

  const userInitials = useMemo(() => {
    if (authState.profile?.full_name) {
      return authState.profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return authState.user?.email?.charAt(0).toUpperCase() || 'U';
  }, [authState.profile?.full_name, authState.user?.email]);

  return {
    ...authState,
    isAuthenticated,
    userRole,
    userInitials,
    signOut,
  };
}; 