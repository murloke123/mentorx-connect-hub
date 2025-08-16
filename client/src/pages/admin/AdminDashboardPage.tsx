import AdminSidebar from '@/components/admin/AdminSidebar';
import StatsSection from '@/components/admin/StatsSection';
import AdminHeader from '@/components/admin/dashboard/AdminHeader';
import DashboardTabs from '@/components/admin/dashboard/DashboardTabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { CourseWithDetails, getAdminProfile, getAllCourses, getAllMentorados, getMentorsWithCourses, getPlatformStats, MentoradoWithStats, MentorWithCourses } from '@/services/adminService';
import { Profile } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { useState } from 'react';



const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Fetch admin profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['adminProfile', user?.id],
    queryFn: getAdminProfile,
    enabled: !!user?.id,
  });
  
  // Fetch platform statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery<{ mentorsCount: number; mentoreesCount: number; coursesCount: number; enrollmentsCount: number; }>({
    queryKey: ['platformStats', user?.id],
    queryFn: getPlatformStats,
    enabled: !!user?.id,
  });
  
  // Fetch recent mentors
    const { data: mentorsData = [], isLoading: isLoadingMentors } = useQuery<MentorWithCourses[]>({
    queryKey: ['recentMentors', user?.id],
    queryFn: () => getMentorsWithCourses({ queryKey: ['recentMentors', user?.id], signal: undefined }),
    enabled: !!user?.id,
  });
  
  // Fetch recent mentorados
  const { data: mentorados = [], isLoading: isLoadingMentorados } = useQuery<MentoradoWithStats[]>({
    queryKey: ['recentMentorados', user?.id],
    queryFn: () => getAllMentorados({ queryKey: ['recentMentorados', user?.id], signal: undefined }),
    enabled: !!user?.id,
  });
  
  // Fetch recent courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<CourseWithDetails[]>({
    queryKey: ['recentCourses', user?.id],
    queryFn: () => getAllCourses({ queryKey: ['recentCourses', user?.id], signal: undefined }),
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
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border border-border/50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto pt-16 md:pt-6">
        <AdminHeader fullName={profile?.full_name || undefined} />
        
        <StatsSection 
          mentorsCount={stats?.mentorsCount || 0}
          mentoreesCount={stats?.mentoreesCount || 0}
          coursesCount={stats?.coursesCount || 0}
          enrollmentsCount={stats?.enrollmentsCount || 0}
        />
        
        <DashboardTabs 
          mentors={mentorsData as any}
          mentorados={mentorados as any}
          courses={courses}
          isLoadingMentors={isLoadingMentors}
          isLoadingMentorados={isLoadingMentorados}
          isLoadingCourses={isLoadingCourses}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
