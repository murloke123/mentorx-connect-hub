import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, Mail, Star } from "lucide-react";

interface MentoradoProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
  highlight_message: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

const MentoradoPublicViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [profileData, setProfileData] = useState<MentoradoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentoradoProfile = async () => {
      if (!id) {
        setError("ID do mentorado não fornecido");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .eq("role", "mentorado")
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError("Mentorado não encontrado");
          } else {
            throw error;
          }
          return;
        }

        setProfileData(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("Erro ao buscar dados do mentorado:", errorMessage);
        setError("Não foi possível carregar os dados do mentorado");
      } finally {
        setLoading(false);
      }
    };

    fetchMentoradoProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-2">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mentorado não encontrado
            </h3>
            <p className="text-gray-600">
              {error || "O perfil solicitado não está disponível."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatar_url || ""} alt={profileData.full_name || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                {profileData.full_name?.charAt(0).toUpperCase() || "M"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData.full_name || "Nome não informado"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <User className="h-3 w-3 mr-1" />
                  Mentorado
                </Badge>
                {profileData.category && (
                  <Badge variant="outline">
                    <Star className="h-3 w-3 mr-1" />
                    {profileData.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Membro desde {new Date(profileData.created_at).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          
          {/* Mensagem de Destaque */}
          {profileData.highlight_message && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Mensagem de Destaque
                </h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p className="text-gray-700">
                    {profileData.highlight_message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sobre */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Sobre
              </h2>
              {profileData.bio ? (
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: profileData.bio }}
                />
              ) : (
                <p className="text-gray-500 italic">
                  Este mentorado ainda não adicionou informações sobre si mesmo.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Informações
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nome Completo</p>
                    <p className="text-sm text-gray-600">
                      {profileData.full_name || "Não informado"}
                    </p>
                  </div>
                </div>
                
                {profileData.category && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Área de Interesse</p>
                      <p className="text-sm text-gray-600">{profileData.category}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Membro desde</p>
                    <p className="text-sm text-gray-600">
                      {new Date(profileData.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default MentoradoPublicViewPage;
