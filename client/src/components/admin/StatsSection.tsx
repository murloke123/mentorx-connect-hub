
import { Users, BookOpen, GraduationCap, UserPlus } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';

interface StatsSectionProps {
  mentorsCount: number;
  mentoreesCount: number;
  coursesCount: number;
  enrollmentsCount: number;
}

const StatsSection = ({ 
  mentorsCount, 
  mentoreesCount, 
  coursesCount,
  enrollmentsCount 
}: StatsSectionProps) => {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Mentores" 
        value={mentorsCount}
        icon={<Users />} 
        description="Total de mentores registrados" 
      />
      <StatsCard 
        title="Mentorados" 
        value={mentoreesCount} 
        icon={<GraduationCap />} 
        description="Total de mentorados registrados" 
      />
      <StatsCard 
        title="Cursos" 
        value={coursesCount} 
        icon={<BookOpen />} 
        description="Total de cursos disponíveis" 
      />
      <StatsCard 
        title="Matrículas" 
        value={enrollmentsCount} 
        icon={<UserPlus />} 
        description="Total de matrículas realizadas" 
      />
    </div>
  );
};

export default StatsSection;
