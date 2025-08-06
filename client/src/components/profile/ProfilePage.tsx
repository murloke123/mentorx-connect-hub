import ProfileForm from "@/components/profile/ProfileForm";
import LoadingComponent from "@/components/shared/LoadingComponent";
import { Profile } from '@/types/database';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import { supabase } from '../../utils/supabase';
import MentoradoHeroBanner from "./MentoradoHeroBanner";

interface ProfilePageProps {
  userRole?: "mentor" | "mentorado" | "admin";
}

const ProfilePage = ({ userRole }: ProfilePageProps) => {
  const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Obter o email do usuário separadamente
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
            if (data) {
        setProfileData({
          ...data,
          email: userData?.user?.email
        } as Profile);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro ao buscar dados do perfil:", errorMessage);
      setError("Não foi possível carregar os dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfileData(session.user.id);
        } else {
          setLoading(false);
          setError("Usuário não autenticado");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("Erro ao obter usuário:", errorMessage);
        setLoading(false);
        setError("Erro ao verificar autenticação");
      }
    };

    getCurrentUser();
  }, []);

  if (loading) {
    return <LoadingComponent message="Carregando Dados" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 max-w-2xl mx-auto my-8">
        <h3 className="font-medium">Erro</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {userRole === "mentorado" && (
        <MentoradoHeroBanner 
          profileData={profileData} 
          onProfileUpdate={() => fetchProfileData(user?.id || "")}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <ProfileForm 
          user={user} 
          profileData={profileData}
          onProfileUpdate={() => fetchProfileData(user?.id || "")}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
