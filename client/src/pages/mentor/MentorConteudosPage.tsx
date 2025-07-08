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
            ? { html_content: values.html_content }
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
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 md:ml-[280px] p-6">
          <ConteudoError onRetry={refetch} />
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
    <div className="flex">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 md:ml-[280px] p-6">
        <Breadcrumbs 
          items={breadcrumbItems} 
          className="mb-6"
        />

        <ModuloHeader modulo={modulo} isLoading={isLoadingModulo} />

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
              conteudos={conteudos}
              onEdit={handleEditConteudo}
              onDelete={handleDeleteConteudo}
              isLoading={isLoading}
            />
          </>
        )}

        <ConteudoDialog
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          isLoading={isLoadingConteudoParaEditar}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitConteudo}
          onCancel={handleCloseModal}
          editingId={editingId}
          conteudoParaEditar={{
            ...conteudoParaEditar,
            pdf_url: conteudoParaEditar?.content_data?.pdf_url,
            pdf_filename: conteudoParaEditar?.content_data?.pdf_filename,
          }}
        />
      </div>
    </div>
  );
};

export default ConteudosPage;
