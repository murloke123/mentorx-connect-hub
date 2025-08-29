import StatsCard from '@/components/shared/StatsCard';
import { formatCurrency } from '@/utils/formatters';
import { CircleDollarSign, Library, Users } from 'lucide-react';

interface StatsSectionProps {
  followersCount: number;
  totalCourses: number;
  activeEnrollments: number;
  totalStudents: number;
  totalRevenue: number;
  totalPaidAmount: number;
  totalMatriculasValue: number;
  totalAppointmentsValue: number;
}

const StatsSection = ({ followersCount, totalCourses, activeEnrollments, totalStudents, totalRevenue, totalPaidAmount, totalMatriculasValue, totalAppointmentsValue }: StatsSectionProps) => {
  return (
    <div className="mb-6 md:mb-8 grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      <StatsCard 
        title="Seguidores" 
        value={followersCount}
        icon={<Users />} 
        description="Pessoas que seguem seu perfil" 
      />
      <StatsCard 
        title="Cursos" 
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
        title="Valor Total" 
        value={formatCurrency(totalMatriculasValue + totalAppointmentsValue)} 
        description={`Cursos: ${formatCurrency(totalMatriculasValue)} Agendamentos: ${formatCurrency(totalAppointmentsValue)}`} 
      />
      <StatsCard 
        title="Receita Estimada" 
        value={formatCurrency(totalRevenue)} 
        description="Taxa base Stripe 2.9% + R$0,30 por transação" 
        tooltipText="A plataforma Mentora Ai não cobra nenhuma taxa adicional na venda de seus produtos, essas taxas são cobradas pela empresa que processa os pagamentos via cartão, é uma das empresas mais seguras e famosas para processamento de pagamentos de nome Stripe." 
      />
      <StatsCard 
        title="Valores Pagos" 
        value={formatCurrency(totalPaidAmount)} 
        icon={<CircleDollarSign />} 
        description="Valor disponível na sua conta" 
        valueColor="text-green-700"
      />
    </div>
  );
};

export default StatsSection;
