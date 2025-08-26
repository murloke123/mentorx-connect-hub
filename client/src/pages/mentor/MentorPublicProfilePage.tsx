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
import { BookOpen, Calendar, CalendarDays, Clock, Facebook, FileText, GraduationCap, Heart, Instagram, Mail, MessageCircle, Quote, Star, User, UserPlus, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MentorCalendarComponent from "@/components/MentorCalendarComponent";
import Navigation from "@/components/shared/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Função para lidar com o clique no botão WhatsApp
  const handleWhatsAppClick = () => {
    if (!mentorData?.phone) {
      toast({
        variant: "destructive",
        title: "Número não disponível",
        description: "Este mentor não possui número de telefone preenchido na plataforma."
      });
      return;
    }

    // Obter código do país (sem o +) e número de telefone limpo
    const countryCode = (mentorData as any).country ? (mentorData as any).country.replace('+', '') : '55';
    const cleanPhone = mentorData.phone.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    
    // Combinar código do país com o número de telefone
    const fullPhoneNumber = `${countryCode}${cleanPhone}`;
    
    // Mensagem pré-carregada
    const message = encodeURIComponent("Olá, vim através da plataforma Mentora Ai e preciso falar com você.");
    
    // Abrir WhatsApp Web em nova guia com mensagem pré-carregada
    const whatsappUrl = `https://wa.me/${fullPhoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

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

      // Format the data to include mentor information that CourseCard expects
      const formattedCourses = typedData?.map((course) => ({
        ...course,
        mentor_info: {
          full_name: course.profiles?.[0]?.full_name || 'Mentor',
          avatar_url: course.profiles?.[0]?.avatar_url || null
        }
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
        <div className="min-h-screen bg-black flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gold/50 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-silver text-lg">Carregando perfil do mentor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mentorData) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-black flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="glass-card p-6 w-full max-w-md mx-4 border border-gold/20">
              <div className="text-center">
                <div className="text-gold mb-2">
                  <User className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Mentor não encontrado
                </h3>
                <p className="text-silver mb-4">
                  O perfil solicitado não está disponível.
                </p>
                <Button 
                  onClick={() => navigate("/mentors")}
                  className="bg-gold hover:bg-yellow-500 text-black font-semibold"
                >
                  Ver outros mentores
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Common content component
  const ProfileContent = () => (
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative w-full">
          {/* Banner with gradient overlay */}
          <div className="w-full h-[350px] overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1500&q=80"
              alt="Banner profile" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
            
              {/* Floating Stats with glass effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-card p-4 text-center border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105">
                      <div className="mb-2 flex justify-center">
                        <img 
                          src={stat.icon} 
                          alt={stat.label}
                          className="w-10 h-10 object-contain filter brightness-0 invert"
                        />
                      </div>
                      <div className="text-2xl font-semibold text-gold drop-shadow-lg">{stat.value}</div>
                      <div className="text-sm text-silver">{stat.label}</div>
                    </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Profile Avatar */}
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-4 border-gold shadow-xl bg-slate-800"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
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
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-gold flex items-center justify-center">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
        
        {/* Name and CTA section */}
        <div className="mt-24 max-w-5xl mx-auto text-center px-2 md:px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {mentorData.full_name}
          </h1>
          
          {mentorData.highlight_message && (
            <p className="text-lg md:text-xl text-silver mb-6 max-w-3xl mx-auto italic">
              "{mentorData.highlight_message}"
            </p>
          )}
          
          {/* Botões Seguir e Categoria */}
          <div className="flex flex-row justify-center items-center gap-4 mb-4">
          {/* Only show follow button if user is not viewing their own profile */}
          {currentUser?.id !== id && (
            <button
              onClick={handleFollowToggle}
              className={`inline-flex items-center px-4 py-3 rounded-full text-sm md:text-base font-medium backdrop-blur-sm border transition-all ${
                isFollowing 
                  ? 'bg-red-600/80 hover:bg-red-700/80 text-white border-red-500/20 hover:border-red-500/40' 
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-gold border-gold/20 hover:border-gold/40'
              }`}
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isFollowing ? 'fill-current text-white' : 'text-gold'}`} />
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
          )}

          {/* Categoria do Mentor */}
          {mentorData.category && (
            <div className="flex items-center">
              <span className="inline-flex items-center px-4 py-3 rounded-full text-sm md:text-base font-medium bg-slate-800/80 backdrop-blur-sm text-gold border border-gold/20">
                <Star className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gold" />
                {mentorData.category}
              </span>
            </div>
          )}
          </div>
            
          {/* Botões das Redes Sociais */}
          <div className="flex justify-center gap-3 mb-6">
              <a 
                href={mentorData?.social_media?.instagram || "#"} 
                target={mentorData?.social_media?.instagram ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full glass-card border border-gold/20 hover:border-gold/40 transition-all hover:scale-110 ${
                  !mentorData?.social_media?.instagram ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !mentorData?.social_media?.instagram && e.preventDefault()}
              >
                <Instagram className="h-6 w-6 text-gold" />
              </a>
              <a 
                href={mentorData?.social_media?.facebook || "#"} 
                target={mentorData?.social_media?.facebook ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full glass-card border border-gold/20 hover:border-gold/40 transition-all hover:scale-110 ${
                  !mentorData?.social_media?.facebook ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !mentorData?.social_media?.facebook && e.preventDefault()}
              >
                <Facebook className="h-6 w-6 text-gold" />
              </a>
              <a 
                href={mentorData?.social_media?.youtube || "#"} 
                target={mentorData?.social_media?.youtube ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full glass-card border border-gold/20 hover:border-gold/40 transition-all hover:scale-110 ${
                  !mentorData?.social_media?.youtube ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !mentorData?.social_media?.youtube && e.preventDefault()}
              >
                <Youtube className="h-6 w-6 text-gold" />
              </a>
            </div>
        </div>
        
        {/* Sticky Navigation - Hidden on mobile */}
        {!isMobile && (
          <div className="sticky top-0 z-50 bg-slate-800/95 backdrop-blur-sm border-b border-gold/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-2 md:px-6">
              <nav className="flex justify-center space-x-2 md:space-x-8 py-2 md:py-4 overflow-x-auto">
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
                    className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                      activeSection === item.id
                        ? 'bg-gold text-black shadow-lg font-semibold'
                        : 'text-silver hover:text-gold hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="font-medium text-xs md:text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        )}
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-4 md:py-8 space-y-6 md:space-y-12">
          
          {/* Sobre Section */}
          <section id="sobre" className="scroll-mt-24">
            <div className="glass-card p-4 md:p-10 border border-gold/20">
              {/* Minha História - Agora ocupa toda a largura */}
              {mentorData.bio && (
                <div className="mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <FileText className="h-8 w-8 text-gold" />
                  <h3 className="text-3xl font-bold text-gold">Minha História</h3>
                </div>
                  <div 
                    className="text-white leading-relaxed text-lg max-w-none rich-text-content"
                    dangerouslySetInnerHTML={{ __html: mentorData.bio }}
                  />
                </div>
              )}
              
              {/* Por que me seguir - Agora em layout horizontal */}
              <div className="mb-12">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <UserPlus className="h-8 w-8 text-gold" />
                  <h3 className="text-3xl font-bold text-gold">
                    Por que me seguir?
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 rounded-2xl border border-gold/20 shadow-lg hover:shadow-gold/20 transition-all duration-300">
                    <h4 className="font-bold text-lg mb-2 text-gold">
                      {mentorData.cx_diferenciais?.dif_title_1 || "🎯 Resultados Comprovados"}
                    </h4>
                    <p className="text-white whitespace-pre-wrap">
                      {mentorData.cx_diferenciais?.dif_description_1 || "Mais de 1.250 vidas transformadas com metodologias testadas e aprovadas."}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 rounded-2xl border border-gold/20 shadow-lg hover:shadow-gold/20 transition-all duration-300">
                    <h4 className="font-bold text-lg mb-2 text-gold">
                      {mentorData.cx_diferenciais?.dif_title_2 || "🚀 Metodologia Exclusiva"}
                    </h4>
                    <p className="text-white whitespace-pre-wrap">
                      {mentorData.cx_diferenciais?.dif_description_2 || "Sistema proprietário desenvolvido ao longo de 15 anos de experiência."}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 rounded-2xl border border-gold/20 shadow-lg hover:shadow-gold/20 transition-all duration-300">
                    <h4 className="font-bold text-lg mb-2 text-gold">
                      {mentorData.cx_diferenciais?.dif_title_3 || "💰 ROI Garantido"}
                    </h4>
                    <p className="text-white whitespace-pre-wrap">
                      {mentorData.cx_diferenciais?.dif_description_3 || "Investimento retorna em até 90 dias ou seu dinheiro de volta."}
                    </p>
                  </div>
                </div>
              </div>


            </div>
          </section>

          {/* Cursos Section */}
          <section id="cursos" className="scroll-mt-24">
            <div className="glass-card p-4 md:p-10 border border-gold/20">
              <div className="flex items-center justify-center gap-3 mb-10">
                <BookOpen className="h-8 w-8 text-gold" />
                <h2 className="text-3xl font-bold text-gold">Cursos Disponíveis</h2>
              </div>
              
                {coursesLoading ? (
                  <div className="flex justify-center">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : mentorCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
            <div className="glass-card p-4 md:p-10 border border-gold/20">
              <div className="flex items-center justify-center gap-3 mb-10">
                <MessageCircle className="h-8 w-8 text-gold" />
                <h2 className="text-3xl font-bold text-gold">O que dizem meus mentorados ...</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 rounded-2xl border border-gold/20 shadow-lg hover:shadow-gold/20 transition-all duration-300 relative">
                    <Quote className="absolute top-4 left-4 h-6 w-6 text-gold/60" />
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border-2 border-gold/30">
                        <img
                          src={(mentorData.review_comments as any)?.[`photo_${index}`] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                          alt={(mentorData.review_comments as any)?.[`name_${index}`] || 'Pessoa'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                          }}
                        />
                      </div>
                      <h4 className="font-semibold text-gold mb-1">
                        {(mentorData.review_comments as any)?.[`name_${index}`] || 'Nome da Pessoa'}
                      </h4>
                      <p className="text-sm text-silver mb-3">
                        {(mentorData.review_comments as any)?.[`profession_${index}`] || 'Profissão'}
                      </p>
                      <p className="text-white text-sm leading-relaxed italic">
                        "{(mentorData.review_comments as any)?.[`comment_${index}`] || 'Comentário do depoimento'}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Agenda Section */}
          <section id="agenda" className="scroll-mt-24">
            <div className="glass-card p-4 md:p-10 border border-gold/20">
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Agende uma Conversa
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                {/* Lado esquerdo - Configurações de Disponibilidade (visualização) */}
                <div className="md:col-span-1">
                  <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-gold/20 h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">
                      Disponibilidade
                    </h3>
                    
                    {/* Dias da Semana */}
                    <div className="space-y-4 md:space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gold mb-3">Dias Disponíveis</h4>
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
                                className={`px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium ${
                                  isAvailable
                                    ? 'bg-gold/20 text-gold border border-gold/30'
                                    : 'bg-slate-700 text-silver border border-slate-600'
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
                        <h4 className="text-sm font-medium text-gold mb-3">Horário de Atendimento</h4>
                        <div className="p-3 md:p-4 border-b border-gold/20">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gold" />
                            <span className="text-white">{mentorSettings.startTime} às {mentorSettings.endTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Duração da Sessão */}
                      <div>
                        <h4 className="text-sm font-medium text-gold mb-3">Duração das Sessões</h4>
                        <div className="p-3 md:p-4 border-b border-gold/20">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gold" />
                            <span className="text-white">{mentorSettings.sessionDuration} minutos</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Fuso Horário */}
                      <div>
                        <h4 className="text-sm font-medium text-gold mb-3">Fuso Horário</h4>
                        <div className="p-3 md:p-4 border-b border-gold/20">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gold" />
                            <span className="text-white">{mentorSettings.timezone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Valor do Agendamento */}
                      <div>
                        <h4 className="text-sm font-medium text-gold mb-3">Valor do Agendamento</h4>
                        <div className="p-3 md:p-4 border-b border-gold/20">
                          {mentorSettings.price && mentorSettings.price > 0 ? (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-gold">
                                R$ {mentorSettings.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="font-medium text-gold">
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
                    smallSquares={true}
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
            <div className="glass-card p-4 md:p-10 border border-gold/20">
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                 <Mail className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                 <h2 className="text-2xl md:text-3xl font-bold text-white">Entre em Contato</h2>
               </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Formas de Contato</h3>
                    
                    <div className="space-y-4">
                      {mentorData.phone && (
                        <div className="flex items-center space-x-4 p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg hover:bg-slate-700/50 transition-colors border border-gold/20">
                          <MessageCircle className="h-6 w-6 text-gold" />
                          <div>
                            <p className="font-medium text-white">Telefone/WhatsApp</p>
                            <p className="text-silver blur-sm select-none">{mentorData.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-silver text-left italic">
                        Em breve você poderá entrar em contato diretamente com o mentor através do WhatsApp e com seus Agentes automatizados para personalizar sua jornada de mentoria.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Envie uma Mensagem</h3>
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
                <div className="border-t border-gold/20 pt-6 mt-8">
                  <div className="grid lg:grid-cols-1 gap-4">
                    <Button 
                      onClick={handleWhatsAppClick}
                      className="w-full bg-gold hover:bg-yellow-500 text-black font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Chamar no WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Final */}
            <section className="bg-gradient-to-r from-slate-800 to-slate-900 border border-gold/20 rounded-2xl shadow-xl p-6 md:p-16 text-center text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gold">Pronto para Transformar sua Vida?</h2>
              <p className="text-lg md:text-xl mb-6 md:mb-8 text-silver">
                Junte-se aos seguidores de {mentorData.full_name?.split(' ')[0]} e comece sua jornada de transformação
              </p>
              
              <div className="space-y-4 mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row justify-center md:space-x-8 space-y-2 md:space-y-0 text-sm md:text-lg text-silver">
                  <span>✅ Garantia de 7 dias</span>
                  <span>✅ Suporte personalizado</span>
                  <span>✅ Resultados comprovados</span>
                </div>
              </div>
              
              <Button
                onClick={handleFollowToggle}
                className={`px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 ${
                  isFollowing 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gold hover:bg-yellow-500 text-black'
                }`}
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
