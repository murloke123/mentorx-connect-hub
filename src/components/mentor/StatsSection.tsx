import { Users, BookOpen, DollarSign } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { formatCurrency } from '@/utils/formatters';

interface StatsSectionProps {
  followersCount: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

const StatsSection = ({ followersCount, totalCourses, totalEnrollments, totalRevenue }: StatsSectionProps) => {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Seguidores" 
        value={followersCount}
        icon={<Users />} 
        description="Pessoas que seguem seu perfil" 
      />
      <StatsCard 
        title="Cursos" 
        value={totalCourses} 
        icon={<BookOpen />} 
        description="Total de cursos criados" 
      />
      <StatsCard 
        title="Total de Inscrições" 
        value={totalEnrollments} 
        icon={<Users />} 
        description="Alunos em todos os cursos" 
      />
      <StatsCard 
        title="Receita Estimada" 
        value={formatCurrency(totalRevenue)} 
        icon={<DollarSign />} 
        description="De cursos pagos" 
      />
    </div>
  );
};

export default StatsSection;
