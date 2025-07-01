import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔄 CheckoutSuccessPage: Estado atual:', { userRole, loading });

  useEffect(() => {
    const getUserRoleByEmail = async () => {
      try {
        console.log('🚀 CheckoutSuccessPage: Iniciando busca do usuário');
        
        // Pegar usuário atual do Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('❌ CheckoutSuccessPage: Erro ao obter usuário:', authError);
          setLoading(false);
          return;
        }

        console.log('👤 CheckoutSuccessPage: Usuário encontrado:', user.email);

        // Buscar profile na tabela profiles pelo email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('email', user.email)
          .single();

        if (profileError || !profile) {
          console.error('❌ CheckoutSuccessPage: Erro ao buscar profile:', profileError);
          setLoading(false);
          return;
        }

        console.log('✅ CheckoutSuccessPage: Profile encontrado:', profile);
        setUserRole(profile.role);
        setLoading(false);

      } catch (error) {
        console.error('❌ CheckoutSuccessPage: Erro geral:', error);
        setLoading(false);
      }
    };

    getUserRoleByEmail();
  }, []);

  useEffect(() => {
    // Só executar redirecionamento quando tiver o role definido
    if (loading || !userRole) {
      console.log('⏳ CheckoutSuccessPage: Aguardando role...', { loading, userRole });
      return;
    }

    console.log('✅ CheckoutSuccessPage: Role definido, iniciando timer:', userRole);

    // Aguardar 3 segundos e redirecionar baseado no role
    const timer = setTimeout(() => {
      console.log('⏰ CheckoutSuccessPage: Timer executado, redirecionando...');

      if (userRole === 'mentor') {
        console.log('👨‍🏫 CheckoutSuccessPage: Redirecionando mentor para /mentor/cursos');
        navigate('/mentor/cursos?tab=meus-cursos');
      } else if (userRole === 'mentorado') {
        console.log('👨‍🎓 CheckoutSuccessPage: Redirecionando mentorado para /mentorado/cursos');
        navigate('/mentorado/cursos');
      } else {
        console.log('❓ CheckoutSuccessPage: Role não identificado, redirecionando para home');
        console.log('🔍 CheckoutSuccessPage: Role atual:', userRole);
        navigate('/');
      }
    }, 3000);

    console.log('📅 CheckoutSuccessPage: Timer criado, aguardando 3 segundos');

    return () => {
      console.log('🗑️ CheckoutSuccessPage: Limpando timer');
      clearTimeout(timer);
    };
  }, [navigate, userRole, loading]);

  console.log('🎨 CheckoutSuccessPage: Renderizando página');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Redirecionando...</h2>
        <p className="text-gray-600">Você será redirecionado para seus cursos.</p>
        {/* Debug info - remover depois */}
        <div className="mt-4 text-xs text-gray-400">
          Loading: {loading ? 'Sim' : 'Não'} | Role: {userRole || 'Buscando...'}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage; 