import { AlertTriangle, X } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { notifyScheduleCancelledByMentor } from "@/services/notificationService";
import { supabase } from '../utils/supabase';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Appointment {
  id: string;
  mentee_id: string;
  mentee_name: string;
  mentor_id: string;
  mentor_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: Appointment | null;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appointment
}) => {
  const { toast } = useToast();
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCancel = async () => {
    if (!appointment) return;

    if (!cancellationReason.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o motivo do cancelamento",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 [CancelAppointment] Iniciando cancelamento:', {
      appointmentId: appointment.id,
      appointmentIdType: typeof appointment.id,
      appointmentIdLength: appointment.id.length,
      mentorName: appointment.mentor_name,
      menteeName: appointment.mentee_name,
      appointmentDate: formatDate(appointment.scheduled_date),
      appointmentTime: `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`,
      cancellationReason: cancellationReason.trim(),
      fullAppointmentObject: appointment
    });

    setCancelling(true);
    try {
      // Atualizar o agendamento no banco
      console.log('📊 [CancelAppointment] Atualizando status no banco...');
      const { error } = await supabase
        .from('calendar')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (error) {
        console.error('❌ [CancelAppointment] Erro ao cancelar:', error);
        toast({
          title: "Erro ao cancelar agendamento",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ [CancelAppointment] Status atualizado com sucesso no banco');

      // Criar notificação para o mentorado
      console.log('🔔 [CancelAppointment] Criando notificação para o mentorado...');
      try {
        await notifyScheduleCancelledByMentor({
          receiverId: appointment.mentee_id,
          receiverName: appointment.mentee_name,
          senderId: appointment.mentor_id,
          senderName: appointment.mentor_name,
          appointmentDate: formatDate(appointment.scheduled_date),
          appointmentTime: `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`,
          reason: cancellationReason.trim(),
        });
        console.log('✅ [CancelAppointment] Notificação criada com sucesso');
      } catch (notificationError) {
        console.error('⚠️ [CancelAppointment] Erro ao criar notificação:', notificationError);
        // Não bloquear o cancelamento por erro na notificação
      }

      // Enviar email de cancelamento
      console.log('📧 [CancelAppointment] Preparando dados para envio de email...');
      const emailPayload = {
        appointmentId: appointment.id,
        mentorName: appointment.mentor_name,
        menteeName: appointment.mentee_name,
        appointmentDate: formatDate(appointment.scheduled_date),
        appointmentTime: `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`,
        cancellationReason: cancellationReason.trim()
      };

      console.log('📤 [CancelAppointment] Enviando requisição para API de email:', emailPayload);

      try {
        const response = await fetch('/api/calendar/cancel-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        console.log('📥 [CancelAppointment] Resposta da API de email:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        const responseData = await response.json();
        console.log('📋 [CancelAppointment] Dados da resposta:', responseData);

        if (!response.ok) {
          console.error('⚠️ [CancelAppointment] Falha no envio do email:', {
            status: response.status,
            data: responseData
          });
          
          // Mostrar toast de aviso, mas não bloquear o cancelamento
          toast({
            title: "Agendamento cancelado com aviso",
            description: "O agendamento foi cancelado e o mentorado foi notificado na plataforma. Houve problema no envio do email.",
            variant: "destructive"
          });
        } else {
          console.log('✅ [CancelAppointment] Email enviado com sucesso:', responseData);
          toast({
            title: "Agendamento cancelado",
            description: "O agendamento foi cancelado e o mentorado foi notificado por email e na plataforma."
          });
        }
      } catch (emailError) {
        console.error('💥 [CancelAppointment] Erro de rede/parsing no envio do email:', emailError);
        
        // Mostrar toast de aviso, mas não bloquear o cancelamento
        toast({
          title: "Agendamento cancelado com aviso",
          description: "O agendamento foi cancelado e o mentorado foi notificado na plataforma. Houve problema no envio do email.",
          variant: "destructive"
        });
      }

      // Sempre chamar onSuccess, independente do email
      onSuccess();
      onClose();

    } catch (err) {
      console.error('💥 [CancelAppointment] Erro inesperado no cancelamento:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível cancelar o agendamento",
        variant: "destructive"
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = () => {
    setCancellationReason('');
    onClose();
  };

  if (!isOpen || !appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Cancelar Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-2">
          {/* Detalhes do agendamento */}
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Agendamento a ser cancelado:</h4>
            <div className="text-sm text-red-700 space-y-1">
              <p><strong>Mentorado:</strong> {appointment.mentee_name}</p>
              <p><strong>Data:</strong> {formatDate(appointment.scheduled_date)}</p>
              <p><strong>Horário:</strong> {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</p>
            </div>
          </div>

          {/* Campo de motivo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Motivo do cancelamento <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px]"
              rows={4}
              placeholder="Explique o motivo do cancelamento para o mentorado..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {cancellationReason.length}/500 caracteres
            </p>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> O mentorado será notificado por email sobre o cancelamento.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={cancelling}
            >
              <X className="h-4 w-4 mr-2" />
              Manter Agendamento
            </Button>
            <Button
              onClick={handleCancel}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={cancelling || !cancellationReason.trim()}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppointmentModal; 