import {
    Award,
    BookOpen,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    FileIcon,
    FileText,
    MessageCircle,
    Play,
    Star,
    User,
    X,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import ModuleItem from '../components/ModuleItem';
import { toast } from '../hooks/use-toast';
import { CursoItemLocal, getCursoCompleto } from '../services/coursePlayerService';
import { createFreeEnrollment, redirectAfterEnrollment } from '../services/courseService';
import { startCourseCheckout } from '../services/stripeCheckoutService';
import '../styles/landing-page.css';
import { triggerEnrollmentConfetti } from '../utils/confetti';
import { supabase } from '../utils/supabase';

// Função para converter URLs do YouTube para embed
const getYouTubeEmbedUrl = (url: string): string | null => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    const params = new URLSearchParams({
      'modestbranding': '1',
      'rel': '0',
      'showinfo': '0',
      'controls': '1',
      'disablekb': '1',
      'fs': '0',
      'iv_load_policy': '3',
      'cc_load_policy': '0',
      'playsinline': '1'
    });
    return `https://www.youtube.com/embed/${match[1]}?${params.toString()}`;
  }
  return null;
};

// Função para converter URLs do Vimeo para embed
const getVimeoEmbedUrl = (url: string): string | null => {
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
  const match = url.match(vimeoRegex);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
  }
  return null;
};

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  is_paid: boolean;
  image_url: string;
  mentor_id: string;
  created_at: string;
  discount?: number | null;
  discounted_price?: number | null;
}

interface LandingPageData {
  headline: string;
  subheadline: string;
  key_benefits: string[];
  social_proof: string;
  social_rating?: string;
  avatar_urls?: string[];
  guarantee: string;
  bonus_offer: string;
  urgency_message: string;
  comment?: string;
  course_features?: {
    content_complete: { title: string; subtitle: string };
    lifetime_access: { title: string; subtitle: string };
    certificate: { title: string; subtitle: string };
  };
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface MentorProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  highlight_message?: string;
}

