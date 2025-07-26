import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, Mail, Star, Phone, Heart, Sparkles, Target, BookOpen, Trophy, Zap } from "lucide-react";

interface MentoradoProfile {
  id: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
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
        console.log("🔍 [MentoradoPublicView] Buscando perfil para ID:", id);
        
        // Query mais específica para buscar o mentorado
         const { data: mentoradoData, error: mentoradoError } = await supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              bio,
              avatar_url,
              email,
              phone,
              date_of_birth,
              role,
              highlight_message,
              category,
              created_at,
              updated_at
            `)
            .eq('id', id)
            .eq('role', 'mentorado')
            .single();

        console.log("📊 [MentoradoPublicView] Dados do mentorado encontrados:", mentoradoData);
        console.log("❌ [MentoradoPublicView] Erro na busca:", mentoradoError);

        if (mentoradoError) {
          console.error('Erro detalhado:', mentoradoError);
          if (mentoradoError.code === 'PGRST116') {
            setError('Mentorado não encontrado');
          } else {
            setError(`Erro ao buscar mentorado: ${mentoradoError.message}`);
          }
          return;
        }

        if (!mentoradoData) {
          console.error('Nenhum mentorado encontrado com este ID');
          setError('Mentorado não encontrado');
          return;
        }

        console.log('✅ Mentorado encontrado com sucesso:', mentoradoData.full_name);
        setProfileData(mentoradoData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("💥 [MentoradoPublicView] Erro ao buscar dados do mentorado:", err);
        setError(`Erro inesperado: ${errorMessage}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-bounce"></div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full">
        {/* Banner with gradient overlay */}
        <div className="w-full h-[350px] overflow-hidden relative">
          <img 
            src="https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1500&q=80"
            alt="Banner profile" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30"></div>
          
          {/* Floating Elements (bolinhas) */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-white opacity-10 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white opacity-5 rounded-full"></div>
          </div>
          
          {/* Nome e Tag sobreposto ao banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {profileData.full_name || "Nome não informado"}
                </h1>
                
                <div className="flex justify-center items-center gap-3">
                  <Badge className="bg-white/90 text-gray-800 border-0 backdrop-blur-sm px-4 py-2 font-semibold shadow-lg">
                    <User className="h-4 w-4 mr-2" />
                    Mentorado
                  </Badge>
                  {profileData.category && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-4 py-2 font-semibold shadow-lg">
                      <Star className="w-4 h-4 mr-2" />
                      {profileData.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Avatar */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-4 border-white shadow-xl bg-white"
            style={{
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            {profileData.avatar_url ? (
              <img
                src={profileData.avatar_url}
                alt="Profile picture"
                className="aspect-square h-full w-full object-cover"
              />
            ) : (
              <Avatar className="w-full h-full">
                <AvatarFallback className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white flex items-center justify-center">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="mt-24 max-w-5xl mx-auto text-center px-4">        
        {profileData.highlight_message && (
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            {profileData.highlight_message}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8">
          
          {/* Inspirational Quote */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-4 right-4">
              <Zap className="h-8 w-8 text-yellow-300 animate-pulse" />
            </div>
            <CardContent className="p-8 relative">
              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-4">🌟 Jornada de Crescimento</h3>
                <p className="text-lg opacity-90 italic">
                  "Cada grande jornada começa com um único passo. Este mentorado está construindo seu futuro com determinação e foco!"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                Sobre o Mentorado
              </h2>
              {profileData.bio ? (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div 
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: profileData.bio }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg italic">
                    Este mentorado está preparando uma apresentação incrível sobre si mesmo. 
                    Em breve você conhecerá mais sobre sua jornada! 📚✨
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                Informações de Contato
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">E-mail</p>
                      <p className="text-gray-700 font-medium">
                        {profileData.email || "Não informado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Telefone</p>
                      <p className="text-gray-700 font-medium">
                        {profileData.phone || "Não informado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Birth Date */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Data de Nascimento</p>
                      <p className="text-gray-700 font-medium">
                        {profileData.date_of_birth 
                          ? new Date(profileData.date_of_birth).toLocaleDateString('pt-BR')
                          : "Não informado"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category */}
                {profileData.category && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Área de Interesse</p>
                        <p className="text-gray-700 font-medium">{profileData.category}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Membro desde</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(profileData.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivational Section */}
          <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-4 left-4">
              <Sparkles className="h-8 w-8 text-yellow-300 animate-spin" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Heart className="h-8 w-8 text-pink-300 animate-pulse" />
            </div>
            <CardContent className="p-8 relative">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">🚀 Potencial Ilimitado</h3>
                <p className="text-lg opacity-90 mb-6">
                  Este mentorado representa o futuro brilhante que estamos construindo juntos. 
                  Cada interação é uma oportunidade de crescimento mútuo e transformação positiva.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">✨ Dedicação</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">🎯 Foco</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">🌟 Crescimento</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fun Facts Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 text-white">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-100" />
                <h4 className="font-bold text-lg mb-2">Aprendizado</h4>
                <p className="text-sm opacity-90">Sempre em busca de novos conhecimentos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-purple-100" />
                <h4 className="font-bold text-lg mb-2">Objetivos</h4>
                <p className="text-sm opacity-90">Focado em alcançar suas metas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-green-100" />
                <h4 className="font-bold text-lg mb-2">Energia</h4>
                <p className="text-sm opacity-90">Motivado para fazer a diferença</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }
      `}</style>
    </div>
  );
};

export default MentoradoPublicViewPage;
