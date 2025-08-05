import AppointmentsList from '@/components/AppointmentsList';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/utils/supabase';
import { CalendarCheck, MessageSquare, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorAgendamentosAdquiridosPage: React.FC = () => {
  const navigate = useNavigate();
  const [mentorId, setMentorId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshAppointments, setRefreshAppointments] = useState<number>(0);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedAppointments: 0,
    totalMentors: 0
  });

  // Função para carregar estatísticas dos agendamentos adquiridos
  const loadStats = async () => {
    if (!mentorId) return;

    try {
      // Buscar todos os agendamentos onde o usuário atual é o mentee (agendamentos adquiridos)
      const { data: appointments, error } = await supabase
        .from('calendar')
        .select('*')
        .eq('mentee_id', mentorId);

      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
      }

      if (appointments) {
        // Solicitações pendentes (não concluídas = scheduled + cancelled)
        const pendingRequests = appointments.filter(apt => 
          apt.status === 'scheduled' || apt.status === 'cancelled'
        ).length;

        // Agendamentos concluídos
        const completedAppointments = appointments.filter(apt => 
          apt.status === 'completed'
        ).length;

        // Total de mentores únicos dos quais adquiriu agendamentos
        const uniqueMentors = new Set(appointments.map(apt => apt.mentor_id));
        const totalMentors = uniqueMentors.size;

        setStats({
          pendingRequests,
          completedAppointments,
          totalMentors
        });
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setMentorId(user.id);
        }
      } catch (error) {
        console.error('Erro ao obter usuário atual:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // Carregar estatísticas quando mentorId estiver disponível
  useEffect(() => {
    if (mentorId) {
      loadStats();
    }
  }, [mentorId]);

  // Recarregar estatísticas quando refreshAppointments mudar
  useEffect(() => {
    loadStats();
  }, [refreshAppointments]);

  // Função para forçar atualização da lista de agendamentos
  const handleAppointmentChange = () => {
    console.log('🔄 [MentorAgendamentosAdquiridosPage] Forçando atualização da lista de agendamentos');
    setRefreshAppointments(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 p-6 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gold">Agendamentos Adquiridos</h1>
              <p className="text-gray-400">Visualize todos os agendamentos que você adquiriu com outros mentores</p>
            </div>
            <Button 
              onClick={() => navigate('/mentor/agendamentos')}
              className="flex items-center gap-2 bg-gold text-black hover:bg-gold/90 transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4" />
              Ver Solicitações de Agendamento
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Solicitações Pendentes</CardTitle>
                <MessageSquare className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">{stats.pendingRequests}</div>
                <p className="text-xs text-gray-400">Não concluídas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Agendamentos Concluídos</CardTitle>
                <CalendarCheck className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">{stats.completedAppointments}</div>
                <p className="text-xs text-gray-400">Finalizados</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Total de Mentores</CardTitle>
                <Users className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalMentors}</div>
                <p className="text-xs text-gray-400">Que você adquiriu agendamentos</p>
              </CardContent>
            </Card>
          </div>

          {/* Seus Agendamentos */}
          {mentorId ? (
            <AppointmentsList 
              mentorId={mentorId} 
              showAcquiredOnly={true}
              refreshTrigger={refreshAppointments}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">
                Não foi possível carregar os agendamentos. Tente novamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorAgendamentosAdquiridosPage;
