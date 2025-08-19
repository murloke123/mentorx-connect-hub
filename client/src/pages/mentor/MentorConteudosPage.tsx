import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ConteudoDialog from '@/components/mentor/content/ConteudoDialog';
import ConteudoError from '@/components/mentor/content/ConteudoError';
import ConteudoList from '@/components/mentor/content/ConteudoList';
import ConteudoLoading from '@/components/mentor/content/ConteudoLoading';
import ModuloHeader from '@/components/mentor/content/ModuloHeader';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

import { ConteudoFormValues } from '@/components/mentor/content/types';
import { toast } from '@/hooks/use-toast';
import {
    atualizarConteudo,
    criarConteudoPDF,
    criarConteudoTexto,
    criarConteudoVideo,
    excluirConteudo,
    getConteudoById,
    getConteudosByModuloId,
} from '@/services/conteudoService';
import { getModuloById } from '@/services/moduloService';

const ConteudosPage = () => {
  const { cursoId, moduloId } = useParams<{ cursoId: string; moduloId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redirecionar se não tem ids necessários
  useEffect(() => {
    if (!cursoId || !moduloId) {
      navigate('/mentor/meus-cursos');
      toast({
        title: 'Erro',
        description: 'Informações necessárias não fornecidas',
        variant: 'destructive',
      });
    }
  }, [cursoId, moduloId, navigate]);

  // Carregar os detalhes do módulo
  const { 
    data: modulo,
    isLoading: isLoadingModulo,
  } = useQuery({
    queryKey: ['modulo', moduloId],
    queryFn: () => moduloId ? getModuloById(moduloId) : Promise.resolve(null),
    enabled: !!moduloId,
  });

  // Carregar os conteúdos do módulo
  const { 
    data: conteudos = [], 
    isLoading: isLoadingConteudos, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['conteudos', moduloId],
    queryFn: () => moduloId ? getConteudosByModuloId(moduloId) : Promise.resolve([]),
    enabled: !!moduloId,
  });

  // Carregar conteúdo específico para edição
  const { 
    data: conteudoParaEditar,
    isLoading: isLoadingConteudoParaEditar 
  } = useQuery({
    queryKey: ['conteudo', editingId],
    queryFn: () => editingId ? getConteudoById(editingId) : Promise.resolve(null),
    enabled: !!editingId,
  });

  const handleAddConteudo = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditConteudo = (conteudoId: string) => {
    setEditingId(conteudoId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmitConteudo = async (values: ConteudoFormValues & { 
    provider?: 'youtube' | 'vimeo'; 
    pdf_file?: File | null; 
  }) => {
    if (!moduloId) return;
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        // Atualizar conteúdo existente
        await atualizarConteudo(editingId, {
          title: values.title,
          description: values.description,
          content_data: values.content_type === 'texto_rico' 
            ? { texto: values.html_content }
            : values.content_type === 'video_externo'
            ? { provider: values.provider, url: values.video_url }
            : { pdf_file: values.pdf_file },
        });
      } else {
        // Criar novo conteúdo
        if (values.content_type === 'texto_rico') {
          await criarConteudoTexto({
            module_id: moduloId,
            title: values.title,
            description: values.description,
            texto: values.html_content || '<p>Conteúdo em branco</p>',
          });
        } else if (values.content_type === 'video_externo') {
          await criarConteudoVideo({
            module_id: moduloId,
            title: values.title,
            description: values.description,
            video_url: values.video_url || '',
          });
        } else if (values.content_type === 'pdf') {
          if (values.pdf_file) {
            await criarConteudoPDF({
              module_id: moduloId,
              title: values.title,
              description: values.description,
              pdf_file: values.pdf_file,
            });
          } else {
            toast({ 
              title: "Arquivo PDF não selecionado", 
              description: "Por favor, selecione um arquivo PDF para upload antes de salvar.", 
              variant: "default"
            });
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Atualizar a lista de conteúdos
      await queryClient.invalidateQueries({ queryKey: ['conteudos', moduloId] });
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      toast({
        title: 'Erro ao salvar conteúdo',
        description: 'Não foi possível salvar o conteúdo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConteudo = async (conteudoId: string) => {
    if (!moduloId) return;
    
    try {
      await excluirConteudo(conteudoId);
      // Atualizar a lista de conteúdos
      await queryClient.invalidateQueries({ queryKey: ['conteudos', moduloId] });
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error);
      toast({
        title: 'Erro ao excluir conteúdo',
        description: 'Não foi possível excluir o conteúdo. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isLoadingModulo || isLoadingConteudos;

  if (isError) {
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
        
        <div className="flex-1 transition-all duration-300 p-4 md:p-6 relative">
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
          
          <div className="pt-16 md:pt-0">
            <ConteudoError onRetry={refetch} />
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Meus Cursos', href: '/mentor/meus-cursos' },
    { label: 'Módulos', href: `/mentor/meus-cursos/${cursoId}/modulos` },
    { label: modulo?.title || 'Módulo' }
  ];

  return (
    <div className="flex-col md:flex-row flex min-h-screen max-w-full overflow-x-hidden">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-sm border border-gold/20 hover:bg-slate-800/80 hover:border-gold/40"
          >
            <Menu className="h-6 w-6 text-gold" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <MentorSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MentorSidebar />
      </div>
      
      <div className="flex-1 transition-all duration-300 p-3 md:p-6 pt-8 md:pt-6 min-h-screen bg-black max-w-full overflow-x-hidden">
        <div className="mb-6 flex flex-col gap-4">
          <Breadcrumbs 
            items={breadcrumbItems} 
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gold">Conteúdos do Módulo</h1>
            <p className="text-sm md:text-base text-muted-foreground">Gerencie os conteúdos e materiais do módulo</p>
          </div>
        </div>
        
        <div>
          <ModuloHeader modulo={modulo as any} isLoading={isLoadingModulo} />

          {isLoading ? (
            <ConteudoLoading />
          ) : (
            <>
              <div className="mb-6">
                <Button onClick={handleAddConteudo}>
                  Adicionar Conteúdo
                </Button>
              </div>
              <ConteudoList 
                conteudos={conteudos as any}
                onEdit={handleEditConteudo}
                onDelete={handleDeleteConteudo}
                isLoading={isLoading}
              />
            </>
          )}
        </div>

        <ConteudoDialog
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          isLoading={isLoadingConteudoParaEditar}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitConteudo}
          onCancel={handleCloseModal}
          editingId={editingId}
          conteudoParaEditar={conteudoParaEditar as any}
        />
      </div>
    </div>
  );
};

export default ConteudosPage;
