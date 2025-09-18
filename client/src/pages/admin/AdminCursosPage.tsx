import AdminSidebar from '@/components/admin/AdminSidebar';
import CoursesList from '@/components/admin/CoursesList';
import { useAuth } from '@/hooks/useAuth';
import { CourseWithDetails, getAllCourses } from "@/services/adminService";
import { useQuery } from "@tanstack/react-query";

const AdminCursosPage = () => {
  const { user } = useAuth();
  
  const { data: courses = [], isLoading, refetch } = useQuery<CourseWithDetails[]>({
    queryKey: ["allCourses"],
    queryFn: getAllCourses,
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
          <h1 className="text-3xl font-bold">Gerenciar Cursos</h1>
          <p className="text-gray-600">Administre todos os cursos da plataforma</p>
          
          {/* Debug info - mostra o usuário atual */}
          <div className="mt-2 text-xs text-gray-500">
            👤 Admin: {user.email} (ID: {user.id.slice(0, 8)}...)
          </div>
        </div>
        
        <CoursesList 
          courses={courses} 
          isLoading={isLoading}
          onDelete={() => refetch()}
        />
      </div>
    </div>
  );
};

export default AdminCursosPage;
