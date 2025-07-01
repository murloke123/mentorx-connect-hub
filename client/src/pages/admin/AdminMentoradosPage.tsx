import AdminSidebar from '@/components/admin/AdminSidebar';
import MentoradosList from '@/components/admin/MentoradosList';
import { useAuth } from '@/hooks/useAuth';
import { getAllMentorados, MentoradoWithStats } from '@/services/adminService';
import { useQuery } from '@tanstack/react-query';

const AdminMentoradosPage = () => {
  const { user } = useAuth();
  
  const { data: mentorados = [], isLoading, refetch } = useQuery<MentoradoWithStats[]>({
    queryKey: ['allMentorados'],
    queryFn: getAllMentorados,
    enabled: !!user?.id, // Só executa se há usuário autenticado
  });
  
  // Se não há usuário logado, não renderiza a página
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
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Mentorados</h1>
          <p className="text-gray-600">Administre todos os mentorados da plataforma</p>
          
          {/* Debug info - mostra o usuário atual */}
          <div className="mt-2 text-xs text-gray-500">
            👤 Admin: {user.email} (ID: {user.id.slice(0, 8)}...)
          </div>
        </div>
        
        <MentoradosList 
          mentorados={mentorados} 
          isLoading={isLoading}
          onDelete={() => refetch()}
        />
      </div>
    </div>
  );
};

export default AdminMentoradosPage;
