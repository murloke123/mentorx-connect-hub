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
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import { CursoItemLocal, getCursoCompleto } from '../services/coursePlayerService';
import { createFreeEnrollment, redirectAfterEnrollment } from '../services/courseService';
import { startCourseCheckout } from '../services/stripeCheckoutService';
import '../styles/landing-page.css';
import { triggerEnrollmentConfetti } from '../utils/confetti';
import { supabase } from '../utils/supabase';

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
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        // Carregar usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setCurrentUser(profile);

          // Verificar se já está matriculado (apenas matrículas ativas)
          const { data: enrollment, error: enrollmentError } = await supabase
            .from('matriculas')
            .select('*')
            .eq('course_id', courseId)
            .eq('student_id', user.id)
            .eq('status', 'active')
            .single();
          
          setIsEnrolled(!!enrollment && !enrollmentError);
        }

        // Carregar dados básicos do curso
        const { data: course, error: courseError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        setCourseData(course);

        // Carregar dados do mentor
        if (course.mentor_id) {
          const { data: mentor, error: mentorError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, bio, highlight_message')
            .eq('id', course.mentor_id)
            .single();

          if (!mentorError && mentor) {
            setMentorData(mentor);
          }
        }

        // Carregar dados completos do curso com módulos e conteúdos
        const realCourse = await getCursoCompleto(courseId);
        setRealCourseData(realCourse);

        // Carregar dados da landing page
        const { data: landingPage } = await supabase
          .from('course_landing_pages')
          .select('layout_body')
          .eq('course_id', courseId)
          .single();

        if (landingPage?.layout_body) {
          const loadedData = { ...landingData, ...landingPage.layout_body };
          setLandingData(loadedData);
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do curso",
          variant: "destructive"
        });
      } finally {
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

  const handleStartFreeCourse = async () => {
    if (!currentUser) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para se inscrever",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!courseId) return;

    setProcessingEnrollment(true);
    
    try {
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

  const toggleModule = (moduleIndex: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleIndex)) {
        newSet.delete(moduleIndex);
      } else {
        newSet.add(moduleIndex);
      }
      return newSet;
    });
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Função para calcular estatísticas de conteúdo
  const getContentStats = () => {
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
  };

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

  const contentStats = getContentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background relative overflow-hidden">
      {/* Background Premium */}
      <div className="absolute inset-0 z-10">
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

      <div className="flex relative z-20">
        <div className="flex-1 transition-all duration-300">
          <div className="p-8">
            {/* Header sem botão voltar */}
            <div className="mb-8">
              {/* Espaço reservado para header */}
            </div>

            {/* Hero Section Premium */}
            <div className="max-w-7xl mx-auto">
              {/* Título Principal com tag premium posicionada */}
              <div className="text-center mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-gold/20 shadow-xl">
                {/* Vídeo de fundo apenas para o título */}
                <video
                   autoPlay
                   loop
                   muted
                   playsInline
                   className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
                 >
                  <source src="https://cdn.pixabay.com/video/2019/10/09/27669-365224683_large.mp4" type="video/mp4" />
                </video>
                
                {/* Overlay para melhor legibilidade */}
                 <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/10 to-background/20 z-10"></div>
                
                {/* Conteúdo do título */}
                <div className="relative z-20 py-16 px-8">
                  <h1 className="text-2xl md:text-4xl font-black mb-4 leading-tight">
                    <span className="gradient-text text-shadow-gold">
                      {landingData.headline}
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                    {landingData.subheadline}
                  </p>
                  
                  {/* Tag Premium no canto inferior direito */}
                  <div className="absolute bottom-4 right-4 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gold/20 via-gold-light/20 to-gold/20 border border-gold/30 backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-gold mr-2" />
                    <span className="text-gold font-medium">Curso Premium</span>
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
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Imagem do Curso */}
                  <div className="relative overflow-hidden rounded-lg shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all duration-500 group">
                    {/* Glowing Border Effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold/20 via-transparent to-gold/20 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="h-full w-full rounded-lg bg-black/20"></div>
                    </div>
                    
                    <img
                      src={courseData.image_url || '/images/course-placeholder.jpg'}
                      alt={courseData.title}
                      className="w-full h-64 object-cover rounded-lg"
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
                      <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-gold/20 hover:border-gold/40 transition-all duration-300">
                        <Play className="w-5 h-5" />
                        <span className="font-light">Preview do Curso</span>
                      </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal - Cards de Conteúdo */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Card: Sobre o Mentor */}
                  {mentorData && (
                    <div 
                      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-gold/30"
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
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
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
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
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
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold text-foreground mb-6">Conteúdo do Curso</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <Play className="w-8 h-8 text-gold mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{contentStats.videos}</div>
                        <div className="text-sm text-muted-foreground">Vídeos</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <FileText className="w-8 h-8 text-gold mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{contentStats.texts}</div>
                        <div className="text-sm text-muted-foreground">Textos</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/30">
                        <FileIcon className="w-8 h-8 text-gold mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">{contentStats.pdfs}</div>
                        <div className="text-sm text-muted-foreground">PDFs</div>
                      </div>
                    </div>

                    {/* Módulos do Curso */}
                    {realCourseData && realCourseData.modulos.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground mb-4">Módulos do Curso</h4>
                        {realCourseData.modulos.map((modulo, moduleIndex) => (
                          <div key={modulo.id} className="border border-border/50 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleModule(moduleIndex)}
                              className="w-full p-4 text-left bg-muted/20 hover:bg-muted/30 transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-gold" />
                                <span className="font-medium text-foreground">{modulo.title}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({modulo.conteudos.length} {modulo.conteudos.length === 1 ? 'item' : 'itens'})
                                </span>
                              </div>
                              {expandedModules.has(moduleIndex) ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                            
                            {expandedModules.has(moduleIndex) && (
                              <div className="p-4 bg-card/30 border-t border-border/50">
                                <div className="space-y-2">
                                  {modulo.conteudos.map((conteudo) => (
                                    <div key={conteudo.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/20 transition-colors">
                                      {conteudo.content_type === 'video_externo' && <Play className="w-4 h-4 text-gold" />}
                                       {conteudo.content_type === 'texto_rico' && <FileText className="w-4 h-4 text-gold" />}
                                       {conteudo.content_type === 'pdf' && <FileIcon className="w-4 h-4 text-gold" />}
                                       <span className="text-sm text-foreground">{conteudo.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Descrição do Curso */}
                  {courseData.description && (
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
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
                  <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-gold/20 rounded-xl p-6 shadow-xl sticky top-8">
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
                        onClick={courseData.is_paid ? handlePurchase : handleStartFreeCourse}
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
                          courseData.is_paid ? 'Comprar Agora' : 'Inscrever-se Gratuitamente'
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
    </div>
  );
};

export default CoursePublicView;