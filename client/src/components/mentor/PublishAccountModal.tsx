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
import { CheckCircle, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PublishAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: () => void;
}

interface VerifiedStatus {
  elogios: boolean;
  calendario: boolean;
  meus_cursos: boolean;
  cards_sucesso: boolean;
  por_que_me_seguir: boolean;
}

export const PublishAccountModal: React.FC<PublishAccountModalProps> = ({
  isOpen,
  onClose,
  onPublishSuccess,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<VerifiedStatus | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { toast } = useToast();

  // Mapear campos para nomes de seções
  const fieldToSectionMap: Record<string, string> = {
    elogios: 'O que dizem meus mentorados ...',
    calendario: 'Agende uma Conversa',
    meus_cursos: 'Meus Cursos',
    cards_sucesso: 'Cards de Sucesso',
    por_que_me_seguir: 'Por que me seguir'
  };

  useEffect(() => {
    if (isOpen) {
      checkVerificationStatus();
    }
  }, [isOpen]);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar o campo verified do perfil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('verified')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      const verified = profile?.verified || {};
      
      // Mapear os campos do banco para o formato esperado
      const status: VerifiedStatus = {
        elogios: verified.elogios || false,
        calendario: verified.calendario || false,
        meus_cursos: verified.meus_cursos || false,
        cards_sucesso: verified.cards_sucesso || false,
        por_que_me_seguir: verified.por_que_me_seguir || false
      };

      setVerifiedStatus(status);

      // Verificar se todos os campos estão como true
      const allVerified = Object.values(status).every(value => value === true);
      setCanPublish(allVerified);

      // Identificar campos faltantes
      const missing = Object.entries(status)
        .filter(([_, value]) => !value)
        .map(([key, _]) => fieldToSectionMap[key]);
      
      setMissingFields(missing);

    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast({
        title: 'Erro ao verificar status',
        description: 'Não foi possível verificar o status de verificação.',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    if (!canPublish) {
      return;
    }

    try {
      setIsPublishing(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Usar o serviço para atualizar o status público
      await updateMentorPublicStatus(user.id, true);
      
      toast({
        title: 'Conta publicada com sucesso!',
        description: 'Sua conta agora está visível para o público.',
      });
      
      // Chamar callback de sucesso se fornecido
      if (onPublishSuccess) {
        onPublishSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao publicar conta:', error);
      toast({
        title: 'Erro ao publicar conta',
        description: 'Ocorreu um erro ao tentar publicar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const renderConfirmationDialog = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center text-white">
          Confirmar Publicação
        </DialogTitle>
        <DialogDescription className="text-center text-gray-300">
          Deseja confirmar a publicação da sua conta?
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Alert className="bg-green-500/10 border-green-500/30 backdrop-blur-sm">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Todas as seções foram verificadas com sucesso! Sua conta está pronta para ser publicada.
          </AlertDescription>
        </Alert>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="w-full sm:w-auto bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30"
          disabled={isPublishing}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handlePublish}
          className="w-full sm:w-auto bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:to-gold text-black font-semibold shadow-lg"
          disabled={isPublishing}
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : (
            'Sim'
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderErrorDialog = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center text-red-400">
          Não é possível publicar ainda
        </DialogTitle>
        <DialogDescription className="text-center text-gray-300">
          {missingFields.length === 1 
            ? `Você não pode publicar ainda sua conta porque a seção "${missingFields[0]}" não está verificada.`
            : `Você não pode publicar ainda sua conta porque as seções "${missingFields.slice(0, -1).join('", "')}" e "${missingFields[missingFields.length - 1]}" não estão verificadas.`
          }
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
          <X className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            Complete as verificações necessárias antes de publicar sua conta.
          </AlertDescription>
        </Alert>

        {/* Lista de seções não verificadas */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 backdrop-blur-sm">
          <h4 className="font-medium text-white mb-3">Seções que precisam ser verificadas:</h4>
          <ul className="space-y-2">
            {missingFields.map((section, index) => (
              <li key={index} className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-gray-300 font-medium">{section}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DialogFooter className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="w-full sm:w-auto bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30"
        >
          Entendi
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        {verifiedStatus === null ? (
          // Loading state
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : canPublish ? (
          renderConfirmationDialog()
        ) : (
          renderErrorDialog()
        )}
      </DialogContent>
    </Dialog>
  );
};