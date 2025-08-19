import { Course } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Edit2, Eye, Filter, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { getConteudosByModuloId } from "../../services/conteudoService";
import { deleteCourse, updateCoursePublicationStatus } from "../../services/courseService";
import { getModulosByCursoId } from "../../services/moduloService";
import { supabase } from "../../utils/supabase";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface CoursesListProps {
  courses: Course[];
  isLoading: boolean;
  totalEnrollments: number;
}

const CoursesList = ({ courses, isLoading, totalEnrollments }: CoursesListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [publishValidationDialogOpen, setPublishValidationDialogOpen] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Filtrar cursos com base na busca e filtro de visibilidade
  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = visibilityFilter === null || 
                        (visibilityFilter === 'public' && course.is_public) ||
                        (visibilityFilter === 'private' && !course.is_public) ||
                        (visibilityFilter === 'paid' && course.is_paid) ||
                        (visibilityFilter === 'free' && !course.is_paid);
                        
    return matchesSearch && matchesFilter;
  });
  
  // Lidar com a mudança de filtro
  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setVisibilityFilter(null);
    } else {
      setVisibilityFilter(value);
    }
  };

  // Lidar com o clique no botão de criar curso
  const handleCreateCourse = () => {
    navigate('/mentor/meus-cursos/novo');
  };

  // Handler for image loading errors
  const handleImageError = (courseId: string) => {
    setImageLoadErrors(prevErrors => {
      const newErrors = new Set(prevErrors);
      newErrors.add(courseId);
      return newErrors;
    });
    console.warn(`Failed to load image for course ${courseId}. It might be an invalid or inaccessible blob URL.`);
  };

  // Validar se o curso pode ser publicado
  const validateCourseForPublication = async (courseId: string): Promise<{ canPublish: boolean; errorMessage?: string }> => {
    try {
      // 1. Verificar se tem módulos
      const modulos = await getModulosByCursoId(courseId);
      if (modulos.length === 0) {
        return {
          canPublish: false,
          errorMessage: "Para publicar o curso você precisa ter módulos e conteúdos criados, além do que, você precisa ajustar as informações da página de venda, por exemplo, você não pode deixar o campo de comentário de avaliação igual a \"Este curso mudou completamente minha carreira. Recomendo!\" você tem que editar esse texto para condizer com comentários reais de seus mentorados, assim como as fotos de quem te avaliou, você pode simplesmente pegar o link das fotos de algum aluno seu do facebook ou instagram por exemplo e colocar o link dessa foto nas pessoas que te avaliaram por exemplo."
        };
      }

      // 2. Verificar se tem conteúdos nos módulos
      let hasContent = false;
      for (const modulo of modulos) {
        const conteudos = await getConteudosByModuloId(modulo.id);
        if (conteudos.length > 0) {
          hasContent = true;
          break;
        }
      }

      if (!hasContent) {
        return {
          canPublish: false,
          errorMessage: "Para publicar o curso você precisa ter módulos e conteúdos criados, além do que, você precisa ajustar as informações da página de venda, por exemplo, você não pode deixar o campo de comentário de avaliação igual a \"Este curso mudou completamente minha carreira. Recomendo!\" você tem que editar esse texto para condizer com comentários reais de seus mentorados, assim como as fotos de quem te avaliou, você pode simplesmente pegar o link das fotos de algum aluno seu do facebook ou instagram por exemplo e colocar o link dessa foto nas pessoas que te avaliaram por exemplo."
        };
      }

      // 3. Verificar a página de venda
      const { data: landingPageData, error } = await supabase
        .from('course_landing_pages')
        .select('layout_body')
        .eq('course_id', courseId)
        .single();

      if (error || !landingPageData) {
        return {
          canPublish: false,
          errorMessage: "Para publicar o curso você precisa ter módulos e conteúdos criados, além do que, você precisa ajustar as informações da página de venda, por exemplo, você não pode deixar o campo de comentário de avaliação igual a \"Este curso mudou completamente minha carreira. Recomendo!\" você tem que editar esse texto para condizer com comentários reais de seus mentorados, assim como as fotos de quem te avaliou, você pode simplesmente pegar o link das fotos de algum aluno seu do facebook ou instagram por exemplo e colocar o link dessa foto nas pessoas que te avaliaram por exemplo."
        };
      }

      // 4. Verificar se o comentário não é o padrão
      const layoutBody = landingPageData.layout_body;
      if (layoutBody && typeof layoutBody === 'object') {
        const layoutData = layoutBody as any;
        
        // Procurar por comentários com o texto específico
        const hasDefaultComment = JSON.stringify(layoutData).includes("Este curso mudou completamente minha carreira. Recomendo!");
        
        if (hasDefaultComment) {
          return {
            canPublish: false,
            errorMessage: "Para publicar o curso você precisa ter módulos e conteúdos criados, além do que, você precisa ajustar as informações da página de venda, por exemplo, você não pode deixar o campo de comentário de avaliação igual a \"Este curso mudou completamente minha carreira. Recomendo!\" você tem que editar esse texto para condizer com comentários reais de seus mentorados, assim como as fotos de quem te avaliou, você pode simplesmente pegar o link das fotos de algum aluno seu do facebook ou instagram por exemplo e colocar o link dessa foto nas pessoas que te avaliaram por exemplo."
          };
        }
      }

      return { canPublish: true };
    } catch (error) {
      console.error('Erro ao validar curso para publicação:', error);
      return {
        canPublish: false,
        errorMessage: "Erro ao validar o curso. Tente novamente."
      };
    }
  };

  // Navegar para a página de visualização do curso (CoursePlayerPage)
  const handleViewCourse = (courseId: string) => {
    navigate(`/mentor/meus-cursos/view/${courseId}`);
  };

  const handlePublishChange = async (courseId: string, newStatus: boolean) => {
    try {
      setIsUpdating(prev => new Set(Array.from(prev).concat(courseId)));

      // Se está tentando publicar, validar primeiro
      if (newStatus) {
        const validation = await validateCourseForPublication(courseId);
        if (!validation.canPublish) {
          setValidationErrorMessage(validation.errorMessage || 'Erro na validação');
          setPublishValidationDialogOpen(true);
          return;
        }
      }

      await updateCoursePublicationStatus(courseId, newStatus);
      
      toast({
        title: newStatus ? "Curso publicado" : "Curso despublicado",
        description: `O curso foi ${newStatus ? "publicado" : "despublicado"} com sucesso.`,
      });

      // Invalidate the query to refresh the courses list
      queryClient.invalidateQueries({ queryKey: ['mentorCourses'] });
    } catch (error) {
      console.error('Error updating course publication status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status de publicação do curso.",
      });
    } finally {
      setIsUpdating(prev => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  // Função para abrir o modal de confirmação de exclusão
  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  // Função para confirmar a exclusão do curso
  const handleConfirmDelete = async () => {
    if (!courseToDelete || !user?.id) return;

    try {
      setIsDeleting(prev => new Set(Array.from(prev).concat(courseToDelete.id)));
      await deleteCourse(courseToDelete.id, user.id);
      
      toast({
        title: "Curso excluído",
        description: `O curso "${courseToDelete.title}" foi excluído com sucesso.`,
      });

      // Invalidate the query to refresh the courses list
      queryClient.invalidateQueries({ queryKey: ['mentorCourses'] });
      
      // Fechar o modal
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir curso",
        description: error.message || "Não foi possível excluir o curso.",
      });
    } finally {
      setIsDeleting(prev => {
        const next = new Set(prev);
        next.delete(courseToDelete.id);
        return next;
      });
    }
  };

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        {/* Filtros e Busca sempre visíveis */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/60 w-4 h-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-gold/20 text-white placeholder:text-gray-400 focus:border-gold/40 text-sm"
            />
          </div>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-5 w-full h-auto">
              <TabsTrigger value="all" onClick={() => handleFilterChange('all')} className="text-xs px-1 py-2">Todos</TabsTrigger>
              <TabsTrigger value="public" onClick={() => handleFilterChange('public')} className="text-xs px-1 py-2">Públicos</TabsTrigger>
              <TabsTrigger value="private" onClick={() => handleFilterChange('private')} className="text-xs px-1 py-2">Privados</TabsTrigger>
              <TabsTrigger value="paid" onClick={() => handleFilterChange('paid')} className="text-xs px-1 py-2">Pagos</TabsTrigger>
              <TabsTrigger value="free" onClick={() => handleFilterChange('free')} className="text-xs px-1 py-2">Gratuitos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Estado de loading */}
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-2 text-muted-foreground">Carregando seus cursos...</p>
        </div>
      </div>
    );
  }

  // Renderizar conteúdo baseado nos resultados
  const renderContent = () => {
    if (filteredCourses.length === 0 && !searchQuery && !visibilityFilter) {
      // Nenhum curso criado ainda
      return (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-gold" />
          <h3 className="mt-2 text-xl font-medium text-white">Nenhum curso criado ainda</h3>
          <p className="mt-1 text-sm text-gray-500">Comece a compartilhar seu conhecimento!</p>
          <div className="mt-6">
            <Button onClick={handleCreateCourse}>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Seu Primeiro Curso
            </Button>
          </div>
        </div>
      );
    }
    
    if (filteredCourses.length === 0 && (searchQuery || visibilityFilter)) {
      // Nenhum resultado para os filtros aplicados
      return (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">Nenhum curso corresponde à sua busca</h3>
          <p className="mt-1 text-sm text-gray-500">Tente alterar seus filtros ou termo de busca.</p>
        </div>
      );
    }

    // Renderizar lista de cursos
    return (
      <div className="grid gap-4 grid-cols-1">
        {filteredCourses.map((course) => {
          const hasImageLoadingError = imageLoadErrors.has(course.id);
          const canDisplayImage = course.image_url && course.image_url.trim() !== '' && !hasImageLoadingError;

          return (
            <Card key={course.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {canDisplayImage ? (
                      <img 
                        src={course.image_url || ''} 
                        alt={course.title || ''} 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 border-2 border-gold shadow-lg shadow-gold/20"
                        onError={() => handleImageError(course.id)}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground border-2 border-gold shadow-lg shadow-gold/20">
                        {hasImageLoadingError ? 
                          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" /> : 
                          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
                        }
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{course.title || 'Curso sem título'}</CardTitle>
                      {hasImageLoadingError && (
                        <p className="text-xs text-destructive mt-1">Erro ao carregar imagem.</p>
                      )}
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className="bg-transparent text-white border border-white/30 hover:border-white/50 text-xs px-2 py-1"
                        >
                          {course.is_public ? 'Público' : 'Privado'}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          className="bg-transparent text-white border border-white/30 hover:border-white/50 text-xs px-2 py-1"
                        >
                          {course.is_paid ? 
                            `R$${(course.discount && course.discount > 0 && course.discounted_price ? 
                              course.discounted_price : course.price)?.toFixed(2)}` : 
                            'Gratuito'
                          }
                        </Badge>
                        {course.discount && course.discount > 0 && (
                          <Badge 
                            variant="secondary"
                            className="bg-green-600/20 text-green-400 border border-green-500/30 hover:border-green-500/50 text-xs px-2 py-1"
                          >
                            -{course.discount}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 justify-start">
                    <div className="flex items-center space-x-2 mr-2">
                      <div className="relative">
                        <Switch
                          id={`publish-${course.id}`}
                          checked={course.is_published}
                          onCheckedChange={(checked) => handlePublishChange(course.id, checked)}
                          disabled={isUpdating.has(course.id)}
                          className="relative z-10 scale-75"
                        />
                        {!course.is_published && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full opacity-50 blur-sm animate-pulse"></div>
                        )}
                      </div>
                      <Label htmlFor={`publish-${course.id}`} className="text-xs">
                        {isUpdating.has(course.id) ? "Atualizando..." : (course.is_published ? "Despublicar" : "Publicar")}
                      </Label>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewCourse(course.id)}
                      className="h-auto py-2 px-2 sm:px-3 text-xs"
                      size="sm"
                    >
                      <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Ver Curso</span><span className="sm:hidden">Ver</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      asChild
                      size="sm"
                      className="h-auto py-2 px-2"
                    >
                      <Link to={`/mentor/meus-cursos/${course.id}/editar`}>
                        <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDeleteClick(course)}
                      className="h-auto py-2 px-2 text-white hover:text-red-300 hover:bg-red-900/20 border-white/30"
                      size="sm"
                      disabled={isDeleting.has(course.id)}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div 
                  className="mb-4 cursor-pointer group p-4 rounded-lg border border-gold/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-200 hover:shadow-lg hover:shadow-gold/10 hover:border-gold/50 backdrop-blur-xl"
                  onClick={() => navigate(`/mentor/meus-cursos/${course.id}/inscricoes`)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gold" />
                      <span className="text-sm font-medium text-gold">Inscrições</span>
                    </div>
                    <div className="bg-slate-800/50 px-3 py-1 rounded-full shadow-sm border border-gold/30">
                      <span className="text-sm font-semibold text-gold">
                        {course.enrollments_count || 0}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min((course.enrollments_count || 0) * 10, 100)}
                    className="w-full h-2 mb-3 bg-slate-700/50 [&>div]:bg-gold" 
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gold/80 font-medium">
                      {course.enrollments_count || 0} alunos ativos
                    </span>
                    <span className="text-xs text-gold/80 font-medium">
                      Meta: 10+ alunos
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-3">
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 bg-gold/80 hover:bg-gold text-slate-900 font-medium shadow-lg hover:shadow-xl backdrop-blur-sm text-xs py-2"
                    onClick={() => navigate(`/mentor/meus-cursos/${course.id}/modulos`)}
                    size="sm"
                  >
                    Módulos
                  </Button>
                  <Button
                    className="flex-1 bg-gold/80 hover:bg-gold text-slate-900 font-medium shadow-lg hover:shadow-xl backdrop-blur-sm text-xs py-2"
                    onClick={() => navigate(`/mentor/meus-cursos/${course.id}/landing-page`)}
                    size="sm"
                  >
                    Página de Venda
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mb-8">
      {/* Filtros e Busca sempre visíveis */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/60 w-4 h-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-gold/20 text-white placeholder:text-gray-400 focus:border-gold/40 text-sm"
          />
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 w-full h-auto">
            <TabsTrigger value="all" onClick={() => handleFilterChange('all')} className="text-xs px-1 py-2">Todos</TabsTrigger>
            <TabsTrigger value="public" onClick={() => handleFilterChange('public')} className="text-xs px-1 py-2">Públicos</TabsTrigger>
            <TabsTrigger value="private" onClick={() => handleFilterChange('private')} className="text-xs px-1 py-2">Privados</TabsTrigger>
            <TabsTrigger value="paid" onClick={() => handleFilterChange('paid')} className="text-xs px-1 py-2">Pagos</TabsTrigger>
            <TabsTrigger value="free" onClick={() => handleFilterChange('free')} className="text-xs px-1 py-2">Gratuitos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conteúdo dinâmico */}
      {renderContent()}

      {/* Modal de erro de validação de publicação */}
      <AlertDialog open={publishValidationDialogOpen} onOpenChange={setPublishValidationDialogOpen}>
        <AlertDialogContent className="max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-gold/30 shadow-2xl shadow-gold/20 backdrop-blur-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-gold/20 border border-gold/30">
                <AlertTriangle className="h-5 w-5 text-gold" />
              </div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Não é possível publicar o curso
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-white/80 text-sm leading-relaxed space-y-3">
              <p>
                Para publicar o curso você precisa ter <span className="text-gold font-medium">módulos e conteúdos criados</span>, além do que, você precisa ajustar as informações da página de venda.
              </p>
              <p>
                Por exemplo, você não pode deixar o campo de comentário de avaliação igual a <span className="text-gold/80 italic">"Este curso mudou completamente minha carreira. Recomendo!"</span>
              </p>
              <p>
                Você tem que <span className="text-gold font-medium">editar esse texto para condizer com comentários reais</span> de seus mentorados, assim como as fotos de quem te avaliou.
              </p>
              <p>
                Você pode simplesmente pegar o link das fotos de algum aluno seu do Facebook ou Instagram e colocar o link dessa foto nas pessoas que te avaliaram.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogAction 
              onClick={() => setPublishValidationDialogOpen(false)}
              className="bg-gold/90 hover:bg-gold text-slate-900 font-medium shadow-lg hover:shadow-xl transition-all duration-200 px-6"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o curso "{courseToDelete?.title}"?
              <br />
              <br />
              <strong>Esta ação não pode ser desfeita.</strong> O curso será permanentemente removido e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={courseToDelete ? isDeleting.has(courseToDelete.id) : false}
            >
              {courseToDelete && isDeleting.has(courseToDelete.id) ? "Excluindo..." : "Excluir Curso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CoursesList;
