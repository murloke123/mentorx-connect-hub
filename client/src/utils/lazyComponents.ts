import { lazy } from 'react';

// Lazy loading centralizado seguindo as regras de performance
// Separando por domínio para melhor code splitting

// ===== PÁGINAS PRINCIPAIS =====
export const HomePage = lazy(() => import('../pages/HomePage'));
export const AboutPage = lazy(() => import('@/pages/AboutPage'));
export const CoursesPage = lazy(() => import('@/pages/CoursesPage'));
export const MentorsPage = lazy(() => import('@/pages/MentorsPage'));
export const CoursesMobilePage = lazy(() => import('@/pages/CoursesMobilePage'));
export const MentorsMobilePage = lazy(() => import('@/pages/MentorsMobilePage'));
export const LoginPage = lazy(() => import('@/pages/LoginPage'));
export const NotFound = lazy(() => import('@/pages/NotFound'));

// ===== PÁGINAS PÚBLICAS =====
export const CoursePlayerPage = lazy(() => import('@/pages/CoursePlayerPage'));
export const CourseLandingPage = lazy(() => import('@/pages/mentor/CourseLandingPage'));
export const CourseLandingPublicPage = lazy(() => import('@/pages/CourseLandingPublicPage'));
export const CoursePublicView = lazy(() => import('@/pages/CoursePublicView'));

// ===== PÁGINAS DE CHECKOUT =====
export const AppointmentCheckoutSuccessPage = lazy(() => import('@/pages/AppointmentCheckoutSuccessPage'));

// ===== ADMIN PAGES - Chunk separado =====
export const AdminDashboardPage = lazy(() => 
  import('@/pages/admin/AdminDashboardPage').then(module => ({ 
    default: module.default 
  }))
);
export const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'));
export const AdminMentoresPage = lazy(() => import('@/pages/admin/AdminMentoresPage'));
export const AdminMentoradosPage = lazy(() => import('@/pages/admin/AdminMentoradosPage'));
export const AdminCursosPage = lazy(() => import('@/pages/admin/AdminCursosPage'));
export const AdminCategoriasPage = lazy(() => import('@/pages/admin/AdminCategoriasPage'));
export const AdminCalendarioPage = lazy(() => import('@/pages/admin/AdminCalendarioPage'));
export const AdminConfiguracoesPage = lazy(() => import('@/pages/admin/AdminConfiguracoesPage'));

// ===== MENTOR PAGES - Chunk separado =====
// NOTA: MentorTemplatesEmailPage foi removido - não adicionar novamente
export const MentorDashboardPage = lazy(() => import('@/pages/mentor/MentorDashboardPage'));
export const MentorProfilePage = lazy(() => import('@/pages/mentor/MentorProfilePage'));
export const MentorPublicProfilePage = lazy(() => import('@/pages/mentor/MentorPublicProfilePage'));
export const MentorPublicSchedulePage = lazy(() => import('@/pages/mentor/MentorPublicSchedulePage'));
export const MentorMeusCursosPage = lazy(() => import('@/pages/mentor/MentorMeusCursosPage'));
export const MentorCursosAdquiridosPage = lazy(() => import('@/pages/mentor/MentorCursosAdquiridosPage'));
export const MentorCriarCursoPage = lazy(() => import('@/pages/mentor/MentorCriarCursoPage'));
export const MentorEditarCursoPage = lazy(() => import('@/pages/mentor/MentorEditarCursoPage'));
export const MentorModulosPage = lazy(() => import('@/pages/mentor/MentorModulosPage'));
export const MentorConteudosPage = lazy(() => import('@/pages/mentor/MentorConteudosPage'));
export const MentorCategoriasPage = lazy(() => import('@/pages/mentor/MentorCategoriasPage'));
export const MentorMeusMentoradosPage = lazy(() => import('@/pages/mentor/MentorMeusMentoradosPage'));
export const MentorCursoInscricoesPage = lazy(() => import('@/pages/mentor/MentorCursoInscricoesPage'));
export const MentorAgendamentosPage = lazy(() => import('@/pages/mentor/MentorAgendamentosPage'));
export const MentorAgendamentosAdquiridosPage = lazy(() => import('@/pages/mentor/MentorAgendamentosAdquiridosPage'));
export const MentorConfiguracoesPage = lazy(() => import('@/pages/mentor/MentorConfiguracoesPage'));
export const MentorRotasPage = lazy(() => import('@/pages/mentor/MentorRotasPage'));
export const MentorMapeamentoDBPage = lazy(() => import('@/pages/mentor/MentorMapeamentoDBPage'));
export const MentorStripeOnboardingPage = lazy(() => import('@/pages/mentor/MentorStripeOnboardingPage'));
export const MentorLeadsPage = lazy(() => import('@/pages/mentor/MentorLeadsPage'));


// ===== MENTORADO PAGES - Chunk separado =====
export const MentoradoDashboardPage = lazy(() => import('@/pages/mentorado/MentoradoDashboardPage'));
export const MentoradoProfilePage = lazy(() => import('@/pages/mentorado/MentoradoProfilePage'));
export const MentoradoPublicViewPage = lazy(() => import('@/pages/mentorado/MentoradoPublicViewPage'));
export const MentoradoMeusCursosPage = lazy(() => import('@/pages/mentorado/MentoradoMeusCursosPage'));
export const MentoradoMeusMentoresPage = lazy(() => import('@/pages/mentorado/MentoradoMeusMentoresPage'));
export const MentoradoMeusAgendamentosPage = lazy(() => import('@/pages/mentorado/MentoradoMeusAgendamentosPage'));
export const MentoradoConfiguracoesPage = lazy(() => import('@/pages/mentorado/MentoradoConfiguracoesPage'));

// ===== PRELOAD HELPERS =====
// Preload de rotas críticas baseado no papel do usuário
export const preloadUserRoutes = (userRole: string | null) => {
  if (!userRole) return;

  // Preload baseado no papel do usuário
  switch (userRole) {
    case 'admin':
      import('@/pages/admin/AdminDashboardPage');
      import('@/pages/admin/AdminMentoresPage');
      break;
    case 'mentor':
      import('@/pages/mentor/MentorDashboardPage');
      import('@/pages/mentor/MentorMeusCursosPage');
      break;
    case 'mentorado':
      import('@/pages/mentorado/MentoradoDashboardPage');
      import('@/pages/mentorado/MentoradoMeusCursosPage');
      break;
  }
};

// Preload de componentes críticos
export const preloadCriticalComponents = () => {
  // Preload de componentes que são usados frequentemente
  import('@/components/shared/Navigation');
  import('@/components/shared/Footer');
  import('@/components/ui/button');
  import('@/components/ui/card');
};