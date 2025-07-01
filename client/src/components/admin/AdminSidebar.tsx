import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  BookOpen, 
  BarChart2,
  Settings, 
  LogOut,
  User,
  Tags
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta"
      });
      navigate('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Ocorreu um problema ao tentar desconectar sua conta"
      });
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-50 border-r flex flex-col">
      <div className="flex-1 py-6 px-3 space-y-1">
        <Link to="/admin/dashboard">
          <Button 
            variant={isActive("/admin/dashboard") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        
        <Link to="/admin/perfil">
          <Button 
            variant={isActive("/admin/perfil") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <User className="mr-2 h-4 w-4" />
            Meu Perfil
          </Button>
        </Link>
        
        <Link to="/admin/mentores">
          <Button 
            variant={isActive("/admin/mentores") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <Users className="mr-2 h-4 w-4" />
            Mentores
          </Button>
        </Link>
        
        <Link to="/admin/mentorados">
          <Button 
            variant={isActive("/admin/mentorados") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Mentorados
          </Button>
        </Link>
        
        <Link to="/admin/cursos">
          <Button 
            variant={isActive("/admin/cursos") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Cursos
          </Button>
        </Link>
        
        <Link to="/admin/relatorios">
          <Button 
            variant={isActive("/admin/relatorios") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
        </Link>
        
        <Link to="/admin/configuracoes">
          <Button 
            variant={isActive("/admin/configuracoes") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </Link>
        
        <Link to="/admin/categorias">
          <Button 
            variant={isActive("/admin/categorias") ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            <Tags className="mr-2 h-4 w-4" />
            Categorias
          </Button>
        </Link>
      </div>
      
      <div className="p-4 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
