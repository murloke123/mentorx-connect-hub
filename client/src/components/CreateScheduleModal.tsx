import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
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

  const isTimeSlotAvailable = (start: string, end: string) => {
    if (!start || !end) return true;
    
    return !existingAppointments.some(appointment => {
      if (appointment.status === 'cancelled') return false;
      
      const appointmentStart = appointment.start_time.substring(0, 5);
      const appointmentEnd = appointment.end_time.substring(0, 5);
      
      // Verifica se há sobreposição
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

    const formattedDate = formatDateForDatabase(selectedDate);
    
    console.log('💾 [handleSchedule] Criando agendamento:', {
      mentee_id: user.id,
      mentor_id: mentorId,
      date: formattedDate,
      selectedDate: selectedDate,
      startTime,
      endTime
    });

    setSaving(true);
    try {
      // Buscar informações do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Erro ao buscar informações do usuário');
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
        notes: notes.trim() || null
      };

      console.log('📊 [handleSchedule] Dados do agendamento:', {
        appointmentData,
        formattedDate,
        selectedDate: selectedDate,
        dateComparison: {
          formattedDate,
          selectedDateISO: selectedDate.toISOString().split('T')[0],
          isEqual: formattedDate === selectedDate.toISOString().split('T')[0]
        }
      });

      const { data, error } = await supabase
        .from('calendar')
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        console.error('❌ [handleSchedule] Erro:', error);
        toast({
          title: "Erro ao agendar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ [handleSchedule] Agendamento criado:', data);
        onSuccess();
      }
    } catch (err) {
      console.error('💥 [handleSchedule] Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar o agendamento",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Data selecionada:</strong> {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horário de Início</label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário de início" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horário de Fim</label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário de fim" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={3}
              placeholder="Adicione observações sobre o agendamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {startTime && endTime && !isTimeSlotAvailable(startTime, endTime) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                ⚠️ Este horário conflita com um agendamento existente
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              className="flex-1"
              disabled={saving || !startTime || !endTime || !isTimeSlotAvailable(startTime, endTime)}
            >
              {saving ? 'Agendando...' : 'Agendar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleModal; 