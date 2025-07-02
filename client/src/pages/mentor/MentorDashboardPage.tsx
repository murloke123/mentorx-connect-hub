import AnalyticsSection from '@/components/mentor/AnalyticsSection';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import StatsSection from '@/components/mentor/StatsSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStripeAccountStatus } from '@/hooks/useStripeAccountStatus';
import { getMentorCoursesById, getMentorEnrollmentStatsById, getMentorFollowersCountById, getMentorProfileById } from '@/services/mentorService';
import { Course } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Timer } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Hook que executa polling automático do Stripe
  const { status: stripeStatus } = useStripeAccountStatus();
  
  // ✅ OTIMIZADO: Cache gerenciado pelo useAuth - evita invalidações excessivas
  useEffect(() => {
    // Invalidação de cache movida para useAuth para evitar chamadas repetidas
    // quando user?.id muda. O useAuth já gerencia limpeza de cache adequadamente.
  }, []); // ✅ Array vazio - sem dependências que causem re-execuções desnecessárias
  
  // ✅ OTIMIZADO: Usar funções que recebem userId (eliminam chamadas getUser)
  const { data: profile } = useQuery({
    queryKey: ['mentorProfile', user?.id],
    queryFn: () => getMentorProfileById(user!.id),
    enabled: !!user?.id,
  });
  
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['mentorCourses', user?.id],
    queryFn: () => getMentorCoursesById(user!.id),
    enabled: !!user?.id,
  });
  
  const { data: followersCount = 0 } = useQuery<number>({
    queryKey: ['mentorFollowers', user?.id],
    queryFn: () => getMentorFollowersCountById(user!.id),
    enabled: !!user?.id,
  });
  
  const { data: enrollmentStats } = useQuery({
    queryKey: ['mentorEnrollmentStats', user?.id],
    queryFn: () => getMentorEnrollmentStatsById(user!.id),
    enabled: !!user?.id,
  });

  // Se não há usuário logado, não renderiza o dashboard
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Carregando...</h2>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Stats calculations
  const totalCourses = courses.length;
  const totalActiveEnrollments = enrollmentStats?.activeEnrollments || 0;
  const totalInactiveEnrollments = enrollmentStats?.inactiveEnrollments || 0;
  const totalEnrollments = totalActiveEnrollments + totalInactiveEnrollments;
  
  // Calculate estimated revenue (for paid courses)
  const totalRevenue = enrollmentStats?.totalRevenue || 0;

  // Função para redirecionar para onboarding
  const handleGoToOnboarding = () => {
    navigate('/mentor/stripe-onboarding');
  };
  
  return (
    <div className="flex min-w-[1200px] overflow-x-auto">
      <MentorSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {profile ? `Bem-vindo(a), ${profile.full_name || 'Mentor(a)'}!` : 'Painel do Mentor'}
          </h1>
          <p className="text-gray-600">Gerencie suas métricas e acompanhe seu desempenho.</p>
        </div>

        {/* Stripe Status Display */}
        {stripeStatus.stripe_onboarding_status && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              {stripeStatus.stripe_onboarding_status === 'completed' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-700">Conta Verificada</Badge>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleGoToOnboarding}
                    size="sm"
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white shadow-lg"
                  >
                    Preencher Dados para Começar a Receber
                  </Button>
                  <Timer className="w-8 h-8 text-slate-700 animate-pulse ml-4" />
                  <Badge className="bg-yellow-100 text-yellow-700 animate-pulse">Aguardando preenchimento de dados da conta ...</Badge>
                </>
              )}
              {stripeStatus.lastChecked && (
                <span className="text-sm text-gray-500 ml-auto">
                  Última verificação: {stripeStatus.lastChecked.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <StatsSection 
          followersCount={followersCount} 
          totalCourses={totalCourses}
          activeEnrollments={totalActiveEnrollments}
          inactiveEnrollments={totalInactiveEnrollments}
          totalRevenue={totalRevenue}
        />

        {/* Analytics Section */}
        <AnalyticsSection />
      </div>
    </div>
  );
};

export default MentorDashboardPage;
