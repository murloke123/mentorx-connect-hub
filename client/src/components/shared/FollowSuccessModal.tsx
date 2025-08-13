import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Bell, CheckCircle, User } from 'lucide-react';
import React from 'react';

interface FollowSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
}

export const FollowSuccessModal: React.FC<FollowSuccessModalProps> = ({
  isOpen,
  onClose,
  mentorName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-700 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 via-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            Parabéns! 🎉
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirmação de que você começou a seguir o mentor
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 text-center space-y-4">
          <p className="text-gray-300">
            Você agora está seguindo{' '}
            <span className="font-semibold text-gold">{mentorName}</span>!
          </p>

          <div className="bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-blue-500/10 border border-blue-400/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-medium text-white mb-1">
                  Notificações Ativadas
                </h4>
                <p className="text-sm text-gray-300">
                  O mentor será notificado que você começou a segui-lo e você receberá 
                  atualizações sobre novos cursos e conteúdos.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gold/10 via-gold-light/5 to-gold/10 border border-gold/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-full flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-slate-900" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-medium text-white mb-1">
                  Acesso Exclusivo
                </h4>
                <p className="text-sm text-gray-300">
                  Agora você tem acesso aos cursos e conteúdos exclusivos deste mentor.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-light hover:to-gold text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Continuar Explorando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};