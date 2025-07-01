import StatsCard from '@/components/shared/StatsCard';
import { formatCurrency } from '@/utils/formatters';
import { BookOpen, DollarSign, Users } from 'lucide-react';

interface StatsSectionProps {
  followersCount: number;
  totalCourses: number;
  activeEnrollments: number;
  inactiveEnrollments: number;
  totalRevenue: number;
}

const StatsSection = ({ followersCount, totalCourses, activeEnrollments, inactiveEnrollments, totalRevenue }: StatsSectionProps) => {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
        title="Alunos Ativos" 
        value={activeEnrollments} 
        icon={<Users />} 
        description="Alunos com matrículas ativas" 
      />
      <StatsCard 
        title="Alunos Pendentes" 
        value={inactiveEnrollments} 
        icon={<Users />} 
        description="Alunos com matrículas inativas" 
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
