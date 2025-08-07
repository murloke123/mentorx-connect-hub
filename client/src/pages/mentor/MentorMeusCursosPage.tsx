import { Course } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Bot, PlusCircle } from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ChatModal from "../../components/chat/ChatModal";
import CoursesList from "../../components/mentor/CoursesList";
import MentorSidebar from "../../components/mentor/MentorSidebar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { getMentorCourses } from '../../services/courseService';
import { supabase } from '../../utils/supabase';

const MeusCursosPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isUnpublishedCoursesAlertOpen, setIsUnpublishedCoursesAlertOpen] = useState(false);

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
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 p-6">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gold">Meus Cursos</h1>
            <p className="text-muted-foreground">Gerencie e acompanhe seus cursos criados</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleOpenChatModal}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
            >
              <Bot className="mr-2 h-4 w-4" /> Criar com IA
            </Button>
            <Button onClick={handleCreateCourse}>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Curso
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

      {/* Modal de alerta para cursos não publicados */}
      <AlertDialog open={isUnpublishedCoursesAlertOpen} onOpenChange={setIsUnpublishedCoursesAlertOpen}>
        <AlertDialogContent className="max-w-md p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <AlertDialogHeader className="p-6 pb-4 border-b border-slate-700">
            <AlertDialogTitle className="text-lg font-semibold text-white flex items-center">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center mr-3 shadow-lg">
                <AlertTriangle className="h-4 w-4 text-slate-900" />
              </div>
              Atenção: Cursos não publicados ...
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-gray-300 mt-3">
              Você possui cursos que ainda não estão publicados e não aparecem na plataforma para os outros usuários. 
              <br /><br />
              Analise as informações do curso se estão corretas, crie módulos e conteúdos para o mesmo e também revise a página de vendas. Só depois disso publique o seu curso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-6 pt-4">
            <AlertDialogAction 
              onClick={() => setIsUnpublishedCoursesAlertOpen(false)}
              className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:via-gold hover:to-gold-light text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeusCursosPage;
