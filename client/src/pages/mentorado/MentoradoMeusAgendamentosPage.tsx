import AppointmentsList from "@/components/AppointmentsList";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase";
import { CalendarCheck, Menu, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";

const MentoradoMeusAgendamentosPage = () => {
  const { user } = useAuth();
  const [refreshAppointments, setRefreshAppointments] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    scheduledAppointments: 0,
    completedAppointments: 0,
    totalMentors: 0
  });

  // Função para carregar estatísticas
  const loadStats = async () => {
    if (!user) return;

    try {
      // Buscar todos os agendamentos do mentorado
      const { data: appointments, error } = await supabase
        .from('calendar')
        .select('*')
        .eq('mentee_id', user.id);

      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
      }

      if (appointments) {
        // Agendamentos agendados (scheduled)
        const scheduledAppointments = appointments.filter(apt => 
          apt.status === 'scheduled'
        ).length;

        // Agendamentos concluídos
        const completedAppointments = appointments.filter(apt => 
          apt.status === 'completed'
        ).length;

        // Total de mentores únicos com quem teve agendamentos
        const uniqueMentors = new Set(appointments.map(apt => apt.mentor_id));
        const totalMentors = uniqueMentors.size;

        setStats({
          scheduledAppointments,
          completedAppointments,
          totalMentors
        });
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  // Recarregar estatísticas quando refreshAppointments mudar
  useEffect(() => {
    loadStats();
  }, [refreshAppointments]);

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
          <MentoradoSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MentoradoSidebar />
      </div>

      <div className="flex-1 transition-all duration-300 p-4 md:p-6 pt-4 md:pt-6 min-h-screen bg-black relative overflow-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gold mb-2">Meus Agendamentos</h1>
            <p className="text-gray-400">Acompanhe suas sessões de mentoria agendadas</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Agendamentos Ativos</CardTitle>
                <MessageSquare className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">{stats.scheduledAppointments}</div>
                <p className="text-xs text-gray-400">Agendados</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Mentorias Concluídas</CardTitle>
                <CalendarCheck className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">{stats.completedAppointments}</div>
                <p className="text-xs text-gray-400">Finalizadas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Total de Mentores</CardTitle>
                <Users className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalMentors}</div>
                <p className="text-xs text-gray-400">Com quem agendei</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Lista de Agendamentos */}
          <AppointmentsList 
            showAcquiredOnly={true} 
            refreshTrigger={refreshAppointments}
          />
        </div>
      </div>
    </div>
  );
};

export default MentoradoMeusAgendamentosPage;