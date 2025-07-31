import MentorCalendarComponent from '@/components/MentorCalendarComponent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase';
import { Calendar, Clock, DollarSign, Globe, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  price?: number;
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
    timezone: 'America/Sao_Paulo',
    price: 0
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
            timezone: settings.timezone || 'America/Sao_Paulo',
            price: settings.price || 0
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  if (error || !mentorData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/50 text-red-300 p-4 rounded-lg mb-4 border border-red-500/30">
            <p className="font-semibold">Erro</p>
            <p>{error || 'Mentor não encontrado'}</p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            className="mt-4 bg-gold text-black hover:bg-gold/90"
          >
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

  // Função para gerar iniciais do nome (igual ao MentorCard2)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar do Mentor - mesmo design do MentorCard2 */}
              <div className="w-16 h-16 relative group">
                <Avatar className="w-full h-full border-4 border-gold/30 group-hover:border-gold transition-all duration-300">
                  <AvatarImage 
                    src={mentorData.avatar_url || ''} 
                    alt={mentorData.full_name || 'Mentor'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-gold/20 to-gold-light/20 text-gold font-bold text-lg">
                    {getInitials(mentorData.full_name || 'Mentor')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full border-4 border-gold/50 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDuration: '3s' }}></div>
              </div>
              
              {/* Título e Subtítulo */}
              <div>
                <h1 className="text-3xl font-bold text-gold">Agendar com {mentorData.full_name}</h1>
                <p className="text-gray-400">Escolha o melhor horário para sua mentoria</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/mentor/publicview/${id}`)}
              className="flex items-center gap-2 bg-gold text-black hover:bg-gold/90 transition-all duration-300"
            >
              <User className="h-4 w-4" />
              Ver Perfil Completo
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Painel de Disponibilidade */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-2xl border border-gold/20 shadow-lg hover:shadow-gold/20 transition-all duration-300 h-full">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gold gradient-text flex items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    Disponibilidade
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {/* Dias Disponíveis */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2 text-gold">
                      <Calendar className="h-4 w-4" />
                      Dias Disponíveis
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allDays.map((day) => (
                        <span
                          key={day}
                          className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                            workingDaysPortuguese.includes(day)
                              ? 'bg-slate-800/50 text-gold border-gold/50 shadow-md'
                              : 'bg-slate-800/30 text-gray-400 border-gold/20'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Horário de Atendimento */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2 text-gold">
                      <Clock className="h-4 w-4" />
                      Horário de Atendimento
                    </label>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-gold/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gold" />
                        <span className="text-white">{mentorSettings.startTime} às {mentorSettings.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Duração das Sessões */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gold">Duração das Sessões</label>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-gold/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gold" />
                        <span className="text-white">{mentorSettings.sessionDuration} minutos</span>
                      </div>
                    </div>
                  </div>

                  {/* Fuso Horário */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2 text-gold">
                      <Globe className="h-4 w-4" />
                      Fuso Horário
                    </label>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-gold/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gold" />
                        <span className="text-white">{mentorSettings.timezone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Valor do Agendamento */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2 text-gold">
                      <DollarSign className="h-4 w-4" />
                      Valor do Agendamento
                    </label>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-gold/20">
                      {mentorSettings.price && mentorSettings.price > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gold">
                            R$ {mentorSettings.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="font-medium text-gold">
                            🎉 Essa mentoria está gratuita no momento, aproveite!
                          </span>
                        </div>
                      )}
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
