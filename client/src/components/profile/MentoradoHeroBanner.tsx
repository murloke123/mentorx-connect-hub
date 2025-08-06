import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";
import { supabase } from "@/utils/supabase";
import { uploadImage } from "@/utils/uploadImage";
import { Camera, User } from "lucide-react";
import React, { useState } from "react";

interface MentoradoHeroBannerProps {
  profileData: Profile | null;
  onProfileUpdate?: () => void;
}

const MentoradoHeroBanner = ({ profileData, onProfileUpdate }: MentoradoHeroBannerProps) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarPath, setCurrentAvatarPath] = useState<string | null>(null);

  // Extract path from URL
  const extractPathFromUrl = (url: string | null): string | null => {
    if (!url) return null;
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1].split('?')[0];
  };

  // Função para lidar com upload de avatar
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileData?.id) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
      });
      return;
    }

    // Validar tamanho do arquivo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create object URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      const result = await uploadImage(file, 'avatars', currentAvatarPath || undefined);
      setAvatarUrl(result.url);
      setCurrentAvatarPath(result.path);

      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', profileData.id);

      if (error) throw error;

      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });

      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setAvatarUrl(profileData?.avatar_url || null);
      
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload da imagem",
        description: "Verifique se o bucket 'avatars' existe no Supabase.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  React.useEffect(() => {
    setAvatarUrl(profileData?.avatar_url || null);
    if (profileData?.avatar_url) {
      setCurrentAvatarPath(extractPathFromUrl(profileData.avatar_url));
    }
  }, [profileData]);

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="relative h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)`
          }}></div>
        </div>

        {/* Partículas douradas */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}

        {/* Profile Avatar - Centered in banner */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-10 z-10">
          <div className="relative group">
            <div 
              className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-4 border-white shadow-xl bg-white transition-transform duration-300 hover:scale-105"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              <div className="relative flex items-center justify-center w-full h-full rounded-full overflow-hidden">
                {avatarUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={avatarUrl}
                      alt="Profile picture"
                      className="w-full h-full object-cover object-center"
                      key={`mentorado-avatar-${Date.now()}`}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Spinner className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <Avatar className="w-full h-full">
                    <AvatarFallback className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white flex items-center justify-center">
                      <User className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            <label
              htmlFor="mentorado-avatar-upload"
              className="absolute bottom-0 right-0 bg-gold text-slate-900 p-2 rounded-full cursor-pointer hover:bg-gold/90 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Camera className="h-4 w-4" />
            </label>

            <input
              id="mentorado-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Name section - Positioned at bottom of banner */}
        <div className="absolute bottom-8 left-0 right-0 text-center px-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent mb-2">
            {profileData?.full_name || "Seu Nome"}
          </h1>
          <p className="text-gray-300 text-lg">
            Mentorado
          </p>
        </div>
      </div>

      {/* Estilos CSS para animações */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default MentoradoHeroBanner;