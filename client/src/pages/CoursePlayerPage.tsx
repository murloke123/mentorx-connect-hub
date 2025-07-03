import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ConteudoItemLocal, CursoItemLocal, getCursoCompleto, ModuloItemLocal } from '@/services/coursePlayerService';
import { supabase } from '@/utils/supabase';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Circle, FileText, Video } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Função para converter URLs do YouTube para embed
const getYouTubeEmbedUrl = (url: string): string | null => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};

// Função para converter URLs do Vimeo para embed
const getVimeoEmbedUrl = (url: string): string | null => {
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/;
  const match = url.match(vimeoRegex);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
};

const ContentRenderer: React.FC<{
  currentConteudo: ConteudoItemLocal | null;
  modulos: ModuloItemLocal[];
  onNextContent: () => void;
  onPreviousContent: () => void;
}> = ({ currentConteudo, modulos, onNextContent, onPreviousContent }) => {
  const { toast } = useToast();

  const renderContent = () => {
    if (!currentConteudo) {
      return <div className="p-8 text-center text-gray-500">Selecione um conteúdo para começar</div>;
    }

    const { content_type, content_data } = currentConteudo;

    switch (content_type) {
      case 'video_externo':
        // Verificar múltiplos campos possíveis para URL do vídeo
        const videoUrl = content_data?.url || content_data?.video_url;
        
        if (videoUrl) {
          console.log('🎬 Processando vídeo:', { videoUrl, content_data });
          
          // Detectar provider e converter URL
          let embedUrl: string | null = null;
          let provider: string = 'unknown';
          
          if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            embedUrl = getYouTubeEmbedUrl(videoUrl);
            provider = 'youtube';
          } else if (videoUrl.includes('vimeo.com')) {
            embedUrl = getVimeoEmbedUrl(videoUrl);
            provider = 'vimeo';
          } else {
            // Se não for YouTube nem Vimeo, tentar usar a URL diretamente
            embedUrl = videoUrl;
            provider = 'other';
          }
          
          console.log('🔗 URL convertida:', { original: videoUrl, embed: embedUrl, provider });
          
          if (embedUrl) {
            return (
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentConteudo.title}
                />
              </div>
            );
          } else {
            return (
              <div className="p-8 text-center text-red-500">
                <p>Não foi possível processar a URL do vídeo</p>
                <p className="text-sm text-gray-500 mt-2">URL: {videoUrl}</p>
              </div>
            );
          }
        }
        return (
          <div className="p-8 text-center text-red-500">
            <p>URL do vídeo não encontrada</p>
            <p className="text-sm text-gray-500 mt-2">
              Dados disponíveis: {JSON.stringify(content_data)}
            </p>
          </div>
        );

      case 'texto_rico':
        return (
          <div 
            className="prose max-w-none p-8"
            dangerouslySetInnerHTML={{ __html: content_data?.html_content || '' }}
          />
        );

      case 'pdf':
        if (content_data?.pdf_url) {
          return (
            <div className="h-full">
              <iframe
                src={content_data.pdf_url}
                className="w-full h-full min-h-[600px]"
                title={currentConteudo.title}
              />
            </div>
          );
        }
        return <div className="p-8 text-center text-red-500">Arquivo PDF não encontrado</div>;

      default:
        return <div className="p-8 text-center text-gray-500">Tipo de conteúdo não suportado</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content - Removido o cabeçalho duplicado */}
      <div className="flex-1 bg-white overflow-auto">
        {renderContent()}
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t p-4">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onPreviousContent}
            className="w-full mr-2"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button 
            onClick={onNextContent}
            className="w-full"
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const CourseSidebar: React.FC<{
  modulos: ModuloItemLocal[];
  currentConteudo: ConteudoItemLocal | null;
  conteudosConcluidos: Set<string>;
  onConteudoSelect: (conteudo: ConteudoItemLocal) => void;
  onToggleConteudoConcluido: (conteudoId: string, moduloId: string) => void;
  progress: number;
  onPreviousContent: () => void;
  onNextContent: () => void;
  hasPreviousContent: boolean;
  hasNextContent: boolean;
}> = ({ 
  modulos, 
  currentConteudo, 
  conteudosConcluidos, 
  onConteudoSelect, 
  onToggleConteudoConcluido,
  progress,
  onPreviousContent,
  onNextContent,
  hasPreviousContent,
  hasNextContent
}) => {
  return (
    <div className="w-80 bg-white border-l flex flex-col">
      {/* Progress Header */}
      <div className="p-4 border-b">
        <div className="mb-2">
          <span className="text-sm font-medium">Progresso do Curso</span>
          <span className="text-sm text-gray-500 ml-2">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Modules and Content List */}
      <div className="flex-1 overflow-y-auto">
        {modulos.map((modulo) => (
          <div key={modulo.id} className="border-b">
            <div className="p-4 bg-gray-50">
              <h3 className="font-medium text-sm">{modulo.title}</h3>
              {modulo.description && (
                <p className="text-xs text-gray-600 mt-1">{modulo.description}</p>
              )}
            </div>
            <div className="space-y-1">
              {modulo.conteudos.map((conteudo) => {
                const isActive = currentConteudo?.id === conteudo.id;
                const isConcluido = conteudosConcluidos.has(conteudo.id);
                
                return (
                  <div
                    key={conteudo.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                      isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => onConteudoSelect(conteudo)}
                  >
                    <div className="flex-1">
                      <p className={`text-sm ${isActive ? 'font-medium text-blue-700' : ''}`}>
                        {conteudo.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{conteudo.content_type}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleConteudoConcluido(conteudo.id, conteudo.module_id);
                      }}
                      className="ml-2"
                    >
                      {isConcluido ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t space-y-2">
        <Button 
          variant="outline" 
          onClick={onPreviousContent}
          disabled={!hasPreviousContent}
          className="w-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button 
          onClick={onNextContent}
          disabled={!hasNextContent}
          className="w-full"
        >
          Próximo
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const CoursePlayerPage = () => {
  const { id: cursoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [curso, setCurso] = useState<CursoItemLocal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentConteudo, setCurrentConteudo] = useState<ConteudoItemLocal | null>(null);
  const [conteudosConcluidos, setConteudosConcluidos] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  console.log('🎓 CoursePlayerPage: Verificando acesso ao curso:', {
    cursoId,
    userId: user?.id,
    hasAccess,
    currentPath: window.location.pathname
  });

  // Função para verificar se o usuário está na rota correta baseado no role
  const checkRoutePermission = async () => {
    if (!user?.email) return true; // Se não tem email, deixa verificação de matrícula tratar

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .single();

      const userRole = profile?.role;
      const currentPath = window.location.pathname;

      console.log('🔍 CoursePlayerPage: Verificando permissão de rota:', {
        userRole,
        currentPath,
        isMentorRoute: currentPath.includes('/mentor/cursoplayer/'),
        isMentoradoRoute: currentPath.includes('/mentorado/cursoplayer/')
      });

      // Se é mentor tentando acessar rota de mentorado, redirecionar
      if (userRole === 'mentor' && currentPath.includes('/mentorado/cursoplayer/')) {
        console.log('🔄 CoursePlayerPage: Redirecionando mentor para rota correta');
        navigate(currentPath.replace('/mentorado/cursoplayer/', '/mentor/cursoplayer/'));
        return false;
      }

      // Se é mentorado tentando acessar rota de mentor, redirecionar
      if (userRole === 'mentorado' && currentPath.includes('/mentor/cursoplayer/')) {
        console.log('🔄 CoursePlayerPage: Redirecionando mentorado para rota correta');
        navigate(currentPath.replace('/mentor/cursoplayer/', '/mentorado/cursoplayer/'));
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ CoursePlayerPage: Erro ao verificar permissão de rota:', error);
      return true; // Em caso de erro, permite acesso
    }
  };

  useEffect(() => {
    if (!cursoId) {
      setError("ID do curso não encontrado.");
      setLoading(false);
      return;
    }

    if (!user) {
      setError("Você precisa estar logado para acessar este curso.");
      setLoading(false);
      return;
    }

    const checkEnrollmentAndFetchData = async () => {
      try {
        setLoading(true);
        
        // PRIMEIRO: Verificar se o usuário está na rota correta baseado no role
        const hasRoutePermission = await checkRoutePermission();
        if (!hasRoutePermission) {
          setLoading(false);
          return; // Se foi redirecionado, não continuar
        }
        
        console.log('🔍 CoursePlayerPage: Verificando matrícula do usuário...');

        // Verificar se o usuário tem matrícula ativa neste curso
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('matriculas')
          .select('status')
          .eq('course_id', cursoId)
          .eq('student_id', user.id)
          .single();

        console.log('📊 CoursePlayerPage: Resultado da matrícula:', {
          enrollment,
          enrollmentError
        });

        if (enrollmentError || !enrollment) {
          setError("Você não está matriculado neste curso.");
          setHasAccess(false);
          setLoading(false);
          toast({
            title: "Acesso negado",
            description: "Você precisa estar matriculado para acessar este curso.",
            variant: "destructive"
          });
          return;
        }

        if (enrollment.status !== 'active') {
          setError("Sua matrícula está pendente. Complete o pagamento para acessar o curso.");
          setHasAccess(false);
          setLoading(false);
          toast({
            title: "Pagamento pendente",
            description: "Complete o pagamento para acessar o conteúdo do curso.",
            variant: "destructive"
          });
          return;
        }

        console.log('✅ CoursePlayerPage: Matrícula ativa confirmada, carregando curso...');
        setHasAccess(true);

        // Se tem acesso, buscar dados do curso
        const data = await getCursoCompleto(cursoId);
        
        if (!data) {
          setError("Curso não encontrado.");
          return;
        }
        
        console.log('📚 CoursePlayerPage: Curso carregado:', data.title);
        setCurso(data);
        
        // Sistema de progresso removido - sem controle de conteúdos concluídos
        setConteudosConcluidos(new Set());
        
        // Set initial content if available
        if (data && data.modulos.length > 0 && data.modulos[0].conteudos.length > 0) {
          setCurrentConteudo(data.modulos[0].conteudos[0]);
          console.log('🎯 CoursePlayerPage: Primeiro conteúdo definido:', data.modulos[0].conteudos[0].title);
        }
        
        setError(null);
      } catch (err) {
        console.error("❌ CoursePlayerPage: Erro ao verificar acesso e carregar curso:", err);
        setError("Falha ao carregar o curso. Tente novamente mais tarde.");
        toast({ 
          title: "Erro ao carregar curso", 
          description: (err as Error).message, 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    checkEnrollmentAndFetchData();
  }, [cursoId, user, toast]);

  useEffect(() => {
    // Sistema de progresso simplificado - sempre 0% sem controle de conclusão
    setProgress(0);
  }, [conteudosConcluidos, curso]);

  const handleConteudoSelection = (conteudo: ConteudoItemLocal) => {
    setCurrentConteudo(conteudo);
  };

  const handleToggleConteudoConcluido = async (conteudoId: string, moduloId: string) => {
    // Função desabilitada - sistema de progresso removido
    toast({ 
      title: "Sistema de progresso desabilitado",
      description: "O controle de conteúdos concluídos foi removido.",
      variant: "destructive" 
    });
  };

  const findNextContent = () => {
    if (!curso || !currentConteudo) return null;

    // Encontrar o módulo atual
    const currentModuleIndex = curso.modulos.findIndex(m => m.id === currentConteudo.module_id);
    if (currentModuleIndex === -1) return null;

    const currentModule = curso.modulos[currentModuleIndex];
    
    // Encontrar o índice do conteúdo atual no módulo
    const currentContentIndex = currentModule.conteudos.findIndex(c => c.id === currentConteudo.id);
    
    // Se há mais conteúdo no módulo atual
    if (currentContentIndex < currentModule.conteudos.length - 1) {
      return currentModule.conteudos[currentContentIndex + 1];
    }
    
    // Se não há mais conteúdo no módulo atual, procurar no próximo módulo
    if (currentModuleIndex < curso.modulos.length - 1) {
      const nextModule = curso.modulos[currentModuleIndex + 1];
      if (nextModule.conteudos.length > 0) {
        return nextModule.conteudos[0];
      }
    }
    
    return null;
  };

  const findPreviousContent = () => {
    if (!curso || !currentConteudo) return null;

    // Encontrar o módulo atual
    const currentModuleIndex = curso.modulos.findIndex(m => m.id === currentConteudo.module_id);
    if (currentModuleIndex === -1) return null;

    const currentModule = curso.modulos[currentModuleIndex];
    
    // Encontrar o índice do conteúdo atual no módulo
    const currentContentIndex = currentModule.conteudos.findIndex(c => c.id === currentConteudo.id);
    
    // Se há conteúdo anterior no módulo atual
    if (currentContentIndex > 0) {
      return currentModule.conteudos[currentContentIndex - 1];
    }
    
    // Se não há conteúdo anterior no módulo atual, procurar no módulo anterior
    if (currentModuleIndex > 0) {
      const previousModule = curso.modulos[currentModuleIndex - 1];
      if (previousModule.conteudos.length > 0) {
        return previousModule.conteudos[previousModule.conteudos.length - 1];
      }
    }
    
    return null;
  };

  const handleNextContent = () => {
    const nextContent = findNextContent();
    if (nextContent) {
      setCurrentConteudo(nextContent);
    } else {
      toast({
        title: "Fim do curso",
        description: "Você chegou ao último conteúdo do curso.",
      });
    }
  };

  const handlePreviousContent = () => {
    const previousContent = findPreviousContent();
    if (previousContent) {
      setCurrentConteudo(previousContent);
    } else {
      toast({
        title: "Início do curso",
        description: "Você está no primeiro conteúdo do curso.",
      });
    }
  };

  const hasNextContent = findNextContent() !== null;
  const hasPreviousContent = findPreviousContent() !== null;
  
  // Função para voltar aos meus cursos baseado no role
  const handleGoBack = async () => {
    try {
      if (user?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();
        
        if (profile?.role === 'mentor') {
          navigate('/mentor/cursos');
        } else {
          navigate('/mentorado/cursos');
        }
      } else {
        navigate('/mentorado/cursos');
      }
    } catch (error) {
      navigate('/mentorado/cursos');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Carregando curso...</p></div>;
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold mb-2">Acesso Negado</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={handleGoBack}
              className="w-full"
            >
              Voltar aos Meus Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!curso) return <div className="flex justify-center items-center h-screen"><p>Curso não encontrado.</p></div>;

  // Função para encontrar o módulo atual
  const getCurrentModule = (): ModuloItemLocal | null => {
    if (!curso || !currentConteudo) return null;
    return curso.modulos.find(m => m.id === currentConteudo.module_id) || null;
  };

  const currentModule = getCurrentModule();

    return (
    <div className="flex flex-col h-screen">
      {/* Header com altura fixa de 45px */}
      <div className="bg-white border-b shadow-sm h-[45px] flex items-center px-6">
        <div className="flex items-center space-x-4 w-full">
          {/* Botão voltar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 h-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          {/* Breadcrumb alinhado à esquerda */}
          <div className="flex items-center space-x-2 text-sm flex-1">
            <span className="text-gray-700 truncate max-w-[200px] font-medium">
              {curso?.title || 'Carregando...'}
            </span>
            
            {currentModule && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 truncate max-w-[150px]">
                  {currentModule.title}
                </span>
              </>
            )}
            
            {currentConteudo && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium truncate max-w-[200px]">
                  {currentConteudo.title}
                </span>
              </>
            )}
          </div>
          
          {/* Badge do tipo de conteúdo */}
          {currentConteudo && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
              {currentConteudo.content_type === 'video_externo' && (
                <>
                  <Video className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Vídeo</span>
                </>
              )}
              {currentConteudo.content_type === 'texto_rico' && (
                <>
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Texto</span>
                </>
              )}
              {currentConteudo.content_type === 'pdf' && (
                <>
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">PDF</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <ContentRenderer 
            currentConteudo={currentConteudo}
            modulos={curso?.modulos || []}
            onNextContent={handleNextContent}
            onPreviousContent={handlePreviousContent}
          />
        </main>

        {/* Sidebar / Course Navigation */}
        <CourseSidebar 
          modulos={curso?.modulos || []}
          currentConteudo={currentConteudo}
          conteudosConcluidos={conteudosConcluidos}
          onConteudoSelect={handleConteudoSelection}
          onToggleConteudoConcluido={handleToggleConteudoConcluido}
          progress={progress}
          onPreviousContent={handlePreviousContent}
          onNextContent={handleNextContent}
          hasPreviousContent={hasPreviousContent}
          hasNextContent={hasNextContent}
        />
      </div>
    </div>
  );
};

export default CoursePlayerPage;
