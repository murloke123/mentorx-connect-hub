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
  cards_sucesso: boolean;
  meu_perfil: boolean;
  por_que_me_seguir: boolean;
  meus_cursos: boolean;
  elogios: boolean;
  calendario: boolean;
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
  const [hasAvatar, setHasAvatar] = useState(false);
  const { toast } = useToast();

  // Mapeamento dos campos do banco para nomes das seções
  const fieldToSectionMap: Record<string, string> = {
    cards_sucesso: 'Cards de Sucesso',
    meu_perfil: 'Meu Perfil',
    por_que_me_seguir: 'Por que me seguir?',
    meus_cursos: 'Meus Cursos',
    elogios: 'O que dizem meus mentorados ...',
    calendario: 'Agenda uma Conversa'
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

      // Buscar o campo verified e avatar_url do perfil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('verified, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      const verified = profile?.verified || {};
      const avatarUrl = profile?.avatar_url;
      
      // Verificar se tem avatar
      const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '';
      setHasAvatar(hasValidAvatar);
      
      // Mapear os campos do banco para o formato esperado
      const status: VerifiedStatus = {
        cards_sucesso: verified.cards_sucesso || false,
        meu_perfil: verified.meu_perfil || false,
        por_que_me_seguir: verified.por_que_me_seguir || false,
        meus_cursos: verified.meus_cursos || false,
        elogios: verified.elogios || false,
        calendario: verified.calendario || false
      };

      setVerifiedStatus(status);

      // Verificar se todos os campos estão como true E se tem avatar
      const allVerified = Object.values(status).every(value => value === true);
      const canPublishAccount = allVerified && hasValidAvatar;
      setCanPublish(canPublishAccount);

      // Identificar campos faltantes
      const missing = Object.entries(status)
        .filter(([_, value]) => !value)
        .map(([key, _]) => fieldToSectionMap[key]);
      
      // Adicionar avatar se não tiver
      if (!hasValidAvatar) {
        missing.push('Foto de Avatar');
      }
      
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
            Todas as seções foram verificadas e sua foto de avatar foi adicionada com sucesso! Sua conta está pronta para ser publicada.
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
          Você não pode publicar ainda sua conta porque alguns requisitos não foram atendidos.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
          <X className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {(() => {
              const sectionsToVerify = missingFields.filter(field => field !== 'Foto de Avatar');
              const needsAvatar = missingFields.includes('Foto de Avatar');
              
              if (sectionsToVerify.length > 0 && needsAvatar) {
                return 'Complete as verificações necessárias e adicione uma foto de avatar antes de publicar sua conta.';
              } else if (sectionsToVerify.length > 0) {
                return 'Complete as verificações necessárias antes de publicar sua conta.';
              } else if (needsAvatar) {
                return 'Adicione uma foto de avatar antes de publicar sua conta.';
              }
              return 'Complete os requisitos necessários antes de publicar sua conta.';
            })()}
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