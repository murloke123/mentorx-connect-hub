import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CourseWithDetails, deleteCourse } from "@/services/adminService";
import { AlertCircle, User, Users } from "lucide-react";
import { useState } from 'react';



interface CoursesListProps {
  courses: CourseWithDetails[];
  isLoading: boolean;
  onDelete?: () => void;
}

const CoursesList = ({ courses, isLoading, onDelete }: CoursesListProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithDetails | null>(null);
  const { toast } = useToast();
  
  const handleDeleteClick = (course: CourseWithDetails) => {
    setSelectedCourse(course);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    
    try {
      await deleteCourse(selectedCourse.id);
      toast({
        title: "Curso removido",
        description: `O curso "${selectedCourse.title}" foi removido com sucesso.`,
      });
      setOpenDeleteDialog(false);
      if (onDelete) onDelete();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao tentar remover o curso.";
      toast({
        variant: "destructive",
        title: "Erro ao remover curso",
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="w-full p-6 flex items-center justify-center bg-gray-50 border-dashed">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Nenhum curso encontrado</h3>
          <p className="text-sm text-gray-500 mt-2">
            Não há cursos cadastrados na plataforma.
          </p>
        </div>
      </Card>
    );
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return "Gratuito";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="text-lg truncate" title={course.title}>{course.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <User className="h-3 w-3" /> {course.mentor_name || 'Mentor desconhecido'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-3 h-12 mb-3">
                {course.description || 'Este curso não possui descrição.'}
              </p>
              <div className="flex justify-between items-center">
                <Badge variant={course.is_paid ? "default" : "secondary"}>
                  {course.is_paid ? formatPrice(course.price) : "Gratuito"}
                </Badge>
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <Users className="h-3 w-3" /> 
                  <span>{course.enrollments_count} matrículas</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Criado em {formatDate(course.created_at)}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => handleDeleteClick(course)}
              >
                Remover curso
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente o curso{" "}
              <strong>"{selectedCourse?.title}"</strong> e todos os seus dados da plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirmar exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CoursesList;
