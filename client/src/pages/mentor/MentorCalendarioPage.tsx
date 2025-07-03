import AppointmentsList from "@/components/AppointmentsList";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import MentorCalendarComponent from "@/components/MentorCalendarComponent";
import MentorCalendarSettings from "@/components/MentorCalendarSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase";
import { detectUserTimezone } from "@/utils/timezones";
import { useEffect, useState } from "react";

interface CalendarSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  timezone: string;
}

const MentorCalendarioPage = () => {
  const { user } = useAuth();
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00',
    sessionDuration: 60,
    timezone: detectUserTimezone()
  });
  const [mentorName, setMentorName] = useState<string>('');
  const [refreshAppointments, setRefreshAppointments] = useState<number>(0);

  useEffect(() => {
    const loadMentorInfo = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar informações do mentor:', error);
        } else if (data) {
          setMentorName(data.full_name || 'Mentor');
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar mentor:', err);
      }
    };

    loadMentorInfo();
  }, [user]);

  const handleSettingsChange = (newSettings: CalendarSettings) => {
    setCalendarSettings(newSettings);
  };

  // Função para forçar atualização da lista de agendamentos
  const handleAppointmentChange = () => {
    console.log('🔄 [MentorCalendarioPage] Forçando atualização da lista de agendamentos');
    setRefreshAppointments(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Calendário</h1>
          
          {/* Layout com dois componentes lado a lado */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Lado esquerdo - Configurações */}
            <MentorCalendarSettings 
              onSettingsChange={handleSettingsChange}
            />
            
            {/* Lado direito - Calendário */}
            <MentorCalendarComponent 
              settings={calendarSettings}
              mentorId={user?.id}
              mentorName={mentorName}
              isClickable={true}
              onAppointmentChange={handleAppointmentChange}
            />
          </div>

          {/* Lista de agendamentos */}
          {user?.id && (
            <AppointmentsList 
              mentorId={user.id} 
              refreshTrigger={refreshAppointments}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorCalendarioPage; 