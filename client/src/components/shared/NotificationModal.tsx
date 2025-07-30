import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, Calendar, CheckCheck, Clock, Plus, Trash2, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types/database';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteAll: () => void;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case 'new_follower':
      return (
        <div className="flex items-center space-x-1">
          <Plus className="w-3 h-3 text-gold" />
          <User className="w-3 h-3 text-gold" />
        </div>
      );
    case 'lost_follower':
      return (
        <div className="flex items-center space-x-1">
          <X className="w-3 h-3 text-gold" />
          <User className="w-3 h-3 text-gold" />
        </div>
      );
    case 'schedule':
      return (
        <div className="flex items-center space-x-1">
          <Plus className="w-3 h-3 text-gold" />
          <Calendar className="w-3 h-3 text-gold" />
        </div>
      );
    case 'cancel_schedule':
      return (
        <div className="flex items-center space-x-1">
          <X className="w-3 h-3 text-gold" />
          <Calendar className="w-3 h-3 text-gold" />
        </div>
      );
    case 'appointment_cancelled':
      return (
        <div className="flex items-center space-x-1">
          <X className="w-3 h-3 text-gold" />
          <Clock className="w-3 h-3 text-gold" />
        </div>
      );
    case 'new_enrollment':
      return (
        <div className="flex items-center space-x-1">
          <CheckCheck className="w-3 h-3 text-gold" />
          <User className="w-3 h-3 text-gold" />
        </div>
      );
    case 'course_updated':
      return (
        <div className="flex items-center space-x-1">
          <Plus className="w-3 h-3 text-gold" />
          <CheckCheck className="w-3 h-3 text-gold" />
        </div>
      );
    default:
      return <User className="w-3 h-3 text-gold" />;
  }
};

const getActionColor = (type: string) => {
  switch (type) {
    case 'new_follower':
      return 'bg-green-50 border-green-200';
    case 'lost_follower':
      return 'bg-red-50 border-red-200';
    case 'schedule':
      return 'bg-blue-50 border-blue-200';
    case 'cancel_schedule':
      return 'bg-red-50 border-red-200';
    case 'appointment_cancelled':
      return 'bg-red-50 border-red-200';
    case 'new_enrollment':
      return 'bg-blue-50 border-blue-200';
    case 'course_updated':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteAll,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAll = () => {
    onDeleteAll();
    setShowDeleteConfirm(false);
  };

  const handleUserClick = (userId: string | null, senderRole: string | null) => {
    if (userId) {
      // Redirecionar baseado no sender_role
      if (senderRole === 'mentor') {
        navigate(`/mentor/publicview/${userId}`);
      } else if (senderRole === 'mentorado') {
        navigate(`/mentorado/publicview/${userId}`);
      } else {
        // Fallback para mentor se o role não estiver definido (compatibilidade com dados antigos)
        navigate(`/mentor/publicview/${userId}`);
      }
      onClose(); // Fechar modal após navegar
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-700">
          <DialogTitle className="text-lg font-semibold text-white flex items-center">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center mr-3 shadow-lg">
              <Bell className="h-4 w-4 text-slate-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            Notificações
          </DialogTitle>
          <DialogDescription className="sr-only">
            Lista de notificações do usuário
          </DialogDescription>
          <div className="flex items-center gap-2 mt-3">
            {unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas como lidas
              </Button>
            ) : notifications.length > 0 && (
              <div className="flex items-center text-sm text-gray-400">
                <CheckCheck className="w-4 h-4 mr-1 text-gold" />
                Nenhuma nova mensagem
              </div>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Deletar todas
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[400px] bg-slate-800/50">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Clock className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-sm text-gray-400">
                Você não tem notificações no momento.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer backdrop-blur-sm ${
                    notification.is_read
                      ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70'
                      : 'bg-gradient-to-r from-gold/10 via-gold-light/5 to-gold/10 border-gold/30 hover:border-gold/50 shadow-gold/20'
                  }`}
                  onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <div 
                        className="w-10 h-10 bg-gradient-to-br from-gold via-gold-light to-gold-dark rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 hover:shadow-lg shadow-gold/30"
                        onClick={() => handleUserClick(notification.sender_id || null, notification.sender_role || null)}
                        title={`Ver perfil de ${notification.sender_name || 'usuário'}`}
                      >
                        <span className="text-slate-900 text-sm font-bold">
                          {(notification.sender_name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                              {notification.message}
                            </p>
                            {notification.sender_name && (
                              <p className="text-xs text-gold mt-1 font-medium">
                                de {notification.sender_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 opacity-70">
                              {getActionIcon(notification.type)}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Confirmation Dialog for Delete All */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold mb-2 text-white">Confirmar exclusão</h3>
              <p className="text-gray-300 mb-4">
                Você realmente deseja deletar todas as suas notificações?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30"
                >
                  Não
                </Button>
                <Button
                  onClick={handleDeleteAll}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                >
                  Sim
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};