import TagHero from "@/components/magicui/taghero";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import BadgesSection from "@/components/mentor/profile/BadgesSection";
import ContactForm from "@/components/mentor/profile/ContactForm";
import { PublishAccountModal } from "@/components/mentor/PublishAccountModal";
import { UnpublishAccountModal } from "@/components/mentor/UnpublishAccountModal";
import MentorCalendarComponent from "@/components/MentorCalendarComponent";
import MentorCalendarSettings from "@/components/MentorCalendarSettings";
import ProfileForm from "@/components/profile/ProfileForm";
import CourseCard from "@/components/shared/CourseCard";
import LoadingComponent from "@/components/shared/LoadingComponent";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import VerificationSwitch from "@/components/ui/VerificationSwitch";
import { useToast } from "@/hooks/use-toast";
import { Course, Profile } from "@/types/database";
import { supabase } from "@/utils/supabase";
import { detectUserTimezone } from "@/utils/timezones";
import { uploadImage } from "@/utils/uploadImage";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Calendar, CalendarDays, Camera, Check, Edit, Facebook, GraduationCap, Instagram, Mail, Menu, MessageCircle, Quote, Save, Star, User, UserPlus, X, Youtube } from "lucide-react";
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
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('sobre');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  const [isPublicAccount, setIsPublicAccount] = useState(false);
  const [isUnpublishedProfileAlertOpen, setIsUnpublishedProfileAlertOpen] = useState(false);
  const [hasShownUnpublishedAlert, setHasShownUnpublishedAlert] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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
    meu_perfil: false,
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
          mentor_id,
          category_id,
          is_public, 
          is_paid, 
          price, 
          discount,
          discounted_price,
          image_url, 
          is_published,
          stripe_product_id,
          stripe_price_id,
          created_at, 
          updated_at,
          category,
          landing_page_id
        `)
        .eq("mentor_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching mentor courses:", error);
        return [];
      }
      
      // Format the data to include mentor information from currentUser (no need to fetch from DB)
      const formattedCourses = data?.map((course) => ({
        ...course,
        mentor_info: {
          full_name: currentUser.full_name || 'Mentor',
          avatar_url: currentUser.avatar_url || null
        }
      })) || [];
      
      return formattedCourses;
    },
    enabled: !!currentUser?.id
  });

  // Função para lidar com o clique no botão WhatsApp
  const handleWhatsAppClick = () => {
    if (!currentUser?.phone) {
      toast({
        variant: "destructive",
        title: "Número não disponível",
        description: "Este mentor não possui número de telefone preenchido na plataforma."
      });
      return;
    }

    // Obter código do país (sem o +) e número de telefone limpo
    const countryCode = (currentUser as any).country ? (currentUser as any).country.replace('+', '') : '55';
    const cleanPhone = currentUser.phone.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    
    // Combinar código do país com o número de telefone
    const fullPhoneNumber = `${countryCode}${cleanPhone}`;
    
    // Mensagem pré-carregada
    const message = encodeURIComponent("Olá, vim através da plataforma Mentora Ai e preciso falar com você.");
    
    // Abrir WhatsApp Web em nova guia com mensagem pré-carregada
    const whatsappUrl = `https://wa.me/${fullPhoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Extract path from URL
  const extractPathFromUrl = (url: string | null): string | null => {
    if (!url) return null;
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1].split('?')[0];
  };

  // Função para buscar dados do usuário
  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setAuthUser(user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setCurrentUser(profile);
      setMentorAvatarUrl(profile.avatar_url);
      setIsPublicAccount(profile.is_public || false);
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
          meu_perfil: profile.verified.meu_perfil || false,
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

  // Fetch current user data and avatar
  useEffect(() => {
    fetchUserData();
  }, []);

  // Verificar se o perfil está publicado e mostrar modal de alerta (apenas uma vez por sessão)
  useEffect(() => {
    if (currentUser && !isLoading && !hasShownUnpublishedAlert) {
      if (!currentUser.is_public) {
        setIsUnpublishedProfileAlertOpen(true);
        setHasShownUnpublishedAlert(true);
      }
    }
  }, [currentUser, isLoading, hasShownUnpublishedAlert]);

  const handleMentorImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      setMentorAvatarUrl(objectUrl);

      const result = await uploadImage(file, 'avatars', currentAvatarPath || undefined);
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
      setCurrentUser(prev => prev ? { ...prev, ...editData } : null);
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
      setCurrentUser(prev => prev ? {
        ...prev,
        hero_cards: heroCardsData
      } : null);

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
      setCurrentUser(prev => prev ? {
        ...prev,
        social_media: socialMediaData
      } : null);

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
      setCurrentUser(prev => prev ? {
        ...prev,
        cx_diferenciais: diferenciaisData
      } : null);

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
      setCurrentUser(prev => prev ? {
        ...prev,
        review_comments: reviewsData
      } : null);

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
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          verified: {
            cards_sucesso_verificado: dataForSaving.cards_sucesso,
            por_que_me_seguir_verificado: dataForSaving.por_que_me_seguir,
            meus_cursos_verificado: dataForSaving.meus_cursos,
            elogios_verificado: dataForSaving.elogios,
            calendario_verificado: dataForSaving.calendario
          }
        };
      });

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

  const handleVerifiedChange = async (field: keyof typeof verifiedData, value: boolean) => {
    const newData = {
      ...verifiedData,
      [field]: value
    };
    
    setVerifiedData(newData);
    
    // Se qualquer checkbox for desmarcado (value = false), forçar is_public para false
    if (!value && isPublicAccount) {
      try {
        // Atualizar is_public para false no banco de dados
        const { error } = await supabase
          .from('profiles')
          .update({ is_public: false })
          .eq('id', currentUser?.id);

        if (error) {
          console.error('Erro ao atualizar is_public:', error);
          toast({
            variant: "destructive",
            title: "Erro ao despublicar",
            description: "Ocorreu um erro ao despublicar sua conta. Tente novamente.",
          });
        } else {
          setIsPublicAccount(false);
          toast({
            title: "Conta despublicada automaticamente",
            description: "Sua conta foi despublicada porque uma seção foi desmarcada como verificada.",
          });
        }
      } catch (error) {
        console.error('Erro inesperado ao atualizar is_public:', error);
        toast({
          variant: "destructive",
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    }
    
    // Salvar automaticamente quando o checkbox for alterado
    setTimeout(() => {
      handleSaveVerified(newData);
    }, 100);
  };

  // Função para atualizar os dados do usuário após publicação bem-sucedida
  const handlePublishSuccess = async () => {
    // Recarregar os dados do usuário
    await fetchUserData();
    setIsPublicAccount(true);
    toast({
      title: "Conta publicada",
      description: "Sua conta agora está visível para o público.",
    });
  };

  // Função para atualizar os dados do usuário após despublicação bem-sucedida
  const handleUnpublishSuccess = async () => {
    // Recarregar os dados do usuário
    await fetchUserData();
    setIsPublicAccount(false);
    toast({
      title: "Conta despublicada",
      description: "Sua conta não está mais visível para o público.",
    });
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
    { value: heroCardsData.hero_card_1, label: heroCardsData.hero_card_desc_1, icon: "/icons/pessoas.png", key: 'hero_card_1', descKey: 'hero_card_desc_1' },
    { value: heroCardsData.hero_card_2, label: heroCardsData.hero_card_desc_2, icon: "/icons/review.png", key: 'hero_card_2', descKey: 'hero_card_desc_2' },
    { value: heroCardsData.hero_card_3, label: heroCardsData.hero_card_desc_3, icon: "/icons/montanha.png", key: 'hero_card_3', descKey: 'hero_card_desc_3' },
    { value: heroCardsData.hero_card_4, label: heroCardsData.hero_card_desc_4, icon: "/icons/money.png", key: 'hero_card_4', descKey: 'hero_card_desc_4' }
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
        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <MentorSidebar />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <MentorSidebar />
        </div>

        <div className="flex-1 transition-all duration-300">
          <LoadingComponent message="Carregando Dados" />
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
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <MentorSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <MentorSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 min-h-screen bg-black relative">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
        
        {/* Hero Section */}
        <div className="relative w-full">
          {/* Banner without gradient overlay */}
          <div className="w-full h-[350px] overflow-hidden relative">
            <video 
              src="https://cdn.pixabay.com/video/2019/10/09/27669-365224683_large.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Floating Stats with 20% transparency */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-2 md:px-4">
                {stats.map((stat, index) => (
                  <div key={index} className="premium-card group hover:scale-105 transform transition-all duration-500 bg-card/80 backdrop-blur-sm relative p-2 md:p-4 text-center">
                    <div className="mb-2 flex justify-center">
                      <img 
                        src={stat.icon} 
                        alt={stat.label}
                        className="w-10 h-10 object-contain filter brightness-0 saturate-100"
                        style={{filter: 'brightness(0) saturate(100%) invert(77%) sepia(85%) saturate(2476%) hue-rotate(2deg) brightness(104%) contrast(101%)'}}
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
                        <div className="text-2xl font-semibold text-gold drop-shadow-lg">{stat.value}</div>
                        <div className="text-sm text-silver">{stat.label}</div>
                      </>
                    )}
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
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
                      className="premium-card bg-card/80 backdrop-blur-sm hover:scale-105 transform transition-all duration-500 border-gold/20 text-gold hover:text-gold hover:border-gold/40 h-8 px-3 py-1"
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveHeroCards}
                      className="premium-card bg-card/80 backdrop-blur-sm hover:scale-105 transform transition-all duration-500 border-gold/20 text-gold hover:text-gold hover:border-gold/40 h-8 px-3 py-1"
                      disabled={isSaving}
                    >
                      {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingHeroCards(true)}
                    className="premium-card bg-card/80 backdrop-blur-sm hover:scale-105 transform transition-all duration-500 border-gold/20 text-gold hover:text-gold hover:border-gold/40 flex items-center gap-2 h-8 px-3 py-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Cards de Sucesso
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
                      <AvatarFallback className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white flex items-center justify-center">
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </span>
              </div>

              <label
                htmlFor="mentor-avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Camera className="h-4 w-4 text-black" />
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
        <div className="mt-24 max-w-7xl mx-auto text-center px-4 md:px-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent mb-2">
            {currentUser?.full_name || ""}
          </h1>
          
          {/* TagHero Component - Positioned below mentor name */}
          <div className="flex justify-center mb-6">
            <TagHero 
              isPublicAccount={isPublicAccount}
              onClick={() => isPublicAccount ? setIsUnpublishModalOpen(true) : setIsPublishModalOpen(true)} 
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <div className="flex gap-3 relative">
              <a 
                href={currentUser?.social_media?.instagram || "#"} 
                target={currentUser?.social_media?.instagram ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full glass-card hover:shadow-xl transition-all hover:scale-110 ${
                  !currentUser?.social_media?.instagram ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !currentUser?.social_media?.instagram && e.preventDefault()}
              >
                <Instagram className="h-6 w-6 text-gold" />
              </a>
              <a 
                href={currentUser?.social_media?.facebook || "#"} 
                target={currentUser?.social_media?.facebook ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full glass-card hover:shadow-xl transition-all hover:scale-110 ${
                  !currentUser?.social_media?.facebook ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !currentUser?.social_media?.facebook && e.preventDefault()}
              >
                <Facebook className="h-6 w-6 text-gold" />
              </a>
              <a 
                href={currentUser?.social_media?.youtube || "#"} 
                target={currentUser?.social_media?.youtube ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`p-3 rounded-full glass-card hover:shadow-xl transition-all hover:scale-110 ${
                  !currentUser?.social_media?.youtube ? 'opacity-50 cursor-default' : ''
                }`}
                onClick={(e) => !currentUser?.social_media?.youtube && e.preventDefault()}
              >
                <Youtube className="h-6 w-6 text-gold" />
              </a>
              
              {/* Botão de edição das redes sociais */}
              <button
                onClick={() => setIsSocialMediaModalOpen(true)}
                className="p-3 rounded-full glass-card hover:shadow-xl transition-all hover:scale-110 ml-2 flex items-center justify-center"
                title="Editar redes sociais"
              >
                <Edit className="h-6 w-6 text-gold" />
              </button>
            </div>
          </div>

          {/* Alerta de instruções com botão CTA ou botão de despublicar */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {!isPublicAccount ? (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 max-w-2xl mx-auto shadow-md">
                <div className="flex-1">
                  <p className="text-black font-medium leading-relaxed text-center mb-4">
                    <span className="font-bold text-yellow-800">Atenção:</span> Sua conta só poderá ser publicada depois que você ajustar as informações das sessões colocando seus dados reais e marcar como verificado.
                  </p>
                  
                  {/* Botão CTA dentro do alerta */}
                  <div className="flex justify-center">
                    <Button 
                      className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      size="sm"
                      onClick={() => setIsPublishModalOpen(true)}
                    >
                      <Check className="h-4 w-4 mr-2 text-green-400" />
                      Publicar minha conta
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button 
                  className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  size="sm"
                  onClick={() => setIsUnpublishModalOpen(true)}
                >
                  <X className="h-4 w-4 mr-2 text-red-400" />
                  Despublicar minha conta
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Sticky Navigation - Hidden on mobile */}
        <div className="hidden md:block sticky top-0 z-50 glass-card border-t border-b border-gold/20 shadow-sm !rounded-none">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex justify-center space-x-8 py-2">
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
                    className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] font-semibold'
                        : 'text-silver hover:text-gold hover:drop-shadow-[0_0_4px_rgba(255,215,0,0.4)]'
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12">
          
          {/* Sobre Mim Section */}
          <section id="sobre" className="scroll-mt-24">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm p-2 md:p-10 relative rounded-xl">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-10">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                  <User className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                  <h2 className="text-xl md:text-3xl font-bold text-gold">Meu Perfil</h2>
                </div>
                
                {/* Checkbox de verificação */}
                <div className="self-start md:self-auto">
                  <VerificationSwitch
                    id="verified-perfil"
                    checked={verifiedData.meu_perfil}
                    onChange={(checked) => handleVerifiedChange('meu_perfil', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-8 mb-8">
                {/* ProfileForm expandido para largura total */}
                <div className="w-full">
                  <ProfileForm 
                    user={authUser}
                    profileData={currentUser}
                    onProfileUpdate={fetchUserData}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Nova Seção: Por que me seguir? (Cópia) */}
          <section className="scroll-mt-24">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm p-2 md:p-10 relative rounded-xl">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-10">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                  <UserPlus className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                  <h2 className="text-xl md:text-3xl font-bold text-gold">Por que me seguir?</h2>
                </div>
                
                {/* Checkbox de verificação */}
                <div className="self-start md:self-auto">
                  <VerificationSwitch
                    id="verified-seguir-copy"
                    checked={verifiedData.por_que_me_seguir}
                    onChange={(checked) => handleVerifiedChange('por_que_me_seguir', checked)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                  {isEditingDiferenciais ? (
                    <div className="space-y-3">
                      <Input
                        value={diferenciaisData.dif_title_1}
                        onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_title_1: e.target.value}))}
                        className="font-bold text-lg bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Ex: 🎯 Resultados Comprovados"
                      />
                      <Textarea
                        value={diferenciaisData.dif_description_1}
                        onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_description_1: e.target.value}))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Descrição dos seus resultados comprovados"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gold">
                        {diferenciaisData.dif_title_1}
                      </h3>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {diferenciaisData.dif_description_1}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                  {isEditingDiferenciais ? (
                    <div className="space-y-3">
                      <Input
                        value={diferenciaisData.dif_title_2}
                        onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_title_2: e.target.value}))}
                        className="font-bold text-lg bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Ex: 🚀 Metodologia Exclusiva"
                      />
                      <Textarea
                        value={diferenciaisData.dif_description_2}
                        onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_description_2: e.target.value}))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Descrição da sua metodologia exclusiva"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gold">
                        {diferenciaisData.dif_title_2}
                      </h3>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {diferenciaisData.dif_description_2}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                  {isEditingDiferenciais ? (
                    <div className="space-y-3">
                      <Input
                        value={diferenciaisData.dif_title_3}
                        onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_title_3: e.target.value}))}
                        className="font-bold text-lg bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Ex: 💰 ROI Garantido"
                      />
                      <Textarea
                        value={diferenciaisData.dif_description_3}
                        onChange={(e) => setDiferenciaisData(prev => ({...prev, dif_description_3: e.target.value}))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Descrição do ROI ou garantia"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gold">
                        {diferenciaisData.dif_title_3}
                      </h3>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {diferenciaisData.dif_description_3}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4 mt-6">
                <div className="flex justify-end gap-2">
                  {isEditingDiferenciais ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingDiferenciais(false)}
                        disabled={isSaving}
                        className="flex items-center gap-2 border-slate-600 text-gray-300 hover:bg-slate-700"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveDiferenciais}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-gold hover:bg-gold-light text-slate-900"
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
                      className="flex items-center gap-2 border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Diferenciais
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Nova Seção: Brasões do Mentor (Cópia) */}
          <section className="scroll-mt-24">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm p-2 md:p-10 relative rounded-xl">
              <BadgesSection />
            </div>
          </section>

          {/* Cursos Section */}
          <section id="cursos" className="scroll-mt-24">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm p-2 md:p-10 border border-gold/20 relative rounded-xl">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-10">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                  <h2 className="text-xl md:text-3xl font-bold text-gold">Meus Cursos</h2>
                </div>
                
                {/* Checkbox de verificação */}
                <div className="self-start md:self-auto">
                  <VerificationSwitch
                    id="verified-cursos"
                    checked={verifiedData.meus_cursos}
                    onChange={(checked) => handleVerifiedChange('meus_cursos', checked)}
                  />
                </div>
              </div>
              
              {coursesLoading ? (
                <div className="flex justify-center">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : mentorCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentorCourses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-12 text-center border-2 border-dashed">
                  <div className="max-w-md mx-auto">
                    <img 
                      src="https://static.vecteezy.com/ti/vetor-gratis/p1/11535870-nenhum-salvo-conceito-ilustracao-design-plano-vector-eps10-elemento-grafico-moderno-para-pagina-de-destino-ui-de-estado-vazio-infografico-icone-vetor.jpg"
                      alt="Nenhum curso disponível"
                      className="w-32 h-32 mx-auto mb-6 opacity-60"
                    />
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">
                      Você ainda não criou nenhum curso
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-6">
                      Comece a compartilhar seu conhecimento criando seu primeiro curso! 
                      É uma ótima maneira de impactar mais pessoas e gerar renda.
                    </p>
                    <Button className="bg-gold hover:bg-gold-light text-slate-900 font-bold py-3 px-6 rounded-lg">
                      Criar Meu Primeiro Curso
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Depoimentos Section */}
          <section id="depoimentos" className="scroll-mt-24">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm p-2 md:p-10 border border-gold/20 relative rounded-xl">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-10">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                  <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                  <h2 className="text-xl md:text-3xl font-bold text-gold">O que dizem meus mentorados ...</h2>
                </div>
                
                {/* Checkbox de verificação */}
                <div className="self-start md:self-auto">
                  <VerificationSwitch
                    id="verified-elogios"
                    checked={verifiedData.elogios}
                    onChange={(checked) => handleVerifiedChange('elogios', checked)}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 shadow-sm backdrop-blur-sm">
                    {isEditingReviews ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">URL da Foto</label>
                          <Input
                            value={reviewsData[`photo_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`photo_${index}`]: e.target.value
                            }))}
                            placeholder="https://exemplo.com/foto.jpg"
                            className="text-sm bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Nome</label>
                          <Input
                            value={reviewsData[`name_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`name_${index}`]: e.target.value
                            }))}
                            placeholder="Nome da pessoa"
                            className="text-sm bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Profissão</label>
                          <Input
                            value={reviewsData[`profession_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`profession_${index}`]: e.target.value
                            }))}
                            placeholder="Profissão da pessoa"
                            className="text-sm bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Comentário</label>
                          <Textarea
                            value={reviewsData[`comment_${index}` as keyof typeof reviewsData]}
                            onChange={(e) => setReviewsData(prev => ({
                              ...prev,
                              [`comment_${index}`]: e.target.value
                            }))}
                            placeholder="Comentário do depoimento"
                            className="text-sm min-h-[100px] bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center relative">
                        <Quote className="absolute top-2 left-2 h-6 w-6 text-gold" />
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
                        <h4 className="font-semibold text-gold mb-1">
                          {reviewsData[`name_${index}` as keyof typeof reviewsData]}
                        </h4>
                        <p className="text-sm text-gray-400 mb-3">
                          {reviewsData[`profession_${index}` as keyof typeof reviewsData]}
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                          "{reviewsData[`comment_${index}` as keyof typeof reviewsData]}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Rodapé da seção de depoimentos */}
              <div className="mt-8 pt-6 border-t border-slate-600 flex justify-end">
                {isEditingReviews ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingReviews(false)}
                      disabled={isSaving}
                      className="border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveReviews}
                      className="bg-gold hover:bg-gold-light text-slate-900"
                      disabled={isSaving}
                    >
                      {isSaving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingReviews(true)}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen h-4 w-4">
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                    </svg>
                    Editar Depoimentos
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Agenda Section */}
          <section id="agenda" className="scroll-mt-24">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm p-2 md:p-10 border border-gold/20 relative rounded-xl">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-10">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                  <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                  <h2 className="text-xl md:text-3xl font-bold text-gold">Agenda uma Conversa</h2>
                </div>
                
                {/* Checkbox de verificação */}
                <div className="self-start md:self-auto">
                  <VerificationSwitch
                    id="verified-calendario"
                    checked={verifiedData.calendario}
                    onChange={(checked) => handleVerifiedChange('calendario', checked)}
                  />
                </div>
              </div>
              
              {/* Layout com dois componentes lado a lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-12 mb-8">
                {/* Lado esquerdo - Configurações */}
                <div className="relative">

                  <MentorCalendarSettings 
                    onSettingsChange={handleSettingsChange}
                  />
                </div>
                
                {/* Lado direito - Calendário */}
                <div className="relative">

                  <MentorCalendarComponent 
                    settings={calendarSettings}
                    mentorId={currentUser?.id}
                    mentorName={currentUser?.full_name || 'Mentor'}
                    isClickable={true}
                    smallSquaresProfile={true}
                    onAppointmentChange={handleAppointmentChange}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contato Section */}
          <section id="contato" className="scroll-mt-24">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm p-2 md:p-10 border border-gold/20 relative rounded-xl">
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                 <Mail className="h-6 w-6 md:h-8 md:w-8 text-gold" />
                 <h2 className="text-xl md:text-3xl font-bold text-gold">Entre em Contato</h2>
               </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-12 mb-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gold">Formas de Contato</h3>
                    
                    <div className="space-y-4">
                      {currentUser?.phone && (
                        <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600">
                          <MessageCircle className="h-6 w-6 text-gold" />
                          <div>
                            <p className="font-medium text-gray-300">Telefone/WhatsApp</p>
                            <p className="text-gray-400 blur-sm select-none">{currentUser.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-400 text-left italic">
                        Em breve você poderá entrar em contato diretamente com o mentor através do WhatsApp e com seus Agentes automatizados para personalizar sua jornada de mentoria.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gold">Envie uma Mensagem</h3>
                    <ContactForm 
                      mentorName={currentUser?.full_name || ''}
                      mentorEmail={currentUser?.email || ''}
                      onSubmitSuccess={() => {
                        console.log('Mensagem enviada com sucesso!');
                      }}
                    />
                  </div>
                </div>
                
                {/* Rodapé com os botões */}
                <div className="border-t pt-6 mt-8">
                  <div className="grid lg:grid-cols-1 gap-4">
                    <Button 
                      onClick={handleWhatsAppClick}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Chamar no WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
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
          <div className="glass-card p-6 w-full max-w-md mx-4 border border-gold/20">
            <h3 className="text-lg font-semibold mb-4 text-white">Editar Redes Sociais</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-silver">Instagram</label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/seu_usuario"
                  value={socialMediaData.instagram}
                  onChange={(e) => setSocialMediaData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="bg-gray-800/50 border-gold/20 text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-silver">Facebook</label>
                <Input
                  type="url"
                  placeholder="https://facebook.com/seu_usuario"
                  value={socialMediaData.facebook}
                  onChange={(e) => setSocialMediaData(prev => ({ ...prev, facebook: e.target.value }))}
                  className="bg-gray-800/50 border-gold/20 text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-silver">YouTube</label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/@seu_canal"
                  value={socialMediaData.youtube}
                  onChange={(e) => setSocialMediaData(prev => ({ ...prev, youtube: e.target.value }))}
                  className="bg-gray-800/50 border-gold/20 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsSocialMediaModalOpen(false)}
                className="flex-1 border-gold/20 text-silver hover:bg-gray-800/50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveSocialMedia}
                className="flex-1 bg-gold hover:bg-yellow-500 text-black"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de publicação da conta */}
      <PublishAccountModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublishSuccess={handlePublishSuccess}
      />

      {/* Modal de despublicar conta */}
      <UnpublishAccountModal 
        isOpen={isUnpublishModalOpen}
        onClose={() => setIsUnpublishModalOpen(false)}
        onUnpublishSuccess={handleUnpublishSuccess}
      />

      {/* Modal de alerta para perfil não publicado */}
      <AlertDialog open={isUnpublishedProfileAlertOpen} onOpenChange={setIsUnpublishedProfileAlertOpen}>
        <AlertDialogContent className="glass-card border-gold/20">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <AlertDialogTitle className="text-gold">
                Atenção: Perfil não publicado ...
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-silver text-left">
              Seu perfil não está publicado, isso significa que outros usuários da plataforma não poderão visualizá-lo.
              <br /><br />
              Insira uma foto sua, revise as informações do seu perfil e verifique se estão corretas. Confira também as seções: "Cards de Sucesso", "Meu Perfil", "Por que me seguir", "Meus Cursos", "O que dizem meus mentorados" e "Agende uma Conversa".
              <br /><br />
              Após isso, tente publicar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setIsUnpublishedProfileAlertOpen(false)}
              className="bg-gold hover:bg-yellow-500 text-black"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MentorProfilePage;
