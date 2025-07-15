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
import { updateMentorPublicStatus } from '@/services/mentorService';
import { supabase } from '@/utils/supabase';
import { AlertTriangle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

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
        throw new Error('Usuário não autenticado');
      }
      
      // Usar o serviço para atualizar o status público para false
      await updateMentorPublicStatus(user.id, false);
      
      toast({
        title: 'Conta despublicada com sucesso!',
        description: 'Sua conta não está mais visível para o público.',
      });
      
      // Chamar callback de sucesso se fornecido
      if (onUnpublishSuccess) {
        onUnpublishSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao despublicar conta:', error);
      toast({
        title: 'Erro ao despublicar conta',
        description: 'Ocorreu um erro ao tentar despublicar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Despublicar Conta
          </DialogTitle>
          <DialogDescription className="text-center">
            Você realmente deseja despublicar sua conta?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Sua conta não ficará mais visível para o público e não aparecerá nas páginas de mentores.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isUnpublishing}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUnpublish}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white"
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