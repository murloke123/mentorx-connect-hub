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
import { deleteUser, MentorWithStats } from "@/services/adminService";
import { AlertCircle, BookOpen, Calendar, CheckCircle, Eye, EyeOff, User, XCircle } from "lucide-react";
import { useState } from 'react';



interface MentorsListProps {
  mentors: MentorWithStats[];
  isLoading: boolean;
  onDelete?: () => void;
}

const MentorsList = ({ mentors, isLoading, onDelete }: MentorsListProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorWithStats | null>(null);
  const { toast } = useToast();
  
  const handleDeleteClick = (mentor: MentorWithStats) => {
    setSelectedMentor(mentor);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedMentor) return;
    
    try {
      await deleteUser(selectedMentor.id);
      toast({
        title: "Mentor removido",
        description: `O mentor "${selectedMentor.full_name}" foi removido com sucesso.`,
      });
      setOpenDeleteDialog(false);
      if (onDelete) onDelete();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao tentar remover o mentor.";
      toast({
        variant: "destructive",
        title: "Erro ao remover mentor",
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

  if (mentors.length === 0) {
    return (
      <Card className="w-full p-6 flex items-center justify-center bg-gray-50 border-dashed">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Nenhum mentor encontrado</h3>
          <p className="text-sm text-gray-500 mt-2">
            Não há mentores cadastrados na plataforma.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mentors.map((mentor) => (
          <Card key={mentor.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {mentor.avatar_url ? (
                    <img src={mentor.avatar_url} alt={mentor.full_name || 'Mentor'} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{mentor.full_name || "Mentor sem nome"}</CardTitle>
                  <CardDescription>{mentor.id.slice(0, 8)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Status de Publicação do Perfil */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status do Perfil:</span>
                <Badge variant={mentor.is_public ? "default" : "secondary"} className="flex items-center gap-1">
                  {mentor.is_public ? (
                    <>
                      <Eye className="h-3 w-3" />
                      Público
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Privado
                    </>
                  )}
                </Badge>
              </div>

              {/* Número de Cursos */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de Cursos:</span>
                <div className="flex items-center gap-1 text-sm">
                  <BookOpen className="h-3 w-3" />
                  <span>{mentor.courses_count}</span>
                </div>
              </div>

              {/* Status dos Cursos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cursos Publicados:</span>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>{mentor.published_courses_count}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cursos Não Publicados:</span>
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <XCircle className="h-3 w-3" />
                    <span>{mentor.unpublished_courses_count}</span>
                  </div>
                </div>
              </div>

              {/* Data de Cadastro */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Cadastrado em:</span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {mentor.created_at 
                      ? new Date(mentor.created_at).toLocaleDateString('pt-BR')
                      : 'Data não disponível'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => handleDeleteClick(mentor)}
              >
                Remover mentor
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
              Esta ação não pode ser desfeita. Isso removerá permanentemente o mentor{" "}
              <strong>"{selectedMentor?.full_name}"</strong> e todos os seus dados da plataforma.
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

export default MentorsList;
