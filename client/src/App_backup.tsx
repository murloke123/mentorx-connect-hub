import Footer from "@/components/shared/Footer";
import Navigation from "@/components/shared/Navigation";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
// Importando todas as páginas do sistema centralizado de lazy loading
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";
import {
    AboutPage,
    AdminCalendarioPage,
    AdminCategoriasPage,
    AdminConfiguracoesPage,
    AdminCursosPage,
    // Admin
    AdminDashboardPage,
    AdminMentoradosPage,
    AdminMentoresPage,
    AdminProfilePage,
    CourseLandingPage, CourseLandingPublicPage,
    // Páginas públicas
    CoursePlayerPage,
    CoursePublicView,
    CoursesPage,
    // Páginas principais
    HomePage,
    LoginPage,
    MentoradoCalendarioPage, MentoradoConfiguracoesPage,
    // Mentorado
    MentoradoDashboardPage,
    MentoradoMeusCursosPage, MentoradoMeusMentoresPage,
    MentoradoProfilePage,
    MentorCalendarioPage,
    MentorCategoriasPage,
    MentorConfiguracoesPage,
    MentorConteudosPage,
    MentorCriarCursoPage,
    // Mentor
    MentorDashboardPage,
    MentorEditarCursoPage,
    MentorMapeamentoDBPage,
    MentorMeusCursosPage,
    MentorMeusMentoradosPage,
    MentorModulosPage,
    MentorProfilePage, MentorPublicProfilePage,
    MentorRotasPage,
    MentorsPage,
    MentorStripeOnboardingPage,
    NotFound,
    // Helpers
    preloadCriticalComponents
} from '@/utils/lazyComponents';
// Importar funções utilitárias para debug (disponíveis no console)
import '@/utils/updateVerificationStatus';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (gcTime é o novo nome para cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de Loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Componente para controlar a exibição do Navigation
const AppContent = () => {
  const location = useLocation();
  
  const { isCoursePlayerPage, isMentorPublicProfilePage, isLandingPageEditPage } = useMemo(() => ({
    isCoursePlayerPage: location.pathname.includes('/mentor/cursos/view/') || location.pathname.includes('/mentorado/cursoplayer/') || location.pathname.includes('/mentor/cursoplayer/'),
    isMentorPublicProfilePage: location.pathname.includes('/mentor/publicview/'),
    isLandingPageEditPage: location.pathname.includes('/landing-page')
  }), [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isCoursePlayerPage && !isMentorPublicProfilePage && !isLandingPageEditPage && <Navigation />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/mentors" element={<MentorsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/course/:courseId" element={<CoursePublicView />} />
          <Route path="/course-page/:courseId" element={<CourseLandingPublicPage />} />
          <Route path="/course-landing/:courseId" element={<CourseLandingPublicPage />} />
          <Route path="/curso/:courseId" element={<CoursePublicView />} />
          
          {/* Rotas de Mentor */}
          <Route path="/mentor/dashboard" element={<MentorDashboardPage />} />
          <Route path="/mentor/perfil" element={<MentorProfilePage />} />
          <Route path="/mentor/publicview/:id" element={<MentorPublicProfilePage />} />
          <Route path="/mentor/cursos" element={<MentorMeusCursosPage />} />
          <Route path="/mentor/cursos/novo" element={<MentorCriarCursoPage />} />
          <Route path="/mentor/cursos/:id/editar" element={<MentorEditarCursoPage />} />
          <Route path="/mentor/cursos/view/:id" element={<CoursePlayerPage />} />
          <Route path="/mentor/cursoplayer/:id" element={<CoursePlayerPage />} />
          <Route path="/mentor/cursos/:courseId/landing-page" element={<CourseLandingPage />} />
          <Route path="/mentor/cursos/:cursoId/modulos" element={<MentorModulosPage />} />
          <Route path="/mentor/cursos/:cursoId/modulos/:moduloId" element={<MentorConteudosPage />} />
          <Route path="/mentor/categorias" element={<MentorCategoriasPage />} />
          <Route path="/mentor/mentorados" element={<MentorMeusMentoradosPage />} />
          <Route path="/mentor/calendario" element={<MentorCalendarioPage />} />
          <Route path="/mentor/configuracoes" element={<MentorConfiguracoesPage />} />
          <Route path="/mentor/configuracoes/rotas" element={<MentorRotasPage />} />
          <Route path="/mentor/configuracoes/database-mapping" element={<MentorMapeamentoDBPage />} />
          <Route path="/mentor/stripe-onboarding" element={<MentorStripeOnboardingPage />} />
          
          {/* Rotas de Mentorado */}
          <Route path="/mentorado/dashboard" element={<MentoradoDashboardPage />} />
          <Route path="/mentorado/perfil" element={<MentoradoProfilePage />} />
          <Route path="/mentorado/cursos" element={<MentoradoMeusCursosPage />} />
          <Route path="/mentorado/cursoplayer/:id" element={<CoursePlayerPage />} />
          <Route path="/mentorado/mentores" element={<MentoradoMeusMentoresPage />} />
          <Route path="/mentorado/calendario" element={<MentoradoCalendarioPage />} />
          <Route path="/mentorado/configuracoes" element={<MentoradoConfiguracoesPage />} />
          
          {/* Rotas de Administrador */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/perfil" element={<AdminProfilePage />} />
          <Route path="/admin/mentores" element={<AdminMentoresPage />} />
          <Route path="/admin/mentorados" element={<AdminMentoradosPage />} />
          <Route path="/admin/cursos" element={<AdminCursosPage />} />
          <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
          <Route path="/admin/calendario" element={<AdminCalendarioPage />} />
          <Route path="/admin/relatorios" element={<NotFound />} />
          <Route path="/admin/configuracoes" element={<AdminConfiguracoesPage />} />
          
          {/* Rota 404 - deve ser a última */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      {!isCoursePlayerPage && !isMentorPublicProfilePage && !isLandingPageEditPage && <Footer />}
    </div>
  );
};

const App = () => {
  // Preload de componentes críticos na inicialização
  useEffect(() => {
    preloadCriticalComponents();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
