import { Calendar, CheckCircle, Clock, Globe, Plus, User, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase';
import { findTimezoneByValue } from '../utils/timezones';
import CreateScheduleModal from './CreateScheduleModal';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

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
  mentee_role: 'admin' | 'mentor' | 'mentorado';
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

interface SchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  mentorId: string;
  mentorName: string;
  settings: CalendarSettings;
  onAppointmentChange?: () => void;
}

const SchedulesModal: React.FC<SchedulesModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  mentorId,
  mentorName,
  settings,
  onAppointmentChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Remove segundos se houver
  };

  const getMentorTimezoneLabel = () => {
    const timezone = findTimezoneByValue(settings.timezone);
    return timezone ? timezone.label : settings.timezone;
  };

  const loadAppointments = async () => {
    if (!selectedDate || !mentorId) return;

    // Função para formatar data local sem problemas de fuso horário
    const formatDateForDatabase = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDateForDatabase(selectedDate);
    console.log('🔄 [loadAppointments] Carregando agendamentos para:', {
      selectedDate: selectedDate,
      formattedDate: formattedDate,
      mentorId: mentorId,
      dateType: typeof formattedDate,
      mentorIdType: typeof mentorId,
      dateDebug: {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate(),
        isoString: selectedDate.toISOString(),
        isoSplit: selectedDate.toISOString().split('T')[0]
      }
    });

    setLoading(true);
    try {
      // Primeiro, vamos buscar TODOS os agendamentos para debug
      const { data: allData, error: allError } = await supabase
        .from('calendar')
        .select('*')
        .eq('mentor_id', mentorId);

      console.log('🔍 [loadAppointments] TODOS os agendamentos do mentor:', allData);

      // Agora buscar apenas do dia específico
      const { data, error } = await supabase
        .from('calendar')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('scheduled_date', formattedDate)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ [loadAppointments] Erro:', error);
        toast({
          title: "Erro ao carregar agendamentos",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ [loadAppointments] Agendamentos do dia específico:', {
          searchDate: formattedDate,
          found: data,
          count: data?.length || 0
        });
        setAppointments(data || []);
      }
    } catch (err) {
      console.error('💥 [loadAppointments] Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedDate && mentorId) {
      loadAppointments();
    }
  }, [isOpen, selectedDate, mentorId]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadAppointments(); // Recarregar agendamentos do dia
    
    // Notificar a página principal para atualizar a lista completa
    if (onAppointmentChange) {
      onAppointmentChange();
    }
    
    toast({
      title: "Agendamento realizado!",
      description: "Seu agendamento foi criado com sucesso."
    });
  };



  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamento com {mentorName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cabeçalho com data do agendamento */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Data: {selectedDate.toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Horário: {settings.startTime} às {settings.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Fuso: {getMentorTimezoneLabel()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de agendamentos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Agendamentos ({appointments.length})
              </h3>
              {/* Ocultar botão se o usuário atual for o próprio mentor */}
              {user?.id !== mentorId && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agendar
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando agendamentos...</span>
              </div>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum agendamento para este dia</p>
                  {user?.id !== mentorId && (
                    <p className="text-sm text-gray-500 mt-1">
                      Clique em "Agendar" para criar um novo agendamento
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span>{appointment.mentee_name} - {appointment.mentee_role === 'mentor' ? 'Mentor' : 'Mentorado'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow hover:bg-primary/80 ${
                            appointment.status === 'scheduled' 
                              ? 'bg-gray-100 text-gray-800 border-gray-200 border'
                              : appointment.status === 'completed'
                              ? 'bg-green-100 text-green-800 border-green-200 border'
                              : 'bg-red-100 text-red-800 border-red-200 border'
                          }`}>
                            <div className="flex items-center gap-1">
                              {appointment.status === 'scheduled' && <CheckCircle className="h-4 w-4" />}
                              {appointment.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                              {appointment.status === 'cancelled' && <XCircle className="h-4 w-4" />}
                              <span>
                                {appointment.status === 'scheduled' && 'Agendado'}
                                {appointment.status === 'completed' && 'Concluído'}
                                {appointment.status === 'cancelled' && 'Cancelado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Observações: {appointment.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de criação de agendamento */}
        {showCreateModal && (
          <CreateScheduleModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
            selectedDate={selectedDate}
            mentorId={mentorId}
            mentorName={mentorName}
            settings={settings}
            existingAppointments={appointments}
          />
        )}


      </DialogContent>
    </Dialog>
  );
};

export default SchedulesModal; 