const CoursePublicView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [realCourseData, setRealCourseData] = useState<CursoItemLocal | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [mentorData, setMentorData] = useState<MentorProfile | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingEnrollment, setProcessingEnrollment] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [firstContent, setFirstContent] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasAccessedFreeCourse, setHasAccessedFreeCourse] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [leadError, setLeadError] = useState('');
  const [landingData, setLandingData] = useState<LandingPageData>({
    headline: "Domine as Habilidades que Vão Transformar Sua Carreira",
    subheadline: "Um curso prático e direto ao ponto para você alcançar resultados reais em tempo recorde",
    key_benefits: [
      "Metodologia testada e aprovada",
      "Suporte direto com o mentor",
      "Acesso vitalício ao conteúdo",
      "Certificado de conclusão"
    ],
    social_proof: "Mais de 1.000 alunos já transformaram suas carreiras",
    guarantee: "Garantia incondicional de 7 dias",
    bonus_offer: "Bônus exclusivo: Kit de ferramentas profissionais",
    urgency_message: "Contato direto com o mentor"
  });

  useEffect(() => {
    // Garantir que a página carregue no topo
    window.scrollTo(0, 0);
    
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        // Carregar apenas dados essenciais primeiro para mostrar a página rapidamente
        const [userResult, courseResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('cursos').select('*').eq('id', courseId).single()
        ]);

        const { data: { user } } = userResult;
        const { data: course, error: courseError } = courseResult;

        if (courseError) throw courseError;
        setCourseData(course);

        // Carregar dados básicos do usuário se logado
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setCurrentUser(profile);
          
          // Verificar matrícula em background (não bloqueia o loading)
          supabase.from('matriculas')
            .select('*')
            .eq('course_id', courseId)
            .eq('student_id', user.id)
            .eq('status', 'active')
            .single()
            .then(({ data: enrollment, error: enrollmentError }) => {
              setIsEnrolled(!!enrollment && !enrollmentError);
            });
        }

        // Carregar dados da landing page (essencial para exibição)
        const { data: landingPage } = await supabase
          .from('course_landing_pages')
          .select('layout_body')
          .eq('course_id', courseId)
          .single();

        if (landingPage?.layout_body) {
          setLandingData(prev => ({ ...prev, ...landingPage.layout_body }));
        }

        // Finalizar loading aqui para mostrar a página rapidamente
        setIsLoading(false);

        // Carregar dados secundários em background
        Promise.all([
          // Dados do mentor
          course.mentor_id ? 
            supabase.from('profiles')
              .select('id, full_name, avatar_url, bio, highlight_message')
              .eq('id', course.mentor_id)
              .single() : 
            Promise.resolve({ data: null, error: null }),
          // Dados completos do curso
          getCursoCompleto(courseId)
        ]).then(([mentorResult, realCourse]) => {
          // Processar dados do mentor
          const { data: mentor, error: mentorError } = mentorResult;
          if (!mentorError && mentor) {
            setMentorData(mentor);
          }

          // Processar dados do curso
          setRealCourseData(realCourse);

          // Buscar o primeiro conteúdo para preview
          if (realCourse?.modulos?.[0]?.conteudos?.[0]) {
            setFirstContent(realCourse.modulos[0].conteudos[0]);
          }
        }).catch(error => {
          console.error('Erro ao carregar dados secundários:', error);
        });

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do curso",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const handlePurchase = async () => {
    if (!currentUser) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comprar este curso",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!courseId) {
      toast({
        title: "Erro",
        description: "ID do curso não encontrado",
        variant: "destructive"
      });
      return;
    }

    setProcessingPayment(true);
    try {
      const result = await startCourseCheckout(courseId, currentUser.id);
      
      if (!result.sessionUrl) {
        throw new Error('URL da sessão não retornada');
      }
      
      window.open(result.sessionUrl, '_blank');
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao processar pagamento',
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const saveLead = async (leadInfo: { name: string; email: string; phone: string }) => {
    if (!courseData || !mentorData) return;

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          course_id: courseData.id,
          course_name: courseData.title,
          mentor_name: mentorData.full_name || 'Mentor',
          lead_name: leadInfo.name,
          lead_email: leadInfo.email,
          lead_phone: leadInfo.phone
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao salvar lead:', error);
      throw error;
    }
  };

  const handleStartFreeCourse = async () => {
    if (!courseId) return;

    setProcessingEnrollment(true);
    
    try {
      // Se o usuário está logado, criar matrícula normal
      if (currentUser) {
        await createFreeEnrollment(courseId, currentUser.id);
        triggerEnrollmentConfetti();

        toast({
          title: "Sucesso!",
          description: "Que bom que você adquiriu este curso gratuito! Aproveite!",
          variant: "default"
        });
        
        setTimeout(async () => {
          await redirectAfterEnrollment(currentUser.id, navigate);
        }, 2000);
      } else {
        // Se não está logado, permitir acesso direto para cursos gratuitos
        triggerEnrollmentConfetti();
        setHasAccessedFreeCourse(true);
        setShowWelcomeModal(true);
      }
      
    } catch (error: any) {
      console.error('Erro ao se inscrever:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao se inscrever no curso',
        variant: "destructive"
      });
    } finally {
      setProcessingEnrollment(false);
    }
  };

  const handleStartWatching = async () => {
    // Validar se todos os campos estão preenchidos
    if (!leadData.name.trim() || !leadData.email.trim() || !leadData.phone.trim()) {
      setLeadError('Você precisa preencher nome, email e telefone para poder assistir o curso gratuitamente');
      return;
    }

    // Limpar erro
    setLeadError('');

    try {
      // Salvar lead na tabela
      await saveLead(leadData);
      
      // Salvar token no localStorage para permitir acesso ao curso
      if (courseId) {
        localStorage.setItem(`lead_access_${courseId}`, 'true');
        console.log('✅ Token de acesso salvo no localStorage para curso:', courseId);
      }
      
      // Fechar modal e redirecionar
      setShowWelcomeModal(false);
      navigate(`/cursoplayer/${courseId}`);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao processar seus dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const toggleModule = useCallback((moduleIndex: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleIndex)) {
        newSet.delete(moduleIndex);
      } else {
        newSet.add(moduleIndex);
      }
      return newSet;
    });
  }, []);

  const toggleDescription = useCallback(() => {
    setIsDescriptionExpanded(prev => !prev);
  }, []);

  const handlePreviewClick = useCallback(() => {
    if (firstContent) {
      setShowPreviewModal(true);
    } else {
      toast({
        title: "Preview não disponível",
        description: "Este curso ainda não possui conteúdo disponível para preview",
        variant: "destructive"
      });
    }
  }, [firstContent]);

  const truncateDescription = useCallback((text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }, []);

  // Memoizar estatísticas de conteúdo para evitar recálculos desnecessários
  const contentStats = useMemo(() => {
    if (!realCourseData) return { videos: 0, texts: 0, pdfs: 0 };
    
    let videos = 0;
    let texts = 0;
    let pdfs = 0;
    
    realCourseData.modulos.forEach(modulo => {
      modulo.conteudos.forEach(conteudo => {
        switch (conteudo.content_type) {
          case 'video_externo':
            videos++;
            break;
          case 'texto_rico':
            texts++;
            break;
          case 'pdf':
            pdfs++;
            break;
        }
      });
    });
    
    return { videos, texts, pdfs };
  }, [realCourseData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
        {/* Background Premium */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 z-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold/20 rounded-full float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="flex relative z-20 min-h-screen">
          <div className="flex-1 transition-all duration-300 flex items-center justify-center">
            {/* Loading Premium Dourado */}
            <div className="flex flex-col items-center space-y-6">
              {/* Círculo de Loading Dourado */}
              <div className="relative">
                {/* Círculo externo com glow */}
                <div className="w-24 h-24 rounded-full border-4 border-gold/20 animate-pulse"></div>
                
                {/* Círculo de loading principal */}
                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-gold border-r-gold animate-spin"></div>
                
                {/* Círculo interno com gradiente */}
                <div className="absolute inset-2 w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 via-gold-light/10 to-transparent animate-pulse"></div>
                
                {/* Ponto central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-gold rounded-full animate-pulse shadow-lg shadow-gold/50"></div>
                </div>
                
                {/* Efeito de brilho */}
                <div className="absolute -inset-2 w-28 h-28 rounded-full bg-gradient-to-r from-gold/10 via-gold-light/20 to-gold/10 blur-xl animate-pulse"></div>
              </div>
              
              {/* Texto de loading */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Carregando curso...</h3>
                <p className="text-muted-foreground">Preparando uma experiência incrível para você</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Curso não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O curso que você está procurando não existe ou não está disponível.
          </p>
          <Button onClick={() => navigate('/')}>
            ← Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background relative overflow-hidden">
      {/* Background Premium */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40"></div>
      </div>

      {/* Floating Particles - Reduced for performance */}
      <div className="absolute inset-0 z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/20 rounded-full float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="flex relative z-20">
        <div className="flex-1 transition-all duration-300">
          <div className="p-4 md:p-8 pt-6 md:pt-8">
            {/* Hero Section Premium */}
            <div className="max-w-7xl mx-auto">
              {/* Título Principal com tag premium posicionada */}
              <div className="text-center mb-4 md:mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-gold/20 shadow-xl">
                {/* Vídeo de fundo apenas para o título - Otimizado */}
                <video
                   autoPlay
                   loop
                   muted
                   playsInline
                   preload="metadata"
                   className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
                 >
                  <source src="https://cdn.pixabay.com/video/2019/10/09/27669-365224683_large.mp4" type="video/mp4" />
                </video>
                
                {/* Overlay para melhor legibilidade */}
                 <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/10 to-background/20 z-10"></div>
                
                {/* Conteúdo do título */}
                <div className="relative z-20 py-8 md:py-16 px-4 md:px-8">
                  <h1 className="text-2xl md:text-4xl font-black mb-4 leading-tight">
                    <span className="gradient-text text-shadow-gold">
                      {landingData.headline}
                    </span>
                  </h1>
                  <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
                    {landingData.subheadline}
                  </p>
                  
                  {/* Tag Premium no canto inferior direito */}
                  <div className="absolute bottom-4 right-4 inline-flex items-center px-3 md:px-4 py-1 md:py-2 rounded-full bg-gradient-to-r from-gold/20 via-gold-light/20 to-gold/20 border border-gold/30 backdrop-blur-sm">
                    <Zap className="w-3 md:w-4 h-3 md:h-4 text-gold mr-1 md:mr-2" />
                    <span className="text-gold font-medium text-xs md:text-sm">Curso Premium</span>
                  </div>
                </div>
                
                {/* Status de matrícula */}
                {isEnrolled && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8 max-w-md mx-auto">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-green-400 font-medium">
                        Você já possui este curso!
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card do Curso com Imagem */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-6 md:mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Imagem do Curso */}
                  <div className="relative overflow-hidden rounded-lg shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all duration-500 group">
                    {/* Glowing Border Effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold/20 via-transparent to-gold/20 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="h-full w-full rounded-lg bg-black/20"></div>
                    </div>
                    
                    <img
                      src={courseData.image_url || '/images/course-placeholder.jpg'}
                      alt={courseData.title}
                      className="w-full h-48 md:h-64 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/course-placeholder.jpg';
                      }}
                    />
                    
                    {/* Enhanced Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-lg"></div>
                    
                    {/* Shimmer Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-lg"></div>
                    
                    {/* Badge de Preço */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-gold/90 text-background px-3 py-1 rounded-full text-sm font-semibold">
                        {courseData.is_paid ? `R$ ${courseData.price.toFixed(2)}` : 'GRATUITO'}
                      </div>
                    </div>
                    
                    {/* Enhanced Preview Button */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <button 
                        onClick={handlePreviewClick}
                        className="flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-gold/20 hover:border-gold/40 transition-all duration-300 cursor-pointer"
                      >
                        <Play className="w-5 h-5" />
                        <span className="font-light">Preview do Curso</span>
                      </button>
                    </div>
                    
                    {/* Floating Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-lg blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
                  </div>
                  
                  {/* Informações do Curso */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">{courseData.title}</h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {courseData.description ? truncateDescription(courseData.description, 120) : 'Descrição não disponível'}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{contentStats.videos} vídeos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{contentStats.texts} textos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Acesso vitalício</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className="w-4 h-4 text-gold fill-current"
                            />
                          ))}
                        </div>
                        <span className="text-gold font-semibold">4.9</span>
                        <span className="text-muted-foreground text-sm">(1.247 avaliações)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Coluna Principal - Cards de Conteúdo */}
                <div className="lg:col-span-2 space-y-4 md:space-y-8">
                  
                  {/* Card: Sobre o Mentor */}
                  {mentorData && (
                    <div 
                      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-gold/30"
                      onClick={() => navigate(`/mentor/publicview/${mentorData.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar do Mentor */}
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30">
                            {mentorData.avatar_url ? (
                              <img 
                                src={mentorData.avatar_url} 
                                alt={mentorData.full_name || "Mentor"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center">
                                <User className="w-8 h-8 text-gold" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full"></div>
                        </div>

                        {/* Informações do Mentor */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {mentorData.full_name || "Mentor"}
                          </h3>
                          
                          {/* Frase de destaque */}
                          <p className="text-gold text-sm font-medium mb-2 italic">
                            "{mentorData.highlight_message || "Estou aqui para compartilhar meu conhecimento e te ajudar a alcançar seus objetivos!"}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Card: O que você vai aprender */}
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-gold" />
                        O que você vai aprender
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {landingData.key_benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                          <span className="text-foreground text-sm leading-relaxed">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card: Social Proof Premium */}
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <User className="w-5 h-5 text-gold" />
                        {landingData.social_proof}
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Avatares */}
                      <div className="flex -space-x-2">
                        {(landingData.avatar_urls || []).length > 0 ? (
                          landingData.avatar_urls!.slice(0, 5).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Aluno ${index + 1}`}
                              className="w-10 h-10 rounded-full border-2 border-border object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=User${index + 1}&background=f59e0b&color=1e293b&size=40`;
                              }}
                            />
                          ))
                        ) : (
                          // Avatares padrão quando não há URLs
                          Array.from({ length: 5 }).map((_, index) => (
                            <div
                              key={index}
                              className="w-10 h-10 rounded-full border-2 border-border bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center"
                            >
                              <User className="w-5 h-5 text-gold" />
                            </div>
                          ))
                        )}
                      </div>

                      {/* Rating e texto */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  index < Math.floor(parseFloat(landingData.social_rating || "4.9"))
                                    ? 'text-gold fill-current'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gold font-semibold">{landingData.social_rating || "4.9"}</span>
                          <span className="text-muted-foreground text-sm">(1.247 avaliações)</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          "{landingData.comment || "Este curso mudou completamente minha carreira. Recomendo!"}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card: Course Content Menu */}
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold text-foreground mb-6">Conteúdo do Curso</h3>
                    
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                      <div className="text-center p-2 md:p-4 rounded-lg bg-muted/30">
                        <Play className="w-6 md:w-8 h-6 md:h-8 text-gold mx-auto mb-1 md:mb-2" />
                        <div className="text-lg md:text-2xl font-bold text-foreground">{contentStats.videos}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Vídeos</div>
                      </div>
                      <div className="text-center p-2 md:p-4 rounded-lg bg-muted/30">
                        <FileText className="w-6 md:w-8 h-6 md:h-8 text-gold mx-auto mb-1 md:mb-2" />
                        <div className="text-lg md:text-2xl font-bold text-foreground">{contentStats.texts}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Textos</div>
                      </div>
                      <div className="text-center p-2 md:p-4 rounded-lg bg-muted/30">
                        <FileIcon className="w-6 md:w-8 h-6 md:h-8 text-gold mx-auto mb-1 md:mb-2" />
                        <div className="text-lg md:text-2xl font-bold text-foreground">{contentStats.pdfs}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">PDFs</div>
                      </div>
                    </div>

                    {/* Módulos do Curso */}
                    {realCourseData && realCourseData.modulos.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground mb-4">Módulos do Curso</h4>
                        {realCourseData.modulos.map((modulo, moduleIndex) => (
                          <ModuleItem
                            key={modulo.id}
                            modulo={modulo}
                            moduleIndex={moduleIndex}
                            isExpanded={expandedModules.has(moduleIndex)}
                            onToggle={toggleModule}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Descrição do Curso */}
                  {courseData.description && (
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <h3 className="text-xl font-semibold text-foreground mb-4">Sobre o Curso</h3>
                      <div className="text-muted-foreground leading-relaxed">
                        {isDescriptionExpanded ? (
                          <div>
                            <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{courseData.description}</p>
                            <button
                              onClick={toggleDescription}
                              className="text-gold hover:text-gold-light transition-colors mt-2 text-sm font-medium"
                            >
                              Ver menos
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{truncateDescription(courseData.description)}</p>
                            {courseData.description.length > 150 && (
                              <button
                                onClick={toggleDescription}
                                className="text-gold hover:text-gold-light transition-colors mt-2 text-sm font-medium"
                              >
                                Ver mais
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Coluna Lateral - Checkout Premium */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-gold/20 rounded-xl p-4 md:p-6 shadow-xl lg:sticky lg:top-8">
                    {/* Ícone Premium */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-background" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{courseData.title}</h3>
                      <p className="text-muted-foreground text-sm mt-2">Transforme sua carreira hoje mesmo</p>
                    </div>

                    {/* Preço */}
                    <div className="text-center mb-6">
                      {courseData.is_paid ? (
                        <div>
                          {/* Tag de desconto */}
                          {courseData.discount && courseData.discount > 0 && (
                            <div className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-3 shadow-lg">
                              -{courseData.discount}% OFF
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            {/* Preço original (riscado se houver desconto) */}
                            {courseData.discount && courseData.discount > 0 && courseData.discounted_price ? (
                              <div className="text-lg text-muted-foreground line-through">
                                De R$ {courseData.price.toFixed(2)}
                              </div>
                            ) : null}
                            
                            {/* Preço final */}
                            <div className="text-4xl font-bold text-foreground">
                              R$ {(courseData.discount && courseData.discount > 0 && courseData.discounted_price 
                                ? courseData.discounted_price 
                                : courseData.price).toFixed(2)}
                            </div>
                            
                            {/* Economia */}
                            {courseData.discount && courseData.discount > 0 && courseData.discounted_price && (
                              <div className="text-green-600 font-semibold text-sm">
                                Você economiza R$ {(courseData.price - courseData.discounted_price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-foreground mb-2">
                          GRATUITO
                        </div>
                      )}
                      
                      <p className="text-muted-foreground text-sm mt-2">
                        {courseData.is_paid ? 'Pagamento único' : 'Acesso completo'}
                      </p>
                    </div>

                    {/* Benefícios */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-gold" />
                        <div>
                          <div className="text-foreground text-sm font-medium">
                            {landingData.course_features?.content_complete.title || "Conteúdo Completo"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {landingData.course_features?.content_complete.subtitle || "Módulos práticos e teóricos"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gold" />
                        <div>
                          <div className="text-foreground text-sm font-medium">
                            {landingData.course_features?.lifetime_access.title || "Acesso Vitalício"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {landingData.course_features?.lifetime_access.subtitle || "Estude no seu ritmo"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-gold" />
                        <div>
                          <div className="text-foreground text-sm font-medium">
                            {landingData.course_features?.certificate.title || "Certificado"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {landingData.course_features?.certificate.subtitle || "Comprove suas habilidades"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bônus */}
                    <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-6">
                      <h4 className="text-gold font-semibold mb-2">🎁 Bônus Inclusos:</h4>
                      <p className="text-foreground text-sm">{landingData.bonus_offer}</p>
                    </div>

                    {/* Contato direto com o mentor */}
                    <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-6 relative overflow-hidden">
                      {/* Efeito de brilho neon */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-gold-light/10 to-gold/5 animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-5 h-5 text-gold" />
                          <h4 className="text-gold font-semibold">Contato Direto com o Mentor</h4>
                        </div>
                        <p className="text-foreground text-sm">
                          Tire suas dúvidas diretamente com o mentor e acelere seu aprendizado
                        </p>
                      </div>
                    </div>

                    {/* Botão CTA */}
                    {currentUser?.id === courseData.mentor_id ? (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4"
                        onClick={() => navigate('/mentor/meus-cursos')}
                      >
                        Gerenciar Meu Curso
                      </Button>
                    ) : isEnrolled ? (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
                        onClick={() => redirectAfterEnrollment(currentUser!.id, navigate)}
                      >
                        Ir para Meus Cursos
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:via-gold hover:to-gold-light text-background font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 mb-4"
                        disabled={processingPayment || processingEnrollment}
                        onClick={courseData.is_paid ? handlePurchase : 
                           (hasAccessedFreeCourse ? () => {
                             // Redirecionar diretamente para o Course Player
                             navigate(`/cursoplayer/${courseId}`);
                           } : handleStartFreeCourse)}
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background mr-2"></div>
                            Processando...
                          </>
                        ) : processingEnrollment ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background mr-2"></div>
                            Inscrevendo...
                          </>
                        ) : (
                          courseData.is_paid ? 'Comprar Agora' : 
                          (hasAccessedFreeCourse ? 'Assistir Gratuitamente' : 'Assistir Gratuitamente')
                        )}
                      </Button>
                    )}

                    {/* Garantia */}
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        🛡️ {landingData.guarantee}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-gold" />
              Preview do Curso: {firstContent?.title || 'Conteúdo'}
            </DialogTitle>
          </DialogHeader>
          
          {firstContent && (
            <div className="space-y-4">
              {firstContent.content_type === 'video_externo' && firstContent.content_data?.url && (() => {
                const videoUrl = firstContent.content_data.url;
                let embedUrl: string | null = null;
                
                if (videoUrl) {
                  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    embedUrl = getYouTubeEmbedUrl(videoUrl);
                  } else if (videoUrl.includes('vimeo.com')) {
                    embedUrl = getVimeoEmbedUrl(videoUrl);
                  } else {
                    embedUrl = videoUrl;
                  }
                }
                
                return embedUrl ? (
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={firstContent.title}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <p className="text-white">Não foi possível carregar o vídeo</p>
                  </div>
                );
              })()}
              
              {firstContent.content_type === 'texto_rico' && firstContent.rich_text && (
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: firstContent.rich_text }}
                />
              )}
              
              {firstContent.content_type === 'pdf' && firstContent.pdf_url && (
                <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
                  <FileIcon className="w-12 h-12 text-gold mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">{firstContent.title}</p>
                  <p className="text-muted-foreground text-sm mb-4">Arquivo PDF disponível no curso completo</p>
                  <Button 
                    onClick={() => window.open(firstContent.pdf_url, '_blank')}
                    className="bg-gold hover:bg-gold-dark text-background"
                  >
                    Visualizar PDF
                  </Button>
                </div>
              )}
              
              <div className="text-center pt-4 border-t border-border">
                <p className="text-muted-foreground text-sm mb-4">
                  Este é apenas um preview. Adquira o curso completo para acessar todo o conteúdo.
                </p>
                <Button 
                  onClick={() => {
                    setShowPreviewModal(false);
                    // Scroll para o botão de compra
                    const checkoutSection = document.querySelector('.lg\\:col-span-1');
                    checkoutSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gold hover:bg-gold-dark text-background"
                >
                  {courseData?.is_paid ? 'Comprar Curso Completo' : 'Inscrever-se Gratuitamente'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Boas-vindas para Curso Gratuito */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gold mb-4">
              🎉 Bem-vindo(a)!
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎊</div>
            
            <div className="space-y-3">
              <p className="text-foreground font-medium">
                O conteúdo já está pronto para você!
              </p>
              
              <p className="text-muted-foreground text-sm">
                Para começar a assistir, precisamos de algumas informações:
              </p>
              
              {/* Formulário de Lead */}
              <div className="space-y-3 text-left">
                <div>
                  <Label htmlFor="lead-name" className="text-sm font-medium">
                    Nome completo *
                  </Label>
                  <Input
                    id="lead-name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={leadData.name}
                    onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lead-email" className="text-sm font-medium">
                    E-mail *
                  </Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={leadData.email}
                    onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lead-phone" className="text-sm font-medium">
                    Telefone *
                  </Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    placeholder="Digite seu telefone"
                    value={leadData.phone}
                    onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              {/* Mensagem de erro */}
              {leadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{leadError}</p>
                </div>
              )}
              
              <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                <p className="text-foreground text-sm">
                  Se você quiser ter acesso a mais conteúdos, você pode realizar seu{' '}
                  <span 
                    className="text-blue-600 hover:text-blue-800 cursor-pointer underline font-medium"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      navigate('/register');
                    }}
                  >
                    cadastro na plataforma
                  </span>
                  .
                </p>
              </div>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:via-gold hover:to-gold-light text-background font-bold"
              onClick={handleStartWatching}
            >
              OK - Começar a Assistir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursePublicView;