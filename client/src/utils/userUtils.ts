import { supabase } from './supabase';

/**
 * Busca o role de um usuário pelo ID
 * @param userId - ID do usuário
 * @returns Promise<string | null> - Role do usuário ou null se não encontrado
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ [getUserRole] Erro ao buscar role do usuário:', error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error('💥 [getUserRole] Erro inesperado ao buscar role do usuário:', error);
    return null;
  }
}

/**
 * Redireciona para a página de perfil público baseado no role do usuário
 * @param userId - ID do usuário
 * @param navigate - Função de navegação do React Router
 */
export async function redirectToUserProfile(userId: string, navigate?: (path: string) => void) {
  try {
    const userRole = await getUserRole(userId);
    
    if (!userRole) {
      console.error('❌ [redirectToUserProfile] Não foi possível obter o role do usuário');
      return;
    }

    let redirectPath = '';
    
    if (userRole === 'mentor') {
      redirectPath = `/mentor/publicview/${userId}`;
    } else if (userRole === 'mentorado') {
      redirectPath = `/mentorado/publicview/${userId}`;
    } else {
      console.error('❌ [redirectToUserProfile] Role não reconhecido:', userRole);
      return;
    }

    console.log('🔄 [redirectToUserProfile] Redirecionando para:', redirectPath);
    
    if (navigate) {
      navigate(redirectPath);
    } else {
      // Fallback para window.location se navigate não estiver disponível
      window.location.href = redirectPath;
    }
  } catch (error) {
    console.error('💥 [redirectToUserProfile] Erro ao redirecionar:', error);
  }
}