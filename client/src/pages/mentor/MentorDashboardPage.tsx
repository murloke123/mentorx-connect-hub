import AnalyticsSection from '@/components/mentor/AnalyticsSection';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import StatsSection from '@/components/mentor/StatsSection';
import StripeOnboardingAlert from '@/components/mentor/StripeOnboardingAlert';
import { useAuth } from '@/hooks/useAuth';
import { useStripeAccountStatus } from '@/hooks/useStripeAccountStatus';
import { getMentorCoursesById, getMentorEnrollmentStatsById, getMentorFollowersCountById, getMentorProfileById } from '@/services/mentorService';
import { Course } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const MentorDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Verificação automática do status da conta Stripe
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
  
  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {profile ? `Bem-vindo(a), ${profile.full_name || 'Mentor(a)'}!` : 'Painel do Mentor'}
          </h1>
          <p className="text-gray-600">Gerencie suas métricas e acompanhe seu desempenho.</p>
        </div>

        {/* Stripe Onboarding Alert */}
        <StripeOnboardingAlert className="mb-6" />

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
