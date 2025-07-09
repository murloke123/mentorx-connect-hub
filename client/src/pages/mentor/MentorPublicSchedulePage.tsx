import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import MentorCalendarComponent from '@/components/MentorCalendarComponent';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MentorData {
  id: string;
  full_name: string;  
  avatar_url?: string;
}

interface CalendarSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  timezone: string;
}

const MentorPublicSchedulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState<MentorData | null>(null);
  const [mentorSettings, setMentorSettings] = useState<CalendarSettings>({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00', 
    sessionDuration: 60,
    timezone: 'America/Sao_Paulo'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do mentor
  useEffect(() => {
    const fetchMentorData = async () => {
      if (!id) {
        setError('ID do mentor não fornecido');
        setLoading(false);
        return;
      }

      try {
        // Buscar dados do mentor
        const { data: mentor, error: mentorError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', id)
          .eq('role', 'mentor')
          .single();

        if (mentorError) {
          console.error('Erro ao buscar mentor:', mentorError);
          setError('Mentor não encontrado');
          return;
        }

        if (!mentor) {
          setError('Mentor não encontrado');
          return;
        }

        setMentorData(mentor);

        // Buscar configurações do calendário
        const { data: settings, error: settingsError } = await supabase
          .from('calendarsettings')
          .select('*')
          .eq('mentor_id', id)
          .single();

        if (settingsError) {
          console.warn('Configurações não encontradas, usando padrões:', settingsError);
        } else if (settings) {
          // Tratar horários no formato HH:MM:SS para HH:MM
          const formatTime = (time: string) => {
            if (time && time.includes(':')) {
              return time.substring(0, 5); // Pega apenas HH:MM
            }
            return time;
          };

          setMentorSettings({
            workingDays: settings.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            startTime: formatTime(settings.start_time) || '09:00',
            endTime: formatTime(settings.end_time) || '18:00',
            sessionDuration: settings.session_duration || 60,
            timezone: settings.timezone || 'America/Sao_Paulo'
          });
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro ao carregar dados do mentor');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  if (error || !mentorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            <p className="font-semibold">Erro</p>
            <p>{error || 'Mentor não encontrado'}</p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à Home
          </Button>
        </div>
      </div>
    );
  }

  // Transformar dias da semana para português
  const translateWorkingDays = (days: string[]) => {
    const dayTranslation: Record<string, string> = {
      'monday': 'Seg',
      'tuesday': 'Ter', 
      'wednesday': 'Qua',
      'thursday': 'Qui',
      'friday': 'Sex',
      'saturday': 'Sáb',
      'sunday': 'Dom'
    };
    
    return days.map(day => dayTranslation[day] || day);
  };

  const workingDaysPortuguese = translateWorkingDays(mentorSettings.workingDays);
  const allDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-800">
                  Agendar com {mentorData.full_name}
                </h1>
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/mentor/publicview/${id}`)}
              variant="outline"
              size="sm"
            >
              <User className="w-4 h-4 mr-2" />
              Ver Perfil Completo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-10 border">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
            Agende uma Conversa
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Painel de Disponibilidade */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100 h-full">
                <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Disponibilidade
                </h3>
                
                <div className="space-y-6">
                  {/* Dias Disponíveis */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Dias Disponíveis</h4>
                    <div className="flex flex-wrap gap-2">
                      {allDays.map((day) => (
                        <span
                          key={day}
                          className={`px-3 py-2 rounded-md text-sm font-medium border ${
                            workingDaysPortuguese.includes(day)
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Horário de Atendimento */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Horário de Atendimento</h4>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>{mentorSettings.startTime} às {mentorSettings.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Duração das Sessões */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Duração das Sessões</h4>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>{mentorSettings.sessionDuration} minutos</span>
                      </div>
                    </div>
                  </div>

                  {/* Fuso Horário */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Fuso Horário</h4>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>{mentorSettings.timezone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendário */}
            <div className="md:col-span-1">
              <MentorCalendarComponent
                mentorId={id || ''}
                mentorName={mentorData.full_name || 'Mentor'}
                isClickable={true}
                settings={mentorSettings}
                onAppointmentChange={() => {
                  // Callback para quando um agendamento é alterado
                  console.log('Agendamento alterado');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorPublicSchedulePage;
