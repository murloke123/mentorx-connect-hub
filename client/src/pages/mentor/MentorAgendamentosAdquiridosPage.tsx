import AppointmentsList from '@/components/AppointmentsList';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/utils/supabase';
import { CalendarCheck, MessageSquare } from 'lucide-react';
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
      <div className="flex min-h-screen bg-gray-50">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 p-6 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <CalendarCheck className="h-6 w-6 text-blue-600" />
                    Agendamentos Adquiridos
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Visualize todos os agendamentos que você adquiriu com outros mentores
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/mentor/agendamentos')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Solicitações de Agendamento
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="p-6">
              {mentorId ? (
                <AppointmentsList 
                  mentorId={mentorId} 
                  showAcquiredOnly={true}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
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
