import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { createNotification } from "@/services/notificationService";
import { supabase } from "@/utils/supabase";
import { BookOpen, Calendar, Heart, Mail, MessageCircle, Phone, Sparkles, Star, Target, Trophy, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<MentoradoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const handleSendMessage = async () => {
    if (!profileData || !messageText.trim() || !user) return;

    setSendingMessage(true);
    try {
      console.log('🔔 Enviando notificação para mentorado:', profileData.full_name);
      console.log('👤 Dados do usuário (mentor):', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      });
      console.log('🎯 Mentorado selecionado:', {
        id: profileData.id,
        name: profileData.full_name
      });
      
      // Criar notificação no banco de dados
      const result = await createNotification({
        receiver_id: profileData.id,
        receiver_name: profileData.full_name || 'Mentorado',
        receiver_role: 'mentorado', // Receptor é sempre mentorado
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || user.email || 'Mentor',
        sender_role: 'mentor', // Quem envia mensagem é sempre mentor
        type: 'message',
        title: 'Nova mensagem de mentor',
        message: messageText.trim()
      });

      if (result.success) {
        toast.success(`Notificação enviada para ${profileData.full_name}`);
        setMessageText("");
        setIsNotificationModalOpen(false);
        console.log('✅ Notificação criada com sucesso:', result.data);
      } else {
        throw new Error('Falha ao criar notificação');
      }
    } catch (error) {
      console.error("❌ Erro ao enviar notificação:", error);
      toast.error("Erro ao enviar notificação");
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <Card className="w-full max-w-md glass-card border border-gold/20">
          <CardContent className="p-6 text-center">
            <div className="text-gold mb-2">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Mentorado não encontrado
            </h3>
            <p className="text-silver">
              {error || "O perfil solicitado não está disponível."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gold/10 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gold/10 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gold/10 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gold/10 rounded-full opacity-20 animate-bounce"></div>
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
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-800/70"></div>
          
          {/* Floating Elements (bolinhas) */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gold/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-gold/10 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gold/5 rounded-full"></div>
          </div>
          
          {/* Nome e Tag sobreposto ao banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl px-8 py-6 border border-gold/20 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {profileData.full_name || "Nome não informado"}
                </h1>
                
                <div className="flex justify-center items-center gap-3">
                  <Badge 
                    className="bg-gold/90 text-black border-0 backdrop-blur-sm px-4 py-2 font-semibold shadow-lg cursor-pointer hover:bg-gold/80 transition-colors"
                    onClick={() => setIsNotificationModalOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar Notificação
                  </Badge>
                  {profileData.category && (
                    <Badge className="bg-gradient-to-r from-slate-700 to-slate-800 text-gold border border-gold/30 px-4 py-2 font-semibold shadow-lg">
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
          <div className="text-center">
            <div 
              className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-4 border-gold shadow-xl bg-slate-800 mx-auto"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
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
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-gold flex items-center justify-center">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="mt-24 max-w-5xl mx-auto text-center px-4">        
        {profileData.highlight_message && (
          <p className="text-xl text-silver mb-6 max-w-3xl mx-auto">
            {profileData.highlight_message}
          </p>
        )}
        
        {/* Banner Jornada de Crescimento próximo ao avatar */}
        <div className="mt-8 mb-8 max-w-4xl mx-auto px-4">
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border border-gold/20 text-white overflow-hidden relative shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 right-4">
              <Zap className="h-8 w-8 text-gold animate-pulse" />
            </div>
            <CardContent className="p-6 relative">
              <div className="text-center">
                <Trophy className="h-10 w-10 mx-auto mb-3 text-gold" />
                <h3 className="text-xl font-bold mb-3 text-gold">🌟 Jornada de Crescimento</h3>
                <p className="text-base text-silver italic">
                  "Cada grande jornada começa com um único passo. Este mentorado está construindo seu futuro com determinação e foco!"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          
          {/* About Section */}
          <Card className="glass-card border border-gold/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-r from-gold to-yellow-500 p-2 rounded-lg">
                  <User className="h-6 w-6 text-black" />
                </div>
                Sobre o Mentorado
              </h2>
              {profileData.bio ? (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
                  <div 
                    className="prose prose-lg max-w-none text-silver leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: profileData.bio }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-gold/50 mb-4" />
                  <p className="text-silver text-lg italic">
                    Este mentorado está preparando uma apresentação incrível sobre si mesmo. 
                    Em breve você conhecerá mais sobre sua jornada! 📚✨
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass-card border border-gold/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-r from-gold to-yellow-500 p-2 rounded-lg">
                  <Mail className="h-6 w-6 text-black" />
                </div>
                Informações de Contato
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-gold to-yellow-500 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gold mb-1">E-mail</p>
                      <p className="text-silver font-medium">
                        {profileData.email || "Não informado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-gold to-yellow-500 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gold mb-1">Telefone</p>
                      <p className="text-silver font-medium">
                        {profileData.phone || "Não informado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Birth Date */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-gold to-yellow-500 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gold mb-1">Data de Nascimento</p>
                      <p className="text-silver font-medium">
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
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-gold to-yellow-500 p-3 rounded-full">
                        <Target className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gold mb-1">Área de Interesse</p>
                        <p className="text-silver font-medium">{profileData.category}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gold/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-gold to-yellow-500 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gold mb-1">Membro desde</p>
                      <p className="text-silver font-medium">
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
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border border-gold/20 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 left-4">
              <Sparkles className="h-8 w-8 text-gold animate-spin" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Heart className="h-8 w-8 text-gold animate-pulse" />
            </div>
            <CardContent className="p-8 relative">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-gold">🚀 Potencial Ilimitado</h3>
                <p className="text-lg text-silver mb-6">
                  Este mentorado representa o futuro brilhante que estamos construindo juntos. 
                  Cada interação é uma oportunidade de crescimento mútuo e transformação positiva.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="bg-gold/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/30">
                    <span className="text-sm font-medium text-gold">✨ Dedicação</span>
                  </div>
                  <div className="bg-gold/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/30">
                    <span className="text-sm font-medium text-gold">🎯 Foco</span>
                  </div>
                  <div className="bg-gold/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-gold/30">
                    <span className="text-sm font-medium text-gold">🌟 Crescimento</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fun Facts Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border border-gold/20 text-white">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gold" />
                <h4 className="font-bold text-lg mb-2 text-gold">Aprendizado</h4>
                <p className="text-sm text-silver">Sempre em busca de novos conhecimentos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border border-gold/20 text-white">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-gold" />
                <h4 className="font-bold text-lg mb-2 text-gold">Objetivos</h4>
                <p className="text-sm text-silver">Focado em alcançar suas metas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border border-gold/20 text-white">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-gold" />
                <h4 className="font-bold text-lg mb-2 text-gold">Energia</h4>
                <p className="text-sm text-silver">Motivado para fazer a diferença</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      
      {/* Modal de Notificação */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="glass-card border border-gold/20">
          <DialogHeader>
            <DialogTitle className="text-white">Enviar Notificação para {profileData?.full_name}</DialogTitle>
            <DialogDescription className="text-silver">
              Envie uma mensagem de notificação para este mentorado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="bg-slate-800/50 border-gold/20 text-white placeholder:text-silver"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNotificationModalOpen(false)}
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendingMessage}
              className="bg-gold hover:bg-yellow-500 text-black"
            >
              {sendingMessage ? "Enviando..." : "Enviar Notificação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
