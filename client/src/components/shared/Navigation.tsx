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
import { Bot, LayoutDashboard, LogOut, Settings, UserCircle } from "lucide-react";
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
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link to="/" className="flex items-center gap-3 font-bold text-xl text-white -ml-[80px]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-slate-900" />
                </div>
                Mentora Ai
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-20 bg-slate-700 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center gap-3 font-bold text-xl text-white hover:text-gold transition-colors duration-200 -ml-[80px]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center shadow-lg hover:shadow-gold transition-all duration-200">
                <Bot className="h-5 w-5 text-slate-900" />
              </div>
              Mentora Ai
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/courses" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200 font-medium">
              Cursos
            </Link>
            <Link to="/mentors" className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200 font-medium">
              Mentores
            </Link>
            
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
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
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0 bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-gold via-gold-light to-gold-dark text-slate-900 text-sm font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-slate-800 border-slate-700 z-50 shadow-xl">
                  <DropdownMenuLabel className="px-4 py-3 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-gold via-gold-light to-gold-dark text-slate-900 font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {profile?.full_name || user?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getRoleLabel()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <div className="py-1">
                  <Link to={profileRoute}>
                      <DropdownMenuItem className="cursor-pointer px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200">
                        <UserCircle className="h-4 w-4 mr-3 text-gray-400" />
                      Meu Perfil
                    </DropdownMenuItem>
                  </Link>
                    <DropdownMenuItem className="cursor-pointer px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200" onClick={handleDashboardAccess}>
                      <LayoutDashboard className="h-4 w-4 mr-3 text-gray-400" />
                    Meu Dashboard
                  </DropdownMenuItem>
                    <Link to={configRoute}>
                      <DropdownMenuItem className="cursor-pointer px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200">
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Configurações
                      </DropdownMenuItem>
                    </Link>
                  </div>
                  
                  <DropdownMenuSeparator className="my-1 bg-slate-700" />
                  
                  <div className="py-1">
                    <DropdownMenuItem 
                      className="cursor-pointer px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200" 
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
                <Button size="sm" className="bg-gradient-to-r from-gold to-gold-light text-slate-900 hover:from-gold-light hover:to-gold font-semibold shadow-lg hover:shadow-gold transition-all duration-200">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
