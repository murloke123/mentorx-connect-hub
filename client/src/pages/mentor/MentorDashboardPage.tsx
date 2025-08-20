import AnalyticsSection from '@/components/mentor/AnalyticsSection';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import StatsSection from '@/components/mentor/StatsSection';
import LoadingComponent from '@/components/shared/LoadingComponent';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useStripeAccountStatus } from '@/hooks/useStripeAccountStatus';
import { useStripeFinancialData } from '@/hooks/useStripeFinancialData';
import { getMentorCoursesById, getMentorEnrollmentStatsById, getMentorFollowersCountById, getMentorProfileById } from '@/services/mentorService';
import { Course } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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
    return <LoadingComponent message="Verificando autenticação" variant="full-screen" />;
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
    <div className="flex-col md:flex-row flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-sm border border-gold/20 hover:bg-slate-800/80 hover:border-gold/40"
          >
            <Menu className="h-6 w-6 text-gold" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <MentorSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MentorSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 pt-8 md:pt-6 min-h-screen bg-black relative">
        {/* Card de Conta Verificada - Responsivo */}
        {stripeStatus.stripe_onboarding_status && (
          <div className="relative md:absolute md:top-6 md:right-6 z-10 mb-4 md:mb-0">
            <div className="bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50 border border-gold/20 rounded-lg px-4 py-2 backdrop-blur-xl shadow-lg shadow-gold/10 h-[45px] flex items-center w-full md:min-w-[300px] md:w-auto">
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

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gold">
            Dashboard do Mentor
          </h1>
          <p className="text-gray-300 text-base md:text-lg">
            Gerencie suas mentorias e acompanhe seu progresso
          </p>
        </div>

        {/* Debug Info - Mostrar status do Stripe */}
        {isLoadingStripeData && (
          <div className="mb-6">
            <LoadingComponent message="Carregando dados financeiros" variant="minimal" />
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
