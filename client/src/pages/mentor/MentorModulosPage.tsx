import MentorSidebar from '@/components/mentor/MentorSidebar';
import ModuloForm from '@/components/mentor/modulos/ModuloForm';
import ModuloList from '@/components/mentor/modulos/ModuloList';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetTrigger
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
    atualizarModulo,
    criarModulo,
    deletarModulo,
    getModulosByCursoId,
    Modulo
} from '@/services/moduloService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Library, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ModulosPage = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redirecionar se não tem cursoId
  useEffect(() => {
    if (!cursoId) {
      navigate('/mentor/meus-cursos');
      toast({
        title: 'Erro',
        description: 'ID do curso não fornecido',
        variant: 'destructive',
      });
    }
  }, [cursoId, navigate]);

  // Carregar os módulos do curso
  const { 
    data: modulos = [], 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['modulos', cursoId],
    queryFn: () => cursoId ? getModulosByCursoId(cursoId) : Promise.resolve([]),
    enabled: !!cursoId,
  });

  // Lidar com a criação de um novo módulo
  const handleAddModulo = () => {
    setEditingModulo(null);
    setIsAddModalOpen(true);
  };

  // Lidar com a abertura do modal de edição
  const handleEditModulo = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setIsEditModalOpen(true);
  };

  // Lidar com o envio do formulário de módulo (Criação)
  const handleSubmitAddModulo = async (values: { title: string; description?: string }) => {
    if (!cursoId) return;
    
    setIsSubmitting(true);
    try {
      await criarModulo({
        course_id: cursoId,
        title: values.title,
        description: values.description,
        order_index: modulos.length,
      });
      
      // Atualizar a lista de módulos
      await queryClient.invalidateQueries({ queryKey: ['modulos', cursoId] });
      setIsAddModalOpen(false);
      toast({
        title: "Módulo criado com sucesso!",
        description: "O módulo foi adicionado ao curso.",
      });
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      toast({
        title: "Erro ao criar módulo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lidar com o envio do formulário de módulo (Edição)
  const handleSubmitEditModulo = async (values: { title: string; description?: string }) => {
    if (!editingModulo || !cursoId) return;

    setIsSubmitting(true);
    try {
      await atualizarModulo(editingModulo.id, {
        title: values.title,
        description: values.description,
      });
      
      await queryClient.invalidateQueries({ queryKey: ['modulos', cursoId] });
      setIsEditModalOpen(false);
      setEditingModulo(null);
      toast({
        title: "Módulo atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      toast({
        title: "Erro ao atualizar módulo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lidar com a exclusão de um módulo
  const handleDeleteModulo = async (moduloId: string) => {
    if (!cursoId) return;
    
    try {
      await deletarModulo(moduloId);
      // Atualizar a lista de módulos
      await queryClient.invalidateQueries({ queryKey: ['modulos', cursoId] });
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
      toast({
        title: 'Erro ao excluir módulo',
        description: 'Não foi possível excluir o módulo. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleGoToCourses = () => {
    navigate('/mentor/meus-cursos');
  };

  // Se houver erro no carregamento
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
            <div className="text-center py-10">
              <h1 className="text-2xl font-bold text-red-500">Erro ao carregar módulos</h1>
              <p className="mt-2">Não foi possível carregar os módulos deste curso.</p>
              <button 
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            items={[
              { label: 'Meus Cursos', href: '/mentor/meus-cursos' },
              { label: 'Módulos do Curso' }
            ]} 
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gold flex items-center gap-3">
              <Library className="h-6 w-6 md:h-8 md:w-8 text-gold" />
              Gerenciar Módulos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Organize e gerencie os módulos do seu curso</p>
          </div>
        </div>
        
        <div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <ModuloList 
              modulos={modulos}
              cursoId={cursoId!}
              onAddModulo={handleAddModulo}
              onEditModulo={handleEditModulo}
              onDeleteModulo={handleDeleteModulo}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Modal de Adicionar Módulo */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-md p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
            <DialogHeader className="p-6 pb-4 border-b border-slate-700">
              <DialogTitle className="text-lg font-semibold text-white flex items-center">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center mr-3 shadow-lg">
                  <Library className="h-4 w-4 text-slate-900" />
                </div>
                Adicionar Novo Módulo
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-4">
              <ModuloForm
                onSubmit={handleSubmitAddModulo}
                isLoading={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Editar Módulo */}
        {editingModulo && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-md p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
              <DialogHeader className="p-6 pb-4 border-b border-slate-700">
                <DialogTitle className="text-lg font-semibold text-white flex items-center">
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center mr-3 shadow-lg">
                    <Library className="h-4 w-4 text-slate-900" />
                  </div>
                  Editar Módulo: {editingModulo.title}
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-4">
                <ModuloForm
                  onSubmit={handleSubmitEditModulo}
                  isLoading={isSubmitting}
                  initialData={editingModulo}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ModulosPage;
