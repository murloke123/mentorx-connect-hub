import { Course } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Edit2, Eye, Filter, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { deleteCourse, updateCoursePublicationStatus } from "../../services/courseService";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Filtrar cursos com base na busca e filtro de visibilidade
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
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

  // Navegar para a página de visualização do curso (CoursePlayerPage)
  const handleViewCourse = (courseId: string) => {
    navigate(`/mentor/meus-cursos/view/${courseId}`);
  };

  const handlePublishChange = async (courseId: string, newStatus: boolean) => {
    try {
      setIsUpdating(prev => new Set([...prev, courseId]));
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
      setIsDeleting(prev => new Set([...prev, courseToDelete.id]));
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
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/60 w-4 h-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-gold/20 text-white placeholder:text-gray-400 focus:border-gold/40"
            />
          </div>
          <Tabs defaultValue="all" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all" onClick={() => handleFilterChange('all')}>Todos</TabsTrigger>
              <TabsTrigger value="public" onClick={() => handleFilterChange('public')}>Públicos</TabsTrigger>
              <TabsTrigger value="private" onClick={() => handleFilterChange('private')}>Privados</TabsTrigger>
              <TabsTrigger value="paid" onClick={() => handleFilterChange('paid')}>Pagos</TabsTrigger>
              <TabsTrigger value="free" onClick={() => handleFilterChange('free')}>Gratuitos</TabsTrigger>
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
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">Nenhum curso criado ainda</h3>
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
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {filteredCourses.map((course) => {
          const hasImageLoadingError = imageLoadErrors.has(course.id);
          const canDisplayImage = course.image_url && course.image_url.trim() !== '' && !hasImageLoadingError;

          return (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {canDisplayImage ? (
                      <img 
                        src={course.image_url} 
                        alt={course.title} 
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-gold shadow-lg shadow-gold/20"
                        onError={() => handleImageError(course.id)}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground border-2 border-gold shadow-lg shadow-gold/20">
                        {hasImageLoadingError ? 
                          <AlertTriangle className="h-8 w-8 text-destructive" /> : 
                          <BookOpen className="h-8 w-8" />
                        }
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{course.title}</CardTitle>
                      {hasImageLoadingError && (
                        <p className="text-xs text-destructive mt-1">Erro ao carregar imagem.</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className="bg-transparent text-white border border-white/30 hover:border-white/50"
                        >
                          {course.is_public ? 'Público' : 'Privado'}
                        </Badge>
                        <Badge 
                          variant="secondary"
                          className="bg-transparent text-white border border-white/30 hover:border-white/50"
                        >
                          {course.is_paid ? `R$${course.price?.toFixed(2)}` : 'Gratuito'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewCourse(course.id)}
                      className="h-auto py-2 px-3"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" /> Ver Curso
                    </Button>
                    <Button 
                      variant="outline" 
                      asChild
                      size="sm"
                      className="h-auto py-2 px-2"
                    >
                      <Link to={`/mentor/meus-cursos/${course.id}/editar`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDeleteClick(course)}
                      className="h-auto py-2 px-2 text-white hover:text-red-300 hover:bg-red-900/20 border-white/30"
                      size="sm"
                      disabled={isDeleting.has(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
              <CardFooter className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`publish-${course.id}`}
                    checked={course.is_published}
                    onCheckedChange={(checked) => handlePublishChange(course.id, checked)}
                  />
                  <Label htmlFor={`publish-${course.id}`} className="text-sm whitespace-nowrap">
                    {course.is_published ? "Publicado" : "Não Publicado"}
                  </Label>
                </div>
                <Button
                  className="flex-1 bg-gold/80 hover:bg-gold text-slate-900 font-medium shadow-lg hover:shadow-xl backdrop-blur-sm text-sm"
                  onClick={() => navigate(`/mentor/meus-cursos/${course.id}/modulos`)}
                >
                  Gerenciar Módulos
                </Button>
                <Button
                  className="flex-1 bg-gold/80 hover:bg-gold text-slate-900 font-medium shadow-lg hover:shadow-xl backdrop-blur-sm text-sm"
                  onClick={() => navigate(`/mentor/meus-cursos/${course.id}/landing-page`)}
                >
                  Página de Venda
                </Button>
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
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/60 w-4 h-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-gold/20 text-white placeholder:text-gray-400 focus:border-gold/40"
          />
        </div>
        <Tabs defaultValue="all" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" onClick={() => handleFilterChange('all')}>Todos</TabsTrigger>
            <TabsTrigger value="public" onClick={() => handleFilterChange('public')}>Públicos</TabsTrigger>
            <TabsTrigger value="private" onClick={() => handleFilterChange('private')}>Privados</TabsTrigger>
            <TabsTrigger value="paid" onClick={() => handleFilterChange('paid')}>Pagos</TabsTrigger>
            <TabsTrigger value="free" onClick={() => handleFilterChange('free')}>Gratuitos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conteúdo dinâmico */}
      {renderContent()}

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
