import StatsCard from '@/components/shared/StatsCard';
import { formatCurrency } from '@/utils/formatters';
import { CircleDollarSign, DollarSign, Library, Users } from 'lucide-react';

interface StatsSectionProps {
  followersCount: number;
  totalCourses: number;
  activeEnrollments: number;
  totalStudents: number;
  totalRevenue: number;
  totalPaidAmount: number;
}

const StatsSection = ({ followersCount, totalCourses, activeEnrollments, totalStudents, totalRevenue, totalPaidAmount }: StatsSectionProps) => {
  return (
    <div className="mb-8 grid gap-6 grid-cols-5">
      <StatsCard 
        title="Seguidores" 
        value={followersCount}
        icon={<Users />} 
        description="Pessoas que seguem seu perfil" 
      />
      <StatsCard 
        title="Cursos Adquiridos" 
        value={activeEnrollments} 
        icon={<Library />} 
        description="Total de cursos adquiridos pelos seus Alunos" 
      />
      <StatsCard 
        title="Alunos" 
        value={totalStudents} 
        icon={<Users />} 
        description="Total de alunos que adquiriram seus cursos" 
      />
      <StatsCard 
        title="Receita Estimada" 
        value={formatCurrency(totalRevenue)} 
        icon={<DollarSign />} 
        description="Saldo pendente no Stripe" 
      />
      <StatsCard 
        title="Valores Pagos" 
        value={formatCurrency(totalPaidAmount)} 
        icon={<CircleDollarSign />} 
        description="Já está na sua conta" 
      />
    </div>
  );
};

export default StatsSection;
