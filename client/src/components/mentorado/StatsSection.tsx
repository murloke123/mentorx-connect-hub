
import { BookOpen, Users, CheckSquare } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';

interface StatsSectionProps {
  enrolledCourses: number;
  completedLessons: number;
  activeMentors: number;
}

const StatsSection = ({ enrolledCourses, completedLessons, activeMentors }: StatsSectionProps) => {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard 
        title="Cursos" 
        value={enrolledCourses}
        icon={<BookOpen />} 
        description="Cursos em que você está matriculado" 
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
    </div>
  );
};

export default StatsSection;
