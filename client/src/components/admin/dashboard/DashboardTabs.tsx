
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecentMentorsTab from './RecentMentorsTab';
import RecentMentoradosTab from './RecentMentoradosTab';
import RecentCoursesTab from './RecentCoursesTab';

interface Mentor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  courses_count: number;
  followers_count: number;
}

interface Mentorado {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  enrollments_count: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  mentor_id: string;
  mentor_name: string | null;
  is_paid: boolean;
  price: number | null;
  enrollments_count: number;
  created_at: string;
}

interface DashboardTabsProps {
  mentors: Mentor[];
  mentorados: Mentorado[];
  courses: Course[];
  isLoadingMentors: boolean;
  isLoadingMentorados: boolean;
  isLoadingCourses: boolean;
}

const DashboardTabs = ({
  mentors,
  mentorados,
  courses,
  isLoadingMentors,
  isLoadingMentorados,
  isLoadingCourses
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="mentors" className="mt-10">
      <TabsList className="mb-4">
        <TabsTrigger value="mentors">Mentores Recentes</TabsTrigger>
        <TabsTrigger value="mentorados">Mentorados Recentes</TabsTrigger>
        <TabsTrigger value="courses">Cursos Recentes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="mentors">
        <RecentMentorsTab mentors={mentors} isLoading={isLoadingMentors} />
      </TabsContent>
      
      <TabsContent value="mentorados">
        <RecentMentoradosTab mentorados={mentorados} isLoading={isLoadingMentorados} />
      </TabsContent>
      
      <TabsContent value="courses">
        <RecentCoursesTab courses={courses} isLoading={isLoadingCourses} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
