import React, { useEffect, useState } from 'react';
import AppointmentsList from '@/components/AppointmentsList';
import MentorSidebar from '@/components/mentor/MentorSidebar';
import { supabase } from '@/utils/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';

const MentorAgendamentosAdquiridosPage: React.FC = () => {
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
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 md:ml-[280px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 md:ml-[280px] overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <CalendarCheck className="h-6 w-6 text-blue-600" />
                Agendamentos Adquiridos
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize todos os agendamentos que você adquiriu com outros mentores
              </p>
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
