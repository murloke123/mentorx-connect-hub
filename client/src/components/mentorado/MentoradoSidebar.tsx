import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

const MentoradoSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/mentorado/dashboard",
    },
    {
      title: "Meu Perfil",
      icon: User,
      href: "/mentorado/perfil",
    },
    {
      title: "Meus Cursos",
      icon: BookOpen,
      href: "/mentorado/cursos",
    },
    {
      title: "Calendário",
      icon: Calendar,
      href: "/mentorado/calendario",
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/mentorado/configuracoes",
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
            {menuItems.map((item) => (
              <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start", 
                      location.pathname === item.href ? "bg-muted" : ""
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
              </Link>
            ))}
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

export default MentoradoSidebar;
