import { Course } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from "lucide-react";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import CoursesList from "../../components/mentor/CoursesList";
import MentorSidebar from "../../components/mentor/MentorSidebar";
import { Button } from "../../components/ui/button";
import { getMentorCourses } from '../../services/courseService';
import { supabase } from '../../utils/supabase';

const MeusCursosPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const totalEnrollments = coursesData.reduce((sum, courseItem) => {
    const enrollmentCount = courseItem.enrollments_count || 0;
    return sum + enrollmentCount;
  }, 0);

  const handleCreateCourse = () => {
    navigate('/mentor/cursos/novo');
  };

  const listIsLoading = isLoading || isFetching;

  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 p-6">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meus Cursos</h1>
            <p className="text-muted-foreground">Gerencie e acompanhe seus cursos criados</p>
          </div>
          <Button onClick={handleCreateCourse}>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Curso
          </Button>
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
    </div>
  );
};

export default MeusCursosPage;
