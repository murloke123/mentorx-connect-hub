import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import {
    canProcessAppointmentPayment,
    startAppointmentCheckout,
    type AppointmentInputData
} from '../services/appointmentStripeService';
import { notifyNewAppointment } from '../services/notificationService';
import { supabase } from '../utils/supabase';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CalendarSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  timezone: string;
  price?: number;
}

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

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: Date;
  mentorId: string;
  mentorName: string;
  settings: CalendarSettings;
  existingAppointments: Appointment[];
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  mentorId,
  mentorName,
  settings,
  existingAppointments
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Função para formatar data local sem problemas de fuso horário
  const formatDateForDatabase = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para obter o role do usuário e redirecionar
  const redirectToMyAppointments = async () => {
    try {
      if (user?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();
        
        if (profile?.role === 'mentor') {
          navigate('/mentor/agendamentos-adquiridos');
        } else {
          navigate('/mentorado/meus-agendamentos');
        }
      } else {
        navigate('/mentorado/meus-agendamentos');
      }
    } catch (error) {
      console.error('Erro ao obter role do usuário:', error);
      navigate('/mentorado/meus-agendamentos');
    }
  };

  // Função auxiliar para calcular duração da sessão
  const calculateSessionDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60)); // Retorna em minutos
  };

  // Função para processar pagamento de agendamento
  const processAppointmentPayment = async () => {
    if (!user) return false;

    // Verificar se o agendamento pode ser pago
    const appointmentPrice = settings.price || 0;
    const { canPay, reason } = await canProcessAppointmentPayment(mentorId, appointmentPrice);

    if (!canPay) {
      console.log('💡 [processAppointmentPayment] Não precisa processar pagamento:', reason);
      return false; // Não precisa processar pagamento
    }

    // Buscar informações do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Erro ao buscar informações do usuário');
    }

    // Preparar dados do agendamento para checkout
    const appointmentData: AppointmentInputData = {
      mentorId,
      mentorName,
      menteeName: profile.full_name || 'Usuário',
      scheduledDate: formatDateForDatabase(selectedDate),
      startTime: startTime + ':00',
      endTime: endTime + ':00',
      sessionDuration: calculateSessionDuration(startTime, endTime),
      price: appointmentPrice,
      notes: notes.trim() || undefined
    };

    console.log('🛒 [processAppointmentPayment] Iniciando checkout:', appointmentData);

    // Iniciar checkout
    const checkoutResult = await startAppointmentCheckout(
      appointmentData,
      user.id,
      profile.email || user.email || ''
    );

    if (!checkoutResult.success) {
      throw new Error(checkoutResult.error || 'Erro ao iniciar checkout');
    }

    console.log('✅ [processAppointmentPayment] Checkout criado:', checkoutResult);

    // Redirecionar para o checkout
    if (checkoutResult.sessionUrl) {
      window.location.href = checkoutResult.sessionUrl;
      return true; // Pagamento processado
    }

    throw new Error('URL de checkout não encontrada');
  };

  // Função para criar agendamento gratuito
  const createFreeAppointment = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para agendar",
        variant: "destructive"
      });
      return;
    }

    const formattedDate = formatDateForDatabase(selectedDate);
    
    console.log('💾 [createFreeAppointment] Criando agendamento gratuito:', {
      mentee_id: user.id,
      mentor_id: mentorId,
      date: formattedDate,
      selectedDate: selectedDate,
      startTime,
      endTime,
      price: settings.price || 0
    });

    try {
      // Buscar informações do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Erro ao buscar informações do usuário');
      }

      console.log('👤 [createFreeAppointment] Profile do usuário:', JSON.stringify(profile, null, 2));

      // Funções auxiliares para formatação
      const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      };

      const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
      };

      console.log('🎥 [createFreeAppointment] Gerando link Jitsi Meet...');
      
      // Gerar link Jitsi Meet
      let meetLink = '';
      try {
        const jitsiResponse = await fetch('/api/jitsi-meet/create-appointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mentor: {
              nome: mentorName
            },
            mentorado: {
              nome: profile.full_name || 'Usuário'
            },
            dataInicio: `${formattedDate}T${startTime}:00`,
            dataFim: `${formattedDate}T${endTime}:00`
          })
        });

        if (jitsiResponse.ok) {
          const jitsiData = await jitsiResponse.json();
          meetLink = jitsiData.data?.linkMeet || '';
          console.log('✅ [createFreeAppointment] Link Jitsi criado:', meetLink);
        } else {
          console.error('❌ [createFreeAppointment] Erro ao gerar link Jitsi:', await jitsiResponse.text());
        }
      } catch (jitsiError) {
        console.error('❌ [createFreeAppointment] Erro ao gerar link Jitsi:', jitsiError);
      }

      const appointmentData = {
        mentee_id: user.id,
        mentee_name: profile.full_name || 'Usuário',
        mentor_id: mentorId,
        mentor_name: mentorName,
        scheduled_date: formattedDate,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        status: 'scheduled',
        notes: notes.trim() || null,
        meet_link: meetLink,
        price: settings.price || 0,
        payment_status: 'free' // Agendamento gratuito
      };

      console.log('📊 [createFreeAppointment] Dados do agendamento:', appointmentData);

      const { data, error } = await supabase
        .from('calendar')
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        console.error('❌ [createFreeAppointment] Erro:', error);
        throw new Error(error.message);
      }

      console.log('✅ [createFreeAppointment] Agendamento criado:', data);
      
      // Criar notificação para o mentor sobre o novo agendamento
      console.log('🔔 [createFreeAppointment] Criando notificação para o mentor...');
      try {
        await notifyNewAppointment({
          receiverId: mentorId,
          receiverName: mentorName,
          senderId: user.id,
          senderName: profile.full_name || 'Usuário',
          appointmentDate: formatDate(formattedDate),
          appointmentTime: `${formatTime(startTime + ':00')} - ${formatTime(endTime + ':00')}`,
        });
        console.log('✅ [createFreeAppointment] Notificação criada com sucesso');
      } catch (notificationError) {
        console.error('⚠️ [createFreeAppointment] Erro ao criar notificação:', notificationError);
      }

      // Enviar e-mails de confirmação
      await sendAppointmentEmails(profile, formattedDate, meetLink);

      // Redirecionar para a página de agendamentos
      await redirectToMyAppointments();
      
      onSuccess();
    } catch (error) {
      console.error('❌ [createFreeAppointment] Erro:', error);
      throw error;
    }
  };

  // Função para enviar e-mails de confirmação
  const sendAppointmentEmails = async (profile: any, formattedDate: string, meetLink: string) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    const formatTime = (timeString: string) => {
      return timeString.substring(0, 5);
    };

    // Enviar e-mail para o mentor
    try {
      console.log('📧 [sendAppointmentEmails] Enviando e-mail para o mentor...');
      const emailData = {
        mentorId: mentorId,
        mentorName: mentorName,
        menteeName: profile.full_name || 'Usuário',
        appointmentDate: formatDate(formattedDate),
        appointmentTime: `${formatTime(startTime + ':00')} - ${formatTime(endTime + ':00')}`,
        timezone: 'America/Sao_Paulo (UTC-3)',
        notes: notes.trim() || undefined,
        meetLink: meetLink || undefined
      };

      const emailResponse = await fetch('/api/calendar/new-appointment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json();
        console.log('✅ [sendAppointmentEmails] E-mail do mentor enviado:', emailResult.messageId);
      } else {
        console.error('⚠️ [sendAppointmentEmails] Falha no envio do e-mail do mentor');
      }
    } catch (emailError) {
      console.error('💥 [sendAppointmentEmails] Erro crítico no envio de e-mail do mentor:', emailError);
    }

    // Enviar e-mail para o mentorado
    try {
      console.log('📧 [sendAppointmentEmails] Enviando e-mail para o mentorado...');
      const menteeEmailData = {
        mentorName: mentorName,
        menteeName: profile.full_name || 'Usuário',
        menteeEmail: profile.email || user?.email,
        appointmentDate: formatDate(formattedDate),
        appointmentTime: `${formatTime(startTime + ':00')} - ${formatTime(endTime + ':00')}`,
        timezone: 'America/Sao_Paulo (UTC-3)',
        notes: notes.trim() || undefined,
        meetLink: meetLink || undefined
      };

      const menteeEmailResponse = await fetch('/api/calendar/new-appointment-email/mentee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menteeEmailData),
      });

      if (menteeEmailResponse.ok) {
        const menteeEmailResult = await menteeEmailResponse.json();
        console.log('✅ [sendAppointmentEmails] E-mail do mentorado enviado:', menteeEmailResult.messageId);
      } else {
        console.error('⚠️ [sendAppointmentEmails] Falha no envio do e-mail do mentorado');
      }
    } catch (menteeEmailError) {
      console.error('💥 [sendAppointmentEmails] Erro crítico no envio de e-mail do mentorado:', menteeEmailError);
    }
  };

  // Gerar opções de horário baseadas nas configurações do mentor
  const generateTimeOptions = () => {
    const options = [];
    const startHour = parseInt(settings.startTime.split(':')[0]);
    const startMinute = parseInt(settings.startTime.split(':')[1]);
    const endHour = parseInt(settings.endTime.split(':')[0]);
    const endMinute = parseInt(settings.endTime.split(':')[1]);

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > endMinute) break;
        if (hour === startHour && minute < startMinute) continue;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Verificar se um horário específico está ocupado
  const isTimeOccupied = (time: string) => {
    return existingAppointments.some(appointment => {
      if (appointment.status === 'cancelled') return false;
      
      const appointmentStart = appointment.start_time.substring(0, 5);
      const appointmentEnd = appointment.end_time.substring(0, 5);
      
      return time >= appointmentStart && time < appointmentEnd;
    });
  };

  // Filtrar horários disponíveis para início
  const getAvailableStartTimes = () => {
    return timeOptions.filter(time => !isTimeOccupied(time));
  };

  // Filtrar horários disponíveis para fim
  const getAvailableEndTimes = () => {
    if (!startTime) return [];
    
    const occupiedTimes = new Set<string>();
    
    existingAppointments.forEach(appointment => {
      if (appointment.status === 'cancelled') return;
      
      const appointmentStart = appointment.start_time.substring(0, 5);
      const appointmentEnd = appointment.end_time.substring(0, 5);
      
      timeOptions.forEach(time => {
        if (time >= appointmentStart && time < appointmentEnd) {
          occupiedTimes.add(time);
        }
      });
    });
    
    const availableEndTimes = timeOptions.filter(time => {
      if (time <= startTime) return false;
      if (occupiedTimes.has(time)) return false;
      
      const hasOccupiedSlotInBetween = timeOptions.some(slotTime => {
        return slotTime > startTime && slotTime < time && occupiedTimes.has(slotTime);
      });
      
      if (hasOccupiedSlotInBetween) return false;
      
      return true;
    });
    
    return availableEndTimes;
  };

  const isTimeSlotAvailable = (start: string, end: string) => {
    if (!start || !end) return true;
    
    return !existingAppointments.some(appointment => {
      if (appointment.status === 'cancelled') return false;
      
      const appointmentStart = appointment.start_time.substring(0, 5);
      const appointmentEnd = appointment.end_time.substring(0, 5);
      
      return (start < appointmentEnd && end > appointmentStart);
    });
  };

  const handleSchedule = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para agendar",
        variant: "destructive"
      });
      return;
    }

    if (!startTime || !endTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o horário de início e fim",
        variant: "destructive"
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Horário inválido",
        description: "O horário de fim deve ser posterior ao horário de início",
        variant: "destructive"
      });
      return;
    }

    if (!isTimeSlotAvailable(startTime, endTime)) {
      toast({
        title: "Horário indisponível",
        description: "Este horário conflita com um agendamento existente",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const appointmentPrice = settings.price || 0;
      console.log('🔄 [handleSchedule] Processando agendamento...', {
        mentorId,
        mentorName,
        appointmentPrice
      });

      // ✅ VALIDAÇÃO CRÍTICA: Verificar se o mentor pode receber pagamentos
      if (appointmentPrice > 0) {
        const { canPay, reason } = await canProcessAppointmentPayment(mentorId, appointmentPrice);
        
        if (!canPay) {
          console.warn('🚫 [handleSchedule] Mentor não pode receber pagamentos:', reason);
          toast({
            title: "Agendamento indisponível",
            description: `Este mentor está impossibilitado de receber agendamentos pagos. Motivo: ${reason}`,
            variant: "destructive"
          });
          return;
        }

        // Mentor pode receber pagamentos - processar checkout
        const needsPayment = await processAppointmentPayment();
        
        if (needsPayment) {
          // Pagamento foi processado, usuário será redirecionado para checkout
          console.log('💳 [handleSchedule] Usuário redirecionado para checkout');
          return;
        }
      }

      // Criar agendamento gratuito (price = 0 OU mentor sem Stripe configurado)
      await createFreeAppointment();

      toast({
        title: "Agendamento realizado!",
        description: "Seu agendamento foi criado com sucesso."
      });

    } catch (err) {
      console.error('💥 [handleSchedule] Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: err instanceof Error ? err.message : "Não foi possível criar o agendamento",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const appointmentPrice = settings.price || 0;
  const isPaid = appointmentPrice > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center shadow-lg">
              <Plus className="h-4 w-4 text-slate-900" />
            </div>
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gold/10 p-3 rounded-lg border border-gold/30">
            <p className="text-sm text-gold">
              <strong>Data selecionada:</strong> {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Mostrar informações de preço se for pago */}
          {isPaid && (
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-400">
                <strong>Valor da mentoria:</strong> R$ {appointmentPrice.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-green-300 mt-1">
                Você será redirecionado para o pagamento após confirmar o agendamento
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Horário de Início</label>
            <Select value={startTime} onValueChange={(value) => {
              setStartTime(value);
              setEndTime('');
            }}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Selecione o horário de início" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-700">
                {getAvailableStartTimes().map((time) => (
                  <SelectItem key={time} value={time} className="text-white hover:bg-slate-700">
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Horário de Fim</label>
            <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder={startTime ? "Selecione o horário de fim" : "Primeiro selecione o horário de início"} />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-700">
                {getAvailableEndTimes().length > 0 ? (
                  getAvailableEndTimes().map((time) => (
                    <SelectItem key={time} value={time} className="text-white hover:bg-slate-700">
                      {time}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-400">
                    Nenhum horário disponível para este início
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Observações (opcional)</label>
            <textarea
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md resize-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-slate-600"
              rows={3}
              placeholder="Adicione observações sobre o agendamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {startTime && endTime && !isTimeSlotAvailable(startTime, endTime) && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-sm text-red-400">
                ⚠️ Este horário conflita com um agendamento existente
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              className="flex-1 bg-gradient-to-r from-gold via-gold-light to-gold-dark hover:from-gold-dark hover:via-gold hover:to-gold-light text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={saving || !startTime || !endTime || !isTimeSlotAvailable(startTime, endTime)}
            >
              {saving ? 'Processando...' : (isPaid ? 'Pagar e Agendar' : 'Agendar')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleModal;