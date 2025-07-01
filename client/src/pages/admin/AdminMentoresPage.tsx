import AdminSidebar from '@/components/admin/AdminSidebar';
import MentorsList from '@/components/admin/MentorsList';
import { useAuth } from '@/hooks/useAuth';
import { getAllMentors, MentorWithStats } from '@/services/adminService';
import { useQuery } from '@tanstack/react-query';



const AdminMentorsPage = () => {
  const { user } = useAuth();
  
  const { data: mentors = [], isLoading, refetch } = useQuery<MentorWithStats[]>({
    queryKey: ['allMentors'],
    queryFn: getAllMentors,
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
          <h1 className="text-3xl font-bold">Gerenciar Mentores</h1>
          <p className="text-gray-600">Administre todos os mentores da plataforma</p>
          
          {/* Debug info - mostra o usuário atual */}
          <div className="mt-2 text-xs text-gray-500">
            👤 Admin: {user.email} (ID: {user.id.slice(0, 8)}...)
          </div>
        </div>
        
        <MentorsList 
          mentors={mentors} 
          isLoading={isLoading}
          onDelete={() => refetch()}
        />
      </div>
    </div>
  );
};

export default AdminMentorsPage;
