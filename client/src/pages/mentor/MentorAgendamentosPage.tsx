import AppointmentsList from "@/components/AppointmentsList";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase";
import { Calendar, CalendarCheck, Menu, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MentorAgendamentosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentorName, setMentorName] = useState<string>('');
  const [refreshAppointments, setRefreshAppointments] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedAppointments: 0,
    totalMentees: 0
  });

  // Função para carregar estatísticas
  const loadStats = async () => {
    if (!user) return;

    try {
      // Buscar todos os agendamentos do mentor
      const { data: appointments, error } = await supabase
        .from('calendar')
        .select('*')
        .eq('mentor_id', user.id);

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

        // Total de mentorados únicos que solicitaram agendamentos
        const uniqueMentees = new Set(appointments.map(apt => apt.mentee_id));
        const totalMentees = uniqueMentees.size;

        setStats({
          pendingRequests,
          completedAppointments,
          totalMentees
        });
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar estatísticas:', err);
    }
  };

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
    loadStats();
  }, [user]);

  // Recarregar estatísticas quando refreshAppointments mudar
  useEffect(() => {
    loadStats();
  }, [refreshAppointments]);

  // Função para forçar atualização da lista de agendamentos
  const handleAppointmentChange = () => {
    console.log('🔄 [MentorAgendamentosPage] Forçando atualização da lista de agendamentos');
    setRefreshAppointments(prev => prev + 1);
  };

  return (
    <div className="flex-col md:flex-row flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-sm border border-gold/20 hover:bg-slate-800/80 hover:border-gold/40"
          >
            <Menu className="h-6 w-6 text-gold" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <MentorSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MentorSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 pt-8 md:pt-6 min-h-screen bg-black relative overflow-auto">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gold">Agendamentos</h1>
              <p className="text-gray-400">Gerencie todas as suas mentorias agendadas e solicitações recebidas</p>
            </div>
            <Button 
              onClick={() => navigate('/mentor/agendamentos-adquiridos')}
              className="flex items-center gap-2 bg-gold text-black hover:bg-gold/90 transition-all duration-300"
            >
              <Calendar className="h-4 w-4" />
              Ver Agendamentos Adquiridos
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
                <CardTitle className="text-sm font-medium text-gold text-center">Total de Mentorados</CardTitle>
                <Users className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalMentees}</div>
                <p className="text-xs text-gray-400">Que solicitaram agendamentos</p>
              </CardContent>
            </Card>
          </div>

          {/* Minhas Mentorias Agendadas */}
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

export default MentorAgendamentosPage;