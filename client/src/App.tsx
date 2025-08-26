import ResetPassword from "@/components/auth/ResetPassword";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Footer from "@/components/shared/Footer";
import Navigation from "@/components/shared/Navigation";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ContadorTestPage from "@/pages/ContadorTestPage";
import DocumentTestPage from "@/pages/DocumentTestPage";
import { TestDocumentVerificationPage } from "@/pages/TestDocumentVerificationPage";

import JitsiMeetTestPage from "@/pages/test/JitsiMeetTestPage";
import TestMCPPage from "@/pages/TestMCPPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
// Importando todas as páginas do sistema centralizado de lazy loading
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";
import HomePage from "@/pages/HomePage";
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
    AppointmentCheckoutSuccessPage,
    CourseLandingPage,
    // Páginas públicas
    CoursePlayerPage,
    CoursePublicView,
    CoursesMobilePage,
    CoursesPage,
    LoginPage,
    MentoradoConfiguracoesPage,
    // Mentorado
    MentoradoDashboardPage,
    MentoradoMeusAgendamentosPage,
    MentoradoMeusCursosPage, MentoradoMeusMentoresPage,
    MentoradoProfilePage,
    MentoradoPublicViewPage,
    MentorAgendamentosAdquiridosPage,
    MentorAgendamentosPage,
    MentorCategoriasPage,
    MentorConfiguracoesPage,
    MentorConteudosPage,
    MentorCriarCursoPage,
    MentorCursoInscricoesPage,
    MentorCursosAdquiridosPage,
    // Mentor
    MentorDashboardPage,
    MentorEditarCursoPage,
    MentorMapeamentoDBPage,
    MentorMeusCursosPage,
    MentorMeusMentoradosPage,
    MentorModulosPage,
    MentorProfilePage, MentorPublicProfilePage,
    MentorPublicSchedulePage,
    MentorRotasPage,
    MentorsMobilePage,
    MentorsPage,
    MentorStripeOnboardingPage,
    NotFound,
    // Helpers
    preloadCriticalComponents
} from '@/utils/lazyComponents';
// Importar funções utilitárias para debug (disponíveis no console)
import MobileRedirect from '@/components/MobileRedirect';
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
  
  const { isCoursePlayerPage, isMentorPublicProfilePage, isMentoradoPublicViewPage, isLandingPageEditPage } = useMemo(() => ({
    isCoursePlayerPage: location.pathname.includes('/mentor/meus-cursos/view/') || location.pathname.includes('/mentorado/cursoplayer/') || location.pathname.includes('/mentor/cursoplayer/'),
    isMentorPublicProfilePage: location.pathname.includes('/mentor/publicview/'),
    isMentoradoPublicViewPage: location.pathname.includes('/mentorado/publicview/'),
    isLandingPageEditPage: location.pathname.includes('/landing-page')
  }), [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isCoursePlayerPage && !isMentorPublicProfilePage && !isMentoradoPublicViewPage && !isLandingPageEditPage && <Navigation />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={
            <MobileRedirect mobileRoute="/courses-mobile">
              <CoursesPage />
            </MobileRedirect>
          } />
          <Route path="/courses-mobile" element={<CoursesMobilePage />} />
          <Route path="/mentors" element={
            <MobileRedirect mobileRoute="/mentors-mobile">
              <MentorsPage />
            </MobileRedirect>
          } />
          <Route path="/mentors-mobile" element={<MentorsMobilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/document-test" element={<DocumentTestPage />} />
          <Route path="/contador-test" element={<ContadorTestPage />} />
          <Route path="/test-document-verification" element={<TestDocumentVerificationPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/appointment-checkout-success" element={<AppointmentCheckoutSuccessPage />} />
          <Route path="/curso/:courseId" element={<CoursePublicView />} />
          
          {/* Rotas de Mentor - Protegidas */}
          <Route path="/mentor/dashboard" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/perfil" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/publicview/:id" element={<MentorPublicProfilePage />} />
          <Route path="/mentor/publicschedule/:id" element={<MentorPublicSchedulePage />} />
          <Route path="/mentorado/publicview/:id" element={<MentoradoPublicViewPage />} />
          <Route path="/mentor/meus-cursos" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorMeusCursosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/cursos-adquiridos" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorCursosAdquiridosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/meus-cursos/novo" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorCriarCursoPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/meus-cursos/:id/editar" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorEditarCursoPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/meus-cursos/view/:id" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <CoursePlayerPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/cursoplayer/:id" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <CoursePlayerPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/meus-cursos/:courseId/landing-page" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <CourseLandingPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/meus-cursos/:cursoId/modulos" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorModulosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/meus-cursos/:cursoId/modulos/:moduloId" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorConteudosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/meus-cursos/:courseId/inscricoes" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorCursoInscricoesPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/categorias" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorCategoriasPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/mentorados" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorMeusMentoradosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/agendamentos" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorAgendamentosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/agendamentos-adquiridos" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorAgendamentosAdquiridosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/configuracoes" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorConfiguracoesPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/configuracoes/rotas" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorRotasPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/configuracoes/database-mapping" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorMapeamentoDBPage />
            </ProtectedRoute>
          } />
          <Route path="/mentor/stripe-onboarding" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorStripeOnboardingPage />
            </ProtectedRoute>
          } />

          
          {/* Rotas de Mentorado - Protegidas */}
          <Route path="/mentorado/dashboard" element={
            <ProtectedRoute allowedRoles={['mentorado']}>
              <MentoradoDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/mentorado/perfil" element={
            <ProtectedRoute allowedRoles={['mentorado']}>
              <MentoradoProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/mentorado/cursos" element={
            <ProtectedRoute allowedRoles={['mentorado']}>
              <MentoradoMeusCursosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentorado/cursoplayer/:id" element={
            <ProtectedRoute allowedRoles={['mentorado']}>
              <CoursePlayerPage />
            </ProtectedRoute>
          } />
          <Route path="/mentorado/mentores" element={
            <ProtectedRoute allowedRoles={['mentorado']}>
              <MentoradoMeusMentoresPage />
            </ProtectedRoute>
          } />
          <Route path="/mentorado/meus-agendamentos" element={
            <ProtectedRoute allowedRoles={['mentorado']}>
              <MentoradoMeusAgendamentosPage />
            </ProtectedRoute>
          } />
          <Route path="/mentorado/configuracoes" element={
            <ProtectedRoute allowedRoles={['mentorado']}>
              <MentoradoConfiguracoesPage />
            </ProtectedRoute>
          } />
          
          {/* Rotas de Administrador - Protegidas */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/perfil" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admin/mentores" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMentoresPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/mentorados" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMentoradosPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/cursos" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCursosPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/categorias" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCategoriasPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/calendario" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCalendarioPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/relatorios" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <NotFound />
            </ProtectedRoute>
          } />
          <Route path="/admin/configuracoes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminConfiguracoesPage />
            </ProtectedRoute>
          } />
          
          {/* Rota pública do Course Player para usuários deslogados */}
          <Route path="/cursoplayer/:id" element={<CoursePlayerPage />} />
          
          {/* Rotas de Teste */}
          <Route path="/testemcp" element={<TestMCPPage />} />
          <Route path="/test/jitsi-meet" element={<JitsiMeetTestPage />} />
          
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
