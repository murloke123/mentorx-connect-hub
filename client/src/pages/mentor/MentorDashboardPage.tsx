import AnalyticsSection from '@/components/mentor/AnalyticsSection';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import StatsSection from '@/components/mentor/StatsSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStripeAccountStatus } from '@/hooks/useStripeAccountStatus';
import { useStripeFinancialData } from '@/hooks/useStripeFinancialData';
import { getMentorCoursesById, getMentorEnrollmentStatsById, getMentorFollowersCountById, getMentorProfileById } from '@/services/mentorService';
import { Course } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Hook que executa polling automático do Stripe
  const { status: stripeStatus } = useStripeAccountStatus();
  
  // Hook para buscar dados financeiros do Stripe
  const { 
    pendingAmount, 
    paidAmount, 
    isLoading: isLoadingStripeData,
    error: stripeError,
    lastUpdated 
  } = useStripeFinancialData();
  
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



  // Log dos dados do Stripe para debug - MOVIDO PARA ANTES DO EARLY RETURN
  useEffect(() => {
    if (lastUpdated) {
      console.log('📊 MentorDashboard: Dados financeiros do Stripe atualizados:', {
        pendingAmount,
        paidAmount,
        totalRevenue: pendingAmount,
        totalPaidAmount: paidAmount,
        lastUpdated,
        isLoading: isLoadingStripeData,
        error: stripeError
      });
    }
  }, [pendingAmount, paidAmount, lastUpdated, isLoadingStripeData, stripeError]);

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
  const totalStudents = enrollmentStats?.totalStudents || 0;
  
  // ✅ NOVO: Usar dados do Stripe para receita e valores pagos
  const totalRevenue = pendingAmount; // Receita estimada = saldo pendente do Stripe
  const totalPaidAmount = paidAmount; // Valores pagos = payouts já realizados

  // Função para redirecionar para onboarding
  const handleGoToOnboarding = () => {
    navigate('/mentor/stripe-onboarding');
  };
  
  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 p-6 min-h-screen bg-black relative">
        {/* Card de Conta Verificada - Posicionado no canto superior direito */}
        {stripeStatus.stripe_onboarding_status && (
          <div className="absolute top-6 right-6 z-10">
            <div className="bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50 border border-gold/20 rounded-lg px-4 py-2 backdrop-blur-xl shadow-lg shadow-gold/10 h-[45px] flex items-center min-w-[300px]">
              <div className="flex items-center gap-2 w-full">
                {stripeStatus.stripe_onboarding_status === 'completed' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-gold" />
                    <span className="text-gold text-sm font-medium">Conta Verificada</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500 text-sm font-medium">
                      {stripeStatus.stripe_onboarding_status === 'pending' 
                        ? 'Verificação Pendente' 
                        : 'Verificação Necessária'
                      }
                    </span>
                    <Button 
                      size="sm" 
                      className="ml-2 bg-gold text-slate-900 hover:bg-gold/90"
                      onClick={handleGoToOnboarding}
                    >
                      Completar
                    </Button>
                  </>
                )}
                {stripeStatus.lastChecked && (
                  <span className="text-xs text-gray-500 ml-auto">
                    Última verificação: {stripeStatus.lastChecked.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gold">
            Dashboard do Mentor
          </h1>
          <p className="text-gray-300 text-lg">
            Gerencie suas mentorias e acompanhe seu progresso
          </p>
        </div>

        {/* Debug Info - Mostrar status do Stripe */}
        {isLoadingStripeData && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-gold/20">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2 w-5 h-5 text-gold animate-spin">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <Badge className="bg-slate-800/50 text-white border border-gold/30 backdrop-blur-sm">
                  Carregando Dados Financeiros
                </Badge>
                <span className="text-sm text-white ml-auto">Conectando com Stripe...</span>
              </div>
            </div>
          </div>
        )}
        
        {stripeError && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-red-500/20">
              <p className="text-red-400 text-sm">❌ Erro nos dados do Stripe: {stripeError}</p>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <StatsSection 
          followersCount={followersCount} 
          totalCourses={totalCourses}
          activeEnrollments={totalActiveEnrollments}
          totalStudents={totalStudents}
          totalRevenue={totalRevenue}
          totalPaidAmount={totalPaidAmount}
          totalMatriculasValue={enrollmentStats?.totalMatriculasValue || 0}
          totalAppointmentsValue={enrollmentStats?.totalAppointmentsValue || 0}
        />

        {/* Analytics Section */}
        <AnalyticsSection />
      </div>
    </div>
  );
};

export default MentorDashboardPage;
