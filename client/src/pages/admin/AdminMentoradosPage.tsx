import AdminSidebar from '@/components/admin/AdminSidebar';
import MentoradosList from '@/components/admin/MentoradosList';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { getAllMentorados, MentoradoWithStats } from "@/services/adminService";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useState } from "react";

const AdminMentoradosPage = () => {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { data: mentorados = [], isLoading, refetch } = useQuery<MentoradoWithStats[]>({
    queryKey: ["allMentorados"],
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
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 p-6 overflow-auto relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
        
        <div className="pt-8 md:pt-0">
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
    </div>
  );
};

export default AdminMentoradosPage;
