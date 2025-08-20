import StatsCard from '@/components/shared/StatsCard';
import { BookOpen, CheckSquare, Heart, Users } from 'lucide-react';

interface StatsSectionProps {
  enrolledCourses: number;
  completedLessons: number;
  activeMentors: number;
  followingMentors: number;
}

const StatsSection = ({ enrolledCourses, completedLessons, activeMentors, followingMentors }: StatsSectionProps) => {
  return (
    <div className="mb-6 md:mb-8 grid gap-3 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Cursos Adquiridos" 
        value={enrolledCourses}
        icon={<BookOpen />} 
        description="Total de cursos que você adquiriu" 
      />
      <StatsCard 
        title="Aulas Concluídas" 
        value={completedLessons} 
        icon={<CheckSquare />} 
        description="Total de aulas que você completou" 
      />
      <StatsCard 
        title="Mentores Ativos" 
        value={activeMentors} 
        icon={<Users />} 
        description="Mentores dos seus cursos atuais" 
      />
      <StatsCard 
        title="Mentores que Sigo" 
        value={followingMentors} 
        icon={<Heart />} 
        description="Total de mentores que sigo" 
      />
    </div>
  );
};

export default StatsSection;
