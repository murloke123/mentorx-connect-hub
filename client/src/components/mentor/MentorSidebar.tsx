import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { cn } from "@/utils/utils";
import { BookOpen, Calendar, LayoutDashboard, LogOut, Settings, User, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const MentorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/mentor/dashboard",
    },
    {
      title: "Meu Perfil",
      icon: User,
      href: "/mentor/perfil",
    },
    {
      title: "Meus Cursos",
      icon: BookOpen,
      href: "/mentor/cursos?tab=meus-cursos",
    },
    {
      title: "Meus Mentorados",
      icon: Users,
      href: "/mentor/mentorados",
    },
    {
      title: "Calendário",
      icon: Calendar,
      href: "/mentor/calendario",
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/mentor/configuracoes",
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta"
      });
      navigate("/");
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
    <div className="w-64 border-r h-screen sticky top-0 bg-white">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              // Verificar se a rota atual corresponde ao item do menu
              // Para itens com query parameters, comparar apenas o pathname
              const isActive = item.href.includes('?') 
                ? location.pathname === item.href.split('?')[0]
                : location.pathname === item.href;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start", 
                      isActive ? "bg-muted" : ""
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorSidebar;
