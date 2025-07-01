import { NotificationBell } from "@/components/shared/NotificationBell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { preloadUserRoutes } from '@/utils/lazyComponents';
import { Calendar, LayoutDashboard, LogOut, Settings, UserCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../../utils/supabase';

interface UserProfile {
  role: string;
  full_name: string;
  email: string;
  avatar_url: string;
}

const Navigation = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Buscar perfil quando usuário mudar
  useEffect(() => {
    if (user?.id) {
      console.info("Navigation: Fetching profile for user:", user.id);
          supabase
            .from("profiles")
            .select("role, full_name, email, avatar_url")
        .eq("id", user.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
            console.error("Navigation: Error fetching user profile:", error);
                return;
              }
              
          console.info("Navigation: Profile loaded:", {
                role: data?.role,
            full_name: data?.full_name
          });
          setProfile(data);
            });
        } else {
      setProfile(null);
        }
  }, [user?.id]);
    
  // Preload rotas baseadas no papel do usuário quando profile mudar
  useEffect(() => {
    if (profile?.role) {
      console.info("Navigation: Preloading routes for role:", profile.role);
      preloadUserRoutes(profile.role);
    }
  }, [profile?.role]);
  
  const handleLogout = useCallback(async () => {
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
  }, [toast, navigate]);
  
  const profileRoute = useMemo(() => {
    if (profile?.role === 'admin') return '/admin/perfil';
    if (profile?.role === 'mentor') return '/mentor/perfil';
    if (profile?.role === 'mentorado') return '/mentorado/perfil';
    return '/';
  }, [profile?.role]);

  const configRoute = useMemo(() => {
    if (profile?.role === 'admin') return '/admin/configuracoes';
    if (profile?.role === 'mentor') return '/mentor/configuracoes';
    if (profile?.role === 'mentorado') return '/mentorado/configuracoes';
    return '/';
  }, [profile?.role]);

  const handleDashboardAccess = () => {
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (profile?.role === 'mentor') {
      navigate('/mentor/dashboard');
    } else if (profile?.role === 'mentorado') {
      navigate('/mentorado/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você não tem permissão para acessar essa área"
      });
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Administrador';
      case 'mentor':
        return 'Mentor';
      case 'mentorado':
        return 'Mentorado';
      default:
        return 'Usuário';
    }
  };

  // Não renderizar nada se ainda estiver carregando dados de auth
  if (loading) {
    return (
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="font-bold text-xl text-primary">
                MentorX
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl text-primary">
              MentorX
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/courses" className="text-gray-700 hover:text-primary">
              Cursos
            </Link>
            <Link to="/mentors" className="text-gray-700 hover:text-primary">
              Mentores
            </Link>
            <Link to="/schedule">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Agendar
              </Button>
            </Link>
            
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleDashboardAccess}
              >
                <LayoutDashboard className="h-4 w-4" />
                Meu Dashboard
              </Button>
            )}
            
            {/* Sininho de notificações - para qualquer usuário logado */}
            {user && (
              <NotificationBell userId={user.id} />
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white z-50 shadow-lg border border-gray-200">
                  <DropdownMenuLabel className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {profile?.full_name || user?.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getRoleLabel()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <div className="py-1">
                  <Link to={profileRoute}>
                      <DropdownMenuItem className="cursor-pointer px-4 py-2 hover:bg-gray-50">
                        <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Meu Perfil
                    </DropdownMenuItem>
                  </Link>
                    <DropdownMenuItem className="cursor-pointer px-4 py-2 hover:bg-gray-50" onClick={handleDashboardAccess}>
                      <LayoutDashboard className="h-4 w-4 mr-3 text-gray-500" />
                    Meu Dashboard
                  </DropdownMenuItem>
                    <Link to={configRoute}>
                      <DropdownMenuItem className="cursor-pointer px-4 py-2 hover:bg-gray-50">
                        <Settings className="h-4 w-4 mr-3 text-gray-500" />
                        Configurações
                      </DropdownMenuItem>
                    </Link>
                  </div>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <div className="py-1">
                    <DropdownMenuItem 
                      className="cursor-pointer px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700" 
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-500" />
                    Sair
                  </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm">Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
