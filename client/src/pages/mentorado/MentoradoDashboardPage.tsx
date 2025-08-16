import EnrolledCoursesList from '@/components/mentorado/EnrolledCoursesList';
import MentoradoSidebar from '@/components/mentorado/MentoradoSidebar';
import StatsSection from '@/components/mentorado/StatsSection';
import LoadingComponent from '@/components/shared/LoadingComponent';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { getMenteeCourses, getMenteeFollowingCount, getMenteeProfile } from '@/services/menteeService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Revalidar dados quando a página ganha foco (usuário retorna de outra página)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['menteeCourses', user.id] });
        queryClient.invalidateQueries({ queryKey: ['menteeProfile', user.id] });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, queryClient]);
  
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
    return <LoadingComponent message="Verificando autenticação" variant="full-screen" />;
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <MentoradoSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <MentoradoSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-6 overflow-auto relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
        
        <div className="pt-16 md:pt-0">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gold">
              {profile ? `Bem-vindo, ${profile.full_name || 'Mentorado'}!` : 'Dashboard do Mentorado'}
            </h1>
            <p className="text-gray-300 text-lg">
              Acompanhe seus cursos e seu progresso
            </p>
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
    </div>
  );
};

export default MentoradoDashboardPage;
