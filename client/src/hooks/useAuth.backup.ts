import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      
      setUser((prevUser) => {
        const previousUserId = prevUser?.id;
        const newUserId = newUser?.id;
        
        // Se o usuário mudou (login/logout/switch), limpar cache
        if (previousUserId !== newUserId) {
          console.log('🔄 Usuário mudou, limpando cache React Query');
          console.log('👤 Usuário anterior:', previousUserId);
          console.log('👤 Novo usuário:', newUserId);
          
          // Limpar todo o cache para evitar dados misturados entre usuários
          queryClient.clear();
        }
        
        return newUser;
      });
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signOut = async () => {
    try {
      console.log('🚪 useAuth: Iniciando logout...');
      
      // PRIMEIRO: Resetar estado local
      setUser(null);
      setError(null);
      
      // SEGUNDO: Limpar cache React Query
      queryClient.clear();
      
      // TERCEIRO: Limpar localStorage (sem dependência de sessão)
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-auth-token');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Aviso: não foi possível limpar storage:', e);
      }
      
      // QUARTO: Tentar logout no Supabase (se houver sessão)
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        // Se falhar (ex: sessão já expirada), não é problema crítico
        console.warn('Aviso: logout no Supabase falhou (pode ser normal):', supabaseError);
      }
      
      console.log('✅ useAuth: Logout concluído');
    } catch (error) {
      console.error('❌ useAuth: Erro no logout:', error);
      // Mesmo com erro, garante que o usuário seja deslogado localmente
      setUser(null);
      setError(null);
      queryClient.clear();
    }
  };

  return { user, loading, error, signOut };
};
