import AppointmentsList from "@/components/AppointmentsList";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase";
import { Calendar, CalendarCheck, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MentorAgendamentosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Função para forçar atualização da lista de agendamentos
  const handleAppointmentChange = () => {
    console.log('🔄 [MentorAgendamentosPage] Forçando atualização da lista de agendamentos');
    setRefreshAppointments(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-black">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gold">Solicitações de Mentoria</h1>
            <p className="text-gray-400">Gerencie todas as solicitações de agendamento que você recebeu</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Solicitações Pendentes</CardTitle>
                <MessageSquare className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">-</div>
                <p className="text-xs text-gray-400">Aguardando resposta</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Agendamentos Confirmados</CardTitle>
                <CalendarCheck className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">-</div>
                <p className="text-xs text-gray-400">Este mês</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Total de Mentorados</CardTitle>
                <Users className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">-</div>
                <p className="text-xs text-gray-400">Únicos</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/mentor/agendamentos-adquiridos')}
                  className="flex items-center gap-2 bg-gold text-black hover:bg-gold/90"
                >
                  <Calendar className="h-4 w-4" />
                  Ver Agendamentos Adquiridos
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de agendamentos */}
          <Card className="premium-card bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-gold/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">Solicitações Recebidas</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.id && (
                <AppointmentsList 
                  mentorId={user.id} 
                  refreshTrigger={refreshAppointments}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorAgendamentosPage;