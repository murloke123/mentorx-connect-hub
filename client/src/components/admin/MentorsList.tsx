import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Users, BookOpen, AlertCircle } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { deleteUser, MentorWithStats } from "@/services/adminService";



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
                    <img src={mentor.avatar_url} alt={mentor.full_name} className="w-10 h-10 rounded-full object-cover" />
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
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-3 h-12 mb-3">
                {mentor.bio || 'Este mentor não possui biografia.'}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <BookOpen className="h-3 w-3" /> 
                  <span>{mentor.courses_count} cursos</span>
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
