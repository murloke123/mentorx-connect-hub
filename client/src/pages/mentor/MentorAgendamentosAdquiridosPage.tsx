import AppointmentsList from '@/components/AppointmentsList';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/utils/supabase';
import { CalendarCheck, MessageSquare, Clock, DollarSign, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MentorAgendamentosAdquiridosPage: React.FC = () => {
  const navigate = useNavigate();
  const [mentorId, setMentorId] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
          <div>
            <h1 className="text-3xl font-bold text-gold">Agendamentos Adquiridos</h1>
            <p className="text-gray-400">Visualize todos os agendamentos que você adquiriu com outros mentores</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Total de Agendamentos</CardTitle>
                <CalendarCheck className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">-</div>
                <p className="text-xs text-gray-400">Adquiridos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Próximas Sessões</CardTitle>
                <Clock className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">-</div>
                <p className="text-xs text-gray-400">Este mês</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Total Investido</CardTitle>
                <DollarSign className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">R$ -</div>
                <p className="text-xs text-gray-400">Em mentorias</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-2xl backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all duration-300 hover:shadow-gold/30">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gold text-center">Mentores Únicos</CardTitle>
                <Users className="h-4 w-4 text-gold ml-2" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">-</div>
                <p className="text-xs text-gray-400">Diferentes</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/mentor/agendamentos')}
                  className="flex items-center gap-2 bg-gold text-black hover:bg-gold/90"
                >
                  <MessageSquare className="h-4 w-4" />
                  Ver Solicitações de Agendamento
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de agendamentos */}
          <Card className="premium-card bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-gold/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">Seus Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {mentorId ? (
                <AppointmentsList 
                  mentorId={mentorId} 
                  showAcquiredOnly={true}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    Não foi possível carregar os agendamentos. Tente novamente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorAgendamentosAdquiridosPage;
