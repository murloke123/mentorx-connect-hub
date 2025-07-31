import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
  }, [navigate]);

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
        console.log('👨‍🏫 CheckoutSuccessPage: Mentor comprou curso, redirecionando para /mentor/cursos-adquiridos');
        navigate('/mentor/cursos-adquiridos');
      } else if (userRole === 'mentorado') {
        console.log('👨‍🎓 CheckoutSuccessPage: Mentorado comprou curso, redirecionando para /mentorado/cursos');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <CardHeader className="text-center border-b border-slate-700 pb-6">
          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-full mb-4 shadow-lg">
            <Clock className="w-6 h-6 text-slate-900 animate-spin" />
          </div>
          <CardTitle className="text-white text-xl font-semibold">Processando Pagamento</CardTitle>
          <CardDescription className="text-gray-300">
            Aguarde, estamos processando seu pagamento...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-2 bg-gradient-to-r from-gold/30 via-gold-light/30 to-gold/30 rounded w-full mb-2"></div>
              <div className="h-2 bg-gradient-to-r from-gold/20 via-gold-light/20 to-gold/20 rounded w-3/4 mx-auto"></div>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Você será redirecionado para seus cursos em instantes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccessPage;