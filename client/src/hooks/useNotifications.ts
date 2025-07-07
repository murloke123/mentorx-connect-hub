import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useState } from 'react';
import { Notification } from '../types/database';
import { supabase } from '../utils/supabase';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar notificações do usuário (mentor)
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      });
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas",
        variant: "destructive",
      });
    }
  };

  // Deletar todas as notificações
  const deleteAllNotifications = async () => {
    try {
      console.log('Tentando deletar notificações para usuário:', userId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('receiver_id', userId);

      if (error) throw error;

      // Atualizar estado local
      setNotifications([]);
      setUnreadCount(0);

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram deletadas",
      });
    } catch (error) {
      console.error('Erro ao deletar todas as notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar as notificações",
        variant: "destructive",
      });
    }
  };

  // Buscar notificações quando o userId mudar
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Configurar real-time subscription
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
  };
}; 