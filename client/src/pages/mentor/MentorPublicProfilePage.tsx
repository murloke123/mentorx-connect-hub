import BadgesSection from "@/components/mentor/profile/BadgesSection";
import ContactForm from "@/components/mentor/profile/ContactForm";
import CourseCard from "@/components/shared/CourseCard";
import { FollowSuccessModal } from "@/components/shared/FollowSuccessModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { notifyLostFollower, notifyNewFollower } from "@/services/notificationService";
import { Course, Profile } from "@/types/database";
import { supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calendar, CalendarDays, Clock, Facebook, GraduationCap, Heart, Instagram, Mail, MessageCircle, Quote, Star, User, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MentorCalendarComponent from "@/components/MentorCalendarComponent";
import Navigation from "@/components/shared/Navigation";

interface CourseWithProfile extends Course {
  mentor_name?: string;
  mentor_avatar?: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  }[];
}

const MentorPublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentorData, setMentorData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('sobre');
  const [isFollowing, setIsFollowing] = useState(false);
  const [mentorSettings, setMentorSettings] = useState({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00',
    sessionDuration: 60,
    timezone: 'America/Sao_Paulo',
    price: 0
  });
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Monitor changes to mentor settings
  useEffect(() => {
    console.log('📋 [MENTOR-SETTINGS] Estado atualizado:', mentorSettings);
  }, [mentorSettings]);

  // Função para re-verificar status de follow
  const recheckFollowStatus = async () => {
    console.log(' [FOLLOW-RECHECK] Iniciando re-verificação de status');
    console.log('🔄 [FOLLOW-RECHECK] Iniciando re-verificação de status');
    
    if (!currentUser || !id) {
      console.log('⚠️ [FOLLOW-RECHECK] Condições não atendidas');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("mentor_followers")
        .select("mentor_id, follower_id, followed_at")
        .eq("mentor_id", id)
        .eq("follower_id", currentUser.id)
        .single();
      
      const isCurrentlyFollowing = !!data && !error;
      console.log('🔄 [FOLLOW-RECHECK] Status atualizado:', { isCurrentlyFollowing, data, error });
      
      setIsFollowing(isCurrentlyFollowing);
      return isCurrentlyFollowing;
    } catch (recheckError) {
      console.error('💥 [FOLLOW-RECHECK] Erro na re-verificação:', recheckError);
      return false;
    }
  };

  // Fetch mentor courses
  const { data: mentorCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['mentorCourses', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("cursos")
        .select(`
          id, 
          title, 
          description, 
          is_public, 
          is_paid, 
          price, 
          discount,
          discounted_price,
          image_url, 
          created_at, 
          updated_at, 
          mentor_id,
          profiles:mentor_id (full_name, avatar_url)
        `)
        .eq("mentor_id", id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching mentor courses:", error);
        return [];
      }
      
      // Format the data to include mentor information
      const typedData = data as CourseWithProfile[] | null;

      // Format the data to include mentor information
      const formattedCourses = typedData?.map((course) => ({
        ...course,
        mentor_name: course.profiles?.[0]?.full_name,
        mentor_avatar: course.profiles?.[0]?.avatar_url,
      })) || [];
      
      return formattedCourses;
    },
    enabled: !!id
  });

  // Check if current user is following this mentor
  useEffect(() => {
    const checkFollowStatus = async () => {
      console.log('🔍 [FOLLOW-CHECK] Iniciando verificação de follow status');
      console.log('🔍 [FOLLOW-CHECK] Parâmetros:', { currentUser: !!currentUser, id, currentUserId: currentUser?.id });
      
      if (!currentUser || !id) {
        console.log('⚠️ [FOLLOW-CHECK] Condições não atendidas - currentUser ou id ausentes');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("mentor_followers")
          .select("mentor_id, follower_id, followed_at")
          .eq("mentor_id", id)
          .eq("follower_id", currentUser.id)
          .single();
        
        console.log('📥 [FOLLOW-CHECK] Resposta do banco:', { data, error });
        
        const isCurrentlyFollowing = !!data && !error;
        console.log('✅ [FOLLOW-CHECK] Status final:', { isCurrentlyFollowing });
        
        setIsFollowing(isCurrentlyFollowing);
      } catch (checkError) {
        console.error('💥 [FOLLOW-CHECK] Erro na verificação:', checkError);
        setIsFollowing(false);
      }
    };
    
    checkFollowStatus();
  }, [id, currentUser]);

  // Load mentor data
  useEffect(() => {
    const fetchMentorData = async () => {
      if (!id) {
        navigate("/");
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .eq("role", "mentor")
          .single();

        if (error) throw error;
        setMentorData(data);
      } catch (error) {
        console.error("Error fetching mentor data:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar o perfil do mentor."
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorData();
  }, [id, navigate, toast]);

  // Load mentor calendar settings
  useEffect(() => {
    const fetchMentorSettings = async () => {
      if (!id) return;
      
      console.log('🔍 [MENTOR-SETTINGS] Iniciando carregamento das configurações para mentor ID:', id);
      
      try {
        const { data, error } = await supabase
          .from('calendarsettings')
          .select('*')
          .eq('mentor_id', id)
          .single();

        console.log('📊 [MENTOR-SETTINGS] Resultado da consulta:', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('❌ [MENTOR-SETTINGS] Erro ao carregar configurações do mentor:', error);
          return;
        }
        
        if (data) {
          console.log('✅ [MENTOR-SETTINGS] Configurações encontradas no banco:', data);
          
          // Converter horários do formato time (HH:MM:SS) para string (HH:MM)
          const formatTime = (timeString: string) => {
            if (!timeString) return null;
            if (timeString.length === 5) return timeString;
            return timeString.substring(0, 5);
          };

          const loadedSettings = {
            workingDays: data.working_days || mentorSettings.workingDays,
            startTime: formatTime(data.start_time) || mentorSettings.startTime,
            endTime: formatTime(data.end_time) || mentorSettings.endTime,
            sessionDuration: data.session_duration || mentorSettings.sessionDuration,
            timezone: data.timezone || mentorSettings.timezone,
            price: data.price || mentorSettings.price
          };
          
          console.log('🔄 [MENTOR-SETTINGS] Configurações processadas:', loadedSettings);
          console.log('🔄 [MENTOR-SETTINGS] Configurações anteriores:', mentorSettings);
          
          setMentorSettings(loadedSettings);
        } else {
          console.log('⚠️ [MENTOR-SETTINGS] Nenhuma configuração encontrada, usando valores padrão');
        }
      } catch (error) {
        console.error('💥 [MENTOR-SETTINGS] Erro ao buscar configurações do mentor:', error);
      }
    };

    fetchMentorSettings();
  }, [id]);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user complete profile including full_name
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (userProfile) {
          setCurrentUser(userProfile);
          setUserRole(userProfile.role || null);
        }
      }
    };

    getCurrentUser();
  }, []);

  const handleFollowToggle = async () => {
    console.log('🚀 [FOLLOW] Iniciando handleFollowToggle');
    console.log('🔍 [FOLLOW] Estado atual:', {
      currentUser: currentUser ? {
        id: currentUser.id,
        full_name: currentUser.full_name,
        role: currentUser.role
      } : null,
      mentorData: mentorData ? {
        id: mentorData.id,
        full_name: mentorData.full_name
      } : null,
      mentorId: id,
      isFollowing
    });

    if (!currentUser) {
      console.log('❌ [FOLLOW] Usuário não logado');
      toast({
        variant: "destructive",
        title: "Login necessário",
        description: "Você precisa estar logado para seguir um mentor."
      });
      navigate("/login");
      return;
    }

    try {
      // Get the user's full name from profile
      const userName = currentUser.full_name || 'Usuário Anônimo';
      console.log('👤 [FOLLOW] Nome do usuário:', userName);
      
      if (isFollowing) {
        console.log('➖ [FOLLOW] Executando UNFOLLOW');
        
        // Unfollow direto
        const { error } = await supabase
          .from("mentor_followers")
          .delete()
          .eq("mentor_id", id)
          .eq("follower_id", currentUser.id);

        if (error) {
          console.error('❌ [FOLLOW] Erro no unfollow:', error);
          throw error;
        }

        console.log('✅ [FOLLOW] Unfollow realizado com sucesso');
        setIsFollowing(false);
        toast({
          title: "Deixou de seguir",
          description: `Você não está mais seguindo ${mentorData?.full_name}.`
        });
        
        // Re-verificar status para garantir consistência
        await recheckFollowStatus();

        // Criar notificação para o mentor sobre perda de seguidor
        console.log('💔 [FOLLOW] Iniciando criação de notificação de unfollow');
        console.log('🔍 [FOLLOW] Verificando condições:', {
          mentorData: !!mentorData,
          id: !!id,
          mentorDataId: mentorData?.id,
          paramId: id
        });
        
        if (mentorData && id) {
          try {
            const notificationData = {
              mentorId: id,
              mentorName: mentorData.full_name || 'Mentor',
              followerId: currentUser.id,
              followerName: userName,
            };
            
            console.log('📤 [FOLLOW] Dados para notificação de unfollow:', notificationData);
            console.log('🔧 [FOLLOW] Chamando notifyLostFollower...');
            
            const result = await notifyLostFollower(notificationData);
            
            console.log('📨 [FOLLOW] Resultado da notificação de unfollow:', result);
            
            if (result.success) {
              console.log('✅ [FOLLOW] Notificação de unfollow criada com sucesso');
            } else {
              console.error('⚠️ [FOLLOW] Falha na criação da notificação de unfollow:', result.error);
            }
          } catch (notificationError) {
            console.error('💥 [FOLLOW] Erro ao criar notificação de unfollow:', notificationError);
            console.error('📋 [FOLLOW] Stack trace:', notificationError instanceof Error ? notificationError.stack : 'N/A');
            // Não bloquear o unfollow por erro na notificação
          }
        } else {
          console.log('⚠️ [FOLLOW] Condições não atendidas para criar notificação de unfollow:', {
            mentorData: !!mentorData,
            id: !!id
          });
        }
      } else {
        console.log('➕ [FOLLOW] Executando FOLLOW');
        
        // Follow direto
        const followData = {
          mentor_id: id,
          follower_id: currentUser.id,
          follower_name: userName,
          mentor_name: mentorData?.full_name || 'Mentor'
        };
        
        console.log('📦 [FOLLOW] Dados para inserir no mentor_followers:', followData);
        
        const { error } = await supabase
          .from("mentor_followers")
          .insert(followData);

        if (error) {
          console.error('❌ [FOLLOW] Erro no follow:', error);
          
          // Se for erro de chave duplicada, verificar se já está seguindo
          if (error.code === '23505') {
            console.log('🔄 [FOLLOW] Erro de chave duplicada - verificando status real');
            
            const actualStatus = await recheckFollowStatus();
            
            if (actualStatus) {
              console.log('✅ [FOLLOW] Já está seguindo - estado corrigido');
              toast({
                title: "Já seguindo",
                description: `Você já está seguindo ${mentorData?.full_name}!`
              });
              return;
            }
          }
          
          throw error;
        }

        console.log('✅ [FOLLOW] Follow realizado com sucesso');
        setIsFollowing(true);
        
        // Mostrar modal de sucesso
        setShowSuccessModal(true);
        
        toast({
          title: "Agora você está seguindo",
          description: `Você está seguindo ${mentorData?.full_name}!`
        });

        // Re-verificar status para garantir consistência
        await recheckFollowStatus();

        // Criar notificação para o mentor sobre novo seguidor
        console.log('🔔 [FOLLOW] Iniciando criação de notificação');
        console.log('🔍 [FOLLOW] Verificando condições:', {
          mentorData: !!mentorData,
          id: !!id,
          mentorDataId: mentorData?.id,
          paramId: id
        });
        
        if (mentorData && id) {
          try {
            const notificationData = {
              mentorId: id,
              mentorName: mentorData.full_name || 'Mentor',
              followerId: currentUser.id,
              followerName: userName,
            };
            
            console.log('📤 [FOLLOW] Dados para notificação:', notificationData);
            console.log('🔧 [FOLLOW] Chamando notifyNewFollower...');
            
            const result = await notifyNewFollower(notificationData);
            
            console.log('📨 [FOLLOW] Resultado da notificação:', result);
            
            if (result.success) {
              console.log('✅ [FOLLOW] Notificação criada com sucesso');
            } else {
              console.error('⚠️ [FOLLOW] Falha na criação da notificação:', result.error);
            }
          } catch (notificationError) {
            console.error('💥 [FOLLOW] Erro ao criar notificação:', notificationError);
            console.error('📋 [FOLLOW] Stack trace:', notificationError instanceof Error ? notificationError.stack : 'N/A');
            // Não bloquear o follow por erro na notificação
          }
        } else {
          console.log('⚠️ [FOLLOW] Condições não atendidas para criar notificação:', {
            mentorData: !!mentorData,
            id: !!id
          });
        }
      }
    } catch (error) {
      console.error("💥 [FOLLOW] Error toggling follow:", error);
      console.error("📋 [FOLLOW] Stack trace:", error instanceof Error ? error.stack : 'N/A');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível processar sua solicitação."
      });
    }
    
    console.log('🏁 [FOLLOW] Finalizando handleFollowToggle');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hero cards data from database or default values
  const stats = [
    { 
      value: mentorData?.hero_cards?.hero_card_1 || "1.250+", 
      label: mentorData?.hero_cards?.hero_card_desc_1 || "Mentorados de Sucesso", 
      icon: "/icons/pessoas.png" 
    },
    { 
      value: mentorData?.hero_cards?.hero_card_2 || "98%", 
      label: mentorData?.hero_cards?.hero_card_desc_2 || "Taxa de Satisfação", 
      icon: "/icons/review.png" 
    },
    { 
      value: mentorData?.hero_cards?.hero_card_3 || "15+", 
      label: mentorData?.hero_cards?.hero_card_desc_3 || "Anos de Experiência", 
      icon: "/icons/montanha.png" 
    },
    { 
       value: mentorData?.hero_cards?.hero_card_4 || "R$ 50M+", 
       label: mentorData?.hero_cards?.hero_card_desc_4 || "Movimentados pelos Alunos", 
       icon: "/icons/money.png" 
     }
   ];

  const testimonials = [
    {
      name: "Maria Silva",
      profession: "Empreendedora Digital",
      content: "A mentoria transformou completamente meu negócio. Em 6 meses consegui aumentar meu faturamento em 300%!",
      rating: 5
    },
    {
      name: "João Santos",
      profession: "Desenvolvedor",
      content: "Graças aos ensinamentos do mentor, consegui minha primeira promoção e dobrei meu salário.",
      rating: 5
    },
    {
      name: "Ana Costa",
      profession: "Consultora Financeira",
      content: "O curso de finanças me deu todas as ferramentas que eu precisava para prosperar no mercado.",
      rating: 5
    }
  ];

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!mentorData) {
    return (
      <div>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Mentor não encontrado</h1>
            <Button onClick={() => navigate("/mentors")}>
              Ver outros mentores
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Common content component
  const ProfileContent = () => (
      <div className="min-h-screen bg-gray-50">
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
            
              {/* Floating Stats with 20% transparency */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="mb-2 flex justify-center">
                        <img 
                          src={stat.icon} 
                          alt={stat.label}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div className="text-2xl font-semibold text-gray-800 drop-shadow-lg" style={{textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6)'}}>{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                ))}
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
              {mentorData.avatar_url ? (
                <img
                  src={mentorData.avatar_url}
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
        
        {/* Name and CTA section */}
        <div className="mt-24 max-w-5xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {mentorData.full_name}
          </h1>
          
          {/* Categoria do Mentor */}
          {mentorData.category && (
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200">
                <Star className="w-4 h-4 mr-2" />
                {mentorData.category}
              </span>
            </div>
          )}
          
          {mentorData.highlight_message && (
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              {mentorData.highlight_message}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          {/* Only show follow button if user is not viewing their own profile */}
          {currentUser?.id !== id && (
            <Button
              onClick={handleFollowToggle}
                className={`px-8 py-3 rounded-full transition-all flex items-center gap-2 font-semibold text-lg ${
                isFollowing 
                    ? 'bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Seguindo' : 'Seguir Mentor'}
            </Button>
          )}
            
            <div className="flex gap-3">
              <a 
                href={mentorData?.social_media?.instagram || "#"} 
                target={mentorData?.social_media?.instagram ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border ${
                  !mentorData?.social_media?.instagram ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !mentorData?.social_media?.instagram && e.preventDefault()}
              >
                <Instagram className="h-6 w-6 text-pink-600" />
              </a>
              <a 
                href={mentorData?.social_media?.facebook || "#"} 
                target={mentorData?.social_media?.facebook ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border ${
                  !mentorData?.social_media?.facebook ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !mentorData?.social_media?.facebook && e.preventDefault()}
              >
                <Facebook className="h-6 w-6 text-blue-600" />
              </a>
              <a 
                href={mentorData?.social_media?.youtube || "#"} 
                target={mentorData?.social_media?.youtube ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border ${
                  !mentorData?.social_media?.youtube ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !mentorData?.social_media?.youtube && e.preventDefault()}
              >
                <Youtube className="h-6 w-6 text-red-600" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Sticky Navigation */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex justify-center space-x-8 py-4">
              {[
              { id: 'sobre', label: 'Quem Sou Eu', icon: User },
                { id: 'cursos', label: 'Cursos', icon: GraduationCap },
                { id: 'depoimentos', label: 'Depoimentos', icon: Star },
                { id: 'agenda', label: 'Agenda', icon: Calendar },
              { id: 'contato', label: 'Entre em Contato', icon: MessageCircle }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-br from-gray-400/80 via-gray-500/80 to-gray-600/80 text-white shadow-lg backdrop-blur-sm'
                        : 'text-gray-600 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
          
          {/* Sobre Section */}
          <section id="sobre" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border">
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {mentorData.bio && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Minha História</h3>
                        <div 
                          className="text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: mentorData.bio }}
                        />
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="mb-4">
                    <h3 className="text-3xl font-bold text-black">
                        Por que me seguir?
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
                      <h4 className="font-bold text-lg mb-2">
                        {mentorData.cx_diferenciais?.dif_title_1 || "🎯 Resultados Comprovados"}
                      </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                        {mentorData.cx_diferenciais?.dif_description_1 || "Mais de 1.250 vidas transformadas com metodologias testadas e aprovadas."}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500">
                      <h4 className="font-bold text-lg mb-2">
                        {mentorData.cx_diferenciais?.dif_title_2 || "🚀 Metodologia Exclusiva"}
                      </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                        {mentorData.cx_diferenciais?.dif_description_2 || "Sistema proprietário desenvolvido ao longo de 15 anos de experiência."}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500">
                      <h4 className="font-bold text-lg mb-2">
                        {mentorData.cx_diferenciais?.dif_title_3 || "💰 ROI Garantido"}
                      </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                        {mentorData.cx_diferenciais?.dif_description_3 || "Investimento retorna em até 90 dias ou seu dinheiro de volta."}
                      </p>
                    </div>
                  </div>

                    {/* Add Badges Section here in the right column */}
                    <BadgesSection />
                </div>
              </div>
            </div>
          </section>

          {/* Cursos Section */}
          <section id="cursos" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border">
              <div className="flex items-center justify-center gap-3 mb-10">
                <BookOpen className="h-8 w-8 text-black" />
                <h2 className="text-3xl font-bold text-black">Cursos Disponíveis</h2>
              </div>
              
                {coursesLoading ? (
                  <div className="flex justify-center">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : mentorCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentorCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
                  </div>
                ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                    <div className="max-w-md mx-auto">
                      <img 
                        src="https://static.vecteezy.com/ti/vetor-gratis/p1/11535870-nenhum-salvo-conceito-ilustracao-design-plano-vector-eps10-elemento-grafico-moderno-para-pagina-de-destino-ui-de-estado-vazio-infografico-icone-vetor.jpg"
                        alt="Nenhum curso disponível"
                        className="w-32 h-32 mx-auto mb-6 opacity-60"
                      />
                      <h3 className="text-2xl font-bold text-gray-700 mb-4">
                        Ainda não há cursos disponíveis
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Este mentor ainda não criou nenhum curso, mas em breve trará novidades incríveis para você! 
                        Siga este mentor para ser notificado quando novos conteúdos estiverem disponíveis.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* Depoimentos Section */}
          <section id="depoimentos" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border">
              <div className="flex items-center justify-center gap-3 mb-10">
                <MessageCircle className="h-8 w-8 text-black" />
                <h2 className="text-3xl font-bold text-black">O que dizem meus mentorados ...</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border relative">
                    <Quote className="absolute top-4 left-4 h-6 w-6 text-gray-400" />
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden">
                        <img
                          src={mentorData.review_comments?.[`photo_${index}`] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                          alt={mentorData.review_comments?.[`name_${index}`] || 'Pessoa'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                          }}
                        />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {mentorData.review_comments?.[`name_${index}`] || 'Nome da Pessoa'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {mentorData.review_comments?.[`profession_${index}`] || 'Profissão'}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        "{mentorData.review_comments?.[`comment_${index}`] || 'Comentário do depoimento'}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Agenda Section */}
          <section id="agenda" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border">
              <div className="flex items-center justify-center gap-3 mb-10">
                <CalendarDays className="h-8 w-8 text-black" />
                <h2 className="text-3xl font-bold text-black">
                  Agende uma Conversa
                </h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Lado esquerdo - Configurações de Disponibilidade (visualização) */}
                <div className="md:col-span-1">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl border border-purple-100 h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">
                      Disponibilidade
                    </h3>
                    
                    {/* Dias da Semana */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Dias Disponíveis</h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'monday', label: 'Seg' },
                            { key: 'tuesday', label: 'Ter' },
                            { key: 'wednesday', label: 'Qua' },
                            { key: 'thursday', label: 'Qui' },
                            { key: 'friday', label: 'Sex' },
                            { key: 'saturday', label: 'Sáb' },
                            { key: 'sunday', label: 'Dom' }
                          ].map((day) => {
                            const isAvailable = mentorSettings.workingDays.includes(day.key);
                            return (
                              <span
                                key={day.key}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                  isAvailable
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}
                              >
                                {day.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Horários */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Horário de Atendimento</h4>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span>{mentorSettings.startTime} às {mentorSettings.endTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Duração da Sessão */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Duração das Sessões</h4>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span>{mentorSettings.sessionDuration} minutos</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Fuso Horário */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Fuso Horário</h4>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span>{mentorSettings.timezone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Valor do Agendamento */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Valor do Agendamento</h4>
                        <div className="bg-white p-4 rounded-lg border">
                          {mentorSettings.price && mentorSettings.price > 0 ? (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-green-600">
                                R$ {mentorSettings.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="font-medium text-blue-600">
                                🎉 Essa mentoria está gratuita no momento, aproveite!
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Lado direito - Calendário */}
                <div className="md:col-span-1">
                  <MentorCalendarComponent 
                    settings={mentorSettings}
                    mentorId={id || ''}
                    mentorName={mentorData.full_name || 'Mentor'}
                    isClickable={true}
                    onAppointmentChange={() => {
                      console.log('Appointments updated');
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contato Section */}
          <section id="contato" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border">
              <div className="flex items-center justify-center gap-3 mb-10">
                 <Mail className="h-8 w-8 text-black" />
                 <h2 className="text-3xl font-bold text-black">Entre em Contato</h2>
               </div>
                <div className="grid lg:grid-cols-2 gap-12 mb-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Formas de Contato</h3>
                    
                    <div className="space-y-4">
                      {mentorData.phone && (
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <MessageCircle className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-medium">Telefone/WhatsApp</p>
                            <p className="text-gray-600 blur-sm select-none">{mentorData.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 text-left italic">
                        Em breve você poderá entrar em contato diretamente com o mentor através do WhatsApp e com seus Agentes automatizados para personalizar sua jornada de mentoria.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Envie uma Mensagem</h3>
                    <ContactForm 
                      mentorName={mentorData?.full_name || ''}
                      mentorEmail={mentorData?.email || ''}
                      onSubmitSuccess={() => {
                        console.log('Mensagem enviada com sucesso!');
                      }}
                    />
                  </div>
                </div>
                
                {/* Rodapé com os botões */}
                <div className="border-t pt-6 mt-8">
                  <div className="grid lg:grid-cols-1 gap-4">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Chamar no WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Final */}
            <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-16 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Pronto para Transformar sua Vida?</h2>
              <p className="text-xl mb-8 opacity-90">
                Junte-se aos seguidores de {mentorData.full_name?.split(' ')[0]} e comece sua jornada de transformação
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-center space-x-8 text-lg">
                  <span>✅ Garantia de 30 dias</span>
                  <span>✅ Suporte personalizado</span>
                  <span>✅ Resultados comprovados</span>
                </div>
              </div>
              
              <Button
                onClick={handleFollowToggle}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                {isFollowing ? 'Você está seguindo!' : 'Seguir Agora'}
              </Button>
            </section>
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

  // If user is not logged in, show Navigation component
  if (!currentUser) {
  return (
      <div>
        <Navigation />
        <ProfileContent />
        
        {/* Modal de Sucesso */}
        <FollowSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          mentorName={mentorData?.full_name || 'Mentor'}
                      />
                    </div>
    );
  }

  // If user is logged in, also show Navigation (no sidebar for public profile)
  return (
                    <div>
      <Navigation />
      <ProfileContent />
      
      {/* Modal de Sucesso */}
      <FollowSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        mentorName={mentorData?.full_name || 'Mentor'}
      />
    </div>
  );
};

export default MentorPublicProfilePage;
