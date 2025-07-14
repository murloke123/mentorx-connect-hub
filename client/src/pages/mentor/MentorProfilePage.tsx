import MentorSidebar from "@/components/mentor/MentorSidebar";
import BadgesSection from "@/components/mentor/profile/BadgesSection";
import ContactForm from "@/components/mentor/profile/ContactForm";
import MentorCalendarComponent from "@/components/MentorCalendarComponent";
import MentorCalendarSettings from "@/components/MentorCalendarSettings";
import ProfileForm from "@/components/profile/ProfileForm";
import CourseCard from "@/components/shared/CourseCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import VerificationSwitch from "@/components/ui/VerificationSwitch";
import { useToast } from "@/hooks/use-toast";
import { Course, Profile } from "@/types/database";
import { supabase } from "@/utils/supabase";
import { detectUserTimezone } from "@/utils/timezones";
import { uploadImage } from "@/utils/uploadImage";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Camera, Edit, Facebook, GraduationCap, Instagram, MessageCircle, Save, Star, User, X, Youtube } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CourseWithProfile extends Course {
  mentor_name?: string;
  mentor_avatar?: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  }[];
}

interface CalendarSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  timezone: string;
}

const MentorProfilePage = () => {
  const { toast } = useToast();
  const [mentorAvatarUrl, setMentorAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarPath, setCurrentAvatarPath] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('sobre');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para edição dos hero cards
  const [isEditingHeroCards, setIsEditingHeroCards] = useState(false);
  const [heroCardsData, setHeroCardsData] = useState({
    hero_card_1: '1.250+',
    hero_card_desc_1: 'Mentorados de Sucesso',
    hero_card_2: '98%',
    hero_card_desc_2: 'Taxa de Satisfação',
    hero_card_3: '15+',
    hero_card_desc_3: 'Anos de Experiência',
    hero_card_4: 'R$ 50M+',
    hero_card_desc_4: 'Movimentados pelos Alunos'
  });
  
  // Estados para edição das redes sociais
  const [isSocialMediaModalOpen, setIsSocialMediaModalOpen] = useState(false);
  const [socialMediaData, setSocialMediaData] = useState({
    instagram: '',
    facebook: '',
    youtube: ''
  });
  
  // Estados para edição inline dos diferenciais
  const [isEditingDiferenciais, setIsEditingDiferenciais] = useState(false);
  const [diferenciaisData, setDiferenciaisData] = useState({
    dif_title_1: '🎯 Resultados Comprovados',
    dif_description_1: 'Mais de 1.250 vidas transformadas com metodologias testadas e aprovadas.',
    dif_title_2: '🚀 Metodologia Exclusiva',
    dif_description_2: 'Sistema proprietário desenvolvido ao longo de 15 anos de experiência.',
    dif_title_3: '💰 ROI Garantido',
    dif_description_3: 'Investimento retorna em até 90 dias ou seu dinheiro de volta.'
  });
  
  // Estados para o calendário
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00',
    sessionDuration: 60,
    timezone: detectUserTimezone()
  });
  const [refreshAppointments, setRefreshAppointments] = useState<number>(0);
  
  // Estados para edição das caixas
  const [editData, setEditData] = useState({
    sm_tit1: '',
    sm_desc1: '',
    sm_tit2: '',
    sm_desc2: '',
    sm_tit3: '',
    sm_desc3: ''
  });
  
  // Estados para edição dos depoimentos
  const [isEditingReviews, setIsEditingReviews] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    photo_1: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    name_1: 'Maria Silva',
    profession_1: 'Empreendedora Digital',
    comment_1: 'A mentoria transformou completamente meu negócio. Em 6 meses consegui aumentar meu faturamento em 300%!',
    photo_2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    name_2: 'João Santos',
    profession_2: 'Desenvolvedor',
    comment_2: 'Graças aos ensinamentos do mentor, consegui minha primeira promoção e dobrei meu salário.',
    photo_3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    name_3: 'Ana Costa',
    profession_3: 'Consultora Financeira',
    comment_3: 'O curso de finanças me deu todas as ferramentas que eu precisava para prosperar no mercado.'
  });
  
  // Estados para os checkboxes de verificação
  const [verifiedData, setVerifiedData] = useState({
    cards_sucesso: false,
    por_que_me_seguir: false,
    meus_cursos: false,
    elogios: false,
    calendario: false
  });

  // Fetch mentor courses
  const { data: mentorCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['mentorCourses', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
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
        .eq("mentor_id", currentUser.id)
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
    enabled: !!currentUser?.id
  });

  // Extract path from URL
  const extractPathFromUrl = (url: string | null): string | null => {
    if (!url) return null;
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1].split('?')[0];
  };

  // Fetch current user data and avatar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setCurrentUser(profile);
        setMentorAvatarUrl(profile.avatar_url);
        if (profile.avatar_url) {
          setCurrentAvatarPath(extractPathFromUrl(profile.avatar_url));
        }
        
        // Inicializar dados dos hero cards
        if (profile.hero_cards) {
          setHeroCardsData({
            hero_card_1: profile.hero_cards.hero_card_1 || '1.250+',
            hero_card_desc_1: profile.hero_cards.hero_card_desc_1 || 'Mentorados de Sucesso',
            hero_card_2: profile.hero_cards.hero_card_2 || '98%',
            hero_card_desc_2: profile.hero_cards.hero_card_desc_2 || 'Taxa de Satisfação',
            hero_card_3: profile.hero_cards.hero_card_3 || '15+',
            hero_card_desc_3: profile.hero_cards.hero_card_desc_3 || 'Anos de Experiência',
            hero_card_4: profile.hero_cards.hero_card_4 || 'R$ 50M+',
            hero_card_desc_4: profile.hero_cards.hero_card_desc_4 || 'Movimentados pelos Alunos'
          });
        }
        
        // Inicializar dados das redes sociais
        if (profile.social_media) {
          setSocialMediaData({
            instagram: profile.social_media.instagram || '',
            facebook: profile.social_media.facebook || '',
            youtube: profile.social_media.youtube || ''
          });
        }
        
        // Inicializar dados dos diferenciais
        if (profile.cx_diferenciais) {
          setDiferenciaisData({
            dif_title_1: profile.cx_diferenciais.dif_title_1 || '🎯 Resultados Comprovados',
            dif_description_1: profile.cx_diferenciais.dif_description_1 || 'Mais de 1.250 vidas transformadas com metodologias testadas e aprovadas.',
            dif_title_2: profile.cx_diferenciais.dif_title_2 || '🚀 Metodologia Exclusiva',
            dif_description_2: profile.cx_diferenciais.dif_description_2 || 'Sistema proprietário desenvolvido ao longo de 15 anos de experiência.',
            dif_title_3: profile.cx_diferenciais.dif_title_3 || '💰 ROI Garantido',
            dif_description_3: profile.cx_diferenciais.dif_description_3 || 'Investimento retorna em até 90 dias ou seu dinheiro de volta.'
          });
        }
        
        // Inicializar dados de edição das caixas
        setEditData({
          sm_tit1: profile.sm_tit1 || '',
          sm_desc1: profile.sm_desc1 || '',
          sm_tit2: profile.sm_tit2 || '',
          sm_desc2: profile.sm_desc2 || '',
          sm_tit3: profile.sm_tit3 || '',
          sm_desc3: profile.sm_desc3 || ''
        });
        
        // Inicializar dados dos depoimentos
        if (profile.review_comments) {
          setReviewsData({
            photo_1: profile.review_comments.photo_1 || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            name_1: profile.review_comments.name_1 || 'Maria Silva',
            profession_1: profile.review_comments.profession_1 || 'Empreendedora Digital',
            comment_1: profile.review_comments.comment_1 || 'A mentoria transformou completamente meu negócio. Em 6 meses consegui aumentar meu faturamento em 300%!',
            photo_2: profile.review_comments.photo_2 || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            name_2: profile.review_comments.name_2 || 'João Santos',
            profession_2: profile.review_comments.profession_2 || 'Desenvolvedor',
            comment_2: profile.review_comments.comment_2 || 'Graças aos ensinamentos do mentor, consegui minha primeira promoção e dobrei meu salário.',
            photo_3: profile.review_comments.photo_3 || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            name_3: profile.review_comments.name_3 || 'Ana Costa',
            profession_3: profile.review_comments.profession_3 || 'Consultora Financeira',
            comment_3: profile.review_comments.comment_3 || 'O curso de finanças me deu todas as ferramentas que eu precisava para prosperar no mercado.'
          });
        }
        
        // Inicializar dados de verificação
        if (profile.verified) {
          setVerifiedData({
            cards_sucesso: profile.verified.cards_sucesso || false,
            por_que_me_seguir: profile.verified.por_que_me_seguir || false,
            meus_cursos: profile.verified.meus_cursos || false,
            elogios: profile.verified.elogios || false,
            calendario: profile.verified.calendario || false
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleMentorImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      setMentorAvatarUrl(objectUrl);

      const result = await uploadImage(file, 'avatars', currentAvatarPath);
      setMentorAvatarUrl(result.url);
      setCurrentAvatarPath(result.path);

      if (currentUser?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: result.url })
          .eq("id", currentUser.id);

        if (error) throw error;

        toast({
          title: "Avatar atualizado",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
      }

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMentorAvatarUrl(currentUser?.avatar_url || null);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload da imagem",
        description: "Verifique se o bucket 'avatars' existe no Supabase.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBoxes = async () => {
    if (!currentUser?.id) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          sm_tit1: editData.sm_tit1,
          sm_desc1: editData.sm_desc1,
          sm_tit2: editData.sm_tit2,
          sm_desc2: editData.sm_desc2,
          sm_tit3: editData.sm_tit3,
          sm_desc3: editData.sm_desc3
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      // Atualizar currentUser com os novos dados
      setCurrentUser(prev => ({ ...prev, ...editData }));
      setIsEditModalOpen(false);

      toast({
        title: "Caixas atualizadas",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating boxes:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar as caixas. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHeroCards = async () => {
    if (!currentUser?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hero_cards: heroCardsData
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualizar o estado local
      setCurrentUser(prev => ({
        ...prev,
        hero_cards: heroCardsData
      }));

      toast({
        title: "Hero cards atualizados",
        description: "Seus cards foram atualizados com sucesso.",
      });
      setIsEditingHeroCards(false);
    } catch (error) {
      console.error('Erro ao salvar hero cards:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os hero cards. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSocialMedia = async () => {
    if (!currentUser?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          social_media: socialMediaData
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualizar o estado local
      setCurrentUser(prev => ({
        ...prev,
        social_media: socialMediaData
      }));

      toast({
        title: "Redes sociais atualizadas",
        description: "Seus links de redes sociais foram atualizados com sucesso.",
      });
      setIsSocialMediaModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar redes sociais:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar as redes sociais. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDiferenciais = async () => {
    if (!currentUser?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          cx_diferenciais: diferenciaisData
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualizar o estado local
      setCurrentUser(prev => ({
        ...prev,
        cx_diferenciais: diferenciaisData
      }));

      toast({
        title: "Diferenciais atualizados",
        description: "Seus diferenciais foram atualizados com sucesso.",
      });
      setIsEditingDiferenciais(false);
    } catch (error) {
      console.error('Erro ao salvar diferenciais:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os diferenciais. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReviews = async () => {
    if (!currentUser?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          review_comments: reviewsData
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualizar o estado local
      setCurrentUser(prev => ({
        ...prev,
        review_comments: reviewsData
      }));

      toast({
        title: "Depoimentos atualizados",
        description: "Seus depoimentos foram atualizados com sucesso.",
      });
      setIsEditingReviews(false);
    } catch (error) {
      console.error('Erro ao salvar depoimentos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os depoimentos. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVerified = async (dataToSave?: typeof verifiedData) => {
    if (!currentUser?.id) return;
    
    const dataForSaving = dataToSave || verifiedData;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verified: dataForSaving
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualizar o estado local
      setCurrentUser(prev => ({
        ...prev,
        verified: dataForSaving
      }));

      toast({
        title: "Status de verificação atualizado",
        description: "As configurações de verificação foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar dados de verificação:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados de verificação. Tente novamente.",
      });
    }
  };

  const handleVerifiedChange = (field: keyof typeof verifiedData, value: boolean) => {
    const newData = {
      ...verifiedData,
      [field]: value
    };
    
    setVerifiedData(newData);
    
    // Salvar automaticamente quando o checkbox for alterado
    setTimeout(() => {
      handleSaveVerified(newData);
    }, 100);
  };

  const handleSettingsChange = (newSettings: CalendarSettings) => {
    setCalendarSettings(newSettings);
  };

  // Função para forçar atualização da lista de agendamentos
  const handleAppointmentChange = () => {
    setRefreshAppointments(prev => prev + 1);
  };

  // Dados dos stats baseados nos hero cards
  const stats = [
    { value: heroCardsData.hero_card_1, label: heroCardsData.hero_card_desc_1, icon: "/icons/group.svg", key: 'hero_card_1', descKey: 'hero_card_desc_1' },
    { value: heroCardsData.hero_card_2, label: heroCardsData.hero_card_desc_2, icon: "/icons/star.svg", key: 'hero_card_2', descKey: 'hero_card_desc_2' },
    { value: heroCardsData.hero_card_3, label: heroCardsData.hero_card_desc_3, icon: "/icons/goal.svg", key: 'hero_card_3', descKey: 'hero_card_desc_3' },
    { value: heroCardsData.hero_card_4, label: heroCardsData.hero_card_desc_4, icon: "/icons/value.svg", key: 'hero_card_4', descKey: 'hero_card_desc_4' }
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

  const courses = [
    {
      title: "Finanças Master",
      price: "R$ 497",
      originalPrice: "R$ 797",
      icon: "💰",
      description: "Domine suas finanças e multiplique sua renda",
      badge: "Mais Vendido",
      badgeColor: "bg-green-500"
    },
    {
      title: "Desenvolvimento Pro",
      price: "R$ 397",
      originalPrice: "R$ 597",
      icon: "💻",
      description: "Torne-se um desenvolvedor de elite",
      badge: "Novo",
      badgeColor: "bg-blue-500"
    },
    {
      title: "Mentoria VIP",
      price: "R$ 1.997",
      originalPrice: "R$ 2.997",
      icon: "🚀",
      description: "Acompanhamento personalizado 1:1",
      badge: "Premium",
      badgeColor: "bg-purple-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 flex items-center justify-center min-h-screen">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 min-h-screen">
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
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group relative">
                    <div className="mb-2 flex justify-center">
                      <img 
                        src={stat.icon} 
                        alt={stat.label}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    {isEditingHeroCards ? (
                      <div className="space-y-2">
                        <Input
                          value={stat.value}
                          onChange={(e) => setHeroCardsData(prev => ({
                            ...prev,
                            [stat.key]: e.target.value
                          }))}
                          className="text-center text-lg font-bold h-8 p-1"
                        />
                        <Input
                          value={stat.label}
                          onChange={(e) => setHeroCardsData(prev => ({
                            ...prev,
                            [stat.descKey]: e.target.value
                          }))}
                          className="text-center text-xs h-6 p-1"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Checkbox de verificação */}
              <div className="absolute top-4 right-4">
                <VerificationSwitch
                  id="verified-cards"
                  checked={verifiedData.cards_sucesso}
                  onChange={(checked) => handleVerifiedChange('cards_sucesso', checked)}
                />
              </div>
              
              {/* Botão de edição no canto inferior direito */}
              <div className="absolute bottom-4 right-4">
                {isEditingHeroCards ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingHeroCards(false)}
                      className="bg-white/90 backdrop-blur-sm"
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveHeroCards}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isSaving}
                    >
                      {isSaving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingHeroCards(true)}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Cards
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Avatar with Animation */}
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="relative group">
              <div 
                className="w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-4 border-white shadow-xl bg-white transition-transform duration-300 hover:scale-105"
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <span className="relative flex shrink-0 overflow-hidden rounded-full w-full h-full">
                  {mentorAvatarUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={mentorAvatarUrl}
                        alt="Profile picture"
                        className="aspect-square h-full w-full object-cover"
                        key={`mentor-avatar-${Date.now()}`}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Spinner className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Avatar className="w-full h-full">
                      <AvatarFallback>
                        {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </span>
              </div>

              <label
                htmlFor="mentor-avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Camera className="h-4 w-4" />
              </label>

              <input
                id="mentor-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleMentorImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
        
        {/* Name and CTA section */}
        <div className="mt-24 max-w-7xl mx-auto text-center px-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {currentUser?.full_name || ""}
          </h1>
          {currentUser?.highlight_message && (
            <p className="text-xl text-gray-600 mb-6 max-w-4xl mx-auto">
              {currentUser.highlight_message}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <div className="flex gap-3 relative">
              <a 
                href={currentUser?.social_media?.instagram || "#"} 
                target={currentUser?.social_media?.instagram ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border ${
                  !currentUser?.social_media?.instagram ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !currentUser?.social_media?.instagram && e.preventDefault()}
              >
                <Instagram className="h-6 w-6 text-pink-600" />
              </a>
              <a 
                href={currentUser?.social_media?.facebook || "#"} 
                target={currentUser?.social_media?.facebook ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border ${
                  !currentUser?.social_media?.facebook ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !currentUser?.social_media?.facebook && e.preventDefault()}
              >
                <Facebook className="h-6 w-6 text-blue-600" />
              </a>
              <a 
                href={currentUser?.social_media?.youtube || "#"} 
                target={currentUser?.social_media?.youtube ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border ${
                  !currentUser?.social_media?.youtube ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !currentUser?.social_media?.youtube && e.preventDefault()}
              >
                <Youtube className="h-6 w-6 text-red-600" />
              </a>
              
              {/* Botão de edição das redes sociais */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSocialMediaModalOpen(true)}
                className="ml-2 bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Sticky Navigation */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex justify-center space-x-8 py-4">
              {[
                { id: 'sobre', label: 'Quem Sou Eu', icon: User },
                { id: 'cursos', label: 'Meus Cursos', icon: GraduationCap },
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
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
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
          
          {/* Sobre Mim Section */}
          <section id="sobre" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border relative">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">Por que me seguir?</h2>
                
                {/* Checkbox de verificação */}
                <VerificationSwitch
                  id="verified-seguir"
                  checked={verifiedData.por_que_me_seguir}
                  onChange={(checked) => handleVerifiedChange('por_que_me_seguir', checked)}
                />
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 mb-8">
                <div className="space-y-6">
                  <ProfileForm 
                    user={currentUser} 
                    profileData={currentUser}
                    onProfileUpdate={() => {
                      const fetchUserData = async () => {
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) return;

                          const { data: profile, error } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("id", user.id)
                            .single();

                          if (error) throw error;
                          setCurrentUser(profile);
                        } catch (error) {
                          console.error("Error fetching user data:", error);
                        }
                      };
                      fetchUserData();
                    }}
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
                      {isEditingDiferenciais ? (
                        <div className="space-y-3">
                          <Input
                            value={diferenciaisData.dif_title_1}
                            onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_title_1: e.target.value}))}
                            className="font-bold text-lg border-purple-200 focus:border-purple-400"
                            placeholder="Ex: 🎯 Resultados Comprovados"
                          />
                          <Textarea
                            value={diferenciaisData.dif_description_1}
                            onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_description_1: e.target.value}))}
                            className="text-gray-700 border-purple-200 focus:border-purple-400"
                            placeholder="Descrição dos seus resultados comprovados"
                            rows={3}
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-bold text-lg mb-2">
                            {diferenciaisData.dif_title_1}
                          </h3>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {diferenciaisData.dif_description_1}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500">
                      {isEditingDiferenciais ? (
                        <div className="space-y-3">
                          <Input
                            value={diferenciaisData.dif_title_2}
                            onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_title_2: e.target.value}))}
                            className="font-bold text-lg border-green-200 focus:border-green-400"
                            placeholder="Ex: 🚀 Metodologia Exclusiva"
                          />
                          <Textarea
                            value={diferenciaisData.dif_description_2}
                            onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_description_2: e.target.value}))}
                            className="text-gray-700 border-green-200 focus:border-green-400"
                            placeholder="Descrição da sua metodologia exclusiva"
                            rows={3}
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-bold text-lg mb-2">
                            {diferenciaisData.dif_title_2}
                          </h3>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {diferenciaisData.dif_description_2}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500">
                      {isEditingDiferenciais ? (
                        <div className="space-y-3">
                          <Input
                            value={diferenciaisData.dif_title_3}
                            onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_title_3: e.target.value}))}
                            className="font-bold text-lg border-orange-200 focus:border-orange-400"
                            placeholder="Ex: 💰 ROI Garantido"
                          />
                          <Textarea
                            value={diferenciaisData.dif_description_3}
                            onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_description_3: e.target.value}))}
                            className="text-gray-700 border-orange-200 focus:border-orange-400"
                            placeholder="Descrição do ROI ou garantia"
                            rows={3}
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-bold text-lg mb-2">
                            {diferenciaisData.dif_title_3}
                          </h3>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {diferenciaisData.dif_description_3}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-6">
                    <div className="flex justify-end gap-2">
                      {isEditingDiferenciais ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsEditingDiferenciais(false)}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleSaveDiferenciais}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            {isSaving ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Salvar
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditingDiferenciais(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
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
            <div className="bg-white rounded-2xl shadow-xl p-10 border relative">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">Meus Cursos</h2>
                
                {/* Checkbox de verificação */}
                <VerificationSwitch
                  id="verified-cursos"
                  checked={verifiedData.meus_cursos}
                  onChange={(checked) => handleVerifiedChange('meus_cursos', checked)}
                />
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
                      Você ainda não criou nenhum curso
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Comece a compartilhar seu conhecimento criando seu primeiro curso! 
                      É uma ótima maneira de impactar mais pessoas e gerar renda.
                    </p>
                    <Button className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg">
                      Criar Meu Primeiro Curso
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Depoimentos Section */}
          <section id="depoimentos" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border relative">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">O que dizem meus mentorados</h2>
                
                {/* Checkbox de verificação */}
                <VerificationSwitch
                  id="verified-elogios"
                  checked={verifiedData.elogios}
                  onChange={(checked) => handleVerifiedChange('elogios', checked)}
                />
              </div>
              
              {/* Botão de edição no canto inferior direito */}
              <div className="absolute bottom-4 right-4">
                {isEditingReviews ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingReviews(false)}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveReviews}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isSaving}
                    >
                      {isSaving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingReviews(true)}
                    className="hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border">
                    {isEditingReviews ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">URL da Foto</label>
                          <Input
                            value={reviewsData[`photo_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`photo_${index}`]: e.target.value
                            }))}
                            placeholder="https://exemplo.com/foto.jpg"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Nome</label>
                          <Input
                            value={reviewsData[`name_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`name_${index}`]: e.target.value
                            }))}
                            placeholder="Nome da pessoa"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Profissão</label>
                          <Input
                            value={reviewsData[`profession_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`profession_${index}`]: e.target.value
                            }))}
                            placeholder="Profissão da pessoa"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Comentário</label>
                          <Textarea
                            value={reviewsData[`comment_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`comment_${index}`]: e.target.value
                            }))}
                            placeholder="Comentário do depoimento"
                            className="text-sm min-h-[100px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden">
                          <img
                            src={reviewsData[`photo_${index}` as keyof typeof reviewsData]}
                            alt={reviewsData[`name_${index}` as keyof typeof reviewsData]}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                            }}
                          />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {reviewsData[`name_${index}` as keyof typeof reviewsData]}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {reviewsData[`profession_${index}` as keyof typeof reviewsData]}
                        </p>
                        <p className="text-gray-700 text-sm leading-relaxed italic">
                          "{reviewsData[`comment_${index}` as keyof typeof reviewsData]}"
                        </p>
                        <div className="flex justify-center mt-3">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className="text-yellow-400 text-lg">⭐</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Agenda Section */}
          <section id="agenda" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border relative">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">Agenda uma Conversa</h2>
                
                {/* Checkbox de verificação */}
                <VerificationSwitch
                  id="verified-calendario"
                  checked={verifiedData.calendario}
                  onChange={(checked) => handleVerifiedChange('calendario', checked)}
                />
              </div>
              
              {/* Layout com dois componentes lado a lado */}
              <div className="grid lg:grid-cols-2 gap-12 mb-8">
                {/* Lado esquerdo - Configurações */}
                <div className="relative">
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                    MentorCalendarSettings
                  </div>
                  <MentorCalendarSettings 
                    onSettingsChange={handleSettingsChange}
                  />
                </div>
                
                {/* Lado direito - Calendário */}
                <div className="relative">
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                    MentorCalendarComponent
                  </div>
                  <MentorCalendarComponent 
                    settings={calendarSettings}
                    mentorId={currentUser?.id}
                    mentorName={currentUser?.full_name || 'Mentor'}
                    isClickable={true}
                    onAppointmentChange={handleAppointmentChange}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contato Section */}
          <section id="contato" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-10 border">
              <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Entre em Contato</h2>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Formas de Contato</h3>
                  
                  <div className="space-y-4">
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2">
                      <span>💬</span>
                      Chamar no WhatsApp
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Envie uma Mensagem</h3>
                  <ContactForm />
                </div>
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-16 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Pronto para Transformar sua Vida?</h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a mais de 1.250 pessoas que já transformaram suas vidas e negócios
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-center space-x-8 text-lg">
                <span>✅ Garantia de 30 dias</span>
                <span>✅ Suporte personalizado</span>
                <span>✅ Resultados comprovados</span>
              </div>
            </div>
            
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              Transformar Minha Vida Agora
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
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </div>

      {/* Modal de edição das redes sociais */}
      {isSocialMediaModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Redes Sociais</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/seu_usuario"
                  value={socialMediaData.instagram}
                  onChange={(e) => setSocialMediaData(prev => ({ ...prev, instagram: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <Input
                  type="url"
                  placeholder="https://facebook.com/seu_usuario"
                  value={socialMediaData.facebook}
                  onChange={(e) => setSocialMediaData(prev => ({ ...prev, facebook: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">YouTube</label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/@seu_canal"
                  value={socialMediaData.youtube}
                  onChange={(e) => setSocialMediaData(prev => ({ ...prev, youtube: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsSocialMediaModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveSocialMedia}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfilePage;
