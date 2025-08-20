import { Course } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Bot, Menu, PlusCircle } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ChatModal from "../../components/chat/ChatModal";
import CoursesList from "../../components/mentor/CoursesList";
import MentorSidebar from "../../components/mentor/MentorSidebar";
import { Button } from "../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { getMentorCourses } from '../../services/courseService';
import { supabase } from '../../utils/supabase';

const MeusCursosPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isUnpublishedCoursesAlertOpen, setIsUnpublishedCoursesAlertOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        queryClient.invalidateQueries({ queryKey: ['mentorCourses', session.user.id] });
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        queryClient.invalidateQueries({ queryKey: ['mentorCourses', session.user.id] });
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [queryClient]);

  // Obter usuário atual
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: () => supabase.auth.getSession(),
  });

  const userId = sessionData?.data?.session?.user?.id;

  const { data: coursesData = [], isLoading, isFetching, isError, error } = useQuery<Course[]>({
    queryKey: ['mentorCourses', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return getMentorCourses(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1,
    retry: 1,
  });

  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching mentor courses:", error);
    }
  }, [isError, error]);

  // Verificar se há cursos não publicados e mostrar modal de alerta
  useEffect(() => {
    if (coursesData && coursesData.length > 0) {
      const hasUnpublishedCourses = coursesData.some(course => !course.is_published);
      if (hasUnpublishedCourses) {
        setIsUnpublishedCoursesAlertOpen(true);
      }
    }
  }, [coursesData]);

  const totalEnrollments = coursesData.reduce((sum, courseItem) => {
    const enrollmentCount = courseItem.enrollments_count || 0;
    return sum + enrollmentCount;
  }, 0);

  const handleCreateCourse = () => {
    navigate('/mentor/meus-cursos/novo');
  };

  const handleOpenChatModal = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
  };

  const listIsLoading = isLoading || isFetching;

  return (
    <div className="flex-col md:flex-row flex min-h-screen max-w-full overflow-x-hidden">
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

      <div className="flex-1 transition-all duration-300 p-3 md:p-6 pt-8 md:pt-6 min-h-screen bg-black max-w-full overflow-x-hidden">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gold">Meus Cursos</h1>
            <p className="text-sm md:text-base text-muted-foreground">Gerencie e acompanhe seus cursos criados</p>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3 w-full">
            <Button 
              onClick={handleCreateCourse}
              className="flex-1 sm:w-auto text-sm"
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Curso
            </Button>
            <Button 
              variant="outline" 
              onClick={handleOpenChatModal}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 flex-1 sm:w-auto text-sm"
              size="sm"
            >
              <Bot className="mr-2 h-4 w-4" /> Criar com IA
            </Button>
          </div>
        </div>
        
        {isError && (
          <div className="text-red-500 p-4 border border-red-500 rounded-md mb-6">
            <p>Ocorreu um erro ao carregar seus cursos:</p>
            <p className="text-sm">{error instanceof Error ? error.message : "Tente recarregar a página."}</p>
          </div>
        )}

            <CoursesList 
              courses={coursesData} 
              isLoading={listIsLoading} 
              totalEnrollments={totalEnrollments} 
            />
      </div>

      {/* ChatModal para criação de curso com IA */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        contentData={{
          texto: "Você está criando um novo curso. Descreva o tema, público-alvo, objetivos de aprendizagem e estrutura desejada para o seu curso. A IA irá ajudá-lo a desenvolver o conteúdo e organizar as informações de forma pedagógica."
        }}
      />

      {/* Modal customizado para cursos não publicados */}
      {isUnpublishedCoursesAlertOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsUnpublishedCoursesAlertOpen(false)}
        >
          <div 
            className="w-full max-w-md mx-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-700">
              <div className="text-lg font-semibold text-white flex items-center">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center mr-3 shadow-lg">
                  <AlertTriangle className="h-4 w-4 text-slate-900" />
                </div>
                Atenção: Cursos não publicados ...
              </div>
              <div className="text-sm leading-relaxed text-gray-300 mt-3">
                Você possui cursos que ainda não estão publicados e não aparecem na plataforma para os outros usuários. 
                <br /><br />
                Analise as informações do curso se estão corretas, crie módulos e conteúdos para o mesmo e também revise a página de vendas. Só depois disso publique o seu curso.
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-4">
              <Button
                onClick={() => setIsUnpublishedCoursesAlertOpen(false)}
                className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:via-gold hover:to-gold-light text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeusCursosPage;
