import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileIcon,
  FileText,
  Library,
  Play,
  Plus,
  Rocket,
  Save,
  Shield,
  Star,
  Trash2,
  User,
  X,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MentorSidebar from '../../components/mentor/MentorSidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';
import { CursoItemLocal, getCursoCompleto } from '../../services/coursePlayerService';
import '../../styles/landing-page.css';
import { supabase } from '../../utils/supabase';

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  is_paid: boolean;
  image_url: string;
  mentor_id: string;
  created_at: string;
}

interface LandingPageData {
  headline: string;
  subheadline: string;
  key_benefits: string[];
  social_proof: string;
  social_rating?: string;
  avatar_urls?: string[];
  comment?: string;
  guarantee: string;
  bonus_offer: string;
  urgency_message: string;
  capture_leads?: boolean;
  course_features?: {
    content_complete: { title: string; subtitle: string; };
    lifetime_access: { title: string; subtitle: string; };
    certificate: { title: string; subtitle: string; };
  };
}

const CourseLandingPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [realCourseData, setRealCourseData] = useState<CursoItemLocal | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
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
    comment: "Este curso mudou completamente minha carreira. Recomendo!",
    guarantee: "Garantia incondicional de 7 dias",
    bonus_offer: "Bônus exclusivo: Kit de ferramentas profissionais",
    urgency_message: "Contato direto com o mentor",
    capture_leads: false,
    course_features: {
      content_complete: { title: "Conteúdo Completo", subtitle: "Módulos práticos e teóricos" },
      lifetime_access: { title: "Acesso Vitalício", subtitle: "Estude no seu ritmo" },
      certificate: { title: "Certificado", subtitle: "Comprove suas habilidades" }
    }
  });

  // Estados para controlar a edição
  const [isEditingBenefits, setIsEditingBenefits] = useState(false);
  const [isEditingSocialProof, setIsEditingSocialProof] = useState(false);
  const [isEditingFeatures, setIsEditingFeatures] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados temporários para edição
  const [tempBenefits, setTempBenefits] = useState<string[]>([]);
  const [tempSocialProof, setTempSocialProof] = useState("");
  const [tempSocialRating, setTempSocialRating] = useState("4.9");
  const [tempComment, setTempComment] = useState("");
  const [tempAvatarUrls, setTempAvatarUrls] = useState<string[]>([
    "https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png",
    "https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png", 
    "https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png"
  ]);
  const [tempFeatures, setTempFeatures] = useState({
    content_complete: { title: "", subtitle: "" },
    lifetime_access: { title: "", subtitle: "" },
    certificate: { title: "", subtitle: "" }
  });

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        // Carregar dados básicos do curso
        const { data: course, error: courseError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        setCourseData(course);

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
          
          // Atualizar estados temporários com dados carregados
          if (loadedData.social_rating) {
            setTempSocialRating(loadedData.social_rating);
          }
          if (loadedData.avatar_urls) {
            setTempAvatarUrls(loadedData.avatar_urls);
          }
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

  // Funções para gerenciar a edição dos benefícios
  const startEditingBenefits = () => {
    setTempBenefits([...landingData.key_benefits]);
    setIsEditingBenefits(true);
  };

  const addBenefit = () => {
    setTempBenefits([...tempBenefits, ""]);
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...tempBenefits];
    newBenefits[index] = value;
    setTempBenefits(newBenefits);
  };

  const removeBenefit = (index: number) => {
    const newBenefits = tempBenefits.filter((_, i) => i !== index);
    setTempBenefits(newBenefits);
  };

  const cancelEditingBenefits = () => {
    setTempBenefits([]);
    setIsEditingBenefits(false);
  };

  // Funções para gerenciar a edição do social proof
  const startEditingSocialProof = () => {
    setTempSocialProof(landingData.social_proof);
    setTempSocialRating(landingData.social_rating || "4.9");
    setTempComment(landingData.comment || "Este curso mudou completamente minha carreira. Recomendo!");
    setTempAvatarUrls(landingData.avatar_urls || [
      "https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png",
      "https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png", 
      "https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png"
    ]);
    setIsEditingSocialProof(true);
  };

  const cancelEditingSocialProof = () => {
    setTempSocialProof("");
    setIsEditingSocialProof(false);
  };

  // Funções para gerenciar a edição dos recursos
  const startEditingFeatures = () => {
    setTempFeatures(landingData.course_features || {
      content_complete: { title: "Conteúdo Completo", subtitle: "Módulos práticos e teóricos" },
      lifetime_access: { title: "Acesso Vitalício", subtitle: "Estude no seu ritmo" },
      certificate: { title: "Certificado", subtitle: "Comprove suas habilidades" }
    });
    setIsEditingFeatures(true);
  };

  const updateFeature = (featureKey: string, field: 'title' | 'subtitle', value: string) => {
    setTempFeatures(prev => ({
      ...prev,
      [featureKey]: {
        ...prev[featureKey as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const cancelEditingFeatures = () => {
    setTempFeatures({
      content_complete: { title: "", subtitle: "" },
      lifetime_access: { title: "", subtitle: "" },
      certificate: { title: "", subtitle: "" }
    });
    setIsEditingFeatures(false);
  };

  // Função para salvar as alterações
  const saveChanges = async (section: 'benefits' | 'social_proof' | 'features') => {
    if (!courseId) return;
    
    setIsSaving(true);
    try {
      let updatedData = { ...landingData };
      
      if (section === 'benefits') {
        const filteredBenefits = tempBenefits.filter(benefit => benefit.trim() !== '');
        updatedData.key_benefits = filteredBenefits;
        setLandingData(updatedData);
        setIsEditingBenefits(false);
      } else if (section === 'social_proof') {
        updatedData.social_proof = tempSocialProof;
        updatedData.social_rating = tempSocialRating;
        updatedData.comment = tempComment;
        updatedData.avatar_urls = tempAvatarUrls;
        setLandingData(updatedData);
        setIsEditingSocialProof(false);
      } else if (section === 'features') {
        updatedData.course_features = tempFeatures;
        setLandingData(updatedData);
        setIsEditingFeatures(false);
      }

      // Primeiro, verificar se já existe um registro para este course_id
      const { data: existingRecord } = await supabase
        .from('course_landing_pages')
        .select('id')
        .eq('course_id', courseId)
        .single();

      let error;
      
      if (existingRecord) {
        // Se existe, fazer update
        const { error: updateError } = await supabase
          .from('course_landing_pages')
          .update({
            layout_body: updatedData,
            updated_at: new Date().toISOString()
          })
          .eq('course_id', courseId);
        error = updateError;
      } else {
        // Se não existe, fazer insert
        const { error: insertError } = await supabase
          .from('course_landing_pages')
          .insert({
            course_id: courseId,
            layout_body: updatedData,
            is_active: true
          });
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Alterações salvas com sucesso!",
        variant: "default"
      });

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

        <div className="flex relative z-20">
          <MentorSidebar />
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
                <h3 className="text-xl font-bold text-gold animate-pulse">
                  Carregando Landing Page
                </h3>
                <p className="text-sm text-muted-foreground animate-pulse">
                  Preparando sua página de checkout premium...
                </p>
              </div>
              
              {/* Pontos de loading */}
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gold rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 p-6">
          <div className="text-center py-10">
            <p className="text-lg text-red-500">Curso não encontrado</p>
            <Button onClick={() => navigate('/mentor/meus-cursos')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

      <div className="flex relative z-20">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300">
          {/* Toolbar Premium */}
          <div className="bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/mentor/meus-cursos')}
                className="flex items-center group border-border/50 hover:border-gold/50 hover:text-gold transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Página de Checkout</h1>
                <p className="text-sm text-muted-foreground">{courseData.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/curso/${courseId}`, '_blank')}
                className="border-border/50 hover:border-gold/50 hover:text-gold transition-all group"
              >
                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Visualizar
              </Button>
            </div>
          </div>

          {/* Checkout Page Content */}
          <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
            <div className="max-w-7xl mx-auto px-6 py-12 relative">
              {/* Video Background for Content Area */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <video 
                  src="https://cdn.pixabay.com/video/2019/10/09/27669-365224683_large.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for better readability */}
                <div className="absolute inset-0 bg-black/60"></div>
              </div>
              <div className="grid lg:grid-cols-2 gap-12 items-start relative z-10">
                
                {/* Left Column - Course Info */}
                <div className="space-y-8">
                  {/* Hero Section Premium */}
                  <div className={`relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 border border-white/20 shadow-2xl hover:shadow-gold/20 transition-all duration-500 group ${isDescriptionExpanded ? 'h-auto' : 'h-64'}`}>
                    {/* Subtle Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 opacity-50"></div>
                    {/* Shimmer Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <div className="relative z-10 p-8 flex flex-col justify-center text-white">
                        <h1 className="text-2xl md:text-4xl font-black mb-4 leading-tight break-words hyphens-auto">
                          <span className="gradient-text text-shadow-gold break-words">
                            {courseData.title}
                          </span>
                        </h1>
                        <div className="space-y-4">
                          <div 
                            className="text-lg opacity-90 max-w-full break-words hyphens-auto drop-shadow-md prose prose-invert prose-lg"
                            style={{
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-word',
                              hyphens: 'auto'
                            }}
                            dangerouslySetInnerHTML={{
                              __html: isDescriptionExpanded 
                                ? courseData.description 
                                : truncateDescription(courseData.description, 120)
                            }}
                          />
                          <button
                            onClick={toggleDescription}
                            className="flex items-center space-x-2 text-gold hover:text-gold-light transition-colors duration-300 group/btn"
                          >
                            <span className="text-sm font-medium">
                              {isDescriptionExpanded ? 'Ver menos' : 'Ver mais'}
                            </span>
                            <ChevronDown 
                              className={`w-4 h-4 transition-transform duration-300 ${
                                isDescriptionExpanded ? 'rotate-180' : ''
                              } group-hover/btn:scale-110`}
                            />
                          </button>
                        </div>
                      </div>
                  </div>

                  {/* Course Image */}
                  {courseData.image_url && (
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all duration-500 group">
                      {/* Glowing Border Effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gold/20 via-transparent to-gold/20 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="h-full w-full rounded-3xl bg-black/20"></div>
                      </div>
                      
                      <img
                        src={courseData.image_url}
                        alt={courseData.title}
                        className="w-full h-64 object-cover rounded-3xl"
                      />
                      
                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-3xl"></div>
                      
                      {/* Shimmer Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-3xl"></div>
                      
                      {/* Enhanced Preview Button */}
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-gold/20 hover:border-gold/40 transition-all duration-300">
                          <Play className="w-5 h-5" />
                          <span className="font-medium">Preview do Curso</span>
                        </div>
                      </div>
                      
                      {/* Floating Glow Effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
                    </div>
                  )}

                  {/* Key Benefits Premium */}
                  <div className="premium-card backdrop-blur-xl bg-white/5 border border-white/20 relative">
                    {!isEditingBenefits && (
                      <Button
                        onClick={startEditingBenefits}
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-3 z-10 w-8 h-8 p-0 bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 hover:text-gold-light rounded-full"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                    <div className="mb-6 px-2">
                      <h3 className="flex items-center text-xl font-bold text-white drop-shadow-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-gold to-gold-light rounded-full flex items-center justify-center mr-3 shadow-lg">
                          <Zap className="w-5 h-5 text-black" />
                        </div>
                        O que você vai aprender
                      </h3>
                    </div>
                    <div className="px-2">
                      {isEditingBenefits ? (
                        <div className="space-y-4">
                          {tempBenefits.map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                              <Input
                                value={benefit}
                                onChange={(e) => updateBenefit(index, e.target.value)}
                                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                placeholder="Digite o benefício..."
                              />
                              <Button
                                onClick={() => removeBenefit(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={addBenefit}
                              variant="outline"
                              size="sm"
                              className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Benefício
                            </Button>
                          </div>
                          <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                            <Button
                              onClick={() => saveChanges('benefits')}
                              disabled={isSaving}
                              className="bg-gold hover:bg-gold-light text-black font-medium"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isSaving ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              onClick={cancelEditingBenefits}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {landingData.key_benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                              <span className="text-white break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Social Proof Premium */}
                  <div className="premium-card backdrop-blur-xl bg-white/5 border border-white/20 relative">
                    {!isEditingSocialProof && (
                      <Button
                        onClick={startEditingSocialProof}
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-3 z-10 w-8 h-8 p-0 bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 hover:text-gold-light rounded-full"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                    <div className="mb-6">
                      <h3 className="flex items-center text-xl font-bold text-white drop-shadow-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-gold to-gold-light rounded-full flex items-center justify-center mr-3 shadow-lg">
                          <User className="w-5 h-5 text-black" />
                        </div>
                        {landingData.social_proof}
                      </h3>
                    </div>
                    <div>
                      {isEditingSocialProof ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">Editando Social Proof</h4>
                          </div>
                          
                          {/* Campo para editar o texto */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Texto do Social Proof
                            </label>
                            <Input
                              value={tempSocialProof}
                              onChange={(e) => setTempSocialProof(e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              placeholder="Ex: Mais de 1.000 alunos já transformaram suas carreiras"
                            />
                          </div>

                          {/* Campo para editar a nota */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Nota (de 1 a 5)
                            </label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={tempSocialRating}
                              onChange={(e) => setTempSocialRating(e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                          </div>

                          {/* Campo para editar o comentário */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Comentário
                            </label>
                            <Input
                              value={tempComment}
                              onChange={(e) => setTempComment(e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              placeholder="Ex: Este curso mudou completamente minha carreira. Recomendo!"
                            />
                          </div>

                          {/* Campos para editar os links das imagens */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Links das Imagens dos Avatares
                            </label>
                            <div className="space-y-2">
                              {tempAvatarUrls.map((url, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden flex-shrink-0">
                                    <img 
                                      src={url} 
                                      alt={`Avatar ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/32x32/666/fff?text=?";
                                      }}
                                    />
                                  </div>
                                  <Input
                                    value={url}
                                    onChange={(e) => {
                                      const newUrls = [...tempAvatarUrls];
                                      newUrls[index] = e.target.value;
                                      setTempAvatarUrls(newUrls);
                                    }}
                                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                    placeholder={`URL da imagem ${index + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                            <Button
                              onClick={() => saveChanges('social_proof')}
                              disabled={isSaving}
                              className="bg-gold hover:bg-gold-light text-black font-medium"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isSaving ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              onClick={cancelEditingSocialProof}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex -space-x-2">
                                {tempAvatarUrls.map((avatarUrl, i) => (
                                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-lg overflow-hidden" style={{zIndex: 3-i}}>
                                    <img 
                                      src={avatarUrl} 
                                      alt={`Avatar ${i + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/666/fff?text=?";
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="flex items-center">
                                   {[...Array(5)].map((_, i) => (
                                     <Star key={i} className={`w-5 h-5 ${i < Math.floor(parseFloat(tempSocialRating)) ? 'text-gold fill-current' : 'text-gray-400'} drop-shadow-sm`} />
                                   ))}
                                   <span className="ml-2 text-sm text-white/80 font-medium">{tempSocialRating}/5</span>
                                 </div>
                                 {landingData.comment && (
                                   <p className="text-sm text-white/70 italic mt-2 break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                                     "{landingData.comment}"
                                   </p>
                                 )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Content Menu */}
                  <div className="premium-card backdrop-blur-xl bg-white/5 border border-white/20">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-bold text-white drop-shadow-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-gold to-gold-light rounded-full flex items-center justify-center mr-3 shadow-lg">
                            <BookOpen className="w-5 h-5 text-black" />
                          </div>
                          Conteúdo do Curso
                        </h3>
                        
                        {/* Content Statistics */}
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const stats = getContentStats();
                            return (
                              <>
                                {stats.videos > 0 && (
                                  <div className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-1">
                                    <Play className="w-3 h-3 text-gold" />
                                    <span className="text-xs text-white font-medium">{stats.videos}</span>
                                  </div>
                                )}
                                {stats.texts > 0 && (
                                  <div className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-1">
                                    <FileText className="w-3 h-3 text-gold" />
                                    <span className="text-xs text-white font-medium">{stats.texts}</span>
                                  </div>
                                )}
                                {stats.pdfs > 0 && (
                                  <div className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-1">
                                    <FileIcon className="w-3 h-3 text-gold" />
                                    <span className="text-xs text-white font-medium">{stats.pdfs}</span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {realCourseData?.modulos && realCourseData.modulos.length > 0 ? (
                        realCourseData.modulos.map((module, moduleIndex) => (
                          <div key={module.id} className="border border-white/10 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleModule(moduleIndex)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors duration-200"
                            >
                              <span className="font-medium text-white break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{module.title}</span>
                              {expandedModules.has(moduleIndex) ? (
                                <ChevronDown className="w-5 h-5 text-gold" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gold" />
                              )}
                            </button>
                            {expandedModules.has(moduleIndex) && (
                              <div className="px-4 pb-4 space-y-2">
                                {module.conteudos.map((conteudo, conteudoIndex) => (
                                  <div key={conteudo.id} className="flex items-center space-x-3 py-2">
                                    <div className="flex items-center space-x-2">
                                      {conteudo.content_type === 'video_externo' && (
                                        <Play className="w-3 h-3 text-gold flex-shrink-0" />
                                      )}
                                      {conteudo.content_type === 'texto_rico' && (
                                        <FileText className="w-3 h-3 text-gold flex-shrink-0" />
                                      )}
                                      {conteudo.content_type === 'pdf' && (
                                        <FileIcon className="w-3 h-3 text-gold flex-shrink-0" />
                                      )}
                                      <div className="w-2 h-2 bg-gold rounded-full flex-shrink-0"></div>
                                    </div>
                                    <span className="text-white/80 text-sm break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{conteudo.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="mb-4">
                            <Library className="w-8 h-8 text-gold mx-auto mb-3" />
                            <p className="text-white/60 mb-4">Nenhum módulo encontrado</p>
                          </div>
                          <button
                            onClick={() => navigate(`/mentor/meus-cursos/${courseId}/modulos`)}
                            className="inline-flex items-center px-6 py-3 bg-transparent border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 rounded-lg font-medium"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Criar Módulos
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Checkout Card Premium */}
                <div className="lg:sticky lg:top-8">
                  <div className="premium-card overflow-hidden shadow-glow">
                    {/* Enhanced Course Title Banner */}
                    <div className="relative overflow-hidden rounded-t-3xl">
                      {/* Animated Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gold-dark via-gold to-gold-light animate-gradient-x"></div>
                      
                      {/* Geometric Pattern Overlay */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12"></div>
                        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full -translate-x-8 -translate-y-8"></div>
                      </div>
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer"></div>
                      
                      {/* Content */}
                      <div className="relative p-8 z-50">
                        <div className="flex items-center mb-4 relative z-50">
                          <div className="w-3 h-3 bg-white/80 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-sm font-medium uppercase tracking-wider opacity-90 relative z-50 force-dark-text">Curso Premium</span>
                        </div>
                        
                        <h3 className="text-3xl font-black mb-4 leading-tight text-shadow-lg drop-shadow-2xl relative z-50 force-dark-text break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                          {courseData.title}
                        </h3>
                        
                        <div className="flex items-center justify-between relative z-50">
                          <div>
                            <div className="text-4xl font-black drop-shadow-lg relative z-50 force-dark-text">
                              {courseData.is_paid ? `R$ ${courseData.price}` : 'GRATUITO'}
                            </div>
                            {courseData.is_paid && (
                              <div className="text-sm opacity-90 font-medium relative z-50 force-dark-text">
                                ou 12x de R$ {(courseData.price / 12).toFixed(2)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm opacity-90 font-medium relative z-50 force-dark-text">Acesso</div>
                            <div className="font-black text-lg relative z-50 force-dark-text">Vitalício</div>
                          </div>
                        </div>
                        
                        {/* Premium Badge */}
                        <div className="absolute top-4 right-4 z-50">
                          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                            <span className="text-xs font-bold uppercase tracking-wider relative z-50 force-dark-text">Premium</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6 border border-white/10 rounded-b-3xl">
                      {/* Course Features Premium */}
                      <div className="space-y-4 relative">
                        {!isEditingFeatures && (
                          <Button
                            onClick={startEditingFeatures}
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 z-10 w-8 h-8 p-0 bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 hover:text-gold-light rounded-full"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        )}

                        {isEditingFeatures ? (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-foreground">Editar Recursos</h4>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => saveChanges('features')}
                                  disabled={isSaving}
                                  size="sm"
                                  className="bg-gold hover:bg-gold-light text-black"
                                >
                                  {isSaving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black mr-2"></div>
                                      Salvando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-3 h-3 mr-2" />
                                      Salvar
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={cancelEditingFeatures}
                                  variant="outline"
                                  size="sm"
                                  className="border-border/50 hover:border-red-500/50 hover:text-red-400"
                                >
                                  <X className="w-3 h-3 mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>

                            {/* Edição Conteúdo Completo */}
                            <div className="space-y-3 p-4 border border-white/10 rounded-lg">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                                  <BookOpen className="w-5 h-5 text-gold" />
                                </div>
                                <span className="text-sm text-muted-foreground">Recurso 1</span>
                              </div>
                              <Input
                                value={tempFeatures.content_complete.title}
                                onChange={(e) => updateFeature('content_complete', 'title', e.target.value)}
                                placeholder="Título do recurso..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                              <Input
                                value={tempFeatures.content_complete.subtitle}
                                onChange={(e) => updateFeature('content_complete', 'subtitle', e.target.value)}
                                placeholder="Subtítulo do recurso..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </div>

                            {/* Edição Acesso Vitalício */}
                            <div className="space-y-3 p-4 border border-white/10 rounded-lg">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                                  <Clock className="w-5 h-5 text-gold" />
                                </div>
                                <span className="text-sm text-muted-foreground">Recurso 2</span>
                              </div>
                              <Input
                                value={tempFeatures.lifetime_access.title}
                                onChange={(e) => updateFeature('lifetime_access', 'title', e.target.value)}
                                placeholder="Título do recurso..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                              <Input
                                value={tempFeatures.lifetime_access.subtitle}
                                onChange={(e) => updateFeature('lifetime_access', 'subtitle', e.target.value)}
                                placeholder="Subtítulo do recurso..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </div>

                            {/* Edição Certificado */}
                            <div className="space-y-3 p-4 border border-white/10 rounded-lg">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                                  <Award className="w-5 h-5 text-gold" />
                                </div>
                                <span className="text-sm text-muted-foreground">Recurso 3</span>
                              </div>
                              <Input
                                value={tempFeatures.certificate.title}
                                onChange={(e) => updateFeature('certificate', 'title', e.target.value)}
                                placeholder="Título do recurso..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                              <Input
                                value={tempFeatures.certificate.subtitle}
                                onChange={(e) => updateFeature('certificate', 'subtitle', e.target.value)}
                                placeholder="Subtítulo do recurso..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                                <BookOpen className="w-5 h-5 text-gold" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                                  {landingData.course_features?.content_complete.title || "Conteúdo Completo"}
                                </div>
                                <div className="text-sm text-muted-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                                  {landingData.course_features?.content_complete.subtitle || "Módulos práticos e teóricos"}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                                <Clock className="w-5 h-5 text-gold" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                                  {landingData.course_features?.lifetime_access.title || "Acesso Vitalício"}
                                </div>
                                <div className="text-sm text-muted-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                                  {landingData.course_features?.lifetime_access.subtitle || "Estude no seu ritmo"}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                                <Award className="w-5 h-5 text-gold" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                                  {landingData.course_features?.certificate.title || "Certificado"}
                                </div>
                                <div className="text-sm text-muted-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                                  {landingData.course_features?.certificate.subtitle || "Comprove suas habilidades"}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="border-t border-border/50"></div>

                      {/* Bonus Offer Premium */}
                      <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border border-gold/30 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-5 h-5 text-gold" />
                          <span className="font-semibold text-gold">Bônus Incluído</span>
                        </div>
                        <p className="text-sm text-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                          {landingData.bonus_offer}
                        </p>
                      </div>

                      {/* Contact Message Premium */}
                      <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border border-gold/30 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-5 h-5 text-gold" />
                          <span className="font-semibold text-gold">{landingData.urgency_message}</span>
                        </div>
                        <p className="text-sm text-foreground break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                          Tire suas dúvidas diretamente com o mentor e acelere seu aprendizado
                        </p>
                      </div>

                      {/* CTA Button Premium */}
                      <button 
                        disabled 
                        className="btn-gold-static w-full text-lg py-4 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed transition-opacity duration-300"
                      >
                        <Rocket className="w-5 h-5" />
                        <span>{courseData.is_paid ? 'Adquirir Agora' : 'Começar Gratuitamente'}</span>
                      </button>

                      {/* Guarantee Premium */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                          <Shield className="w-4 h-4 text-success" />
                          <span>
                            {landingData.guarantee}
                          </span>
                        </div>
                      </div>

                      {/* Lead Capture Settings */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="capture-leads"
                            checked={landingData.capture_leads || false}
                            onChange={async (e) => {
                              const newValue = e.target.checked;
                              const updatedData = { ...landingData, capture_leads: newValue };
                              setLandingData(updatedData);
                              
                              // Salvar automaticamente
                              if (!courseId) return;
                              
                              try {
                                const { data: existingRecord } = await supabase
                                  .from('course_landing_pages')
                                  .select('id')
                                  .eq('course_id', courseId)
                                  .single();

                                let error;
                                
                                if (existingRecord) {
                                  const { error: updateError } = await supabase
                                    .from('course_landing_pages')
                                    .update({
                                      layout_body: updatedData,
                                      capture_leads_enabled: newValue,
                                      updated_at: new Date().toISOString()
                                    })
                                    .eq('course_id', courseId);
                                  error = updateError;
                                } else {
                                  const { error: insertError } = await supabase
                                    .from('course_landing_pages')
                                    .insert({
                                      course_id: courseId,
                                      layout_body: updatedData,
                                      capture_leads_enabled: newValue,
                                      is_active: true
                                    });
                                  error = insertError;
                                }

                                if (error) throw error;

                                toast({
                                  title: "Configuração salva",
                                  description: newValue ? "Captura de leads ativada" : "Captura de leads desativada",
                                  variant: "default"
                                });
                              } catch (error) {
                                console.error('Erro ao salvar configuração:', error);
                                toast({
                                  title: "Erro",
                                  description: "Não foi possível salvar a configuração",
                                  variant: "destructive"
                                });
                              }
                            }}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor="capture-leads" className="text-sm text-foreground leading-relaxed">
                            <span className="font-medium">Você deseja capturar o nome, e-mail e telefone das pessoas que vão assistir seu curso gratuitamente?</span>
                            <br />
                            <span className="text-xs text-muted-foreground mt-1 block">
                              Se marcado, os usuários precisarão preencher seus dados para acessar o curso gratuito.
                            </span>
                          </label>
                        </div>
                      </div>
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

export default CourseLandingPage;