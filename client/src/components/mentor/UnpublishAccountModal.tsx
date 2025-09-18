import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateMentorPublicStatus } from "@/services/mentorService";
import { supabase } from "@/utils/supabase";
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useState } from "react";

interface UnpublishAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnpublishSuccess?: () => void;
}

export const UnpublishAccountModal: React.FC<UnpublishAccountModalProps> = ({
  isOpen,
  onClose,
  onUnpublishSuccess,
}) => {
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const { toast } = useToast();

  const handleUnpublish = async () => {
    try {
      setIsUnpublishing(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Usar o serviço para atualizar o status público para false
      await updateMentorPublicStatus(user.id, false);
      
      toast({
        title: "Conta despublicada com sucesso!",
        description: "Sua conta não está mais visível para o público.",
      });
      
      // Chamar callback de sucesso se fornecido
      if (onUnpublishSuccess) {
        onUnpublishSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Erro ao despublicar conta:", error);
      toast({
        title: "Erro ao despublicar conta",
        description: "Ocorreu um erro ao tentar despublicar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Despublicar Conta
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Você realmente deseja despublicar sua conta?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-yellow-500/10 border-yellow-500/30 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              Sua conta não ficará mais visível para o público e não aparecerá nas páginas de mentores.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30"
            disabled={isUnpublishing}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUnpublish}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg"
            disabled={isUnpublishing}
          >
            {isUnpublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Despublicando...
              </>
            ) : (
              'Sim'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};