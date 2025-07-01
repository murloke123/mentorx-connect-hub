import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
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
  }, [queryClient]); // ✅ CORRIGIDO: Removido user?.id das dependências - elimina loop infinito

  return { user, loading, error };
};
