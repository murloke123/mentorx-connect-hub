import EnrolledCoursesList from '@/components/mentorado/EnrolledCoursesList';
import MentoradoSidebar from '@/components/mentorado/MentoradoSidebar';
import StatsSection from '@/components/mentorado/StatsSection';
import { useAuth } from '@/hooks/useAuth';
import { getMenteeCourses, getMenteeFollowingCount, getMenteeProfile } from '@/services/menteeService';
import { useQuery } from '@tanstack/react-query';

interface Course {
  id: string;
  title: string;
  description?: string;
  mentor_id: string;
  mentor_name?: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
}

const MentoradoDashboardPage = () => {
  const { user } = useAuth();
  
  // Fetch the mentee profile
  const { data: profile } = useQuery({
    queryKey: ['menteeProfile', user?.id],
    queryFn: getMenteeProfile,
    enabled: !!user?.id,
  });
  
  // Fetch mentee enrolled courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['menteeCourses', user?.id],
    queryFn: getMenteeCourses,
    enabled: !!user?.id,
  });

  // Fetch mentee following count
  const { data: followingCount = 0 } = useQuery({
    queryKey: ['menteeFollowingCount', user?.id],
    queryFn: getMenteeFollowingCount,
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
  
  // Convert courses to the expected type
  const coursesArray: Course[] = Array.isArray(courses) ? courses : [];
  
  // Calculate total progress
  const totalProgress = coursesArray.length > 0
    ? coursesArray.reduce((sum, course) => sum + (course.progress || 0), 0) / coursesArray.length
    : 0;
  
  // Calculate completed lessons
  const completedLessons = coursesArray.reduce((sum, course) => sum + (course.completed_lessons || 0), 0);
  
  // Calculate active mentors
  const activeMentors = Array.from(new Set(coursesArray.map(course => course.mentor_id))).length;
  
  return (
    <div className="flex">
      <MentoradoSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {profile ? `Bem-vindo, ${profile.full_name || 'Mentorado'}!` : 'Dashboard'}
          </h1>
          <p className="text-gray-600">Acompanhe seus cursos e seu progresso</p>
        </div>

        {/* Stats Section */}
        <StatsSection 
          enrolledCourses={coursesArray.length}
          completedLessons={completedLessons}
          activeMentors={activeMentors}
          followingMentors={followingCount}
        />

        {/* Enrolled Courses Section */}
        <EnrolledCoursesList 
          courses={coursesArray} 
          isLoading={isLoadingCourses} 
        />
      </div>
    </div>
  );
};

export default MentoradoDashboardPage;
