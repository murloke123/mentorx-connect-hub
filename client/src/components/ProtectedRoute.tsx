import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = React.useState<{ role: string } | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  // Buscar perfil do usuário quando user estiver disponível
  React.useEffect(() => {
    if (user?.id) {
      import("@/utils/supabase").then(({ supabase }) => {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("ProtectedRoute: Erro ao buscar perfil:", error);
            } else {
              setProfile(data);
            }
            setProfileLoading(false);
          });
      });
    } else {
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user?.id]);

  // Se ainda está carregando autenticação ou perfil
  if (loading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
          <p className="mt-2 text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, redirecionar para login
  if (!user) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se há roles específicos permitidos, verificar se o usuário tem o role correto
  if (allowedRoles.length > 0 && profile?.role) {
    if (!allowedRoles.includes(profile.role)) {
      console.log(`ProtectedRoute: Usuário com role '${profile.role}' não tem permissão. Roles permitidos:`, allowedRoles);
      
      // Redirecionar para o dashboard apropriado baseado no role do usuário
      const dashboardRoute = 
        profile.role === "admin" ? "/admin/dashboard" :
        profile.role === "mentor" ? "/mentor/dashboard" :
        profile.role === "mentorado" ? "/mentorado/dashboard" :
        "/";
      
      return <Navigate to={dashboardRoute} replace />;
    }
  }

  // Se passou por todas as verificações, renderizar o componente
  return <>{children}</>;
}; 