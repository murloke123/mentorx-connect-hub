import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Bell, User } from 'lucide-react';

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
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Parabéns! 🎉
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirmação de que você começou a seguir o mentor
          </DialogDescription>
        </DialogHeader>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Você agora está seguindo{' '}
            <span className="font-semibold text-gray-900">{mentorName}</span>!
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900 mb-1">
                  Notificações Ativadas
                </h4>
                <p className="text-sm text-blue-700">
                  O mentor será notificado que você começou a segui-lo e você receberá 
                  atualizações sobre novos cursos e conteúdos.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-amber-900 mb-1">
                  Acesso Exclusivo
                </h4>
                <p className="text-sm text-amber-700">
                  Agora você tem acesso aos cursos e conteúdos exclusivos deste mentor.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onClose}
            className="w-full"
          >
            Continuar Explorando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 