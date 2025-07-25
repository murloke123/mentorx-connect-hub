"use client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { cn } from "@/utils/utils";
import { BookOpen, Calendar, LayoutDashboard, LogOut, Settings, User, Users } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";

const MentoradoSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Páginas que devem ter sidebar fixo e sempre expandido
  const fixedSidebarPages = ["/mentorado/perfil", "/mentorado/configuracoes"];
  const shouldUseFixedSidebar = fixedSidebarPages.includes(location.pathname);
  const [open, setOpen] = useState(shouldUseFixedSidebar);
  
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

  const menuItems = [
    {
      label: "Dashboard",
      href: "/mentorado/dashboard",
      icon: (
        <LayoutDashboard className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Meu Perfil",
      href: "/mentorado/perfil",
      icon: (
        <User className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Meus Cursos",
      href: "/mentorado/cursos",
      icon: (
        <BookOpen className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Meus Mentores",
      href: "/mentorado/mentores",
      icon: (
        <Users className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Meus Agendamentos",
      href: "/mentorado/meus-agendamentos",
      icon: (
        <Calendar className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Configurações",
      href: "/mentorado/configuracoes",
      icon: (
        <Settings className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
  ];

  const logoutLink = {
    label: "Sair",
    href: "#",
    icon: (
      <LogOut className="h-5 w-5 shrink-0 text-red-400" />
    ),
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col gap-4 pt-4">
          {menuItems.map((link, idx) => {
            const isActive = location.pathname === link.href;
            return (
              <SidebarLink 
                key={idx} 
                link={link}
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-3 py-3",
                  isActive && "bg-white/20 text-white shadow-lg"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.href);
                }}
              />
            );
          })}
        </div>
        <div className="border-t border-gray-700 pt-4 mt-auto">
          <SidebarLink
            link={logoutLink}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-3 py-3"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
};

export default MentoradoSidebar;
