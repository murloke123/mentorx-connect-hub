"use client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { cn } from "@/utils/utils";
import { BookOpen, Calendar, CalendarCheck, LayoutDashboard, LogOut, Play, Settings, User, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";

const MentorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Manter o sidebar sempre expandido na página do perfil para melhor visibilidade
  const isProfilePage = location.pathname === "/mentor/perfil";
  const [open, setOpen] = useState(isProfilePage);
  
  // Efeito para manter o sidebar expandido na página do perfil
  useEffect(() => {
    if (isProfilePage) {
      setOpen(true);
    }
  }, [isProfilePage]);
  
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

  // Função para verificar se a rota está ativa
  const isActiveRoute = (href: string) => {
    if (href.includes('?')) {
      return location.pathname === href.split('?')[0];
    }
    return location.pathname === href;
  };

  const menuItems = [
    {
      label: "Dashboard",
      href: "/mentor/dashboard",
      icon: (
        <LayoutDashboard className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Meu Perfil",
      href: "/mentor/perfil",
      icon: (
        <User className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Meus Cursos",
      href: "/mentor/meus-cursos",
      icon: (
        <BookOpen className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Cursos Adquiridos",
      href: "/mentor/cursos-adquiridos",
      icon: (
        <Play className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Meus Mentorados",
      href: "/mentor/mentorados",
      icon: (
        <Users className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Agendamentos",
      href: "/mentor/agendamentos",
      icon: (
        <Calendar className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Agendamentos Adquiridos",
      href: "/mentor/agendamentos-adquiridos",
      icon: (
        <CalendarCheck className="h-5 w-5 shrink-0 text-gray-300" />
      ),
    },
    {
      label: "Configurações",
      href: "/mentor/configuracoes",
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
    <Sidebar open={open} setOpen={setOpen} animate={!isProfilePage}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col gap-4 pt-4">
          {menuItems.map((link, idx) => {
            const isActive = isActiveRoute(link.href);
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

export default MentorSidebar;
