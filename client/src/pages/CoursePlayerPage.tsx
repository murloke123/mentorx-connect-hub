import ChatModal from '@/components/chat/ChatModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ConteudoItemLocal, CursoItemLocal, getCursoCompleto, ModuloItemLocal } from '@/services/coursePlayerService';
import { triggerSuccessConfetti } from '@/utils/confetti';
import { supabase } from '@/utils/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, CheckCircle, ChevronLeft, ChevronRight, Circle, FileText, MessageSquare, Video } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

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
  isCurrentContentCompleted: boolean;
  onToggleCurrentContentCompleted: () => void;
}> = ({ 
  currentConteudo, 
  modulos, 
  onNextContent, 
  onPreviousContent,
  isCurrentContentCompleted,
  onToggleCurrentContentCompleted
}) => {
  const { toast } = useToast();
  const [showCommentsModal, setShowCommentsModal] = useState(false);

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
            dangerouslySetInnerHTML={{ __html: content_data?.texto || '' }}
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
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 p-4">
        <div className="flex items-center gap-2">
          {/* Botão Comentários - Esquerda */}
          <button
            onClick={() => setShowCommentsModal(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border h-10 px-4 py-2 bg-slate-800 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700"
          >
            <MessageSquare className="w-4 h-4" />
            Comentários
          </button>
          
          {/* Botões de navegação - Centro */}
          <div className="flex gap-2 flex-1 justify-center">
            <Button 
              variant="outline" 
              onClick={onPreviousContent}
              className="bg-slate-800 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <Button 
               onClick={onNextContent}
               className="bg-gradient-to-r from-gold via-gold-light to-gold text-slate-900 hover:from-gold-light hover:to-gold-dark font-medium shadow-lg hover:shadow-xl transition-all duration-300"
             >
               Próximo
               <ChevronRight className="w-4 h-4 ml-2" />
             </Button>
          </div>
          
          {/* Botão Marcar como Concluído - Direita */}
          <button
            onClick={onToggleCurrentContentCompleted}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors shadow-sm border border-slate-600"
            title={isCurrentContentCompleted ? "Desmarcar como concluído" : "Marcar como concluído"}
          >
            <Check className={`w-4 h-4 ${isCurrentContentCompleted ? 'text-green-400' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">
              {isCurrentContentCompleted ? "Concluído" : "Marcar como Concluído"}
            </span>
          </button>
        </div>
      </div>

      {/* Modal de Comentários */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="max-w-md max-h-[80vh] p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-700">
            <DialogTitle className="text-lg font-semibold text-white flex items-center">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center mr-3 shadow-lg">
                <MessageSquare className="h-4 w-4 text-slate-900" />
              </div>
              Comentários
            </DialogTitle>
            <DialogDescription className="sr-only">
              Modal de comentários do conteúdo
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-medium text-white">
                Em breve esta funcionalidade
              </h3>
              <p className="text-sm text-gray-400">
                Estamos trabalhando para trazer a funcionalidade de comentários em breve.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // Efeito para expandir automaticamente o módulo do conteúdo atual
  useEffect(() => {
    if (currentConteudo) {
      setExpandedModuleId(currentConteudo.module_id);
    }
  }, [currentConteudo]);

  const toggleModule = (moduleId: string) => {
    setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
  };

  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700 flex flex-col shadow-2xl">
      {/* Progress Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="mb-2">
          <span className="text-sm font-medium text-white">Progresso do Curso</span>
          <span className="text-sm text-gold ml-2">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full bg-slate-700" />
      </div>

      {/* Modules and Content List */}
      <div className="flex-1 overflow-y-auto bg-slate-800/50">
        {modulos.map((modulo) => {
          const isExpanded = expandedModuleId === modulo.id;
          const hasCurrentContent = currentConteudo?.module_id === modulo.id;
          
          return (
            <div key={modulo.id} className="border-b border-slate-700">
              <div 
                className={`p-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                  hasCurrentContent ? 'bg-gradient-to-r from-gold/10 via-gold-light/5 to-gold/10 border-gold/30' : 'bg-slate-800/30'
                }`}
                onClick={() => toggleModule(modulo.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium text-sm ${hasCurrentContent ? 'text-gold' : 'text-white'}`}>
                      {modulo.title}
                    </h3>
                    {modulo.description && (
                      <p className="text-xs text-gray-400 mt-1">{modulo.description}</p>
                    )}
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>
              
              {/* Conteúdos do módulo - só aparecem quando expandido */}
              {isExpanded && (
                <div className="space-y-1 bg-slate-900/50">
                  {modulo.conteudos.map((conteudo) => {
                    const isActive = currentConteudo?.id === conteudo.id;
                    const isConcluido = conteudosConcluidos.has(conteudo.id);
                    
                    return (
                      <div
                        key={conteudo.id}
                        className={`p-3 ml-4 cursor-pointer hover:bg-slate-700/30 flex items-center justify-between border-l-2 transition-all duration-200 ${
                          isActive ? 'bg-gradient-to-r from-gold/20 via-gold-light/10 to-gold/20 border-l-gold shadow-gold/20' : 'border-l-slate-600 hover:border-l-slate-500'
                        }`}
                        onClick={() => onConteudoSelect(conteudo)}
                      >
                        <div className="flex-1">
                          <p className={`text-sm ${isActive ? 'font-medium text-gold' : 'text-gray-300'}`}>
                            {conteudo.title}
                          </p>
                          {conteudo.description && (
                            <p 
                              className="text-xs text-gray-500" 
                              title={conteudo.description}
                            >
                              {conteudo.description.length > 30 
                                ? `${conteudo.description.substring(0, 30)} ...`
                                : conteudo.description
                              }
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleConteudoConcluido(conteudo.id, conteudo.module_id);
                          }}
                          className="ml-2 hover:scale-110 transition-transform duration-200"
                        >
                          {isConcluido ? (
                            <CheckCircle className="w-5 h-5 text-gold" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Assistant Footer */}
      <div className="p-4 border-t border-slate-700 space-y-2 flex justify-center bg-slate-900/50">
        <div 
          className="cursor-pointer hover:scale-105 transition-transform duration-200 relative group"
          onClick={() => setIsChatModalOpen(true)}
          title="Clique para conversar com o assistente de IA"
        >
          <video 
            autoPlay 
            loop 
            muted 
            className="rounded-lg shadow-lg"
          >
            <source src="/images/robo2.webm" type="video/webm" />
            Seu navegador não suporta o elemento de vídeo.
          </video>
          <div className="absolute inset-0 bg-gold/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="text-slate-900 text-xs font-medium bg-gold/90 px-2 py-1 rounded shadow-lg">
              Chat IA
            </span>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        contentData={currentConteudo?.content_data}
      />
    </div>
  );
};

const CoursePlayerPage = () => {
  const { id: cursoId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [curso, setCurso] = useState<CursoItemLocal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentConteudo, setCurrentConteudo] = useState<ConteudoItemLocal | null>(null);
  const [conteudosConcluidos, setConteudosConcluidos] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [isCurrentContentCompleted, setIsCurrentContentCompleted] = useState(false);
  const { toast } = useToast();

  // Função para encontrar um conteúdo específico por ID
  const findConteudoById = (conteudoId: string, modulos: ModuloItemLocal[]): ConteudoItemLocal | null => {
    for (const modulo of modulos) {
      const conteudo = modulo.conteudos.find(c => c.id === conteudoId);
      if (conteudo) return conteudo;
    }
    return null;
  };

  // Função para atualizar a URL com o conteúdo selecionado
  const updateUrlWithContent = (conteudo: ConteudoItemLocal) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('conteudo', conteudo.id);
    newSearchParams.set('modulo', conteudo.module_id);
    setSearchParams(newSearchParams, { replace: true });
  };

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
        
        console.log('🔍 CoursePlayerPage: Verificando acesso ao curso...');

        // Primeiro, buscar dados do curso para verificar se o usuário é o dono
        const data = await getCursoCompleto(cursoId);
        
        if (!data) {
          setError("Curso não encontrado.");
          setLoading(false);
          return;
        }

        // Verificar se o usuário é o dono do curso
        const isOwner = data.mentor_id === user.id;
        console.log('👑 CoursePlayerPage: Verificação de propriedade:', {
          userId: user.id,
          mentorId: data.mentor_id,
          isOwner
        });

        if (isOwner) {
          // Se é o dono do curso, permitir acesso direto
          console.log('✅ CoursePlayerPage: Usuário é o dono do curso, acesso liberado');
          setHasAccess(true);
          setCurso(data);
        } else {
          // Se não é o dono, verificar matrícula
          console.log('🔍 CoursePlayerPage: Verificando matrícula do usuário...');

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
          setCurso(data);
        }
        
        if (!data) {
          setError("Curso não encontrado.");
          return;
        }
        
        console.log('📚 CoursePlayerPage: Curso carregado:', data.title);
        
        // Sistema de progresso removido - sem controle de conteúdos concluídos
        setConteudosConcluidos(new Set());
        
        // Verificar se há um conteúdo específico na URL
        const conteudoIdFromUrl = searchParams.get('conteudo');
        let initialContent: ConteudoItemLocal | null = null;
        
        if (conteudoIdFromUrl) {
          // Tentar encontrar o conteúdo específico da URL
          initialContent = findConteudoById(conteudoIdFromUrl, data.modulos);
          console.log('🔗 CoursePlayerPage: Conteúdo da URL encontrado:', initialContent?.title || 'Não encontrado');
        }
        
        // Se não encontrou o conteúdo da URL ou não há parâmetro, usar o primeiro disponível
        if (!initialContent && data.modulos.length > 0 && data.modulos[0].conteudos.length > 0) {
          initialContent = data.modulos[0].conteudos[0];
          console.log('🎯 CoursePlayerPage: Usando primeiro conteúdo:', initialContent.title);
        }
        
        if (initialContent) {
          setCurrentConteudo(initialContent);
          // Atualizar a URL para refletir o conteúdo selecionado
          updateUrlWithContent(initialContent);
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



  // Carregar conteúdos concluídos do usuário
  useEffect(() => {
    const loadCompletedContent = async () => {
      // Aguardar user e curso estarem disponíveis
      if (!user?.id || !cursoId || !curso) {
        console.log('⏳ Aguardando dados necessários...', { 
          hasUser: !!user?.id, 
          hasCursoId: !!cursoId, 
          hasCurso: !!curso 
        });
        return;
      }

      try {
        console.log('📡 Carregando conteúdos concluídos...');
        
        const { data, error } = await supabase
          .from('conteudo_concluido')
          .select('content_id')
          .eq('user_id', user.id)
          .eq('course_id', cursoId);

        if (error) {
          console.error('❌ Erro ao carregar conteúdos concluídos:', error);
          return;
        }

        const completedIds = new Set(data.map(item => item.content_id));
        console.log('✅ Conteúdos concluídos carregados:', completedIds.size, 'itens');
        
        setConteudosConcluidos(completedIds);
      } catch (error) {
        console.error('❌ Erro ao carregar conteúdos concluídos:', error);
      }
    };

    loadCompletedContent();
  }, [user?.id, cursoId, curso]); // Adicionado curso como dependência

  // Atualizar estado do conteúdo atual quando mudar
  useEffect(() => {
    if (currentConteudo?.id) {
      const isCompleted = conteudosConcluidos.has(currentConteudo.id);
      setIsCurrentContentCompleted(isCompleted);
      console.log('📄 Conteúdo atual:', currentConteudo.title, '- Concluído:', isCompleted);
    }
  }, [currentConteudo, conteudosConcluidos]);

  // Função para alternar conclusão do conteúdo atual
  const onToggleCurrentContentCompleted = async () => {
    if (!currentConteudo || !user || !curso) return;

    try {
      const isCompleted = conteudosConcluidos.has(currentConteudo.id);
      
      if (isCompleted) {
        // Remover da conclusão
        const { error } = await supabase
          .from('conteudo_concluido')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', curso.id)
          .eq('content_id', currentConteudo.id);

        if (error) throw error;

        const newSet = new Set(conteudosConcluidos);
        newSet.delete(currentConteudo.id);
        setConteudosConcluidos(newSet);
        setIsCurrentContentCompleted(false);

        toast({
          title: "Conteúdo desmarcado",
          description: "Conteúdo removido dos concluídos.",
        });
      } else {
        // Marcar como concluído
        const { error } = await supabase
          .from('conteudo_concluido')
          .insert({
            user_id: user.id,
            course_id: curso.id,
            module_id: currentConteudo.module_id,
            content_id: currentConteudo.id
          });

        if (error) throw error;

        const newSet = new Set(conteudosConcluidos);
        newSet.add(currentConteudo.id);
        setConteudosConcluidos(newSet);
        setIsCurrentContentCompleted(true);

        // Verificar se todos os conteúdos foram concluídos
        const totalContent = curso.modulos.reduce((total, modulo) => total + modulo.conteudos.length, 0);
        if (newSet.size === totalContent) {
          // Curso 100% concluído!
          triggerSuccessConfetti();
          toast({
            title: "🎉 Parabéns!",
            description: "Você concluiu 100% do curso! Excelente trabalho!",
            duration: 5000,
          });
        } else {
          toast({
            title: "Conteúdo concluído",
            description: "Conteúdo marcado como concluído!",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao alterar conclusão do conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do conteúdo.",
        variant: "destructive"
      });
    }
  };

  // Calcular progresso baseado nos conteúdos concluídos
  useEffect(() => {
    if (curso) {
      const totalContent = curso.modulos.reduce((total, modulo) => total + modulo.conteudos.length, 0);
      const completedCount = conteudosConcluidos.size;
      const progressPercentage = totalContent > 0 ? (completedCount / totalContent) * 100 : 0;
      setProgress(progressPercentage);
    }
  }, [conteudosConcluidos, curso]);

  const handleConteudoSelection = (conteudo: ConteudoItemLocal) => {
    setCurrentConteudo(conteudo);
    // Atualizar a URL para persistir a seleção
    updateUrlWithContent(conteudo);
    console.log('🎯 CoursePlayerPage: Conteúdo selecionado:', conteudo.title);
  };

  const handleToggleConteudoConcluido = async (conteudoId: string, moduloId: string) => {
    if (!user || !curso) return;

    try {
      const isCompleted = conteudosConcluidos.has(conteudoId);
      
      if (isCompleted) {
        // Remover da conclusão
        const { error } = await supabase
          .from('conteudo_concluido')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', curso.id)
          .eq('content_id', conteudoId);

        if (error) throw error;

        const newSet = new Set(conteudosConcluidos);
        newSet.delete(conteudoId);
        setConteudosConcluidos(newSet);

        // Atualizar estado do conteúdo atual se for o mesmo
        if (currentConteudo?.id === conteudoId) {
          setIsCurrentContentCompleted(false);
        }

        toast({
          title: "Conteúdo desmarcado",
          description: "Conteúdo removido dos concluídos.",
        });
      } else {
        // Marcar como concluído
        const { error } = await supabase
          .from('conteudo_concluido')
          .insert({
            user_id: user.id,
            course_id: curso.id,
            module_id: moduloId,
            content_id: conteudoId
          });

        if (error) throw error;

        const newSet = new Set(conteudosConcluidos);
        newSet.add(conteudoId);
        setConteudosConcluidos(newSet);

        // Atualizar estado do conteúdo atual se for o mesmo
        if (currentConteudo?.id === conteudoId) {
          setIsCurrentContentCompleted(true);
        }

        // Verificar se todos os conteúdos foram concluídos
        const totalContent = curso.modulos.reduce((total, modulo) => total + modulo.conteudos.length, 0);
        if (newSet.size === totalContent) {
          // Curso 100% concluído!
          triggerSuccessConfetti();
          toast({
            title: "🎉 Parabéns!",
            description: "Você concluiu 100% do curso! Excelente trabalho!",
            duration: 5000,
          });
        } else {
          toast({
            title: "Conteúdo concluído",
            description: "Conteúdo marcado como concluído!",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao alterar conclusão do conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do conteúdo.",
        variant: "destructive"
      });
    }
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
      updateUrlWithContent(nextContent);
      console.log('➡️ CoursePlayerPage: Próximo conteúdo:', nextContent.title);
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
      updateUrlWithContent(previousContent);
      console.log('⬅️ CoursePlayerPage: Conteúdo anterior:', previousContent.title);
    } else {
      toast({
        title: "Início do curso",
        description: "Você está no primeiro conteúdo do curso.",
      });
    }
  };

  const hasNextContent = findNextContent() !== null;
  const hasPreviousContent = findPreviousContent() !== null;
  
  // Função para voltar à página anterior e invalidar cache para atualizar dados em tempo real
  const handleGoBack = async () => {
    try {
      // Invalidar cache do React Query para atualizar dados em tempo real
      await queryClient.invalidateQueries({ 
        queryKey: ['menteeCourses', user?.id] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['menteeProfile', user?.id] 
      });
      
      // Voltar para a página anterior
      navigate(-1);
    } catch (error) {
      console.error('Erro ao invalidar cache:', error);
      // Fallback: voltar para página anterior mesmo se houver erro
      navigate(-1);
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
              Voltar
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
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-sm h-[45px] flex items-center px-6">
        <div className="flex items-center space-x-4 w-full">
          {/* Botão voltar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="text-gray-300 hover:text-white hover:bg-slate-700 flex items-center gap-2 h-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          {/* Breadcrumb alinhado à esquerda */}
          <div className="flex items-center space-x-2 text-sm flex-1">
            <span className="text-gray-200 truncate max-w-[200px] font-medium">
              {curso?.title || 'Carregando...'}
            </span>
            
            {currentModule && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300 truncate max-w-[150px]">
                  {currentModule.title}
                </span>
              </>
            )}
            
            {currentConteudo && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-500" />
                <span className="text-white font-medium truncate max-w-[200px]">
                  {currentConteudo.title}
                </span>
              </>
            )}
          </div>
          
          {/* Badge do tipo de conteúdo */}
          {currentConteudo && (
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-lg">
              {currentConteudo.content_type === 'video_externo' && (
                <>
                  <Video className="w-4 h-4 text-gray-300" />
                  <span className="text-sm text-gray-200">Vídeo</span>
                </>
              )}
              {currentConteudo.content_type === 'texto_rico' && (
                <>
                  <FileText className="w-4 h-4 text-gray-300" />
                  <span className="text-sm text-gray-200">Texto</span>
                </>
              )}
              {currentConteudo.content_type === 'pdf' && (
                <>
                  <FileText className="w-4 h-4 text-gray-300" />
                  <span className="text-sm text-gray-200">PDF</span>
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
            isCurrentContentCompleted={isCurrentContentCompleted}
            onToggleCurrentContentCompleted={onToggleCurrentContentCompleted}
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
