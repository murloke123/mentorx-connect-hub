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
import { GraduationCap, AlertCircle } from "lucide-react";
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
import { deleteUser, MentoradoWithStats } from "@/services/adminService";



interface MentoradosListProps {
  mentorados: MentoradoWithStats[];
  isLoading: boolean;
  onDelete?: () => void;
}

const MentoradosList = ({ mentorados, isLoading, onDelete }: MentoradosListProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMentorado, setSelectedMentorado] = useState<MentoradoWithStats | null>(null);
  const { toast } = useToast();
  
  const handleDeleteClick = (mentorado: MentoradoWithStats) => {
    setSelectedMentorado(mentorado);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedMentorado) return;
    
    try {
      await deleteUser(selectedMentorado.id);
      toast({
        title: "Usuário removido",
        description: `O mentorado "${selectedMentorado.full_name}" foi removido com sucesso.`,
      });
      setOpenDeleteDialog(false);
      if (onDelete) onDelete();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao tentar remover o usuário.";
      toast({
        variant: "destructive",
        title: "Erro ao remover usuário",
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

  if (mentorados.length === 0) {
    return (
      <Card className="w-full p-6 flex items-center justify-center bg-gray-50 border-dashed">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">Nenhum mentorado encontrado</h3>
          <p className="text-sm text-gray-500 mt-2">
            Não há mentorados cadastrados na plataforma.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mentorados.map((mentorado) => (
          <Card key={mentorado.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {mentorado.avatar_url ? (
                    <img src={mentorado.avatar_url} alt={mentorado.full_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <GraduationCap className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">{mentorado.full_name || "Usuário sem nome"}</CardTitle>
                  <CardDescription>{mentorado.id.slice(0, 8)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-3 h-12 mb-3">
                {mentorado.bio || 'Este usuário não possui biografia.'}
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  {mentorado.enrollments_count} cursos
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => handleDeleteClick(mentorado)}
              >
                Remover usuário
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
              Esta ação não pode ser desfeita. Isso removerá permanentemente o mentorado{" "}
              <strong>"{selectedMentorado?.full_name}"</strong> e todos os seus dados da plataforma.
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

export default MentoradosList;
