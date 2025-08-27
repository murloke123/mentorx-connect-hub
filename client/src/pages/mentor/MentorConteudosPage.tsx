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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from '@/components/ui/sheet';
import { Menu, Zap } from 'lucide-react';

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
import { supabase } from '@/utils/supabase';

const ConteudosPage = () => {
  const { cursoId, moduloId } = useParams<{ cursoId: string; moduloId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false);
  const [ctaButtonName, setCtaButtonName] = useState('');
  const [ctaRedirectUrl, setCtaRedirectUrl] = useState('');
  const [isCtaSubmitting, setIsCtaSubmitting] = useState(false);

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

  const handleCtaSubmit = async () => {
    if (!ctaButtonName.trim() || !ctaRedirectUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsCtaSubmitting(true);
    try {
      if (editingId) {
        // Atualizar CTA existente
        const updateData = {
          title: ctaButtonName,
          cta_button_name: ctaButtonName,
          cta_redirect_url: ctaRedirectUrl,
          content_data: {
            button_name: ctaButtonName,
            redirect_url: ctaRedirectUrl
          }
        };

        await atualizarConteudo(editingId, updateData);
        
        toast({
          title: "Sucesso",
          description: "Chamada para ação atualizada com sucesso!"
        });
      } else {
        // Criar nova CTA
        const { data, error } = await supabase
          .from('conteudos')
          .insert({
            module_id: moduloId,
            content_type: 'cta_button',
            title: ctaButtonName,
            description: 'Botão de Chamada para Ação',
            order_index: conteudos?.length || 0,
            cta_button_name: ctaButtonName,
            cta_redirect_url: ctaRedirectUrl,
            content_data: {
              button_name: ctaButtonName,
              redirect_url: ctaRedirectUrl
            }
          })
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Chamada para ação criada com sucesso!"
        });
      }

      // Atualizar a lista de conteúdos
      queryClient.invalidateQueries({ queryKey: ['conteudos', moduloId] });
      
      setIsCtaModalOpen(false);
      setCtaButtonName('');
      setCtaRedirectUrl('');
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao processar CTA:', error);
      toast({
        title: "Erro",
        description: editingId ? "Erro ao atualizar chamada para ação." : "Erro ao criar chamada para ação.",
        variant: "destructive"
      });
    } finally {
      setIsCtaSubmitting(false);
    }
  };

  const handleCtaCancel = () => {
    setIsCtaModalOpen(false);
    setCtaButtonName('');
    setCtaRedirectUrl('');
    setEditingId(null);
  };

  const handleEditConteudo = (conteudoId: string) => {
    // Encontrar o conteúdo na lista para verificar se é CTA
    const conteudo = conteudos?.find(c => c.id === conteudoId);
    
    if (conteudo?.content_type === 'cta_button') {
      // Para CTA, abrir o modal simples e preencher os campos
      setCtaButtonName(conteudo.cta_button_name || conteudo.content_data?.button_name || '');
      setCtaRedirectUrl(conteudo.cta_redirect_url || conteudo.content_data?.redirect_url || '');
      setEditingId(conteudoId);
      setIsCtaModalOpen(true);
    } else {
      // Para outros tipos, usar o modal complexo
      setEditingId(conteudoId);
      setIsModalOpen(true);
    }
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
        const updateData: any = {
          title: values.title,
          description: values.description,
        };

        if (values.content_type === 'texto_rico') {
          updateData.content_data = { texto: values.html_content };
        } else if (values.content_type === 'video_externo') {
          updateData.content_data = { provider: values.provider, url: values.video_url };
        } else if (values.content_type === 'pdf') {
          updateData.content_data = { pdf_file: values.pdf_file };
        } else if (values.content_type === 'cta_button') {
          updateData.content_data = {
            button_name: values.cta_button_name,
            redirect_url: values.cta_redirect_url
          };
          updateData.cta_button_name = values.cta_button_name;
          updateData.cta_redirect_url = values.cta_redirect_url;
        }

        await atualizarConteudo(editingId, updateData);
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
              <div className="mb-6 flex gap-3">
                <Button onClick={handleAddConteudo}>
                  Adicionar Conteúdo
                </Button>
                <Button 
                  onClick={() => setIsCtaModalOpen(true)}
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Chamada para Ação
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

        <Dialog open={isCtaModalOpen} onOpenChange={setIsCtaModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Chamada para Ação' : 'Chamada para Ação'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Abaixo você pode definir o nome de um botão e inserir um link de redirecionamento
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="cta-button-name">Nome do Botão</Label>
                <Input
                  id="cta-button-name"
                  value={ctaButtonName}
                  onChange={(e) => setCtaButtonName(e.target.value)}
                  placeholder="Ex: Comprar Agora, Saiba Mais..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cta-redirect-url">Link de Redirecionamento</Label>
                <Input
                  id="cta-redirect-url"
                  value={ctaRedirectUrl}
                  onChange={(e) => setCtaRedirectUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  type="url"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleCtaCancel}
                  disabled={isCtaSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCtaSubmit}
                  disabled={isCtaSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCtaSubmitting 
                    ? (editingId ? 'Atualizando...' : 'Salvando...') 
                    : (editingId ? 'Atualizar' : 'Salvar')
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConteudosPage;
